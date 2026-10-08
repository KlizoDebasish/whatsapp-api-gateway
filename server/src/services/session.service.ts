import EventEmitter from 'events';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import pino from 'pino';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  ConnectionState,
  WASocket
} from '@whiskeysockets/baileys';
import { prisma } from '../config/database';
import { ENV } from '../config/env';
import { SessionStatus } from '@prisma/client';

export class SessionService extends EventEmitter {
  private static instance: SessionService;
  private activeSockets: Map<string, WASocket> = new Map();
  private qrCache: Map<string, string> = new Map();
  private sentMessageIds: Set<string> = new Set();
  private logger = pino({ level: 'silent' });

  private constructor() {
    super();
    // Ensure auth sessions directory exists
    if (!fs.existsSync(ENV.SESSION_AUTH_DIR)) {
      fs.mkdirSync(ENV.SESSION_AUTH_DIR, { recursive: true });
    }
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public getSocket(sessionId: string): WASocket | undefined {
    return this.activeSockets.get(sessionId);
  }

  public getCachedQr(sessionId: string): string | undefined {
    return this.qrCache.get(sessionId);
  }

  public markMessageAsSent(messageId: string): void {
    if (!messageId) return;
    this.sentMessageIds.add(messageId);
    setTimeout(() => {
      this.sentMessageIds.delete(messageId);
    }, 60000);
  }

  public isMessageSentByMe(messageId: string): boolean {
    if (!messageId) return false;
    return this.sentMessageIds.has(messageId);
  }

  public async listSessions(businessId?: string) {
    return prisma.whatsAppSession.findMany({
      where: businessId ? { businessId } : undefined,
      orderBy: { createdAt: 'desc' }
    });
  }

  public async getSessionById(sessionId: string) {
    return prisma.whatsAppSession.findUnique({
      where: { id: sessionId }
    });
  }

  public async initSession(params: {
    sessionId: string;
    sessionName: string;
    businessId: string;
    isPrimary?: boolean;
  }): Promise<{ sessionId: string; status: SessionStatus }> {
    const { sessionId, sessionName, businessId, isPrimary } = params;

    // Check or upsert session in database
    await prisma.whatsAppSession.upsert({
      where: { id: sessionId },
      update: {
        name: sessionName,
        status: SessionStatus.CONNECTING,
        isPrimary: isPrimary ?? false
      },
      create: {
        id: sessionId,
        businessId,
        name: sessionName,
        status: SessionStatus.CONNECTING,
        isPrimary: isPrimary ?? false
      }
    });

    const sessionPath = path.join(ENV.SESSION_AUTH_DIR, sessionId);
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    // Close any previous socket for this session before creating a fresh one
    const existingSocket = this.activeSockets.get(sessionId);
    if (existingSocket) {
      this.activeSockets.delete(sessionId);
      try {
        existingSocket.end(undefined);
      } catch (e) {}
    }
    this.qrCache.delete(sessionId);

    try {
      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const { version } = await fetchLatestBaileysVersion().catch(() => ({
        version: [2, 3000, 1015901307] as [number, number, number],
        isLatest: false
      }));

      console.log(`Connecting WhatsApp session "${sessionId}" via Baileys v${version.join('.')}...`);

      const socket = makeWASocket({
        version,
        logger: this.logger,
        auth: state,
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
        syncFullHistory: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 30000
      });

      this.activeSockets.set(sessionId, socket);

      socket.ev.on('creds.update', saveCreds);

      socket.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
        // Prevent race condition from superseded sockets
        if (this.activeSockets.get(sessionId) !== socket) {
          return;
        }

        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            console.log(`\n==========================================================`);
            console.log(`📱 LIVE WHATSAPP QR CODE GENERATED FOR SESSION: ${sessionId}`);
            console.log(`👉 Scan with WhatsApp on your phone: Linked Devices > Link a Device`);
            console.log(`==========================================================\n`);

            // Also render visual QR directly in terminal
            QRCode.toString(qr, { type: 'terminal', small: true }, (err, terminalStr) => {
              if (!err && terminalStr) {
                console.log(terminalStr);
              }
            });

            const qrDataUrl = await QRCode.toDataURL(qr, {
              margin: 2,
              width: 360,
              color: { dark: '#000000', light: '#ffffff' }
            });
            this.qrCache.set(sessionId, qrDataUrl);
            this.emit(`qr:${sessionId}`, { qr: qrDataUrl, rawQr: qr, expireInSeconds: 30 });
            await prisma.whatsAppSession.update({
              where: { id: sessionId },
              data: { qrCode: qrDataUrl, status: SessionStatus.CONNECTING }
            }).catch(() => null);
          } catch (err) {
            console.error('Failed to generate QR Data URL:', err);
          }
        }

        if (connection === 'close') {
          // If this socket was superseded, ignore
          if (this.activeSockets.get(sessionId) !== socket) {
            return;
          }

          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const isLoggedOut = statusCode === DisconnectReason.loggedOut;

          console.log(`📡 [Baileys] Socket closed for session "${sessionId}" (status code: ${statusCode || 'unknown'}).`);

          if (isLoggedOut) {
            console.log(`🚪 [Baileys] Session "${sessionId}" was logged out from WhatsApp.`);
            this.qrCache.delete(sessionId);
            this.activeSockets.delete(sessionId);
            const sessionPath = path.join(ENV.SESSION_AUTH_DIR, sessionId);
            if (fs.existsSync(sessionPath)) {
              fs.rmSync(sessionPath, { recursive: true, force: true });
            }
            await prisma.whatsAppSession.update({
              where: { id: sessionId },
              data: { status: SessionStatus.DISCONNECTED, qrCode: null }
            }).catch(() => null);

            this.emit(`status:${sessionId}`, {
              status: SessionStatus.DISCONNECTED,
              reason: 'LOGGED_OUT'
            });
            return;
          }

          // In all other cases (restartRequired code 515 after scan, 428 refresh, 408 timeout, network reconnect):
          // Maintain the pairing window / active session!
          const isRestart = statusCode === DisconnectReason.restartRequired;
          const delay = isRestart ? 500 : 2500;

          if (isRestart) {
            console.log(`🔄 [Baileys] Restart required for session "${sessionId}" (phone scanned / handshake accepted). Finalizing link in ${delay}ms...`);
          } else {
            console.log(`🔄 [Baileys] Maintaining session "${sessionId}" connection. Auto-reconnecting in ${delay}ms...`);
          }

          setTimeout(() => {
            if (this.activeSockets.get(sessionId) === socket || !this.activeSockets.has(sessionId)) {
              this.initSession(params).catch((err) => {
                console.error(`Error auto-reconnecting session ${sessionId}:`, err);
              });
            }
          }, delay);
        } else if (connection === 'open') {
          this.qrCache.delete(sessionId);
          const phoneNumber = socket.user?.id?.split(':')[0] || '';

          await prisma.whatsAppSession.update({
            where: { id: sessionId },
            data: {
              status: SessionStatus.CONNECTED,
              phoneNumber: phoneNumber ? `+${phoneNumber}` : null,
              lastConnectedAt: new Date(),
              qrCode: null
            }
          });

          this.emit(`status:${sessionId}`, {
            status: SessionStatus.CONNECTED,
            phoneNumber: `+${phoneNumber}`,
            deviceModel: 'WhatsApp Web Multi-Device'
          });

          console.log(`\n==========================================================`);
          console.log(`🎉 SUCCESS! WhatsApp session "${sessionId}" is CONNECTED!`);
          console.log(`📱 Linked Phone Number: +${phoneNumber}`);
          console.log(`==========================================================\n`);
        }
      });

      // Handle Inbound and Outbound Messages from Real WhatsApp Device
      socket.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;

        for (const msg of m.messages) {
          const rawJid = msg.key.remoteJid || '';
          if (!rawJid || rawJid === 'status@broadcast' || rawJid.endsWith('@g.us')) continue;

          // Ignore echo of messages dispatched by this gateway socket
          if (msg.key?.id && this.isMessageSentByMe(msg.key.id)) {
            this.sentMessageIds.delete(msg.key.id);
            continue;
          }

          const isFromMe = !!msg.key.fromMe;
          const normalizedJid = rawJid.replace(/:.*@/, '@');
          const cleanDigits = normalizedJid.split('@')[0].replace(/[^0-9]/g, '');
          const senderPhone = cleanDigits ? `+${cleanDigits}` : `+${rawJid.split('@')[0]}`;
          const senderName = isFromMe ? 'You (Store)' : (msg.pushName || senderPhone);

          const rawMsg = msg.message;
          const messageText =
            rawMsg?.conversation ||
            rawMsg?.extendedTextMessage?.text ||
            rawMsg?.imageMessage?.caption ||
            rawMsg?.videoMessage?.caption ||
            rawMsg?.documentMessage?.caption ||
            rawMsg?.buttonsResponseMessage?.selectedButtonId ||
            rawMsg?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            rawMsg?.templateButtonReplyMessage?.selectedId ||
            (rawMsg as any)?.ephemeralMessage?.message?.conversation ||
            (rawMsg as any)?.ephemeralMessage?.message?.extendedTextMessage?.text ||
            (rawMsg as any)?.ephemeralMessage?.message?.imageMessage?.caption ||
            (rawMsg as any)?.viewOnceMessage?.message?.conversation ||
            (rawMsg as any)?.viewOnceMessage?.message?.extendedTextMessage?.text ||
            (rawMsg as any)?.viewOnceMessageV2?.message?.conversation ||
            (rawMsg as any)?.viewOnceMessageV2?.message?.extendedTextMessage?.text ||
            '';

          if (!messageText) continue;

          console.log(`📩 [WhatsApp ${sessionId}] ${isFromMe ? 'Outbound (from linked device)' : 'Inbound from ' + senderName} (${senderPhone}): "${messageText}"`);

          try {
            // Upsert contact in DB
            const contact = await prisma.contact.upsert({
              where: {
                businessId_phone: {
                  businessId,
                  phone: senderPhone
                }
              },
              update: {
                ...(!isFromMe && msg.pushName ? { name: msg.pushName } : {}),
                lastSeenAt: new Date(),
                tag: sessionId
              },
              create: {
                businessId,
                name: isFromMe ? `Customer ${senderPhone.slice(-4)}` : senderName,
                phone: senderPhone,
                tag: sessionId
              }
            });

            // Save message in DB
            const savedMsg = await prisma.chatMessage.create({
              data: {
                contactId: contact.id,
                sender: isFromMe ? 'business' : 'customer',
                text: messageText,
                status: 'DELIVERED'
              }
            });

            const contactPayload = {
              id: contact.id,
              name: contact.name,
              phone: contact.phone,
              avatarBg: 'bg-emerald-600',
              initials: (contact.name || 'WA').slice(0, 2).toUpperCase(),
              lastMessage: messageText,
              lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unreadCount: isFromMe ? 0 : 1,
              isOnline: true,
              statusText: 'online'
            };

            const msgPayload = {
              id: savedMsg.id,
              sender: isFromMe ? 'business' : 'customer',
              text: messageText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read'
            };

            // Broadcast message to frontend live chat
            const { EventsService } = await import('./events.service');
            EventsService.getInstance().broadcast('message:new', {
              sessionId,
              contactId: contact.id,
              contact: contactPayload,
              message: msgPayload
            }, { businessId, sessionId });

            // If message was sent by the linked device itself, don't trigger AI auto-response
            if (isFromMe) continue;

            // AI Auto-Responder via RAG Engine
            const business = await prisma.businessAccount.findUnique({ where: { id: businessId } }) ||
                             await prisma.businessAccount.findFirst();

            if (business && business.enableAi !== false) {
              const { ErpService } = await import('./erp.service');

              if (business.typingSimulation) {
                await socket.sendPresenceUpdate('composing', normalizedJid).catch(() => null);
              }

              // Query RAG Knowledge Base and ERP catalog
              console.log(`🤖 [RAG Engine] Generating AI response with pgvector retrieval for: "${messageText}"...`);
              const erpReply = await ErpService.queryErp({
                businessId: business.id,
                query: messageText
              });
              console.log(`🤖 [RAG Engine] AI Response synthesized:\n${erpReply.aiGeneratedReply}`);

              await new Promise((r) => setTimeout(r, 1200));

              // Send reply on WhatsApp using normalized JID
              const sentReply = await socket.sendMessage(normalizedJid, { text: erpReply.aiGeneratedReply });
              if (sentReply?.key?.id) {
                this.markMessageAsSent(sentReply.key.id);
              }
              await socket.sendPresenceUpdate('paused', normalizedJid).catch(() => null);

              // Save outgoing reply to DB
              const botMsg = await prisma.chatMessage.create({
                data: {
                  contactId: contact.id,
                  sender: 'business',
                  text: erpReply.aiGeneratedReply,
                  isAiGenerated: true,
                  status: 'SENT'
                }
              });

              const botMsgPayload = {
                id: botMsg.id,
                sender: 'business',
                text: erpReply.aiGeneratedReply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isAiGenerated: true,
                status: 'read'
              };

              // Broadcast outgoing reply to frontend live chat
              EventsService.getInstance().broadcast('message:new', {
                sessionId,
                contactId: contact.id,
                contact: {
                  ...contactPayload,
                  lastMessage: erpReply.aiGeneratedReply,
                  unreadCount: 0
                },
                message: botMsgPayload
              }, { businessId, sessionId });
            }
          } catch (err: any) {
            console.error('Error handling inbound WhatsApp message:', err);
          }
        }
      });

      return { sessionId, status: SessionStatus.CONNECTING };
    } catch (err: any) {
      console.error(`Error initializing Baileys for session ${sessionId}:`, err);
      this.qrCache.delete(sessionId);
      this.emit(`status:${sessionId}`, { status: SessionStatus.DISCONNECTED, error: err.message });
      return { sessionId, status: SessionStatus.DISCONNECTED };
    }
  }

  public async refreshSessionQr(sessionId: string): Promise<void> {
    const session = await prisma.whatsAppSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Terminate existing socket
    const existingSocket = this.activeSockets.get(sessionId);
    if (existingSocket) {
      this.activeSockets.delete(sessionId);
      try {
        existingSocket.end(undefined);
      } catch (e) {}
    }
    this.qrCache.delete(sessionId);

    // Initialize fresh session socket
    await this.initSession({
      sessionId: session.id,
      sessionName: session.name,
      businessId: session.businessId,
      isPrimary: session.isPrimary
    });
  }

  public async deleteSession(sessionId: string, deleteMessages = true): Promise<void> {
    const socket = this.activeSockets.get(sessionId);
    if (socket) {
      this.activeSockets.delete(sessionId);
      try {
        await socket.logout();
      } catch (e) {}
      try {
        socket.end(undefined);
      } catch (e) {}
    }

    this.qrCache.delete(sessionId);

    // Remove credentials directory
    const sessionPath = path.join(ENV.SESSION_AUTH_DIR, sessionId);
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }

    const sessionObj = await prisma.whatsAppSession.findUnique({
      where: { id: sessionId }
    });
    const businessId = sessionObj?.businessId || (await prisma.businessAccount.findFirst())?.id;

    await prisma.whatsAppSession.delete({
      where: { id: sessionId }
    }).catch(() => null);

    if (deleteMessages && businessId) {
      const otherSessionsCount = await prisma.whatsAppSession.count({
        where: { businessId }
      });

      let contactsToDelete: { id: string }[] = [];
      if (otherSessionsCount === 0) {
        // If all sessions are deleted, wipe all remaining contacts & chats for this business
        contactsToDelete = await prisma.contact.findMany({
          where: { businessId },
          select: { id: true }
        });
      } else {
        // Delete contacts associated with this specific session
        contactsToDelete = await prisma.contact.findMany({
          where: {
            businessId,
            OR: [
              { tag: sessionId },
              { tag: { contains: sessionId } }
            ]
          },
          select: { id: true }
        });
      }

      const cIds = contactsToDelete.map((c) => c.id);
      if (cIds.length > 0) {
        await prisma.chatMessage.deleteMany({
          where: { contactId: { in: cIds } }
        }).catch(() => null);

        await prisma.contact.deleteMany({
          where: { id: { in: cIds } }
        }).catch(() => null);
        console.log(`🗑️ Deleted ${cIds.length} contacts and their message history for session "${sessionId}"`);
      }
    }

    this.emit(`status:${sessionId}`, { status: SessionStatus.DISCONNECTED, reason: 'DELETED' });
  }

  public async disconnectSession(sessionId: string): Promise<void> {
    return this.deleteSession(sessionId, true);
  }

  public async disconnectOnlySession(sessionId: string): Promise<void> {
    const socket = this.activeSockets.get(sessionId);
    if (socket) {
      this.activeSockets.delete(sessionId);
      try {
        socket.end(undefined);
      } catch (e) {}
    }

    this.qrCache.delete(sessionId);

    await prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.DISCONNECTED,
        qrCode: null
      }
    }).catch(() => null);

    this.emit(`status:${sessionId}`, { status: SessionStatus.DISCONNECTED, reason: 'DISCONNECTED' });
  }

  public async requestPairingCode(sessionId: string, phoneNumber: string): Promise<string> {
    let socket = this.activeSockets.get(sessionId);
    if (!socket) {
      const session = await prisma.whatsAppSession.findUnique({ where: { id: sessionId } });
      const business = await prisma.businessAccount.findFirst();
      await this.initSession({
        sessionId,
        sessionName: session?.name || 'WhatsApp Device',
        businessId: session?.businessId || business?.id || 'demo_biz',
        isPrimary: true
      });
      // Wait for socket to initialize
      for (let i = 0; i < 15; i++) {
        socket = this.activeSockets.get(sessionId);
        if (socket) break;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    if (!socket) {
      throw new Error(`Session ${sessionId} is not active. Connect session first.`);
    }
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      throw new Error('Valid phone number with country code is required.');
    }
    console.log(`Requesting WhatsApp pairing code for phone: +${cleanPhone} on session: ${sessionId}...`);
    const code = await socket.requestPairingCode(cleanPhone);
    console.log(`✅ WhatsApp Pairing Code generated: ${code}`);
    return code;
  }
}

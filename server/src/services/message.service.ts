import { prisma } from '../config/database';
import { SessionService } from './session.service';
import { EventsService } from './events.service';
import { sleep, calculateRandomDelay } from '../utils/delay';
import { MessageSender, MessageType, MessageStatus } from '@prisma/client';

export class MessageService {
  private static formatJid(phone: string): string {
    const clean = phone.replace(/[^0-9]/g, '');
    return `${clean}@s.whatsapp.net`;
  }

  public static async sendMessage(params: {
    businessId: string;
    sessionId: string;
    to: string;
    content: string;
    messageType?: 'text' | 'image' | 'audio' | 'document' | 'catalog';
    mediaUrl?: string;
    antiBanPacing?: boolean;
    simulateTyping?: boolean;
  }) {
    const {
      businessId,
      sessionId,
      to,
      content,
      messageType = 'text',
      mediaUrl,
      antiBanPacing = true,
      simulateTyping = true
    } = params;

    const jid = MessageService.formatJid(to);
    const sessionManager = SessionService.getInstance();
    const sock = sessionManager.getSocket(sessionId);

    // 1. Upsert or find Contact in database
    const contact = await prisma.contact.upsert({
      where: {
        businessId_phone: {
          businessId,
          phone: to
        }
      },
      update: {
        lastSeenAt: new Date()
      },
      create: {
        businessId,
        phone: to,
        name: `Contact ${to.slice(-4)}`,
        tag: 'Active Inquiry'
      }
    });

    // 2. Anti-Ban Simulation (Typing indicators & human presence)
    if (sock && simulateTyping) {
      try {
        await sock.sendPresenceUpdate('composing', jid);
        const typingDelay = Math.min(Math.max(1000, content.length * 40), 3000);
        await sleep(typingDelay);
        await sock.sendPresenceUpdate('paused', jid);
      } catch (e) {
        // Socket presence update error ignored
      }
    }

    let whatsappMessageId = `msg_${Date.now()}`;

    // 3. Dispatch actual message through Baileys socket if live
    if (sock) {
      try {
        let sent;
        if (messageType === 'image' && mediaUrl) {
          sent = await sock.sendMessage(jid, { image: { url: mediaUrl }, caption: content });
        } else if (messageType === 'audio' && mediaUrl) {
          sent = await sock.sendMessage(jid, { audio: { url: mediaUrl }, ptt: true });
        } else if (messageType === 'document' && mediaUrl) {
          sent = await sock.sendMessage(jid, { document: { url: mediaUrl }, mimetype: 'application/pdf', fileName: 'document.pdf', caption: content });
        } else {
          sent = await sock.sendMessage(jid, { text: content });
        }
        if (sent?.key?.id) {
          whatsappMessageId = sent.key.id;
          SessionService.getInstance().markMessageAsSent(sent.key.id);
        }
      } catch (err: any) {
        console.warn(`WhatsApp dispatch via socket failed (recording to DB):`, err.message);
      }
    }

    // 4. Save to ChatMessage database
    const dbMessage = await prisma.chatMessage.create({
      data: {
        contactId: contact.id,
        sender: MessageSender.business,
        text: content,
        messageType: messageType.toUpperCase() as MessageType,
        mediaUrl: mediaUrl || null,
        status: MessageStatus.SENT
      }
    });

    // 5. Broadcast to SSE clients for live UI update
    const messagePayload = {
      id: dbMessage.id,
      sender: 'business',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    const contactPayload = {
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      avatarBg: 'bg-emerald-600',
      initials: (contact.name || 'User').slice(0, 2).toUpperCase(),
      lastMessage: content,
      lastTime: messagePayload.timestamp,
      unreadCount: 0,
      isOnline: true,
      statusText: 'online'
    };

    EventsService.getInstance().broadcast('message:new', {
      sessionId,
      contactId: contact.id,
      contact: contactPayload,
      message: messagePayload
    }, { businessId });

    return {
      success: true,
      messageId: dbMessage.id,
      whatsappMessageId,
      status: 'SENT'
    };
  }

  public static async getContacts(businessId: string, sessionId?: string) {
    const where: any = { businessId };
    if (sessionId) {
      where.OR = [
        { tag: sessionId },
        { tag: { contains: sessionId } }
      ];
    }
    return prisma.contact.findMany({
      where,
      include: {
        messages: {
          take: 1,
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  public static async getContactMessages(contactId: string) {
    return prisma.chatMessage.findMany({
      where: { contactId },
      orderBy: { timestamp: 'asc' }
    });
  }
}

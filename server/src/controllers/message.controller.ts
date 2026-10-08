import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { MessageService } from '../services/message.service';

export class MessageController {
  public static async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, to, content, messageType, mediaUrl, antiBanPacing, simulateTyping } = req.body;
      const businessId = req.business?.id;

      if (!sessionId || !to || !content) {
        res.status(400).json({ success: false, error: 'sessionId, to, and content are required' });
        return;
      }

      if (!businessId) {
        res.status(400).json({ success: false, error: 'Business account required' });
        return;
      }

      const result = await MessageService.sendMessage({
        businessId,
        sessionId,
        to,
        content,
        messageType,
        mediaUrl,
        antiBanPacing,
        simulateTyping
      });

      res.status(202).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async sendMedia(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, to, messageType, mediaUrl, caption } = req.body;
      const businessId = req.business?.id;

      if (!sessionId || !to || !mediaUrl || !messageType) {
        res.status(400).json({ success: false, error: 'sessionId, to, messageType, and mediaUrl are required' });
        return;
      }

      if (!businessId) {
        res.status(400).json({ success: false, error: 'Business account required' });
        return;
      }

      const result = await MessageService.sendMessage({
        businessId,
        sessionId,
        to,
        content: caption || '',
        messageType,
        mediaUrl
      });

      res.status(202).json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async getContacts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.business?.id;
      const sessionId = req.query.sessionId as string | undefined;
      if (!businessId) {
        res.status(400).json({ success: false, error: 'Business account required' });
        return;
      }

      const contacts = await MessageService.getContacts(businessId, sessionId);
      res.json({ success: true, contacts });
    } catch (err) {
      next(err);
    }
  }

  public static async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contactId } = req.params;
      const messages = await MessageService.getContactMessages(contactId);
      res.json({ success: true, messages });
    } catch (err) {
      next(err);
    }
  }
}

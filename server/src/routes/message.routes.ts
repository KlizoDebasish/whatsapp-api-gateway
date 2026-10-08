import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Send message & media endpoints
router.post('/send', MessageController.sendMessage);
router.post('/send-media', MessageController.sendMedia);

// Contacts and message history
router.get('/contacts', MessageController.getContacts);
router.get('/conversation/:contactId', MessageController.getMessages);
router.get('/:contactId', MessageController.getMessages);

export default router;

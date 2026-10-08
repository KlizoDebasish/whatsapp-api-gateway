import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import sessionRoutes from './session.routes';
import messageRoutes from './message.routes';
import catalogRoutes from './catalog.routes';
import ragRoutes from './rag.routes';
import erpRoutes from './erp.routes';
import eventsRoutes from './events.routes';
import { WebhookController } from '../controllers/webhook.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MessageAPI Core Gateway & RAG Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount module sub-routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/accounts', accountRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/catalog', catalogRoutes);
apiRouter.use('/rag', ragRoutes);
apiRouter.use('/erp', erpRoutes);
apiRouter.use('/events', eventsRoutes);

// Webhook simulation / testing endpoint
apiRouter.post('/webhooks/simulate', authMiddleware, WebhookController.simulateInbound);

export default apiRouter;

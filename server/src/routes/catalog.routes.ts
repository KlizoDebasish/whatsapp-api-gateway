import { Router } from 'express';
import { CatalogController } from '../controllers/catalog.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

// Get live catalog & bulk create/update
router.get('/', CatalogController.getCatalog);
router.post('/', CatalogController.createCatalog);
router.post('/upload-pdf', CatalogController.uploadCatalogPdf);

// Single item modifications
router.put('/:id', CatalogController.updateItem);
router.delete('/:id', CatalogController.deleteItem);

export default router;

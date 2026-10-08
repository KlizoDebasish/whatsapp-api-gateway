import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { CatalogService } from '../services/catalog.service';

export class CatalogController {
  public static async getCatalog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.business?.id;
      if (!businessId) {
        res.status(400).json({ success: false, error: 'Business account required' });
        return;
      }

      const category = req.query.category as string;
      const search = req.query.search as string;

      const items = await CatalogService.getCatalog(businessId, category, search);
      res.json({ success: true, items });
    } catch (err) {
      next(err);
    }
  }

  public static async createCatalog(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const businessId = req.business?.id;
      if (!businessId) {
        res.status(400).json({ success: false, error: 'Business account required' });
        return;
      }

      const { items, item } = req.body;

      if (Array.isArray(items)) {
        const saved = await CatalogService.bulkUpsert(businessId, items);
        res.status(201).json({ success: true, count: saved.length, items: saved });
        return;
      }

      const target = item || req.body;
      if (!target.sku || !target.name) {
        res.status(400).json({ success: false, error: 'sku and name are required' });
        return;
      }

      const saved = await CatalogService.upsertItem({
        businessId,
        ...target
      });

      res.status(201).json({ success: true, item: saved });
    } catch (err) {
      next(err);
    }
  }

  public static async updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await CatalogService.updateItem(id, req.body);
      res.json({ success: true, item: updated });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CatalogService.deleteItem(id);
      res.json({ success: true, message: 'Item deleted' });
    } catch (err) {
      next(err);
    }
  }
}

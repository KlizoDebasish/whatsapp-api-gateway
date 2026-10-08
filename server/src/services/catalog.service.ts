import { prisma } from '../config/database';
import { RagService } from './rag.service';

export class CatalogService {
  public static async getCatalog(businessId: string, category?: string, search?: string) {
    const where: any = { businessId };
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    return prisma.catalogItem.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  public static async upsertItem(params: {
    businessId: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit?: string;
    description?: string;
    isAvailable?: boolean;
  }) {
    const { businessId, sku, name, category, price, stock, unit = 'pcs', description, isAvailable = true } = params;

    // Check if item with same sku already exists for this business
    const existing = await prisma.catalogItem.findFirst({
      where: { businessId, sku }
    });

    let savedItem;
    if (existing) {
      savedItem = await prisma.catalogItem.update({
        where: { id: existing.id },
        data: { name, category, price, stock, unit, description, isAvailable }
      });
    } else {
      savedItem = await prisma.catalogItem.create({
        data: { businessId, sku, name, category, price, stock, unit, description, isAvailable }
      });
    }

    // Auto-index into pgvector via RagService asynchronously
    RagService.indexCatalogItem({
      id: savedItem.id,
      businessId: savedItem.businessId,
      sku: savedItem.sku,
      name: savedItem.name,
      category: savedItem.category,
      price: savedItem.price.toString(),
      stock: savedItem.stock,
      unit: savedItem.unit,
      description: savedItem.description
    }).catch((err) => console.error('Failed to auto-index item in pgvector:', err));

    return savedItem;
  }

  public static async bulkUpsert(businessId: string, items: Array<{
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit?: string;
    description?: string;
    isAvailable?: boolean;
  }>) {
    const results = [];
    for (const item of items) {
      const saved = await CatalogService.upsertItem({
        businessId,
        ...item
      });
      results.push(saved);
    }
    return results;
  }

  public static async updateItem(id: string, updates: any) {
    const item = await prisma.catalogItem.update({
      where: { id },
      data: updates
    });

    RagService.indexCatalogItem({
      id: item.id,
      businessId: item.businessId,
      sku: item.sku,
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      stock: item.stock,
      unit: item.unit,
      description: item.description
    }).catch(() => null);

    return item;
  }

  public static async deleteItem(id: string) {
    return prisma.catalogItem.delete({
      where: { id }
    });
  }
}

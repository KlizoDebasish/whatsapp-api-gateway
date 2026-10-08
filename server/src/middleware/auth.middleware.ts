import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import { ENV } from '../config/env';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKey = (req.headers['x-api-key'] || req.headers['x-domain'] || req.query.apiKey || req.query.domain) as string;

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'Missing API key or domain. Provide x-api-key or x-domain header.'
      });
      return;
    }

    // Master API Key bypass for developer testing / admin operations
    if (apiKey === ENV.API_SECRET_KEY) {
      const firstBusiness = await prisma.businessAccount.findFirst();
      if (firstBusiness) {
        req.business = firstBusiness;
      }
      next();
      return;
    }

    // Lookup business by unique apiKey or id
    let business = await prisma.businessAccount.findFirst({
      where: {
        OR: [
          { apiKey },
          { id: apiKey }
        ]
      }
    });

    if (!business) {
      // Check pgPool directly in case apiKey header contains domain name
      const clean = apiKey.toLowerCase().trim();
      try {
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT b.id FROM business_accounts b 
           LEFT JOIN users u ON u."businessId" = b.id 
           WHERE b."apiKey" = $1 OR b.id = $1 OR b.domain = $2 OR u.domain = $2 
           LIMIT 1`,
          apiKey,
          clean
        );

        if (rows && rows.length > 0 && rows[0].id) {
          business = await prisma.businessAccount.findUnique({
            where: { id: rows[0].id }
          });
        }
      } catch (err) {
        // Fallback in case raw query fails
      }
    }

    if (!business) {
      res.status(403).json({
        success: false,
        error: 'Invalid or expired API key / domain credentials.'
      });
      return;
    }

    req.business = business;
    next();
  } catch (error: any) {
    next(error);
  }
}

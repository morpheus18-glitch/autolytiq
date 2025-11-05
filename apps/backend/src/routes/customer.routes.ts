import { Router, type RequestHandler } from 'express';
import { db } from '@repo/db';

export const customerRouter = Router();

/**
 * GET /api/customers - List all customers for tenant
 */
customerRouter.get(
  '/',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const { search, limit = 50 } = req.query;

      const customers = await db.customer.findMany({
        where: {
          tenantId,
          ...(search && {
            OR: [
              { firstName: { contains: search as string, mode: 'insensitive' } },
              { lastName: { contains: search as string, mode: 'insensitive' } },
              { email: { contains: search as string, mode: 'insensitive' } },
              { phone: { contains: search as string, mode: 'insensitive' } },
            ],
          }),
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          addressZip: true,
          creditScore: true,
          leadStatus: true,
        },
        take: parseInt(limit as string, 10),
        orderBy: {
          updatedAt: 'desc',
        },
      });

      res.json({ data: customers });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/customers/:id - Get customer details
 */
customerRouter.get(
  '/:id',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const customer = await db.customer.findFirst({
        where: {
          id,
          tenantId,
        },
        include: {
          vehicles: {
            where: {
              status: 'AVAILABLE',
            },
            select: {
              id: true,
              stockNumber: true,
              vin: true,
              year: true,
              make: true,
              model: true,
              trim: true,
              priceCents: true,
              costCents: true,
              mileage: true,
            },
          },
        },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({ data: customer });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

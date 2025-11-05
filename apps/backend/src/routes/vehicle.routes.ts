import { Router, type RequestHandler } from 'express';
import { db } from '@repo/db';

export const vehicleRouter = Router();

/**
 * GET /api/vehicles - List all vehicles for tenant
 */
vehicleRouter.get(
  '/',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const { search, status = 'AVAILABLE', limit = 50 } = req.query;

      const vehicles = await db.vehicle.findMany({
        where: {
          tenantId,
          status: status as any,
          ...(search && {
            OR: [
              { stockNumber: { contains: search as string, mode: 'insensitive' } },
              { vin: { contains: search as string, mode: 'insensitive' } },
              { make: { contains: search as string, mode: 'insensitive' } },
              { model: { contains: search as string, mode: 'insensitive' } },
            ],
          }),
        },
        select: {
          id: true,
          stockNumber: true,
          vin: true,
          year: true,
          make: true,
          model: true,
          trim: true,
          mileage: true,
          priceCents: true,
          costCents: true,
          msrpCents: true,
          status: true,
          daysInStock: true,
          exteriorColor: true,
          location: true,
        },
        take: parseInt(limit as string, 10),
        orderBy: {
          updatedAt: 'desc',
        },
      });

      // Convert cents to dollars for easier consumption
      const vehiclesWithPrices = vehicles.map(v => ({
        ...v,
        price: v.priceCents ? v.priceCents / 100 : 0,
        cost: v.costCents ? v.costCents / 100 : 0,
        msrp: v.msrpCents ? v.msrpCents / 100 : 0,
      }));

      res.json({ data: vehiclesWithPrices });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/vehicles/:id - Get vehicle details
 */
vehicleRouter.get(
  '/:id',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      const vehicle = await db.vehicle.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // Convert cents to dollars
      const vehicleWithPrices = {
        ...vehicle,
        price: vehicle.priceCents ? vehicle.priceCents / 100 : 0,
        cost: vehicle.costCents ? vehicle.costCents / 100 : 0,
        msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : 0,
        invoiceCost: vehicle.invoiceCents ? vehicle.invoiceCents / 100 : 0,
      };

      res.json({ data: vehicleWithPrices });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

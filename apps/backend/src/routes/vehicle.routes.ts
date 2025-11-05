import { Router, type RequestHandler } from 'express';
import { db } from '@repo/db';
import { z } from 'zod';

export const vehicleRouter = Router();

/**
 * VIN Decoder Service (mock - replace with NHTSA API or third-party service)
 */
async function decodeVIN(vin: string): Promise<any> {
  // TODO: Integrate with actual VIN decoder API
  // Options:
  // - NHTSA vPIC API: https://vpic.nhtsa.dot.gov/api/
  // - Carfax API
  // - AutoCheck API
  // - DataOne Software

  // For now, return mock decoded data
  return {
    vin,
    year: 2024,
    make: 'Ford',
    model: 'F-150',
    trim: 'Lariat',
    bodyStyle: 'Crew Cab Pickup',
    engineType: '3.5L V6 EcoBoost',
    transmission: '10-Speed Automatic',
    drivetrain: '4WD',
    fuelType: 'GASOLINE',
    msrp: 65000,
    valid: true,
  };
}

/**
 * Validation schema for vehicle creation/update
 */
const vehicleSchema = z.object({
  // Required fields
  stockNumber: z.string().min(1, 'Stock number is required'),
  vin: z.string().length(17, 'VIN must be 17 characters'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  type: z.enum(['NEW', 'USED', 'CERTIFIED']),

  // Optional fields
  trim: z.string().optional(),
  bodyStyle: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  engineType: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID', 'OTHER']).default('GASOLINE'),
  condition: z.enum(['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR']).optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'PENDING', 'ON_HOLD', 'IN_TRANSIT', 'AT_AUCTION']).default('AVAILABLE'),

  // Pricing (in cents to avoid floating point issues)
  costCents: z.number().int().min(0).optional(),
  priceCents: z.number().int().min(0).optional(),
  msrpCents: z.number().int().min(0).optional(),
  invoiceCents: z.number().int().min(0).optional(),
  packCents: z.number().int().min(0).optional(),
  reconCostCents: z.number().int().min(0).optional(),
  minPriceCents: z.number().int().min(0).optional(),
  acquisitionCostCents: z.number().int().min(0).optional(),

  // Acquisition
  acquiredFrom: z.string().optional(),
  acquiredDate: z.string().datetime().optional(),
  acquisitionType: z.enum(['TRADE_IN', 'AUCTION', 'WHOLESALE', 'DEALER_TRANSFER', 'MANUFACTURER', 'LEASE_RETURN', 'REPO', 'OTHER']).optional(),

  // Location
  location: z.string().optional(),
  locationId: z.string().optional(),

  // Additional
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  imageUrls: z.array(z.string()).default([]),
  primaryImageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  certifiedPreOwned: z.boolean().default(false),
  certificationNumber: z.string().optional(),
  notes: z.string().optional(),
});

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
      const vehiclesWithPrices = vehicles.map((v: any) => ({
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

/**
 * POST /api/vehicles/decode-vin - Decode VIN to get vehicle specifications
 */
vehicleRouter.post(
  '/decode-vin',
  (async (req, res, next) => {
    try {
      const { vin } = req.body;

      if (!vin || vin.length !== 17) {
        return res.status(400).json({ error: 'Valid 17-character VIN required' });
      }

      // Decode VIN using external service (currently mock)
      const decodedData = await decodeVIN(vin);

      res.json({
        success: true,
        data: decodedData,
        message: 'VIN decoded successfully (mock data - API integration pending)',
      });
    } catch (error) {
      console.error('Error decoding VIN:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/vehicles - Create a new vehicle
 */
vehicleRouter.post(
  '/',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;

      // Validate request body
      const validationResult = vehicleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.errors,
        });
      }

      const data = validationResult.data;

      // Check if VIN already exists
      const existingVehicle = await db.vehicle.findUnique({
        where: { vin: data.vin },
      });

      if (existingVehicle) {
        return res.status(409).json({ error: 'Vehicle with this VIN already exists' });
      }

      // Calculate days in stock
      const dateReceived = data.acquiredDate ? new Date(data.acquiredDate) : new Date();
      const daysInStock = Math.floor((new Date().getTime() - dateReceived.getTime()) / (1000 * 60 * 60 * 24));

      // Prepare vehicle data
      const vehicleData: any = {
        ...data,
        tenantId,
        acquiredDate: data.acquiredDate ? new Date(data.acquiredDate) : undefined,
        dateReceived,
        daysInStock,
      };

      // Create vehicle
      const vehicle = await db.vehicle.create({
        data: vehicleData,
      });

      // Convert cents to dollars for response
      const vehicleWithPrices = {
        ...vehicle,
        price: vehicle.priceCents ? vehicle.priceCents / 100 : 0,
        cost: vehicle.costCents ? vehicle.costCents / 100 : 0,
        msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : 0,
        invoiceCost: vehicle.invoiceCents ? vehicle.invoiceCents / 100 : 0,
      };

      res.status(201).json({ data: vehicleWithPrices });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * PUT /api/vehicles/:id - Update an existing vehicle
 */
vehicleRouter.put(
  '/:id',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      // Validate request body (all fields optional for update)
      const updateSchema = vehicleSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validationResult.error.errors,
        });
      }

      const data = validationResult.data;

      // Check if vehicle exists and belongs to tenant
      const existingVehicle = await db.vehicle.findFirst({
        where: { id, tenantId },
      });

      if (!existingVehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      // If VIN is being updated, check for conflicts
      if (data.vin && data.vin !== existingVehicle.vin) {
        const vinConflict = await db.vehicle.findUnique({
          where: { vin: data.vin },
        });
        if (vinConflict) {
          return res.status(409).json({ error: 'Another vehicle with this VIN already exists' });
        }
      }

      // Prepare update data
      const updateData: any = {
        ...data,
        acquiredDate: data.acquiredDate ? new Date(data.acquiredDate) : undefined,
      };

      // Track price changes
      if (data.priceCents && data.priceCents !== existingVehicle.priceCents) {
        updateData.lastPriceChangeDate = new Date();
      }

      // Update vehicle
      const vehicle = await db.vehicle.update({
        where: { id },
        data: updateData,
      });

      // Convert cents to dollars for response
      const vehicleWithPrices = {
        ...vehicle,
        price: vehicle.priceCents ? vehicle.priceCents / 100 : 0,
        cost: vehicle.costCents ? vehicle.costCents / 100 : 0,
        msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : 0,
        invoiceCost: vehicle.invoiceCents ? vehicle.invoiceCents / 100 : 0,
      };

      res.json({ data: vehicleWithPrices });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      next(error);
    }
  }) as RequestHandler
);

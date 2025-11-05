/**
 * Inventory API Routes
 * Handles vehicle inventory CRUD operations, status updates, and analytics
 */

import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { VehicleStatus, VehicleType } from '@prisma/client';
import {
  getInventory,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  updateVehiclePrice,
  getInventoryMetrics,
  getAgingAnalysis,
  getTurnRateMetrics,
} from '../services/inventory.service.js';

export const inventoryRouter = Router();

// Validation schemas
const inventoryFiltersSchema = z.object({
  status: z.array(z.nativeEnum(VehicleStatus)).optional(),
  type: z.array(z.nativeEnum(VehicleType)).optional(),
  yearMin: z.coerce.number().optional(),
  yearMax: z.coerce.number().optional(),
  make: z.array(z.string()).optional(),
  model: z.array(z.string()).optional(),
  locationId: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  daysInStockMin: z.coerce.number().optional(),
  daysInStockMax: z.coerce.number().optional(),
  search: z.string().optional(),
});

const createVehicleSchema = z.object({
  stockNumber: z.string().min(1),
  vin: z.string().min(17).max(17),
  type: z.nativeEnum(VehicleType),
  year: z.number().int().min(1900).max(2100),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  bodyStyle: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  engineType: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  fuelType: z.string(),
  condition: z.string().optional(),
  costCents: z.number().int().min(0).optional(),
  msrpCents: z.number().int().min(0).optional(),
  priceCents: z.number().int().min(0).optional(),
  minPriceCents: z.number().int().min(0).optional(),
  locationId: z.string().optional(),
  acquiredFrom: z.string().optional(),
  acquiredDate: z.string().datetime().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  primaryImageUrl: z.string().optional(),
  certifiedPreOwned: z.boolean().optional(),
  notes: z.string().optional(),
});

const updateVehicleSchema = z.object({
  stockNumber: z.string().min(1).optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  mileage: z.number().int().min(0).optional(),
  condition: z.string().optional(),
  costCents: z.number().int().min(0).optional(),
  msrpCents: z.number().int().min(0).optional(),
  priceCents: z.number().int().min(0).optional(),
  minPriceCents: z.number().int().min(0).optional(),
  locationId: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  primaryImageUrl: z.string().optional(),
  certifiedPreOwned: z.boolean().optional(),
  notes: z.string().optional(),
  reconEstimate: z.number().optional(),
  reconActual: z.number().optional(),
  reconCompletedAt: z.string().datetime().optional(),
  agingBucket: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(VehicleStatus),
  notes: z.string().optional(),
});

const updatePriceSchema = z.object({
  priceCents: z.number().int().min(0),
  minPriceCents: z.number().int().min(0).optional(),
  pricingNotes: z.string().optional(),
});

/**
 * GET /api/inventory
 * Get all vehicles with filters
 */
inventoryRouter.get(
  '/',
  (async (req, res, next) => {
    try {
      const validation = inventoryFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid filters',
          details: validation.error.errors,
        });
      }

      const filters = validation.data;
      const tenantId = req.tenantId!;

      const vehicles = await getInventory({
        tenantId,
        status: filters.status,
        type: filters.type,
        year: {
          min: filters.yearMin,
          max: filters.yearMax,
        },
        make: filters.make,
        model: filters.model,
        locationId: filters.locationId,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        daysInStockMin: filters.daysInStockMin,
        daysInStockMax: filters.daysInStockMax,
        search: filters.search,
      });

      res.json({ data: vehicles });
    } catch (error) {
      console.error('Inventory fetch error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/inventory/:id
 * Get a single vehicle by ID
 */
inventoryRouter.get(
  '/:id',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;

      const vehicle = await getVehicleById(id, tenantId);

      res.json({ data: vehicle });
    } catch (error: any) {
      console.error('Vehicle fetch error:', error);
      if (error.message === 'Vehicle not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/inventory
 * Create a new vehicle
 */
inventoryRouter.post(
  '/',
  (async (req, res, next) => {
    try {
      const validation = createVehicleSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const vehicleData = validation.data;

      const vehicle = await createVehicle({
        tenantId,
        ...vehicleData,
        acquiredDate: vehicleData.acquiredDate
          ? new Date(vehicleData.acquiredDate)
          : undefined,
      });

      res.status(201).json({ data: vehicle });
    } catch (error: any) {
      console.error('Vehicle creation error:', error);
      if (error.message === 'Vehicle with this VIN already exists') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * PUT /api/inventory/:id
 * Update a vehicle
 */
inventoryRouter.put(
  '/:id',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updateVehicleSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const userId = req.userId!;
      const updates = validation.data;

      // Convert date strings to Date objects
      const processedUpdates = {
        ...updates,
        reconCompletedAt: updates.reconCompletedAt
          ? new Date(updates.reconCompletedAt)
          : undefined,
      };

      const vehicle = await updateVehicle(id, tenantId, userId, processedUpdates);

      res.json({ data: vehicle });
    } catch (error: any) {
      console.error('Vehicle update error:', error);
      if (error.message === 'Vehicle not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * DELETE /api/inventory/:id
 * Delete (soft delete) a vehicle
 */
inventoryRouter.delete(
  '/:id',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      await deleteVehicle(id, tenantId, userId);

      res.json({
        data: {
          success: true,
          message: 'Vehicle deleted successfully',
        },
      });
    } catch (error: any) {
      console.error('Vehicle deletion error:', error);
      if (error.message === 'Vehicle not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * PATCH /api/inventory/:id/status
 * Update vehicle status
 */
inventoryRouter.patch(
  '/:id/status',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updateStatusSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const userId = req.userId!;
      const { status, notes } = validation.data;

      const vehicle = await updateVehicleStatus(id, tenantId, userId, status, notes);

      res.json({ data: vehicle });
    } catch (error: any) {
      console.error('Status update error:', error);
      if (error.message === 'Vehicle not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * PATCH /api/inventory/:id/price
 * Update vehicle price
 */
inventoryRouter.patch(
  '/:id/price',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updatePriceSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const userId = req.userId!;
      const priceUpdate = validation.data;

      const vehicle = await updateVehiclePrice(id, tenantId, {
        ...priceUpdate,
        userId,
      });

      res.json({ data: vehicle });
    } catch (error: any) {
      console.error('Price update error:', error);
      if (error.message === 'Vehicle not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/inventory/metrics/overview
 * Get inventory dashboard metrics
 */
inventoryRouter.get(
  '/metrics/overview',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;

      const metrics = await getInventoryMetrics(tenantId);

      res.json({ data: metrics });
    } catch (error) {
      console.error('Inventory metrics error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/inventory/metrics/aging
 * Get aging analysis
 */
inventoryRouter.get(
  '/metrics/aging',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;

      const agingAnalysis = await getAgingAnalysis(tenantId);

      res.json({ data: agingAnalysis });
    } catch (error) {
      console.error('Aging analysis error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/inventory/metrics/turn-rate
 * Get turn rate metrics
 */
inventoryRouter.get(
  '/metrics/turn-rate',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const months = req.query.months ? parseInt(req.query.months as string) : 12;

      const turnRateMetrics = await getTurnRateMetrics(tenantId, months);

      res.json({ data: turnRateMetrics });
    } catch (error) {
      console.error('Turn rate metrics error:', error);
      next(error);
    }
  }) as RequestHandler
);

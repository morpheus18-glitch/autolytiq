/**
 * Service Order API Routes
 * Handles repair order (RO) CRUD operations
 */

import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { ServiceOrderStatus } from '@prisma/client';
import {
  getServiceOrders,
  getServiceOrderById,
  createServiceOrder,
  updateServiceOrder,
  deleteServiceOrder,
  addServiceOrderLineItems,
  getServiceOrderStats,
} from '../services/service-order.service';

export const serviceOrderRouter = Router();

// Validation schemas
const serviceOrderFiltersSchema = z.object({
  status: z.array(z.nativeEnum(ServiceOrderStatus)).optional(),
  advisorId: z.string().optional(),
  technicianId: z.string().optional(),
  customerId: z.string().optional(),
  vehicleId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

const createServiceOrderSchema = z.object({
  roNumber: z.string().min(1),
  customerId: z.string(),
  vehicleId: z.string(),
  locationId: z.string().optional(),
  type: z.string(),
  advisorId: z.string().optional(),
  technicianId: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  promisedDate: z.string().datetime().optional(),
  mileageIn: z.number().optional(),
  customerConcern: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

const updateServiceOrderSchema = z.object({
  status: z.nativeEnum(ServiceOrderStatus).optional(),
  advisorId: z.string().optional(),
  technicianId: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  promisedDate: z.string().datetime().optional(),
  mileageIn: z.number().optional(),
  mileageOut: z.number().optional(),
  customerConcern: z.string().optional(),
  causeOfFailure: z.string().optional(),
  correction: z.string().optional(),
  laborCents: z.number().optional(),
  partsCents: z.number().optional(),
  subletCents: z.number().optional(),
  shopSuppliesCents: z.number().optional(),
  subtotalCents: z.number().optional(),
  taxCents: z.number().optional(),
  totalCents: z.number().optional(),
  isPaid: z.boolean().optional(),
  paidAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
});

const addLineItemsSchema = z.object({
  lineItems: z.array(
    z.object({
      type: z.string(),
      description: z.string().optional(),
      hours: z.number().optional(),
      rateCents: z.number().optional(),
      amountCents: z.number(),
    })
  ),
});

/**
 * GET /api/service-orders
 * Get all service orders with filters
 */
serviceOrderRouter.get(
  '/',
  (async (req, res, next) => {
    try {
      const validation = serviceOrderFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid filters',
          details: validation.error.errors,
        });
      }

      const filters = validation.data;
      const tenantId = req.tenantId!;

      const serviceOrders = await getServiceOrders({
        tenantId,
        ...filters,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      });

      res.json({ data: serviceOrders });
    } catch (error) {
      console.error('Service orders fetch error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/service-orders/:id
 * Get a single service order by ID
 */
serviceOrderRouter.get(
  '/:id',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;

      const serviceOrder = await getServiceOrderById(id, tenantId);

      res.json({ data: serviceOrder });
    } catch (error: any) {
      console.error('Service order fetch error:', error);
      if (error.message === 'Service order not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/service-orders
 * Create a new service order
 */
serviceOrderRouter.post(
  '/',
  (async (req, res, next) => {
    try {
      const validation = createServiceOrderSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const serviceOrderData = validation.data;

      const serviceOrder = await createServiceOrder({
        tenantId,
        ...serviceOrderData,
        scheduledDate: serviceOrderData.scheduledDate
          ? new Date(serviceOrderData.scheduledDate)
          : undefined,
        promisedDate: serviceOrderData.promisedDate
          ? new Date(serviceOrderData.promisedDate)
          : undefined,
      });

      res.status(201).json({ data: serviceOrder });
    } catch (error) {
      console.error('Service order creation error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * PUT /api/service-orders/:id
 * Update a service order
 */
serviceOrderRouter.put(
  '/:id',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updateServiceOrderSchema.safeParse(req.body);

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
        scheduledDate: updates.scheduledDate ? new Date(updates.scheduledDate) : undefined,
        startedAt: updates.startedAt ? new Date(updates.startedAt) : undefined,
        completedAt: updates.completedAt ? new Date(updates.completedAt) : undefined,
        promisedDate: updates.promisedDate ? new Date(updates.promisedDate) : undefined,
        paidAt: updates.paidAt ? new Date(updates.paidAt) : undefined,
      };

      const serviceOrder = await updateServiceOrder(id, tenantId, userId, processedUpdates);

      res.json({ data: serviceOrder });
    } catch (error: any) {
      console.error('Service order update error:', error);
      if (error.message === 'Service order not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * DELETE /api/service-orders/:id
 * Delete (soft delete) a service order
 */
serviceOrderRouter.delete(
  '/:id',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      await deleteServiceOrder(id, tenantId, userId);

      res.json({
        data: {
          success: true,
          message: 'Service order deleted successfully',
        },
      });
    } catch (error: any) {
      console.error('Service order deletion error:', error);
      if (error.message === 'Service order not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/service-orders/:id/line-items
 * Add line items to a service order
 */
serviceOrderRouter.post(
  '/:id/line-items',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = addLineItemsSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const { lineItems } = validation.data;

      await addServiceOrderLineItems(id, tenantId, lineItems);

      res.status(201).json({
        data: {
          success: true,
          message: `${lineItems.length} line items added successfully`,
        },
      });
    } catch (error: any) {
      console.error('Line items creation error:', error);
      if (error.message === 'Service order not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/service-orders/stats
 * Get service order statistics
 */
serviceOrderRouter.get(
  '/stats/overview',
  (async (req, res, next) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const tenantId = req.tenantId!;

      const stats = await getServiceOrderStats(
        tenantId,
        dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo ? new Date(dateTo as string) : undefined
      );

      res.json({ data: stats });
    } catch (error) {
      console.error('Service order stats error:', error);
      next(error);
    }
  }) as RequestHandler
);

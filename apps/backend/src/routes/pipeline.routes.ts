/**
 * Pipeline API Routes
 * Handles deal pipeline operations
 */

import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { DealStage, DealStatus } from '@prisma/client';
import { db } from '@repo/db';
import {
  getPipelineData,
  moveDealToStage,
  bulkUpdateDeals,
  getPipelineStats,
} from '../services/pipeline.service.js';

export const pipelineRouter = Router();

// Validation schemas
const pipelineFiltersSchema = z.object({
  salesPersonId: z.string().optional(),
  salesManagerId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: z.array(z.nativeEnum(DealStatus)).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
});

const moveDealSchema = z.object({
  stage: z.nativeEnum(DealStage),
  notes: z.string().optional(),
});

const bulkUpdateSchema = z.object({
  dealIds: z.array(z.string()).min(1),
  updates: z.object({
    stage: z.nativeEnum(DealStage).optional(),
    status: z.nativeEnum(DealStatus).optional(),
    salesPersonId: z.string().optional(),
    salesManagerId: z.string().optional(),
  }),
});

/**
 * GET /api/pipeline
 * Get pipeline data with deals grouped by stage
 */
pipelineRouter.get(
  '/',
  (async (req, res, next) => {
    try {
      const validation = pipelineFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid filters',
          details: validation.error.errors,
        });
      }

      const filters = validation.data;
      const tenantId = req.tenantId!;

      const pipelineData = await getPipelineData({
        tenantId,
        ...filters,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      });

      res.json({ data: pipelineData });
    } catch (error) {
      console.error('Pipeline fetch error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * PATCH /api/pipeline/deals/:id/stage
 * Move deal to a new stage
 */
pipelineRouter.patch(
  '/deals/:id/stage',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = moveDealSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const { stage, notes } = validation.data;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      await moveDealToStage(id, stage, userId, tenantId, notes);

      res.json({
        data: {
          success: true,
          message: `Deal moved to ${stage}`,
        },
      });
    } catch (error: any) {
      console.error('Move deal error:', error);
      if (error.message === 'Deal not found' || error.message === 'Unauthorized') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/pipeline/deals/bulk-update
 * Bulk update multiple deals
 */
pipelineRouter.post(
  '/deals/bulk-update',
  (async (req, res, next) => {
    try {
      const validation = bulkUpdateSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const { dealIds, updates } = validation.data;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      await bulkUpdateDeals(dealIds, updates, userId, tenantId);

      res.json({
        data: {
          success: true,
          message: `${dealIds.length} deals updated`,
        },
      });
    } catch (error: any) {
      console.error('Bulk update error:', error);
      if (error.message.includes('not found') || error.message.includes('unauthorized')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/pipeline/stats
 * Get pipeline statistics
 */
pipelineRouter.get(
  '/stats',
  (async (req, res, next) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const tenantId = req.tenantId!;

      const stats = await getPipelineStats(
        tenantId,
        dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo ? new Date(dateTo as string) : undefined
      );

      res.json({ data: stats });
    } catch (error) {
      console.error('Pipeline stats error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/pipeline/deals/:id/history
 * Get stage transition history for a deal
 */
pipelineRouter.get(
  '/deals/:id/history',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;

      const transitions = await db.stageTransition.findMany({
        where: {
          dealId: id,
          tenantId,
        },
        include: {
          transitionedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { transitionedAt: 'desc' },
      });

      res.json({
        data: transitions.map((t) => ({
          id: t.id,
          fromStage: t.fromStage,
          toStage: t.toStage,
          transitionedAt: t.transitionedAt,
          transitionedBy: {
            id: t.transitionedByUser.id,
            name: `${t.transitionedByUser.firstName} ${t.transitionedByUser.lastName}`,
          },
          notes: t.notes,
        })),
      });
    } catch (error) {
      console.error('Deal history error:', error);
      next(error);
    }
  }) as RequestHandler
);

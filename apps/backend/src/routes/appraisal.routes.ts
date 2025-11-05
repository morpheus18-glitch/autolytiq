/**
 * Appraisal API Routes
 * Comprehensive trade-in appraisal system with full integration
 */

import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { AppraisalStatus, AppraisalConditionGrade } from '@prisma/client';
import {
  createAppraisal,
  getAppraisalById,
  updateAppraisal,
  submitAppraisal,
  processApprovalDecision,
  convertAppraisalToInventory,
  getAppraisals,
  decodeVIN,
} from '../services/appraisal.service.js';

export const appraisalRouter = Router();

// Validation schemas
const createAppraisalSchema = z.object({
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  vin: z.string().min(17).max(17),
  year: z.number().int().min(1900).max(2100).optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  trim: z.string().optional(),
  mileage: z.number().int().min(0),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  conditionGrade: z.nativeEnum(AppraisalConditionGrade).optional(),
  conditionNotes: z.string().optional(),
  warningLights: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateAppraisalSchema = z.object({
  mileage: z.number().int().min(0).optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  conditionGrade: z.nativeEnum(AppraisalConditionGrade).optional(),
  conditionScore: z.number().int().min(0).max(100).optional(),
  conditionNotes: z.string().optional(),
  warningLights: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
  estimatedValue: z.number().optional(),
});

const approvalDecisionSchema = z.object({
  approved: z.boolean(),
  offerAmount: z.number().min(0).optional(),
  adjustmentReason: z.string().optional(),
  expiresInHours: z.number().int().min(1).max(168).optional(), // Max 1 week
  notes: z.string().optional(),
});

const convertToInventorySchema = z.object({
  stockNumber: z.string().min(1),
  costCents: z.number().int().min(0),
  priceCents: z.number().int().min(0),
  locationId: z.string().optional(),
  status: z.string().optional(),
});

const appraisalFiltersSchema = z.object({
  status: z.array(z.nativeEnum(AppraisalStatus)).optional(),
  appraiserId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

/**
 * POST /api/appraisals/decode-vin
 * Decode VIN and get vehicle information
 */
appraisalRouter.post(
  '/decode-vin',
  (async (req, res, next) => {
    try {
      const { vin } = req.body;

      if (!vin || vin.length !== 17) {
        return res.status(400).json({ error: 'Valid 17-character VIN required' });
      }

      const decoded = await decodeVIN(vin);

      res.json({ data: decoded });
    } catch (error) {
      console.error('VIN decode error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/appraisals
 * Get all appraisals with filters
 */
appraisalRouter.get(
  '/',
  (async (req, res, next) => {
    try {
      const validation = appraisalFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid filters',
          details: validation.error.errors,
        });
      }

      const filters = validation.data;
      const tenantId = req.tenantId!;

      const appraisals = await getAppraisals({
        tenantId,
        status: filters.status,
        appraiserId: filters.appraiserId,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      });

      res.json({ data: appraisals });
    } catch (error) {
      console.error('Appraisals fetch error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/appraisals/:id
 * Get appraisal with full valuations
 */
appraisalRouter.get(
  '/:id',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;

      const appraisal = await getAppraisalById(id, tenantId);

      res.json({ data: appraisal });
    } catch (error: any) {
      console.error('Appraisal fetch error:', error);
      if (error.message === 'Appraisal not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/appraisals
 * Create new appraisal
 */
appraisalRouter.post(
  '/',
  (async (req, res, next) => {
    try {
      const validation = createAppraisalSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const userId = req.userId!;
      const appraisalData = validation.data;

      const appraisal = await createAppraisal({
        tenantId,
        appraiserId: userId,
        ...appraisalData,
      });

      res.status(201).json({ data: appraisal });
    } catch (error) {
      console.error('Appraisal creation error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * PUT /api/appraisals/:id
 * Update appraisal
 */
appraisalRouter.put(
  '/:id',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = updateAppraisalSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const userId = req.userId!;
      const updates = validation.data;

      const appraisal = await updateAppraisal(id, tenantId, userId, updates);

      res.json({ data: appraisal });
    } catch (error: any) {
      console.error('Appraisal update error:', error);
      if (error.message === 'Appraisal not found' || error.message.includes('Cannot update')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/appraisals/:id/submit
 * Submit appraisal for manager approval
 */
appraisalRouter.post(
  '/:id/submit',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const appraisal = await submitAppraisal(id, tenantId, userId);

      res.json({ data: appraisal });
    } catch (error: any) {
      console.error('Appraisal submission error:', error);
      if (error.message === 'Appraisal not found' || error.message.includes('already submitted')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/appraisals/:id/approve
 * Manager approval or rejection
 */
appraisalRouter.post(
  '/:id/approve',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = approvalDecisionSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const userId = req.userId!;
      const decision = validation.data;

      const appraisal = await processApprovalDecision({
        appraisalId: id,
        managerId: userId,
        ...decision,
      });

      res.json({ data: appraisal });
    } catch (error: any) {
      console.error('Approval decision error:', error);
      if (error.message === 'Appraisal not found' || error.message.includes('not in reviewable')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/appraisals/:id/convert-to-inventory
 * Convert approved appraisal to inventory
 */
appraisalRouter.post(
  '/:id/convert-to-inventory',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const validation = convertToInventorySchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const userId = req.userId!;
      const conversionData = validation.data;

      const vehicle = await convertAppraisalToInventory({
        appraisalId: id,
        tenantId,
        userId,
        ...conversionData,
      });

      res.status(201).json({ data: vehicle });
    } catch (error: any) {
      console.error('Appraisal conversion error:', error);
      if (error.message === 'Appraisal not found' || error.message.includes('Only approved')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * AI Pricing Intelligence API Routes
 * Handles dynamic pricing, market analysis, and appraisal valuations
 */

import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import {
  getAIPricingRecommendation,
  getMarketAnalysis,
  getAppraisalValuation,
  getBatchPricingRecommendations,
} from '../services/pricing-intelligence.service.js';

export const pricingIntelligenceRouter = Router();

// Validation schemas
const appraisalInputSchema = z.object({
  vin: z.string().min(17).max(17),
  year: z.number().int().min(1900).max(2100),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  mileage: z.number().int().min(0),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']),
  zipCode: z.string().optional(),
});

const batchPricingFiltersSchema = z.object({
  daysInStockMin: z.coerce.number().optional(),
  status: z.array(z.string()).optional(),
});

/**
 * GET /api/pricing-intelligence/vehicles/:id/recommendation
 * Get AI pricing recommendation for a vehicle
 */
pricingIntelligenceRouter.get(
  '/vehicles/:id/recommendation',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;

      const recommendation = await getAIPricingRecommendation(id, tenantId);

      res.json({ data: recommendation });
    } catch (error: any) {
      console.error('Pricing recommendation error:', error);
      if (error.message === 'Vehicle not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/pricing-intelligence/vehicles/:id/market-analysis
 * Get comprehensive market analysis for a vehicle
 */
pricingIntelligenceRouter.get(
  '/vehicles/:id/market-analysis',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;

      const analysis = await getMarketAnalysis(id, tenantId);

      res.json({ data: analysis });
    } catch (error: any) {
      console.error('Market analysis error:', error);
      if (error.message === 'Vehicle not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/pricing-intelligence/appraisal
 * Get instant appraisal valuation for a vehicle
 */
pricingIntelligenceRouter.post(
  '/appraisal',
  (async (req, res, next) => {
    try {
      const validation = appraisalInputSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const appraisalInput = validation.data;

      const valuation = await getAppraisalValuation(appraisalInput, tenantId);

      res.json({ data: valuation });
    } catch (error) {
      console.error('Appraisal error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/pricing-intelligence/batch-recommendations
 * Get batch pricing recommendations for inventory
 */
pricingIntelligenceRouter.get(
  '/batch-recommendations',
  (async (req, res, next) => {
    try {
      const validation = batchPricingFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid filters',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const filters = validation.data;

      const recommendations = await getBatchPricingRecommendations(tenantId, filters);

      res.json({
        data: recommendations,
        meta: {
          total: recommendations.length,
          needsAttention: recommendations.filter(r => r.marketPosition === 'ABOVE_MARKET').length,
          opportunities: recommendations.filter(r => r.marketPosition === 'BELOW_MARKET').length,
        },
      });
    } catch (error) {
      console.error('Batch pricing recommendations error:', error);
      next(error);
    }
  }) as RequestHandler
);

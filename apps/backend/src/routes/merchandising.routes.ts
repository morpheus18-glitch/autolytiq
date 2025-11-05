/**
 * Merchandising & Analytics API Routes
 * Handles content generation, retail readiness scoring, and VDP analytics
 */

import { Router, type RequestHandler } from 'express';
import {
  generateMerchandisingContent,
  calculateRetailReadiness,
  getVDPAnalytics,
  getBatchRetailReadiness,
} from '../services/merchandising.service.js';

export const merchandisingRouter = Router();

/**
 * POST /api/merchandising/vehicles/:id/generate-content
 * Generate AI-powered merchandising content
 */
merchandisingRouter.post(
  '/vehicles/:id/generate-content',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;

      const content = await generateMerchandisingContent(id, tenantId);

      res.json({ data: content });
    } catch (error: any) {
      console.error('Content generation error:', error);
      if (error.message === 'Vehicle not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/merchandising/vehicles/:id/retail-readiness
 * Get retail readiness score for a vehicle
 */
merchandisingRouter.get(
  '/vehicles/:id/retail-readiness',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;

      const readiness = await calculateRetailReadiness(id, tenantId);

      res.json({ data: readiness });
    } catch (error: any) {
      console.error('Retail readiness error:', error);
      if (error.message === 'Vehicle not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/merchandising/vehicles/:id/vdp-analytics
 * Get VDP analytics for a vehicle
 */
merchandisingRouter.get(
  '/vehicles/:id/vdp-analytics',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const periodDays = req.query.periodDays ? parseInt(req.query.periodDays as string) : 30;

      const analytics = await getVDPAnalytics(id, tenantId, periodDays);

      res.json({ data: analytics });
    } catch (error: any) {
      console.error('VDP analytics error:', error);
      if (error.message === 'Vehicle not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/merchandising/batch-retail-readiness
 * Get batch retail readiness scores for all inventory
 */
merchandisingRouter.get(
  '/batch-retail-readiness',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;

      const readinessScores = await getBatchRetailReadiness(tenantId);

      // Sort by score ascending (worst first)
      const sorted = readinessScores.sort((a, b) => a.score - b.score);

      res.json({
        data: sorted,
        meta: {
          total: sorted.length,
          needsAttention: sorted.filter(v => v.score < 60).length,
          critical: sorted.filter(v => v.criticalIssues.length > 0).length,
          avgScore: Math.round(sorted.reduce((sum, v) => sum + v.score, 0) / sorted.length),
        },
      });
    } catch (error) {
      console.error('Batch retail readiness error:', error);
      next(error);
    }
  }) as RequestHandler
);

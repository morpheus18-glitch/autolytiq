/**
 * Search API Routes
 * Handles intelligent search requests
 */

import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import {
  performSearch,
  getRecentSearches,
  getPopularSearches,
} from '../services/search.service.js';

export const searchRouter = Router();

// Validation schemas
const searchSchema = z.object({
  query: z.string().min(1).max(200),
  filters: z
    .object({
      dateRange: z.enum(['today', 'week', 'month', 'quarter', 'year']).optional(),
      status: z.array(z.string()).optional(),
      assignedTo: z.string().optional(),
    })
    .optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

/**
 * POST /api/search
 * Universal search endpoint
 */
searchRouter.post(
  '/',
  (async (req, res, next) => {
    try {
      const validation = searchSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const { query, filters, limit, offset } = validation.data;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const results = await performSearch({
        tenantId,
        userId,
        query,
        filters,
        limit,
        offset,
      });

      res.json({ data: results });
    } catch (error) {
      console.error('Search error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/search/suggestions?q=query
 * Get autocomplete suggestions
 */
searchRouter.get(
  '/suggestions',
  (async (req, res, next) => {
    try {
      const query = req.query.q as string;
      const tenantId = req.tenantId!;

      if (!query || query.length < 2) {
        return res.json({ data: { suggestions: [] } });
      }

      // Get popular searches that match the query
      const suggestions = await getPopularSearches(tenantId, 10);

      // Filter suggestions that contain the query
      const filtered = suggestions
        .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      res.json({
        data: {
          suggestions: filtered.map((text) => ({
            text,
            category: 'popular',
          })),
        },
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/search/recent?limit=10
 * Get user's recent searches
 */
searchRouter.get(
  '/recent',
  (async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const recent = await getRecentSearches(tenantId, userId, limit);

      res.json({ data: { recent } });
    } catch (error) {
      console.error('Recent searches error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/search/popular?category=deals&limit=10
 * Get popular searches
 */
searchRouter.get(
  '/popular',
  (async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const tenantId = req.tenantId!;

      const popular = await getPopularSearches(tenantId, limit);

      res.json({
        data: {
          popular: popular.map((query) => ({ query, category: 'general' })),
        },
      });
    } catch (error) {
      console.error('Popular searches error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/search/track-click
 * Track when user clicks on a search result
 */
searchRouter.post(
  '/track-click',
  (async (req, res, next) => {
    try {
      const { searchQueryId } = req.body;

      if (!searchQueryId) {
        return res.status(400).json({ error: 'Missing searchQueryId' });
      }

      // Update search query to mark as clicked
      // This helps with search quality metrics
      // TODO: Implement when needed

      res.json({ data: { success: true } });
    } catch (error) {
      console.error('Track click error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * DELETE /api/search/history
 * Clear user's search history
 */
searchRouter.delete(
  '/history',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      // Delete user's search history
      // TODO: Implement when needed

      res.json({ data: { success: true } });
    } catch (error) {
      console.error('Clear history error:', error);
      next(error);
    }
  }) as RequestHandler
);

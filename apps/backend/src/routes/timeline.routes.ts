import { Router } from 'express';
import { z } from 'zod';
import { buildCustomerTimeline, getTimelineStats } from '../services/timeline.service.js';

const router = Router();

const timelineQuerySchema = z.object({
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  categories: z
    .array(z.enum(['ACTIVITY', 'COMMUNICATION', 'APPOINTMENT', 'DEAL', 'SERVICE']))
    .optional(),
  types: z.array(z.string()).optional(),
  actorId: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

/**
 * GET /api/timeline
 * Fetches unified customer timeline
 *
 * Query Parameters:
 * - customerId: Customer ID (required if leadId not provided)
 * - leadId: Lead ID (required if customerId not provided)
 * - categories: Filter by event categories (ACTIVITY, COMMUNICATION, etc.)
 * - types: Filter by specific event types (EMAIL, CALL, etc.)
 * - actorId: Filter by user who performed action
 * - fromDate: Start date filter (ISO 8601)
 * - toDate: End date filter (ISO 8601)
 * - cursor: Pagination cursor (ISO timestamp)
 * - limit: Number of events per page (1-100, default: 50)
 *
 * Response:
 * {
 *   "events": [
 *     {
 *       "id": "...",
 *       "category": "ACTIVITY",
 *       "type": "EMAIL",
 *       "title": "Follow-up email sent",
 *       "body": "...",
 *       "occurredAt": "2025-11-01T...",
 *       "actor": { "id": "...", "firstName": "...", "lastName": "..." },
 *       ...
 *     }
 *   ],
 *   "nextCursor": "2025-10-31T...",
 *   "hasMore": true
 * }
 */
router.get('/', async (req, res, next) => {
  try {
    const query = timelineQuerySchema.parse(req.query);

    if (!query.customerId && !query.leadId) {
      return res.status(400).json({
        error: {
          code: 'INVALID_QUERY',
          message: 'Either customerId or leadId is required',
        },
      });
    }

    const timeline = await buildCustomerTimeline(query);
    res.json(timeline);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: error.errors,
        },
      });
    }
    next(error);
  }
});

/**
 * GET /api/timeline/stats/:customerId
 * Fetches timeline statistics for a customer
 *
 * Response:
 * {
 *   "totalEvents": 123,
 *   "activityCount": 45,
 *   "communicationCount": 67,
 *   "appointmentCount": 11,
 *   "lastInteraction": "2025-11-01T..."
 * }
 */
router.get('/stats/:customerId', async (req, res, next) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PARAMETER',
          message: 'customerId is required',
        },
      });
    }

    const stats = await getTimelineStats(customerId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;

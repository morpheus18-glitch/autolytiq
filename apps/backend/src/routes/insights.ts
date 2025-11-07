/**
 * Insights API Router
 *
 * Endpoints for insight rules evaluation, queue management, and muting
 */

import { Router, Request } from 'express';
import { z } from 'zod';
import { listRules } from '@repo/shared/insights';
import { dryRunEvaluation, evaluateRules } from '../services/insights/evaluator.js';
import {
  getQueue,
  ackInsight,
  snoozeInsight,
  muteRule,
  unmuteRule,
  getMutes,
  cleanupExpired,
} from '../services/insights/queue.js';

const router = Router();

// Validation schemas
const dryRunSchema = z.object({
  role: z.string().optional(),
  userId: z.string().optional(),
});

const ackSchema = z.object({
  id: z.string().min(1),
});

const snoozeSchema = z.object({
  id: z.string().min(1),
  minutes: z.number().min(1).max(10080), // Max 1 week
});

const muteSchema = z.object({
  ruleKey: z.string().min(1),
  minutes: z.number().min(1).optional(),
  userId: z.string().optional(),
});

const unmuteSchema = z.object({
  ruleKey: z.string().min(1),
  userId: z.string().optional(),
});

const evaluateSchema = z.object({
  role: z.string().optional(),
  userId: z.string().optional(),
});

// =============================================================================
// GET /api/insights/rules - List all registered rules
// =============================================================================

router.get('/rules', async (req, res) => {
  try {
    const rules = listRules().map((r) => ({
      key: r.key,
      domain: r.domain,
      severity: r.severity,
      audience: r.audience,
      tags: r.tags,
      ttlMinutes: r.ttlMinutes,
      cooldownMinutes: r.cooldownMinutes,
    }));

    res.json({
      rules,
      count: rules.length,
    });
  } catch (error) {
    console.error('Failed to list rules:', error);
    res.status(500).json({ error: 'Failed to list rules' });
  }
});

// =============================================================================
// POST /api/insights/evaluate/dry-run - Dry-run evaluation (no DB writes)
// =============================================================================

router.post('/evaluate/dry-run', async (req, res) => {
  try {
    const body = dryRunSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const userId = body.userId || req.user?.id;
    const role = body.role || req.user?.roles?.[0] || 'sales';

    const results = await dryRunEvaluation({
      tenantId,
      userId,
      role,
      now: new Date(),
    });

    res.json({
      results,
      count: results.length,
      matched: results.filter((r) => r.matched).length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to run dry-run evaluation:', error);
    res.status(500).json({ error: 'Failed to run evaluation' });
  }
});

// =============================================================================
// POST /api/insights/evaluate - Trigger full evaluation (writes to DB)
// =============================================================================

router.post('/evaluate', async (req, res) => {
  try {
    const body = evaluateSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const userId = body.userId || req.user?.id;
    const role = body.role || req.user?.roles?.[0] || 'sales';

    await evaluateRules({
      tenantId,
      userId,
      role,
      now: new Date(),
    });

    res.json({ success: true, message: 'Evaluation completed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to run evaluation:', error);
    res.status(500).json({ error: 'Failed to run evaluation' });
  }
});

// =============================================================================
// GET /api/insights/queue - Get user's prioritized insight queue
// =============================================================================

router.get('/queue', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user?.id;
    const role = (req.query.role as string) || req.user?.roles?.[0] || 'sales';

    const queue = await getQueue(tenantId, role, userId);

    res.json({
      queue,
      count: queue.length,
    });
  } catch (error) {
    console.error('Failed to get queue:', error);
    res.status(500).json({ error: 'Failed to get queue' });
  }
});

// =============================================================================
// POST /api/insights/queue/ack - Mark insight as done
// =============================================================================

router.post('/queue/ack', async (req, res) => {
  try {
    const body = ackSchema.parse(req.body);
    const userId = req.user!.id;

    const updated = await ackInsight(body.id, userId);

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to acknowledge insight:', error);
    res.status(500).json({ error: 'Failed to acknowledge insight' });
  }
});

// =============================================================================
// POST /api/insights/queue/snooze - Snooze insight for X minutes
// =============================================================================

router.post('/queue/snooze', async (req, res) => {
  try {
    const body = snoozeSchema.parse(req.body);
    const userId = req.user!.id;

    const updated = await snoozeInsight(body.id, body.minutes, userId);

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to snooze insight:', error);
    res.status(500).json({ error: 'Failed to snooze insight' });
  }
});

// =============================================================================
// POST /api/insights/mute - Mute a rule temporarily or permanently
// =============================================================================

router.post('/mute', async (req, res) => {
  try {
    const body = muteSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const userId = body.userId || req.user?.id;

    const mute = await muteRule(tenantId, body.ruleKey, body.minutes, userId);

    res.json(mute);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to mute rule:', error);
    res.status(500).json({ error: 'Failed to mute rule' });
  }
});

// =============================================================================
// DELETE /api/insights/mute/:ruleKey - Unmute a rule
// =============================================================================

router.delete('/mute/:ruleKey', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const ruleKey = req.params.ruleKey;
    const userId = req.user?.id;

    await unmuteRule(tenantId, ruleKey, userId);

    res.status(204).send();
  } catch (error) {
    console.error('Failed to unmute rule:', error);
    res.status(500).json({ error: 'Failed to unmute rule' });
  }
});

// =============================================================================
// GET /api/insights/mutes - Get all active mutes
// =============================================================================

router.get('/mutes', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user?.id;

    const mutes = await getMutes(tenantId, userId);

    res.json({
      mutes,
      count: mutes.length,
    });
  } catch (error) {
    console.error('Failed to get mutes:', error);
    res.status(500).json({ error: 'Failed to get mutes' });
  }
});

// =============================================================================
// POST /api/insights/cleanup - Clean up expired insights and mutes (admin)
// =============================================================================

router.post('/cleanup', async (req, res) => {
  try {
    const tenantId = req.tenantId!;

    const result = await cleanupExpired(tenantId);

    res.json(result);
  } catch (error) {
    console.error('Failed to cleanup expired items:', error);
    res.status(500).json({ error: 'Failed to cleanup' });
  }
});

export default router;

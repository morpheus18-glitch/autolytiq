/**
 * Insight Evaluator Engine
 *
 * Core evaluation logic with cooldown, TTL, and RBAC integration
 */

import { PrismaClient } from '@repo/db';
import { listRules } from '@repo/shared/insights';
import type { PredicateCtx, InsightRule, EvaluationContext } from '@repo/shared/insights';
import { executeQuery } from './fetchers';
import { buildEffectivePermissions, hasAnyPermission } from '@repo/shared/rbac';

const prisma = new PrismaClient();

const INSIGHTS_ENABLED = process.env.INSIGHTS_ENABLED === 'true';

/**
 * Check if rule is muted for user/tenant
 */
async function isRuleMuted(
  tenantId: string,
  userId: string | undefined,
  ruleKey: string
): Promise<boolean> {
  const mutes = await prisma.insightMute.findMany({
    where: {
      tenantId,
      ruleKey,
      OR: [{ userId: userId || null }, { userId: null }],
    },
  });

  const now = new Date();
  return mutes.some((mute) => !mute.until || mute.until > now);
}

/**
 * Check cooldown - don't re-fire rule within cooldown window
 */
async function isInCooldown(
  tenantId: string,
  userId: string | undefined,
  ruleKey: string,
  cooldownMinutes: number
): Promise<boolean> {
  const cooldownThreshold = new Date(Date.now() - cooldownMinutes * 60 * 1000);

  const recentItems = await prisma.insightQueue.count({
    where: {
      tenantId,
      userId: userId || undefined,
      ruleKey,
      createdAt: { gte: cooldownThreshold },
    },
  });

  return recentItems > 0;
}

/**
 * Evaluate a single rule
 */
export async function evaluateRule(
  rule: InsightRule,
  context: EvaluationContext
): Promise<{ matched: boolean; score?: number; message?: string; error?: string; executionTimeMs: number }> {
  const startTime = Date.now();

  try {
    // Check if muted
    if (await isRuleMuted(context.tenantId, context.userId, rule.key)) {
      return { matched: false, executionTimeMs: Date.now() - startTime };
    }

    // Check cooldown
    if (rule.cooldownMinutes && await isInCooldown(context.tenantId, context.userId, rule.key, rule.cooldownMinutes)) {
      return { matched: false, executionTimeMs: Date.now() - startTime };
    }

    // Build predicate context
    const predicateCtx: PredicateCtx = {
      tenantId: context.tenantId,
      userId: context.userId,
      role: context.role,
      now: context.now,
      fetch: async <T>(query: string, args?: any): Promise<T> => {
        return executeQuery<T>(query, args);
      },
    };

    // Evaluate condition
    const matched = await rule.when(predicateCtx);

    if (!matched) {
      return { matched: false, executionTimeMs: Date.now() - startTime };
    }

    // Compute score
    const score = rule.score ? await rule.score(predicateCtx) : 0.5;

    // Generate message
    const message = await rule.message(predicateCtx);

    return {
      matched: true,
      score,
      message,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      matched: false,
      error: error.message,
      executionTimeMs: Date.now() - startTime,
    };
  }
}

/**
 * Evaluate all rules for a user/role
 */
export async function evaluateRules(context: EvaluationContext): Promise<void> {
  if (!INSIGHTS_ENABLED) {
    return;
  }

  const rules = listRules();

  for (const rule of rules) {
    // Check if user has permission for this rule's audience
    const hasAccess =
      rule.audience.userIds?.includes(context.userId) ||
      rule.audience.roles.includes(context.role);

    if (!hasAccess) {
      continue;
    }

    const result = await evaluateRule(rule, context);

    if (result.matched && result.message) {
      // Calculate expiration
      const expiresAt = rule.ttlMinutes
        ? new Date(Date.now() + rule.ttlMinutes * 60 * 1000)
        : null;

      // Insert or update queue item
      await prisma.insightQueue.upsert({
        where: {
          // Composite key would be ideal, but we'll use create/update pattern
          id: 'temp', // This will be replaced by actual logic
        },
        create: {
          tenantId: context.tenantId,
          role: context.role,
          userId: rule.audience.userIds?.includes(context.userId) ? context.userId : undefined,
          ruleKey: rule.key,
          severity: rule.severity,
          score: result.score || 0.5,
          message: result.message,
          card: rule.card,
          state: 'new',
          expiresAt: expiresAt || undefined,
        },
        update: {
          score: result.score || 0.5,
          message: result.message,
          updatedAt: new Date(),
        },
      });
    }
  }
}

/**
 * Dry-run evaluation - returns results without writing to DB
 */
export async function dryRunEvaluation(context: EvaluationContext) {
  const rules = listRules();
  const results = [];

  for (const rule of rules) {
    const hasAccess =
      rule.audience.userIds?.includes(context.userId) ||
      rule.audience.roles.includes(context.role);

    if (!hasAccess) {
      continue;
    }

    const result = await evaluateRule(rule, context);
    results.push({
      ruleKey: rule.key,
      domain: rule.domain,
      severity: rule.severity,
      ...result,
    });
  }

  return results;
}

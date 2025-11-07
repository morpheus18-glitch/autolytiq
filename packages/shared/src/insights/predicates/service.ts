/**
 * Service-related predicates
 *
 * Composable helpers for service department conditions
 */

import type { PredicateCtx } from '../types.js';

interface ServiceRO {
  id: string;
  status: string;
  approvedAt?: Date;
  partsOrderedAt?: Date;
  createdAt: Date;
}

/**
 * Check if approved RO has no parts ordered
 * @param minutes - Age threshold since approval
 * @returns Predicate function
 */
export function roApprovedNoParts(minutes: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const ros = await ctx.fetch<ServiceRO[]>(
      `SELECT id, "approvedAt", "partsOrderedAt"
       FROM "ServiceRO"
       WHERE "tenantId" = $1
         AND status = 'approved'
         AND "approvedAt" IS NOT NULL
         AND "partsOrderedAt" IS NULL`,
      [ctx.tenantId]
    );

    return ros.some((ro) => {
      if (!ro.approvedAt) return false;
      const ageMs = ctx.now.getTime() - ro.approvedAt.getTime();
      return ageMs > minutes * 60 * 1000;
    });
  };
}

/**
 * Check if RO is awaiting customer approval for too long
 * @param minutes - Age threshold
 * @returns Predicate function
 */
export function roAwaitingCustomerApproval(minutes: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const ros = await ctx.fetch<any[]>(
      `SELECT id, "createdAt"
       FROM "ServiceRO"
       WHERE "tenantId" = $1
         AND status = 'awaiting_approval'
         AND "createdAt" < NOW() - INTERVAL '${minutes} minutes'`,
      [ctx.tenantId]
    );

    return ros.length > 0;
  };
}

/**
 * Check if RO parts are delayed
 * @param days - Days since parts ordered
 * @returns Predicate function
 */
export function partsDelayed(days: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const ros = await ctx.fetch<any[]>(
      `SELECT id, "partsOrderedAt"
       FROM "ServiceRO"
       WHERE "tenantId" = $1
         AND status = 'awaiting_parts'
         AND "partsOrderedAt" < NOW() - INTERVAL '${days} days'
         AND "partsReceivedAt" IS NULL`,
      [ctx.tenantId]
    );

    return ros.length > 0;
  };
}

/**
 * Check if vehicle ready but customer not notified
 * @param hours - Hours since completion
 * @returns Predicate function
 */
export function vehicleReadyNotNotified(hours: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const ros = await ctx.fetch<any[]>(
      `SELECT ro.id, ro."completedAt"
       FROM "ServiceRO" ro
       WHERE ro."tenantId" = $1
         AND ro.status = 'completed'
         AND ro."completedAt" < NOW() - INTERVAL '${hours} hours'
         AND NOT EXISTS (
           SELECT 1 FROM "Communication" c
           WHERE c."serviceROId" = ro.id
             AND c.type = 'ready_for_pickup'
         )`,
      [ctx.tenantId]
    );

    return ros.length > 0;
  };
}

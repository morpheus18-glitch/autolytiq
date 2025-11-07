/**
 * Deal-related predicates
 *
 * Composable helpers for deal workflow conditions
 */

import type { PredicateCtx } from '../types.js';
import { olderThan } from './time.js';

interface Deal {
  id: string;
  status: string;
  fiStatus?: string;
  fiSubmittedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Check if deal has pending F&I for too long
 * @param minutes - Threshold in minutes
 * @returns Predicate function
 */
export function pendingFIOver(minutes: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const deals = await ctx.fetch<Deal[]>(
      'SELECT id, "fiStatus", "fiSubmittedAt" FROM "Deal" WHERE "tenantId" = $1 AND "fiStatus" = $2',
      [ctx.tenantId, 'pending']
    );

    return deals.some((deal) => {
      if (!deal.fiSubmittedAt) return false;
      const ageMs = ctx.now.getTime() - deal.fiSubmittedAt.getTime();
      return ageMs > minutes * 60 * 1000;
    });
  };
}

/**
 * Check if deal is stuck in a specific status
 * @param status - Deal status to check
 * @param minutes - Age threshold
 * @returns Predicate function
 */
export function stuckInStatus(status: string, minutes: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const deals = await ctx.fetch<Deal[]>(
      'SELECT id, status, "updatedAt" FROM "Deal" WHERE "tenantId" = $1 AND status = $2',
      [ctx.tenantId, status]
    );

    return deals.some((deal) => {
      const ageMs = ctx.now.getTime() - deal.updatedAt.getTime();
      return ageMs > minutes * 60 * 1000;
    });
  };
}

/**
 * Check if deal has no activity for specified time
 * @param minutes - Inactivity threshold
 * @returns Predicate function
 */
export function noActivityFor(minutes: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const deals = await ctx.fetch<Deal[]>(
      `SELECT d.id, d."updatedAt",
        COALESCE(MAX(da."createdAt"), d."updatedAt") as "lastActivity"
       FROM "Deal" d
       LEFT JOIN "DealActivity" da ON da."dealId" = d.id
       WHERE d."tenantId" = $1 AND d.status != 'closed' AND d.status != 'cancelled'
       GROUP BY d.id, d."updatedAt"`,
      [ctx.tenantId]
    );

    return deals.some((deal: any) => {
      const lastActivity = deal.lastActivity || deal.updatedAt;
      const ageMs = ctx.now.getTime() - new Date(lastActivity).getTime();
      return ageMs > minutes * 60 * 1000;
    });
  };
}

/**
 * Check if deal is at risk (multiple warning signs)
 * @returns Predicate function
 */
export function dealAtRisk() {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    // Deal is at risk if:
    // - Credit app rejected + no follow-up > 24h
    // - Customer went dark (no contact > 48h)
    // - Competitor mentioned + no counter-offer

    const atRiskDeals = await ctx.fetch<any[]>(
      `SELECT d.id
       FROM "Deal" d
       LEFT JOIN "CreditApplication" ca ON ca."dealId" = d.id
       LEFT JOIN "Communication" c ON c."customerId" = d."customerId"
       WHERE d."tenantId" = $1
         AND d.status NOT IN ('closed', 'cancelled')
         AND (
           (ca.status = 'rejected' AND ca."updatedAt" < NOW() - INTERVAL '24 hours')
           OR (c."createdAt" < NOW() - INTERVAL '48 hours')
         )
       LIMIT 1`,
      [ctx.tenantId]
    );

    return atRiskDeals.length > 0;
  };
}

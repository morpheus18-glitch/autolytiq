/**
 * Lead-related predicates
 *
 * Composable helpers for lead management conditions
 */

import type { PredicateCtx } from '../types.js';

interface Lead {
  id: string;
  score?: number;
  status: string;
  createdAt: Date;
  lastContactAt?: Date;
}

/**
 * Check if high-scoring lead has not been contacted
 * @param hours - Age threshold in hours
 * @param minScore - Minimum lead score
 * @returns Predicate function
 */
export function leadNoContact(hours: number, minScore: number = 80) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const leads = await ctx.fetch<Lead[]>(
      `SELECT id, score, "lastContactAt", "createdAt"
       FROM "Lead"
       WHERE "tenantId" = $1
         AND status = 'new'
         AND score >= $2
         AND "lastContactAt" IS NULL`,
      [ctx.tenantId, minScore]
    );

    return leads.some((lead) => {
      const ageMs = ctx.now.getTime() - lead.createdAt.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      return ageHours > hours;
    });
  };
}

/**
 * Check if hot lead is cooling off (no contact in X hours)
 * @param hours - Inactivity threshold
 * @returns Predicate function
 */
export function hotLeadCooling(hours: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const leads = await ctx.fetch<Lead[]>(
      `SELECT id, score, "lastContactAt", "updatedAt"
       FROM "Lead"
       WHERE "tenantId" = $1
         AND status IN ('hot', 'engaged')
         AND score >= 70`,
      [ctx.tenantId]
    );

    return leads.some((lead) => {
      const lastContact = lead.lastContactAt || new Date(0);
      const ageMs = ctx.now.getTime() - lastContact.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      return ageHours > hours;
    });
  };
}

/**
 * Check if lead response is overdue
 * @param hours - Expected response window
 * @returns Predicate function
 */
export function leadResponseOverdue(hours: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    // Check for leads with last inbound communication but no outbound response
    const overdueLeads = await ctx.fetch<any[]>(
      `SELECT l.id, MAX(c."createdAt") as "lastInbound"
       FROM "Lead" l
       JOIN "Communication" c ON c."leadId" = l.id
       WHERE l."tenantId" = $1
         AND l.status NOT IN ('closed', 'disqualified')
         AND c.direction = 'inbound'
       GROUP BY l.id
       HAVING MAX(c."createdAt") < NOW() - INTERVAL '${hours} hours'
         AND NOT EXISTS (
           SELECT 1 FROM "Communication" c2
           WHERE c2."leadId" = l.id
             AND c2.direction = 'outbound'
             AND c2."createdAt" > MAX(c."createdAt")
         )`,
      [ctx.tenantId]
    );

    return overdueLeads.length > 0;
  };
}

/**
 * Check if lead has appointment scheduled but no confirmation
 * @param hours - Hours before appointment
 * @returns Predicate function
 */
export function appointmentUnconfirmed(hours: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const futureTime = new Date(ctx.now.getTime() + hours * 60 * 60 * 1000);

    const unconfirmed = await ctx.fetch<any[]>(
      `SELECT a.id
       FROM "Appointment" a
       JOIN "Lead" l ON l.id = a."leadId"
       WHERE a."tenantId" = $1
         AND a."scheduledAt" < $2
         AND a.status = 'scheduled'
         AND a."confirmedAt" IS NULL`,
      [ctx.tenantId, futureTime]
    );

    return unconfirmed.length > 0;
  };
}

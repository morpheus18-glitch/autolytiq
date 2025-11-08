/**
 * Time-based predicates
 *
 * Composable helpers for time-based conditions
 */

import type { PredicateCtx } from '../types.js';

/**
 * Check if a date is older than specified minutes
 * @param minutes - Age threshold
 * @param dateExpr - Function that extracts date from context
 * @returns Predicate function
 */
export function olderThan(
  minutes: number,
  dateExpr: (ctx: PredicateCtx) => Promise<Date | null>
) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const date = await dateExpr(ctx);
    if (!date) return false;

    const ageMs = ctx.now.getTime() - date.getTime();
    const ageMinutes = ageMs / (1000 * 60);
    return ageMinutes > minutes;
  };
}

/**
 * Check if a date is within specified minutes
 * @param minutes - Recency threshold
 * @param dateExpr - Function that extracts date from context
 * @returns Predicate function
 */
export function within(
  minutes: number,
  dateExpr: (ctx: PredicateCtx) => Promise<Date | null>
) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const date = await dateExpr(ctx);
    if (!date) return false;

    const ageMs = ctx.now.getTime() - date.getTime();
    const ageMinutes = ageMs / (1000 * 60);
    return ageMinutes <= minutes;
  };
}

/**
 * Check if time is between two timestamps
 * @param start - Start date extractor
 * @param end - End date extractor
 * @returns Predicate function
 */
export function between(
  start: (ctx: PredicateCtx) => Promise<Date | null>,
  end: (ctx: PredicateCtx) => Promise<Date | null>
) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const startDate = await start(ctx);
    const endDate = await end(ctx);
    if (!startDate || !endDate) return false;

    return ctx.now >= startDate && ctx.now <= endDate;
  };
}

/**
 * Get minutes elapsed since a date
 * @param date - Date to measure from
 * @param now - Current time
 * @returns Minutes elapsed
 */
export function minutesSince(date: Date, now: Date): number {
  const diffMs = now.getTime() - date.getTime();
  return diffMs / (1000 * 60);
}

/**
 * Get hours elapsed since a date
 * @param date - Date to measure from
 * @param now - Current time
 * @returns Hours elapsed
 */
export function hoursSince(date: Date, now: Date): number {
  return minutesSince(date, now) / 60;
}

/**
 * Get days elapsed since a date
 * @param date - Date to measure from
 * @param now - Current time
 * @returns Days elapsed
 */
export function daysSince(date: Date, now: Date): number {
  return hoursSince(date, now) / 24;
}

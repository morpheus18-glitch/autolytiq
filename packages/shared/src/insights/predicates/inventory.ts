/**
 * Inventory-related predicates
 *
 * Composable helpers for inventory management conditions
 */

import type { PredicateCtx } from '../types.js';

interface Vehicle {
  id: string;
  vin: string;
  status: string;
  daysInStock: number;
  cost: number;
  price: number;
}

/**
 * Check if inventory is aging beyond threshold
 * @param days - Days in stock threshold
 * @returns Predicate function
 */
export function agingOver(days: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const vehicles = await ctx.fetch<Vehicle[]>(
      `SELECT id, vin, "daysInStock"
       FROM "Vehicle"
       WHERE "tenantId" = $1
         AND status = 'available'
         AND "daysInStock" > $2`,
      [ctx.tenantId, days]
    );

    return vehicles.length > 0;
  };
}

/**
 * Check if vehicle price is below market (opportunity)
 * @param percentBelow - Percentage below market
 * @returns Predicate function
 */
export function pricedBelowMarket(percentBelow: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const vehicles = await ctx.fetch<any[]>(
      `SELECT v.id, v.price, v."marketValue"
       FROM "Vehicle" v
       WHERE v."tenantId" = $1
         AND v.status = 'available'
         AND v."marketValue" IS NOT NULL
         AND v.price < (v."marketValue" * (1 - $2))`,
      [ctx.tenantId, percentBelow / 100]
    );

    return vehicles.length > 0;
  };
}

/**
 * Check if vehicle needs reconditioning
 * @returns Predicate function
 */
export function needsReconditioning() {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const vehicles = await ctx.fetch<any[]>(
      `SELECT v.id
       FROM "Vehicle" v
       WHERE v."tenantId" = $1
         AND v.status = 'incoming'
         AND v."reconditioningStatus" = 'pending'
         AND v."arrivedAt" < NOW() - INTERVAL '48 hours'`,
      [ctx.tenantId]
    );

    return vehicles.length > 0;
  };
}

/**
 * Check if high-margin vehicles are available
 * @param minMargin - Minimum margin percentage
 * @returns Predicate function
 */
export function highMarginAvailable(minMargin: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const vehicles = await ctx.fetch<any[]>(
      `SELECT v.id, v.cost, v.price
       FROM "Vehicle" v
       WHERE v."tenantId" = $1
         AND v.status = 'available'
         AND v.price IS NOT NULL
         AND v.cost IS NOT NULL
         AND ((v.price - v.cost) / v.cost) > $2`,
      [ctx.tenantId, minMargin / 100]
    );

    return vehicles.length > 0;
  };
}

/**
 * Check if inventory levels are low for specific criteria
 * @param make - Vehicle make (optional)
 * @param threshold - Minimum count
 * @returns Predicate function
 */
export function lowInventory(make: string | null, threshold: number) {
  return async (ctx: PredicateCtx): Promise<boolean> => {
    const query = make
      ? `SELECT COUNT(*) as count FROM "Vehicle" WHERE "tenantId" = $1 AND status = 'available' AND make = $2`
      : `SELECT COUNT(*) as count FROM "Vehicle" WHERE "tenantId" = $1 AND status = 'available'`;

    const params = make ? [ctx.tenantId, make] : [ctx.tenantId];
    const result = await ctx.fetch<{ count: number }[]>(query, params);

    return result[0].count < threshold;
  };
}

/**
 * Insight Scoring Engine
 *
 * Provides scoring functions to prioritize insights based on:
 * - Severity weight
 * - Recency boost
 * - Role relevance
 * - Custom factors
 */

import type { InsightSeverity } from './types.js';

/**
 * Base severity weights (0..1)
 */
export const baseSeverityWeights: Record<InsightSeverity, number> = {
  info: 0.2,
  notice: 0.5,
  warning: 0.75,
  urgent: 1.0,
};

/**
 * Recency boost - newer insights score higher
 * @param minutes - Minutes since event
 * @returns Boost factor (0..1)
 */
export function recencyBoost(minutes: number): number {
  // Linear decay over 24 hours, min 0.5
  return Math.max(0.5, 1 - (minutes / 1440) * 0.5);
}

/**
 * Role relevance weights
 * @param role - User role
 * @returns Relevance weight (0..1)
 */
export function roleWeight(role: string): number {
  const weights: Record<string, number> = {
    sales: 1.0,
    fi: 1.0,
    service: 0.9,
    inventory: 0.9,
    accounting: 0.8,
    admin: 0.8,
    dev: 0.6,
  };
  return weights[role] ?? 0.8;
}

/**
 * Combine scoring factors
 * @param severityWeight - Base severity (0..1)
 * @param recency - Recency boost (0..1)
 * @param custom - Custom factor (0..1), defaults to 0.5
 * @param roleW - Role weight (0..1), defaults to 1.0
 * @returns Combined score (0..1)
 */
export function combine(
  severityWeight: number,
  recency: number,
  custom: number = 0.5,
  roleW: number = 1.0
): number {
  // Weighted average: 60% severity, 20% recency, 20% custom, scaled by role
  const baseScore = severityWeight * 0.6 + recency * 0.2 + custom * 0.2;
  return Math.min(1, baseScore * roleW);
}

/**
 * Default scorer for rules without custom scoring
 * @param severity - Insight severity
 * @param minutesSinceEvent - Minutes since triggering event
 * @param role - User role
 * @returns Score (0..1)
 */
export function defaultScore(
  severity: InsightSeverity,
  minutesSinceEvent: number,
  role: string
): number {
  return combine(
    baseSeverityWeights[severity],
    recencyBoost(minutesSinceEvent),
    0.5, // neutral custom factor
    roleWeight(role)
  );
}

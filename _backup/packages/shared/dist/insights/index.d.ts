export { A as AcknowledgeInsightRequest, n as AssignInsightRequest, C as ClaimInsightRequest, c as Insight, d as InsightAction, k as InsightFilterOptions, h as InsightPayload, b as InsightPriority, l as InsightSortBy, m as InsightSortOrder, a as InsightState, i as InsightStateTransitions, I as InsightType, f as InsightUserState, R as ResolveInsightRequest, S as SnoozeInsightRequest, o as calculateSnoozeUntil, r as getPriorityScore, p as isInsightExpired, q as isInsightSnoozed, j as isValidTransition } from '../insights-DN_WgXev.js';

/**
 * Insight DSL - Extended Type System
 *
 * Augments base insight types with rule evaluation DSL
 */

type InsightSeverity = 'info' | 'notice' | 'warning' | 'urgent';
type InsightDomain = 'sales' | 'fi' | 'inventory' | 'service' | 'accounting' | 'admin' | 'dev';
interface InsightAudience {
    roles: string[];
    userIds?: string[];
}
interface InsightSignal {
    key: string;
    at: string;
    tenantId: string;
    payload: Record<string, unknown>;
}
/**
 * Predicate context - provides data access and metadata
 */
interface PredicateCtx {
    tenantId: string;
    userId: string;
    role: string;
    now: Date;
    fetch: <T>(query: string, args?: any) => Promise<T>;
}
/**
 * Predicate - boolean condition evaluator
 */
type Predicate = (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Scorer - numeric score generator (0..1)
 */
type Scorer = (ctx: PredicateCtx) => Promise<number>;
/**
 * Message generator - dynamic message creation
 */
type MessageGenerator = (ctx: PredicateCtx) => Promise<string>;
/**
 * Insight Rule Definition
 */
interface InsightRule {
    id: string;
    key: string;
    domain: InsightDomain;
    audience: InsightAudience;
    when: Predicate;
    score?: Scorer;
    severity: InsightSeverity;
    message: MessageGenerator;
    card: {
        type: 'action' | 'alert' | 'summary';
        payload: Record<string, unknown>;
    };
    ttlMinutes?: number;
    cooldownMinutes?: number;
    tags?: string[];
}
/**
 * Insight Queue Item
 */
interface InsightItem {
    id: string;
    ruleKey: string;
    createdAt: string;
    expiresAt?: string;
    severity: InsightSeverity;
    score: number;
    message: string;
    card: {
        type: string;
        payload: any;
    };
    role: string;
    userId?: string;
    tenantId: string;
    state: 'new' | 'seen' | 'snoozed' | 'muted' | 'done';
    snoozeUntil?: string;
}
/**
 * Rule evaluation context
 */
interface EvaluationContext extends PredicateCtx {
    signal?: InsightSignal;
    metadata?: Record<string, unknown>;
}
/**
 * Dry-run evaluation result
 */
interface DryRunResult {
    ruleKey: string;
    matched: boolean;
    score?: number;
    message?: string;
    error?: string;
    executionTimeMs: number;
}

/**
 * Insight Scoring Engine
 *
 * Provides scoring functions to prioritize insights based on:
 * - Severity weight
 * - Recency boost
 * - Role relevance
 * - Custom factors
 */

/**
 * Base severity weights (0..1)
 */
declare const baseSeverityWeights: Record<InsightSeverity, number>;
/**
 * Recency boost - newer insights score higher
 * @param minutes - Minutes since event
 * @returns Boost factor (0..1)
 */
declare function recencyBoost(minutes: number): number;
/**
 * Role relevance weights
 * @param role - User role
 * @returns Relevance weight (0..1)
 */
declare function roleWeight(role: string): number;
/**
 * Combine scoring factors
 * @param severityWeight - Base severity (0..1)
 * @param recency - Recency boost (0..1)
 * @param custom - Custom factor (0..1), defaults to 0.5
 * @param roleW - Role weight (0..1), defaults to 1.0
 * @returns Combined score (0..1)
 */
declare function combine(severityWeight: number, recency: number, custom?: number, roleW?: number): number;
/**
 * Default scorer for rules without custom scoring
 * @param severity - Insight severity
 * @param minutesSinceEvent - Minutes since triggering event
 * @param role - User role
 * @returns Score (0..1)
 */
declare function defaultScore(severity: InsightSeverity, minutesSinceEvent: number, role: string): number;

/**
 * Insight Rule Registry
 *
 * Runtime rule registration and lookup
 */

/**
 * Register a new insight rule
 * @param rule - Rule definition
 */
declare function registerRule(rule: InsightRule): void;
/**
 * Register multiple rules at once
 * @param rules - Array of rule definitions
 */
declare function registerRules(rules: InsightRule[]): void;
/**
 * Get all registered rules
 * @returns Array of all rules
 */
declare function listRules(): InsightRule[];
/**
 * Get a specific rule by key
 * @param key - Rule key
 * @returns Rule definition or undefined
 */
declare function getRule(key: string): InsightRule | undefined;
/**
 * Check if a rule exists
 * @param key - Rule key
 * @returns True if rule is registered
 */
declare function hasRule(key: string): boolean;
/**
 * Remove a rule from registry
 * @param key - Rule key
 * @returns True if rule was removed
 */
declare function unregisterRule(key: string): boolean;
/**
 * Clear all rules (useful for testing)
 */
declare function clearRules(): void;
/**
 * Get rules filtered by domain
 * @param domain - Domain to filter by
 * @returns Array of rules in domain
 */
declare function getRulesByDomain(domain: string): InsightRule[];
/**
 * Get rules filtered by severity
 * @param severity - Severity to filter by
 * @returns Array of rules with severity
 */
declare function getRulesBySeverity(severity: string): InsightRule[];
/**
 * Get rules filtered by tag
 * @param tag - Tag to filter by
 * @returns Array of rules with tag
 */
declare function getRulesByTag(tag: string): InsightRule[];

/**
 * Time-based predicates
 *
 * Composable helpers for time-based conditions
 */

/**
 * Check if a date is older than specified minutes
 * @param minutes - Age threshold
 * @param dateExpr - Function that extracts date from context
 * @returns Predicate function
 */
declare function olderThan(minutes: number, dateExpr: (ctx: PredicateCtx) => Promise<Date | null>): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if a date is within specified minutes
 * @param minutes - Recency threshold
 * @param dateExpr - Function that extracts date from context
 * @returns Predicate function
 */
declare function within(minutes: number, dateExpr: (ctx: PredicateCtx) => Promise<Date | null>): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if time is between two timestamps
 * @param start - Start date extractor
 * @param end - End date extractor
 * @returns Predicate function
 */
declare function between(start: (ctx: PredicateCtx) => Promise<Date | null>, end: (ctx: PredicateCtx) => Promise<Date | null>): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Get minutes elapsed since a date
 * @param date - Date to measure from
 * @param now - Current time
 * @returns Minutes elapsed
 */
declare function minutesSince(date: Date, now: Date): number;
/**
 * Get hours elapsed since a date
 * @param date - Date to measure from
 * @param now - Current time
 * @returns Hours elapsed
 */
declare function hoursSince(date: Date, now: Date): number;
/**
 * Get days elapsed since a date
 * @param date - Date to measure from
 * @param now - Current time
 * @returns Days elapsed
 */
declare function daysSince(date: Date, now: Date): number;

/**
 * Deal-related predicates
 *
 * Composable helpers for deal workflow conditions
 */

/**
 * Check if deal has pending F&I for too long
 * @param minutes - Threshold in minutes
 * @returns Predicate function
 */
declare function pendingFIOver(minutes: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if deal is stuck in a specific status
 * @param status - Deal status to check
 * @param minutes - Age threshold
 * @returns Predicate function
 */
declare function stuckInStatus(status: string, minutes: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if deal has no activity for specified time
 * @param minutes - Inactivity threshold
 * @returns Predicate function
 */
declare function noActivityFor(minutes: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if deal is at risk (multiple warning signs)
 * @returns Predicate function
 */
declare function dealAtRisk(): (ctx: PredicateCtx) => Promise<boolean>;

/**
 * Lead-related predicates
 *
 * Composable helpers for lead management conditions
 */

/**
 * Check if high-scoring lead has not been contacted
 * @param hours - Age threshold in hours
 * @param minScore - Minimum lead score
 * @returns Predicate function
 */
declare function leadNoContact(hours: number, minScore?: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if hot lead is cooling off (no contact in X hours)
 * @param hours - Inactivity threshold
 * @returns Predicate function
 */
declare function hotLeadCooling(hours: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if lead response is overdue
 * @param hours - Expected response window
 * @returns Predicate function
 */
declare function leadResponseOverdue(hours: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if lead has appointment scheduled but no confirmation
 * @param hours - Hours before appointment
 * @returns Predicate function
 */
declare function appointmentUnconfirmed(hours: number): (ctx: PredicateCtx) => Promise<boolean>;

/**
 * Inventory-related predicates
 *
 * Composable helpers for inventory management conditions
 */

/**
 * Check if inventory is aging beyond threshold
 * @param days - Days in stock threshold
 * @returns Predicate function
 */
declare function agingOver(days: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if vehicle price is below market (opportunity)
 * @param percentBelow - Percentage below market
 * @returns Predicate function
 */
declare function pricedBelowMarket(percentBelow: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if vehicle needs reconditioning
 * @returns Predicate function
 */
declare function needsReconditioning(): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if high-margin vehicles are available
 * @param minMargin - Minimum margin percentage
 * @returns Predicate function
 */
declare function highMarginAvailable(minMargin: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if inventory levels are low for specific criteria
 * @param make - Vehicle make (optional)
 * @param threshold - Minimum count
 * @returns Predicate function
 */
declare function lowInventory(make: string | null, threshold: number): (ctx: PredicateCtx) => Promise<boolean>;

/**
 * Service-related predicates
 *
 * Composable helpers for service department conditions
 */

/**
 * Check if approved RO has no parts ordered
 * @param minutes - Age threshold since approval
 * @returns Predicate function
 */
declare function roApprovedNoParts(minutes: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if RO is awaiting customer approval for too long
 * @param minutes - Age threshold
 * @returns Predicate function
 */
declare function roAwaitingCustomerApproval(minutes: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if RO parts are delayed
 * @param days - Days since parts ordered
 * @returns Predicate function
 */
declare function partsDelayed(days: number): (ctx: PredicateCtx) => Promise<boolean>;
/**
 * Check if vehicle ready but customer not notified
 * @param hours - Hours since completion
 * @returns Predicate function
 */
declare function vehicleReadyNotNotified(hours: number): (ctx: PredicateCtx) => Promise<boolean>;

export { type DryRunResult, type EvaluationContext, type InsightAudience, type InsightDomain, type InsightItem, type InsightRule, type InsightSeverity, type InsightSignal, type MessageGenerator, type Predicate, type PredicateCtx, type Scorer, agingOver, appointmentUnconfirmed, baseSeverityWeights, between, clearRules, combine, daysSince, dealAtRisk, defaultScore, getRule, getRulesByDomain, getRulesBySeverity, getRulesByTag, hasRule, highMarginAvailable, hotLeadCooling, hoursSince, leadNoContact, leadResponseOverdue, listRules, lowInventory, minutesSince, needsReconditioning, noActivityFor, olderThan, partsDelayed, pendingFIOver, pricedBelowMarket, recencyBoost, registerRule, registerRules, roApprovedNoParts, roAwaitingCustomerApproval, roleWeight, stuckInStatus, unregisterRule, vehicleReadyNotNotified, within };

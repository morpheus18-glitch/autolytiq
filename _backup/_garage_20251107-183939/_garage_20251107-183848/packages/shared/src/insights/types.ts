/**
 * Insight DSL - Extended Type System
 *
 * Augments base insight types with rule evaluation DSL
 */

// Re-export base types from parent
export * from '../insights.js';

// DSL-specific types
export type InsightSeverity = 'info' | 'notice' | 'warning' | 'urgent';
export type InsightDomain = 'sales' | 'fi' | 'inventory' | 'service' | 'accounting' | 'admin' | 'dev';

export interface InsightAudience {
  roles: string[];
  userIds?: string[];
}

export interface InsightSignal {
  key: string;
  at: string;
  tenantId: string;
  payload: Record<string, unknown>;
}

/**
 * Predicate context - provides data access and metadata
 */
export interface PredicateCtx {
  tenantId: string;
  userId: string;
  role: string;
  now: Date;
  fetch: <T>(query: string, args?: any) => Promise<T>;
}

/**
 * Predicate - boolean condition evaluator
 */
export type Predicate = (ctx: PredicateCtx) => Promise<boolean>;

/**
 * Scorer - numeric score generator (0..1)
 */
export type Scorer = (ctx: PredicateCtx) => Promise<number>;

/**
 * Message generator - dynamic message creation
 */
export type MessageGenerator = (ctx: PredicateCtx) => Promise<string>;

/**
 * Insight Rule Definition
 */
export interface InsightRule {
  id: string;
  key: string; // e.g. "deal.pendingFI.tooLong"
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
export interface InsightItem {
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
export interface EvaluationContext extends PredicateCtx {
  signal?: InsightSignal;
  metadata?: Record<string, unknown>;
}

/**
 * Dry-run evaluation result
 */
export interface DryRunResult {
  ruleKey: string;
  matched: boolean;
  score?: number;
  message?: string;
  error?: string;
  executionTimeMs: number;
}

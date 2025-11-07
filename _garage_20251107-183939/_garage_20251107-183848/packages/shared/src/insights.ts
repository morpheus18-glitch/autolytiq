/**
 * Insight State Engine
 *
 * System for generating, routing, and managing actionable insights.
 * Insights can be delivered to:
 * - Roles (shared inbox)
 * - Specific users (direct assignment)
 *
 * State machine: new → ack/snooze/claim → resolved
 */

export type InsightType =
  | 'deal_stalled'
  | 'deal_at_risk'
  | 'hot_lead_cooling'
  | 'lead_response_overdue'
  | 'appointment_no_show'
  | 'customer_ready_to_buy'
  | 'inventory_aging'
  | 'price_opportunity'
  | 'funding_delayed'
  | 'title_pending'
  | 'service_overdue'
  | 'follow_up_required'
  | 'payment_plan_expiring'
  | 'credit_app_pending'
  | 'trade_appraisal_needed';

export type InsightState =
  | 'new'        // Just created, not yet acknowledged
  | 'ack'        // Acknowledged but not claimed
  | 'snoozed'    // Deferred until later
  | 'claimed'    // Assigned to specific user
  | 'resolved';  // Completed

export type InsightPriority =
  | 'critical'   // Immediate action required
  | 'high'       // Action needed today
  | 'normal'     // Action needed this week
  | 'low';       // FYI, no urgency

/**
 * Insight - The core insight record
 */
export interface Insight {
  id: string;
  tenantId: string;
  type: InsightType;
  priority: InsightPriority;

  /**
   * Payload contains context-specific data
   * e.g., dealId, customerId, leadId, vehicleId, etc.
   */
  payload: Record<string, any>;

  /**
   * Human-readable title and message
   */
  title: string;
  message: string;

  /**
   * Suggested actions
   */
  actions: InsightAction[];

  /**
   * Metadata for routing and filtering
   */
  tags: string[];

  /**
   * Timestamps
   */
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * InsightAction - Suggested action with handler
 */
export interface InsightAction {
  label: string;
  actionType: 'navigate' | 'api_call' | 'modal' | 'external';

  /**
   * Action-specific payload
   * - navigate: { path: "/deals/123" }
   * - api_call: { method: "POST", url: "/api/deals/123/call" }
   * - modal: { component: "SendTextModal", props: {...} }
   * - external: { url: "tel:+1234567890" }
   */
  payload: Record<string, any>;

  /**
   * Visual styling
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

/**
 * InsightAudience - Who should see this insight
 */
export interface InsightAudience {
  insightId: string;

  /**
   * Roles that should see this (shared inbox)
   */
  roleIds: string[];

  /**
   * Specific users (direct assignment)
   * If specified, roles are ignored
   */
  userIds: string[];
}

/**
 * InsightState - Per-user state tracking
 */
export interface InsightUserState {
  id: string;
  insightId: string;

  /**
   * User or role this state belongs to
   * If roleId is set, this is a shared state for the role
   * If userId is set, this is a personal state
   */
  userId?: string;
  roleId?: string;

  /**
   * Current state
   */
  state: InsightState;

  /**
   * Snooze until timestamp
   */
  snoozeUntil?: Date;

  /**
   * Snooze reason
   */
  snoozeReason?: string;

  /**
   * User who claimed this insight
   */
  claimedBy?: string;
  claimedAt?: Date;

  /**
   * Resolution details
   */
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNote?: string;

  /**
   * Audit trail
   */
  updatedAt: Date;
}

/**
 * InsightRule - Rule definition for generating insights
 */
export interface InsightRule {
  id: string;
  type: InsightType;
  enabled: boolean;

  /**
   * Rule condition evaluator
   * Returns true if insight should be generated
   */
  condition: (context: any) => boolean | Promise<boolean>;

  /**
   * Compute insight payload
   */
  compute: (context: any) => InsightPayload | Promise<InsightPayload>;

  /**
   * Audience targeting
   */
  audience: {
    roles?: string[];
    userIds?: string[];
    /**
     * Dynamic audience function
     * e.g., "assign to deal owner"
     */
    dynamic?: (context: any) => { roles?: string[]; userIds?: string[] };
  };

  /**
   * Rate limiting
   * Don't generate more than X insights per user per time period
   */
  rateLimit?: {
    maxPerUser: number;
    windowMs: number;
  };
}

/**
 * InsightPayload - Computed insight data
 */
export interface InsightPayload {
  priority: InsightPriority;
  title: string;
  message: string;
  actions: InsightAction[];
  payload: Record<string, any>;
  tags?: string[];
  expiresAt?: Date;
}

/**
 * State transition validators
 */
export const InsightStateTransitions: Record<InsightState, InsightState[]> = {
  new: ['ack', 'snoozed', 'claimed', 'resolved'],
  ack: ['snoozed', 'claimed', 'resolved'],
  snoozed: ['new', 'ack', 'claimed', 'resolved'],
  claimed: ['resolved'],
  resolved: [], // Terminal state
};

/**
 * Check if state transition is valid
 */
export function isValidTransition(from: InsightState, to: InsightState): boolean {
  return InsightStateTransitions[from].includes(to);
}

/**
 * Insight filter options
 */
export interface InsightFilterOptions {
  types?: InsightType[];
  states?: InsightState[];
  priorities?: InsightPriority[];
  tags?: string[];
  assignedToMe?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Insight sort options
 */
export type InsightSortBy =
  | 'createdAt'
  | 'priority'
  | 'expiresAt'
  | 'updatedAt';

export type InsightSortOrder = 'asc' | 'desc';

/**
 * Insight API request types
 */
export interface AcknowledgeInsightRequest {
  insightId: string;
}

export interface SnoozeInsightRequest {
  insightId: string;
  duration: number; // milliseconds
  reason?: string;
}

export interface ClaimInsightRequest {
  insightId: string;
}

export interface AssignInsightRequest {
  insightId: string;
  userId: string;
}

export interface ResolveInsightRequest {
  insightId: string;
  note?: string;
}

/**
 * Helper: Calculate snooze until timestamp
 */
export function calculateSnoozeUntil(durationMs: number): Date {
  return new Date(Date.now() + durationMs);
}

/**
 * Helper: Check if insight is expired
 */
export function isInsightExpired(insight: Insight): boolean {
  if (!insight.expiresAt) return false;
  return new Date() > insight.expiresAt;
}

/**
 * Helper: Check if insight is snoozed
 */
export function isInsightSnoozed(state: InsightUserState): boolean {
  if (state.state !== 'snoozed') return false;
  if (!state.snoozeUntil) return false;
  return new Date() < state.snoozeUntil;
}

/**
 * Helper: Get priority score (for sorting)
 */
export function getPriorityScore(priority: InsightPriority): number {
  const scores: Record<InsightPriority, number> = {
    critical: 4,
    high: 3,
    normal: 2,
    low: 1,
  };
  return scores[priority];
}

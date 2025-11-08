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
type InsightType = 'deal_stalled' | 'deal_at_risk' | 'hot_lead_cooling' | 'lead_response_overdue' | 'appointment_no_show' | 'customer_ready_to_buy' | 'inventory_aging' | 'price_opportunity' | 'funding_delayed' | 'title_pending' | 'service_overdue' | 'follow_up_required' | 'payment_plan_expiring' | 'credit_app_pending' | 'trade_appraisal_needed';
type InsightState = 'new' | 'ack' | 'snoozed' | 'claimed' | 'resolved';
type InsightPriority = 'critical' | 'high' | 'normal' | 'low';
/**
 * Insight - The core insight record
 */
interface Insight {
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
interface InsightAction {
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
interface InsightAudience {
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
interface InsightUserState {
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
interface InsightRule {
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
        dynamic?: (context: any) => {
            roles?: string[];
            userIds?: string[];
        };
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
interface InsightPayload {
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
declare const InsightStateTransitions: Record<InsightState, InsightState[]>;
/**
 * Check if state transition is valid
 */
declare function isValidTransition(from: InsightState, to: InsightState): boolean;
/**
 * Insight filter options
 */
interface InsightFilterOptions {
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
type InsightSortBy = 'createdAt' | 'priority' | 'expiresAt' | 'updatedAt';
type InsightSortOrder = 'asc' | 'desc';
/**
 * Insight API request types
 */
interface AcknowledgeInsightRequest {
    insightId: string;
}
interface SnoozeInsightRequest {
    insightId: string;
    duration: number;
    reason?: string;
}
interface ClaimInsightRequest {
    insightId: string;
}
interface AssignInsightRequest {
    insightId: string;
    userId: string;
}
interface ResolveInsightRequest {
    insightId: string;
    note?: string;
}
/**
 * Helper: Calculate snooze until timestamp
 */
declare function calculateSnoozeUntil(durationMs: number): Date;
/**
 * Helper: Check if insight is expired
 */
declare function isInsightExpired(insight: Insight): boolean;
/**
 * Helper: Check if insight is snoozed
 */
declare function isInsightSnoozed(state: InsightUserState): boolean;
/**
 * Helper: Get priority score (for sorting)
 */
declare function getPriorityScore(priority: InsightPriority): number;

export { type AcknowledgeInsightRequest as A, type ClaimInsightRequest as C, type InsightType as I, type ResolveInsightRequest as R, type SnoozeInsightRequest as S, type InsightState as a, type InsightPriority as b, type Insight as c, type InsightAction as d, type InsightAudience as e, type InsightUserState as f, type InsightRule as g, type InsightPayload as h, InsightStateTransitions as i, isValidTransition as j, type InsightFilterOptions as k, type InsightSortBy as l, type InsightSortOrder as m, type AssignInsightRequest as n, calculateSnoozeUntil as o, isInsightExpired as p, isInsightSnoozed as q, getPriorityScore as r };

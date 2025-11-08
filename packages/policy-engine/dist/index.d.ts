/**
 * Policy Rules - Core Types
 *
 * Defines PolicyRule, Scope, FieldMask, and ABAC conditions
 */
type Scope = 'deal:view' | 'deal:create' | 'deal:edit' | 'deal:delete' | 'deal:cost.view' | 'deal:profit.view' | 'deal:margin.view' | 'deal:desk' | 'deal:approve' | 'deal:fi.view' | 'customer:view' | 'customer:edit' | 'customer:delete' | 'pii:view' | 'pii:edit' | 'pii:export' | 'credit:view' | 'credit:pull' | 'title:view' | 'title:status.view' | 'title:docs.upload' | 'title:lien.manage' | 'service:ro.view' | 'service:ro.create' | 'service:ro.close' | 'service:parts.view' | 'service:labor.edit' | 'inventory:view' | 'inventory:cost.view' | 'inventory:price.edit' | 'inventory:age.view' | 'inventory:acquire' | 'accounting:gl.view' | 'accounting:ap.view' | 'accounting:ar.view' | 'finance:profit.view' | 'finance:cost.view' | 'finance:reports.export' | 'analytics:view' | 'analytics:team.view' | 'analytics:store.view' | 'admin:users.manage' | 'admin:roles.manage' | 'admin:settings.edit' | 'admin:audit.view' | 'admin:system.health';
type FieldMaskAction = 'hide' | 'redact' | 'mask';
interface FieldMask {
    /** JSON path to field (e.g. "deal.cost", "customer.ssn") */
    path: string;
    /** Action to take */
    action: FieldMaskAction;
    /** Replacement value for redact/mask (e.g. "***-**-1234") */
    replacement?: string;
}
interface AbacCondition {
    /** Type of condition */
    type: 'owner' | 'team' | 'store' | 'timeWindow' | 'stateMatch' | 'custom';
    /** Condition parameters */
    params: Record<string, any>;
}
interface PolicyRule {
    /** Unique rule ID */
    id: string;
    /** Rule name */
    name: string;
    /** Which level this rule applies at */
    level: 'global' | 'tenant' | 'role' | 'team' | 'user';
    /** Tenant ID (null for global) */
    tenantId?: string | null;
    /** Role ID (null for non-role rules) */
    roleId?: string | null;
    /** Team ID (null for non-team rules) */
    teamId?: string | null;
    /** User ID (null for non-user rules) */
    userId?: string | null;
    /** Effect: allow or deny (denies override allows) */
    effect: 'allow' | 'deny';
    /** Scopes this rule grants/denies */
    scopes: Scope[];
    /** Field masks to apply */
    fieldMasks?: FieldMask[];
    /** ABAC conditions (rule only applies if ALL conditions met) */
    conditions?: AbacCondition[];
    /** Priority (higher = evaluated first; default: 0) */
    priority?: number;
    /** Enabled flag */
    enabled?: boolean;
}
/**
 * Default global rules (safety defaults)
 */
declare const DEFAULT_GLOBAL_RULES: PolicyRule[];
/**
 * Default role rules
 */
declare const DEFAULT_ROLE_RULES: Record<string, PolicyRule>;

/**
 * Policy Evaluation Engine
 *
 * Resolves tenant→role→user rules into PolicyDecision
 * Priority: denies override allows
 */

interface PolicyContext {
    /** Tenant ID */
    tenantId: string;
    /** User ID */
    userId: string;
    /** User's role IDs */
    roleIds: string[];
    /** User's team ID (optional) */
    teamId?: string;
    /** Resource being accessed (for ABAC) */
    resource?: {
        type: string;
        id: string;
        ownerId?: string;
        teamId?: string;
        state?: string;
        metadata?: Record<string, any>;
    };
    /** Current timestamp */
    now?: Date;
}
interface PolicyDecision {
    /** Allowed scopes */
    scopes: Set<Scope>;
    /** Denied scopes (takes precedence) */
    denials: Set<Scope>;
    /** Field masks to apply */
    fieldMasks: FieldMask[];
    /** Guard map (for view composition) */
    guards: Record<string, boolean>;
    /** Metadata about decision */
    metadata: {
        rulesApplied: string[];
        timestamp: string;
    };
}
/**
 * Evaluate ABAC condition
 */
declare function evaluateCondition(condition: AbacCondition, ctx: PolicyContext): boolean;
/**
 * Check if rule applies to context
 */
declare function ruleApplies(rule: PolicyRule, ctx: PolicyContext): boolean;
/**
 * Evaluate policy rules and produce decision
 *
 * Resolution order (denies override allows):
 * 1. Sort rules by priority (highest first)
 * 2. Apply user rules
 * 3. Apply team rules
 * 4. Apply role rules
 * 5. Apply tenant rules
 * 6. Apply global rules
 * 7. Denials take absolute priority over allows
 */
declare function evaluate(rules: PolicyRule[], ctx: PolicyContext): PolicyDecision;
/**
 * Derive atomic guards from scopes for view composition
 */
declare function deriveGuards(decision: PolicyDecision): Record<string, boolean>;
/**
 * Check if specific scope is allowed
 */
declare function canAccess(decision: PolicyDecision, scope: Scope): boolean;
/**
 * Get all denied scopes
 */
declare function getDenials(decision: PolicyDecision): Scope[];
/**
 * Get all allowed scopes
 */
declare function getAllowedScopes(decision: PolicyDecision): Scope[];

/**
 * Apply Masks - Field-Level Data Masking
 *
 * Applies field masks (hide/redact/mask) to payload objects
 */

/**
 * Apply field masks to a payload object
 *
 * Mutates the object in-place for performance.
 * Clone before calling if you need to preserve original.
 */
declare function applyMasks<T extends Record<string, any>>(payload: T, masks: FieldMask[]): T;
/**
 * Apply a single field mask
 */
declare function applyMask<T extends Record<string, any>>(payload: T, mask: FieldMask): void;
/**
 * Get value at JSON path
 */
declare function getPath(obj: any, path: string): any;
/**
 * Set value at JSON path
 */
declare function setPath(obj: any, path: string, value: any): void;
/**
 * Delete value at JSON path
 */
declare function deletePath(obj: any, path: string): void;
/**
 * Mask a value using replacement pattern
 *
 * Patterns:
 * - "***-**-####" keeps last 4 chars (SSN: 123-45-6789 → ***-**-6789)
 * - "****####" keeps last 4 chars (License: ABC12345 → ****2345)
 * - "**** **** **** ####" keeps last 4 chars (Card: 1234 5678 9012 3456 → **** **** **** 3456)
 */
declare function maskValue(value: any, pattern?: string): string;
/**
 * Clone object deeply (for immutable masking)
 */
declare function deepClone<T>(obj: T): T;
/**
 * Apply masks immutably (returns new object)
 */
declare function applyMasksImmutable<T extends Record<string, any>>(payload: T, masks: FieldMask[]): T;
/**
 * Mask multiple payloads (batch operation)
 */
declare function applyMasksBatch<T extends Record<string, any>>(payloads: T[], masks: FieldMask[]): T[];
/**
 * Common mask patterns
 */
declare const MaskPatterns: {
    readonly SSN: "***-**-####";
    readonly PHONE: "(***) ***-####";
    readonly EMAIL: "*****@*****.***";
    readonly CARD: "**** **** **** ####";
    readonly LICENSE: "****####";
    readonly ACCOUNT: "****####";
    readonly ROUTING: "****####";
    readonly FULL_REDACT: "[REDACTED]";
    readonly PARTIAL_NAME: "**** ####";
};

/**
 * Policy Registry - Load and Merge Rules
 *
 * Loads rules from defaults + tenant config
 * Supports customization cascade
 */

interface PolicyRegistry {
    /** All registered rules */
    rules: Map<string, PolicyRule>;
    /** Last updated timestamp */
    lastUpdated: Date;
}
/**
 * Initialize registry with defaults
 */
declare function initRegistry(): void;
/**
 * Load rules from external source (database, config file, etc.)
 */
declare function loadRules(rules: PolicyRule[]): void;
/**
 * Add or update a single rule
 */
declare function upsertRule(rule: PolicyRule): void;
/**
 * Remove a rule
 */
declare function deleteRule(ruleId: string): void;
/**
 * Get all rules
 */
declare function getAllRules(): PolicyRule[];
/**
 * Get rules for specific context
 */
declare function getRulesForContext(filter: {
    tenantId?: string;
    roleIds?: string[];
    userId?: string;
    teamId?: string;
}): PolicyRule[];
/**
 * Get a specific rule by ID
 */
declare function getRule(ruleId: string): PolicyRule | undefined;
/**
 * Clear all rules (use with caution)
 */
declare function clearRegistry(): void;
/**
 * Get registry metadata
 */
declare function getRegistryInfo(): {
    ruleCount: number;
    lastUpdated: Date;
    rulesByLevel: Record<string, number>;
};

export { type AbacCondition, DEFAULT_GLOBAL_RULES, DEFAULT_ROLE_RULES, type FieldMask, type FieldMaskAction, MaskPatterns, type PolicyContext, type PolicyDecision, type PolicyRegistry, type PolicyRule, type Scope, applyMask, applyMasks, applyMasksBatch, applyMasksImmutable, canAccess, clearRegistry, deepClone, deletePath, deleteRule, deriveGuards, evaluate, evaluateCondition, getAllRules, getAllowedScopes, getDenials, getPath, getRegistryInfo, getRule, getRulesForContext, initRegistry, loadRules, maskValue, ruleApplies, setPath, upsertRule };

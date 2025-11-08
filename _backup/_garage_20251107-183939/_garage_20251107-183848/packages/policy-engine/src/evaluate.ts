/**
 * Policy Evaluation Engine
 *
 * Resolves tenant→role→user rules into PolicyDecision
 * Priority: denies override allows
 */

import type { PolicyRule, Scope, FieldMask, AbacCondition } from './rules.js';

export interface PolicyContext {
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

export interface PolicyDecision {
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
export function evaluateCondition(
  condition: AbacCondition,
  ctx: PolicyContext
): boolean {
  switch (condition.type) {
    case 'owner':
      // User must be the owner of the resource
      return ctx.resource?.ownerId === ctx.userId;
      
    case 'team':
      // User must be in the same team as the resource
      return ctx.resource?.teamId === ctx.teamId;
      
    case 'store':
      // User must be in specific store
      return condition.params.storeId === ctx.resource?.metadata?.storeId;
      
    case 'timeWindow':
      // Must be within time window
      const now = ctx.now || new Date();
      const start = new Date(condition.params.start);
      const end = new Date(condition.params.end);
      return now >= start && now <= end;
      
    case 'stateMatch':
      // Resource must be in specific state
      return condition.params.states.includes(ctx.resource?.state);
      
    case 'custom':
      // Custom condition (evaluated server-side)
      // For safety, return false if not explicitly handled
      console.warn(`Custom condition not evaluated: ${JSON.stringify(condition)}`);
      return false;
      
    default:
      console.warn(`Unknown condition type: ${(condition as any).type}`);
      return false;
  }
}

/**
 * Check if rule applies to context
 */
export function ruleApplies(rule: PolicyRule, ctx: PolicyContext): boolean {
  if (!rule.enabled) return false;
  
  // Level-based filtering
  if (rule.level === 'user' && rule.userId !== ctx.userId) return false;
  if (rule.level === 'team' && rule.teamId !== ctx.teamId) return false;
  if (rule.level === 'role' && !ctx.roleIds.includes(rule.roleId!)) return false;
  if (rule.level === 'tenant' && rule.tenantId !== ctx.tenantId) return false;
  
  // ABAC conditions (ALL must be satisfied)
  if (rule.conditions && rule.conditions.length > 0) {
    return rule.conditions.every(cond => evaluateCondition(cond, ctx));
  }
  
  return true;
}

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
export function evaluate(
  rules: PolicyRule[],
  ctx: PolicyContext
): PolicyDecision {
  const decision: PolicyDecision = {
    scopes: new Set(),
    denials: new Set(),
    fieldMasks: [],
    guards: {},
    metadata: {
      rulesApplied: [],
      timestamp: new Date().toISOString(),
    },
  };
  
  // Filter applicable rules and sort by priority (highest first)
  const applicable = rules
    .filter(r => ruleApplies(r, ctx))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  // Collect allows and denies
  for (const rule of applicable) {
    decision.metadata.rulesApplied.push(rule.id);
    
    if (rule.effect === 'allow') {
      // Add scopes
      rule.scopes.forEach(scope => decision.scopes.add(scope));
      
      // Collect field masks
      if (rule.fieldMasks) {
        decision.fieldMasks.push(...rule.fieldMasks);
      }
    } else if (rule.effect === 'deny') {
      // Add to denials
      rule.scopes.forEach(scope => decision.denials.add(scope));
      
      // Remove from scopes if previously allowed
      rule.scopes.forEach(scope => decision.scopes.delete(scope));
    }
  }
  
  // Remove denials from scopes (safety check)
  decision.denials.forEach(scope => decision.scopes.delete(scope));
  
  // Derive guards from scopes
  decision.guards = deriveGuards(decision);
  
  return decision;
}

/**
 * Derive atomic guards from scopes for view composition
 */
export function deriveGuards(decision: PolicyDecision): Record<string, boolean> {
  const guards: Record<string, boolean> = {};
  
  // Helper to check if scope is allowed
  const can = (scope: Scope): boolean => {
    return decision.scopes.has(scope) && !decision.denials.has(scope);
  };
  
  // Deal guards
  guards['deal.view'] = can('deal:view');
  guards['deal.create'] = can('deal:create');
  guards['deal.edit'] = can('deal:edit');
  guards['deal.delete'] = can('deal:delete');
  guards['deal.approve'] = can('deal:approve');
  guards['deal.desk'] = can('deal:desk');
  guards['deal.cost.view'] = can('deal:cost.view');
  guards['deal.profit.view'] = can('deal:profit.view');
  guards['deal.margin.view'] = can('deal:margin.view');
  guards['deal.fi.view'] = can('deal:fi.view');
  
  // Customer/PII guards
  guards['customer.view'] = can('customer:view');
  guards['customer.edit'] = can('customer:edit');
  guards['pii.view'] = can('pii:view');
  guards['pii.edit'] = can('pii:edit');
  guards['pii.export'] = can('pii:export');
  guards['credit.view'] = can('credit:view');
  guards['credit.pull'] = can('credit:pull');
  
  // Title guards
  guards['title.view'] = can('title:view');
  guards['title.status.view'] = can('title:status.view');
  guards['title.docs.upload'] = can('title:docs.upload');
  
  // Service guards
  guards['service.ro.view'] = can('service:ro.view');
  guards['service.ro.create'] = can('service:ro.create');
  guards['service.ro.close'] = can('service:ro.close');
  
  // Inventory guards
  guards['inventory.view'] = can('inventory:view');
  guards['inventory.cost.view'] = can('inventory:cost.view');
  guards['inventory.price.edit'] = can('inventory:price.edit');
  
  // Accounting guards
  guards['accounting.gl.view'] = can('accounting:gl.view');
  guards['accounting.ap.view'] = can('accounting:ap.view');
  guards['accounting.ar.view'] = can('accounting:ar.view');
  
  // Finance guards (commonly used in view composition)
  guards['fi.profit.view'] = can('finance:profit.view');
  guards['fi.cost.view'] = can('finance:cost.view');
  guards['fi.reports.export'] = can('finance:reports.export');
  
  // Analytics guards
  guards['analytics.view'] = can('analytics:view');
  guards['analytics.team.view'] = can('analytics:team.view');
  guards['analytics.store.view'] = can('analytics:store.view');
  
  // Admin guards
  guards['admin.users.manage'] = can('admin:users.manage');
  guards['admin.roles.manage'] = can('admin:roles.manage');
  guards['admin.settings.edit'] = can('admin:settings.edit');
  guards['admin.audit.view'] = can('admin:audit.view');
  guards['admin.system.health'] = can('admin:system.health');
  
  return guards;
}

/**
 * Check if specific scope is allowed
 */
export function canAccess(decision: PolicyDecision, scope: Scope): boolean {
  return decision.scopes.has(scope) && !decision.denials.has(scope);
}

/**
 * Get all denied scopes
 */
export function getDenials(decision: PolicyDecision): Scope[] {
  return Array.from(decision.denials);
}

/**
 * Get all allowed scopes
 */
export function getAllowedScopes(decision: PolicyDecision): Scope[] {
  return Array.from(decision.scopes);
}

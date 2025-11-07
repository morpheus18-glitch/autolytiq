/**
 * Policy Rules - Core Types
 *
 * Defines PolicyRule, Scope, FieldMask, and ABAC conditions
 */

export type Scope = 
  // Deal scopes
  | 'deal:view' | 'deal:create' | 'deal:edit' | 'deal:delete'
  | 'deal:cost.view' | 'deal:profit.view' | 'deal:margin.view'
  | 'deal:desk' | 'deal:approve' | 'deal:fi.view'
  
  // Customer/PII scopes
  | 'customer:view' | 'customer:edit' | 'customer:delete'
  | 'pii:view' | 'pii:edit' | 'pii:export'
  | 'credit:view' | 'credit:pull'
  
  // Title scopes
  | 'title:view' | 'title:status.view' | 'title:docs.upload'
  | 'title:lien.manage'
  
  // Service/RO scopes
  | 'service:ro.view' | 'service:ro.create' | 'service:ro.close'
  | 'service:parts.view' | 'service:labor.edit'
  
  // Inventory scopes
  | 'inventory:view' | 'inventory:cost.view' | 'inventory:price.edit'
  | 'inventory:age.view' | 'inventory:acquire'
  
  // Accounting/Finance scopes
  | 'accounting:gl.view' | 'accounting:ap.view' | 'accounting:ar.view'
  | 'finance:profit.view' | 'finance:cost.view' | 'finance:reports.export'
  
  // Analytics scopes
  | 'analytics:view' | 'analytics:team.view' | 'analytics:store.view'
  
  // Admin scopes
  | 'admin:users.manage' | 'admin:roles.manage' | 'admin:settings.edit'
  | 'admin:audit.view' | 'admin:system.health';

export type FieldMaskAction = 'hide' | 'redact' | 'mask';

export interface FieldMask {
  /** JSON path to field (e.g. "deal.cost", "customer.ssn") */
  path: string;
  /** Action to take */
  action: FieldMaskAction;
  /** Replacement value for redact/mask (e.g. "***-**-1234") */
  replacement?: string;
}

export interface AbacCondition {
  /** Type of condition */
  type: 'owner' | 'team' | 'store' | 'timeWindow' | 'stateMatch' | 'custom';
  /** Condition parameters */
  params: Record<string, any>;
}

export interface PolicyRule {
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
export const DEFAULT_GLOBAL_RULES: PolicyRule[] = [
  {
    id: 'global-deny-sensitive',
    name: 'Global: Deny Sensitive Scopes',
    level: 'global',
    effect: 'deny',
    scopes: ['pii:export', 'admin:system.health', 'credit:pull'],
    priority: 1000,
    enabled: true,
  },
  {
    id: 'global-mask-pii',
    name: 'Global: Mask PII by Default',
    level: 'global',
    effect: 'allow',
    scopes: [],
    fieldMasks: [
      { path: 'customer.ssn', action: 'mask', replacement: '***-**-####' },
      { path: 'customer.driversLicense.number', action: 'mask', replacement: '****####' },
      { path: 'customer.bankAccount.accountNumber', action: 'mask', replacement: '****####' },
    ],
    priority: 900,
    enabled: true,
  },
];

/**
 * Default role rules
 */
export const DEFAULT_ROLE_RULES: Record<string, PolicyRule> = {
  SALESPERSON: {
    id: 'role-salesperson',
    name: 'Salesperson Role',
    level: 'role',
    roleId: 'SALESPERSON',
    effect: 'allow',
    scopes: [
      'deal:view', 'deal:create', 'deal:edit',
      'customer:view', 'customer:edit',
      'pii:view',
      'inventory:view',
      'analytics:view',
    ],
    fieldMasks: [
      { path: 'deal.cost', action: 'hide' },
      { path: 'deal.profit', action: 'hide' },
      { path: 'deal.margin', action: 'hide' },
      { path: 'inventory.cost', action: 'hide' },
    ],
    priority: 100,
    enabled: true,
  },
  
  SALES_MANAGER: {
    id: 'role-sales-manager',
    name: 'Sales Manager Role',
    level: 'role',
    roleId: 'SALES_MANAGER',
    effect: 'allow',
    scopes: [
      'deal:view', 'deal:create', 'deal:edit', 'deal:approve',
      'deal:cost.view', 'deal:profit.view', 'deal:margin.view',
      'customer:view', 'customer:edit',
      'pii:view',
      'inventory:view', 'inventory:cost.view',
      'analytics:view', 'analytics:team.view',
    ],
    priority: 100,
    enabled: true,
  },
  
  FINANCE_MANAGER: {
    id: 'role-finance-manager',
    name: 'Finance Manager Role',
    level: 'role',
    roleId: 'FINANCE_MANAGER',
    effect: 'allow',
    scopes: [
      'deal:view', 'deal:edit', 'deal:approve', 'deal:fi.view',
      'deal:cost.view', 'deal:profit.view', 'deal:margin.view',
      'customer:view', 'customer:edit',
      'pii:view', 'pii:edit',
      'credit:view', 'credit:pull',
      'finance:profit.view', 'finance:cost.view', 'finance:reports.export',
      'analytics:view',
    ],
    priority: 100,
    enabled: true,
  },
  
  CONTROLLER: {
    id: 'role-controller',
    name: 'Controller Role',
    level: 'role',
    roleId: 'CONTROLLER',
    effect: 'allow',
    scopes: [
      'deal:view', 'deal:cost.view', 'deal:profit.view', 'deal:margin.view',
      'accounting:gl.view', 'accounting:ap.view', 'accounting:ar.view',
      'finance:profit.view', 'finance:cost.view', 'finance:reports.export',
      'inventory:view', 'inventory:cost.view',
      'analytics:view', 'analytics:team.view', 'analytics:store.view',
    ],
    priority: 100,
    enabled: true,
  },
  
  SERVICE_ADVISOR: {
    id: 'role-service-advisor',
    name: 'Service Advisor Role',
    level: 'role',
    roleId: 'SERVICE_ADVISOR',
    effect: 'allow',
    scopes: [
      'service:ro.view', 'service:ro.create', 'service:ro.close',
      'service:parts.view', 'service:labor.edit',
      'customer:view',
      'inventory:view',
    ],
    priority: 100,
    enabled: true,
  },
  
  TITLE_CLERK: {
    id: 'role-title-clerk',
    name: 'Title Clerk Role',
    level: 'role',
    roleId: 'TITLE_CLERK',
    effect: 'allow',
    scopes: [
      'title:view', 'title:status.view', 'title:docs.upload',
      'title:lien.manage',
      'customer:view',
      'pii:view',
    ],
    priority: 100,
    enabled: true,
  },
  
  GM: {
    id: 'role-gm',
    name: 'General Manager Role',
    level: 'role',
    roleId: 'GM',
    effect: 'allow',
    scopes: [
      'deal:view', 'deal:create', 'deal:edit', 'deal:delete', 'deal:approve',
      'deal:cost.view', 'deal:profit.view', 'deal:margin.view', 'deal:desk',
      'customer:view', 'customer:edit', 'customer:delete',
      'pii:view', 'pii:edit',
      'credit:view',
      'inventory:view', 'inventory:cost.view', 'inventory:price.edit', 'inventory:age.view',
      'service:ro.view', 'service:ro.close',
      'title:view', 'title:status.view',
      'accounting:gl.view', 'accounting:ap.view', 'accounting:ar.view',
      'finance:profit.view', 'finance:cost.view', 'finance:reports.export',
      'analytics:view', 'analytics:team.view', 'analytics:store.view',
      'admin:users.manage', 'admin:roles.manage',
    ],
    priority: 100,
    enabled: true,
  },
  
  ADMIN: {
    id: 'role-admin',
    name: 'Admin Role',
    level: 'role',
    roleId: 'ADMIN',
    effect: 'allow',
    scopes: [
      'deal:view', 'deal:create', 'deal:edit', 'deal:delete', 'deal:approve',
      'deal:cost.view', 'deal:profit.view', 'deal:margin.view', 'deal:desk', 'deal:fi.view',
      'customer:view', 'customer:edit', 'customer:delete',
      'pii:view', 'pii:edit', 'pii:export',
      'credit:view', 'credit:pull',
      'inventory:view', 'inventory:cost.view', 'inventory:price.edit', 'inventory:age.view', 'inventory:acquire',
      'service:ro.view', 'service:ro.create', 'service:ro.close', 'service:parts.view', 'service:labor.edit',
      'title:view', 'title:status.view', 'title:docs.upload', 'title:lien.manage',
      'accounting:gl.view', 'accounting:ap.view', 'accounting:ar.view',
      'finance:profit.view', 'finance:cost.view', 'finance:reports.export',
      'analytics:view', 'analytics:team.view', 'analytics:store.view',
      'admin:users.manage', 'admin:roles.manage', 'admin:settings.edit', 'admin:audit.view', 'admin:system.health',
    ],
    priority: 100,
    enabled: true,
  },
};

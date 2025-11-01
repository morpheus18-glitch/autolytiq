/**
 * Permission system configuration
 * Defines all available permissions and role presets
 */

export interface PermissionDefinition {
  code: string;
  name: string;
  description: string;
  category: string;
}

export interface RolePresetDefinition {
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

/**
 * Permission categories
 */
export const PERMISSION_CATEGORIES = {
  CUSTOMERS: 'customers',
  LEADS: 'leads',
  DEALS: 'deals',
  INVENTORY: 'inventory',
  FINANCE: 'finance',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  USERS: 'users',
  APPRAISALS: 'appraisals',
  SERVICE: 'service',
  ADVANCED: 'advanced',
} as const;

/**
 * All available permissions in the system
 */
export const PERMISSIONS: PermissionDefinition[] = [
  // Customer Management
  {
    code: 'customers.view',
    name: 'View Customers',
    description: 'View customer information',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },
  {
    code: 'customers.create',
    name: 'Create Customers',
    description: 'Create new customers',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },
  {
    code: 'customers.edit',
    name: 'Edit Customers',
    description: 'Edit customer information',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },
  {
    code: 'customers.delete',
    name: 'Delete Customers',
    description: 'Delete customers',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },
  {
    code: 'customers.export',
    name: 'Export Customers',
    description: 'Export customer data',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },

  // Lead Management
  {
    code: 'leads.view',
    name: 'View Leads',
    description: 'View lead information',
    category: PERMISSION_CATEGORIES.LEADS,
  },
  {
    code: 'leads.create',
    name: 'Create Leads',
    description: 'Create new leads',
    category: PERMISSION_CATEGORIES.LEADS,
  },
  {
    code: 'leads.edit',
    name: 'Edit Leads',
    description: 'Edit lead information',
    category: PERMISSION_CATEGORIES.LEADS,
  },
  {
    code: 'leads.delete',
    name: 'Delete Leads',
    description: 'Delete leads',
    category: PERMISSION_CATEGORIES.LEADS,
  },
  {
    code: 'leads.assign',
    name: 'Assign Leads',
    description: 'Assign leads to team members',
    category: PERMISSION_CATEGORIES.LEADS,
  },
  {
    code: 'leads.viewAll',
    name: 'View All Leads',
    description: 'View all leads (not just assigned)',
    category: PERMISSION_CATEGORIES.LEADS,
  },

  // Deal Management
  {
    code: 'deals.view',
    name: 'View Deals',
    description: 'View deal information',
    category: PERMISSION_CATEGORIES.DEALS,
  },
  {
    code: 'deals.create',
    name: 'Create Deals',
    description: 'Create new deals',
    category: PERMISSION_CATEGORIES.DEALS,
  },
  {
    code: 'deals.edit',
    name: 'Edit Deals',
    description: 'Edit deal information',
    category: PERMISSION_CATEGORIES.DEALS,
  },
  {
    code: 'deals.delete',
    name: 'Delete Deals',
    description: 'Delete deals',
    category: PERMISSION_CATEGORIES.DEALS,
  },
  {
    code: 'deals.approve',
    name: 'Approve Deals',
    description: 'Approve deal submissions',
    category: PERMISSION_CATEGORIES.DEALS,
  },
  {
    code: 'deals.viewAll',
    name: 'View All Deals',
    description: 'View all deals (not just own)',
    category: PERMISSION_CATEGORIES.DEALS,
  },
  {
    code: 'deals.viewPricing',
    name: 'View Deal Pricing',
    description: 'View deal pricing and margins',
    category: PERMISSION_CATEGORIES.DEALS,
  },
  {
    code: 'deals.editPricing',
    name: 'Edit Deal Pricing',
    description: 'Edit deal pricing and margins',
    category: PERMISSION_CATEGORIES.DEALS,
  },

  // Inventory Management
  {
    code: 'inventory.view',
    name: 'View Inventory',
    description: 'View inventory vehicles',
    category: PERMISSION_CATEGORIES.INVENTORY,
  },
  {
    code: 'inventory.create',
    name: 'Add Inventory',
    description: 'Add new vehicles to inventory',
    category: PERMISSION_CATEGORIES.INVENTORY,
  },
  {
    code: 'inventory.edit',
    name: 'Edit Inventory',
    description: 'Edit inventory information',
    category: PERMISSION_CATEGORIES.INVENTORY,
  },
  {
    code: 'inventory.delete',
    name: 'Delete Inventory',
    description: 'Delete inventory items',
    category: PERMISSION_CATEGORIES.INVENTORY,
  },
  {
    code: 'inventory.pricing',
    name: 'Manage Inventory Pricing',
    description: 'Set and edit inventory pricing',
    category: PERMISSION_CATEGORIES.INVENTORY,
  },
  {
    code: 'inventory.wholesale',
    name: 'Manage Wholesale',
    description: 'Manage wholesale listings',
    category: PERMISSION_CATEGORIES.INVENTORY,
  },

  // Appraisals
  {
    code: 'appraisals.view',
    name: 'View Appraisals',
    description: 'View appraisal information',
    category: PERMISSION_CATEGORIES.APPRAISALS,
  },
  {
    code: 'appraisals.create',
    name: 'Create Appraisals',
    description: 'Create new appraisals',
    category: PERMISSION_CATEGORIES.APPRAISALS,
  },
  {
    code: 'appraisals.edit',
    name: 'Edit Appraisals',
    description: 'Edit appraisal values',
    category: PERMISSION_CATEGORIES.APPRAISALS,
  },
  {
    code: 'appraisals.approve',
    name: 'Approve Appraisals',
    description: 'Approve appraisal submissions',
    category: PERMISSION_CATEGORIES.APPRAISALS,
  },

  // Finance
  {
    code: 'finance.view',
    name: 'View Finance',
    description: 'View finance information',
    category: PERMISSION_CATEGORIES.FINANCE,
  },
  {
    code: 'finance.manageFI',
    name: 'Manage F&I Products',
    description: 'Manage F&I products and pricing',
    category: PERMISSION_CATEGORIES.FINANCE,
  },
  {
    code: 'finance.viewCommissions',
    name: 'View Commissions',
    description: 'View commission data',
    category: PERMISSION_CATEGORIES.FINANCE,
  },
  {
    code: 'finance.editCommissions',
    name: 'Edit Commissions',
    description: 'Edit commission structures',
    category: PERMISSION_CATEGORIES.FINANCE,
  },
  {
    code: 'finance.lenders',
    name: 'Manage Lenders',
    description: 'Manage lender relationships',
    category: PERMISSION_CATEGORIES.FINANCE,
  },

  // Service
  {
    code: 'service.view',
    name: 'View Service Orders',
    description: 'View service orders',
    category: PERMISSION_CATEGORIES.SERVICE,
  },
  {
    code: 'service.create',
    name: 'Create Service Orders',
    description: 'Create new service orders',
    category: PERMISSION_CATEGORIES.SERVICE,
  },
  {
    code: 'service.edit',
    name: 'Edit Service Orders',
    description: 'Edit service orders',
    category: PERMISSION_CATEGORIES.SERVICE,
  },
  {
    code: 'service.complete',
    name: 'Complete Service Orders',
    description: 'Mark service orders as complete',
    category: PERMISSION_CATEGORIES.SERVICE,
  },

  // Reports
  {
    code: 'reports.view',
    name: 'View Reports',
    description: 'View reports and analytics',
    category: PERMISSION_CATEGORIES.REPORTS,
  },
  {
    code: 'reports.create',
    name: 'Create Reports',
    description: 'Create custom reports',
    category: PERMISSION_CATEGORIES.REPORTS,
  },
  {
    code: 'reports.export',
    name: 'Export Reports',
    description: 'Export report data',
    category: PERMISSION_CATEGORIES.REPORTS,
  },

  // User Management
  {
    code: 'users.view',
    name: 'View Users',
    description: 'View user information',
    category: PERMISSION_CATEGORIES.USERS,
  },
  {
    code: 'users.create',
    name: 'Create Users',
    description: 'Create new users',
    category: PERMISSION_CATEGORIES.USERS,
  },
  {
    code: 'users.edit',
    name: 'Edit Users',
    description: 'Edit user information',
    category: PERMISSION_CATEGORIES.USERS,
  },
  {
    code: 'users.delete',
    name: 'Delete Users',
    description: 'Delete users',
    category: PERMISSION_CATEGORIES.USERS,
  },
  {
    code: 'users.managePermissions',
    name: 'Manage User Permissions',
    description: 'Manage user permissions and roles',
    category: PERMISSION_CATEGORIES.USERS,
  },

  // Settings
  {
    code: 'settings.view',
    name: 'View Settings',
    description: 'View system settings',
    category: PERMISSION_CATEGORIES.SETTINGS,
  },
  {
    code: 'settings.edit',
    name: 'Edit Settings',
    description: 'Edit system settings',
    category: PERMISSION_CATEGORIES.SETTINGS,
  },
  {
    code: 'settings.roles',
    name: 'Manage Roles',
    description: 'Manage role presets',
    category: PERMISSION_CATEGORIES.SETTINGS,
  },
  {
    code: 'settings.integrations',
    name: 'Manage Integrations',
    description: 'Manage third-party integrations',
    category: PERMISSION_CATEGORIES.SETTINGS,
  },

  // Advanced Features
  {
    code: 'advanced.mlDesking',
    name: 'ML Desking',
    description: 'Access ML-powered desking features',
    category: PERMISSION_CATEGORIES.ADVANCED,
  },
  {
    code: 'advanced.api',
    name: 'API Access',
    description: 'Access API endpoints',
    category: PERMISSION_CATEGORIES.ADVANCED,
  },
  {
    code: 'advanced.developer',
    name: 'Developer Portal',
    description: 'Access developer portal',
    category: PERMISSION_CATEGORIES.ADVANCED,
  },
  {
    code: 'advanced.auditLogs',
    name: 'View Audit Logs',
    description: 'View system audit logs',
    category: PERMISSION_CATEGORIES.ADVANCED,
  },
];

/**
 * System role presets with predefined permissions
 */
export const ROLE_PRESETS: RolePresetDefinition[] = [
  {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: PERMISSIONS.map((p) => p.code),
  },
  {
    name: 'Manager',
    description: 'Management level access for overseeing operations',
    isSystem: true,
    permissions: [
      'customers.view',
      'customers.create',
      'customers.edit',
      'customers.export',
      'leads.view',
      'leads.create',
      'leads.edit',
      'leads.assign',
      'leads.viewAll',
      'deals.view',
      'deals.create',
      'deals.edit',
      'deals.approve',
      'deals.viewAll',
      'deals.viewPricing',
      'deals.editPricing',
      'inventory.view',
      'inventory.create',
      'inventory.edit',
      'inventory.pricing',
      'appraisals.view',
      'appraisals.approve',
      'finance.view',
      'finance.viewCommissions',
      'reports.view',
      'reports.create',
      'reports.export',
      'users.view',
    ],
  },
  {
    name: 'Sales Manager',
    description: 'Sales team management and oversight',
    isSystem: true,
    permissions: [
      'customers.view',
      'customers.create',
      'customers.edit',
      'leads.view',
      'leads.create',
      'leads.edit',
      'leads.assign',
      'leads.viewAll',
      'deals.view',
      'deals.create',
      'deals.edit',
      'deals.approve',
      'deals.viewAll',
      'deals.viewPricing',
      'inventory.view',
      'appraisals.view',
      'reports.view',
      'reports.create',
      'users.view',
    ],
  },
  {
    name: 'Salesperson',
    description: 'Sales team member access',
    isSystem: true,
    permissions: [
      'customers.view',
      'customers.create',
      'customers.edit',
      'leads.view',
      'leads.create',
      'leads.edit',
      'deals.view',
      'deals.create',
      'deals.edit',
      'inventory.view',
      'appraisals.view',
      'appraisals.create',
      'reports.view',
    ],
  },
  {
    name: 'F&I Manager',
    description: 'Finance and insurance management',
    isSystem: true,
    permissions: [
      'customers.view',
      'deals.view',
      'deals.viewAll',
      'deals.viewPricing',
      'deals.editPricing',
      'finance.view',
      'finance.manageFI',
      'finance.viewCommissions',
      'finance.lenders',
      'reports.view',
      'reports.create',
    ],
  },
  {
    name: 'Finance Specialist',
    description: 'Finance and insurance specialist',
    isSystem: true,
    permissions: [
      'customers.view',
      'deals.view',
      'deals.viewPricing',
      'finance.view',
      'finance.manageFI',
      'reports.view',
    ],
  },
  {
    name: 'BDC Representative',
    description: 'Business development center representative',
    isSystem: true,
    permissions: [
      'customers.view',
      'customers.create',
      'customers.edit',
      'leads.view',
      'leads.create',
      'leads.edit',
      'inventory.view',
      'reports.view',
    ],
  },
  {
    name: 'Service Advisor',
    description: 'Service department advisor',
    isSystem: true,
    permissions: [
      'customers.view',
      'service.view',
      'service.create',
      'service.edit',
      'service.complete',
      'inventory.view',
      'reports.view',
    ],
  },
  {
    name: 'Service Technician',
    description: 'Service department technician',
    isSystem: true,
    permissions: [
      'service.view',
      'service.edit',
      'service.complete',
    ],
  },
  {
    name: 'Inventory Manager',
    description: 'Inventory management specialist',
    isSystem: true,
    permissions: [
      'inventory.view',
      'inventory.create',
      'inventory.edit',
      'inventory.delete',
      'inventory.pricing',
      'inventory.wholesale',
      'appraisals.view',
      'appraisals.create',
      'appraisals.edit',
      'appraisals.approve',
      'reports.view',
      'reports.create',
    ],
  },
];

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(category: string): PermissionDefinition[] {
  return PERMISSIONS.filter((p) => p.category === category);
}

/**
 * Get all permission categories with their permissions
 */
export function getPermissionCategories(): Record<string, PermissionDefinition[]> {
  const categories: Record<string, PermissionDefinition[]> = {};

  Object.values(PERMISSION_CATEGORIES).forEach((category) => {
    categories[category] = getPermissionsByCategory(category);
  });

  return categories;
}

/**
 * Get role preset by name
 */
export function getRolePreset(name: string): RolePresetDefinition | undefined {
  return ROLE_PRESETS.find((r) => r.name === name);
}

/**
 * Check if a permission exists
 */
export function isValidPermission(code: string): boolean {
  return PERMISSIONS.some((p) => p.code === code);
}

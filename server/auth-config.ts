import type { SessionUserAccess } from './session-auth';

export interface TenantStore {
  id: string;
  code: string;
  name: string;
  timezone: string;
  aliases?: string[];
}

export interface TenantUserProfile {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  featureFlags?: string[];
  passwordHash: string;
  access: SessionUserAccess;
}

export interface TenantConfig {
  tenantId: string;
  store: TenantStore;
  users: TenantUserProfile[];
  defaultAccess: SessionUserAccess;
}

interface TenantLookupResult {
  tenant: TenantConfig;
  user: TenantUserProfile;
}

const sharedNavigation = ['inventory', 'crm', 'sales', 'finance', 'reports'];
const sharedQuickActions = ['/customers', '/inventory', '/deals'];
const baseRoutes = [
  '/',
  '/dashboard',
  '/inventory',
  '/inventory/pricing',
  '/inventory/lot-management',
  '/inventory/:id',
  '/sales',
  '/deals',
  '/crm',
  '/customers',
  '/leads',
  '/trade-appraisals',
  '/finance',
  '/finance/lenders',
  '/finance/rates',
  '/finance/compliance',
  '/reports',
  '/reports/sales',
  '/reports/inventory',
  '/workflow-assistant',
];

export const tenantDirectory: TenantConfig[] = [
  {
    tenantId: 'tenant-autolytiq-main',
    store: {
      id: 'autolytiq-main-store',
      code: 'MAIN',
      name: 'AutolytiQ Flagship Store',
      timezone: 'America/New_York',
      aliases: ['main', '001'],
    },
    defaultAccess: {
      homePath: '/dashboard',
      allowedRoutes: baseRoutes,
      navigationSections: sharedNavigation,
      quickActions: sharedQuickActions,
    },
    users: [
      {
        userId: 'admin_001',
        username: 'admin',
        email: 'admin@autolytiq.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'Administrator',
        permissions: ['*'],
        featureFlags: ['developer_portal', 'realtime_analytics'],
        passwordHash: '$2b$10$T3rp4DpKAsddBeWdyLVwQOu2K7DFBOfwqP9DLKCtAMSTa1nlbwekC',
        access: {
          homePath: '/ml-developer-admin',
          allowedRoutes: ['*'],
          navigationSections: ['*'],
          quickActions: ['*'],
        },
      },
      {
        userId: 'sales_001',
        username: 'sarah.johnson',
        email: 'sarah@autolytiq.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'Sales Manager',
        permissions: ['sales.manage', 'customers.view', 'leads.view'],
        featureFlags: ['sales_assistant'],
        passwordHash: '$2b$10$k/tr2mK6zzDwciPuvBpZhe0dJ3UigdoeHvyY3A5xEsn0f5Xwf1kY.',
        access: {
          homePath: '/sales',
          allowedRoutes: [
            '/',
            '/dashboard',
            '/sales',
            '/sales-mobile',
            '/deals',
            '/professional-deal-desk',
            '/professional-deal-desk/:id',
            '/deals/:id',
            '/trade-appraisals',
            '/crm',
            '/leads',
            '/leads/:id',
            '/customers',
            '/customers/:id',
            '/customers/:id/texting',
            '/customers/:id/calls',
            '/inventory',
            '/inventory/:id',
            '/inventory/pricing',
            '/inventory/lot-management',
            '/finance',
            '/finance/lenders',
            '/finance/rates',
            '/finance/compliance',
            '/reports',
            '/reports/sales',
            '/workflow-assistant',
          ],
          navigationSections: ['inventory', 'crm', 'sales', 'finance'],
          quickActions: ['/customers', '/deals', '/finance'],
        },
      },
    ],
  },
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function findTenantUser(storeId: string, username: string): TenantLookupResult | undefined {
  const normalizedStore = normalize(storeId);
  const normalizedUsername = normalize(username);

  for (const tenant of tenantDirectory) {
    const identifiers = [tenant.store.id, tenant.store.code, ...(tenant.store.aliases ?? [])]
      .map(normalize);

    if (!identifiers.includes(normalizedStore)) {
      continue;
    }

    const user = tenant.users.find((candidate) => normalize(candidate.username) === normalizedUsername);
    if (user) {
      return { tenant, user };
    }
  }

  return undefined;
}

export function resolveTenantByStore(storeId: string): TenantConfig | undefined {
  const normalizedStore = normalize(storeId);

  return tenantDirectory.find((tenant) =>
    [tenant.store.id, tenant.store.code, ...(tenant.store.aliases ?? [])]
      .map(normalize)
      .includes(normalizedStore)
  );
}

/**
 * Card Registry
 *
 * Central registry of dashboard cards with their definitions.
 * Maps card keys to CardDef specifications and lazy-loaded components.
 *
 * This sits beside the existing widget system and bridges to it.
 */

import { lazy } from 'react';
import type { CardDef } from '@repo/shared';

/**
 * Card registry - maps card keys to definitions
 */
const cardRegistry = new Map<string, CardDef>();

/**
 * Component registry - maps card keys to lazy-loaded components
 */
const componentRegistry = new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>();

/**
 * Register a card definition and its component
 *
 * @param cardDef Card definition
 * @param component Lazy-loaded component
 */
export function registerCard(
  cardDef: CardDef,
  component: React.LazyExoticComponent<React.ComponentType<any>>
): void {
  cardRegistry.set(cardDef.key, cardDef);
  componentRegistry.set(cardDef.key, component);
}

/**
 * Get card definition by key
 *
 * @param key Card key
 * @returns CardDef or undefined
 */
export function getCardDef(key: string): CardDef | undefined {
  return cardRegistry.get(key);
}

/**
 * Get card component by key
 *
 * @param key Card key
 * @returns Lazy component or undefined
 */
export function getCardComponent(key: string): React.LazyExoticComponent<React.ComponentType<any>> | undefined {
  return componentRegistry.get(key);
}

/**
 * Get all registered card definitions
 *
 * @returns Array of CardDef
 */
export function getAllCards(): CardDef[] {
  return Array.from(cardRegistry.values());
}

/**
 * Get all card keys
 *
 * @returns Array of card keys
 */
export function getAllCardKeys(): string[] {
  return Array.from(cardRegistry.keys());
}

/**
 * Check if a card is registered
 *
 * @param key Card key
 * @returns true if registered
 */
export function hasCard(key: string): boolean {
  return cardRegistry.has(key);
}

/**
 * Unregister a card (for testing/debugging)
 *
 * @param key Card key
 */
export function unregisterCard(key: string): void {
  cardRegistry.delete(key);
  componentRegistry.delete(key);
}

/**
 * Clear all registered cards (for testing/debugging)
 */
export function clearRegistry(): void {
  cardRegistry.clear();
  componentRegistry.clear();
}

// ============================================================================
// CARD DEFINITIONS - Register all dashboard cards
// ============================================================================

/**
 * Active Deals Card
 */
registerCard(
  {
    key: 'active-deals',
    kind: 'list',
    context: 'none',
    requiredPermissions: ['DEAL_VIEW'],
    roles: ['SALESPERSON', 'SALES_MANAGER', 'GM'],
    size: 'MEDIUM',
    componentPath: '@/components/widgets/ActiveDealsWidget',
    dataSource: '/api/deals?status=ACTIVE&limit=5',
    refreshInterval: 30000,
    title: 'Active Deals',
    description: 'Deals currently in progress',
    priority: 'high',
    tags: ['sales', 'deals'],
  },
  lazy(() => import('../../components/widgets/ActiveDealsWidget'))
);

/**
 * Hot Leads Card
 */
registerCard(
  {
    key: 'hot-leads',
    kind: 'list',
    context: 'none',
    requiredPermissions: ['LEAD_VIEW'],
    roles: ['SALESPERSON', 'BDC', 'SALES_MANAGER'],
    size: 'MEDIUM',
    componentPath: '@/components/widgets/HotLeadsWidget',
    dataSource: '/api/leads?status=HOT&limit=5',
    refreshInterval: 60000,
    title: 'Hot Leads',
    description: 'High-priority leads requiring follow-up',
    priority: 'critical',
    tags: ['sales', 'leads', 'crm'],
  },
  lazy(() => import('../../components/widgets/HotLeadsWidget'))
);

/**
 * Today's Appointments Card
 */
registerCard(
  {
    key: 'today-appointments',
    kind: 'calendar',
    context: 'none',
    requiredPermissions: ['APPOINTMENT_VIEW'],
    roles: ['SALESPERSON', 'BDC', 'SALES_MANAGER', 'SERVICE_ADVISOR'],
    size: 'MEDIUM',
    componentPath: '@/components/widgets/TodayAppointmentsWidget',
    dataSource: '/api/appointments?date=today',
    refreshInterval: 300000, // 5 minutes
    title: "Today's Appointments",
    description: 'Scheduled appointments for today',
    priority: 'normal',
    tags: ['calendar', 'appointments'],
  },
  lazy(() => import('../../components/widgets/TodayAppointmentsWidget'))
);

/**
 * Pending Tasks Card
 */
registerCard(
  {
    key: 'pending-tasks',
    kind: 'list',
    context: 'none',
    requiredPermissions: ['TASK_VIEW'],
    roles: ['SALESPERSON', 'SALES_MANAGER', 'BDC', 'GM'],
    size: 'MEDIUM',
    componentPath: '@/components/widgets/PendingTasksWidget',
    dataSource: '/api/tasks?status=PENDING',
    refreshInterval: 60000,
    title: 'Pending Tasks',
    description: 'Tasks requiring attention',
    priority: 'normal',
    tags: ['tasks', 'productivity'],
  },
  lazy(() => import('../../components/widgets/PendingTasksWidget'))
);

/**
 * Sales Leaderboard Card
 */
registerCard(
  {
    key: 'sales-leaderboard',
    kind: 'table',
    context: 'none',
    requiredPermissions: ['ANALYTICS_VIEW'],
    roles: ['SALES_MANAGER', 'GM', 'CONTROLLER'],
    size: 'LARGE',
    componentPath: '@/components/widgets/SalesLeaderboardWidget',
    dataSource: '/api/analytics/leaderboard',
    refreshInterval: 300000, // 5 minutes
    title: 'Sales Leaderboard',
    description: 'Top performers this month',
    priority: 'normal',
    tags: ['analytics', 'sales', 'performance'],
  },
  lazy(() => import('../../components/widgets/SalesLeaderboardWidget'))
);

/**
 * Dealership Overview Card
 */
registerCard(
  {
    key: 'dealership-overview',
    kind: 'custom',
    context: 'none',
    requiredPermissions: ['ANALYTICS_VIEW'],
    roles: ['GM', 'CONTROLLER', 'OWNER'],
    size: 'WIDE',
    componentPath: '@/components/widgets/DealershipOverviewWidget',
    dataSource: '/api/analytics/overview',
    refreshInterval: 300000, // 5 minutes
    title: 'Dealership Overview',
    description: 'High-level metrics and KPIs',
    priority: 'high',
    tags: ['analytics', 'overview', 'kpi'],
  },
  lazy(() => import('../../components/widgets/DealershipOverviewWidget'))
);

/**
 * System Health Card
 */
registerCard(
  {
    key: 'system-health',
    kind: 'metric',
    context: 'none',
    requiredPermissions: ['ADMIN'],
    roles: ['ADMIN', 'OWNER'],
    size: 'SMALL',
    componentPath: '@/components/widgets/SystemHealthWidget',
    dataSource: '/api/health',
    refreshInterval: 30000,
    title: 'System Health',
    description: 'Platform health and status',
    priority: 'normal',
    tags: ['admin', 'system', 'monitoring'],
  },
  lazy(() => import('../../components/widgets/SystemHealthWidget'))
);

// Export registry functions
export const cardRegistryAPI = {
  register: registerCard,
  get: getCardDef,
  getComponent: getCardComponent,
  getAll: getAllCards,
  getAllKeys: getAllCardKeys,
  has: hasCard,
  unregister: unregisterCard,
  clear: clearRegistry,
};

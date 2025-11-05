import { UserRole } from '@repo/db';

export interface WidgetConfig {
  id: string;
  key: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config?: any;
}

export interface DashboardLayout {
  columns: number;
  widgets: WidgetConfig[];
}

/**
 * Default dashboard layouts for each role
 */
export const DEFAULT_LAYOUTS: Record<UserRole, DashboardLayout> = {
  SALES: {
    columns: 4,
    widgets: [
      { id: 'w1', key: 'active-deals', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: 'w2', key: 'today-appointments', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'w3', key: 'hot-leads', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: 'w4', key: 'pending-tasks', position: { x: 0, y: 2 }, size: { w: 2, h: 1 } },
      { id: 'w5', key: 'sales-leaderboard', position: { x: 2, y: 2 }, size: { w: 2, h: 1 } },
    ],
  },

  SERVICE: {
    columns: 4,
    widgets: [
      { id: 'w1', key: 'service-appointments', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: 'w2', key: 'open-ros', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'w3', key: 'pending-approvals', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: 'w4', key: 'technician-dispatch', position: { x: 0, y: 2 }, size: { w: 4, h: 1 } },
    ],
  },

  FINANCE: {
    columns: 4,
    widgets: [
      { id: 'w1', key: 'pending-fi-deals', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: 'w2', key: 'lender-submissions', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'w3', key: 'fi-products-sold', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: 'w4', key: 'average-pvr', position: { x: 0, y: 2 }, size: { w: 1, h: 1 } },
      { id: 'w5', key: 'backend-profit', position: { x: 1, y: 2 }, size: { w: 1, h: 1 } },
    ],
  },

  ACCOUNTING: {
    columns: 4,
    widgets: [
      { id: 'w1', key: 'unreconciled-deals', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: 'w2', key: 'cash-flow-summary', position: { x: 0, y: 2 }, size: { w: 4, h: 1 } },
      { id: 'w3', key: 'pending-invoices', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'w4', key: 'bank-reconciliation', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
    ],
  },

  INVENTORY: {
    columns: 4,
    widgets: [
      { id: 'w1', key: 'aging-inventory', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: 'w2', key: 'recent-acquisitions', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'w3', key: 'pricing-alerts', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: 'w4', key: 'needs-photos', position: { x: 0, y: 2 }, size: { w: 1, h: 1 } },
      { id: 'w5', key: 'wholesale-candidates', position: { x: 1, y: 2 }, size: { w: 1, h: 1 } },
    ],
  },

  DEVELOPER: {
    columns: 4,
    widgets: [
      { id: 'w1', key: 'system-health', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: 'w2', key: 'api-performance', position: { x: 0, y: 2 }, size: { w: 4, h: 1 } },
      { id: 'w3', key: 'error-logs', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'w4', key: 'database-queries', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
    ],
  },

  ADMIN: {
    columns: 4,
    widgets: [
      { id: 'w1', key: 'dealership-overview', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: 'w2', key: 'user-activity', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'w3', key: 'audit-log', position: { x: 0, y: 2 }, size: { w: 4, h: 1 } },
      { id: 'w4', key: 'integration-status', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
    ],
  },

  MANAGER: {
    columns: 4,
    widgets: [
      { id: 'w1', key: 'dealership-overview', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
      { id: 'w2', key: 'active-deals', position: { x: 2, y: 0 }, size: { w: 2, h: 1 } },
      { id: 'w3', key: 'sales-leaderboard', position: { x: 2, y: 1 }, size: { w: 2, h: 1 } },
      { id: 'w4', key: 'cash-flow-summary', position: { x: 0, y: 2 }, size: { w: 4, h: 1 } },
    ],
  },
};

/**
 * Get default layout for a specific role
 */
export function getDefaultLayout(role?: UserRole | string): DashboardLayout {
  if (!role || !(role in DEFAULT_LAYOUTS)) {
    return DEFAULT_LAYOUTS.SALES; // Fallback to SALES
  }
  return DEFAULT_LAYOUTS[role as UserRole];
}

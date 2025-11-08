import type { WidgetDefinition } from '@repo/insights-engine';

export interface DashboardContext {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

export interface DashboardConfig {
  widgets: string[]; // Widget IDs to load
  layout: 'grid' | 'list' | 'masonry';
  columns?: number;
}

/**
 * Load dashboard config based on user context
 */
export async function loadDashboardConfig(
  context: DashboardContext
): Promise<DashboardConfig> {
  // For now, return mock config
  // In production: fetch from API based on role + tenant

  const defaultWidgets = [
    'deal-funding-risk',
    'recon-stalled',
    'title-delay-risk',
    'lead-revisit',
  ];

  return {
    widgets: defaultWidgets,
    layout: 'grid',
    columns: 2,
  };
}

/**
 * Fetch widget definitions by IDs
 */
export function getWidgetDefinitions(widgetIds: string[]): WidgetDefinition[] {
  // In production: fetch from registry
  // For now: return mock definitions
  return [];
}

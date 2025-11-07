/**
 * Card Definition Schema
 *
 * Defines the structure for dashboard cards with role-based permissions,
 * data sources, and visual presentation rules.
 *
 * Bridge to DashboardWidget: Use `deriveFromWidget()` to convert legacy
 * WidgetConfig to CardDef format.
 */

/**
 * Card kinds define the visual pattern and data structure
 */
export type CardKind =
  | 'metric'      // Single number with label (e.g., "23 Active Deals")
  | 'trend'       // Metric with sparkline/trend indicator
  | 'list'        // Vertical list of items
  | 'table'       // Tabular data with columns
  | 'calendar'    // Calendar/timeline view
  | 'kanban'      // Board with draggable cards
  | 'alert'       // Status message or warning
  | 'custom';     // Free-form custom component

/**
 * Card context determines which entity ID is passed to data source
 */
export type CardContext =
  | 'deal'        // Requires dealId in context
  | 'customer'    // Requires customerId in context
  | 'vehicle'     // Requires vehicleId in context
  | 'store'       // Requires storeId in context
  | 'tenant'      // Requires tenantId in context
  | 'none';       // No context required (global cards)

/**
 * Card size determines grid layout dimensions
 */
export type CardSize =
  | 'SMALL'       // 1x1 (single metric, compact)
  | 'MEDIUM'      // 2x1 (list, chart)
  | 'LARGE'       // 2x2 (table, detailed view)
  | 'WIDE'        // 3x1 (horizontal layout)
  | 'FULL';       // Full width (dashboards, reports)

/**
 * Card priority affects rendering order and visual emphasis
 */
export type CardPriority =
  | 'critical'    // Red, requires immediate attention
  | 'high'        // Orange, important but not urgent
  | 'normal'      // Default priority
  | 'low';        // Subtle, informational

/**
 * Card Definition
 *
 * Complete specification for a dashboard card including permissions,
 * data source, visual presentation, and behavior.
 */
export interface CardDef {
  /**
   * Unique identifier for the card (e.g., "active-deals", "hot-leads")
   */
  key: string;

  /**
   * Visual pattern and data structure
   */
  kind: CardKind;

  /**
   * Context entity required to render this card
   */
  context: CardContext;

  /**
   * Permissions required to view this card
   * Empty array = no permission check (public card)
   */
  requiredPermissions: string[];

  /**
   * Roles allowed to view this card (optional - prefer permissions)
   * If both roles and permissions are specified, user must have BOTH
   */
  roles?: string[];

  /**
   * Grid layout size
   */
  size: CardSize;

  /**
   * Path to lazy-loaded component
   * Example: "@/components/widgets/ActiveDealsWidget"
   */
  componentPath: string;

  /**
   * API endpoint or data source function
   * Example: "/api/deals?status=ACTIVE&limit=5"
   * Optional: if omitted, component handles its own data fetching
   */
  dataSource?: string;

  /**
   * Auto-refresh interval in milliseconds
   * Example: 30000 = refresh every 30 seconds
   * Optional: if omitted, no auto-refresh
   */
  refreshInterval?: number;

  /**
   * Feature flags required for this card to be visible
   * Example: ["ai-coach", "deal-optimizer"]
   * Optional: if omitted, no feature flag checks
   */
  featureFlags?: string[];

  /**
   * Display title for the card (optional - component can override)
   */
  title?: string;

  /**
   * Description for the card (optional - used in card library)
   */
  description?: string;

  /**
   * Priority level for rendering order and visual emphasis
   * Optional: defaults to "normal"
   */
  priority?: CardPriority;

  /**
   * Tags for filtering in card library
   * Example: ["sales", "deals", "crm"]
   */
  tags?: string[];

  /**
   * Custom configuration passed to component
   * Example: { limit: 10, sortBy: "createdAt" }
   */
  config?: Record<string, any>;
}

/**
 * Bridge function: Convert legacy WidgetConfig to CardDef
 *
 * Use this to gradually migrate existing widgets to the new card system
 * without breaking current dashboards.
 *
 * @param widgetConfig Legacy widget configuration
 * @returns CardDef compatible with new registry
 */
export function deriveFromWidget(widgetConfig: {
  id: string;
  key: string;
  position?: { x: number; y: number };
  size?: { w: number; h: number };
  config?: any;
}): CardDef {
  // Map widget size to CardSize
  const mapSize = (w?: number, h?: number): CardSize => {
    if (!w || !h) return 'MEDIUM';
    if (w === 1 && h === 1) return 'SMALL';
    if (w === 2 && h === 2) return 'LARGE';
    if (w >= 3 && h === 1) return 'WIDE';
    if (w >= 3 && h >= 2) return 'FULL';
    return 'MEDIUM';
  };

  // Infer card kind from widget key
  const inferKind = (key: string): CardKind => {
    if (key.includes('metric') || key.includes('count')) return 'metric';
    if (key.includes('trend') || key.includes('chart')) return 'trend';
    if (key.includes('list') || key.includes('leads')) return 'list';
    if (key.includes('table') || key.includes('grid')) return 'table';
    if (key.includes('calendar') || key.includes('schedule')) return 'calendar';
    if (key.includes('kanban') || key.includes('board')) return 'kanban';
    if (key.includes('alert') || key.includes('warning')) return 'alert';
    return 'custom';
  };

  return {
    key: widgetConfig.key,
    kind: inferKind(widgetConfig.key),
    context: 'none', // Widgets don't specify context, default to none
    requiredPermissions: [], // No permission checks on legacy widgets (unsafe!)
    size: mapSize(widgetConfig.size?.w, widgetConfig.size?.h),
    componentPath: `@/components/widgets/${widgetConfig.key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Widget`,
    config: widgetConfig.config,
  };
}

/**
 * Example Card Definitions
 */
export const EXAMPLE_CARDS: CardDef[] = [
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
    description: 'List of currently active deals in progress',
    priority: 'high',
    tags: ['sales', 'deals'],
  },
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
    description: 'High-priority leads requiring immediate follow-up',
    priority: 'critical',
    tags: ['sales', 'leads', 'crm'],
  },
  {
    key: 'sales-metrics',
    kind: 'metric',
    context: 'none',
    requiredPermissions: ['ANALYTICS_VIEW'],
    roles: ['SALES_MANAGER', 'GM', 'CONTROLLER'],
    size: 'SMALL',
    componentPath: '@/components/widgets/SalesMetricsWidget',
    dataSource: '/api/analytics/sales/today',
    refreshInterval: 300000, // 5 minutes
    title: 'Sales Today',
    description: 'Total sales count and revenue for today',
    priority: 'normal',
    tags: ['analytics', 'sales'],
  },
  {
    key: 'inventory-aging',
    kind: 'table',
    context: 'none',
    requiredPermissions: ['INVENTORY_VIEW'],
    roles: ['SALES_MANAGER', 'GM', 'USED_CAR_MANAGER'],
    size: 'LARGE',
    componentPath: '@/components/widgets/InventoryAgingWidget',
    dataSource: '/api/inventory/aging',
    refreshInterval: 3600000, // 1 hour
    title: 'Inventory Aging',
    description: 'Vehicles by days in stock with pricing recommendations',
    priority: 'normal',
    tags: ['inventory', 'analytics'],
  },
];

/**
 * @autolytiq/ui
 * Autolytiq Design System - Component Library
 * Built with design tokens, CVA variants, and full accessibility
 */

// ═══════════════════════════════════════════════════════════════
// TIER 1 COMPONENTS (Form Controls & Inputs)
// ═══════════════════════════════════════════════════════════════
export * from './components/Button.js';
export * from './components/IconButton.js';
export * from './components/Input.js';
export * from './components/Select.js';
export * from './components/Checkbox.js';
export * from './components/Radio.js';
export * from './components/Switch.js';
export * from './components/Label.js';
export * from './components/FormField.js';

// ═══════════════════════════════════════════════════════════════
// TIER 2 COMPONENTS (Data Display & Feedback)
// ═══════════════════════════════════════════════════════════════
export * from './components/Table.js';
export * from './components/Card.js';
export * from './components/Badge.js';
export * from './components/Chip.js';
export * from './components/Avatar.js';
export * from './components/Tooltip.js';
export * from './components/Alert.js';
export * from './components/Progress.js';
export * from './components/Spinner.js';
export * from './components/Skeleton.js';
export * from './components/Divider.js';
export * from './components/Dot.js';
export * from './components/Kbd.js';
export * from './components/Menu.js';
export * from './components/Tabs.js';
export * from './components/Sheet.js';
export * from './components/SwipeableCard.js';
export * from './components/PullToRefresh.js';

// ═══════════════════════════════════════════════════════════════
// TIER 3 COMPONENTS (Data-Heavy / State Management)
// ═══════════════════════════════════════════════════════════════
export * from './components/DataTable.js';
export * from './components/QueryBuilder.js';
export * from './components/LiveDataFeed.js';
export * from './components/PivotTable.js';
export * from './components/AggregateCard.js';
export * from './components/FilterPanel.js';
export * from './components/DataExporter.js';

// ═══════════════════════════════════════════════════════════════
// TIER 4 COMPONENTS (Deal Management & Workflow)
// ═══════════════════════════════════════════════════════════════
export * from './components/DealJacket.js';
export * from './components/DealWorkspace.js';
export * from './components/RoleDashboard.js';

// ═══════════════════════════════════════════════════════════════
// LAYOUT COMPONENTS
// ═══════════════════════════════════════════════════════════════
export * from './layouts/ListDetailLayout.js';
export * from './layouts/FullDensityLayout.js';
export * from './layouts/FocusStudioLayout.js';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVES (Layout Building Blocks)
// ═══════════════════════════════════════════════════════════════
export * from './primitives/Box.js';
export * from './primitives/Stack.js';
export * from './primitives/Inline.js';
export * from './primitives/Surface.js';
export * from './primitives/Text.js';

// ═══════════════════════════════════════════════════════════════
// PATTERNS (Card System)
// ═══════════════════════════════════════════════════════════════
export * from './patterns/cards/MetricCard.js';
export * from './patterns/cards/ListCard.js';
export * from './patterns/cards/TrendCard.js';

// ═══════════════════════════════════════════════════════════════
// HOOKS (Mobile-First & Responsive)
// ═══════════════════════════════════════════════════════════════
export * from './hooks/useMobile.js';
export * from './hooks/useSwipeable.js';
export * from './hooks/usePullToRefresh.js';

// ═══════════════════════════════════════════════════════════════
// ICONS (Custom SVG Icon Library)
// ═══════════════════════════════════════════════════════════════
export * from './icons/index.js';

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════
export { cn } from './utils/cn.js';

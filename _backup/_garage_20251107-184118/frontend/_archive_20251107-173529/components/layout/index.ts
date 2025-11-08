/**
 * Layout Components
 *
 * IMPORTANT: All layout components should come from @repo/ui
 * This file re-exports them for convenience.
 *
 * DO NOT create custom layout components here.
 * Use UniformShell, AppShell, or layout templates from @repo/ui.
 */

// ═══════════════════════════════════════════════════════════════
// Layout & Navigation Components from @repo/ui
// ═══════════════════════════════════════════════════════════════

export {
  UniformShell,
  type UniformShellProps,
  type NavModule,
} from '@repo/ui';

export {
  AppShell,
  AppHeader,
  AppFooter,
  AppMain,
  AppAside,
  type AppShellProps,
  type AppHeaderProps,
  type AppFooterProps,
  type AppAsideProps,
} from '@repo/ui';

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
  type SidebarProps,
} from '@repo/ui';

export {
  PageHeader,
  type PageHeaderProps,
} from '@repo/ui';

// ═══════════════════════════════════════════════════════════════
// Layout Templates from @repo/ui
// ═══════════════════════════════════════════════════════════════

export {
  ListDetailLayout,
  type ListDetailLayoutProps,
} from '@repo/ui';

export {
  FullDensityLayout,
  type FullDensityLayoutProps,
} from '@repo/ui';

export {
  FocusStudioLayout,
  type FocusStudioLayoutProps,
} from '@repo/ui';

// ═══════════════════════════════════════════════════════════════
// Application-Specific Components
// ═══════════════════════════════════════════════════════════════

// Re-export the app's AppShell wrapper (configured for AutolytiQ)
export { default as AutolytiQAppShell } from './app-shell';

// ═══════════════════════════════════════════════════════════════
// Utility Layout Components (Domain-Specific)
// ═══════════════════════════════════════════════════════════════

// These are kept as they provide domain-specific functionality
// not part of the core UI library
export { default as CardGrid } from './card-grid';
export { default as ResponsiveTable } from './responsive-table';
export { default as StatsGrid } from './stats-grid';

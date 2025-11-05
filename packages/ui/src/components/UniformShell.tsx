/**
 * UniformShell - The App Frame
 *
 * This is the uniform part of the UI that never changes.
 * Provides navigation and context across the entire suite.
 *
 * Structure:
 * - Left Rail: Collapsible icon-based sidebar (primary navigation)
 * - Top Bar: Contextual header (search, tenant, profile)
 * - Content Area: Loads different layout templates
 */

import React, { useState } from 'react';
import { cn } from '../utils/cn.js';
import {
  LayoutDashboard,
  Users,
  Car,
  DollarSign,
  Calculator,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  Building2,
  Menu,
} from 'lucide-react';
import { useBreakpoint, useMobileBreakpoint } from '../hooks/useBreakpoint.js';

export interface NavModule {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  subItems?: {
    id: string;
    label: string;
    path: string;
  }[];
}

export interface UniformShellProps {
  /** Navigation modules */
  modules: NavModule[];
  /** Active module ID */
  activeModule?: string;
  /** Active sub-item ID */
  activeSubItem?: string;
  /** Tenant/Dealership name */
  tenant?: string;
  /** User name */
  user?: string;
  /** User avatar URL */
  userAvatar?: string;
  /** Notification count */
  notifications?: number;
  /** On navigation click */
  onNavigate?: (moduleId: string, subItemId?: string) => void;
  /** On search */
  onSearch?: (query: string) => void;
  /** On tenant switcher click */
  onTenantSwitch?: () => void;
  /** Content to render */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

export function UniformShell({
  modules,
  activeModule,
  activeSubItem,
  tenant = 'AutolytiQ',
  user = 'User',
  userAvatar,
  notifications = 0,
  onNavigate,
  onSearch,
  onTenantSwitch,
  children,
  className,
}: UniformShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(activeModule || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobileBreakpoint();
  const breakpoint = useBreakpoint();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleModuleClick = (module: NavModule) => {
    if (module.subItems && module.subItems.length > 0) {
      // Expand/collapse sub-navigation
      setExpandedModule(expandedModule === module.id ? null : module.id);
    } else {
      // Navigate directly
      onNavigate?.(module.id);
      if (isMobile) setMobileMenuOpen(false);
    }
  };

  const handleSubItemClick = (moduleId: string, subItemId: string) => {
    onNavigate?.(moduleId, subItemId);
    if (isMobile) setMobileMenuOpen(false);
  };

  // Sidebar width
  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <div className={cn('flex h-screen overflow-hidden bg-canvas', className)}>
      {/* ═══════════════════════════════════════════════════════════════
       * LEFT RAIL - Primary Navigation
       * ═══════════════════════════════════════════════════════════════ */}
      {!isMobile && (
        <aside
          className={cn(
            'flex flex-col border-r border-default bg-elevated transition-all duration-300',
            sidebarWidth
          )}
        >
          {/* Logo */}
          <div className="flex h-14 items-center justify-between border-b border-default px-4">
            {!isCollapsed && (
              <span className="text-lg font-semibold text-primary">AutolytiQ</span>
            )}
            <button
              onClick={toggleSidebar}
              className="rounded p-1.5 text-secondary hover:bg-inset hover:text-primary"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="h-[18px] w-[18px]" /> : <ChevronLeft className="h-[18px] w-[18px]" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {modules.map((module) => (
              <div key={module.id}>
                {/* Module Button */}
                <button
                  onClick={() => handleModuleClick(module)}
                  className={cn(
                    'group relative flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    activeModule === module.id
                      ? 'bg-[rgb(var(--action-primary)_/_0.1)] text-[rgb(var(--action-primary))]'
                      : 'text-secondary hover:bg-inset hover:text-primary'
                  )}
                >
                  <module.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">{module.label}</span>}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full ml-2 hidden rounded bg-[rgb(var(--text-primary))] px-2 py-1 text-xs text-[rgb(var(--text-inverse))] opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
                      {module.label}
                    </div>
                  )}
                </button>

                {/* Sub-navigation (expanded) */}
                {!isCollapsed && expandedModule === module.id && module.subItems && (
                  <div className="bg-inset py-1">
                    {module.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => handleSubItemClick(module.id, subItem.id)}
                        className={cn(
                          'flex w-full items-center px-4 py-2 pl-12 text-left text-sm transition-colors',
                          activeSubItem === subItem.id
                            ? 'text-[rgb(var(--action-primary))] font-medium'
                            : 'text-tertiary hover:text-primary'
                        )}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
      )}

      {/* ═══════════════════════════════════════════════════════════════
       * MAIN AREA (Top Bar + Content)
       * ═══════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar - Contextual Header */}
        <header className="flex h-14 items-center justify-between border-b border-default bg-elevated px-4">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={toggleMobileMenu}
                className="rounded p-1.5 text-secondary hover:bg-inset hover:text-primary"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Global Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 rounded border border-default bg-canvas pl-9 pr-3 text-sm text-primary placeholder:text-placeholder focus:border-[rgb(var(--action-primary))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--action-primary))] sm:w-64"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Right: Tenant switcher, Notifications, Profile */}
          <div className="flex items-center gap-2">
            {/* Tenant/Dealership Switcher */}
            <button
              onClick={onTenantSwitch}
              className="flex items-center gap-2 rounded px-3 py-1.5 text-sm text-secondary hover:bg-inset hover:text-primary"
            >
              <Building2 className="h-4 w-4" />
              {!isMobile && <span>{tenant}</span>}
            </button>

            {/* Notifications */}
            <button className="relative rounded p-2 text-secondary hover:bg-inset hover:text-primary">
              <Bell className="h-[18px] w-[18px]" />
              {notifications > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(var(--error))] text-[10px] font-medium text-white">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* User Profile */}
            <button className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-inset">
              {userAvatar ? (
                <img src={userAvatar} alt={user} className="h-6 w-6 rounded-full" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--action-primary))] text-xs font-medium text-white">
                  {user.charAt(0).toUpperCase()}
                </div>
              )}
              {!isMobile && <span className="text-sm text-secondary">{user}</span>}
            </button>
          </div>
        </header>

        {/* Content Area - Different layouts load here */}
        <main className="flex-1 overflow-auto bg-canvas">
          {children}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
       * MOBILE MENU - Slide-in navigation
       * ═══════════════════════════════════════════════════════════════ */}
      {isMobile && mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={toggleMobileMenu}
          />

          {/* Slide-in Menu */}
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-elevated shadow-xl">
            {/* Logo */}
            <div className="flex h-14 items-center justify-between border-b border-default px-4">
              <span className="text-lg font-semibold text-[rgb(var(--action-primary))]">AutolytiQ</span>
              <button
                onClick={toggleMobileMenu}
                className="rounded p-1.5 text-secondary hover:bg-inset"
              >
                <ChevronLeft className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="overflow-y-auto py-4">
              {modules.map((module) => (
                <div key={module.id}>
                  <button
                    onClick={() => handleModuleClick(module)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left',
                      activeModule === module.id
                        ? 'bg-[rgb(var(--action-primary)_/_0.1)] text-[rgb(var(--action-primary))]'
                        : 'text-secondary hover:bg-inset hover:text-primary'
                    )}
                  >
                    <module.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{module.label}</span>
                  </button>

                  {expandedModule === module.id && module.subItems && (
                    <div className="bg-inset py-1">
                      {module.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleSubItemClick(module.id, subItem.id)}
                          className={cn(
                            'flex w-full items-center px-4 py-2 pl-12 text-left text-sm',
                            activeSubItem === subItem.id
                              ? 'text-[rgb(var(--action-primary))] font-medium'
                              : 'text-tertiary hover:text-primary'
                          )}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}

UniformShell.displayName = 'UniformShell';

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
  LogOut,
} from 'lucide-react';
import { useBreakpoint, useMobileBreakpoint } from '../hooks/useBreakpoint.js';
import { IntelligentSearch, type SearchSuggestion } from './IntelligentSearch.js';

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
  /** Search suggestions */
  searchSuggestions?: SearchSuggestion[];
  /** Recent searches */
  recentSearches?: string[];
  /** Popular searches */
  popularSearches?: string[];
  /** Search shortcuts */
  searchShortcuts?: Array<{ label: string; query: string }>;
  /** On tenant switcher click */
  onTenantSwitch?: () => void;
  /** On user menu click */
  onUserMenuClick?: () => void;
  /** On logout click */
  onLogout?: () => void;
  /** On settings click */
  onSettings?: () => void;
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
  searchSuggestions = [],
  recentSearches = [],
  popularSearches = [],
  searchShortcuts = [],
  onTenantSwitch,
  onUserMenuClick,
  onLogout,
  onSettings,
  children,
  className,
}: UniformShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(activeModule || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
              <span className="text-lg font-semibold text-text-primary">AutolytiQ</span>
            )}
            <button
              onClick={toggleSidebar}
              className="rounded p-1.5 text-text-secondary hover:bg-inset hover:text-text-primary"
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
                      : 'text-text-secondary hover:bg-inset hover:text-text-primary'
                  )}
                >
                  <module.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">{module.label}</span>}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full ml-2 hidden rounded bg-surface-elevated px-2 py-1 text-xs text-text-primary opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100">
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
                            : 'text-text-tertiary hover:text-text-primary'
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
        {/* Top Bar - Contextual Header - STICKY ON MOBILE */}
        <header className={cn(
          "flex h-14 items-center justify-between border-b border-default bg-elevated px-4",
          isMobile && "sticky top-0 z-30 shadow-sm"
        )}>
          {/* Left: Mobile logo + Search */}
          <div className="flex items-center gap-3 flex-1">
            {isMobile && (
              <span className="text-base font-bold text-[rgb(var(--action-primary))]">
                AutolytiQ
              </span>
            )}

            {/* Global Search - Hidden on very small mobile */}
            <div className="hidden xs:block w-full sm:w-64">
              <IntelligentSearch
                placeholder="Search..."
                suggestions={searchSuggestions}
                recentSearches={recentSearches}
                popularSearches={popularSearches}
                shortcuts={searchShortcuts}
                onSearch={(query) => onSearch?.(query)}
                className="w-full"
              />
            </div>
          </div>

          {/* Right: Tenant switcher, Notifications, Profile */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Tenant/Dealership Switcher - Icon only on mobile */}
            <button
              onClick={onTenantSwitch}
              className="flex items-center gap-2 rounded px-3 py-1.5 text-sm text-text-secondary hover:bg-inset hover:text-text-primary"
            >
              <Building2 className="h-4 w-4" />
              {!isMobile && <span>{tenant}</span>}
            </button>

            {/* Notifications */}
            <button className="relative rounded p-2 text-text-secondary hover:bg-inset hover:text-text-primary">
              <Bell className="h-[18px] w-[18px]" />
              {notifications > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[rgb(var(--error))] text-[10px] font-medium text-white">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-inset"
              >
                {userAvatar ? (
                  <img src={userAvatar} alt={user} className="h-6 w-6 rounded-full" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgb(var(--action-primary))] text-xs font-medium text-white">
                    {user.charAt(0).toUpperCase()}
                  </div>
                )}
                {!isMobile && <span className="text-sm text-text-secondary">{user}</span>}
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 z-20 rounded-lg border border-border-base bg-surface-elevated shadow-lg">
                    <div className="px-4 py-3 border-b border-border-base">
                      <p className="text-sm font-medium text-text-primary">{user}</p>
                      <p className="text-xs text-text-tertiary">{tenant}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onSettings?.();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text-secondary hover:bg-inset hover:text-text-primary"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          onLogout?.();
                          setUserMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-status-error hover:bg-inset"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area - Different layouts load here */}
        <main className={cn(
          "flex-1 overflow-auto bg-canvas",
          isMobile && "pb-20" // Add bottom padding on mobile for bottom nav
        )}>
          {children}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
       * MOBILE BOTTOM NAVIGATION BAR
       * ═══════════════════════════════════════════════════════════════ */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border-base bg-surface-elevated shadow-[0_-2px_10px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
          {modules.slice(0, 5).map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleClick(module)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 px-1 transition-colors',
                activeModule === module.id
                  ? 'text-[rgb(var(--action-primary))]'
                  : 'text-text-tertiary'
              )}
            >
              <module.icon className={cn(
                'h-6 w-6',
                activeModule === module.id ? 'stroke-[2.5]' : 'stroke-2'
              )} />
              <span className="text-[10px] font-medium leading-tight">{module.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ═══════════════════════════════════════════════════════════════
       * MOBILE SUB-MENU MODAL (for modules with sub-items)
       * ═══════════════════════════════════════════════════════════════ */}
      {isMobile && expandedModule && (
        <div
          className={cn(
            'fixed inset-0 z-40 transition-opacity duration-200',
            'opacity-100'
          )}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setExpandedModule(null)}
          />

          {/* Bottom Sheet */}
          <div className="absolute bottom-16 left-0 right-0 max-h-[60vh] rounded-t-2xl border-t border-border-base bg-surface-elevated shadow-xl">
            <div className="px-4 py-3 border-b border-border-base">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  {modules.find(m => m.id === expandedModule)?.label}
                </h3>
                <button
                  onClick={() => setExpandedModule(null)}
                  className="rounded-full p-1.5 text-text-secondary hover:bg-inset"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto px-2 py-2">
              {modules.find(m => m.id === expandedModule)?.subItems?.map((subItem) => (
                <button
                  key={subItem.id}
                  onClick={() => {
                    handleSubItemClick(expandedModule, subItem.id);
                    setExpandedModule(null);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors',
                    activeSubItem === subItem.id
                      ? 'bg-[rgb(var(--action-primary)_/_0.15)] text-[rgb(var(--action-primary))] font-semibold'
                      : 'text-text-secondary hover:bg-inset hover:text-text-primary'
                  )}
                >
                  <span className="text-sm">{subItem.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

UniformShell.displayName = 'UniformShell';

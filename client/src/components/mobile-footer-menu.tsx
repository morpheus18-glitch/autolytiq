import React, { useMemo, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Building, X } from 'lucide-react';
import {
  MOBILE_ALL_NAV_ITEMS,
  MOBILE_PRIMARY_NAV_ITEMS,
  MOBILE_QUICK_ACTIONS,
  type MobileNavItem
} from '@/config/navigation';
import { isHomePath } from '@/lib/userHomePath';
import { useAuth } from '@/hooks/useAuth';

export function MobileFooterMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const allowedRouteSet = useMemo(() => {
    const allowed = user?.access?.allowedRoutes ?? [];
    return new Set(allowed.length > 0 ? allowed : ['*']);
  }, [user?.access?.allowedRoutes]);

  const primaryNavItems = useMemo(() => {
    return MOBILE_PRIMARY_NAV_ITEMS.filter((item) => {
      if (item.isMenu) {
        return true;
      }

      if (allowedRouteSet.has('*')) {
        return true;
      }

      if (allowedRouteSet.has(item.href)) {
        return true;
      }

      return item.matchPaths?.some((candidate) => allowedRouteSet.has(candidate)) ?? false;
    });
  }, [allowedRouteSet]);

  const allNavItems = useMemo(() => {
    if (allowedRouteSet.has('*')) {
      return MOBILE_ALL_NAV_ITEMS;
    }

    return MOBILE_ALL_NAV_ITEMS.filter((item) => {
      if (item.isMenu) {
        return true;
      }

      if (allowedRouteSet.has(item.href)) {
        return true;
      }

      return item.matchPaths?.some((candidate) => allowedRouteSet.has(candidate)) ?? false;
    });
  }, [allowedRouteSet]);

  const quickActions = useMemo(() => {
    if (allowedRouteSet.has('*')) {
      return MOBILE_QUICK_ACTIONS;
    }

    return MOBILE_QUICK_ACTIONS.filter((action) => allowedRouteSet.has(action.href));
  }, [allowedRouteSet]);

  const normalizePath = (value: string) => {
    if (value === '/') {
      return '/';
    }
    return value.endsWith('/') ? value.slice(0, -1) : value;
  };

  const matchesPath = (path: string | undefined, current: string) => {
    if (!path) return false;
    if (path === '/' || path === '/dashboard') {
      return isHomePath(current);
    }
    const normalized = normalizePath(path);
    const normalizedCurrent = normalizePath(current);
    return (
      normalizedCurrent === normalized ||
      normalizedCurrent.startsWith(`${normalized}/`)
    );
  };

  const isPathActive = (item: MobileNavItem) => {
    if (matchesPath(item.href, location)) {
      return true;
    }
    return item.matchPaths?.some((candidate) => matchesPath(candidate, location)) ?? false;
  };

  const handleNavClick = (item: MobileNavItem) => {
    if (item.isMenu) {
      setIsMenuOpen(true);
    } else {
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Sticky Bottom Mobile Footer - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 mobile-glass-nav z-sticky safe-area-pb">
        <div className="grid grid-cols-4 gap-0">
          {primaryNavItems.map((item) => {
            const isActive = isPathActive(item);
            const Icon = item.icon;

            if (item.isMenu) {
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center px-2 py-2.5 min-h-[54px] transition-all text-muted-foreground hover:text-brand-primary hover:bg-surface-base/80 dark:hover:bg-surface-dark/60"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                </button>
              );
            }

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex flex-col items-center justify-center p-3 min-h-[60px] transition-colors ${
                    isActive
                      ? 'bg-brand-primary/15 text-brand-primary shadow-sm'
                      : 'text-muted-foreground hover:text-brand-primary hover:bg-surface-base/80 dark:hover:bg-surface-dark/60'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1 font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-modalBackdrop bg-overlay-backdrop backdrop-blur-lg">
          <div className="fixed bottom-0 left-0 right-0 rounded-t-3xl border-t border-border/60 bg-surface-base/95 shadow-modal max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-3xl border-b border-border/60 bg-surface-base/90 px-5 py-4 backdrop-blur-xl dark:bg-surface-dark/70">
              <div className="flex items-center space-x-2 text-foreground">
                <Building className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg font-semibold">AutolytiQ Navigation</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Grid */}
            <div className="p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {allNavItems.map((item) => {
                  const isActive = isPathActive(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name} 
                      href={item.href} 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div
                        className={`flex items-center rounded-2xl border px-4 py-4 transition-all duration-200 ${
                          isActive
                            ? 'border-brand-primary/35 bg-brand-primary/10 shadow-sm'
                            : 'border-border/60 hover:border-brand-primary/30 hover:bg-surface-base/85 dark:hover:bg-surface-dark/60'
                        }`}
                      >
                        <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground leading-snug">
                            {item.name === 'Dashboard' && 'Overview & KPIs'}
                            {item.name === 'Sales & Leads' && 'Lead management'}
                            {item.name === 'Customers' && 'CRM & contacts'}
                            {item.name === 'Inventory' && 'Vehicle catalog'}
                            {item.name === 'Deal Desk' && 'Finance & deals'}
                            {item.name === 'Showroom' && 'Live tracking'}
                            {item.name === 'Analytics' && 'Data insights'}
                            {item.name === 'Reports' && 'Business reports'}
                            {item.name === 'Settings' && 'Configuration'}
                            {item.name === 'Admin' && 'System admin'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-border/55">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg border-border/60 text-xs hover:border-brand-primary/35">
                          <ActionIcon className="h-3 w-3" />
                          {action.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Building, X } from 'lucide-react';
import {
  MOBILE_ALL_NAV_ITEMS,
  MOBILE_PRIMARY_NAV_ITEMS,
  MOBILE_QUICK_ACTIONS,
  type MobileNavItem
} from '@/config/navigation';

export function MobileFooterMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const matchesPath = (path: string | undefined, current: string) => {
    if (!path) return false;
    if (path === '/') {
      return current === '/';
    }
    const normalized = path.endsWith('/') ? path.slice(0, -1) : path;
    return current === normalized || current.startsWith(`${normalized}/`);
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 mobile-glass-nav z-50 safe-area-pb">
        <div className="grid grid-cols-4 gap-0">
          {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = isPathActive(item);
            const Icon = item.icon;

            if (item.isMenu) {
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center p-3 min-h-[60px] transition-all text-muted-foreground hover:text-primary hover:bg-white/70 dark:hover:bg-white/10"
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
                      ? 'bg-primary/15 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-primary hover:bg-white/70 dark:hover:bg-white/10'
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
        <div className="md:hidden fixed inset-0 z-50 bg-background/90 backdrop-blur-lg">
          <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl bg-background/95 shadow-card-xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl border-b border-border/60 bg-white/70 px-5 py-4 dark:bg-white/10">
              <div className="flex items-center space-x-2 text-foreground">
                <Building className="w-5 h-5 text-primary" />
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
              <div className="grid grid-cols-2 gap-3">
                {MOBILE_ALL_NAV_ITEMS.map((item) => {
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
                            ? 'border-primary/40 bg-primary/10 shadow-sm'
                            : 'border-border/70 hover:border-primary/35 hover:bg-white/70 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
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
              <div className="mt-6 pt-4 border-t border-border/60">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {MOBILE_QUICK_ACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg text-xs">
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
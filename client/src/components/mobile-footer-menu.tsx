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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-pb border-t border-border/70 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-950/70">
        <div className="grid grid-cols-4 gap-0">
          {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = isPathActive(item);
            const Icon = item.icon;
            
            if (item.isMenu) {
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  className="flex flex-col items-center justify-center p-3 min-h-[60px] transition-colors text-muted-foreground hover:text-primary hover:bg-primary/10"
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
                      ? 'bg-primary/15 text-primary shadow-[0_10px_24px_-20px_rgba(59,130,246,0.5)]'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
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
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm">
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/90 rounded-t-2xl max-h-[80vh] overflow-y-auto border border-border/60">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/70 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/15 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-900/80 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">AutolytiQ Navigation</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl hover:bg-primary/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Grid */}
            <div className="p-4">
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
                      <div className={`flex items-center p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg ${
                        isActive
                          ? 'border-primary/40 bg-primary/15 shadow-[0_18px_40px_-28px_rgba(59,130,246,0.55)]'
                          : 'border-border/70 hover:border-primary/40 hover:bg-primary/10'
                      }`}>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary mr-3">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{item.name}</p>
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
              <div className="mt-6 pt-4 border-t border-border/70">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.3em] mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {MOBILE_QUICK_ACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button variant="ghost" size="sm" className="w-full text-xs justify-start gap-2 rounded-xl border border-border/60 bg-white/80 dark:bg-slate-950/70 hover:bg-primary/10">
                          <ActionIcon className="w-3 h-3" />
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
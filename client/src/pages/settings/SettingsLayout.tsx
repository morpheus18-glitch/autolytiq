import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Building2,
  Code,
  Database,
  DollarSign,
  FileText,
  Menu,
  Palette,
  Plug,
  Shield,
  Users as UsersIcon,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';

export interface SettingsNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requiresDeveloper?: boolean;
}

const NAVIGATION_ITEMS: SettingsNavItem[] = [
  { label: 'Dealership', to: 'dealership', icon: Building2 },
  {
    label: 'Users',
    to: 'users',
    icon: UsersIcon,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Pricing',
    to: 'pricing',
    icon: DollarSign,
    requiredRoles: ['ADMIN', 'MANAGER'],
  },
  { label: 'Forms', to: 'forms', icon: FileText },
  {
    label: 'Notifications',
    to: 'notifications',
    icon: Bell,
    requiredRoles: ['ADMIN', 'MANAGER'],
  },
  {
    label: 'Security',
    to: 'security',
    icon: Shield,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Branding',
    to: 'branding',
    icon: Palette,
    requiredRoles: ['ADMIN', 'MANAGER'],
  },
  {
    label: 'Integrations',
    to: 'integrations',
    icon: Plug,
    requiredRoles: ['ADMIN'],
  },
  {
    label: 'Data',
    to: 'data',
    icon: Database,
    requiredRoles: ['ADMIN'],
  },
  { label: 'Analytics', to: 'analytics', icon: BarChart3 },
  {
    label: 'Developer',
    to: 'developer',
    icon: Code,
    requiresDeveloper: true,
  },
];

export function SettingsLayout(): JSX.Element {
  const location = useLocation();
  const { hasAnyRole, hasPermission, canAccessDeveloper, user } = usePermissions();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo(() => {
    return NAVIGATION_ITEMS.filter((item) => {
      if (!user) {
        return false;
      }

      if (item.requiresDeveloper && !canAccessDeveloper) {
        return false;
      }

      if (item.requiredPermissions?.length) {
        const passesPermissions = item.requiredPermissions.every((permission) =>
          hasPermission(permission),
        );

        if (!passesPermissions) {
          return false;
        }
      }

      if (item.requiredRoles?.length) {
        return hasAnyRole(item.requiredRoles);
      }

      return true;
    });
  }, [canAccessDeveloper, hasAnyRole, hasPermission, user]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background text-foreground lg:flex-row">
      <aside
        className={cn(
          'border-b border-border bg-card/60 backdrop-blur lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)] lg:w-72 lg:border-b-0 lg:border-r',
          mobileOpen ? 'block' : 'hidden lg:block',
        )}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-lg font-semibold">Settings</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Close settings navigation"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
        <nav className="space-y-1 px-2 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={`/${item.to}`}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-border bg-card/40 px-4 py-3 backdrop-blur lg:hidden">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Settings</p>
            <h1 className="text-lg font-semibold">
              {items.find((item) => location.pathname.endsWith(item.to))?.label ?? 'Overview'}
            </h1>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle settings navigation"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </Button>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default SettingsLayout;

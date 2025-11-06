/**
 * AppShell - Main Application Layout Wrapper
 *
 * This is a simple wrapper around @repo/ui's UniformShell.
 * All layout logic should come from the component library.
 *
 * IMPORTANT: This file should only handle:
 * - Navigation configuration (modules/routes)
 * - Navigation callbacks (routing logic)
 * - Application-specific context (tenant, user)
 *
 * DO NOT add custom layout logic here. Use @repo/ui components.
 */

import type { ReactNode } from 'react';
import { UniformShell, type NavModule } from '@repo/ui';
import { useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  Car,
  DollarSign,
  Calculator,
  BarChart3,
  MessageSquare,
  Settings
} from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

// Define navigation modules based on the app's IA
const navigationModules: NavModule[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    path: '/customers',
    subItems: [
      { id: 'customers', label: 'Customers', path: '/customers' },
      { id: 'leads', label: 'Leads', path: '/leads' },
      { id: 'communications', label: 'Communications', path: '/communications' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Car,
    path: '/inventory',
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: Calculator,
    path: '/deals',
    subItems: [
      { id: 'active-deals', label: 'Active Deals', path: '/deals' },
      { id: 'desking', label: 'Desking', path: '/desking' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    icon: DollarSign,
    path: '/accounting',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/reports',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Settings,
    path: '/admin',
  },
];

export default function AppShell({ children }: AppShellProps) {
  const [location, setLocation] = useLocation();

  // Determine active module based on current route
  const getActiveModule = () => {
    const path = location;
    for (const module of navigationModules) {
      if (path.startsWith(module.path || '')) {
        return module.id;
      }
    }
    return undefined;
  };

  // Determine active sub-item
  const getActiveSubItem = () => {
    const path = location;
    for (const module of navigationModules) {
      if (module.subItems) {
        for (const subItem of module.subItems) {
          if (path.startsWith(subItem.path)) {
            return subItem.id;
          }
        }
      }
    }
    return undefined;
  };

  const handleNavigate = (moduleId: string, subItemId?: string) => {
    const module = navigationModules.find(m => m.id === moduleId);
    if (!module) return;

    if (subItemId && module.subItems) {
      const subItem = module.subItems.find(s => s.id === subItemId);
      if (subItem) {
        setLocation(subItem.path);
      }
    } else if (module.path) {
      setLocation(module.path);
    }
  };

  return (
    <UniformShell
      modules={navigationModules}
      activeModule={getActiveModule()}
      activeSubItem={getActiveSubItem()}
      tenant="AutolytiQ" // TODO: Get from auth context
      user="User" // TODO: Get from auth context
      onNavigate={handleNavigate}
      onSearch={(query) => console.log('Search:', query)} // TODO: Implement global search
      onTenantSwitch={() => console.log('Tenant switch')} // TODO: Implement tenant switcher
    >
      {/* Content with grid overlay and proper spacing */}
      <div className="relative min-h-full">
        <div className="pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0 z-0 grid-overlay opacity-70 dark:opacity-40" />
        </div>
        <div className="relative z-10 px-4 pt-6 pb-6 sm:px-6 md:px-8 lg:px-10">
          {children}
        </div>
      </div>
    </UniformShell>
  );
}

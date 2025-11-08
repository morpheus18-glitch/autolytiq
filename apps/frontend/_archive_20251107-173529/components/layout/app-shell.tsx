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

import { useState, useEffect } from 'react';
import { UniformShell, type NavModule, TenantSwitcher, type Tenant } from '@repo/ui';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/contexts/theme-context';
import { clearAuthToken } from '@/lib/auth';

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

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [tenantSwitcherOpen, setTenantSwitcherOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Mock tenants - TODO: Get from API
  const tenants: Tenant[] = [
    { id: user?.tenantId || '1', name: user?.store?.name || 'AutolytiQ Demo' },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  }, []);

  // Determine active module based on current route
  const getActiveModule = () => {
    const path = location.pathname;
    for (const module of navigationModules) {
      if (path.startsWith(module.path || '')) {
        return module.id;
      }
    }
    return undefined;
  };

  // Determine active sub-item
  const getActiveSubItem = () => {
    const path = location.pathname;
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
        navigate(subItem.path);
      }
    } else if (module.path) {
      navigate(module.path);
    }
  };

  const handleSearch = async (query: string) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });

    // Navigate to search results page with query
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login');
  };

  const handleTenantSwitch = async (tenantId: string) => {
    try {
      // Call tenant switch API
      const response = await fetch('/api/auth/switch-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      if (response.ok) {
        // Reload to apply new tenant context
        window.location.reload();
      } else {
        console.error('Failed to switch tenant');
      }
    } catch (error) {
      console.error('Error switching tenant:', error);
    }
  };

  // Get display name
  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email
    : 'User';

  // Popular searches for demo
  const popularSearches = ['John Smith', 'Toyota Camry', 'Deal #12345', 'VIN: 1HGBH41...'];

  // Search shortcuts
  const searchShortcuts = [
    { label: 'All active deals', query: 'status:active type:deal' },
    { label: 'Hot leads this week', query: 'status:hot created:this-week type:lead' },
    { label: 'Inventory under $20k', query: 'price:<20000 type:vehicle' },
  ];

  return (
    <>
      <UniformShell
        modules={navigationModules}
        activeModule={getActiveModule()}
        activeSubItem={getActiveSubItem()}
        tenant={user?.store?.name || 'AutolytiQ'}
        user={displayName}
        userAvatar={user?.avatar}
        notifications={unreadCount}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        recentSearches={recentSearches}
        popularSearches={popularSearches}
        searchShortcuts={searchShortcuts}
        onTenantSwitch={() => setTenantSwitcherOpen(true)}
        onSettings={() => navigate('/settings')}
        onLogout={handleLogout}
        >
        {/* Content with grid overlay and proper spacing */}
        <div className="relative min-h-full">
          <div className="pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 z-0 grid-overlay opacity-70 dark:opacity-40" />
          </div>
          <div className="relative z-10 px-4 pt-6 pb-6 sm:px-6 md:px-8 lg:px-10">
            <Outlet />
          </div>
        </div>
      </UniformShell>

      {/* Tenant Switcher Modal */}
      <TenantSwitcher
        isOpen={tenantSwitcherOpen}
        onClose={() => setTenantSwitcherOpen(false)}
        tenants={tenants}
        currentTenantId={user?.tenantId || '1'}
        onSwitch={handleTenantSwitch}
      />
    </>
  );
}

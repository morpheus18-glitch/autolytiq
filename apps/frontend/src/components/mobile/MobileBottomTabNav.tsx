import { useLocation, useNavigate } from 'react-router-dom';
import { cn, Home, Briefcase, BarChart3, Settings } from '@repo/ui';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const tabs: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/home' },
  { id: 'work', label: 'Work', icon: Briefcase, path: '/work' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { id: 'setup', label: 'Setup', icon: Settings, path: '/settings' },
];

export function MobileBottomTabNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentTab = tabs.find((tab) => location.pathname.startsWith(tab.path))?.id || 'home';

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 bg-bg-1/95 backdrop-blur-lg border-t border-border-base/60 md:hidden shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
      role="navigation"
      aria-label="Mobile bottom navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="grid grid-cols-4 h-18">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <li key={tab.id}>
              <button
                onClick={() => navigate(tab.path)}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full gap-1',
                  'text-xs font-semibold transition-all duration-200',
                  'active:scale-95',
                  isActive
                    ? 'text-accent-primary'
                    : 'text-text-muted hover:text-text-2'
                )}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className={cn(
                  'flex items-center justify-center rounded-xl transition-all duration-200',
                  isActive ? 'w-14 h-9 bg-accent-primary/10' : 'w-7 h-7'
                )}>
                  <Icon className={cn(
                    'transition-all duration-200',
                    isActive ? 'w-6 h-6' : 'w-6 h-6'
                  )} />
                </div>
                <span className={cn(
                  'transition-all duration-200',
                  isActive ? 'opacity-100 font-bold' : 'opacity-70'
                )}>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

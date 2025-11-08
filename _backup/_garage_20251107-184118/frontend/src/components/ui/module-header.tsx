import { LucideIcon } from 'lucide-react';
import { getHeaderGradient, ModuleType } from '@/lib/theme-utils';

interface QuickStat {
  label: string;
  value: string | number;
}

interface ModuleHeaderProps {
  module: ModuleType;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  stats?: QuickStat[];
  filters?: React.ReactNode;
  children?: React.ReactNode;
}

export function ModuleHeader({
  module,
  title,
  subtitle,
  icon: Icon,
  action,
  stats,
  filters,
  children
}: ModuleHeaderProps) {
  return (
    <div className={`${getHeaderGradient(module)} text-white shadow-lg sticky top-0 z-40`}>
      <div className="px-4 py-4">
        {/* Title and Action */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-6 w-6" />}
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-sm text-white/80 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>

        {/* Quick Stats */}
        {stats && stats.length > 0 && (
          <div className={`grid ${stats.length === 3 ? 'grid-cols-3' : stats.length === 4 ? 'grid-cols-4' : 'grid-cols-2'} gap-2 mb-4`}>
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        {filters && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters}
          </div>
        )}

        {/* Additional Children */}
        {children}
      </div>
    </div>
  );
}

interface FilterPillProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  testId?: string;
}

export function FilterPill({ active, onClick, children, testId }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-white text-gray-900'
          : 'bg-white/10 text-white hover:bg-white/20'
      }`}
      data-testid={testId || `filter-pill-${String(children).toLowerCase().replace(/\s+/g, '-')}`}
    >
      {children}
    </button>
  );
}

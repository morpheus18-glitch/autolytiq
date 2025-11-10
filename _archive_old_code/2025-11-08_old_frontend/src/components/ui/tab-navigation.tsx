import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
  className?: string;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  className
}: TabNavigationProps) {
  if (variant === 'pills') {
    return (
      <div className={cn("flex gap-2 overflow-x-auto pb-2 scrollbar-hide", className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === tab.id
                ? "bg-white text-gray-900"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex border-b border-gray-200 bg-white", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "flex-1 px-4 py-3 font-medium transition-colors relative",
            activeTab === tab.id
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          )}
          data-testid={`tab-${tab.id}`}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className={cn(
              "ml-2 px-2 py-0.5 rounded-full text-xs",
              activeTab === tab.id
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600"
            )}>
              {tab.badge}
            </span>
          )}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      ))}
    </div>
  );
}

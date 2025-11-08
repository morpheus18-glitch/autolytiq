import { ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn.js';

interface CollapsibleSectionProps {
  title: string;
  icon?: LucideIcon;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  iconColor?: string;
  className?: string;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  isExpanded,
  onToggle,
  children,
  badge,
  iconColor = 'text-blue-600',
  className
}: CollapsibleSectionProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-sm mb-3 overflow-hidden", className)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white hover:from-slate-100 transition-colors"
        data-testid={`collapsible-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {badge && <span className="text-xs text-gray-500">{badge}</span>}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

import { ReactNode } from 'react';
import { CommunicationFilter } from '@/stores/communications-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface UnifiedFilterDefinition {
  id: CommunicationFilter;
  label: string;
  description?: string;
  icon?: ReactNode;
  count?: number;
}

export interface UnifiedFiltersProps {
  filters: UnifiedFilterDefinition[];
  active: CommunicationFilter[];
  onToggle: (filter: CommunicationFilter) => void;
  onClear?: () => void;
}

export function UnifiedFilters({ filters, active, onToggle, onClear }: UnifiedFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = active.includes(filter.id);
          return (
            <Button
              key={filter.id}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className={cn('flex items-center gap-2 text-xs uppercase tracking-wide', isActive ? 'shadow-md' : '')}
              onClick={() => onToggle(filter.id)}
            >
              {filter.icon}
              <span>{filter.label}</span>
              {typeof filter.count === 'number' ? (
                <Badge
                  variant={isActive ? 'secondary' : 'outline'}
                  className="ml-1 rounded-full px-2 text-[11px]"
                >
                  {filter.count}
                </Badge>
              ) : null}
            </Button>
          );
        })}
      </div>
      {onClear ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto h-8 px-3 text-xs"
          onClick={onClear}
        >
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

export default UnifiedFilters;

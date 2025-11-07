import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import type { Insight } from '@repo/insights-engine';

const insightCardVariants = cva(
  'rounded-lg border p-4 transition-smooth',
  {
    variants: {
      severity: {
        critical: 'border-status-error bg-status-error/5',
        high: 'border-status-warning bg-status-warning/5',
        normal: 'border-border-base bg-surface-elevated',
        low: 'border-border-subtle bg-surface-base',
      },
    },
    defaultVariants: {
      severity: 'normal',
    },
  }
);

export interface InsightCardProps extends VariantProps<typeof insightCardVariants> {
  insight: Insight;
  onAction?: (action: string, params?: Record<string, any>) => void;
  className?: string;
}

export function InsightCard({ insight, severity, onAction, className }: InsightCardProps) {
  const handleAction = () => {
    if (insight.quickAction && onAction) {
      onAction(insight.quickAction.action, insight.quickAction.params);
    }
  };

  return (
    <div className={cn(insightCardVariants({ severity: severity || insight.severity }), className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-primary">{insight.summary}</p>
          <p className="text-xs text-text-secondary mt-1">
            {insight.entityRef.type} • {insight.entityRef.id.slice(0, 8)}
          </p>
        </div>
        {insight.quickAction && (
          <button
            onClick={handleAction}
            className="text-xs font-medium text-accent-primary hover:text-accent-primary-hover"
          >
            {insight.quickAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

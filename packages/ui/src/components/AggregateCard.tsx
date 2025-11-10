/**
 * AggregateCard - Quick metric display with trends and comparisons
 *
 * Features:
 * - Multiple metric display (sum, avg, count, min, max)
 * - Trend indicators (up/down/unchanged)
 * - Comparison to previous period
 * - Sparkline charts
 * - Color-coded status
 * - Click-through actions
 *
 * Perfect for: KPI dashboards, financial summaries, sales metrics
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type TrendDirection = 'up' | 'down' | 'flat';
export type MetricStatus = 'success' | 'warning' | 'error' | 'neutral';

export interface AggregateMetric {
  label: string;
  value: number | string;
  format?: (value: number | string) => string;
  unit?: string; // e.g., '$', '%', 'units'
  decimals?: number;
}

export interface TrendData {
  direction: TrendDirection;
  value: number; // Percentage change
  label?: string; // e.g., 'vs last month'
}

export interface ComparisonData {
  label: string;
  current: number;
  previous: number;
  format?: (value: number) => string;
}

// ═══════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════

const aggregateCardVariants = cva(
  'relative overflow-hidden rounded-lg border bg-surface-elevated transition-all',
  {
    variants: {
      variant: {
        default: 'border-border-base',
        success: 'border-status-success/20 bg-status-success/5',
        warning: 'border-status-warning/20 bg-status-warning/5',
        error: 'border-status-error/20 bg-status-error/5',
        accent: 'border-accent-primary/20 bg-accent-primary/5',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface AggregateCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>,
    VariantProps<typeof aggregateCardVariants> {
  metric: AggregateMetric;
  trend?: TrendData;
  comparison?: ComparisonData;
  sparklineData?: number[]; // Simple array for sparkline
  icon?: React.ReactNode;
  status?: MetricStatus;
  description?: string;
  tooltip?: string;
  loading?: boolean;
  onClick?: () => void;
}

export const AggregateCard = React.forwardRef<HTMLDivElement, AggregateCardProps>(
  (
    {
      metric,
      trend,
      comparison,
      sparklineData,
      icon,
      status,
      description,
      tooltip,
      loading = false,
      onClick,
      variant,
      size,
      interactive,
      className,
      ...props
    },
    ref
  ) => {
    // ═══════════════════════════════════════════════════════════════
    // FORMATTING
    // ═══════════════════════════════════════════════════════════════

    const formatMetricValue = (): string => {
      if (metric.format) {
        return metric.format(metric.value);
      }

      if (typeof metric.value === 'number') {
        const formatted = metric.value.toLocaleString(undefined, {
          minimumFractionDigits: metric.decimals ?? 0,
          maximumFractionDigits: metric.decimals ?? 2,
        });
        return metric.unit ? `${metric.unit}${formatted}` : formatted;
      }

      return String(metric.value);
    };

    const getTrendColor = (): string => {
      if (!trend) return 'text-text-secondary';

      switch (trend.direction) {
        case 'up':
          return status === 'error' ? 'text-status-error' : 'text-status-success';
        case 'down':
          return status === 'error' ? 'text-status-success' : 'text-status-error';
        default:
          return 'text-text-secondary';
      }
    };

    const getTrendIcon = () => {
      if (!trend) return null;

      switch (trend.direction) {
        case 'up':
          return <TrendingUp className="w-4 h-4" />;
        case 'down':
          return <TrendingDown className="w-4 h-4" />;
        default:
          return <Minus className="w-4 h-4" />;
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // SPARKLINE
    // ═══════════════════════════════════════════════════════════════

    const renderSparkline = () => {
      if (!sparklineData || sparklineData.length === 0) return null;

      const max = Math.max(...sparklineData);
      const min = Math.min(...sparklineData);
      const range = max - min || 1;

      const width = 100;
      const height = 32;
      const points = sparklineData.map((value, index) => {
        const x = (index / (sparklineData.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      });

      return (
        <svg
          width={width}
          height={height}
          className="absolute bottom-0 right-0 opacity-20"
          viewBox={`0 0 ${width} ${height}`}
        >
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    };

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════

    const computedVariant = status && !variant && status !== 'neutral' ? status : variant;
    const isInteractive = interactive || !!onClick;

    return (
      <div
        ref={ref}
        className={cn(
          aggregateCardVariants({
            variant: computedVariant,
            size,
            interactive: isInteractive,
          }),
          className
        )}
        onClick={onClick}
        {...props}
      >
        {/* Loading State */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 w-24 bg-surface-subtle rounded" />
            <div className="h-8 w-32 bg-surface-subtle rounded" />
            <div className="h-3 w-20 bg-surface-subtle rounded" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-text-secondary">
                  {metric.label}
                </h3>
                {tooltip && (
                  <button
                    className="text-text-tertiary hover:text-text-primary"
                    title={tooltip}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {icon && (
                <div className="text-text-tertiary">{icon}</div>
              )}
            </div>

            {/* Main Value */}
            <div className="mb-2">
              <div className="text-3xl font-bold text-text-primary tabular-nums">
                {formatMetricValue()}
              </div>
            </div>

            {/* Trend & Description */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {trend && (
                  <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
                    {getTrendIcon()}
                    <span>
                      {Math.abs(trend.value)}%
                      {trend.label && (
                        <span className="ml-1 text-xs text-text-tertiary font-normal">
                          {trend.label}
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {description && (
                  <div className="text-xs text-text-tertiary">
                    {description}
                  </div>
                )}

                {comparison && (
                  <div className="text-xs text-text-secondary">
                    {comparison.label}:{' '}
                    <span className="font-medium">
                      {comparison.format
                        ? comparison.format(comparison.previous)
                        : comparison.previous.toLocaleString()}
                    </span>
                    {' → '}
                    <span className="font-medium">
                      {comparison.format
                        ? comparison.format(comparison.current)
                        : comparison.current.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sparkline */}
            {renderSparkline()}
          </>
        )}
      </div>
    );
  }
);

AggregateCard.displayName = 'AggregateCard';

// ═══════════════════════════════════════════════════════════════
// COMPOUND COMPONENTS
// ═══════════════════════════════════════════════════════════════

export interface AggregateCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 2 | 4 | 6 | 8;
  className?: string;
}

export const AggregateCardGrid: React.FC<AggregateCardGridProps> = ({
  children,
  columns = 3,
  gap = 4,
  className,
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClass = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={cn('grid', gridCols[columns], gapClass[gap], className)}>
      {children}
    </div>
  );
};

AggregateCardGrid.displayName = 'AggregateCardGrid';

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const calculateTrend = (current: number, previous: number): TrendData => {
  const change = ((current - previous) / previous) * 100;

  return {
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
    value: Math.abs(change),
  };
};

export const aggregateData = <T extends Record<string, any>>(
  data: T[],
  field: keyof T,
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
): number => {
  switch (aggregation) {
    case 'sum':
      return data.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
    case 'avg':
      const sum = data.reduce((s, row) => s + (Number(row[field]) || 0), 0);
      return data.length > 0 ? sum / data.length : 0;
    case 'count':
      return data.length;
    case 'min':
      return Math.min(...data.map(row => Number(row[field]) || 0));
    case 'max':
      return Math.max(...data.map(row => Number(row[field]) || 0));
    default:
      return 0;
  }
};

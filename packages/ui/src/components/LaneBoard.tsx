/**
 * LaneBoard Component
 *
 * Kanban-style board with drag-and-drop lanes
 * Used for showroom deal lifecycle management
 * Virtualized for performance with long lanes
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const laneBoardVariants = cva(
  'flex gap-4 overflow-x-auto pb-4',
  {
    variants: {
      padding: {
        none: 'p-0',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-6',
      },
      gap: {
        sm: 'gap-2',
        md: 'gap-4',
        lg: 'gap-6',
      },
      height: {
        auto: 'h-auto',
        full: 'h-full',
        screen: 'h-screen',
      },
    },
    defaultVariants: {
      padding: 'md',
      gap: 'md',
      height: 'auto',
    },
  }
);

export interface LaneBoardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof laneBoardVariants> {
  /** Optional custom class name */
  className?: string;
}

/**
 * Container for kanban lanes with horizontal scrolling
 */
export const LaneBoard = React.forwardRef<HTMLDivElement, LaneBoardProps>(
  ({ className, padding, gap, height, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(laneBoardVariants({ padding, gap, height }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LaneBoard.displayName = 'LaneBoard';

const laneVariants = cva(
  'flex flex-col flex-shrink-0 bg-surface-subtle border border-border-base rounded-lg',
  {
    variants: {
      width: {
        sm: 'w-64',
        md: 'w-80',
        lg: 'w-96',
        full: 'w-full',
      },
      maxHeight: {
        none: '',
        sm: 'max-h-96',
        md: 'max-h-[600px]',
        lg: 'max-h-[800px]',
        full: 'max-h-full',
      },
    },
    defaultVariants: {
      width: 'md',
      maxHeight: 'md',
    },
  }
);

export interface LaneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof laneVariants> {
  /** Lane title */
  title: string;
  /** Lane count badge */
  count?: number;
  /** Optional lane color */
  color?: 'neutral' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  /** Optional custom class name */
  className?: string;
}

/**
 * Individual lane in the kanban board
 */
export const Lane = React.forwardRef<HTMLDivElement, LaneProps>(
  ({ className, width, maxHeight, title, count, color = 'neutral', children, ...props }, ref) => {
    const colorClasses = {
      neutral: 'bg-surface-base border-border-base',
      blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      green: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
      yellow: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      red: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      purple: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
    };

    const badgeColorClasses = {
      neutral: 'bg-surface-muted text-text-secondary',
      blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      green: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      yellow: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
      red: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
      purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    };

    return (
      <div
        ref={ref}
        className={cn(laneVariants({ width, maxHeight }), className)}
        {...props}
      >
        {/* Lane Header */}
        <div className={cn('flex items-center justify-between p-4 border-b', colorClasses[color])}>
          <h3 className="text-sm font-bold text-text-primary">{title}</h3>
          {count !== undefined && (
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-semibold',
                badgeColorClasses[color]
              )}
            >
              {count}
            </span>
          )}
        </div>

        {/* Lane Content (scrollable) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {children}
        </div>
      </div>
    );
  }
);

Lane.displayName = 'Lane';

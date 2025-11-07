/**
 * LaneCard Component
 *
 * Card component for kanban lanes (deals, leads, tasks, etc.)
 * CVA-based variants for size, tone, and hover states
 * Supports drag-and-drop via data attributes
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const laneCardVariants = cva(
  'bg-surface-base border rounded-lg transition-all cursor-pointer',
  {
    variants: {
      size: {
        sm: 'p-2 text-xs',
        md: 'p-3 text-sm',
        lg: 'p-4 text-base',
      },
      tone: {
        neutral: 'border-border-base hover:border-border-strong hover:shadow-md',
        success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700',
        warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-700',
        error: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700',
        info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-700',
      },
      hover: {
        none: '',
        lift: 'hover:scale-[1.02] hover:shadow-lg',
        glow: 'hover:shadow-lg hover:ring-2 hover:ring-accent-primary/20',
        subtle: 'hover:bg-surface-subtle',
      },
      dragging: {
        true: 'opacity-50 rotate-2 scale-95 cursor-grabbing',
        false: '',
      },
      selected: {
        true: 'ring-2 ring-accent-primary shadow-lg',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      tone: 'neutral',
      hover: 'lift',
      dragging: false,
      selected: false,
    },
  }
);

export interface LaneCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof laneCardVariants> {
  /** Whether card is being dragged */
  isDragging?: boolean;
  /** Whether card is selected */
  isSelected?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Card for use in kanban lanes
 * Supports drag-and-drop via draggable attribute
 */
export const LaneCard = React.forwardRef<HTMLDivElement, LaneCardProps>(
  (
    {
      className,
      size,
      tone,
      hover,
      isDragging = false,
      isSelected = false,
      draggable = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        draggable={draggable}
        className={cn(
          laneCardVariants({
            size,
            tone,
            hover,
            dragging: isDragging,
            selected: isSelected,
          }),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LaneCard.displayName = 'LaneCard';

/**
 * Card Header - Optional title/subtitle section
 */
export const LaneCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mb-2 pb-2 border-b border-border-subtle', className)}
      {...props}
    >
      {children}
    </div>
  );
});

LaneCardHeader.displayName = 'LaneCardHeader';

/**
 * Card Title
 */
export const LaneCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => {
  return (
    <h4
      ref={ref}
      className={cn('font-semibold text-text-primary leading-tight', className)}
      {...props}
    >
      {children}
    </h4>
  );
});

LaneCardTitle.displayName = 'LaneCardTitle';

/**
 * Card Description/Subtitle
 */
export const LaneCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-xs text-text-secondary mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
});

LaneCardDescription.displayName = 'LaneCardDescription';

/**
 * Card Content - Main body
 */
export const LaneCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-1', className)} {...props}>
      {children}
    </div>
  );
});

LaneCardContent.displayName = 'LaneCardContent';

/**
 * Card Footer - Optional actions/metadata
 */
export const LaneCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mt-2 pt-2 border-t border-border-subtle flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
});

LaneCardFooter.displayName = 'LaneCardFooter';

/**
 * Card Badge - Small status indicator
 */
export interface LaneCardBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
}

export const LaneCardBadge = React.forwardRef<HTMLSpanElement, LaneCardBadgeProps>(
  ({ className, variant = 'neutral', children, ...props }, ref) => {
    const variantClasses = {
      neutral: 'bg-surface-muted text-text-secondary',
      success: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      warning: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
      error: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
      info: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

LaneCardBadge.displayName = 'LaneCardBadge';

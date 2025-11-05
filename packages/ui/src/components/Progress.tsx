import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const progressVariants = cva('w-full overflow-hidden rounded-full bg-surface-subtle', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const progressBarVariants = cva('h-full transition-all duration-300 rounded-full', {
  variants: {
    variant: {
      default: 'bg-accent-primary',
      success: 'bg-status-success',
      warning: 'bg-status-warning',
      error: 'bg-status-error',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, size, variant, value, max = 100, showLabel, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className="w-full" {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-text-secondary">
              {percentage.toFixed(0)}%
            </span>
          </div>
        )}
        <div className={cn(progressVariants({ size, className }))}>
          <div
            className={cn(progressBarVariants({ variant }))}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress, progressVariants, progressBarVariants };

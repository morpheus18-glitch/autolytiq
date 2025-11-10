/**
 * Spinner - Loading spinner indicator
 *
 * Animated circular loading indicator.
 *
 * Features:
 * - Multiple size variants
 * - Color customization
 * - Fast/slow animation speeds
 * - Optional label
 *
 * Perfect for: Loading states, async operations, page transitions
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ═══════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════

const spinnerVariants = cva('inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent', {
  variants: {
    size: {
      xs: 'h-3 w-3 border',
      sm: 'h-4 w-4 border',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-2',
      xl: 'h-12 w-12 border-4',
    },
    variant: {
      default: 'text-accent-primary',
      primary: 'text-accent-primary',
      secondary: 'text-text-secondary',
      success: 'text-status-success',
      warning: 'text-status-warning',
      error: 'text-status-error',
    },
    speed: {
      fast: 'animate-spin-fast',
      normal: 'animate-spin',
      slow: 'animate-spin-slow',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    speed: 'normal',
  },
});

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size, variant, speed, label, labelPosition = 'bottom', className, ...props }, ref) => {
    const spinner = (
      <div
        className={cn(spinnerVariants({ size, variant, speed }), className)}
        role="status"
        aria-label={label || 'Loading'}
        {...props}
      >
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    );

    if (!label) {
      return spinner;
    }

    const labelElement = <span className="text-sm text-text-secondary">{label}</span>;

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2',
          labelPosition === 'top' && 'flex-col',
          labelPosition === 'bottom' && 'flex-col',
          labelPosition === 'left' && 'flex-row-reverse',
          labelPosition === 'right' && 'flex-row'
        )}
      >
        {(labelPosition === 'top' || labelPosition === 'left') && labelElement}
        {spinner}
        {(labelPosition === 'bottom' || labelPosition === 'right') && labelElement}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

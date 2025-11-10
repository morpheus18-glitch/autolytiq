/**
 * IconButton - Button with only an icon
 *
 * Compact button containing just an icon, perfect for toolbars and compact UIs.
 *
 * Features:
 * - Multiple variants (ghost, outline, solid)
 * - Size variants
 * - Rounded or square
 * - Loading state
 * - Tooltip support
 *
 * Perfect for: Toolbars, action buttons, compact UIs
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ═══════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════

const iconButtonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent-primary text-white hover:bg-accent-primary/90',
        ghost: 'hover:bg-surface-subtle hover:text-text-primary',
        outline:
          'border border-border-base bg-transparent hover:bg-surface-subtle hover:text-text-primary',
        subtle: 'bg-surface-subtle text-text-primary hover:bg-surface-muted',
        danger: 'bg-status-error text-white hover:bg-status-error/90',
      },
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-14 w-14',
      },
      shape: {
        square: 'rounded-md',
        rounded: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
      shape: 'square',
    },
  }
);

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  loading?: boolean;
  'aria-label': string; // Required for accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, loading, variant, size, shape, className, disabled, ...props }, ref) => {
    const iconSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : size === 'xl' ? 'w-7 h-7' : 'w-5 h-5';

    return (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size, shape }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-current border-t-transparent',
              iconSize
            )}
          />
        ) : (
          <span className={cn('flex items-center justify-center', iconSize)}>{icon}</span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

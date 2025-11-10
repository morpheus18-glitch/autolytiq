/**
 * Dot - Status indicator dot
 *
 * Small circular indicator for showing status, online/offline, notifications.
 *
 * Features:
 * - Size variants (xs to xl)
 * - Color variants (status colors)
 * - Pulsing animation option
 * - Optional label
 * - Badge position (for overlaying on avatars)
 *
 * Perfect for: Status indicators, notification badges, online presence
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ═══════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════

const dotVariants = cva('rounded-full', {
  variants: {
    size: {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    },
    variant: {
      default: 'bg-text-secondary',
      primary: 'bg-accent-primary',
      success: 'bg-status-success',
      warning: 'bg-status-warning',
      error: 'bg-status-error',
      info: 'bg-accent-primary',
      gray: 'bg-surface-subtle',
    },
    pulse: {
      true: 'animate-pulse',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    pulse: false,
  },
});

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface DotProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof dotVariants> {
  label?: string;
  ping?: boolean; // Adds a ping ring effect
  position?: 'inline' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

export const Dot = React.forwardRef<HTMLDivElement, DotProps>(
  ({ size, variant, pulse, label, ping, position = 'inline', className, ...props }, ref) => {
    const dot = (
      <div className={cn('relative inline-flex', position !== 'inline' && 'absolute')}>
        {ping && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
              variant === 'success' && 'bg-status-success',
              variant === 'warning' && 'bg-status-warning',
              variant === 'error' && 'bg-status-error',
              variant === 'primary' && 'bg-accent-primary',
              variant === 'info' && 'bg-accent-primary',
              variant === 'default' && 'bg-text-secondary'
            )}
          />
        )}
        <span
          ref={ref}
          className={cn(dotVariants({ size, variant, pulse }), className)}
          role="status"
          aria-label={label || 'Status indicator'}
          {...props}
        />
      </div>
    );

    if (!label || position !== 'inline') {
      return dot;
    }

    return (
      <div className="inline-flex items-center gap-2">
        {dot}
        <span className="text-sm text-text-primary">{label}</span>
      </div>
    );
  }
);

Dot.displayName = 'Dot';

// ═══════════════════════════════════════════════════════════════
// COMPOUND COMPONENTS
// ═══════════════════════════════════════════════════════════════

export interface DotGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DotGroup: React.FC<DotGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        spacing === 'sm' && (orientation === 'horizontal' ? 'gap-1' : 'gap-1'),
        spacing === 'md' && (orientation === 'horizontal' ? 'gap-2' : 'gap-2'),
        spacing === 'lg' && (orientation === 'horizontal' ? 'gap-3' : 'gap-3'),
        className
      )}
    >
      {children}
    </div>
  );
};

DotGroup.displayName = 'DotGroup';

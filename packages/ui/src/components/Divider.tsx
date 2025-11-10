/**
 * Divider - Visual separator line
 *
 * Simple horizontal or vertical line for separating content.
 * Lightweight alternative to Separator with more layout options.
 *
 * Features:
 * - Horizontal or vertical orientation
 * - Optional text/label in the middle
 * - Customizable thickness and color
 * - Spacing variants
 *
 * Perfect for: Section breaks, list separators, toolbar dividers
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ═══════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════

const dividerVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full border-l',
    },
    thickness: {
      thin: '',
      base: '',
      thick: '',
    },
    spacing: {
      none: '',
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    // Horizontal thickness
    {
      orientation: 'horizontal',
      thickness: 'thin',
      className: 'border-t',
    },
    {
      orientation: 'horizontal',
      thickness: 'base',
      className: 'border-t-2',
    },
    {
      orientation: 'horizontal',
      thickness: 'thick',
      className: 'border-t-4',
    },
    // Vertical thickness
    {
      orientation: 'vertical',
      thickness: 'thin',
      className: 'border-l',
    },
    {
      orientation: 'vertical',
      thickness: 'base',
      className: 'border-l-2',
    },
    {
      orientation: 'vertical',
      thickness: 'thick',
      className: 'border-l-4',
    },
    // Horizontal spacing
    {
      orientation: 'horizontal',
      spacing: 'sm',
      className: 'my-2',
    },
    {
      orientation: 'horizontal',
      spacing: 'md',
      className: 'my-4',
    },
    {
      orientation: 'horizontal',
      spacing: 'lg',
      className: 'my-6',
    },
    // Vertical spacing
    {
      orientation: 'vertical',
      spacing: 'sm',
      className: 'mx-2',
    },
    {
      orientation: 'vertical',
      spacing: 'md',
      className: 'mx-4',
    },
    {
      orientation: 'vertical',
      spacing: 'lg',
      className: 'mx-6',
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    thickness: 'thin',
    spacing: 'md',
  },
});

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  label?: string;
  labelPosition?: 'left' | 'center' | 'right';
}

export const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ orientation, thickness, spacing, label, labelPosition = 'center', className, ...props }, ref) => {
    if (label && orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center',
            spacing === 'sm' && 'my-2',
            spacing === 'md' && 'my-4',
            spacing === 'lg' && 'my-6',
            className
          )}
          role="separator"
          {...props}
        >
          {labelPosition === 'center' && (
            <>
              <div className={cn('flex-1 border-t border-border-base', thickness === 'base' && 'border-t-2', thickness === 'thick' && 'border-t-4')} />
              <span className="px-3 text-sm text-text-secondary">{label}</span>
              <div className={cn('flex-1 border-t border-border-base', thickness === 'base' && 'border-t-2', thickness === 'thick' && 'border-t-4')} />
            </>
          )}
          {labelPosition === 'left' && (
            <>
              <span className="pr-3 text-sm text-text-secondary">{label}</span>
              <div className={cn('flex-1 border-t border-border-base', thickness === 'base' && 'border-t-2', thickness === 'thick' && 'border-t-4')} />
            </>
          )}
          {labelPosition === 'right' && (
            <>
              <div className={cn('flex-1 border-t border-border-base', thickness === 'base' && 'border-t-2', thickness === 'thick' && 'border-t-4')} />
              <span className="pl-3 text-sm text-text-secondary">{label}</span>
            </>
          )}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(dividerVariants({ orientation, thickness, spacing }), 'border-border-base', className)}
        role="separator"
        aria-orientation={orientation || undefined}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

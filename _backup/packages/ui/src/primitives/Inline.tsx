/**
 * Inline - Horizontal Layout Primitive
 *
 * Use for laying out elements horizontally with consistent spacing.
 * Built on Flexbox, enforces horizontal direction.
 *
 * For vertical layouts, use Stack.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

export const inlineVariants = cva('flex flex-row', {
  variants: {
    /**
     * Gap between items (from @repo/tokens spacing)
     */
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
      '2xl': 'gap-8',
    },
    /**
     * Alignment on cross-axis (vertical)
     */
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    /**
     * Justification on main-axis (horizontal)
     */
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    /**
     * Wrap behavior
     */
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'center',
    justify: 'start',
    wrap: 'nowrap',
  },
});

export interface InlineProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof inlineVariants> {
  /**
   * HTML element to render
   */
  as?: 'div' | 'span' | 'nav' | 'ul';
  /**
   * Children elements
   */
  children: React.ReactNode;
}

/**
 * Inline Component
 *
 * Flexbox container for horizontal layouts with consistent spacing.
 *
 * @example
 * <Inline gap="sm" align="center" justify="between">
 *   <Button>Left</Button>
 *   <Button>Right</Button>
 * </Inline>
 */
export const Inline = React.forwardRef<HTMLElement, InlineProps>(
  ({ as: Component = 'div', className, gap, align, justify, wrap, children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(inlineVariants({ gap, align, justify, wrap }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Inline.displayName = 'Inline';

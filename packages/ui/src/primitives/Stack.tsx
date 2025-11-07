/**
 * Stack - Vertical Layout Primitive
 *
 * Use for stacking elements vertically with consistent spacing.
 * Built on Flexbox, enforces vertical direction.
 *
 * For horizontal layouts, use Inline.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

export const stackVariants = cva('flex flex-col', {
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
     * Alignment on cross-axis (horizontal)
     */
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    /**
     * Justification on main-axis (vertical)
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
     * Width control
     */
    width: {
      auto: 'w-auto',
      full: 'w-full',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'stretch',
    justify: 'start',
    width: 'full',
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof stackVariants> {
  /**
   * HTML element to render
   */
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol';
  /**
   * Children elements
   */
  children: React.ReactNode;
}

/**
 * Stack Component
 *
 * Flexbox container for vertical layouts with consistent spacing.
 *
 * @example
 * <Stack gap="lg" align="center">
 *   <Text>Item 1</Text>
 *   <Text>Item 2</Text>
 * </Stack>
 */
export const Stack = React.forwardRef<HTMLElement, StackProps>(
  ({ as: Component = 'div', className, gap, align, justify, width, children, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(stackVariants({ gap, align, justify, width }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';

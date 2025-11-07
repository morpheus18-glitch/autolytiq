/**
 * Surface - Elevated Container Primitive
 *
 * Use for cards, panels, and elevated containers.
 * Provides background colors, borders, shadows, and rounded corners.
 *
 * This is the base for all card patterns.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

export const surfaceVariants = cva('rounded-lg', {
  variants: {
    /**
     * Background variant (from @repo/tokens surface colors)
     */
    variant: {
      base: 'bg-slate-50 dark:bg-gray-900',
      elevated: 'bg-white dark:bg-gray-800',
      subtle: 'bg-slate-100 dark:bg-gray-850',
      transparent: 'bg-transparent',
      // Semantic status variants (from @repo/tokens status colors)
      ok: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
      caution: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
      risk: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
      info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
      muted: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
    },
    /**
     * Elevation level (shadow depth from @repo/tokens)
     */
    elevation: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
    },
    /**
     * Border style
     */
    border: {
      none: 'border-0',
      default: 'border border-slate-200 dark:border-gray-700',
      strong: 'border-2 border-slate-300 dark:border-gray-600',
    },
    /**
     * Padding (from @repo/tokens spacing)
     */
    padding: {
      none: 'p-0',
      xs: 'p-1',
      sm: 'p-2',
      md: 'p-3',
      lg: 'p-4',
      xl: 'p-6',
      '2xl': 'p-8',
    },
    /**
     * Border radius
     */
    radius: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    },
    /**
     * Interactive states
     */
    interactive: {
      none: '',
      hover: 'hover:shadow-lg transition-shadow duration-200 cursor-pointer',
      press: 'active:scale-[0.98] transition-transform duration-100 cursor-pointer',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    elevation: 'sm',
    border: 'default',
    padding: 'md',
    radius: 'lg',
    interactive: 'none',
  },
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof surfaceVariants> {
  /**
   * HTML element to render
   */
  as?: 'div' | 'section' | 'article' | 'aside';
  /**
   * Children elements
   */
  children: React.ReactNode;
}

/**
 * Surface Component
 *
 * Elevated container with controlled background, shadow, border, and padding.
 * Use as the foundation for card patterns.
 *
 * @example
 * <Surface elevation="md" padding="lg" interactive="hover">
 *   <Text>Card content</Text>
 * </Surface>
 */
export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(
  (
    {
      as: Component = 'div',
      className,
      variant,
      elevation,
      border,
      padding,
      radius,
      interactive,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={cn(
          surfaceVariants({ variant, elevation, border, padding, radius, interactive }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Surface.displayName = 'Surface';

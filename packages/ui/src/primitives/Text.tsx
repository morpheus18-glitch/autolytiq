/**
 * Text - Typography Primitive
 *
 * Use for all text rendering with consistent typography from @repo/tokens.
 * Replaces raw HTML text elements (p, span, h1-h6, etc.)
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

export const textVariants = cva('', {
  variants: {
    /**
     * Typography variant (from @repo/tokens typography)
     */
    variant: {
      display: 'text-4xl font-bold tracking-tight',
      h1: 'text-3xl font-bold',
      h2: 'text-2xl font-semibold',
      h3: 'text-xl font-semibold',
      h4: 'text-lg font-medium',
      body: 'text-base font-normal',
      ui: 'text-sm font-medium',
      caption: 'text-xs font-normal',
      mono: 'font-mono text-sm',
    },
    /**
     * Color variant (from @repo/tokens text colors)
     */
    color: {
      primary: 'text-slate-900 dark:text-slate-100',
      secondary: 'text-slate-600 dark:text-slate-300',
      tertiary: 'text-slate-500 dark:text-slate-400',
      muted: 'text-slate-400 dark:text-slate-500',
      accent: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-orange-600 dark:text-orange-400',
      error: 'text-red-600 dark:text-red-400',
      info: 'text-sky-600 dark:text-sky-400',
    },
    /**
     * Font weight
     */
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    /**
     * Text alignment
     */
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    /**
     * Truncation
     */
    truncate: {
      none: '',
      single: 'truncate',
      double: 'line-clamp-2',
      triple: 'line-clamp-3',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'primary',
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof textVariants> {
  /**
   * HTML element to render
   */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'legend' | 'code';
  /**
   * Children elements
   */
  children: React.ReactNode;
}

/**
 * Text Component
 *
 * Universal text renderer with typography tokens from @repo/tokens.
 * Use instead of raw HTML text elements for consistency.
 *
 * @example
 * <Text variant="h2" color="primary">Heading</Text>
 * <Text variant="body" color="secondary" truncate="single">
 *   Long text that will be truncated...
 * </Text>
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = 'p',
      className,
      variant,
      color,
      weight,
      align,
      truncate,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={cn(textVariants({ variant, color, weight, align, truncate }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

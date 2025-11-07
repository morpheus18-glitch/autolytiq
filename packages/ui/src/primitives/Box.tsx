/**
 * Box - Universal Container Primitive
 *
 * The most basic building block. Use for:
 * - Generic containers
 * - Layout wrappers
 * - Spacing control
 *
 * NOT for cards (use Surface) or text (use Text)
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

export const boxVariants = cva('', {
  variants: {
    /**
     * Display mode
     */
    display: {
      block: 'block',
      inline: 'inline',
      'inline-block': 'inline-block',
      flex: 'flex',
      'inline-flex': 'inline-flex',
      grid: 'grid',
      'inline-grid': 'inline-grid',
      none: 'hidden',
    },
    /**
     * Position
     */
    position: {
      static: 'static',
      relative: 'relative',
      absolute: 'absolute',
      fixed: 'fixed',
      sticky: 'sticky',
    },
    /**
     * Padding (using tokens from @repo/tokens)
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
     * Margin (using tokens from @repo/tokens)
     */
    margin: {
      none: 'm-0',
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-3',
      lg: 'm-4',
      xl: 'm-6',
      '2xl': 'm-8',
      auto: 'm-auto',
    },
    /**
     * Width
     */
    width: {
      auto: 'w-auto',
      full: 'w-full',
      screen: 'w-screen',
      min: 'w-min',
      max: 'w-max',
      fit: 'w-fit',
    },
    /**
     * Height
     */
    height: {
      auto: 'h-auto',
      full: 'h-full',
      screen: 'h-screen',
      min: 'h-min',
      max: 'h-max',
      fit: 'h-fit',
    },
    /**
     * Overflow
     */
    overflow: {
      visible: 'overflow-visible',
      hidden: 'overflow-hidden',
      scroll: 'overflow-scroll',
      auto: 'overflow-auto',
    },
  },
  defaultVariants: {
    display: 'block',
    position: 'relative',
  },
});

export interface BoxProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof boxVariants> {
  /**
   * HTML element to render
   */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav' | 'header' | 'footer';
  /**
   * Children elements
   */
  children?: React.ReactNode;
}

/**
 * Box Component
 *
 * Universal container with controlled variants for display, position, spacing.
 *
 * @example
 * <Box padding="md" margin="auto" width="full">
 *   <p>Content</p>
 * </Box>
 */
export const Box = React.forwardRef<HTMLElement, BoxProps>(
  (
    {
      as: Component = 'div',
      className,
      display,
      position,
      padding,
      margin,
      width,
      height,
      overflow,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={cn(
          boxVariants({
            display,
            position,
            padding,
            margin,
            width,
            height,
            overflow,
          }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';

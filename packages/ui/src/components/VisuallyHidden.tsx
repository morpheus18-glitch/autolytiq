import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

/**
 * VisuallyHidden component
 * Hides content visually but keeps it accessible to screen readers
 * Useful for skip links, labels, and announcements
 */

const visuallyHiddenVariants = cva(
  'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0',
  {
    variants: {
      focusable: {
        true: 'focus:static focus:w-auto focus:h-auto focus:p-2 focus:m-0 focus:overflow-visible focus:whitespace-normal focus:clip-auto',
        false: 'clip-[rect(0,0,0,0)]',
      },
    },
    defaultVariants: {
      focusable: false,
    },
  }
);

export interface VisuallyHiddenProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof visuallyHiddenVariants> {
  as?: 'span' | 'div' | 'label' | 'p';
}

export const VisuallyHidden = React.forwardRef<HTMLElement, VisuallyHiddenProps>(
  ({ className, focusable, as: Component = 'span', children, ...props }, ref) => {
    return React.createElement(
      Component,
      {
        ref,
        className: cn(visuallyHiddenVariants({ focusable }), className),
        ...props,
      },
      children
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';

/**
 * Card Component
 * Token-driven container for content grouping
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'base' | 'lg';
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'elevated', padding = 'base', hover = false, ...props }, ref) => {
    const baseStyles = [
      'rounded-lg',
      'transition-all duration-200',
    ];

    const variants = {
      elevated: [
        'bg-[var(--semantic-surface-elevated)]',
        'shadow-[var(--shadows-base)]',
        hover && 'hover:shadow-[var(--shadows-md)]',
      ],
      outlined: [
        'bg-[var(--semantic-surface-base)]',
        'border border-[var(--semantic-border-base)]',
        hover && 'hover:border-[var(--semantic-border-strong)]',
      ],
      filled: [
        'bg-[var(--semantic-surface-subtle)]',
        hover && 'hover:bg-[var(--semantic-surface-muted)]',
      ],
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      base: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant].filter(Boolean),
          paddings[padding],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 px-4 py-3 md:px-6 md:py-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg md:text-xl font-semibold leading-none tracking-tight',
      'text-[var(--semantic-text-primary)]',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-xs md:text-sm text-[var(--semantic-text-secondary)]',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-4 py-3 md:px-6 md:py-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-wrap items-center gap-2 px-4 py-3 md:px-6 md:py-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

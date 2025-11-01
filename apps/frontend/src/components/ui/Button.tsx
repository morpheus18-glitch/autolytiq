/**
 * Button Component
 * Token-driven, accessible button with multiple variants
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'base' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'base',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      // Layout
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-md',
      'transition-all duration-200',

      // Focus
      'focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-offset-2',

      // Disabled
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'disabled:pointer-events-none',
    ];

    const variants = {
      primary: [
        'bg-[var(--semantic-accent-primary)]',
        'text-[var(--semantic-text-inverse)]',
        'hover:bg-[var(--semantic-accent-primaryHover)]',
        'focus-visible:ring-[var(--semantic-accent-primary)]',
        'shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-[var(--semantic-accent-secondary)]',
        'text-[var(--semantic-text-inverse)]',
        'hover:bg-[var(--semantic-accent-secondaryHover)]',
        'focus-visible:ring-[var(--semantic-accent-secondary)]',
        'shadow-sm hover:shadow-md',
      ],
      outline: [
        'border border-[var(--semantic-border-base)]',
        'bg-transparent',
        'text-[var(--semantic-text-primary)]',
        'hover:bg-[var(--semantic-surface-subtle)]',
        'focus-visible:ring-[var(--semantic-accent-primary)]',
      ],
      ghost: [
        'bg-transparent',
        'text-[var(--semantic-text-secondary)]',
        'hover:bg-[var(--semantic-surface-subtle)]',
        'hover:text-[var(--semantic-text-primary)]',
        'focus-visible:ring-[var(--semantic-accent-primary)]',
      ],
      danger: [
        'bg-[var(--semantic-status-error)]',
        'text-[var(--semantic-text-inverse)]',
        'hover:opacity-90',
        'focus-visible:ring-[var(--semantic-status-error)]',
        'shadow-sm hover:shadow-md',
      ],
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      base: 'h-10 px-4 text-base',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

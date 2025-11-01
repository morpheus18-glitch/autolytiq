/**
 * Input Component
 * Token-driven, accessible text input
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    const baseStyles = [
      // Layout
      'w-full rounded-md',
      'px-3 py-2',
      'font-sans text-base',

      // Colors
      'bg-[var(--semantic-surface-base)]',
      'text-[var(--semantic-text-primary)]',
      'border border-[var(--semantic-border-base)]',
      'placeholder:text-[var(--semantic-text-tertiary)]',

      // States
      'transition-colors duration-200',
      'hover:border-[var(--semantic-border-strong)]',
      'focus:outline-none',
      'focus:ring-2 focus:ring-[var(--semantic-accent-primary)]',
      'focus:ring-offset-0',
      'focus:border-transparent',

      // Disabled
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:bg-[var(--semantic-surface-muted)]',
    ];

    const errorStyles = error ? [
      'border-[var(--semantic-status-error)]',
      'focus:ring-[var(--semantic-status-error)]',
    ] : [];

    const hasIcons = leftIcon || rightIcon;
    const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--semantic-text-tertiary)]">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          className={cn(
            baseStyles,
            errorStyles,
            iconPadding,
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--semantic-text-tertiary)]">
            {rightIcon}
          </div>
        )}

        {helperText && (
          <p className={cn(
            'mt-1 text-sm',
            error
              ? 'text-[var(--semantic-status-error)]'
              : 'text-[var(--semantic-text-secondary)]'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

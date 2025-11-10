import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const inputVariants = cva(
  'w-full rounded-md border bg-surface-base text-sm transition-smooth placeholder:text-text-placeholder focus-ring disabled:disabled',
  {
    variants: {
      variant: {
        default: 'border-border-base',
        error: 'border-status-error focus-visible:ring-status-error',
        success: 'border-status-success focus-visible:ring-status-success',
      },
      size: {
        sm: 'h-8 px-2.5 py-1 text-xs',
        md: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      error,
      success,
      leftIcon,
      rightIcon,
      type = 'text',
      ...props
    },
    ref
  ) => {
    // Determine variant based on error/success state
    const computedVariant = error
      ? 'error'
      : success
        ? 'success'
        : variant;

    // If we have icons, wrap in a container
    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: computedVariant, size }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: computedVariant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };

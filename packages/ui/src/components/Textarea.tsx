import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border bg-surface-base px-3 py-2 text-sm transition-smooth focus-ring disabled:disabled placeholder:text-text-tertiary',
  {
    variants: {
      variant: {
        default: 'border-border-base focus:border-accent-primary',
        error: 'border-status-error focus:border-status-error',
        success: 'border-status-success focus:border-status-success',
      },
      textareaSize: {
        sm: 'text-xs min-h-[60px]',
        md: 'min-h-[80px]',
        lg: 'text-base min-h-[120px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      textareaSize: 'md',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  hint?: string;
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      textareaSize,
      error,
      hint,
      label,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId();
    const hasError = Boolean(error);
    const effectiveVariant = hasError ? 'error' : variant;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          className={cn(
            textareaVariants({ variant: effectiveVariant, textareaSize }),
            className
          )}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-xs text-status-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={`${textareaId}-hint`} className="text-xs text-text-tertiary">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };

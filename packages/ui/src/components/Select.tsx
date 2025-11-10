import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

export const selectVariants = cva(
  'w-full rounded-md border bg-surface-base text-text-primary transition-smooth focus-ring disabled:disabled',
  {
    variants: {
      variant: {
        default: 'border-border-base',
        error: 'border-status-error focus-visible:ring-status-error',
        success: 'border-status-success focus-visible:ring-status-success',
      },
      size: {
        sm: 'h-8 px-2.5 py-1 text-xs',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export type SelectOption = { label: string; value: string; disabled?: boolean };

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'>,
    VariantProps<typeof selectVariants> {
  options?: SelectOption[];
  placeholder?: string;
  error?: boolean;
  success?: boolean;
  onValueChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    variant,
    size,
    error,
    success,
    options,
    placeholder,
    onValueChange,
    defaultValue,
    value,
    children,
    ...rest
  },
  ref
) {
  // Determine variant based on error/success state
  const computedVariant = error ? 'error' : success ? 'success' : variant;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(e.target.value);
  };

  return (
    <select
      ref={ref}
      className={cn(selectVariants({ variant: computedVariant, size }), className)}
      onChange={handleChange}
      value={value}
      defaultValue={defaultValue}
      {...rest}
    >
      {placeholder && (
        <option value="" disabled hidden>
          {placeholder}
        </option>
      )}
      {options?.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
      {children}
    </select>
  );
});

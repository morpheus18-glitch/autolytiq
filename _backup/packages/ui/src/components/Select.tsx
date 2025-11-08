import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

export const selectVariants = cva(
  'block w-full rounded-md border outline-none transition-colors ' +
    'bg-[var(--surface,white)] text-[var(--text,#0b1020)] ' +
    'border-[var(--border,#c9d3e3)] ' +
    'focus:ring-2 focus:ring-[var(--ring,rgba(42,125,225,0.28))] ' +
    'disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-[13px]',
        md: 'h-10 px-3 text-[14px]',
        lg: 'h-11 px-3 text-[15px]'
      },
      tone: {
        default: '',
        subtle: 'bg-[var(--panel,#f7f9fc)]',
        danger: 'border-[var(--danger-border,#ffb4b4)] focus:ring-[rgba(255,88,88,.28)]'
      }
    },
    defaultVariants: { size: 'md', tone: 'default' }
  }
);

export type SelectOption = { label: string; value: string; disabled?: boolean };

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'>,
    VariantProps<typeof selectVariants> {
  options?: SelectOption[];            // convenience list
  placeholder?: string;                // renders a disabled first option
  onValueChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, size, tone, options, placeholder, onValueChange, defaultValue, value, children, ...rest },
  ref
) {
  // Controlled vs uncontrolled both supported
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onValueChange?.(e.target.value);
  };

  return (
    <select
      ref={ref}
      className={cn(selectVariants({ size, tone }), className)}
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
      {/* If consumer passes <option> children, render them too */}
      {children}
    </select>
  );
});

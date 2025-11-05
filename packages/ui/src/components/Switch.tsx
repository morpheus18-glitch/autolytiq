import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=checked]:bg-accent-primary data-[state=unchecked]:bg-neutral-200',
        error: 'data-[state=checked]:bg-status-error data-[state=unchecked]:bg-neutral-200',
        success: 'data-[state=checked]:bg-status-success data-[state=unchecked]:bg-neutral-200',
      },
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
        md: 'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof switchVariants> {
  label?: string;
  error?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      variant,
      size,
      error,
      label,
      checked,
      onChange,
      onCheckedChange,
      ...props
    },
    ref
  ) => {
    const computedVariant = error ? 'error' : variant;
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            ref={inputRef}
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <div
            className={switchVariants({ variant: computedVariant, size, className })}
            data-state={checked ? 'checked' : 'unchecked'}
          >
            <span
              className={switchThumbVariants({ size })}
              data-state={checked ? 'checked' : 'unchecked'}
            />
          </div>
        </label>
        {label && (
          <label
            className="text-sm font-medium text-text-primary cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            onClick={() => inputRef.current?.click()}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch, switchVariants };

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Minus } from 'lucide-react';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-border-base ring-offset-surface-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'data-[state=checked]:bg-accent-primary data-[state=checked]:text-text-inverse data-[state=checked]:border-accent-primary',
        error:
          'border-status-error data-[state=checked]:bg-status-error data-[state=checked]:text-text-inverse data-[state=checked]:border-status-error',
        success:
          'border-status-success data-[state=checked]:bg-status-success data-[state=checked]:text-text-inverse data-[state=checked]:border-status-success',
      },
      size: {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  error?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      variant,
      size,
      error,
      label,
      indeterminate = false,
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

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    const iconSize = size === 'sm' ? 10 : size === 'lg' ? 16 : 12;

    return (
      <div className="flex items-center gap-2">
        <div className="relative inline-flex items-center justify-center">
          <input
            type="checkbox"
            className={checkboxVariants({ variant: computedVariant, size, className })}
            ref={inputRef}
            checked={checked}
            onChange={handleChange}
            data-state={checked ? 'checked' : 'unchecked'}
            {...props}
          />
          {checked && !indeterminate && (
            <Check
              className="absolute pointer-events-none text-current"
              size={iconSize}
            />
          )}
          {indeterminate && (
            <Minus
              className="absolute pointer-events-none text-current"
              size={iconSize}
            />
          )}
        </div>
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

Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };

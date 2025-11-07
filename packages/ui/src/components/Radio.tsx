import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const radioVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-full border border-border-base ring-offset-surface-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'data-[state=checked]:border-accent-primary data-[state=checked]:border-[5px]',
        error:
          'border-status-error data-[state=checked]:border-status-error data-[state=checked]:border-[5px]',
        success:
          'border-status-success data-[state=checked]:border-status-success data-[state=checked]:border-[5px]',
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

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  error?: boolean;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, variant, size, error, label, ...props }, ref) => {
    const computedVariant = error ? 'error' : variant;
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    return (
      <div className="flex items-center gap-2">
        <input
          type="radio"
          className={radioVariants({ variant: computedVariant, size, className })}
          ref={inputRef}
          data-state={props.checked ? 'checked' : 'unchecked'}
          {...props}
        />
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

Radio.displayName = 'Radio';

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const RadioGroup = ({
  name,
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: RadioGroupProps) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || '');

  const currentValue = value !== undefined ? value : selectedValue;

  const handleChange = (newValue: string) => {
    if (value === undefined) {
      setSelectedValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <div className={className} role="radiogroup">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Radio) {
          return React.cloneElement(child as React.ReactElement<RadioProps>, {
            name,
            checked: currentValue === child.props.value,
            onChange: () => handleChange(child.props.value as string),
          });
        }
        return child;
      })}
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';

// Alias for compatibility
const RadioGroupItem = Radio;

export { Radio, RadioGroupItem, radioVariants };

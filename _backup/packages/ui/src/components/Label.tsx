import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-text-primary',
        error: 'text-status-error',
        success: 'text-status-success',
        muted: 'text-text-secondary',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
      required: {
        true: 'after:content-["*"] after:ml-0.5 after:text-status-error',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      required: false,
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  error?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, error, required, children, ...props }, ref) => {
    const computedVariant = error ? 'error' : variant;

    return (
      <label
        ref={ref}
        className={labelVariants({
          variant: computedVariant,
          size,
          required,
          className,
        })}
        {...props}
      >
        {children}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label, labelVariants };

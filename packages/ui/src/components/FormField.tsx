import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const formFieldVariants = cva('flex flex-col gap-1.5', {
  variants: {
    orientation: {
      vertical: 'flex-col',
      horizontal: 'flex-row items-center gap-4',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

const formDescriptionVariants = cva('text-xs', {
  variants: {
    variant: {
      default: 'text-text-secondary',
      error: 'text-status-error',
      success: 'text-status-success',
      info: 'text-accent-info',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  required?: boolean;
  htmlFor?: string;
  showIcon?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      className,
      orientation,
      label,
      description,
      error,
      success,
      required,
      htmlFor,
      showIcon = true,
      children,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = !!success;
    const hasDescription = !!description;

    const descriptionVariant = hasError
      ? 'error'
      : hasSuccess
        ? 'success'
        : hasDescription
          ? 'info'
          : 'default';

    const message = error || success || description;

    return (
      <div
        ref={ref}
        className={formFieldVariants({ orientation, className })}
        {...props}
      >
        {label && (
          <label
            htmlFor={htmlFor}
            className={`text-sm font-medium ${
              hasError
                ? 'text-status-error'
                : hasSuccess
                  ? 'text-status-success'
                  : 'text-text-primary'
            } ${required ? 'after:content-["*"] after:ml-0.5 after:text-status-error' : ''}`}
          >
            {label}
          </label>
        )}

        <div className="flex-1">{children}</div>

        {message && (
          <div
            className={`flex items-start gap-1.5 ${formDescriptionVariants({
              variant: descriptionVariant,
            })}`}
          >
            {showIcon && (
              <span className="mt-0.5 flex-shrink-0">
                {hasError && <AlertCircle className="w-3.5 h-3.5" />}
                {hasSuccess && <CheckCircle className="w-3.5 h-3.5" />}
                {hasDescription && !hasError && !hasSuccess && (
                  <Info className="w-3.5 h-3.5" />
                )}
              </span>
            )}
            <span className="flex-1">{message}</span>
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField, formFieldVariants, formDescriptionVariants };

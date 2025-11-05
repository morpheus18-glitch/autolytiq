import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 transition-smooth',
  {
    variants: {
      variant: {
        default: 'bg-surface-elevated border-border-base text-text-primary',
        success: 'bg-status-success/10 border-status-success/20 text-status-success',
        error: 'bg-status-error/10 border-status-error/20 text-status-error',
        warning: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
        info: 'bg-accent-info/10 border-accent-info/20 text-accent-info',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, title, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant, className }))}
        role="alert"
        {...props}
      >
        <div className="flex items-start gap-3">
          {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
          <div className="flex-1 min-w-0">
            {title && (
              <h5 className="mb-1 font-bold text-sm leading-none tracking-tight">
                {title}
              </h5>
            )}
            <div className="text-sm opacity-90">{children}</div>
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert, alertVariants };

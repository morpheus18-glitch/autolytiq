import * as React from 'react';
import { cn } from '../utils/cn.js';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center p-8 min-h-[200px]',
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 p-3 rounded-full bg-surface-subtle text-text-tertiary">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-text-secondary max-w-sm mb-4">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };

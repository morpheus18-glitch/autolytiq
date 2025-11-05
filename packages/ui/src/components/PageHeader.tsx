import * as React from 'react';
import { cn } from '../utils/cn.js';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, icon, title, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mb-6', className)}
        {...props}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 p-2.5 rounded-lg shadow-md bg-gradient-to-br from-accent-primary to-accent-secondary">
                <div className="w-6 h-6 text-text-inverse flex items-center justify-center">
                  {icon}
                </div>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary m-0">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-text-secondary m-0">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export { PageHeader };

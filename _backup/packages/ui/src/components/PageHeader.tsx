import * as React from 'react';
import { cn } from '../utils/cn.js';
import { useMobileBreakpoint } from '../hooks/useBreakpoint.js';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, icon, title, description, actions, ...props }, ref) => {
    const isMobile = useMobileBreakpoint();

    return (
      <div
        ref={ref}
        className={cn('mb-4 sm:mb-6', className)}
        {...props}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {icon && (
              <div className={cn(
                "flex-shrink-0 rounded-lg shadow-md bg-gradient-to-br from-accent-primary to-accent-secondary mt-1",
                isMobile ? "p-2" : "p-2.5"
              )}>
                <div className={cn(
                  "text-text-inverse flex items-center justify-center",
                  isMobile ? "w-5 h-5" : "w-6 h-6"
                )}>
                  {icon}
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className={cn(
                "font-bold text-text-primary m-0",
                isMobile ? "text-xl" : "text-2xl sm:text-3xl"
              )}>
                {title}
              </h1>
              {description && (
                <p className={cn(
                  "text-text-secondary m-0 mt-1",
                  isMobile ? "text-sm" : "text-base"
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className={cn(
              "flex items-center gap-2 flex-shrink-0",
              isMobile && "flex-wrap"
            )}>
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

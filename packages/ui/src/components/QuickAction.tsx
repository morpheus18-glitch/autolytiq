import * as React from 'react';
import { cn } from '../utils/cn.js';
import { Card, CardContent } from './Card.js';

export interface QuickActionProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  badge?: React.ReactNode;
}

const QuickAction = React.forwardRef<HTMLDivElement, QuickActionProps>(
  ({ className, icon, title, description, badge, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        hover
        padding="md"
        className={cn('cursor-pointer', className)}
        {...props}
      >
        <CardContent>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2.5 rounded-lg bg-accent-primary/10">
              <div className="w-5 h-5 text-accent-primary flex items-center justify-center">
                {icon}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-text-primary text-sm">
                  {title}
                </h3>
                {badge}
              </div>
              {description && (
                <p className="text-xs text-text-secondary m-0">
                  {description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

QuickAction.displayName = 'QuickAction';

export { QuickAction };

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';
import { Card } from './Card.js';

const statCardVariants = cva('cursor-pointer transition-all duration-200', {
  variants: {
    hover: {
      true: 'hover:shadow-lg hover:-translate-y-0.5',
      false: '',
    },
  },
  defaultVariants: {
    hover: true,
  },
});

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      change,
      icon,
      iconBg = 'bg-accent-primary/10',
      iconColor = 'text-accent-primary',
      hover,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(statCardVariants({ hover }), className)}
        padding="md"
        {...props}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium text-text-secondary mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-text-primary m-0">
              {value}
            </p>
            {change && (
              <p className="text-xs text-text-tertiary m-0 mt-0.5">
                {change}
              </p>
            )}
          </div>
          {icon && (
            <div className={cn('p-3 rounded-lg shadow-sm', iconBg)}>
              <div className={cn('w-5 h-5 flex items-center justify-center', iconColor)}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export { StatCard, statCardVariants };

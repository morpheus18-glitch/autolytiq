import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const statusPulseVariants = cva(
  'inline-flex items-center gap-2 text-xs font-medium',
  {
    variants: {
      status: {
        critical: 'text-status-error',
        high: 'text-status-warning',
        normal: 'text-text-primary',
        low: 'text-text-secondary',
        success: 'text-status-success',
      },
    },
    defaultVariants: {
      status: 'normal',
    },
  }
);

const pulseIndicatorVariants = cva(
  'w-2 h-2 rounded-full animate-pulse',
  {
    variants: {
      status: {
        critical: 'bg-status-error',
        high: 'bg-status-warning',
        normal: 'bg-accent-primary',
        low: 'bg-text-tertiary',
        success: 'bg-status-success',
      },
    },
  }
);

export interface StatusPulseProps extends VariantProps<typeof statusPulseVariants> {
  label: string;
  count?: number;
  className?: string;
}

export function StatusPulse({ status, label, count, className }: StatusPulseProps) {
  return (
    <div className={cn(statusPulseVariants({ status }), className)}>
      <span className={pulseIndicatorVariants({ status })} />
      <span>
        {label}
        {count !== undefined && <span className="ml-1">({count})</span>}
      </span>
    </div>
  );
}

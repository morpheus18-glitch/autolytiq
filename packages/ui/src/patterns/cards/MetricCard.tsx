/**
 * MetricCard - Single Number Display Pattern
 *
 * Use for displaying a single metric with label.
 * Examples: "23 Active Deals", "$145K Revenue", "87% Close Rate"
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import { CardShell, CardHeader, type CardShellProps } from './CardShell.js';
import { Stack } from '../../primitives/Stack.js';
import { Inline } from '../../primitives/Inline.js';
import { Text } from '../../primitives/Text.js';
import { Badge } from '../../components/Badge.js';

export const metricVariants = cva('', {
  variants: {
    /**
     * Metric trend direction
     */
    trend: {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400',
      none: '',
    },
  },
  defaultVariants: {
    trend: 'none',
  },
});

export interface MetricCardProps extends Omit<CardShellProps, 'children'> {
  /**
   * Metric value (main number)
   */
  value: string | number;
  /**
   * Metric label (e.g., "Active Deals")
   */
  label: string;
  /**
   * Metric description (optional)
   */
  description?: string;
  /**
   * Change indicator (e.g., "+12%", "-3")
   */
  change?: string;
  /**
   * Trend direction
   */
  trend?: VariantProps<typeof metricVariants>['trend'];
  /**
   * Icon element (optional)
   */
  icon?: React.ReactNode;
  /**
   * Badge text (optional, e.g., "This Week")
   */
  badge?: string;
  /**
   * Action button (optional)
   */
  action?: React.ReactNode;
}

/**
 * MetricCard Component
 *
 * Display a single metric with optional trend indicator.
 *
 * @example
 * <MetricCard
 *   title="Active Deals"
 *   value={23}
 *   label="deals in progress"
 *   change="+5"
 *   trend="up"
 *   priority="high"
 * />
 */
export const MetricCard = React.forwardRef<HTMLElement, MetricCardProps>(
  (
    {
      className,
      title,
      description,
      value,
      label,
      change,
      trend = 'none',
      icon,
      badge,
      action,
      size = 'SMALL',
      ...shellProps
    },
    ref
  ) => {
    return (
      <CardShell
        ref={ref}
        className={cn('', className)}
        title={title}
        description={description}
        size={size}
        {...shellProps}
      >
        <Stack gap="md" align="start">
          {/* Header */}
          {title && (
            <CardHeader
              title={title}
              description={description}
              icon={icon}
              action={action}
            />
          )}

          {/* Metric Value */}
          <div className="flex-1 flex flex-col justify-center">
            <Inline gap="sm" align="baseline" wrap="wrap">
              <Text
                as="span"
                variant="display"
                color="primary"
                className="font-bold"
              >
                {value}
              </Text>
              {change && (
                <Text
                  as="span"
                  variant="ui"
                  className={cn(metricVariants({ trend }))}
                >
                  {change}
                </Text>
              )}
              {badge && (
                <Badge variant="secondary" className="ml-2">
                  {badge}
                </Badge>
              )}
            </Inline>

            <Text variant="ui" color="secondary" className="mt-1">
              {label}
            </Text>
          </div>
        </Stack>
      </CardShell>
    );
  }
);

MetricCard.displayName = 'MetricCard';

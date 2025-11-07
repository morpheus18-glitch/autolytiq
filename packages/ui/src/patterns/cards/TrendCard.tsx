/**
 * TrendCard - Metric with Trend Visualization Pattern
 *
 * Use for displaying a metric with historical trend data.
 * Examples: "Revenue Trend", "Deal Velocity", "Conversion Rate Over Time"
 */

import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { CardShell, CardHeader, type CardShellProps } from './CardShell.js';
import { Stack } from '../../primitives/Stack.js';
import { Inline } from '../../primitives/Inline.js';
import { Text } from '../../primitives/Text.js';
import { Badge } from '../../components/Badge.js';

export interface TrendDataPoint {
  /**
   * X-axis value (e.g., date, timestamp)
   */
  x: string | number;
  /**
   * Y-axis value (metric value)
   */
  y: number;
  /**
   * Label for tooltip (optional)
   */
  label?: string;
}

export interface TrendCardProps extends Omit<CardShellProps, 'children'> {
  /**
   * Current metric value
   */
  value: string | number;
  /**
   * Metric label
   */
  label: string;
  /**
   * Change indicator (e.g., "+12%")
   */
  change?: string;
  /**
   * Trend direction
   */
  trend?: 'up' | 'down' | 'neutral';
  /**
   * Historical data points for sparkline
   */
  data?: TrendDataPoint[];
  /**
   * Time period label (e.g., "Last 7 days")
   */
  period?: string;
  /**
   * Icon element (optional)
   */
  icon?: React.ReactNode;
  /**
   * Action button (optional)
   */
  action?: React.ReactNode;
}

/**
 * Simple SVG sparkline renderer
 */
const Sparkline = ({ data, className }: { data: TrendDataPoint[]; className?: string }) => {
  if (!data || data.length < 2) return null;

  const width = 200;
  const height = 40;
  const padding = 4;

  const values = data.map((d) => d.y);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((point.y - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('text-blue-500', className)}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * TrendCard Component
 *
 * Display a metric with sparkline trend visualization.
 *
 * @example
 * <TrendCard
 *   title="Revenue"
 *   value="$145K"
 *   label="this month"
 *   change="+12%"
 *   trend="up"
 *   data={historicalData}
 *   period="Last 30 days"
 *   priority="high"
 * />
 */
export const TrendCard = React.forwardRef<HTMLElement, TrendCardProps>(
  (
    {
      className,
      title,
      description,
      value,
      label,
      change,
      trend = 'neutral',
      data,
      period,
      icon,
      action,
      size = 'SMALL',
      ...shellProps
    },
    ref
  ) => {
    const trendColor = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400',
    }[trend];

    return (
      <CardShell
        ref={ref}
        className={cn('', className)}
        title={title}
        description={description}
        size={size}
        {...shellProps}
      >
        <Stack gap="md">
          {/* Header */}
          {title && (
            <CardHeader title={title} description={description} icon={icon} action={action} />
          )}

          {/* Metric */}
          <div>
            <Inline gap="sm" align="baseline" wrap="wrap">
              <Text as="span" variant="display" color="primary" className="font-bold">
                {value}
              </Text>
              {change && (
                <Text as="span" variant="ui" className={trendColor}>
                  {change}
                </Text>
              )}
            </Inline>
            <Text variant="ui" color="secondary" className="mt-1">
              {label}
            </Text>
          </div>

          {/* Sparkline */}
          {data && data.length > 0 && (
            <div className="mt-2">
              <Sparkline data={data} />
              {period && (
                <Badge variant="secondary" className="mt-2">
                  {period}
                </Badge>
              )}
            </div>
          )}
        </Stack>
      </CardShell>
    );
  }
);

TrendCard.displayName = 'TrendCard';

/**
 * ProfitBadge Component
 *
 * Color-coded badge for displaying profit metrics
 * Green (good), Yellow (marginal), Red (unprofitable)
 */

import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { dealColors, dealTypography } from '@/design-tokens/deal-studio';
import { cn } from '@/lib/utils';

export interface ProfitBadgeProps {
  /** Profit amount */
  amount: number;
  /** Thresholds for color coding */
  threshold?: {
    /** Minimum acceptable profit */
    min: number;
    /** Target profit */
    target: number;
  };
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show icon */
  showIcon?: boolean;
  /** Optional label */
  label?: string;
  /** Optional custom class name */
  className?: string;
}

export function ProfitBadge({
  amount,
  threshold = { min: 1000, target: 2000 },
  size = 'md',
  showIcon = true,
  label,
  className,
}: ProfitBadgeProps) {
  // Determine color based on thresholds
  const getColorClasses = () => {
    if (amount >= threshold.target) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
        icon: dealColors.deal.profitGreen,
      };
    } else if (amount >= threshold.min) {
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        icon: dealColors.deal.profitYellow,
      };
    } else {
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
        icon: dealColors.deal.profitRed,
      };
    }
  };

  const colors = getColorClasses();

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
      text: 'text-xs',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'h-5 w-5',
      text: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  // Format amount
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // Select appropriate icon
  const Icon = amount >= threshold.min ? TrendingUp : amount < 0 ? TrendingDown : AlertTriangle;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-bold border',
        'transition-all duration-200',
        colors.bg,
        colors.text,
        colors.border,
        sizes.container,
        className
      )}
    >
      {showIcon && <Icon className={sizes.icon} style={{ color: colors.icon }} />}

      {label && (
        <span className={cn('font-semibold', sizes.text)}>
          {label}:
        </span>
      )}

      <span
        className={cn('font-black tabular-nums', sizes.text)}
        style={{ fontFamily: dealTypography.fontFamily.mono }}
      >
        {formattedAmount}
      </span>
    </div>
  );
}

/**
 * Profit Meter Component
 * Visual bar showing profit level
 */
export interface ProfitMeterProps {
  /** Current profit */
  profit: number;
  /** Minimum profit threshold */
  minProfit: number;
  /** Target profit goal */
  targetProfit: number;
  /** Maximum value for scale */
  maxProfit?: number;
  /** Optional label */
  label?: string;
  /** Show numeric value */
  showValue?: boolean;
  /** Optional custom class name */
  className?: string;
}

export function ProfitMeter({
  profit,
  minProfit,
  targetProfit,
  maxProfit = targetProfit * 2,
  label = 'Gross Profit',
  showValue = true,
  className,
}: ProfitMeterProps) {
  // Calculate percentage for meter
  const percentage = Math.min((profit / maxProfit) * 100, 100);

  // Calculate threshold percentages
  const minPercentage = (minProfit / maxProfit) * 100;
  const targetPercentage = (targetProfit / maxProfit) * 100;

  // Determine color
  const getColor = () => {
    if (profit >= targetProfit) return dealColors.deal.profitGreen;
    if (profit >= minProfit) return dealColors.deal.profitYellow;
    return dealColors.deal.profitRed;
  };

  const color = getColor();

  // Format profit
  const formattedProfit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(profit);

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {showValue && (
          <span
            className="text-xl font-black tabular-nums"
            style={{
              color,
              fontFamily: dealTypography.fontFamily.mono,
            }}
          >
            {formattedProfit}
          </span>
        )}
      </div>

      {/* Meter Track */}
      <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
        {/* Progress Bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />

        {/* Threshold Markers */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
          style={{ left: `${minPercentage}%` }}
          title={`Min: $${minProfit.toLocaleString()}`}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-600"
          style={{ left: `${targetPercentage}%` }}
          title={`Target: $${targetProfit.toLocaleString()}`}
        />
      </div>

      {/* Threshold Labels */}
      <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
        <span>$0</span>
        <span className="text-slate-600 font-medium">
          Min: ${minProfit.toLocaleString()}
        </span>
        <span className="text-slate-700 font-semibold">
          Target: ${targetProfit.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/**
 * Profit Breakdown Component
 * Shows front-end vs back-end profit split
 */
export interface ProfitBreakdownProps {
  /** Front-end (vehicle) profit */
  frontEndProfit: number;
  /** Back-end (F&I) profit */
  backEndProfit: number;
  /** Thresholds */
  threshold?: {
    min: number;
    target: number;
  };
  /** Optional custom class name */
  className?: string;
}

export function ProfitBreakdown({
  frontEndProfit,
  backEndProfit,
  threshold = { min: 1000, target: 2000 },
  className,
}: ProfitBreakdownProps) {
  const totalProfit = frontEndProfit + backEndProfit;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Total Profit Badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Total Gross Profit</span>
        <ProfitBadge
          amount={totalProfit}
          threshold={threshold}
          size="lg"
          showIcon={true}
        />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-xs font-semibold text-blue-700 mb-1">Front-End</div>
          <div
            className="text-2xl font-black text-blue-900 tabular-nums"
            style={{ fontFamily: dealTypography.fontFamily.mono }}
          >
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(frontEndProfit)}
          </div>
          <div className="text-xs text-blue-600 mt-1">Vehicle Profit</div>
        </div>

        <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
          <div className="text-xs font-semibold text-green-700 mb-1">Back-End</div>
          <div
            className="text-2xl font-black text-green-900 tabular-nums"
            style={{ fontFamily: dealTypography.fontFamily.mono }}
          >
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(backEndProfit)}
          </div>
          <div className="text-xs text-green-600 mt-1">F&I Profit</div>
        </div>
      </div>
    </div>
  );
}

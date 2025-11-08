/**
 * DealSlider Component
 *
 * Touch-friendly slider for deal structure inputs
 * Large hit targets, real-time value display, smooth interactions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Lock, TrendingUp, TrendingDown } from 'lucide-react';
import { dealColors, dealTypography, dealSpacing } from '@/design-tokens/deal-studio';
import { cn } from '@/lib/utils';

export interface DealSliderProps {
  /** Label for the slider */
  label: string;
  /** Current value */
  value: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Format function for displaying value */
  formatValue?: (value: number) => string;
  /** Helper text below slider */
  helperText?: string;
  /** Whether slider is locked (disabled) */
  locked?: boolean;
  /** Show trend indicator */
  showTrend?: boolean;
  /** Previous value for trend calculation */
  previousValue?: number;
  /** Optional custom class name */
  className?: string;
}

export function DealSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (v) => v.toString(),
  helperText,
  locked = false,
  showTrend = false,
  previousValue,
  className,
}: DealSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showValuePopup, setShowValuePopup] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  // Show value popup on hover or drag
  const handleMouseEnter = () => setShowValuePopup(true);
  const handleMouseLeave = () => !isDragging && setShowValuePopup(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
    },
    [onChange]
  );

  const handleMouseDown = () => {
    setIsDragging(true);
    setShowValuePopup(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setShowValuePopup(false);
  };

  // Cleanup
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setShowValuePopup(false);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging]);

  // Calculate trend
  const trend = previousValue !== undefined ? value - previousValue : 0;
  const hasTrend = showTrend && trend !== 0;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Label and Value Row */}
      <div className="flex items-center justify-between mb-3">
        <label
          className={cn(
            'text-sm font-semibold',
            locked ? 'text-slate-400' : 'text-slate-700'
          )}
        >
          {label}
          {locked && (
            <Lock className="inline-block ml-2 h-3.5 w-3.5 text-slate-400" />
          )}
        </label>

        <div className="flex items-center gap-2">
          {/* Trend Indicator */}
          {hasTrend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md',
                trend > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {trend > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formatValue(Math.abs(trend))}</span>
            </div>
          )}

          {/* Current Value */}
          <span
            className={cn(
              'text-xl font-bold tabular-nums',
              locked ? 'text-slate-400' : 'text-slate-900'
            )}
            style={{ fontFamily: dealTypography.fontFamily.mono }}
          >
            {formatValue(value)}
          </span>
        </div>
      </div>

      {/* Slider Track Container */}
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Value Popup (shows on hover/drag) */}
        {showValuePopup && !locked && (
          <div
            className="absolute -top-12 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg z-10 transition-all duration-200"
            style={{
              left: `calc(${percentage}% - 40px)`,
              fontFamily: dealTypography.fontFamily.mono,
            }}
          >
            {formatValue(value)}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
          </div>
        )}

        {/* Custom Track */}
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full transition-all duration-100',
              locked
                ? 'bg-slate-300'
                : 'bg-gradient-to-r from-blue-500 to-purple-500',
              isDragging && !locked && 'shadow-lg shadow-blue-300/50'
            )}
            style={{ width: `${percentage}%` }}
          />

          {/* Native Input (invisible but functional) */}
          <input
            ref={sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            disabled={locked}
            className={cn(
              'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
              locked && 'cursor-not-allowed'
            )}
            style={{
              // Custom thumb styling via CSS variable
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
        </div>

        {/* Custom Thumb */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full transition-all duration-100',
            'pointer-events-none shadow-md',
            locked
              ? 'bg-slate-400'
              : 'bg-white border-4 border-blue-600',
            isDragging && !locked && 'scale-125 shadow-lg shadow-blue-400/50'
          )}
          style={{
            left: `calc(${percentage}% - 12px)`,
          }}
        />
      </div>

      {/* Min/Max Labels */}
      <div className="flex items-center justify-between mt-2 text-xs text-slate-500 font-medium">
        <span>{formatValue(min)}</span>
        {helperText && (
          <span className="text-slate-600 font-semibold">{helperText}</span>
        )}
        <span>{formatValue(max)}</span>
      </div>

      {/* Locked Message */}
      {locked && (
        <div className="mt-2 text-xs text-slate-500 italic">
          This value is locked and will adjust automatically
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for smaller spaces or mobile
 */
export function DealSliderCompact({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (v) => v.toString(),
  locked = false,
  className,
}: Omit<DealSliderProps, 'helperText' | 'showTrend' | 'previousValue'>) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Value */}
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <span
          className="text-lg font-bold text-slate-900 tabular-nums"
          style={{ fontFamily: dealTypography.fontFamily.mono }}
        >
          {formatValue(value)}
        </span>
      </div>

      {/* Slider Track */}
      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            locked
              ? 'bg-slate-300'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          )}
          style={{ width: `${percentage}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={locked}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

/**
 * Currency formatter helper
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Percentage formatter helper
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

/**
 * Number formatter with commas
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

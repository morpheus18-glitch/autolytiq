/**
 * Deal Input with Slider Component
 *
 * Professional desking input: manual number input + optional slider
 * Styled like VinSolutions/DriveCentric for familiar UX
 */

import { useState, useCallback, useRef } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DealInputWithSliderProps {
  /** Label for the input */
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
  /** Parse function for input value */
  parseValue?: (value: string) => number;
  /** Prefix for input (e.g., "$", "%") */
  prefix?: string;
  /** Suffix for input (e.g., " mo", "%") */
  suffix?: string;
  /** Whether input is locked (disabled) */
  locked?: boolean;
  /** Show slider below input */
  showSlider?: boolean;
  /** Optional custom class name */
  className?: string;
}

export function DealInputWithSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (v) => v.toString(),
  parseValue = (v) => parseFloat(v.replace(/[^0-9.-]/g, '')),
  prefix = '',
  suffix = '',
  locked = false,
  showSlider = true,
  className,
}: DealInputWithSliderProps) {
  const [inputValue, setInputValue] = useState(formatValue(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const parsed = parseValue(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
      setInputValue(formatValue(clamped));
    } else {
      // Reset to current value if invalid
      setInputValue(formatValue(value));
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    // Select all text on focus for easy editing
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      onChange(newValue);
      setInputValue(formatValue(newValue));
    },
    [onChange, formatValue]
  );

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label & Input Field */}
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block flex items-center justify-between">
          <span>{label}</span>
          {locked && <Lock className="h-3 w-3 text-slate-400" />}
        </label>

        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-base">
              {prefix}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={isFocused ? inputValue : formatValue(value)}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            disabled={locked}
            className={cn(
              'w-full py-3 border-2 rounded-lg text-base font-mono font-semibold text-slate-900 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
              prefix ? 'pl-8 pr-3' : 'px-3',
              locked ? 'border-slate-200 bg-slate-50' : 'border-slate-300 bg-white'
            )}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
              {suffix}
            </span>
          )}
        </div>
      </div>

      {/* Optional Slider */}
      {showSlider && (
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            disabled={locked}
            className={cn(
              'w-full h-2 rounded-lg appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4',
              '[&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full',
              '[&::-webkit-slider-thumb]:bg-blue-600',
              '[&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-webkit-slider-thumb]:shadow-md',
              '[&::-webkit-slider-thumb]:transition-transform',
              '[&::-webkit-slider-thumb]:hover:scale-110',
              '[&::-moz-range-thumb]:w-4',
              '[&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-blue-600',
              '[&::-moz-range-thumb]:border-0',
              '[&::-moz-range-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:shadow-md',
              locked ? 'bg-slate-200' : 'bg-slate-200'
            )}
            style={{
              background: locked
                ? '#e2e8f0'
                : `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
            }}
          />

          {/* Min/Max Labels */}
          <div className="flex justify-between mt-1 text-xs text-slate-500">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for currency formatting
export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Helper function for percentage formatting
export function formatPercentage(value: number): string {
  return value.toFixed(2) + '%';
}

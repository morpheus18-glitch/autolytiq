/**
 * LivePaymentDisplay Component
 *
 * The hero component of the Deal Studio - displays monthly payment
 * with real-time updates and payment lock functionality
 */

import { useState, useEffect } from 'react';
import { Lock, Unlock, Loader2 } from 'lucide-react';
import { dealColors, dealTypography, dealShadows } from '@/design-tokens/deal-studio';
import { cn } from '@/lib/utils';

export interface LivePaymentDisplayProps {
  /** Monthly payment amount */
  payment: number;
  /** Whether payment is locked */
  isLocked?: boolean;
  /** Callback when lock button is clicked */
  onToggleLock?: () => void;
  /** Whether calculation is in progress */
  isCalculating?: boolean;
  /** Loan term in months */
  term?: number;
  /** Annual percentage rate */
  apr?: number;
  /** Whether deal is profitable (affects color) */
  isProfitable?: boolean;
  /** Optional custom class name */
  className?: string;
}

export function LivePaymentDisplay({
  payment,
  isLocked = false,
  onToggleLock,
  isCalculating = false,
  term,
  apr,
  isProfitable = true,
  className,
}: LivePaymentDisplayProps) {
  const [displayPayment, setDisplayPayment] = useState(payment);
  const [isAnimating, setIsAnimating] = useState(false);

  // Smooth animation when payment changes
  useEffect(() => {
    if (displayPayment !== payment) {
      setIsAnimating(true);
      const startValue = displayPayment;
      const endValue = payment;
      const duration = 200; // ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeProgress;

        setDisplayPayment(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [payment]);

  // Determine display color
  const getPaymentColor = () => {
    if (isLocked) return dealColors.deal.lockedBlue;
    if (!isProfitable) return dealColors.deal.profitRed;
    if (isCalculating || isAnimating) return dealColors.deal.calculating;
    return dealColors.text.primary;
  };

  const formattedPayment = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayPayment);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50',
        'border border-slate-200 transition-all duration-300',
        isLocked && 'border-blue-400 bg-gradient-to-br from-blue-100 to-blue-50',
        (isCalculating || isAnimating) && 'shadow-lg shadow-blue-200/50',
        className
      )}
    >
      {/* Glow effect when updating */}
      {(isCalculating || isAnimating) && (
        <div className="absolute inset-0 rounded-2xl bg-blue-400/10 animate-pulse" />
      )}

      {/* Header Label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
          Monthly Payment
        </span>
        {isCalculating && (
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
        )}
      </div>

      {/* Payment Amount - The Hero */}
      <div
        className="relative"
        style={{
          fontFamily: dealTypography.fontFamily.mono,
        }}
      >
        <div
          className={cn(
            'text-7xl font-black transition-colors duration-200',
            'tabular-nums tracking-tight'
          )}
          style={{
            color: getPaymentColor(),
          }}
        >
          {formattedPayment}
        </div>

        {/* Lock indicator overlay */}
        {isLocked && (
          <div className="absolute -right-12 top-1/2 -translate-y-1/2">
            <div className="p-2 bg-blue-100 rounded-full">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        )}
      </div>

      {/* Underline decoration */}
      <div
        className={cn(
          'h-1 w-32 rounded-full mt-3 transition-all duration-300',
          isLocked ? 'bg-blue-400' : 'bg-gradient-to-r from-blue-400 to-purple-400'
        )}
      />

      {/* Lock/Unlock Button */}
      {onToggleLock && (
        <button
          onClick={onToggleLock}
          className={cn(
            'mt-6 flex items-center gap-2 px-4 py-2 rounded-lg',
            'font-medium text-sm transition-all duration-200',
            'hover:scale-105 active:scale-95',
            isLocked
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          )}
        >
          {isLocked ? (
            <>
              <Lock className="h-4 w-4" />
              <span>Unlock Payment</span>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4" />
              <span>Lock Payment</span>
            </>
          )}
        </button>
      )}

      {/* Term and APR Info */}
      {(term || apr) && (
        <div className="mt-4 text-sm text-slate-600 font-medium">
          Based on:{' '}
          {term && <span>{term} months</span>}
          {term && apr && <span> @ </span>}
          {apr && <span>{apr}% APR</span>}
        </div>
      )}

      {/* Locked state message */}
      {isLocked && (
        <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 font-medium text-center">
            Payment locked. Other values will adjust automatically.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for mobile or smaller spaces
 */
export function LivePaymentDisplayCompact({
  payment,
  isLocked,
  isCalculating,
  className,
}: Pick<LivePaymentDisplayProps, 'payment' | 'isLocked' | 'isCalculating' | 'className'>) {
  const formattedPayment = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(payment);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl',
        'bg-gradient-to-r from-blue-50 to-purple-50 border border-slate-200',
        isLocked && 'border-blue-400 bg-blue-50',
        className
      )}
    >
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Monthly Payment
        </span>
        <span
          className={cn(
            'text-3xl font-black tabular-nums',
            isLocked ? 'text-blue-600' : 'text-slate-900'
          )}
          style={{ fontFamily: dealTypography.fontFamily.mono }}
        >
          {formattedPayment}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        {isCalculating && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
        {isLocked && (
          <div className="p-2 bg-blue-100 rounded-full">
            <Lock className="h-4 w-4 text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}

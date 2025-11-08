/**
 * Tax Quote Badge Component
 *
 * Displays concise tax quote with jurisdiction + fees
 * Tap/click opens read-only drawer with detailed breakdown
 */

import { useState } from 'react';
import { Info, ChevronRight, MapPin, FileText, DollarSign, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaxQuoteResponse } from '@/hooks/useTaxQuote';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@repo/ui';

interface TaxQuoteBadgeProps {
  /** Tax quote from useTaxQuote hook */
  quote: TaxQuoteResponse | null;
  /** Whether badge is loading */
  isLoading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Optional custom class name */
  className?: string;
}

/**
 * Compact badge showing tax quote summary
 * Opens detailed breakdown drawer on click
 */
export function TaxQuoteBadge({
  quote,
  isLoading = false,
  size = 'md',
  className,
}: TaxQuoteBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 bg-surface-subtle border border-border-base rounded-lg animate-pulse',
          size === 'sm' && 'px-2 py-1 text-xs',
          size === 'md' && 'px-3 py-1.5 text-sm',
          size === 'lg' && 'px-4 py-2 text-base',
          className
        )}
      >
        <div className="h-3 w-3 bg-surface-muted rounded-full" />
        <div className="h-3 w-20 bg-surface-muted rounded" />
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Find primary jurisdiction (usually state)
  const primaryJurisdiction = quote.jurisdictions.find((j) => j.type === 'state') || quote.jurisdictions[0];

  return (
    <>
      {/* Badge */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30',
          'border border-cyan-200 dark:border-cyan-800 rounded-lg transition-all',
          'hover:from-cyan-100 hover:to-blue-100 dark:hover:from-cyan-900/40 dark:hover:to-blue-900/40',
          'hover:shadow-md active:scale-[0.98]',
          size === 'sm' && 'px-2 py-1 text-xs',
          size === 'md' && 'px-3 py-1.5 text-sm',
          size === 'lg' && 'px-4 py-2 text-base',
          className
        )}
      >
        <Info className={cn(
          'text-cyan-600 dark:text-cyan-400',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-3.5 w-3.5',
          size === 'lg' && 'h-4 w-4'
        )} />
        <span className="font-semibold text-text-primary">
          {formatCurrency(quote.total)} tax+fees
        </span>
        <ChevronRight className={cn(
          'text-text-tertiary',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-3.5 w-3.5',
          size === 'lg' && 'h-4 w-4'
        )} />
      </button>

      {/* Detailed Drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[440px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Tax & Title Breakdown</SheetTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-surface-subtle transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Total Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
              <div className="text-sm font-semibold opacity-90 mb-1">Total Tax & Fees</div>
              <div className="text-4xl font-black font-mono">{formatCurrency(quote.total)}</div>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-sm">
                <span>Tax: {formatCurrency(quote.tax)}</span>
                <span>Fees: {formatCurrency(quote.totalFees)}</span>
              </div>
            </div>

            {/* Jurisdictions */}
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-primary" />
                Tax Jurisdictions
              </h3>
              <div className="space-y-2">
                {quote.jurisdictions.map((jurisdiction, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-surface-base border border-border-base rounded-lg"
                  >
                    <div>
                      <div className="text-sm font-medium text-text-primary">{jurisdiction.name}</div>
                      <div className="text-xs text-text-tertiary capitalize">{jurisdiction.type}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-text-primary">
                        {formatCurrency(jurisdiction.amount)}
                      </div>
                      <div className="text-xs text-text-secondary">{jurisdiction.rate.toFixed(3)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fees */}
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent-primary" />
                Government & DMV Fees
              </h3>
              <div className="space-y-2">
                {quote.fees.map((fee, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-surface-base border border-border-base rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5 text-accent-secondary" />
                      <div>
                        <div className="text-sm font-medium text-text-primary">{fee.name}</div>
                        <div className="text-xs text-text-tertiary capitalize">
                          {fee.type} {fee.required && '• Required'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-mono font-bold text-text-primary">
                      {formatCurrency(fee.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-surface-subtle rounded-lg p-4 text-xs text-text-secondary space-y-1">
              <div className="flex items-center justify-between">
                <span>Calculation Version</span>
                <span className="font-mono font-semibold">{quote.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Effective Date</span>
                <span>{new Date(quote.effectiveDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Response Time</span>
                <span className="font-mono">{quote.latencyMs}ms</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>Note:</strong> Tax and fee estimates are based on current rates and may vary. Final amounts
                determined at time of registration. Some jurisdictions may have additional local fees.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Inline tax quote display (no drawer, read-only)
 */
export function TaxQuoteInline({
  quote,
  className,
}: {
  quote: TaxQuoteResponse | null;
  className?: string;
}) {
  if (!quote) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={cn('bg-surface-base border border-border-base rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-text-primary">Tax & Fees</h4>
        <div className="text-lg font-black font-mono text-text-primary">
          {formatCurrency(quote.total)}
        </div>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-text-secondary">
          <span>Sales Tax</span>
          <span className="font-mono">{formatCurrency(quote.tax)}</span>
        </div>
        <div className="flex items-center justify-between text-text-secondary">
          <span>Title & Registration</span>
          <span className="font-mono">{formatCurrency(quote.totalFees)}</span>
        </div>
      </div>
    </div>
  );
}

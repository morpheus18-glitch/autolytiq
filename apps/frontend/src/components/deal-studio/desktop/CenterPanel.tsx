/**
 * Center Panel - Deal Preview & Payment Breakdown (Desktop)
 *
 * Shows live payment calculation, deal summary, and profit breakdown
 * Visual focal point of the three-panel layout
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { TrendingUp, DollarSign, Percent, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CenterPanel() {
  const { deal, payment, profit, isCalculating } = useDealStudio();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const netTrade = deal.tradeValue - deal.tradePayoff;
  const totalFI = deal.warranty + deal.gap + deal.maintenance + deal.paintProtection;
  const amountFinanced = payment?.amountFinanced || 0;

  return (
    <div className="h-full flex flex-col bg-surface-subtle overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-surface-elevated border-b border-border-base px-8 py-6 z-10">
        <h2 className="text-2xl font-bold text-text-primary">Deal Preview</h2>
        <p className="text-sm text-text-secondary mt-1">
          Live calculation powered by Rust engine
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 space-y-6">
        {/* Live Payment Display */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold opacity-90">Monthly Payment</div>
              <div className="text-xs opacity-75">@ {deal.apr.toFixed(2)}% for {deal.term} months</div>
            </div>
            {isCalculating && (
              <Loader2 className="h-5 w-5 animate-spin opacity-75" />
            )}
          </div>
          <div className="text-6xl font-black font-mono">
            {formatCurrency(payment?.monthlyPayment || 0)}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-surface-base rounded-xl border border-border-base p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent-primary" />
            Payment Breakdown
          </h3>
          <div className="space-y-3">
            <BreakdownRow label="Sale Price" value={deal.salePrice} />
            <BreakdownRow label="Down Payment" value={-deal.downPayment} isNegative />
            {netTrade !== 0 && (
              <BreakdownRow
                label={netTrade > 0 ? 'Trade Equity' : 'Negative Equity'}
                value={netTrade}
                isNegative={netTrade > 0}
              />
            )}
            {totalFI > 0 && (
              <BreakdownRow label="F&I Products" value={totalFI} />
            )}
            <div className="border-t border-border-base my-3" />
            <BreakdownRow label="Amount Financed" value={amountFinanced} highlight />
            <BreakdownRow label="Total Interest" value={payment?.totalInterest || 0} />
            <BreakdownRow label="Total Cost" value={payment?.totalCost || 0} />
          </div>
        </div>

        {/* Profit Analysis */}
        <div className="bg-surface-base rounded-xl border border-border-base p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Profit Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <ProfitCard
              label="Front-End Gross"
              value={profit?.frontEndProfit || 0}
              color="blue"
            />
            <ProfitCard
              label="Back-End Gross"
              value={profit?.backEndProfit || 0}
              color="violet"
            />
            <ProfitCard
              label="Total Gross"
              value={profit?.totalProfit || 0}
              color="emerald"
              large
            />
            <ProfitCard
              label="Vehicle Margin"
              value={profit?.vehicleMargin || 0}
              color="cyan"
            />
          </div>
        </div>

        {/* Deal Summary */}
        <div className="bg-surface-base rounded-xl border border-border-base p-6 shadow-sm">
          <h3 className="text-sm font-bold text-text-primary mb-4">Deal Summary</h3>
          <div className="space-y-2 text-sm">
            <SummaryRow icon={DollarSign} label="Sale Price" value={formatCurrency(deal.salePrice)} />
            <SummaryRow icon={DollarSign} label="Down Payment" value={formatCurrency(deal.downPayment)} />
            <SummaryRow icon={Percent} label="APR" value={`${deal.apr.toFixed(2)}%`} />
            <SummaryRow icon={Calendar} label="Term" value={`${deal.term} months`} />
            {totalFI > 0 && (
              <>
                <div className="border-t border-border-subtle my-2" />
                <div className="text-xs font-semibold text-text-tertiary mb-1">F&I Products:</div>
                {deal.warranty > 0 && (
                  <SummaryRow label="Warranty" value={formatCurrency(deal.warranty)} indent />
                )}
                {deal.gap > 0 && (
                  <SummaryRow label="GAP" value={formatCurrency(deal.gap)} indent />
                )}
                {deal.maintenance > 0 && (
                  <SummaryRow label="Maintenance" value={formatCurrency(deal.maintenance)} indent />
                )}
                {deal.paintProtection > 0 && (
                  <SummaryRow label="Paint Protection" value={formatCurrency(deal.paintProtection)} indent />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Breakdown Row Component
 */
interface BreakdownRowProps {
  label: string;
  value: number;
  isNegative?: boolean;
  highlight?: boolean;
}

function BreakdownRow({ label, value, isNegative = false, highlight = false }: BreakdownRowProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  };

  return (
    <div className={cn(
      'flex items-center justify-between',
      highlight && 'py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/30'
    )}>
      <span className={cn(
        'text-sm',
        highlight ? 'font-bold text-text-primary' : 'text-text-secondary'
      )}>
        {label}
      </span>
      <span className={cn(
        'text-sm font-mono font-semibold',
        highlight && 'font-bold text-blue-600',
        isNegative && !highlight && 'text-red-600'
      )}>
        {isNegative && value > 0 && '-'}
        {formatCurrency(value)}
      </span>
    </div>
  );
}

/**
 * Profit Card Component
 */
interface ProfitCardProps {
  label: string;
  value: number;
  color: 'blue' | 'violet' | 'emerald' | 'cyan';
  large?: boolean;
}

function ProfitCard({ label, value, color, large = false }: ProfitCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800',
    violet: 'from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/30 border-violet-200 dark:border-violet-800',
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    cyan: 'from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/30 border-cyan-200 dark:border-cyan-800',
  };

  const textColorClasses = {
    blue: value >= 2000 ? 'text-blue-600 dark:text-blue-400' : value >= 1000 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400',
    violet: value >= 1000 ? 'text-violet-600 dark:text-violet-400' : 'text-amber-600 dark:text-amber-400',
    emerald: value >= 3000 ? 'text-emerald-600 dark:text-emerald-400' : value >= 2000 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400',
    cyan: value >= 500 ? 'text-cyan-600 dark:text-cyan-400' : 'text-amber-600 dark:text-amber-400',
  };

  return (
    <div className={cn(
      'bg-gradient-to-br rounded-lg p-4 border',
      colorClasses[color],
      large && 'col-span-2'
    )}>
      <div className="text-xs font-semibold text-text-tertiary mb-1">{label}</div>
      <div className={cn(
        'font-mono font-black',
        large ? 'text-3xl' : 'text-2xl',
        textColorClasses[color]
      )}>
        {formatCurrency(value)}
      </div>
    </div>
  );
}

/**
 * Summary Row Component
 */
interface SummaryRowProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  indent?: boolean;
}

function SummaryRow({ icon: Icon, label, value, indent = false }: SummaryRowProps) {
  return (
    <div className={cn(
      'flex items-center justify-between',
      indent && 'pl-4'
    )}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-accent-primary" />}
        <span className="text-text-secondary">{label}</span>
      </div>
      <span className="font-mono font-semibold text-text-primary">{value}</span>
    </div>
  );
}

/**
 * Deal Structure Summary Component
 *
 * Displays complete deal breakdown with profit analysis
 * Shown at bottom of simulator panel
 */

import { Save, FileText, Send, TrendingUp, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dealStudioTokens, getProfitColor } from '@/design-tokens/deal-studio';
import { ProfitBadge } from './ProfitBadge';

export interface DealStructureSummaryProps {
  deal: {
    vehiclePrice: number;
    downPayment: number;
    netTrade: number;
    amountFinanced: number;
    fiProducts: number;
    totalFinanced: number;
    frontEndProfit: number;
    backEndProfit: number;
    totalProfit: number;
  };
  onSave?: () => void;
  onExport?: () => void;
  onSendToCustomer?: () => void;
  className?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function DealStructureSummary({
  deal,
  onSave,
  onExport,
  onSendToCustomer,
  className,
}: DealStructureSummaryProps) {
  const profitThresholds = { min: 1000, target: 2500 };

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Deal Structure</h3>
          </div>
        </div>
      </div>

      {/* Deal Breakdown */}
      <div className="px-6 py-5">
        <div className="space-y-3">
          {/* Vehicle Price */}
          <DealRow label="Vehicle Price" value={deal.vehiclePrice} />

          {/* Down Payment */}
          <DealRow label="Down Payment" value={-deal.downPayment} isNegative highlight />

          {/* Trade Equity/Negative Equity */}
          {deal.netTrade !== 0 && (
            <DealRow
              label={deal.netTrade > 0 ? 'Trade Equity' : 'Negative Equity'}
              value={deal.netTrade > 0 ? -deal.netTrade : Math.abs(deal.netTrade)}
              isNegative={deal.netTrade > 0}
              highlight
            />
          )}

          {/* F&I Products */}
          {deal.fiProducts > 0 && (
            <DealRow label="F&I Products" value={deal.fiProducts} />
          )}

          {/* Divider */}
          <div className="border-t-2 border-slate-300 dark:border-slate-600 my-4" />

          {/* Amount Financed */}
          <DealRow
            label="Amount Financed"
            value={deal.amountFinanced}
            highlight
            className="text-base font-bold"
          />
        </div>
      </div>

      {/* Profit Analysis */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 px-6 py-5 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Profit Analysis</h4>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Front-End */}
          <div className="text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Front-End</div>
            <div className="flex items-center justify-center gap-1">
              <span className={cn(
                'text-xl font-bold font-mono',
                deal.frontEndProfit >= profitThresholds.target ? 'text-emerald-600 dark:text-emerald-400' :
                deal.frontEndProfit >= profitThresholds.min ? 'text-yellow-600 dark:text-yellow-400' :
                'text-orange-600 dark:text-orange-400'
              )}>
                {formatCurrency(deal.frontEndProfit)}
              </span>
            </div>
          </div>

          {/* Back-End */}
          <div className="text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Back-End</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                {formatCurrency(deal.backEndProfit)}
              </span>
            </div>
          </div>

          {/* Total Gross */}
          <div className="text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Gross</div>
            <div className="flex items-center justify-center gap-1">
              <ProfitBadge
                amount={deal.totalProfit}
                threshold={profitThresholds}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Profit Meter */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
            <span>Minimum: {formatCurrency(profitThresholds.min)}</span>
            <span>Target: {formatCurrency(profitThresholds.target)}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className={cn(
                'h-3 rounded-full transition-all duration-500',
                deal.totalProfit >= profitThresholds.target
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : deal.totalProfit >= profitThresholds.min
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600'
              )}
              style={{
                width: `${Math.min((deal.totalProfit / (profitThresholds.target * 1.5)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(onSave || onExport || onSendToCustomer) && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-3">
          {onSave && (
            <button
              onClick={onSave}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Save className="h-4 w-4" />
              <span>Save Deal</span>
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="flex-1 py-2.5 px-4 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span>Export PDF</span>
            </button>
          )}
          {onSendToCustomer && (
            <button
              onClick={onSendToCustomer}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Send className="h-4 w-4" />
              <span>Send to Customer</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface DealRowProps {
  label: string;
  value: number;
  isNegative?: boolean;
  highlight?: boolean;
  className?: string;
}

function DealRow({ label, value, isNegative = false, highlight = false, className }: DealRowProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className={cn(
        'text-sm',
        highlight ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'
      )}>
        {label}
      </span>
      <span className={cn(
        'font-mono',
        highlight ? 'text-base font-bold text-slate-900 dark:text-slate-100' : 'text-sm text-slate-700 dark:text-slate-300',
        isNegative && 'text-emerald-600 dark:text-emerald-400'
      )}>
        {isNegative && value > 0 ? '-' : ''}
        {formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}

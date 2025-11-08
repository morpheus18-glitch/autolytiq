/**
 * AI Coach Card Component
 *
 * Displays AI-powered deal recommendations with "Stage This Deal" action
 * Used in both desktop (AICompanionPanel) and mobile (AICoachTab)
 */

import { TrendingUp, Target, Scale, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dealStudioTokens } from '@/design-tokens/deal-studio';
import type { AIRecommendation } from '@/services/aiDealService';

export interface AICoachCardProps {
  recommendation: AIRecommendation;
  onStage: () => void;
  isStaged?: boolean;
  className?: string;
}

const typeConfig = {
  max_profit: {
    icon: TrendingUp,
    color: 'emerald',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconBgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-900 dark:text-emerald-100',
  },
  best_close: {
    icon: Target,
    color: 'blue',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    iconBgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    textColor: 'text-blue-900 dark:text-blue-100',
  },
  balanced: {
    icon: Scale,
    color: 'purple',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    iconBgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
    textColor: 'text-purple-900 dark:text-purple-100',
  },
};

const confidenceBadge = {
  high: { label: 'High Confidence', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  medium: { label: 'Medium Confidence', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  low: { label: 'Low Confidence', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
};

export function AICoachCard({ recommendation, onStage, isStaged = false, className }: AICoachCardProps) {
  const config = typeConfig[recommendation.type];
  const Icon = config.icon;
  const confidence = confidenceBadge[recommendation.confidence];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return 'text-emerald-600 dark:text-emerald-400';
    if (prob >= 0.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getProfitColor = (profit: number) => {
    if (profit >= 2500) return 'text-emerald-600 dark:text-emerald-400';
    if (profit >= 1500) return 'text-blue-600 dark:text-blue-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-slate-900 rounded-xl border-l-4 shadow-md hover:shadow-xl transition-all duration-200',
        config.borderColor,
        isStaged && 'ring-2 ring-blue-500 ring-offset-2',
        className
      )}
      style={{
        transition: `all ${dealStudioTokens.transitions.normal} ${dealStudioTokens.easings.easeOut}`,
      }}
    >
      {/* Header */}
      <div className={cn('px-5 py-4 border-b border-slate-200 dark:border-slate-700', config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg shadow-sm', config.iconBgColor)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className={cn('text-lg font-bold', config.textColor)}>{recommendation.label}</h3>
              <span className={cn('text-xs font-semibold px-2 py-1 rounded-full', confidence.color)}>
                {confidence.label}
              </span>
            </div>
          </div>
          {isStaged && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Staged</span>
            </div>
          )}
        </div>
      </div>

      {/* Deal Structure */}
      <div className="px-5 py-4 space-y-3">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Recommended Offer</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Payment</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatCurrency(recommendation.metrics.monthlyPayment)}/mo
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Down Payment</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatCurrency(recommendation.structure.downPayment)}
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Term</div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {recommendation.structure.term} months
            </div>
          </div>
          <div>
            <div className="text-slate-500 dark:text-slate-400 text-xs">Sale Price</div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(recommendation.structure.salePrice)}
            </div>
          </div>
        </div>

        {/* F&I Products */}
        {(recommendation.structure.warranty || recommendation.structure.gap ||
          recommendation.structure.maintenance || recommendation.structure.paintProtection) && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Includes:</div>
            <div className="flex flex-wrap gap-2">
              {recommendation.structure.warranty > 0 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md font-medium">
                  Warranty {formatCurrency(recommendation.structure.warranty)}
                </span>
              )}
              {recommendation.structure.gap > 0 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md font-medium">
                  GAP {formatCurrency(recommendation.structure.gap)}
                </span>
              )}
              {recommendation.structure.maintenance > 0 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md font-medium">
                  Maintenance {formatCurrency(recommendation.structure.maintenance)}
                </span>
              )}
              {recommendation.structure.paintProtection > 0 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-md font-medium">
                  Paint Protection {formatCurrency(recommendation.structure.paintProtection)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Talking Point */}
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">💬 Talking Point</div>
        <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
          "{recommendation.talkingPoint}"
        </p>
      </div>

      {/* Metrics */}
      <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Expected Outcome</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Close Prob</div>
            <div className={cn('text-xl font-bold', getProbabilityColor(recommendation.metrics.closeProb))}>
              {formatPercent(recommendation.metrics.closeProb)}
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
              <div
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  recommendation.metrics.closeProb >= 0.7 ? 'bg-emerald-500' :
                  recommendation.metrics.closeProb >= 0.5 ? 'bg-yellow-500' : 'bg-orange-500'
                )}
                style={{ width: `${recommendation.metrics.closeProb * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gross Profit</div>
            <div className={cn('text-xl font-bold font-mono', getProfitColor(recommendation.metrics.grossProfit))}>
              {formatCurrency(recommendation.metrics.grossProfit)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Approval</div>
            <div className={cn('text-xl font-bold', getProbabilityColor(recommendation.metrics.approvalProb))}>
              {formatPercent(recommendation.metrics.approvalProb)}
            </div>
          </div>
        </div>
      </div>

      {/* Stage Button */}
      <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onStage}
          disabled={isStaged}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2',
            'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
            isStaged
              ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
          )}
        >
          {isStaged ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Already Staged</span>
            </>
          ) : (
            <>
              <span>🚀 Stage This Deal</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>

      {/* Reasoning (Collapsed by default) */}
      {recommendation.reasoning && (
        <details className="px-5 pb-4">
          <summary className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
            View AI Reasoning
          </summary>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
            {recommendation.reasoning}
          </p>
        </details>
      )}
    </div>
  );
}

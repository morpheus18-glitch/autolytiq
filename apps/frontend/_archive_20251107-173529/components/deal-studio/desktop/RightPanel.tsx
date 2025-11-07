/**
 * Right Panel - AI Coach (Desktop)
 *
 * Persistent AI recommendations panel for desktop
 * Always visible alongside the deal controls
 */

import { useState, useCallback } from 'react';
import { useDealStudio } from '@/contexts/DealStudioContext';
import { Sparkles, TrendingUp, Target, Scale, AlertCircle, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAIRecommendations, type AIRecommendation, type DealAnalysis } from '@/services/aiDealService';

export function RightPanel() {
  const { deal, updateDeal } = useDealStudio();
  const [customerOffer, setCustomerOffer] = useState({ payment: '', downPayment: '' });
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetStrategy = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getAIRecommendations({
        currentDeal: {
          salePrice: deal.salePrice,
          downPayment: deal.downPayment,
          term: deal.term,
          apr: deal.apr,
          warranty: deal.warranty,
          gap: deal.gap,
          maintenance: deal.maintenance,
          paintProtection: deal.paintProtection,
          tradeValue: deal.tradeValue,
          tradePayoff: deal.tradePayoff,
        },
        customerOffer: customerOffer.payment || customerOffer.downPayment ? {
          desiredPayment: parseFloat(customerOffer.payment) || 0,
          desiredDownPayment: parseFloat(customerOffer.downPayment) || 0,
        } : undefined,
        customerProfile: {
          creditScore: deal.creditScore,
          walkProbability: 0.6,
        },
        vehicleContext: {
          vehicleId: deal.vehicleId || 'demo-vehicle',
          daysInStock: 58,
          currentPrice: deal.vehiclePrice,
          cost: deal.vehicleCost,
        },
        constraints: {
          minProfit: 1000,
        },
      });

      setAnalysis(result);
    } catch (err) {
      console.error('Failed to get AI recommendations:', err);
      setError('Failed to get AI recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [deal, customerOffer]);

  const handleStage = useCallback((recommendation: AIRecommendation) => {
    updateDeal({
      salePrice: recommendation.structure.salePrice,
      downPayment: recommendation.structure.downPayment,
      term: recommendation.structure.term,
      warranty: recommendation.structure.warranty,
      gap: recommendation.structure.gap || 0,
      maintenance: recommendation.structure.maintenance || 0,
      paintProtection: recommendation.structure.paintProtection || 0,
    });
  }, [updateDeal]);

  return (
    <div className="h-full flex flex-col bg-surface-base border-l border-border-base overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-br from-purple-600 to-pink-600 px-6 py-4 z-10">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Coach
        </h2>
        <p className="text-sm text-white/90 mt-1">
          Intelligent deal recommendations
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Customer Offer Input */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Customer's Offer
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                Monthly Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-mono text-sm">$</span>
                <input
                  type="number"
                  placeholder="450"
                  value={customerOffer.payment}
                  onChange={(e) => setCustomerOffer({ ...customerOffer, payment: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-border-base rounded-lg text-sm font-mono bg-surface-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                Down Payment
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary font-mono text-sm">$</span>
                <input
                  type="number"
                  placeholder="2000"
                  value={customerOffer.downPayment}
                  onChange={(e) => setCustomerOffer({ ...customerOffer, downPayment: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-border-base rounded-lg text-sm font-mono bg-surface-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleGetStrategy}
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>{isLoading ? 'Analyzing...' : 'Get AI Strategy'}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-800 dark:text-red-300">{error}</div>
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {analysis && (
          <>
            {/* Analysis Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-xs text-text-secondary leading-relaxed">
                  {analysis.gapFromTarget !== 0 && (
                    <>
                      Customer offer is <span className="font-bold text-red-600">${Math.abs(analysis.gapFromTarget).toFixed(0)} {analysis.gapFromTarget < 0 ? 'below' : 'above'}</span> target.{' '}
                    </>
                  )}
                  Customer has <span className="font-bold">{analysis.customerProfile.creditScore} FICO</span> with{' '}
                  <span className="font-bold text-orange-600">{(analysis.customerProfile.walkProbability * 100).toFixed(0)}% walk probability</span>.
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              {analysis.recommendations.map((rec) => (
                <DesktopAIRecommendationCard
                  key={rec.type}
                  recommendation={rec}
                  onStage={() => handleStage(rec)}
                />
              ))}
            </div>

            {/* Insights */}
            {analysis.insights.length > 0 && (
              <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg border border-cyan-200 dark:border-cyan-800 p-4">
                <h3 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-cyan-600" />
                  Insights
                </h3>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  {analysis.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-cyan-500 rounded-full mt-1.5 flex-shrink-0" />
                      <div>{insight}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {analysis.warnings.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800 p-4">
                <h3 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                  Warnings
                </h3>
                <div className="space-y-1.5 text-xs text-text-secondary">
                  {analysis.warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                      <div>{warning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!analysis && !isLoading && (
          <div className="bg-surface-subtle rounded-lg border-2 border-dashed border-border-base p-6 text-center">
            <Sparkles className="h-10 w-10 text-accent-secondary mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-text-primary mb-1">
              Ready for AI Insights
            </h3>
            <p className="text-xs text-text-tertiary">
              Enter customer's desired payment and down payment to receive intelligent deal recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Desktop AI Recommendation Card (Compact)
 */
interface DesktopAIRecommendationCardProps {
  recommendation: AIRecommendation;
  onStage: () => void;
}

function DesktopAIRecommendationCard({ recommendation, onStage }: DesktopAIRecommendationCardProps) {
  const { label, metrics, talkingPoint, confidence } = recommendation;

  const iconMap = {
    max_profit: TrendingUp,
    best_close: Target,
    balanced: Scale,
  };

  const colorScheme = {
    max_profit: {
      bg: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30',
      border: 'border-emerald-300 dark:border-emerald-700',
      icon: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    },
    best_close: {
      bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
      border: 'border-blue-300 dark:border-blue-700',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    },
    balanced: {
      bg: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
      border: 'border-violet-300 dark:border-violet-700',
      icon: 'text-violet-600',
      badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    },
  };

  const colors = colorScheme[recommendation.type];
  const Icon = iconMap[recommendation.type];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatProb = (prob: number) => `${(prob * 100).toFixed(0)}%`;

  return (
    <div className={cn(
      'bg-gradient-to-br rounded-lg border p-4 transition-all',
      colors.bg,
      colors.border
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 bg-white dark:bg-surface-elevated rounded-md shadow-sm', colors.icon)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="font-bold text-xs text-text-primary">{label}</div>
        </div>
        <div className={cn('text-xs px-2 py-0.5 rounded-full font-semibold', colors.badge)}>
          {confidence}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <MetricCell label="Payment" value={`$${metrics.monthlyPayment}`} />
        <MetricCell
          label="Profit"
          value={formatCurrency(metrics.grossProfit)}
          color={
            metrics.grossProfit >= 2000 ? 'emerald' :
            metrics.grossProfit >= 1000 ? 'amber' : 'red'
          }
        />
        <MetricCell
          label="Close"
          value={formatProb(metrics.closeProb)}
          color={
            metrics.closeProb >= 0.7 ? 'emerald' :
            metrics.closeProb >= 0.5 ? 'amber' : 'red'
          }
        />
        <MetricCell
          label="Approval"
          value={formatProb(metrics.approvalProb)}
          color={metrics.approvalProb >= 0.85 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Talking Point */}
      <div className="bg-white/60 dark:bg-surface-elevated/50 rounded-md p-2.5 mb-3">
        <div className="text-xs text-text-secondary italic leading-relaxed">
          "{talkingPoint}"
        </div>
      </div>

      {/* Stage Button */}
      <button
        onClick={onStage}
        className="w-full py-2 bg-white dark:bg-surface-elevated border border-border-base text-text-primary rounded-md font-semibold text-xs hover:bg-surface-subtle transition-all"
      >
        🚀 Stage This Deal
      </button>
    </div>
  );
}

/**
 * Metric Cell Component
 */
interface MetricCellProps {
  label: string;
  value: string;
  color?: 'emerald' | 'amber' | 'red';
}

function MetricCell({ label, value, color }: MetricCellProps) {
  const colorClasses = color ? {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
  }[color] : 'text-text-primary';

  return (
    <div className="bg-white dark:bg-surface-elevated rounded-md p-2 text-center">
      <div className="text-xs text-text-tertiary mb-0.5">{label}</div>
      <div className={cn('text-sm font-black font-mono', colorClasses)}>
        {value}
      </div>
    </div>
  );
}

/**
 * AI Coach Tab (Mobile)
 *
 * AI recommendations optimized for mobile
 * Vertical feed with touch-friendly cards
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { Sparkles, TrendingUp, Target, Scale, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../shared/DealSlider';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { getAIRecommendations, type AIRecommendation, type DealAnalysis } from '@/services/aiDealService';

export function AICoachTab() {
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
    // Update deal with recommended structure
    updateDeal({
      salePrice: recommendation.structure.salePrice,
      downPayment: recommendation.structure.downPayment,
      term: recommendation.structure.term,
      warranty: recommendation.structure.warranty,
      gap: recommendation.structure.gap || 0,
      maintenance: recommendation.structure.maintenance || 0,
      paintProtection: recommendation.structure.paintProtection || 0,
    });

    // Show success feedback (could add toast notification)
    console.log('Deal staged:', recommendation.label);
  }, [updateDeal]);

  // Icon mapping
  const iconMap = {
    max_profit: TrendingUp,
    best_close: Target,
    balanced: Scale,
  };

  return (
    <div className="h-full p-4 space-y-4 pb-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg border border-purple-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-purple-900">
            Customer's Offer
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Monthly Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
              <input
                type="number"
                placeholder="450"
                value={customerOffer.payment}
                onChange={(e) => setCustomerOffer({ ...customerOffer, payment: e.target.value })}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg text-base font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Down Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono">$</span>
              <input
                type="number"
                placeholder="2000"
                value={customerOffer.downPayment}
                onChange={(e) => setCustomerOffer({ ...customerOffer, downPayment: e.target.value })}
                className="w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg text-base font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={handleGetStrategy}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {analysis && (
        <>
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border border-purple-300 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-600 rounded-lg flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 text-sm text-purple-900">
                <div className="font-bold mb-1">AI Analysis</div>
                <p className="leading-relaxed text-xs">
                  {analysis.gapFromTarget !== 0 && (
                    <>
                      Customer offer is <span className="font-bold text-red-600">${Math.abs(analysis.gapFromTarget).toFixed(0)} {analysis.gapFromTarget < 0 ? 'below' : 'above'}</span> target.{' '}
                    </>
                  )}
                  Customer has <span className="font-bold">{analysis.customerProfile.creditScore} FICO</span> with{' '}
                  <span className="font-bold text-orange-600">{(analysis.customerProfile.walkProbability * 100).toFixed(0)}% walk probability</span>.{' '}
                  Vehicle is <span className="font-bold text-orange-600">{analysis.vehicleContext.daysInStock} days</span> on lot - consider aggressive counter.
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            {analysis.recommendations.map((rec) => (
              <MobileAIRecommendationCard
                key={rec.type}
                recommendation={rec}
                icon={iconMap[rec.type]}
                onStage={() => handleStage(rec)}
              />
            ))}
          </div>

          {/* Deal History */}
          {analysis.dealHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Deal History
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                {analysis.dealHistory.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">{insight.value}</span> - {insight.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
              <h3 className="text-sm font-bold text-orange-900 mb-2">⚠️ Warnings</h3>
              <div className="space-y-1.5 text-xs text-orange-800">
                {analysis.warnings.map((warning, idx) => (
                  <div key={idx}>• {warning}</div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {analysis.insights.length > 0 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="text-sm font-bold text-blue-900 mb-2">💡 Insights</h3>
              <div className="space-y-1.5 text-xs text-blue-800">
                {analysis.insights.map((insight, idx) => (
                  <div key={idx}>• {insight}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Initial State - No Analysis Yet */}
      {!analysis && !isLoading && (
        <div className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
          <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">
            Ready for AI Insights
          </h3>
          <p className="text-xs text-slate-500">
            Enter customer's desired payment and down payment, then click "Get AI Strategy" to receive intelligent deal recommendations
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile AI Recommendation Card
 */
interface MobileAIRecommendationCardProps {
  recommendation: AIRecommendation;
  icon: React.ComponentType<{ className?: string }>;
  onStage: () => void;
}

function MobileAIRecommendationCard({ recommendation, icon: Icon, onStage }: MobileAIRecommendationCardProps) {
  const { label, metrics, talkingPoint, confidence } = recommendation;

  // Color scheme mapping
  const colorScheme = {
    max_profit: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-300',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
    best_close: {
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-300',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
    },
    balanced: {
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-300',
      icon: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
    },
  };

  const colors = colorScheme[recommendation.type];

  const formatProb = (prob: number) => `${(prob * 100).toFixed(0)}%`;

  return (
    <div className={cn(
      "bg-gradient-to-br rounded-lg border-2 p-4 transition-all active:scale-98",
      colors.bg,
      colors.border
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 bg-white rounded-lg shadow-sm", colors.icon)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="font-bold text-sm text-slate-900">{label}</div>
        </div>
        <div className={cn("text-xs px-2 py-1 rounded-full font-semibold", colors.badge)}>
          {confidence}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white rounded-lg p-2.5 text-center">
          <div className="text-xs text-slate-600 mb-0.5">Payment</div>
          <div className="text-lg font-black text-slate-900 font-mono">
            ${metrics.monthlyPayment}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 text-center">
          <div className="text-xs text-slate-600 mb-0.5">Profit</div>
          <div className={cn(
            "text-lg font-black font-mono",
            metrics.grossProfit >= 2000 ? "text-green-600" :
            metrics.grossProfit >= 1000 ? "text-yellow-600" :
            "text-red-600"
          )}>
            {formatCurrency(metrics.grossProfit)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 text-center">
          <div className="text-xs text-slate-600 mb-0.5">Close</div>
          <div className={cn(
            "text-lg font-black font-mono",
            metrics.closeProb >= 0.7 ? "text-green-600" :
            metrics.closeProb >= 0.5 ? "text-yellow-600" :
            "text-red-600"
          )}>
            {formatProb(metrics.closeProb)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 text-center">
          <div className="text-xs text-slate-600 mb-0.5">Approval</div>
          <div className={cn(
            "text-lg font-black font-mono",
            metrics.approvalProb >= 0.85 ? "text-green-600" : "text-yellow-600"
          )}>
            {formatProb(metrics.approvalProb)}
          </div>
        </div>
      </div>

      {/* Talking Point */}
      <div className="bg-white/60 rounded-lg p-3 mb-3">
        <div className="text-xs font-semibold text-slate-600 mb-1">Talking Point:</div>
        <div className="text-xs text-slate-800 italic leading-relaxed">
          "{talkingPoint}"
        </div>
      </div>

      {/* Stage Button */}
      <button
        onClick={onStage}
        className="w-full py-3 bg-white border-2 border-slate-300 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-md"
      >
        🚀 Stage This Deal
      </button>
    </div>
  );
}

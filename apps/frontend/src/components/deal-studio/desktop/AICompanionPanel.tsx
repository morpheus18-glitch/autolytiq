/**
 * AI Companion Panel (Panel 3 - Right)
 *
 * Proactive AI recommendations and strategic guidance
 * "The Future" - Where AI suggests optimal deal structures
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { Sparkles, TrendingUp, Target, Scale, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatCurrency } from '../shared/DealSlider';
import { cn } from '@/lib/utils';

export function AICompanionPanel() {
  const { aiExpanded, toggleAIPanel, updateDeal } = useDealStudio();

  // Mock AI recommendations (will be replaced with actual ML service)
  const mockRecommendations = [
    {
      type: 'max_profit' as const,
      label: 'Maximum Profit',
      icon: TrendingUp,
      structure: {
        salePrice: 46500,
        downPayment: 3500,
        term: 60,
        warranty: 2495,
      },
      metrics: {
        monthlyPayment: 525,
        grossProfit: 2850,
        closeProb: 0.62,
        approvalProb: 0.89,
      },
      talkingPoint: "We're close! To get to your payment, we just need a bit more down. This gets you the best warranty coverage too.",
      confidence: 'high' as const,
    },
    {
      type: 'best_close' as const,
      label: 'Best Close Probability',
      icon: Target,
      structure: {
        salePrice: 45900,
        downPayment: 2500,
        term: 72,
        warranty: 0,
      },
      metrics: {
        monthlyPayment: 478,
        grossProfit: 1650,
        closeProb: 0.87,
        approvalProb: 0.92,
      },
      talkingPoint: "I can't do $450, but I can do $478 right now with less down. This keeps it affordable and gets you approved fast.",
      confidence: 'high' as const,
    },
    {
      type: 'balanced' as const,
      label: 'Balanced Approach',
      icon: Scale,
      structure: {
        salePrice: 46200,
        downPayment: 3000,
        term: 60,
        warranty: 2495,
        gap: 595,
      },
      metrics: {
        monthlyPayment: 502,
        grossProfit: 2275,
        closeProb: 0.74,
        approvalProb: 0.90,
      },
      talkingPoint: "Let's meet in the middle at $502. I'll throw in GAP insurance and warranty to protect your investment.",
      confidence: 'high' as const,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-purple-50/80 backdrop-blur-sm border-b border-purple-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!aiExpanded && (
            <div>
              <h2 className="text-sm font-bold text-purple-900">AI Companion</h2>
              <p className="text-xs text-purple-600">Strategic Guidance</p>
            </div>
          )}
        </div>

        <button
          onClick={toggleAIPanel}
          className="p-1.5 hover:bg-purple-200 rounded-lg transition-colors"
          title={aiExpanded ? "Collapse AI Panel" : "Expand AI Panel"}
        >
          {aiExpanded ? (
            <ChevronRight className="h-4 w-4 text-purple-700" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-purple-700" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Input Section */}
        <div className="bg-white rounded-lg border border-purple-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-purple-900 mb-3">
            Customer's Opening Offer
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Payment
              </label>
              <input
                type="number"
                placeholder="e.g., 450"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Down Payment
              </label>
              <input
                type="number"
                placeholder="e.g., 2000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <button className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-300/50">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Get AI Strategy</span>
              </div>
            </button>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border border-purple-300 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-600 rounded-lg flex-shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 text-sm text-purple-900">
              <div className="font-bold mb-1">AI Analysis</div>
              <p className="leading-relaxed">
                Customer offer is <span className="font-bold text-red-600">$1,150 below</span> minimum profit.
                Customer has <span className="font-bold">680 FICO</span> with <span className="font-bold text-orange-600">60% walk probability</span>.
                Vehicle is <span className="font-bold text-orange-600">58 days</span> on lot - consider aggressive counter.
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Feed */}
        <div className="space-y-3">
          {mockRecommendations.map((rec) => (
            <AIRecommendationCard
              key={rec.type}
              recommendation={rec}
              onStage={() => {
                // Apply recommendation to deal
                updateDeal(rec.structure);
              }}
            />
          ))}
        </div>

        {/* Deal History Insights */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Deal History Insights
          </h3>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">12 similar deals</span> closed on this vehicle type
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                Avg close at <span className="font-semibold">$482/mo</span>, <span className="font-semibold">$2,300 down</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <span className="font-semibold">68% close rate</span> with 72-month term
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <h3 className="text-sm font-bold text-orange-900 mb-2">⚠️ Warnings</h3>
          <div className="space-y-1.5 text-xs text-orange-800">
            <div>• High LTV (95%) - Consider larger down payment</div>
            <div>• PTI approaching 20% - Customer is payment sensitive</div>
            <div>• Customer previously walked at $500/mo</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * AI Recommendation Card Component
 */
interface AIRecommendationCardProps {
  recommendation: {
    type: 'max_profit' | 'best_close' | 'balanced';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    structure: any;
    metrics: {
      monthlyPayment: number;
      grossProfit: number;
      closeProb: number;
      approvalProb: number;
    };
    talkingPoint: string;
    confidence: 'high' | 'medium' | 'low';
  };
  onStage: () => void;
}

function AIRecommendationCard({ recommendation, onStage }: AIRecommendationCardProps) {
  const { type, label, icon: Icon, metrics, talkingPoint, confidence } = recommendation;

  // Color scheme by type
  const colorScheme = {
    max_profit: {
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-300',
      text: 'text-green-900',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
    best_close: {
      bg: 'from-blue-50 to-cyan-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
    },
    balanced: {
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-300',
      text: 'text-purple-900',
      icon: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
    },
  };

  const colors = colorScheme[type];

  // Format probability
  const formatProb = (prob: number) => `${(prob * 100).toFixed(0)}%`;

  return (
    <div className={cn(
      "bg-gradient-to-br rounded-lg border-2 p-4 transition-all hover:shadow-lg",
      colors.bg,
      colors.border
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 bg-white rounded-lg shadow-sm", colors.icon)}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className={cn("font-bold text-sm", colors.text)}>{label}</div>
            <div className={cn("text-xs px-2 py-0.5 rounded-full inline-block mt-1", colors.badge)}>
              {confidence} confidence
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white rounded-lg p-2 text-center">
          <div className="text-xs text-slate-600">Payment</div>
          <div className="text-base font-black text-slate-900 font-mono">
            ${metrics.monthlyPayment}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 text-center">
          <div className="text-xs text-slate-600">Profit</div>
          <div className={cn(
            "text-base font-black font-mono",
            metrics.grossProfit >= 2000 ? "text-green-600" :
            metrics.grossProfit >= 1000 ? "text-yellow-600" :
            "text-red-600"
          )}>
            {formatCurrency(metrics.grossProfit)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 text-center">
          <div className="text-xs text-slate-600">Close</div>
          <div className={cn(
            "text-base font-black font-mono",
            metrics.closeProb >= 0.7 ? "text-green-600" :
            metrics.closeProb >= 0.5 ? "text-yellow-600" :
            "text-red-600"
          )}>
            {formatProb(metrics.closeProb)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2 text-center">
          <div className="text-xs text-slate-600">Approval</div>
          <div className={cn(
            "text-base font-black font-mono",
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
        className="w-full py-2.5 bg-white border-2 border-slate-300 text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all hover:shadow-md"
      >
        🚀 Stage This Deal
      </button>
    </div>
  );
}

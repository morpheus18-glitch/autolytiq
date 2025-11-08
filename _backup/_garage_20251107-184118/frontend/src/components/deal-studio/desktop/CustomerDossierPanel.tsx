/**
 * Customer Dossier Panel (Panel 1 - Left)
 *
 * Displays customer context, financial info, vehicle details
 * "The Past" - Source of truth for AI recommendations
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { User, Phone, Mail, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { getCreditScoreColor } from '@/design-tokens/deal-studio';
import { cn } from '@/lib/utils';

export function CustomerDossierPanel() {
  const { deal, dossierCollapsed, toggleDossier } = useDealStudio();

  // If collapsed, show icon bar only
  if (dossierCollapsed) {
    return (
      <div className="flex flex-col items-center py-4 gap-4">
        <button
          onClick={toggleDossier}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          title="Expand Dossier"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </button>
        <div className="w-px h-full bg-slate-300" />
        <User className="h-5 w-5 text-slate-400" />
        <TrendingUp className="h-5 w-5 text-slate-400" />
      </div>
    );
  }

  // Get credit score color
  const creditColor = getCreditScoreColor(deal.creditScore);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Customer Dossier
        </h2>
        <button
          onClick={toggleDossier}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
          title="Collapse Dossier"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Customer Profile Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-lg">
                {deal.customerId ? 'Customer Name' : 'No Customer Selected'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm text-slate-600">(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm text-slate-600 truncate">customer@email.com</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500 font-medium">Status</div>
              <div className="text-sm font-semibold text-blue-600">Hot Lead</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Stage</div>
              <div className="text-sm font-semibold text-purple-600">Negotiation</div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            Financial Summary
          </h3>

          <div className="space-y-3">
            {/* Credit Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Credit Score</span>
              <div
                className="px-3 py-1 rounded-lg font-bold text-sm"
                style={{
                  backgroundColor: `${creditColor}20`,
                  color: creditColor,
                }}
              >
                {deal.creditScore}
              </div>
            </div>

            {/* Annual Income */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Annual Income</span>
              <span className="text-sm font-semibold text-slate-900">$75,000</span>
            </div>

            {/* DTI Ratio */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">DTI Ratio</span>
              <span className="text-sm font-semibold text-slate-900">18%</span>
            </div>

            {/* Max Payment Capacity */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-sm font-semibold text-slate-700">Max Payment</span>
              <span className="text-base font-black text-green-600">$625/mo</span>
            </div>
          </div>
        </div>

        {/* Vehicle Context */}
        {deal.vehicleId && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
              Vehicle
            </h3>

            {/* Vehicle Image Placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center mb-3">
              <span className="text-slate-500 text-sm">Vehicle Image</span>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-slate-900">2024 Ford F-150 Lariat</div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Cost:</span>
                  <span className="ml-1 font-semibold text-slate-900">
                    ${deal.vehicleCost.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">MSRP:</span>
                  <span className="ml-1 font-semibold text-slate-900">
                    ${deal.vehiclePrice.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Days on Lot:</span>
                  <span className="ml-1 font-semibold text-orange-600">58</span>
                </div>
                <div>
                  <span className="text-slate-500">Margin:</span>
                  <span className="ml-1 font-semibold text-green-600">
                    ${(deal.vehiclePrice - deal.vehicleCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            Recent Activity
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-slate-900 font-medium">Last DM</div>
                <div className="text-slate-600 text-xs mt-0.5">
                  "Hoping to make a deal today"
                </div>
                <div className="text-slate-400 text-xs mt-1">15 min ago</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-slate-900 font-medium">Showroom Visit</div>
                <div className="text-slate-400 text-xs mt-1">2 hours ago</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <div className="text-slate-900 font-medium">Test Drive</div>
                <div className="text-slate-600 text-xs mt-0.5">2024 F-150 Lariat</div>
                <div className="text-slate-400 text-xs mt-1">Yesterday</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trade-In (if applicable) */}
        {(deal.tradeValue > 0 || deal.tradePayoff > 0) && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
              Trade-In
            </h3>

            <div className="space-y-2">
              <div className="font-medium text-slate-900">2019 Chevy Silverado</div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Trade Value</span>
                  <span className="font-semibold text-slate-900">
                    ${deal.tradeValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Payoff</span>
                  <span className="font-semibold text-slate-900">
                    ${deal.tradePayoff.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Net Equity</span>
                  <span className={cn(
                    "font-black",
                    (deal.tradeValue - deal.tradePayoff) >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    ${(deal.tradeValue - deal.tradePayoff).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Dossier Header (Mobile)
 *
 * Sticky header showing key customer/vehicle info
 * Minimal design to maximize screen real estate
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { User, Car, Info, ChevronDown } from 'lucide-react';
import { getCreditScoreColor } from '@/design-tokens/deal-studio';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface CompactDossierHeaderProps {
  /** Callback to open full dossier details */
  onExpandDetails?: () => void;
  /** Optional custom class name */
  className?: string;
}

export function CompactDossierHeader({
  onExpandDetails,
  className,
}: CompactDossierHeaderProps) {
  const { deal } = useDealStudio();
  const [isExpanded, setIsExpanded] = useState(false);

  const creditColor = getCreditScoreColor(deal.creditScore);

  // Mock data (will be replaced with actual customer/vehicle data)
  const customerName = deal.customerId ? 'Jane Doe' : 'No Customer';
  const vehicleName = deal.vehicleId ? '2024 F-150 Lariat' : 'No Vehicle';
  const vehiclePrice = deal.vehiclePrice || 0;
  const daysOnLot = 58; // Mock

  return (
    <div className={cn('bg-white border-b border-slate-200 shadow-sm', className)}>
      {/* Main Header - Always Visible */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Customer Info */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {customerName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500">FICO:</span>
                <div
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${creditColor}20`,
                    color: creditColor,
                  }}
                >
                  {deal.creditScore}
                </div>
              </div>
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              if (onExpandDetails) onExpandDetails();
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Info className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {/* Vehicle Info - Second Row */}
        <div className="flex items-center gap-2 mt-2">
          <Car className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <div className="text-xs text-slate-600 truncate flex-1">
            {vehicleName}
          </div>
          <div className="flex items-center gap-2 text-xs flex-shrink-0">
            <span className="text-slate-500">
              ${vehiclePrice.toLocaleString()}
            </span>
            <span className="text-orange-600 font-semibold">
              {daysOnLot}d
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details - Collapsible */}
      {isExpanded && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Financial Summary */}
            <div>
              <div className="text-slate-500 font-medium mb-1">Financial</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Income:</span>
                  <span className="font-semibold text-slate-900">$75,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">DTI:</span>
                  <span className="font-semibold text-slate-900">18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Max Payment:</span>
                  <span className="font-semibold text-green-600">$625</span>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <div className="text-slate-500 font-medium mb-1">Vehicle</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Cost:</span>
                  <span className="font-semibold text-slate-900">
                    ${deal.vehicleCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">MSRP:</span>
                  <span className="font-semibold text-slate-900">
                    ${deal.vehiclePrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Margin:</span>
                  <span className="font-semibold text-green-600">
                    ${(deal.vehiclePrice - deal.vehicleCost).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trade-In (if applicable) */}
          {(deal.tradeValue > 0 || deal.tradePayoff > 0) && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-slate-500 font-medium mb-1 text-xs">Trade-In</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">2019 Chevy Silverado</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">
                    ${deal.tradeValue.toLocaleString()}
                  </span>
                  <span className="text-slate-400">-</span>
                  <span className="text-slate-600">
                    ${deal.tradePayoff.toLocaleString()}
                  </span>
                  <span className="text-slate-400">=</span>
                  <span className={cn(
                    "font-bold",
                    (deal.tradeValue - deal.tradePayoff) >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    ${(deal.tradeValue - deal.tradePayoff).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronDown className="h-3 w-3" />
            <span>Collapse</span>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Simulator Tab (Mobile)
 *
 * Touch-optimized deal simulator for mobile
 * Vertical layout with large touch targets
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { LivePaymentDisplayCompact } from '../shared/LivePaymentDisplay';
import { DealSliderCompact, formatCurrency, formatPercentage } from '../shared/DealSlider';
import { ProfitBreakdown } from '../shared/ProfitBadge';
import { CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SimulatorTab() {
  const {
    deal,
    updateDeal,
    payment,
    profit,
    isCalculating,
    paymentLocked,
    togglePaymentLock,
  } = useDealStudio();

  const netTradeEquity = deal.tradeValue - deal.tradePayoff;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
      {/* Live Payment Display */}
      <LivePaymentDisplayCompact
        payment={payment?.monthlyPayment || 0}
        isLocked={paymentLocked}
        isCalculating={isCalculating}
      />

      {/* Lock Payment Button */}
      <button
        onClick={togglePaymentLock}
        className={cn(
          'w-full py-3 rounded-lg font-semibold text-sm transition-all',
          paymentLocked
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        )}
      >
        {paymentLocked ? '🔒 Unlock Payment' : '🔓 Lock Payment'}
      </button>

      {/* Deal Structure Sliders */}
      <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl p-4 border border-blue-200/50 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Deal Structure</h3>

        <DealSliderCompact
          label="Sale Price"
          value={deal.salePrice}
          min={deal.vehicleCost}
          max={deal.vehiclePrice * 1.2}
          step={100}
          onChange={(value) => updateDeal({ salePrice: value })}
          formatValue={formatCurrency}
          locked={paymentLocked}
        />

        <DealSliderCompact
          label="Down Payment"
          value={deal.downPayment}
          min={0}
          max={Math.max(deal.salePrice * 0.5, 10000)}
          step={100}
          onChange={(value) => updateDeal({ downPayment: value })}
          formatValue={formatCurrency}
        />

        <DealSliderCompact
          label="Trade-In Value"
          value={deal.tradeValue}
          min={0}
          max={50000}
          step={100}
          onChange={(value) => updateDeal({ tradeValue: value })}
          formatValue={formatCurrency}
        />

        {deal.tradeValue > 0 && (
          <>
            <DealSliderCompact
              label="Trade Payoff"
              value={deal.tradePayoff}
              min={0}
              max={deal.tradeValue}
              step={100}
              onChange={(value) => updateDeal({ tradePayoff: value })}
              formatValue={formatCurrency}
            />

            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Net Trade Equity</span>
                <span className={cn(
                  "text-base font-black font-mono",
                  netTradeEquity >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(netTradeEquity)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Term Selection */}
      <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4 border border-purple-200/50 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Financing Terms</h3>

        <div>
          <div className="text-xs font-semibold text-slate-700 mb-2">Term (months)</div>
          <div className="grid grid-cols-5 gap-2">
            {[36, 48, 60, 72, 84].map((months) => (
              <button
                key={months}
                onClick={() => updateDeal({ term: months })}
                className={cn(
                  "py-2 rounded-lg font-bold text-xs transition-all",
                  deal.term === months
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-300/50"
                    : "bg-white text-slate-700 hover:bg-purple-100 border border-slate-200"
                )}
              >
                {months}
              </button>
            ))}
          </div>
        </div>

        <DealSliderCompact
          label="APR"
          value={deal.apr}
          min={0}
          max={25}
          step={0.01}
          onChange={(value) => updateDeal({ apr: value })}
          formatValue={formatPercentage}
        />
      </div>

      {/* F&I Products */}
      <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-200/50 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">F&I Products</h3>

        <MobileFIProduct
          label="Extended Warranty"
          price={2495}
          checked={deal.warranty > 0}
          onChange={(checked) => updateDeal({ warranty: checked ? 2495 : 0 })}
        />

        <MobileFIProduct
          label="GAP Insurance"
          price={595}
          checked={deal.gap > 0}
          onChange={(checked) => updateDeal({ gap: checked ? 595 : 0 })}
        />

        <MobileFIProduct
          label="Maintenance Plan"
          price={1800}
          checked={deal.maintenance > 0}
          onChange={(checked) => updateDeal({ maintenance: checked ? 1800 : 0 })}
        />

        <MobileFIProduct
          label="Paint Protection"
          price={1295}
          checked={deal.paintProtection > 0}
          onChange={(checked) => updateDeal({ paintProtection: checked ? 1295 : 0 })}
        />

        <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Back-End Profit</span>
            <span className="text-base font-black text-green-600 font-mono">
              {formatCurrency(profit?.backEndProfit || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Profit Breakdown */}
      {profit && (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-300">
          <ProfitBreakdown
            frontEndProfit={profit.frontEndProfit}
            backEndProfit={profit.backEndProfit}
            threshold={{ min: 1000, target: 2000 }}
          />
        </div>
      )}

      {/* Deal Summary */}
      {payment && (
        <div className="bg-white rounded-xl p-4 border-2 border-slate-300 shadow-lg">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Deal Summary</h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Vehicle Price</span>
              <span className="font-semibold text-slate-900">{formatCurrency(deal.salePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Down Payment</span>
              <span className="font-semibold text-slate-900">-{formatCurrency(deal.downPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Net Trade</span>
              <span className="font-semibold text-slate-900">
                {netTradeEquity >= 0 ? '-' : '+'}{formatCurrency(Math.abs(netTradeEquity))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">F&I Products</span>
              <span className="font-semibold text-slate-900">
                +{formatCurrency(deal.warranty + deal.gap + deal.maintenance + deal.paintProtection)}
              </span>
            </div>
            <div className="h-px bg-slate-300 my-2" />
            <div className="flex justify-between text-sm">
              <span className="font-bold text-slate-900">Total Financed</span>
              <span className="font-black text-slate-900">{formatCurrency(payment.amountFinanced)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Mobile F&I Product Component
 */
interface MobileFIProductProps {
  label: string;
  price: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function MobileFIProduct({ label, price, checked, onChange }: MobileFIProductProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all",
        checked
          ? "bg-green-100 border-green-400"
          : "bg-white border-slate-200 active:bg-slate-50"
      )}
    >
      <div className="flex items-center gap-3">
        {checked ? (
          <CheckSquare className="h-5 w-5 text-green-600 flex-shrink-0" />
        ) : (
          <Square className="h-5 w-5 text-slate-400 flex-shrink-0" />
        )}
        <span className={cn(
          "font-semibold text-sm text-left",
          checked ? "text-green-900" : "text-slate-700"
        )}>
          {label}
        </span>
      </div>
      <span className="text-xs font-bold text-slate-600">
        {formatCurrency(price)}
      </span>
    </button>
  );
}

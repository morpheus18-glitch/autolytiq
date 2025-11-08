/**
 * Live Simulator Panel (Panel 2 - Center)
 *
 * The main event - real-time deal structuring
 * "The Present" - Where deals are built
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { LivePaymentDisplay } from '../shared/LivePaymentDisplay';
import { DealSlider, formatCurrency, formatPercentage } from '../shared/DealSlider';
import { ProfitBreakdown, ProfitMeter } from '../shared/ProfitBadge';
import { Save, FileText, Send, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LiveSimulatorPanel() {
  const {
    deal,
    updateDeal,
    payment,
    profit,
    isCalculating,
    paymentLocked,
    togglePaymentLock,
  } = useDealStudio();

  // Calculate net trade equity
  const netTradeEquity = deal.tradeValue - deal.tradePayoff;

  // Calculate total F&I
  const totalFI = deal.warranty + deal.gap + deal.maintenance + deal.paintProtection;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Live Desking Simulator</h2>
            <p className="text-sm text-slate-600 mt-1">
              Real-time deal structuring with instant feedback
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isCalculating && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span>Calculating...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Live Payment Display - The Hero */}
        <LivePaymentDisplay
          payment={payment?.monthlyPayment || 0}
          isLocked={paymentLocked}
          onToggleLock={togglePaymentLock}
          isCalculating={isCalculating}
          term={deal.term}
          apr={deal.apr}
          isProfitable={(profit?.totalProfit || 0) >= 1000}
        />

        {/* Deal Structure Sliders */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl p-6 border border-blue-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Deal Structure</h3>

            <div className="space-y-6">
              {/* Sale Price */}
              <DealSlider
                label="Sale Price"
                value={deal.salePrice}
                min={deal.vehicleCost}
                max={deal.vehiclePrice * 1.2}
                step={100}
                onChange={(value) => updateDeal({ salePrice: value })}
                formatValue={formatCurrency}
                helperText={`MSRP: ${formatCurrency(deal.vehiclePrice)}`}
                locked={paymentLocked}
              />

              {/* Down Payment */}
              <DealSlider
                label="Down Payment"
                value={deal.downPayment}
                min={0}
                max={Math.max(deal.salePrice * 0.5, 10000)}
                step={100}
                onChange={(value) => updateDeal({ downPayment: value })}
                formatValue={formatCurrency}
                helperText={`Suggested: ${formatCurrency(deal.salePrice * 0.1)}`}
              />

              {/* Trade-In Value */}
              <DealSlider
                label="Trade-In Value"
                value={deal.tradeValue}
                min={0}
                max={50000}
                step={100}
                onChange={(value) => updateDeal({ tradeValue: value })}
                formatValue={formatCurrency}
              />

              {/* Trade Payoff */}
              {deal.tradeValue > 0 && (
                <DealSlider
                  label="Trade Payoff"
                  value={deal.tradePayoff}
                  min={0}
                  max={deal.tradeValue}
                  step={100}
                  onChange={(value) => updateDeal({ tradePayoff: value })}
                  formatValue={formatCurrency}
                  helperText={`Net Equity: ${formatCurrency(netTradeEquity)}`}
                />
              )}
            </div>

            {/* Net Trade Equity Display */}
            {deal.tradeValue > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Net Trade Equity</span>
                  <span className={cn(
                    "text-xl font-black font-mono",
                    netTradeEquity >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {formatCurrency(netTradeEquity)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Term & APR */}
          <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-6 border border-purple-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Financing Terms</h3>

            <div className="space-y-6">
              {/* Term Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 block">
                  Term (months)
                </label>
                <div className="flex gap-2">
                  {[36, 48, 60, 72, 84].map((months) => (
                    <button
                      key={months}
                      onClick={() => updateDeal({ term: months })}
                      className={cn(
                        "flex-1 py-3 rounded-lg font-bold text-sm transition-all",
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

              {/* APR Slider */}
              <DealSlider
                label="APR"
                value={deal.apr}
                min={0}
                max={25}
                step={0.01}
                onChange={(value) => updateDeal({ apr: value })}
                formatValue={formatPercentage}
                helperText="Best Rate: 4.99%"
              />
            </div>
          </div>

          {/* F&I Products */}
          <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-xl p-6 border border-green-200/50">
            <h3 className="text-lg font-bold text-slate-900 mb-4">F&I Products</h3>

            <div className="space-y-3">
              {/* Warranty */}
              <FIProductCheckbox
                label="Extended Warranty"
                price={2495}
                profit={2495 * 0.3}
                checked={deal.warranty > 0}
                onChange={(checked) => updateDeal({ warranty: checked ? 2495 : 0 })}
              />

              {/* GAP */}
              <FIProductCheckbox
                label="GAP Insurance"
                price={595}
                profit={595 * 0.3}
                checked={deal.gap > 0}
                onChange={(checked) => updateDeal({ gap: checked ? 595 : 0 })}
              />

              {/* Maintenance */}
              <FIProductCheckbox
                label="Maintenance Plan"
                price={1800}
                profit={1800 * 0.3}
                checked={deal.maintenance > 0}
                onChange={(checked) => updateDeal({ maintenance: checked ? 1800 : 0 })}
              />

              {/* Paint Protection */}
              <FIProductCheckbox
                label="Paint Protection"
                price={1295}
                profit={1295 * 0.3}
                checked={deal.paintProtection > 0}
                onChange={(checked) => updateDeal({ paintProtection: checked ? 1295 : 0 })}
              />

              {/* Back-End Profit Summary */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Back-End Profit</span>
                  <span className="text-xl font-black text-green-600 font-mono">
                    {formatCurrency(profit?.backEndProfit || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Breakdown */}
          {profit && (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-300">
              <ProfitBreakdown
                frontEndProfit={profit.frontEndProfit}
                backEndProfit={profit.backEndProfit}
                threshold={{ min: 1000, target: 2000 }}
              />

              <div className="mt-6">
                <ProfitMeter
                  profit={profit.totalProfit}
                  minProfit={1000}
                  targetProfit={2000}
                  maxProfit={5000}
                />
              </div>
            </div>
          )}

          {/* Deal Summary */}
          {payment && (
            <div className="bg-white rounded-xl p-6 border-2 border-slate-300 shadow-lg">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Deal Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Vehicle Price</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(deal.salePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Down Payment</span>
                  <span className="font-semibold text-slate-900">-{formatCurrency(deal.downPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Net Trade Equity</span>
                  <span className="font-semibold text-slate-900">
                    {netTradeEquity >= 0 ? '-' : '+'}{formatCurrency(Math.abs(netTradeEquity))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">F&I Products</span>
                  <span className="font-semibold text-slate-900">+{formatCurrency(totalFI)}</span>
                </div>
                <div className="h-px bg-slate-300 my-3" />
                <div className="flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total Financed</span>
                  <span className="font-black text-slate-900">{formatCurrency(payment.amountFinanced)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-bold text-slate-900">Total Interest</span>
                  <span className="font-black text-orange-600">{formatCurrency(payment.totalInterest)}</span>
                </div>
                <div className="h-px bg-slate-300 my-3" />
                <div className="flex justify-between text-lg">
                  <span className="font-black text-slate-900">Total Cost</span>
                  <span className="font-black text-slate-900">{formatCurrency(payment.totalCost)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 mt-6">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                  <FileText className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * F&I Product Checkbox Component
 */
interface FIProductCheckboxProps {
  label: string;
  price: number;
  profit: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function FIProductCheckbox({ label, price, profit, checked, onChange }: FIProductCheckboxProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all",
        checked
          ? "bg-green-100 border-green-400"
          : "bg-white border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-center gap-3">
        {checked ? (
          <CheckSquare className="h-5 w-5 text-green-600 flex-shrink-0" />
        ) : (
          <Square className="h-5 w-5 text-slate-400 flex-shrink-0" />
        )}
        <div className="text-left">
          <div className={cn(
            "font-semibold text-sm",
            checked ? "text-green-900" : "text-slate-700"
          )}>
            {label}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {formatCurrency(price)} (+{formatCurrency(profit)} profit)
          </div>
        </div>
      </div>
    </button>
  );
}

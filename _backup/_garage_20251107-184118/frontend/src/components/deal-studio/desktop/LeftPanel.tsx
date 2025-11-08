/**
 * Left Panel - Deal Structure Controls (Desktop)
 *
 * Contains all the sliders, inputs, and F&I product toggles
 * Similar to mobile SimulatorTab but optimized for desktop layout
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { DollarSign, Percent, Calendar, Shield, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeftPanel() {
  const { deal, updateDeal, payment, isCalculating, paymentLocked, togglePaymentLock } = useDealStudio();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full flex flex-col bg-surface-base border-r border-border-base overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-surface-elevated border-b border-border-base px-6 py-4 z-10">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Car className="h-5 w-5 text-accent-primary" />
          Deal Structure
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Adjust pricing and terms
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Payment Lock Button */}
        <button
          onClick={togglePaymentLock}
          className={cn(
            'w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all',
            paymentLocked
              ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
              : 'bg-surface-muted text-text-secondary border border-border-base hover:bg-surface-subtle'
          )}
        >
          {paymentLocked ? '🔒 Payment Locked' : '🔓 Lock Payment'}
        </button>

        {/* Sale Price */}
        <DealControl
          label="Sale Price"
          value={deal.salePrice}
          min={deal.vehicleCost}
          max={deal.vehiclePrice * 1.2}
          step={100}
          icon={DollarSign}
          disabled={paymentLocked}
          onChange={(value) => updateDeal({ salePrice: value })}
          format={formatCurrency}
        />

        {/* Down Payment */}
        <DealControl
          label="Down Payment"
          value={deal.downPayment}
          min={0}
          max={deal.salePrice * 0.5}
          step={100}
          icon={DollarSign}
          onChange={(value) => updateDeal({ downPayment: value })}
          format={formatCurrency}
        />

        {/* APR */}
        <DealControl
          label="APR"
          value={deal.apr}
          min={0}
          max={29.99}
          step={0.1}
          icon={Percent}
          onChange={(value) => updateDeal({ apr: value })}
          format={(v) => `${v.toFixed(2)}%`}
        />

        {/* Term */}
        <div>
          <label className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-accent-primary" />
            Term (months)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[36, 48, 60, 72, 84].map((months) => (
              <button
                key={months}
                onClick={() => updateDeal({ term: months })}
                className={cn(
                  'py-2 px-3 rounded-lg text-sm font-semibold transition-all',
                  deal.term === months
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-surface-muted text-text-secondary hover:bg-surface-subtle border border-border-base'
                )}
              >
                {months}
              </button>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-border-base pt-6">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-accent-secondary" />
            F&I Products
          </h3>
          <div className="space-y-3">
            <FIProductToggle
              label="Extended Warranty"
              price={2495}
              checked={deal.warranty > 0}
              onChange={(checked) => updateDeal({ warranty: checked ? 2495 : 0 })}
            />
            <FIProductToggle
              label="GAP Insurance"
              price={595}
              checked={deal.gap > 0}
              onChange={(checked) => updateDeal({ gap: checked ? 595 : 0 })}
            />
            <FIProductToggle
              label="Maintenance Plan"
              price={1295}
              checked={deal.maintenance > 0}
              onChange={(checked) => updateDeal({ maintenance: checked ? 1295 : 0 })}
            />
            <FIProductToggle
              label="Paint Protection"
              price={795}
              checked={deal.paintProtection > 0}
              onChange={(checked) => updateDeal({ paintProtection: checked ? 795 : 0 })}
            />
          </div>
        </div>

        {/* Trade-In */}
        <div className="border-t border-border-base pt-6">
          <h3 className="text-sm font-bold text-text-primary mb-4">Trade-In</h3>
          <div className="space-y-4">
            <DealControl
              label="Trade Value"
              value={deal.tradeValue}
              min={0}
              max={50000}
              step={100}
              icon={DollarSign}
              onChange={(value) => updateDeal({ tradeValue: value })}
              format={formatCurrency}
            />
            <DealControl
              label="Trade Payoff"
              value={deal.tradePayoff}
              min={0}
              max={50000}
              step={100}
              icon={DollarSign}
              onChange={(value) => updateDeal({ tradePayoff: value })}
              format={formatCurrency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Deal Control Component
 */
interface DealControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  onChange: (value: number) => void;
  format: (value: number) => string;
}

function DealControl({
  label,
  value,
  min,
  max,
  step,
  icon: Icon,
  disabled = false,
  onChange,
  format,
}: DealControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent-primary" />
          {label}
        </label>
        <span className="text-sm font-mono font-bold text-text-primary">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer',
          'bg-surface-muted',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:w-5',
          '[&::-webkit-slider-thumb]:h-5',
          '[&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-blue-600',
          '[&::-webkit-slider-thumb]:shadow-lg',
          '[&::-webkit-slider-thumb]:cursor-pointer',
          '[&::-moz-range-thumb]:w-5',
          '[&::-moz-range-thumb]:h-5',
          '[&::-moz-range-thumb]:rounded-full',
          '[&::-moz-range-thumb]:bg-blue-600',
          '[&::-moz-range-thumb]:border-0',
          '[&::-moz-range-thumb]:shadow-lg',
          '[&::-moz-range-thumb]:cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />
    </div>
  );
}

/**
 * F&I Product Toggle
 */
interface FIProductToggleProps {
  label: string;
  price: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function FIProductToggle({ label, price, checked, onChange }: FIProductToggleProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <label className="flex items-center justify-between p-3 rounded-lg border border-border-base hover:border-border-strong cursor-pointer transition-all bg-surface-base">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-border-base text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-text-primary">{label}</span>
      </div>
      <span className="text-sm font-mono font-semibold text-text-secondary">
        {formatCurrency(price)}
      </span>
    </label>
  );
}

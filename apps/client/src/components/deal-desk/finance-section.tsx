import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoneyInput } from "@/components/ui/money";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Banknote, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FinanceData {
  cashDownCents?: number | null;
  deferredDownCents?: number | null;
  termMonths?: number | null;
  aprBps?: number | null; // Basis points (725 = 7.25%)
  buyRateBps?: number | null;
  reserveBasis?: string | null; // "APR Spread", "Flat", "None"
  reserveAmountCents?: number | null;
  paymentFrequency?: string | null; // "MONTHLY", "BIWEEKLY"
}

interface FinanceSectionProps {
  data: FinanceData;
  onChange: (updates: Partial<FinanceData>) => void;
  readOnly?: boolean;
  estimatedPayment?: number | null;
}

const TERM_OPTIONS = [36, 48, 60, 72, 84];
const RESERVE_BASIS_OPTIONS = [
  { value: "None", label: "None" },
  { value: "APR Spread", label: "APR Spread" },
  { value: "Flat", label: "Flat Amount" },
];

export function FinanceSection({ data, onChange, readOnly = false, estimatedPayment }: FinanceSectionProps) {
  // Calculate reserve based on basis
  const calculateReserve = (): number => {
    if (data.reserveBasis === "APR Spread" && data.aprBps && data.buyRateBps) {
      const spread = (data.aprBps - data.buyRateBps) / 100; // Convert bps to percentage
      // Simplified reserve calculation - would need loan amount for accurate calc
      return Math.round(spread * 100); // Placeholder
    }
    return data.reserveAmountCents || 0;
  };

  const displayApr = data.aprBps ? (data.aprBps / 100).toFixed(2) : '';
  const displayBuyRate = data.buyRateBps ? (data.buyRateBps / 100).toFixed(2) : '';

  return (
    <Card data-testid="card-finance-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="w-5 h-5" />
          Finance & Terms
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Down Payments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cash-down">Cash Down</Label>
            <MoneyInput
              value={data.cashDownCents}
              onChange={(value) => onChange({ cashDownCents: value })}
              placeholder="0.00"
              disabled={readOnly}
              data-testid="input-cash-down"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="deferred-down">Deferred Down</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Amount customer agrees to pay after delivery (typically first payment)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <MoneyInput
              value={data.deferredDownCents}
              onChange={(value) => onChange({ deferredDownCents: value })}
              placeholder="0.00"
              disabled={readOnly}
              data-testid="input-deferred-down"
            />
          </div>
        </div>

        {/* Terms & Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="term">Term (Months)</Label>
            <Select
              value={data.termMonths?.toString() || ''}
              onValueChange={(value) => onChange({ termMonths: parseInt(value) })}
              disabled={readOnly}
            >
              <SelectTrigger id="term" data-testid="select-term">
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                {TERM_OPTIONS.map((term) => (
                  <SelectItem key={term} value={term.toString()}>
                    {term} months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-frequency">Payment Frequency</Label>
            <Select
              value={data.paymentFrequency || 'MONTHLY'}
              onValueChange={(value) => onChange({ paymentFrequency: value })}
              disabled={readOnly}
            >
              <SelectTrigger id="payment-frequency" data-testid="select-payment-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="BIWEEKLY">Bi-Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* APR & Buy Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="apr">Customer APR (%)</Label>
            <Input
              id="apr"
              type="text"
              value={displayApr}
              onChange={(e) => {
                const value = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
                onChange({ aprBps: isNaN(value) ? null : Math.round(value * 100) });
              }}
              placeholder="6.99"
              disabled={readOnly}
              className="text-right"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              data-testid="input-apr"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="buy-rate">Buy Rate (%)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Rate from lender (before markup). Difference is finance reserve.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="buy-rate"
              type="text"
              value={displayBuyRate}
              onChange={(e) => {
                const value = parseFloat(e.target.value.replace(/[^0-9.]/g, ''));
                onChange({ buyRateBps: isNaN(value) ? null : Math.round(value * 100) });
              }}
              placeholder="5.99"
              disabled={readOnly}
              className="text-right"
              style={{ fontVariantNumeric: 'tabular-nums' }}
              data-testid="input-buy-rate"
            />
          </div>
        </div>

        {/* Reserve Calculation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reserve-basis">Reserve Calculation</Label>
            <Select
              value={data.reserveBasis || 'None'}
              onValueChange={(value) => onChange({ reserveBasis: value })}
              disabled={readOnly}
            >
              <SelectTrigger id="reserve-basis" data-testid="select-reserve-basis">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESERVE_BASIS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reserve-amount">Reserve Amount</Label>
            <MoneyInput
              value={data.reserveAmountCents}
              onChange={(value) => onChange({ reserveAmountCents: value })}
              placeholder={data.reserveBasis === "APR Spread" ? "Auto-calculated" : "0.00"}
              disabled={readOnly || data.reserveBasis === "APR Spread"}
              data-testid="input-reserve-amount"
            />
          </div>
        </div>

        {/* Estimated Payment Display */}
        {estimatedPayment != null && estimatedPayment > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Estimated {data.paymentFrequency === 'BIWEEKLY' ? 'Bi-Weekly' : 'Monthly'} Payment:
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
                ${(estimatedPayment / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {data.reserveBasis === "APR Spread" && data.aprBps && data.buyRateBps && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Reserve spread: {((data.aprBps - data.buyRateBps) / 100).toFixed(2)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

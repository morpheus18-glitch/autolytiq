/**
 * Live Desking Simulator - Panel 2
 *
 * "The Present" - Real-time deal structuring with instant feedback
 * - Hero payment display with lock feature
 * - Four main control levers (Price, Down Payment, Trade-In, Term/APR)
 * - Real-time Rust calculations (< 100ms)
 * - Smooth animations on value changes
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, Button, Badge, Slider } from '@repo/ui';
import { Lock, Unlock, DollarSign, TrendingUp } from 'lucide-react';

interface LiveSimulatorProps {
  dealId?: string;
  vehicleId?: string;
  customerId?: string;
}

interface DealParams {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  tradeInPayoff: number;
  term: 36 | 48 | 60 | 72 | 84;
  apr: number;
}

export function LiveSimulator({ dealId, vehicleId, customerId }: LiveSimulatorProps) {
  const [paymentLocked, setPaymentLocked] = useState(false);
  const [params, setParams] = useState<DealParams>({
    vehiclePrice: 45900,
    downPayment: 3500,
    tradeInValue: 22000,
    tradeInPayoff: 18500,
    term: 60,
    apr: 5.99,
  });

  // Calculate monthly payment (simplified - will use Rust service)
  const calculatePayment = (p: DealParams): number => {
    const principal = p.vehiclePrice - p.downPayment - (p.tradeInValue - p.tradeInPayoff);
    const monthlyRate = p.apr / 100 / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, p.term)) /
      (Math.pow(1 + monthlyRate, p.term) - 1);
    return Math.round(payment * 100) / 100;
  };

  const [monthlyPayment, setMonthlyPayment] = useState(calculatePayment(params));

  // Recalculate payment when params change
  useEffect(() => {
    // TODO: Call Rust pricing service via WebSocket
    // For now, use JavaScript calculation
    const newPayment = calculatePayment(params);
    setMonthlyPayment(newPayment);
  }, [params]);

  const updateParam = <K extends keyof DealParams>(key: K, value: DealParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const netTradeEquity = params.tradeInValue - params.tradeInPayoff;
  const msrp = 48900;
  const cost = 32450;
  const margin = params.vehiclePrice - cost;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Hero: Monthly Payment Display */}
        <Card className={paymentLocked ? 'border-accent-primary bg-accent-primary/5' : ''}>
          <CardContent className="py-8 text-center">
            <div className="text-sm text-text-tertiary uppercase tracking-wide mb-2">
              Monthly Payment
            </div>

            <div className="text-5xl font-bold text-text-primary mb-4">
              ${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>

            <Button
              variant={paymentLocked ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPaymentLocked(!paymentLocked)}
            >
              {paymentLocked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Payment Locked
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Lock Payment
                </>
              )}
            </Button>

            <div className="mt-4 text-sm text-text-tertiary">
              Based on: {params.term} months @ {params.apr}% APR
            </div>
          </CardContent>
        </Card>

        {/* Lever 1: Vehicle Price */}
        <Card>
          <CardContent className="py-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-text-primary">Vehicle Price</div>
                <div className="text-xs text-text-tertiary">
                  MSRP: ${msrp.toLocaleString()} | Cost: ${cost.toLocaleString()}
                </div>
              </div>
              <div className="text-2xl font-semibold text-text-primary">
                ${params.vehiclePrice.toLocaleString()}
              </div>
            </div>

            <Slider
              min={cost}
              max={msrp}
              step={100}
              value={[params.vehiclePrice]}
              onValueChange={([value]) => updateParam('vehiclePrice', value)}
            />

            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">
                Margin: <span className="text-status-success font-medium">
                  ${margin.toLocaleString()}
                </span>
              </span>
              <span className="text-text-tertiary">
                {((margin / params.vehiclePrice) * 100).toFixed(1)}% gross
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Lever 2: Down Payment */}
        <Card>
          <CardContent className="py-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-text-primary">Down Payment</div>
                <div className="text-xs text-text-tertiary">
                  Suggested: ${(params.vehiclePrice * 0.1).toLocaleString()}
                </div>
              </div>
              <div className="text-2xl font-semibold text-text-primary">
                ${params.downPayment.toLocaleString()}
              </div>
            </div>

            <Slider
              min={0}
              max={params.vehiclePrice * 0.5}
              step={100}
              value={[params.downPayment]}
              onValueChange={([value]) => updateParam('downPayment', value)}
            />

            <div className="flex justify-between text-sm text-text-tertiary">
              <span>Min: $0</span>
              <span>{((params.downPayment / params.vehiclePrice) * 100).toFixed(1)}% down</span>
            </div>
          </CardContent>
        </Card>

        {/* Lever 3: Trade-In */}
        <Card>
          <CardContent className="py-6 space-y-4">
            <div className="text-sm font-medium text-text-primary mb-4">Trade-In Value & Payoff</div>

            {/* Trade-In Value */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-text-tertiary">Trade-In Value</div>
                <div className="text-lg font-semibold text-text-primary">
                  ${params.tradeInValue.toLocaleString()}
                </div>
              </div>
              <Slider
                min={15000}
                max={30000}
                step={500}
                value={[params.tradeInValue]}
                onValueChange={([value]) => updateParam('tradeInValue', value)}
              />
            </div>

            {/* Trade-In Payoff */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-text-tertiary">Trade Payoff</div>
                <div className="text-lg font-semibold text-text-primary">
                  ${params.tradeInPayoff.toLocaleString()}
                </div>
              </div>
              <Slider
                min={0}
                max={25000}
                step={500}
                value={[params.tradeInPayoff]}
                onValueChange={([value]) => updateParam('tradeInPayoff', value)}
              />
            </div>

            {/* Net Equity */}
            <div className="pt-2 border-t border-border-base flex justify-between items-center">
              <span className="text-sm text-text-tertiary">Net Trade Equity</span>
              <span className={`text-lg font-semibold ${netTradeEquity >= 0 ? 'text-status-success' : 'text-status-error'}`}>
                ${netTradeEquity.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Lever 4: Term & APR */}
        <Card>
          <CardContent className="py-6 space-y-4">
            {/* Term Selection */}
            <div>
              <div className="text-sm font-medium text-text-primary mb-3">Term (months)</div>
              <div className="flex gap-2">
                {[36, 48, 60, 72, 84].map((term) => (
                  <button
                    key={term}
                    onClick={() => updateParam('term', term as DealParams['term'])}
                    className={`
                      flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${params.term === term
                        ? 'bg-accent-primary text-white'
                        : 'bg-surface-muted text-text-secondary hover:bg-surface-strong'}
                    `}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* APR Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-sm font-medium text-text-primary">APR (%)</div>
                  <div className="text-xs text-text-tertiary">Best Rate: 4.99%</div>
                </div>
                <div className="text-2xl font-semibold text-text-primary">
                  {params.apr.toFixed(2)}%
                </div>
              </div>
              <Slider
                min={2.99}
                max={12.99}
                step={0.25}
                value={[params.apr]}
                onValueChange={([value]) => updateParam('apr', value)}
              />
              <div className="flex justify-between text-sm text-text-tertiary mt-2">
                <span>2.99%</span>
                <span>12.99%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Reset to Defaults
          </Button>
          <Button variant="primary" className="flex-1">
            Save & Send to Customer
          </Button>
        </div>
      </div>
    </div>
  );
}

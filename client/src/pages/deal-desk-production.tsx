import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Calculator, 
  Car, 
  DollarSign,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface DealInput {
  zip: string;
  dealType: 'purchase' | 'lease';
  vehiclePrice: number;
  vehicleCost: number;
  tradeValue: number;
  tradePayoff: number;
  downPayment: number;
  rebates: number;
  warrantyPrice: number;
  gapPrice: number;
  financeReserveAmount: number;
  financeReserveType: 'percent' | 'flat';
}

interface TaxPreview {
  jurisdiction: {
    id: number;
    display: string;
    state: string;
    county: string;
    city: string;
    zip: string;
  };
  estimatedTaxRate: number;
  estimatedTaxRatePercent: string;
  estimatedFeesTotal: number;
}

interface DealCalculation {
  jurisdiction: {
    display: string;
    state: string;
  };
  calculation: {
    fees: {
      nontaxFees: number;
      lineItems: Array<{ code: string; label: string; amount: number }>;
    };
    taxes: {
      totalTax: number;
      lineItems: Array<{ label: string; rate: number; amount: number }>;
    };
    totals: {
      vehiclePrice: number;
      totalTax: number;
      grandTotal: number;
    };
    tradeEquity: {
      tradeValue: number;
      tradePayoff: number;
      netTradeValue: number;
    };
    profit?: {
      frontEnd: number;
      backEnd: number;
      total: number;
    };
  };
}

export default function DealDeskProduction() {
  const { toast } = useToast();
  
  // Form state
  const [input, setInput] = useState<DealInput>({
    zip: '',
    dealType: 'purchase',
    vehiclePrice: 0,
    vehicleCost: 0,
    tradeValue: 0,
    tradePayoff: 0,
    downPayment: 0,
    rebates: 0,
    warrantyPrice: 0,
    gapPrice: 0,
    financeReserveAmount: 0,
    financeReserveType: 'percent'
  });

  // Tax preview query
  const { data: taxPreview, isLoading: taxLoading, error: taxError } = useQuery<TaxPreview>({
    queryKey: ['/api/rates/preview', input.zip, input.dealType],
    enabled: input.zip.length >= 5,
    retry: 1,
  });

  // Deal calculation query (auto-cancels on key change)
  const { data: calc, isLoading: calcLoading, error: calcError } = useQuery<DealCalculation>({
    queryKey: ['/api/deals/calculate', input],
    queryFn: async () => {
      const response = await apiRequest('/api/deals/calculate', {
        method: 'POST',
        body: JSON.stringify(input)
      });
      return response.json();
    },
    enabled: input.zip.length >= 5 && input.vehiclePrice > 0,
    staleTime: 0,
    retry: 1,
  });
  const netTrade = (input.tradeValue || 0) - (input.tradePayoff || 0);
  const cashDue = (calc?.calculation.totals.grandTotal || 0) - netTrade - (input.downPayment || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Deal Desk
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Vehicle & Customer Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle & Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehiclePrice" className="text-sm">Vehicle Price</Label>
                <Input
                  id="vehiclePrice"
                  type="number"
                  value={input.vehiclePrice || ''}
                  onChange={(e) => setInput({...input, vehiclePrice: parseFloat(e.target.value) || 0})}
                  placeholder="$0"
                  className="mt-1"
                  data-testid="input-vehicle-price"
                />
              </div>
              <div>
                <Label htmlFor="vehicleCost" className="text-sm">Vehicle Cost</Label>
                <Input
                  id="vehicleCost"
                  type="number"
                  value={input.vehicleCost || ''}
                  onChange={(e) => setInput({...input, vehicleCost: parseFloat(e.target.value) || 0})}
                  placeholder="$0"
                  className="mt-1"
                  data-testid="input-vehicle-cost"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerZip" className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Customer ZIP
              </Label>
              <Input
                id="customerZip"
                type="text"
                value={input.zip}
                onChange={(e) => setInput({...input, zip: e.target.value})}
                placeholder="Enter ZIP code"
                className="mt-1"
                maxLength={5}
                data-testid="input-customer-zip"
              />
              {taxLoading && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Looking up tax rates...
                </p>
              )}
              {taxError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  ZIP code not found - check database coverage
                </p>
              )}
              {taxPreview && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {taxPreview.jurisdiction.display}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Tax: {taxPreview.estimatedTaxRatePercent} • Fees: ${taxPreview.estimatedFeesTotal}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trade-In Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Trade-In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tradeValue" className="text-sm">Trade Value</Label>
                <Input
                  id="tradeValue"
                  type="number"
                  value={input.tradeValue || ''}
                  onChange={(e) => setInput({...input, tradeValue: parseFloat(e.target.value) || 0})}
                  placeholder="$0"
                  className="mt-1"
                  data-testid="input-trade-value"
                />
              </div>
              <div>
                <Label htmlFor="tradePayoff" className="text-sm">Trade Payoff</Label>
                <Input
                  id="tradePayoff"
                  type="number"
                  value={input.tradePayoff || ''}
                  onChange={(e) => setInput({...input, tradePayoff: parseFloat(e.target.value) || 0})}
                  placeholder="$0"
                  className="mt-1"
                  data-testid="input-trade-payoff"
                />
              </div>
            </div>
            {netTrade !== 0 && (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <p className="text-sm font-medium">
                  Net Trade: <span className={netTrade > 0 ? 'text-green-600' : 'text-red-600'}>
                    ${netTrade.toFixed(2)}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Down Payment & Backend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Down Payment & Backend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="downPayment" className="text-sm">Down Payment</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={input.downPayment || ''}
                  onChange={(e) => setInput({...input, downPayment: parseFloat(e.target.value) || 0})}
                  placeholder="$0"
                  className="mt-1"
                  data-testid="input-down-payment"
                />
              </div>
              <div>
                <Label htmlFor="rebates" className="text-sm">Rebates</Label>
                <Input
                  id="rebates"
                  type="number"
                  value={input.rebates || ''}
                  onChange={(e) => setInput({...input, rebates: parseFloat(e.target.value) || 0})}
                  placeholder="$0"
                  className="mt-1"
                  data-testid="input-rebates"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warrantyPrice" className="text-sm">Warranty</Label>
                <Input
                  id="warrantyPrice"
                  type="number"
                  value={input.warrantyPrice || ''}
                  onChange={(e) => setInput({...input, warrantyPrice: parseFloat(e.target.value) || 0})}
                  placeholder="$0"
                  className="mt-1"
                  data-testid="input-warranty"
                />
              </div>
              <div>
                <Label htmlFor="gapPrice" className="text-sm">GAP Insurance</Label>
                <Input
                  id="gapPrice"
                  type="number"
                  value={input.gapPrice || ''}
                  onChange={(e) => setInput({...input, gapPrice: parseFloat(e.target.value) || 0})}
                  placeholder="$0"
                  className="mt-1"
                  data-testid="input-gap"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deal Summary */}
        {calc && (
          <Card className="border-2 border-blue-500">
            <CardHeader className="pb-3 bg-blue-50 dark:bg-blue-900/20">
              <CardTitle className="text-lg">Deal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Taxes Breakdown */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax Breakdown</p>
                <div className="space-y-1">
                  {calc.calculation.taxes.lineItems.map((tax, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{tax.label}</span>
                      <span className="font-medium">${tax.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Fees Breakdown */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fees</p>
                <div className="space-y-1">
                  {calc.calculation.fees.lineItems.map((fee, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{fee.label}</span>
                      <span className="font-medium">${fee.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-base">
                  <span className="font-medium">Vehicle Price:</span>
                  <span className="font-bold">${calc.calculation.totals.vehiclePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-medium">Total Tax:</span>
                  <span className="font-bold">${calc.calculation.totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-medium">Total Fees:</span>
                  <span className="font-bold">${calc.calculation.fees.nontaxFees.toFixed(2)}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between text-xl">
                  <span className="font-bold">Grand Total:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ${calc.calculation.totals.grandTotal.toFixed(2)}
                  </span>
                </div>

                {calc.calculation.profit && (
                  <>
                    <Separator className="my-2" />
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Front-End Profit:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ${calc.calculation.profit.frontEnd.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Back-End Profit:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ${calc.calculation.profit.backEnd.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold">
                        <span>Total Profit:</span>
                        <span className="text-green-600 dark:text-green-400">
                          ${calc.calculation.profit.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Cash Due */}
              <div className="p-4 bg-blue-600 text-white rounded-lg">
                <p className="text-sm opacity-90 mb-1">Cash Due at Signing</p>
                <p className="text-3xl font-bold">${cashDue.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculation Loading/Error States */}
        {calcLoading && !calc && (
          <Card>
            <CardContent className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Calculating deal...</p>
            </CardContent>
          </Card>
        )}

        {calcError && (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm font-medium">
                  {(calcError as any)?.message || 'Failed to calculate deal'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

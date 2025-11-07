/**
 * Professional Deal Calculator
 *
 * A calculator-style desking tool with real-time Rust pricing integration
 * and AI companion for deal optimization.
 *
 * Features:
 * - Calculator-style UI (distinct from main app)
 * - Real-time payment calculations via Rust service
 * - AI companion with live recommendations
 * - Instant feedback on every input change
 * - Professional financial tool aesthetic
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Separator } from '@repo/ui';
import { Badge } from '@repo/ui';
import {
  Calculator,
  TrendingUp,
  Sparkles,
  DollarSign,
  Percent,
  Calendar,
  Car,
  User,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { CustomerLink, VehicleLink } from '@/components/shared/QuickViewLinks';

interface DealState {
  // Vehicle
  vehicleId?: string;
  vehiclePrice: number;
  vehicleCost: number;

  // Customer
  customerId?: string;
  creditScore: number;

  // Deal Structure
  salePrice: number;
  downPayment: number;
  tradeValue: number;
  tradePayoff: number;
  term: number;
  apr: number;

  // Add-ons (F&I Products)
  warranty: number;
  gap: number;
  maintenance: number;
}

interface PaymentResult {
  monthlyPayment: number;
  totalFinanced: number;
  totalInterest: number;
  totalCost: number;
  grossProfit: number;
  frontEndGross: number;
  backEndGross: number;
}

interface AIRecommendation {
  type: 'max_profit' | 'best_close' | 'balanced';
  label: string;
  structure: Partial<DealState>;
  metrics: {
    payment: number;
    profit: number;
    closeProb: number;
    approvalProb: number;
  };
  reasoning: string;
}

export default function DealCalculator() {
  const [deal, setDeal] = useState<DealState>({
    vehiclePrice: 30000,
    vehicleCost: 25000,
    creditScore: 720,
    salePrice: 30000,
    downPayment: 3000,
    tradeValue: 8000,
    tradePayoff: 6000,
    term: 60,
    apr: 5.99,
    warranty: 2500,
    gap: 595,
    maintenance: 1800,
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [showAI, setShowAI] = useState(true);

  // Calculate payment using Rust pricing service (mocked for now, will integrate real gRPC)
  const calculatePayment = useCallback(async (dealState: DealState): Promise<PaymentResult> => {
    // TODO: Replace with actual Rust gRPC call
    // const client = getPricingClient();
    // const result = await client.calculatePayment({ ... });

    const netTrade = dealState.tradeValue - dealState.tradePayoff;
    const totalDown = dealState.downPayment + netTrade;
    const addOns = dealState.warranty + dealState.gap + dealState.maintenance;
    const totalFinanced = dealState.salePrice - totalDown + addOns;

    const monthlyRate = dealState.apr / 100 / 12;
    const numPayments = dealState.term;
    const monthlyPayment = totalFinanced * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalInterest = (monthlyPayment * numPayments) - totalFinanced;
    const totalCost = dealState.salePrice + totalInterest + addOns;

    const frontEndGross = dealState.salePrice - dealState.vehicleCost;
    const backEndGross = addOns * 0.3; // Assume 30% profit on F&I products
    const grossProfit = frontEndGross + backEndGross;

    return {
      monthlyPayment,
      totalFinanced,
      totalInterest,
      totalCost,
      grossProfit,
      frontEndGross,
      backEndGross,
    };
  }, []);

  // Real-time calculation on every change
  const { data: payment, isLoading: paymentLoading } = useQuery({
    queryKey: ['payment-calculation', deal],
    queryFn: () => calculatePayment(deal),
    staleTime: 0,
  });

  // AI Optimization (mocked for now, will integrate real ML service)
  const { data: aiRecommendations } = useQuery<AIRecommendation[]>({
    queryKey: ['ai-recommendations', deal],
    queryFn: async () => {
      // TODO: Replace with actual ML service call
      // const response = await apiRequest('POST', '/api/ml/optimize-deal', deal);

      return [
        {
          type: 'max_profit',
          label: 'Maximum Profit',
          structure: {
            salePrice: deal.salePrice + 500,
            downPayment: 3500,
            warranty: 2995,
          },
          metrics: {
            payment: payment?.monthlyPayment ? payment.monthlyPayment + 25 : 0,
            profit: payment?.grossProfit ? payment.grossProfit + 750 : 0,
            closeProb: 0.68,
            approvalProb: 0.89,
          },
          reasoning: 'Increase down payment by $500 and upgrade warranty package. Close probability drops slightly but profit increases significantly.',
        },
        {
          type: 'best_close',
          label: 'Best Close Probability',
          structure: {
            salePrice: deal.salePrice,
            downPayment: 2500,
            term: 72,
          },
          metrics: {
            payment: payment?.monthlyPayment ? payment.monthlyPayment - 75 : 0,
            profit: payment?.grossProfit ? payment.grossProfit - 300 : 0,
            closeProb: 0.87,
            approvalProb: 0.92,
          },
          reasoning: 'Extend term to 72 months and reduce down payment. Lower payment increases close probability by 19%.',
        },
        {
          type: 'balanced',
          label: 'Balanced Approach',
          structure: {
            downPayment: 3000,
            term: 60,
            warranty: 2200,
          },
          metrics: {
            payment: payment?.monthlyPayment || 0,
            profit: payment?.grossProfit ? payment.grossProfit + 200 : 0,
            closeProb: 0.78,
            approvalProb: 0.91,
          },
          reasoning: 'Optimal balance between profit and close probability. Moderate warranty package with standard terms.',
        },
      ];
    },
    enabled: !!payment,
    staleTime: 5000,
  });

  const updateDeal = (updates: Partial<DealState>) => {
    setDeal(prev => ({ ...prev, ...updates }));
  };

  const applyRecommendation = (recommendation: AIRecommendation) => {
    updateDeal(recommendation.structure);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Calculator className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Deal Calculator</h1>
                <p className="text-sm text-slate-400">Real-time pricing & AI optimization</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                Live Pricing
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAI(!showAI)}
                className="text-slate-300 hover:text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Companion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calculator */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Calculator Inputs */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            {/* Vehicle & Customer Section */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-400" />
                    Vehicle & Customer
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-slate-300">Vehicle</Label>
                    {deal.vehicleId ? (
                      <VehicleLink
                        vehicleId={deal.vehicleId}
                        vehicleName="2024 Honda Accord EX-L"
                        showIcon
                        className="text-blue-400 text-lg"
                      />
                    ) : (
                      <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                        Select Vehicle
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300">Vehicle Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.vehiclePrice}
                        onChange={(e) => updateDeal({ vehiclePrice: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Cost (Dealer)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.vehicleCost}
                        onChange={(e) => updateDeal({ vehicleCost: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label className="text-slate-300">Customer</Label>
                    {deal.customerId ? (
                      <CustomerLink
                        customerId={deal.customerId}
                        customerName="Sarah Johnson"
                        showIcon
                        className="text-blue-400 text-lg"
                      />
                    ) : (
                      <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                        Select Customer
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300">Credit Score</Label>
                    <Input
                      type="number"
                      value={deal.creditScore}
                      onChange={(e) => updateDeal({ creditScore: parseInt(e.target.value) || 0 })}
                      className="bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                    />
                    <div className="mt-1">
                      <Badge
                        className={cn(
                          'text-xs',
                          deal.creditScore >= 740 && 'bg-green-500/20 text-green-400 border-green-500/50',
                          deal.creditScore >= 670 && deal.creditScore < 740 && 'bg-blue-500/20 text-blue-400 border-blue-500/50',
                          deal.creditScore >= 580 && deal.creditScore < 670 && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
                          deal.creditScore < 580 && 'bg-red-500/20 text-red-400 border-red-500/50'
                        )}
                      >
                        {deal.creditScore >= 740 ? 'Excellent' : deal.creditScore >= 670 ? 'Good' : deal.creditScore >= 580 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Deal Structure */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  Deal Structure
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Sale Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.salePrice}
                        onChange={(e) => updateDeal({ salePrice: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Down Payment</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.downPayment}
                        onChange={(e) => updateDeal({ downPayment: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Trade-In Value</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.tradeValue}
                        onChange={(e) => updateDeal({ tradeValue: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Trade Payoff</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.tradePayoff}
                        onChange={(e) => updateDeal({ tradePayoff: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Term (months)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.term}
                        onChange={(e) => updateDeal({ term: parseInt(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">APR (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        step="0.01"
                        value={deal.apr}
                        onChange={(e) => updateDeal({ apr: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white text-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* F&I Products */}
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-white">F&I Products</h2>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Warranty</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.warranty}
                        onChange={(e) => updateDeal({ warranty: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">GAP Insurance</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.gap}
                        onChange={(e) => updateDeal({ gap: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Maintenance</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        value={deal.maintenance}
                        onChange={(e) => updateDeal({ maintenance: parseFloat(e.target.value) || 0 })}
                        className="pl-10 bg-slate-900/50 border-slate-600 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Results & AI */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            {/* Payment Display */}
            <Card className="border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm">
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-blue-300 uppercase tracking-wide">Monthly Payment</h2>
                  {paymentLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                      Calculating...
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-5xl font-bold text-white font-mono">
                    {payment ? formatCurrency(payment.monthlyPayment) : '$0'}
                  </div>
                  <div className="text-sm text-slate-400 mt-2">per month for {deal.term} months</div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Amount Financed</div>
                    <div className="text-white font-semibold">
                      {payment ? formatCurrency(payment.totalFinanced) : '$0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Total Interest</div>
                    <div className="text-white font-semibold">
                      {payment ? formatCurrency(payment.totalInterest) : '$0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Total Cost</div>
                    <div className="text-white font-semibold">
                      {payment ? formatCurrency(payment.totalCost) : '$0'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Down + Trade</div>
                    <div className="text-white font-semibold">
                      {formatCurrency(deal.downPayment + (deal.tradeValue - deal.tradePayoff))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Profit Meter */}
            <Card className="border-green-500/50 bg-gradient-to-br from-green-900/20 to-emerald-900/20 backdrop-blur-sm">
              <div className="p-6 space-y-4">
                <h2 className="text-sm font-semibold text-green-300 uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Gross Profit
                </h2>

                <div className="text-center">
                  <div className="text-4xl font-bold text-white font-mono">
                    {payment ? formatCurrency(payment.grossProfit) : '$0'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400">Front End</div>
                    <div className="text-green-400 font-semibold text-lg">
                      {payment ? formatCurrency(payment.frontEndGross) : '$0'}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400">Back End</div>
                    <div className="text-green-400 font-semibold text-lg">
                      {payment ? formatCurrency(payment.backEndGross) : '$0'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Recommendations */}
            {showAI && aiRecommendations && (
              <Card className="border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Recommendations
                    </h2>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-xs">
                      Live
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {aiRecommendations.map((rec) => (
                      <div
                        key={rec.type}
                        className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-semibold text-white text-sm mb-1">{rec.label}</div>
                            <div className="text-xs text-slate-400 mb-3">{rec.reasoning}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                          <div>
                            <div className="text-slate-500">Payment</div>
                            <div className="text-white font-semibold">{formatCurrency(rec.metrics.payment)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Profit</div>
                            <div className="text-green-400 font-semibold">{formatCurrency(rec.metrics.profit)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Close</div>
                            <div className="text-blue-400 font-semibold">{formatPercent(rec.metrics.closeProb)}</div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => applyRecommendation(rec)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Zap className="h-3 w-3 mr-2" />
                          Apply This Structure
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <div className="text-xs text-slate-400 text-center">
                      AI analyzed 1,847 deal structures • Updated 2s ago
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

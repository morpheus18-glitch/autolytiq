/**
 * AI Companion - Panel 3
 *
 * "The Future" - ML-powered recommendations and insights
 * - Max Profit Offer
 * - Best Close Offer
 * - Sensitivity analysis
 * - "Stage This Deal" action
 */

import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@repo/ui';
import { Sparkles, TrendingUp, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface AICompanionProps {
  dealId?: string;
}

interface DealRecommendation {
  type: 'max-profit' | 'best-close';
  payment: number;
  downPayment: number;
  term: number;
  apr: number;
  vehiclePrice: number;
  grossProfit: number;
  closeProb: number;
  confidence: number;
}

export function AICompanion({ dealId }: AICompanionProps) {
  // TODO: Fetch AI recommendations from ML service
  const maxProfitOffer: DealRecommendation = {
    type: 'max-profit',
    payment: 587.45,
    downPayment: 3500,
    term: 60,
    apr: 6.49,
    vehiclePrice: 47200,
    grossProfit: 14750,
    closeProb: 62,
    confidence: 88,
  };

  const bestCloseOffer: DealRecommendation = {
    type: 'best-close',
    payment: 512.30,
    downPayment: 4500,
    term: 72,
    apr: 5.49,
    vehiclePrice: 44900,
    grossProfit: 12450,
    closeProb: 87,
    confidence: 92,
  };

  const warnings = [
    { severity: 'warning', message: 'Customer is price-sensitive based on chat history' },
    { severity: 'info', message: 'Vehicle has been on lot for 58 days - consider discount' },
  ];

  const insights = [
    'Customer mentioned $500/month target in DM',
    'Similar deals closed at avg $525/month',
    'Trade-in value $2K above KBB - opportunity to offset',
  ];

  return (
    <div className="p-4 space-y-4">
      {/* AI Status Badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-accent-primary/10 border border-accent-primary/20 rounded-md">
        <Sparkles className="h-4 w-4 text-accent-primary" />
        <span className="text-sm font-medium text-accent-primary">AI Analysis Active</span>
      </div>

      {/* Max Profit Offer */}
      <Card className="border-accent-success/30 bg-accent-success/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-success" />
              Max Profit Offer
            </CardTitle>
            <Badge variant="success" size="sm">
              {maxProfitOffer.confidence}% confident
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-text-primary">
              ${maxProfitOffer.payment.toFixed(2)}<span className="text-lg text-text-tertiary">/mo</span>
            </div>
            <div className="text-sm text-text-tertiary mt-1">
              {maxProfitOffer.term} months @ {maxProfitOffer.apr}%
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Vehicle Price</span>
              <span className="font-medium text-text-primary">
                ${maxProfitOffer.vehiclePrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Down Payment</span>
              <span className="font-medium text-text-primary">
                ${maxProfitOffer.downPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Gross Profit</span>
              <span className="font-semibold text-status-success">
                ${maxProfitOffer.grossProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-tertiary">Close Probability</span>
              <div className="flex items-center gap-2">
                <Progress value={maxProfitOffer.closeProb} className="w-16" />
                <span className="font-medium text-text-primary w-8">
                  {maxProfitOffer.closeProb}%
                </span>
              </div>
            </div>
          </div>

          <Button variant="success" size="sm" className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Stage This Deal
          </Button>
        </CardContent>
      </Card>

      {/* Best Close Offer */}
      <Card className="border-accent-primary/30 bg-accent-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-accent-primary" />
              Best Close Offer
            </CardTitle>
            <Badge variant="primary" size="sm">
              {bestCloseOffer.confidence}% confident
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-text-primary">
              ${bestCloseOffer.payment.toFixed(2)}<span className="text-lg text-text-tertiary">/mo</span>
            </div>
            <div className="text-sm text-text-tertiary mt-1">
              {bestCloseOffer.term} months @ {bestCloseOffer.apr}%
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Vehicle Price</span>
              <span className="font-medium text-text-primary">
                ${bestCloseOffer.vehiclePrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Down Payment</span>
              <span className="font-medium text-text-primary">
                ${bestCloseOffer.downPayment.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Gross Profit</span>
              <span className="font-semibold text-status-success">
                ${bestCloseOffer.grossProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-tertiary">Close Probability</span>
              <div className="flex items-center gap-2">
                <Progress value={bestCloseOffer.closeProb} className="w-16" />
                <span className="font-medium text-text-primary w-8">
                  {bestCloseOffer.closeProb}%
                </span>
              </div>
            </div>
          </div>

          <Button variant="primary" size="sm" className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Stage This Deal
          </Button>
        </CardContent>
      </Card>

      {/* Warnings & Alerts */}
      {warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warnings.map((warning, index) => (
              <div
                key={index}
                className={`flex gap-2 p-2 rounded-md text-sm ${
                  warning.severity === 'warning'
                    ? 'bg-status-warning/10 text-status-warning'
                    : 'bg-accent-primary/10 text-accent-primary'
                }`}
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{warning.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">AI Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-status-success mt-0.5 flex-shrink-0" />
              <span className="text-text-secondary">{insight}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sensitivity Analysis (Compact) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between p-2 bg-surface-muted rounded">
            <span className="text-text-tertiary">+$1K down →</span>
            <span className="font-medium text-text-primary">-$16/mo (85% close)</span>
          </div>
          <div className="flex justify-between p-2 bg-surface-muted rounded">
            <span className="text-text-tertiary">72mo term →</span>
            <span className="font-medium text-text-primary">-$68/mo (91% close)</span>
          </div>
          <div className="flex justify-between p-2 bg-surface-muted rounded">
            <span className="text-text-tertiary">-$500 price →</span>
            <span className="font-medium text-text-primary">-$8/mo (-$500 profit)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

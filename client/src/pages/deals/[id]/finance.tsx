import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  PieChart,
  Target,
  AlertCircle
} from 'lucide-react';
import type { Deal, DealGross } from '@shared/schema';

interface DealFinanceTabProps {
  deal: Deal;
}

export default function DealFinanceTab({ deal }: DealFinanceTabProps) {
  const { data: dealGross } = useQuery<DealGross>({
    queryKey: ['/api/deals', deal.id, 'gross'],
  });

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePayment = () => {
    const principal = deal.financeBalance || 0;
    const rate = parseFloat(deal.rate?.replace('%', '') || '0') / 100 / 12;
    const term = deal.term || 60;
    
    if (rate === 0) return principal / term;
    
    const payment = principal * (rate * Math.pow(1 + rate, term)) / 
                   (Math.pow(1 + rate, term) - 1);
    
    return Math.round(payment * 100) / 100;
  };

  const monthlyPayment = calculatePayment();
  const totalInterest = (monthlyPayment * (deal.term || 60)) - (deal.financeBalance || 0);

  const profitMarginPercentage = dealGross?.netGross && deal.salePrice ? 
    (dealGross.netGross / deal.salePrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Gross Profit Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Gross Profit Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dealGross ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Front-End Gross</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(dealGross.frontEndGross)}
                </p>
                <p className="text-sm text-blue-700 mt-1">Vehicle profit</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Finance Reserve</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(dealGross.financeReserve)}
                </p>
                <p className="text-sm text-green-700 mt-1">2 pts over buy rate</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Product Gross</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(dealGross.productGross)}
                </p>
                <p className="text-sm text-purple-700 mt-1">F&I products</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">Pack Cost</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  -{formatCurrency(dealGross.packCost)}
                </p>
                <p className="text-sm text-orange-700 mt-1">Dealer overhead</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Net Gross</span>
                </div>
                <p className={`text-2xl font-bold ${dealGross.netGross >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(dealGross.netGross)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {profitMarginPercentage.toFixed(1)}% margin
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Gross profit calculation not available</p>
              <p className="text-sm text-gray-500 mt-1">Complete deal structure to see calculations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Finance Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Finance Amount</label>
                <p className="text-lg font-semibold">{formatCurrency(deal.financeBalance)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Interest Rate</label>
                <p className="text-lg font-semibold">{deal.rate || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Term</label>
                <p className="text-lg font-semibold">{deal.term || 0} months</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Monthly Payment</label>
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(monthlyPayment)}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Interest</label>
                  <p className="text-lg font-semibold">{formatCurrency(totalInterest)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Payments</label>
                  <p className="text-lg font-semibold">{formatCurrency(monthlyPayment * (deal.term || 60))}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Deal Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Profit Margin</span>
                <span className="text-sm font-semibold">{profitMarginPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(profitMarginPercentage, 100)} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                Target: 15-25% for healthy deals
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Finance Penetration</span>
                <Badge variant={deal.financeBalance && deal.financeBalance > 0 ? "default" : "secondary"}>
                  {deal.financeBalance && deal.financeBalance > 0 ? "Financed" : "Cash"}
                </Badge>
              </div>
              {deal.financeBalance && deal.financeBalance > 0 && (
                <p className="text-xs text-gray-500">
                  Finance amount: {formatCurrency(deal.financeBalance)}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Credit Tier</span>
                <Badge variant={
                  deal.creditTier === 'A+' || deal.creditTier === 'A' ? "default" :
                  deal.creditTier === 'B' ? "secondary" : "destructive"
                }>
                  {deal.creditTier || 'Not set'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                Better credit = lower rates & higher approvals
              </p>
            </div>

            {dealGross && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Deal Score</span>
                  <Badge variant={
                    dealGross.netGross > 3000 ? "default" :
                    dealGross.netGross > 1500 ? "secondary" : "destructive"
                  }>
                    {dealGross.netGross > 3000 ? "Excellent" :
                     dealGross.netGross > 1500 ? "Good" : "Poor"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on total gross profit
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Finance Reserve Breakdown */}
      {dealGross && dealGross.financeReserve > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Finance Reserve Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Buy Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {deal.rate ? `${(parseFloat(deal.rate.replace('%', '')) - 2).toFixed(2)}%` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500">Base lender rate</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Sell Rate</p>
                <p className="text-2xl font-bold text-green-600">{deal.rate || 'N/A'}</p>
                <p className="text-xs text-gray-500">Customer rate</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Reserve Spread</p>
                <p className="text-2xl font-bold text-purple-600">2.00%</p>
                <p className="text-xs text-gray-500">Dealer profit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
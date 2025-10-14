import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, DollarSign, Package, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProductOptimization {
  productName: string;
  currentRetail: number;
  currentCost: number;
  currentProfit: number;
  suggestedRetail: number;
  suggestedCost: number;
  suggestedProfit: number;
  penetrationRate: number; // % of deals that include this product
  profitability: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface ProfitOptimizerProps {
  vehicleCost: number;
  salePrice: number;
  products: Array<{
    productName: string;
    retailPrice: number;
    cost: number;
  }>;
  reserveAmount?: number;
  onApplyOptimization?: (products: Array<{ productName: string; retailPrice: number; cost: number }>) => void;
}

export function ProfitOptimizer({
  vehicleCost,
  salePrice,
  products,
  reserveAmount = 0,
  onApplyOptimization
}: ProfitOptimizerProps) {
  // Calculate current profit metrics
  const metrics = useMemo(() => {
    const frontGross = salePrice - vehicleCost;
    const backGross = products.reduce((sum, p) => sum + (p.retailPrice - p.cost), 0);
    const totalGross = frontGross + backGross + reserveAmount;
    
    return {
      frontGross,
      backGross,
      reserveGross: reserveAmount,
      totalGross,
      frontPercentage: totalGross > 0 ? (frontGross / totalGross) * 100 : 0,
      backPercentage: totalGross > 0 ? (backGross / totalGross) * 100 : 0,
      reservePercentage: totalGross > 0 ? (reserveAmount / totalGross) * 100 : 0
    };
  }, [vehicleCost, salePrice, products, reserveAmount]);

  // Generate product optimizations
  const optimizations = useMemo((): ProductOptimization[] => {
    // Industry benchmarks for backend products
    const benchmarks = {
      warranty: { minRetail: 1800, maxRetail: 3500, idealProfit: 900, penetration: 65 },
      gap: { minRetail: 600, maxRetail: 1200, idealProfit: 400, penetration: 55 },
      maintenance: { minRetail: 1200, maxRetail: 2400, idealProfit: 700, penetration: 45 },
      'tire & wheel': { minRetail: 800, maxRetail: 1500, idealProfit: 500, penetration: 35 }
    };

    return products.map(product => {
      const productType = product.productName.toLowerCase();
      let benchmark = benchmarks.warranty; // default
      
      if (productType.includes('gap')) benchmark = benchmarks.gap;
      else if (productType.includes('maintenance')) benchmark = benchmarks.maintenance;
      else if (productType.includes('tire') || productType.includes('wheel')) benchmark = benchmarks['tire & wheel'];
      else if (productType.includes('warranty') || productType.includes('service')) benchmark = benchmarks.warranty;

      const currentProfit = product.retailPrice - product.cost;
      const profitRatio = currentProfit / (product.cost || 1);
      
      // Determine profitability
      let profitability: 'high' | 'medium' | 'low' = 'medium';
      if (profitRatio >= 0.8) profitability = 'high';
      else if (profitRatio < 0.5) profitability = 'low';

      // Generate recommendation
      let recommendation = 'Optimal pricing';
      let suggestedRetail = product.retailPrice;
      let suggestedCost = product.cost;

      if (product.retailPrice < benchmark.minRetail) {
        suggestedRetail = Math.max(benchmark.minRetail, product.cost + 100); // Ensure at least $100 profit
        recommendation = `Increase retail to industry minimum ($${benchmark.minRetail})`;
      } else if (product.retailPrice > benchmark.maxRetail) {
        suggestedRetail = Math.max(benchmark.maxRetail, product.cost + 100); // Never go below cost
        recommendation = `Reduce retail to maximize acceptance ($${benchmark.maxRetail})`;
      } else if (currentProfit < benchmark.idealProfit) {
        suggestedRetail = suggestedCost + benchmark.idealProfit;
        recommendation = `Increase profit margin to meet target ($${benchmark.idealProfit} profit)`;
      }

      // Final safety check: never suggest retail below cost
      suggestedRetail = Math.max(suggestedRetail, suggestedCost + 100);
      const suggestedProfit = suggestedRetail - suggestedCost;

      return {
        productName: product.productName,
        currentRetail: product.retailPrice,
        currentCost: product.cost,
        currentProfit,
        suggestedRetail,
        suggestedCost,
        suggestedProfit,
        penetrationRate: benchmark.penetration,
        profitability,
        recommendation
      };
    });
  }, [products]);

  // Calculate optimization potential
  const optimizationPotential = useMemo(() => {
    const currentTotal = optimizations.reduce((sum, opt) => sum + opt.currentProfit, 0);
    const optimizedTotal = optimizations.reduce((sum, opt) => sum + opt.suggestedProfit, 0);
    const potential = optimizedTotal - currentTotal;
    
    return {
      current: currentTotal,
      optimized: optimizedTotal,
      potential,
      percentageGain: currentTotal > 0 ? (potential / currentTotal) * 100 : 0
    };
  }, [optimizations]);

  // Suggest missing products
  const suggestMissingProducts = useMemo(() => {
    const hasWarranty = products.some(p => p.productName.toLowerCase().includes('warranty') || p.productName.toLowerCase().includes('service'));
    const hasGap = products.some(p => p.productName.toLowerCase().includes('gap'));
    const hasMaintenance = products.some(p => p.productName.toLowerCase().includes('maintenance'));
    
    const suggestions = [];
    if (!hasWarranty) suggestions.push({ name: 'Extended Warranty', profit: 900, penetration: 65 });
    if (!hasGap) suggestions.push({ name: 'GAP Coverage', profit: 400, penetration: 55 });
    if (!hasMaintenance) suggestions.push({ name: 'Maintenance Plan', profit: 700, penetration: 45 });
    
    return suggestions;
  }, [products]);

  const getProfitabilityColor = (profitability: 'high' | 'medium' | 'low') => {
    switch (profitability) {
      case 'high': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-red-600 dark:text-red-400';
    }
  };

  const applyAllOptimizations = () => {
    const optimizedProducts = optimizations.map(opt => ({
      productName: opt.productName,
      retailPrice: opt.suggestedRetail,
      cost: opt.suggestedCost
    }));
    
    onApplyOptimization?.(optimizedProducts);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Profit Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Profit Breakdown */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Total Gross Profit</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${metrics.totalGross.toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Front End</span>
              <span className="font-semibold">${metrics.frontGross.toLocaleString()} ({metrics.frontPercentage.toFixed(0)}%)</span>
            </div>
            <Progress value={metrics.frontPercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span>Back End Products</span>
              <span className="font-semibold">${metrics.backGross.toLocaleString()} ({metrics.backPercentage.toFixed(0)}%)</span>
            </div>
            <Progress value={metrics.backPercentage} className="h-2" />
            
            {metrics.reserveGross > 0 && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span>Finance Reserve</span>
                  <span className="font-semibold">${metrics.reserveGross.toLocaleString()} ({metrics.reservePercentage.toFixed(0)}%)</span>
                </div>
                <Progress value={metrics.reservePercentage} className="h-2" />
              </>
            )}
          </div>
        </div>

        {/* Optimization Potential */}
        {optimizationPotential.potential > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-900 dark:text-green-100">Optimization Available</span>
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">
              Increase backend profit by <span className="font-bold">${optimizationPotential.potential.toLocaleString()}</span>
              {optimizationPotential.percentageGain > 0 && (
                <span> (+{optimizationPotential.percentageGain.toFixed(0)}%)</span>
              )}
            </div>
            {onApplyOptimization && (
              <Button
                onClick={applyAllOptimizations}
                size="sm"
                className="mt-3 w-full"
                data-testid="button-apply-all-optimizations"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Apply All Optimizations
              </Button>
            )}
          </div>
        )}

        {/* Product Optimizations */}
        {optimizations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Analysis
            </h4>
            {optimizations.map((opt, index) => (
              <div key={index} className="p-3 border rounded-lg" data-testid={`optimization-${index}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{opt.productName}</span>
                  <Badge className={getProfitabilityColor(opt.profitability)}>
                    {opt.profitability === 'high' && <TrendingUp className="h-3 w-3 mr-1" />}
                    {opt.profitability} margin
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  <div>
                    <div className="text-muted-foreground">Current Profit</div>
                    <div className="font-semibold">${opt.currentProfit.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Suggested Profit</div>
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      ${opt.suggestedProfit.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground flex items-start gap-1">
                  {opt.currentProfit < opt.suggestedProfit ? (
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{opt.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Missing Products Suggestions */}
        {suggestMissingProducts.length > 0 && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-amber-900 dark:text-amber-100">Add More Products</span>
            </div>
            <div className="space-y-2">
              {suggestMissingProducts.map((suggestion, index) => (
                <div key={index} className="text-sm flex items-center justify-between">
                  <span>{suggestion.name}</span>
                  <Badge variant="outline">
                    ${suggestion.profit} profit • {suggestion.penetration}% penetration
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industry Benchmarks */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <div className="font-semibold mb-1">Industry Benchmarks:</div>
          <div>Backend profit should be 40-60% of total gross profit</div>
          <div>Current backend: {metrics.backPercentage.toFixed(0)}%</div>
        </div>
      </CardContent>
    </Card>
  );
}

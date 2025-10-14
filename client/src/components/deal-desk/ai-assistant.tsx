import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb,
  Target,
  DollarSign,
  Loader2,
  ChevronRight,
  Brain
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AIAssistantProps {
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    msrp: number;
    cost: number;
  };
  customerInfo: {
    creditTier?: string;
    monthlyBudget?: number;
    downPayment: number;
    zipCode?: string;
  };
  currentDeal: {
    salePrice: number;
    tradeValue: number;
    tradePayoff: number;
    term: number;
    apr: number;
    products: Array<{
      name: string;
      retailPrice: number;
      cost: number;
    }>;
  };
  marketValue?: number;
  onApplySuggestion?: (suggestion: any) => void;
}

export function AIAssistant({
  vehicleInfo,
  customerInfo,
  currentDeal,
  marketValue,
  onApplySuggestion
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Create stable query key with complete deal snapshot
  const queryKey = useMemo(() => {
    // Create stable string representation of products
    const productsKey = currentDeal.products
      .map(p => `${p.name}:${p.retailPrice}:${p.cost}`)
      .sort()
      .join('|');
    
    return [
      '/api/deals/optimize',
      // Vehicle info
      vehicleInfo?.make || '',
      vehicleInfo?.model || '',
      vehicleInfo?.year || 0,
      vehicleInfo?.msrp || 0,
      vehicleInfo?.cost || 0,
      // Deal structure
      currentDeal.salePrice,
      currentDeal.tradeValue,
      currentDeal.tradePayoff,
      currentDeal.term,
      currentDeal.apr,
      // Products (stable string)
      productsKey,
      // Customer info
      customerInfo.creditTier || '',
      customerInfo.monthlyBudget || 0,
      customerInfo.downPayment,
      customerInfo.zipCode || '',
      // Market data
      marketValue || 0
    ];
  }, [vehicleInfo, currentDeal, customerInfo, marketValue]);

  // Fetch AI optimization when deal data changes
  const { data: optimization, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiRequest('/api/deals/optimize', {
        method: 'POST',
        body: JSON.stringify({
          vehicleInfo: vehicleInfo || {
            make: 'Unknown',
            model: 'Unknown',
            year: new Date().getFullYear(),
            msrp: currentDeal.salePrice,
            cost: currentDeal.salePrice * 0.85
          },
          customerInfo: {
            creditTier: customerInfo.creditTier,
            monthlyBudget: customerInfo.monthlyBudget,
            downPayment: customerInfo.downPayment
          },
          currentDeal,
          marketData: marketValue ? {
            competitorPricing: marketValue,
            avgDaysOnMarket: 45
          } : undefined
        })
      });
      return response.json();
    },
    enabled: currentDeal.salePrice > 0,
    staleTime: 30000, // Cache for 30 seconds
    retry: 1
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-2 text-purple-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">AI analyzing deal...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !optimization) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            AI optimization unavailable
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">AI Deal Assistant</CardTitle>
          </div>
          <Badge variant="outline" className="bg-white dark:bg-gray-800">
            GPT-4o
          </Badge>
        </div>
        <CardDescription>Powered by advanced AI optimization</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="negotiation" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="profit" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              Profit
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${getScoreBgColor(optimization.healthScore)}`}>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Deal Health
                </p>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${getScoreColor(optimization.healthScore)}`}>
                    {optimization.healthScore}
                  </span>
                  <span className="text-sm text-gray-500 mb-1">/100</span>
                </div>
                <Progress value={optimization.healthScore} className="h-2 mt-2" />
              </div>

              <div className={`p-4 rounded-lg ${getScoreBgColor(optimization.closingProbability)}`}>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Close Probability
                </p>
                <div className="flex items-end gap-2">
                  <span className={`text-3xl font-bold ${getScoreColor(optimization.closingProbability)}`}>
                    {optimization.closingProbability}%
                  </span>
                </div>
                <Progress value={optimization.closingProbability} className="h-2 mt-2" />
              </div>
            </div>

            {optimization.recommendations.pricing.suggested !== currentDeal.salePrice && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Pricing Suggestion
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      ${optimization.recommendations.pricing.suggested.toLocaleString()} 
                      <span className="text-xs ml-1">
                        ({optimization.recommendations.pricing.competitivePosition})
                      </span>
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {optimization.recommendations.pricing.reasoning}
                    </p>
                    {onApplySuggestion && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-2 h-7 text-xs"
                        onClick={() => onApplySuggestion({ 
                          type: 'pricing', 
                          value: optimization.recommendations.pricing.suggested 
                        })}
                      >
                        Apply <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="mt-4">
            <ScrollArea className="h-64">
              <div className="space-y-3 pr-4">
                {optimization.recommendations.products.length > 0 ? (
                  optimization.recommendations.products.map((product: any, idx: number) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        product.shouldInclude 
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {product.shouldInclude ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {product.reasoning}
                          </p>
                          {product.shouldInclude && product.suggestedRetail > 0 && (
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">
                              Suggested: ${product.suggestedRetail.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-gray-500 py-4">
                    No product recommendations available
                  </p>
                )}

                {optimization.recommendations.financing.paymentReduction > 0 && (
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                          Payment Optimization
                        </p>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                          {optimization.recommendations.financing.reasoning}
                        </p>
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-1">
                          Save ${optimization.recommendations.financing.paymentReduction}/month
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Negotiation Strategy Tab */}
          <TabsContent value="negotiation" className="mt-4">
            <ScrollArea className="h-64">
              <div className="space-y-4 pr-4">
                {optimization.negotiationStrategy.strengths.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Deal Strengths
                    </h4>
                    <ul className="space-y-1">
                      {optimization.negotiationStrategy.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {optimization.negotiationStrategy.objectionHandlers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      Objection Handlers
                    </h4>
                    <div className="space-y-2">
                      {optimization.negotiationStrategy.objectionHandlers.map((handler: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            "{handler.objection}"
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            → {handler.response}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {optimization.negotiationStrategy.closingTechniques.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      Closing Techniques
                    </h4>
                    <ul className="space-y-1">
                      {optimization.negotiationStrategy.closingTechniques.map((technique: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                          <span className="text-purple-600">{idx + 1}.</span>
                          {technique}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Profit Optimization Tab */}
          <TabsContent value="profit" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Current Profit
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${optimization.profitOptimization.currentProfit.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300 mb-1">
                    Optimized Profit
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${optimization.profitOptimization.optimizedProfit.toLocaleString()}
                  </p>
                </div>
              </div>

              {optimization.profitOptimization.improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Profit Opportunities</h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-2 pr-4">
                      {optimization.profitOptimization.improvements.map((improvement: any, idx: number) => (
                        <div key={idx} className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {improvement.area}
                            </p>
                            <Badge variant="outline" className="bg-white dark:bg-gray-800 text-green-600">
                              +${improvement.opportunity.toLocaleString()}
                            </Badge>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            {improvement.action}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

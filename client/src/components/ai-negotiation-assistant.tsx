import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  MessageSquare,
  DollarSign,
  Percent,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AIAssistantProps {
  vehiclePrice: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  tradeValue: number;
  downPayment: number;
  financeRate: number;
  termMonths: number;
  customerBudget?: number;
  marketValue?: number;
  customerProfile?: {
    creditScore?: number;
    income?: number;
  };
}

interface NegotiationSuggestion {
  type: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestedValue?: number;
  talkingPoints: string[];
}

interface DealAnalysis {
  dealScore: number;
  profitMargin: number;
  closeProbability: number;
  recommendations: NegotiationSuggestion[];
  counterOffers: {
    conservative: any;
    moderate: any;
    aggressive: any;
  };
  objectionHandlers: {
    objection: string;
    response: string;
  }[];
  aiInsights: string;
}

export function AINext({ 
  vehiclePrice, 
  vehicleMake, 
  vehicleModel, 
  vehicleYear,
  tradeValue,
  downPayment,
  financeRate,
  termMonths,
  customerBudget,
  marketValue,
  customerProfile
}: AIAssistantProps) {
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/ai/analyze-deal', {
        method: 'POST',
        body: {
          vehiclePrice,
          vehicleMake,
          vehicleModel,
          vehicleYear,
          tradeValue,
          downPayment,
          financeRate,
          termMonths,
          customerBudget,
          marketValue,
          customerProfile
        }
      });
      return response;
    },
    onSuccess: (data) => {
      setAnalysis(data);
    }
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!vehiclePrice || vehiclePrice === 0) {
    return (
      <Card data-testid="card-ai-assistant-empty">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Negotiation Assistant
          </CardTitle>
          <CardDescription>AI-powered deal analysis and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter vehicle and customer information to get AI-powered negotiation recommendations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" data-testid="card-ai-assistant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI Negotiation Assistant
        </CardTitle>
        <CardDescription>AI-powered deal analysis and closing strategies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <Button 
            onClick={() => analyzeMutation.mutate()} 
            disabled={analyzeMutation.isPending}
            className="w-full"
            data-testid="button-analyze-deal"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Deal...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze Deal with AI
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Deal Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Deal Score</div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.dealScore)}`} data-testid="text-deal-score">
                  {analysis.dealScore}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Close Prob.</div>
                <div className={`text-2xl font-bold ${getScoreColor(analysis.closeProbability)}`} data-testid="text-close-probability">
                  {analysis.closeProbability}%
                </div>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Profit</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400" data-testid="text-profit-margin">
                  {analysis.profitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <Alert className="border-blue-200 dark:border-blue-800">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm" data-testid="text-ai-insights">
                {analysis.aiInsights}
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="recommendations" className="w-full">
              <div className="mobile-tabs overflow-x-auto -mx-2 px-2 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 scrollbar-hide">
                <TabsList className="inline-flex w-max md:grid md:w-full md:grid-cols-3 h-12 md:h-11 gap-1 p-1">
                  <TabsTrigger value="recommendations" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-recommendations">
                    <Target className="h-4 w-4 mr-2" />
                    Strategies
                  </TabsTrigger>
                  <TabsTrigger value="counteroffers" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-counteroffers">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Counter-Offers
                  </TabsTrigger>
                  <TabsTrigger value="objections" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-objections">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Objections
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="recommendations" className="space-y-3 mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {analysis.recommendations.map((rec, idx) => (
                    <Card key={idx} className="mb-3" data-testid={`recommendation-${idx}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{rec.title}</CardTitle>
                          <Badge className={getImpactColor(rec.impact)} variant="secondary">
                            {rec.impact} impact
                          </Badge>
                        </div>
                        <CardDescription>{rec.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {rec.suggestedValue && (
                          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="text-sm font-medium">Suggested Value: ${rec.suggestedValue.toLocaleString()}</div>
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="text-sm font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Talking Points:
                          </div>
                          {rec.talkingPoints.map((point, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <ArrowRight className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="counteroffers" className="space-y-3 mt-4">
                <div className="grid gap-3">
                  {/* Conservative */}
                  <Card className="border-green-200 dark:border-green-800" data-testid="counteroffer-conservative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-green-600 dark:text-green-400">Conservative</CardTitle>
                        <Badge variant="outline" className="border-green-500">Safest</Badge>
                      </div>
                      <CardDescription>{analysis.counterOffers.conservative.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span className="font-semibold">${analysis.counterOffers.conservative.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Trade Value:</span>
                        <span className="font-semibold">${analysis.counterOffers.conservative.tradeValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Down Payment:</span>
                        <span className="font-semibold">${analysis.counterOffers.conservative.downPayment.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Monthly:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${analysis.counterOffers.conservative.monthlyPayment.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Moderate */}
                  <Card className="border-blue-200 dark:border-blue-800" data-testid="counteroffer-moderate">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-blue-600 dark:text-blue-400">Moderate</CardTitle>
                        <Badge variant="outline" className="border-blue-500">Recommended</Badge>
                      </div>
                      <CardDescription>{analysis.counterOffers.moderate.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span className="font-semibold">${analysis.counterOffers.moderate.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Trade Value:</span>
                        <span className="font-semibold">${analysis.counterOffers.moderate.tradeValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Down Payment:</span>
                        <span className="font-semibold">${analysis.counterOffers.moderate.downPayment.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Monthly:</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${analysis.counterOffers.moderate.monthlyPayment.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Aggressive */}
                  <Card className="border-purple-200 dark:border-purple-800" data-testid="counteroffer-aggressive">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-purple-600 dark:text-purple-400">Aggressive</CardTitle>
                        <Badge variant="outline" className="border-purple-500">Best Value</Badge>
                      </div>
                      <CardDescription>{analysis.counterOffers.aggressive.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Price:</span>
                        <span className="font-semibold">${analysis.counterOffers.aggressive.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Trade Value:</span>
                        <span className="font-semibold">${analysis.counterOffers.aggressive.tradeValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Down Payment:</span>
                        <span className="font-semibold">${analysis.counterOffers.aggressive.downPayment.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Monthly:</span>
                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          ${analysis.counterOffers.aggressive.monthlyPayment.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="objections" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {analysis.objectionHandlers.map((handler, idx) => (
                      <Card key={idx} data-testid={`objection-${idx}`}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            "{handler.objection}"
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{handler.response}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <Button 
              variant="outline" 
              onClick={() => analyzeMutation.mutate()} 
              disabled={analyzeMutation.isPending}
              className="w-full"
              data-testid="button-reanalyze"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Reanalyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Reanalyze Deal
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

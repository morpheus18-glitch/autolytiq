import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Calculator, 
  Shield, 
  Zap,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Eye
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface DealDeskCopilotProps {
  dealId: string;
}

export function DealDeskCopilot({ dealId }: DealDeskCopilotProps) {
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: dealInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/ai-insights', 'deal', dealId],
    enabled: !!dealId,
  });

  const { data: deal, isLoading: dealLoading } = useQuery({
    queryKey: ['/api/deals', dealId],
    enabled: !!dealId,
  });

  const { data: complianceChecks, isLoading: complianceLoading } = useQuery({
    queryKey: ['/api/ai-insights/compliance', dealId],
    enabled: !!dealId,
  });

  const { data: inventoryOptimization, isLoading: inventoryLoading } = useQuery({
    queryKey: ['/api/ai-insights/inventory-optimizer', dealId],
    enabled: !!dealId,
  });

  const reviewInsightMutation = useMutation({
    mutationFn: async ({ insightId, status, reviewedBy }: { insightId: number; status: string; reviewedBy: string }) => {
      return apiRequest(`/api/ai-insights/${insightId}/review`, 'PATCH', { status, reviewedBy });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
    },
  });

  const generateInsightMutation = useMutation({
    mutationFn: async ({ type, entityType, entityId }: { type: string; entityType: string; entityId: string }) => {
      return apiRequest('/api/ai-insights/generate', 'POST', { type, entityType, entityId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
    },
  });

  if (insightsLoading || dealLoading || complianceLoading || inventoryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handleReviewInsight = (insightId: number, status: string) => {
    reviewInsightMutation.mutate({
      insightId,
      status,
      reviewedBy: 'current-user', // In real app, get from auth context
    });
  };

  const generateNewInsight = (type: string) => {
    generateInsightMutation.mutate({
      type,
      entityType: 'deal',
      entityId: dealId,
    });
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'deal_desk_copilot': return <Brain className="w-5 h-5 text-blue-500" />;
      case 'inventory_optimizer': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'compliance_checker': return <Shield className="w-5 h-5 text-purple-500" />;
      default: return <Zap className="w-5 h-5 text-orange-500" />;
    }
  };

  const getInsightPriority = (insight: any) => {
    if (insight.confidence > 0.9) return { color: 'bg-red-500', label: 'Critical' };
    if (insight.confidence > 0.7) return { color: 'bg-yellow-500', label: 'Important' };
    return { color: 'bg-blue-500', label: 'Suggestion' };
  };

  return (
    <div className="space-y-6">
      {/* Copilot Header */}
      <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-600" />
            Deal Desk AI Copilot
          </CardTitle>
          <CardDescription>
            Intelligent deal analysis and recommendations powered by machine learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              onClick={() => generateNewInsight('deal_desk_copilot')} 
              size="sm"
              disabled={generateInsightMutation.isPending}
            >
              <Brain className="w-4 h-4 mr-2" />
              Analyze Deal
            </Button>
            <Button 
              onClick={() => generateNewInsight('compliance_checker')} 
              variant="outline" 
              size="sm"
              disabled={generateInsightMutation.isPending}
            >
              <Shield className="w-4 h-4 mr-2" />
              Compliance Check
            </Button>
            <Button 
              onClick={() => generateNewInsight('inventory_optimizer')} 
              variant="outline" 
              size="sm"
              disabled={generateInsightMutation.isPending}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Optimize Pricing
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Active Insights</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="history">Review History</TabsTrigger>
        </TabsList>

        {/* Active Insights */}
        <TabsContent value="insights" className="space-y-4">
          {dealInsights && dealInsights.length > 0 ? (
            <div className="space-y-4">
              {dealInsights.map((insight: any) => {
                const priority = getInsightPriority(insight);
                return (
                  <Card key={insight.id} className="border-l-4" style={{ borderLeftColor: priority.color.replace('bg-', '#') }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getInsightIcon(insight.type)}
                          <CardTitle className="ml-2 text-lg">
                            {insight.insight.title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className={`text-white ${priority.color}`}>
                            {priority.label}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(insight.confidence * 100)}% confident
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {insight.insight.description}
                      </p>
                      
                      {/* Recommendations */}
                      {insight.insight.recommendations && (
                        <div className="space-y-2 mb-4">
                          <h4 className="text-sm font-medium">Recommendations:</h4>
                          <ul className="space-y-1">
                            {insight.insight.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <ChevronRight className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Financial Impact */}
                      {insight.insight.financialImpact && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mb-4">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              Potential Impact: {insight.insight.financialImpact}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Risk Assessment */}
                      {insight.insight.riskLevel && (
                        <div className={`p-3 rounded-lg mb-4 ${
                          insight.insight.riskLevel === 'high' 
                            ? 'bg-red-50 dark:bg-red-900/20' 
                            : insight.insight.riskLevel === 'medium'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-green-50 dark:bg-green-900/20'
                        }`}>
                          <div className="flex items-center">
                            <AlertTriangle className={`w-4 h-4 mr-2 ${
                              insight.insight.riskLevel === 'high' ? 'text-red-600' : 
                              insight.insight.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                            }`} />
                            <span className="text-sm font-medium">
                              Risk Level: {insight.insight.riskLevel.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {insight.status === 'pending' && (
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReviewInsight(insight.id, 'dismissed')}
                            disabled={reviewInsightMutation.isPending}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Dismiss
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveInsight(activeInsight === insight.id ? null : insight.id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {activeInsight === insight.id ? 'Hide Details' : 'View Details'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReviewInsight(insight.id, 'applied')}
                            disabled={reviewInsightMutation.isPending}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Apply
                          </Button>
                        </div>
                      )}

                      {/* Expanded Details */}
                      {activeInsight === insight.id && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Technical Details</h4>
                          <div className="text-sm space-y-2">
                            <div><strong>Model Version:</strong> {insight.insight.modelVersion || 'v1.0'}</div>
                            <div><strong>Analysis Date:</strong> {new Date(insight.createdAt).toLocaleString()}</div>
                            <div><strong>Data Points:</strong> {insight.insight.dataPoints || 'Multiple sources'}</div>
                          </div>
                          {insight.insight.rawData && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-2">Raw Analysis Data</h4>
                              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
                                {JSON.stringify(insight.insight.rawData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">No AI insights available</p>
                <p className="text-sm text-gray-500 mb-4">Generate intelligent recommendations for this deal</p>
                <Button onClick={() => generateNewInsight('deal_desk_copilot')}>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Deal Now
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-500" />
                Compliance Analysis
              </CardTitle>
              <CardDescription>
                Automated regulatory and internal policy compliance checking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {complianceChecks && complianceChecks.length > 0 ? (
                <div className="space-y-3">
                  {complianceChecks.map((check: any) => (
                    <Alert key={check.id} className={
                      check.insight.status === 'pass' 
                        ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                        : check.insight.status === 'warning'
                        ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
                        : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                    }>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{check.insight.title}</AlertTitle>
                      <AlertDescription>
                        {check.insight.description}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No compliance checks available. Generate compliance analysis to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-500" />
                Deal Optimization
              </CardTitle>
              <CardDescription>
                AI-powered pricing and structure optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryOptimization && inventoryOptimization.length > 0 ? (
                <div className="space-y-4">
                  {inventoryOptimization.map((opt: any) => (
                    <div key={opt.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{opt.insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {opt.insight.description}
                      </p>
                      {opt.insight.savings && (
                        <div className="flex items-center text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">
                            Potential savings: {opt.insight.savings}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No optimization suggestions available. Run deal analysis to generate recommendations.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Insight Review History</CardTitle>
              <CardDescription>
                Track of all AI recommendations and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {dealInsights?.filter((insight: any) => insight.status !== 'pending').map((insight: any) => (
                    <div key={insight.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{insight.insight.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Reviewed on {new Date(insight.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={insight.status === 'applied' ? 'default' : 'secondary'}>
                        {insight.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
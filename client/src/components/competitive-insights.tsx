import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, BarChart3, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { CompetitivePricing, PricingInsights, MarketTrends } from "@shared/schema";

export default function CompetitiveInsights() {
  const { data: competitivePricing, isLoading: pricingLoading } = useQuery({
    queryKey: ['/api/competitive-pricing'],
    queryFn: () => fetch('/api/competitive-pricing').then(res => res.json())
  });

  const { data: pricingInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/pricing-insights'],
    queryFn: () => fetch('/api/pricing-insights').then(res => res.json())
  });

  const { data: marketTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/market-trends'],
    queryFn: () => fetch('/api/market-trends').then(res => res.json())
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPositionBadge = (position: string) => {
    switch (position) {
      case 'below':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Below Market</Badge>;
      case 'above':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Above Market</Badge>;
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Market Average</Badge>;
    }
  };

  const getTrendIcon = (direction: string) => {
    return direction === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (pricingLoading || insightsLoading || trendsLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Competitive Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Competitive Insights
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/competitive-pricing">
            <ExternalLink className="h-4 w-4 mr-2" />
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Competitive Pricing Summary */}
        <div>
          <h4 className="font-semibold mb-3">Market Data Overview</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Listings</p>
              <p className="text-2xl font-bold">{competitivePricing?.length || 0}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Active Sources</p>
              <p className="text-2xl font-bold">
                {competitivePricing ? new Set(competitivePricing.map((p: CompetitivePricing) => p.source)).size : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Pricing Insights */}
        {pricingInsights && pricingInsights.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Recent Pricing Insights</h4>
            <div className="space-y-3">
              {pricingInsights.slice(0, 3).map((insight: PricingInsights) => (
                <div key={insight.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{insight.make} {insight.model} {insight.year}</p>
                    <p className="text-sm text-gray-600">
                      Current: {formatCurrency(parseFloat(insight.currentPrice))} → 
                      Suggested: {formatCurrency(parseFloat(insight.suggestedPrice))}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPositionBadge(insight.position || 'average')}
                    <div className="text-xs text-gray-500">
                      {insight.confidence}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Trends */}
        {marketTrends && marketTrends.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Market Trends</h4>
            <div className="space-y-3">
              {marketTrends.slice(0, 3).map((trend: MarketTrends) => (
                <div key={trend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">{trend.category}</p>
                      {getTrendIcon(trend.direction)}
                    </div>
                    <p className="text-sm text-gray-600">{trend.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{Math.round(parseFloat(trend.strength) * 100)}%</p>
                    <p className="text-xs text-gray-500">{trend.dataPoints} data points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {(!competitivePricing || competitivePricing.length === 0) && 
         (!pricingInsights || pricingInsights.length === 0) && 
         (!marketTrends || marketTrends.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No competitive insights available</p>
            <p className="text-sm mt-1">Start by scraping competitive data to generate insights</p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/competitive-pricing">
                Get Started
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
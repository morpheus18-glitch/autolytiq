import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Search, 
  DollarSign, 
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CompetitivePricing, PricingInsights, MerchandisingStrategies, MarketTrends } from "@shared/schema";

interface PricingRecommendation {
  suggestedPrice: number;
  marketAverage: number;
  priceRange: { min: number; max: number };
  confidence: number;
  position: 'below' | 'average' | 'above';
  recommendedAction: string;
  factors: {
    mileage: number;
    age: number;
    condition: number;
    features: number;
    location: number;
    demand: number;
  };
}

export default function CompetitivePricing() {
  const [searchFilters, setSearchFilters] = useState({
    make: '',
    model: '',
    year: '',
    source: ''
  });
  const [pricingForm, setPricingForm] = useState({
    vehicleId: '',
    make: '',
    model: '',
    year: '',
    currentPrice: '',
    mileage: ''
  });
  const [activeTab, setActiveTab] = useState("competitive-data");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch competitive pricing data
  const { data: competitivePricing, isLoading: competitiveLoading } = useQuery({
    queryKey: ['/api/competitive-pricing', searchFilters],
    queryFn: () => apiRequest(`/api/competitive-pricing?${new URLSearchParams(searchFilters).toString()}`),
    enabled: !!(searchFilters.make || searchFilters.model || searchFilters.year || searchFilters.source)
  });

  // Fetch pricing insights
  const { data: pricingInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/pricing-insights'],
    queryFn: () => apiRequest('/api/pricing-insights')
  });

  // Fetch merchandising strategies
  const { data: merchandisingStrategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['/api/merchandising-strategies'],
    queryFn: () => apiRequest('/api/merchandising-strategies')
  });

  // Fetch market trends
  const { data: marketTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/market-trends'],
    queryFn: () => apiRequest('/api/market-trends')
  });

  // Scrape competitive pricing
  const scrapePricingMutation = useMutation({
    mutationFn: (data: { make: string; model: string; year: number }) => 
      apiRequest('/api/scrape-competitive-pricing', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Competitive pricing data scraped successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/competitive-pricing'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to scrape competitive pricing data",
        variant: "destructive",
      });
    }
  });

  // Generate pricing insights
  const generateInsightsMutation = useMutation({
    mutationFn: (data: { vehicleId: number; make: string; model: string; year: number; currentPrice: number; mileage?: number }) => 
      apiRequest('/api/generate-pricing-insights', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pricing insights generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-insights'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate pricing insights",
        variant: "destructive",
      });
    }
  });

  // Generate merchandising strategies
  const generateStrategiesMutation = useMutation({
    mutationFn: (data: { vehicleId: number; pricingInsights: PricingRecommendation }) => 
      apiRequest('/api/generate-merchandising-strategies', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Merchandising strategies generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/merchandising-strategies'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate merchandising strategies",
        variant: "destructive",
      });
    }
  });

  // Analyze market trends
  const analyzeMarketMutation = useMutation({
    mutationFn: () => apiRequest('/api/analyze-market-trends', { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Market trends analyzed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/market-trends'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to analyze market trends",
        variant: "destructive",
      });
    }
  });

  const handleScrapeData = () => {
    const { make, model, year } = searchFilters;
    if (!make || !model || !year) {
      toast({
        title: "Error",
        description: "Please enter make, model, and year to scrape data",
        variant: "destructive",
      });
      return;
    }
    scrapePricingMutation.mutate({ make, model, year: parseInt(year) });
  };

  const handleGenerateInsights = () => {
    const { vehicleId, make, model, year, currentPrice, mileage } = pricingForm;
    if (!vehicleId || !make || !model || !year || !currentPrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    generateInsightsMutation.mutate({
      vehicleId: parseInt(vehicleId),
      make,
      model,
      year: parseInt(year),
      currentPrice: parseFloat(currentPrice),
      mileage: mileage ? parseInt(mileage) : undefined
    });
  };

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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'increase_price':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease_price':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'maintain_price':
        return <Target className="h-4 w-4 text-blue-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    return direction === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitive Pricing & ML Analysis</h1>
          <p className="text-muted-foreground">
            Leverage web scraping and machine learning for competitive intelligence and pricing optimization
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => analyzeMarketMutation.mutate()} 
            disabled={analyzeMarketMutation.isPending}
            size="sm"
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Analyze Market
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="competitive-data">Competitive Data</TabsTrigger>
          <TabsTrigger value="pricing-insights">Pricing Insights</TabsTrigger>
          <TabsTrigger value="strategies">Merchandising</TabsTrigger>
          <TabsTrigger value="market-trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="competitive-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Scrape Competitive Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={searchFilters.make}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, make: e.target.value }))}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={searchFilters.model}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g., Camry"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={searchFilters.year}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source (Optional)</Label>
                  <Select value={searchFilters.source} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, source: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sources</SelectItem>
                      <SelectItem value="AutoTrader">AutoTrader</SelectItem>
                      <SelectItem value="Cars.com">Cars.com</SelectItem>
                      <SelectItem value="CarGurus">CarGurus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleScrapeData} 
                disabled={scrapePricingMutation.isPending}
                className="w-full"
              >
                {scrapePricingMutation.isPending ? 'Scraping...' : 'Scrape Competitive Data'}
              </Button>
            </CardContent>
          </Card>

          {competitivePricing && competitivePricing.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Competitive Pricing Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Make/Model</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Mileage</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitivePricing.map((pricing: CompetitivePricing) => (
                        <TableRow key={pricing.id}>
                          <TableCell className="font-medium">
                            {pricing.make} {pricing.model}
                            {pricing.trim && <span className="text-muted-foreground ml-1">({pricing.trim})</span>}
                          </TableCell>
                          <TableCell>{pricing.year}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(parseFloat(pricing.price))}</TableCell>
                          <TableCell>{pricing.mileage ? pricing.mileage.toLocaleString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{pricing.source}</Badge>
                          </TableCell>
                          <TableCell>{pricing.location || 'N/A'}</TableCell>
                          <TableCell>
                            {pricing.sourceUrl && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={pricing.sourceUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pricing-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Generate Pricing Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="vehicleId">Vehicle ID</Label>
                  <Input
                    id="vehicleId"
                    type="number"
                    value={pricingForm.vehicleId}
                    onChange={(e) => setPricingForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                    placeholder="e.g., 1"
                  />
                </div>
                <div>
                  <Label htmlFor="pricingMake">Make</Label>
                  <Input
                    id="pricingMake"
                    value={pricingForm.make}
                    onChange={(e) => setPricingForm(prev => ({ ...prev, make: e.target.value }))}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div>
                  <Label htmlFor="pricingModel">Model</Label>
                  <Input
                    id="pricingModel"
                    value={pricingForm.model}
                    onChange={(e) => setPricingForm(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g., Camry"
                  />
                </div>
                <div>
                  <Label htmlFor="pricingYear">Year</Label>
                  <Input
                    id="pricingYear"
                    type="number"
                    value={pricingForm.year}
                    onChange={(e) => setPricingForm(prev => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div>
                  <Label htmlFor="currentPrice">Current Price</Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    value={pricingForm.currentPrice}
                    onChange={(e) => setPricingForm(prev => ({ ...prev, currentPrice: e.target.value }))}
                    placeholder="e.g., 25000"
                  />
                </div>
                <div>
                  <Label htmlFor="mileage">Mileage (Optional)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={pricingForm.mileage}
                    onChange={(e) => setPricingForm(prev => ({ ...prev, mileage: e.target.value }))}
                    placeholder="e.g., 50000"
                  />
                </div>
              </div>
              <Button 
                onClick={handleGenerateInsights} 
                disabled={generateInsightsMutation.isPending}
                className="w-full"
              >
                {generateInsightsMutation.isPending ? 'Generating...' : 'Generate Pricing Insights'}
              </Button>
            </CardContent>
          </Card>

          {pricingInsights && pricingInsights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingInsights.map((insight: PricingInsights) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{insight.make} {insight.model} {insight.year}</span>
                      {getPositionBadge(insight.position || 'average')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Current Price</Label>
                        <p className="text-2xl font-bold">{formatCurrency(parseFloat(insight.currentPrice))}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Suggested Price</Label>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(parseFloat(insight.suggestedPrice))}</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Market Average</Label>
                      <p className="text-lg">{formatCurrency(parseFloat(insight.marketAverage))}</p>
                    </div>

                    {insight.priceRange && (
                      <div>
                        <Label className="text-sm font-medium">Price Range</Label>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(insight.priceRange.min)} - {formatCurrency(insight.priceRange.max)}
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">Confidence</Label>
                        <span className="text-sm">{insight.confidence}%</span>
                      </div>
                      <Progress value={parseFloat(insight.confidence)} className="h-2" />
                    </div>

                    <div className="flex items-center space-x-2">
                      {getActionIcon(insight.recommendedAction)}
                      <span className="text-sm font-medium">
                        {insight.recommendedAction.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Merchandising Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {merchandisingStrategies && merchandisingStrategies.length > 0 ? (
                <div className="space-y-4">
                  {merchandisingStrategies.map((strategy: MerchandisingStrategies) => (
                    <Card key={strategy.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{strategy.strategy.replace('_', ' ').toUpperCase()}</h4>
                          <Badge variant="outline">Priority {strategy.priority}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{strategy.description}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label>Impact</Label>
                            <p className="font-medium">{strategy.estimatedImpact}</p>
                          </div>
                          <div>
                            <Label>Cost</Label>
                            <p className="font-medium">{formatCurrency(parseFloat(strategy.implementationCost || '0'))}</p>
                          </div>
                          <div>
                            <Label>Expected ROI</Label>
                            <p className="font-medium text-green-600">{strategy.expectedROI}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No merchandising strategies found. Generate pricing insights first to get personalized strategies.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market-trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Market Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketTrends && marketTrends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketTrends.map((trend: MarketTrends) => (
                    <Card key={trend.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{trend.category}</h4>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(trend.direction)}
                            <span className="text-sm font-medium">{trend.direction.toUpperCase()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{trend.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Strength</Label>
                            <Progress value={parseFloat(trend.strength) * 100} className="h-2 mt-1" />
                          </div>
                          <div>
                            <Label>Data Points</Label>
                            <p className="font-medium">{trend.dataPoints}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No market trends available. Click "Analyze Market" to generate trend analysis.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
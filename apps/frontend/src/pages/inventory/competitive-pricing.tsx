import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  Progress,
  Alert,
  PageHeader
} from "@repo/ui";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Search,
  DollarSign,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  ExternalLink,
  Zap
} from "lucide-react";
import { useToast } from "@repo/ui";
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

  const { data: competitivePricing, isLoading: competitiveLoading } = useQuery({
    queryKey: ['/api/competitive-pricing', searchFilters],
    queryFn: () => apiRequest(`/api/competitive-pricing?${new URLSearchParams(searchFilters).toString()}`),
    enabled: !!(searchFilters.make || searchFilters.model || searchFilters.year || searchFilters.source)
  });

  const { data: pricingInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/pricing-insights'],
    queryFn: () => apiRequest('/api/pricing-insights')
  });

  const { data: merchandisingStrategies, isLoading: strategiesLoading } = useQuery({
    queryKey: ['/api/merchandising-strategies'],
    queryFn: () => apiRequest('/api/merchandising-strategies')
  });

  const { data: marketTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ['/api/market-trends'],
    queryFn: () => apiRequest('/api/market-trends')
  });

  const scrapePricingMutation = useMutation({
    mutationFn: (data: { make: string; model: string; year: number }) =>
      apiRequest('/api/scrape-competitive-pricing', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Success", description: "Competitive pricing data scraped successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/competitive-pricing'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to scrape competitive pricing data", variant: "destructive" });
    }
  });

  const generateInsightsMutation = useMutation({
    mutationFn: (data: { vehicleId: number; make: string; model: string; year: number; currentPrice: number; mileage?: number }) =>
      apiRequest('/api/generate-pricing-insights', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Success", description: "Pricing insights generated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-insights'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate pricing insights", variant: "destructive" });
    }
  });

  const generateStrategiesMutation = useMutation({
    mutationFn: (data: { vehicleId: number; pricingInsights: PricingRecommendation }) =>
      apiRequest('/api/generate-merchandising-strategies', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: "Success", description: "Merchandising strategies generated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/merchandising-strategies'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate merchandising strategies", variant: "destructive" });
    }
  });

  const analyzeMarketMutation = useMutation({
    mutationFn: () => apiRequest('/api/analyze-market-trends', { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Success", description: "Market trends analyzed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/market-trends'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to analyze market trends", variant: "destructive" });
    }
  });

  const handleScrapeData = () => {
    const { make, model, year } = searchFilters;
    if (!make || !model || !year) {
      toast({ title: "Error", description: "Please enter make, model, and year to scrape data", variant: "destructive" });
      return;
    }
    scrapePricingMutation.mutate({ make, model, year: parseInt(year) });
  };

  const handleGenerateInsights = () => {
    const { vehicleId, make, model, year, currentPrice, mileage } = pricingForm;
    if (!vehicleId || !make || !model || !year || !currentPrice) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
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
        return <Badge variant="info">Below Market</Badge>;
      case 'above':
        return <Badge variant="error">Above Market</Badge>;
      default:
        return <Badge variant="success">Market Average</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'increase_price':
        return <TrendingUp />;
      case 'decrease_price':
        return <TrendingDown />;
      case 'maintain_price':
        return <Target />;
      default:
        return <BarChart3 />;
    }
  };

  const getTrendIcon = (direction: string) => {
    return direction === 'up' ? <TrendingUp /> : <TrendingDown />;
  };

  return (
    <>
      <PageHeader
        title="Competitive Pricing & ML Analysis"
        description="Leverage web scraping and machine learning for competitive intelligence and pricing optimization"
        actions={
          <Button
            onClick={() => analyzeMarketMutation.mutate()}
            disabled={analyzeMarketMutation.isPending}
            size="sm"
            variant="outline"
          >
            <Zap />
            Analyze Market
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="competitive-data">Competitive Data</TabsTrigger>
          <TabsTrigger value="pricing-insights">Pricing Insights</TabsTrigger>
          <TabsTrigger value="strategies">Merchandising</TabsTrigger>
          <TabsTrigger value="market-trends">Market Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="competitive-data">
          <Card>
            <CardHeader>
              <CardTitle>
                <Search />
                Scrape Competitive Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={searchFilters.make}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, make: e.target.value }))}
                placeholder="e.g., Toyota"
              />

              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={searchFilters.model}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., Camry"
              />

              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={searchFilters.year}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, year: e.target.value }))}
                placeholder="e.g., 2020"
              />

              <Button
                onClick={handleScrapeData}
                disabled={scrapePricingMutation.isPending}
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
                        <TableCell>
                          {pricing.make} {pricing.model}
                          {pricing.trim && <span> ({pricing.trim})</span>}
                        </TableCell>
                        <TableCell>{pricing.year}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(pricing.price))}</TableCell>
                        <TableCell>{pricing.mileage ? pricing.mileage.toLocaleString() : 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{pricing.source}</Badge>
                        </TableCell>
                        <TableCell>{pricing.location || 'N/A'}</TableCell>
                        <TableCell>
                          {pricing.sourceUrl && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={pricing.sourceUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink />
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pricing-insights">
          <Card>
            <CardHeader>
              <CardTitle>
                <DollarSign />
                Generate Pricing Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="vehicleId">Vehicle ID</Label>
              <Input
                id="vehicleId"
                type="number"
                value={pricingForm.vehicleId}
                onChange={(e) => setPricingForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                placeholder="e.g., 1"
              />

              <Label htmlFor="pricingMake">Make</Label>
              <Input
                id="pricingMake"
                value={pricingForm.make}
                onChange={(e) => setPricingForm(prev => ({ ...prev, make: e.target.value }))}
                placeholder="e.g., Toyota"
              />

              <Label htmlFor="pricingModel">Model</Label>
              <Input
                id="pricingModel"
                value={pricingForm.model}
                onChange={(e) => setPricingForm(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g., Camry"
              />

              <Label htmlFor="pricingYear">Year</Label>
              <Input
                id="pricingYear"
                type="number"
                value={pricingForm.year}
                onChange={(e) => setPricingForm(prev => ({ ...prev, year: e.target.value }))}
                placeholder="e.g., 2020"
              />

              <Label htmlFor="currentPrice">Current Price</Label>
              <Input
                id="currentPrice"
                type="number"
                value={pricingForm.currentPrice}
                onChange={(e) => setPricingForm(prev => ({ ...prev, currentPrice: e.target.value }))}
                placeholder="e.g., 25000"
              />

              <Label htmlFor="mileage">Mileage (Optional)</Label>
              <Input
                id="mileage"
                type="number"
                value={pricingForm.mileage}
                onChange={(e) => setPricingForm(prev => ({ ...prev, mileage: e.target.value }))}
                placeholder="e.g., 50000"
              />

              <Button
                onClick={handleGenerateInsights}
                disabled={generateInsightsMutation.isPending}
              >
                {generateInsightsMutation.isPending ? 'Generating...' : 'Generate Pricing Insights'}
              </Button>
            </CardContent>
          </Card>

          {pricingInsights && pricingInsights.length > 0 && (
            <>
              {pricingInsights.map((insight: PricingInsights) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <CardTitle>
                      {insight.make} {insight.model} {insight.year}
                      {getPositionBadge(insight.position || 'average')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Label>Current Price</Label>
                    <p>{formatCurrency(parseFloat(insight.currentPrice))}</p>

                    <Label>Suggested Price</Label>
                    <p>{formatCurrency(parseFloat(insight.suggestedPrice))}</p>

                    <Label>Market Average</Label>
                    <p>{formatCurrency(parseFloat(insight.marketAverage))}</p>

                    {insight.priceRange && (
                      <>
                        <Label>Price Range</Label>
                        <p>
                          {formatCurrency(insight.priceRange.min)} - {formatCurrency(insight.priceRange.max)}
                        </p>
                      </>
                    )}

                    <Label>Confidence</Label>
                    <Progress value={parseFloat(insight.confidence)} />
                    <span>{insight.confidence}%</span>

                    {getActionIcon(insight.recommendedAction)}
                    <span>{insight.recommendedAction.replace('_', ' ').toUpperCase()}</span>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="strategies">
          <Card>
            <CardHeader>
              <CardTitle>
                <Lightbulb />
                Merchandising Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {merchandisingStrategies && merchandisingStrategies.length > 0 ? (
                <>
                  {merchandisingStrategies.map((strategy: MerchandisingStrategies) => (
                    <Card key={strategy.id}>
                      <CardContent>
                        <h4>{strategy.strategy.replace('_', ' ').toUpperCase()}</h4>
                        <Badge variant="outline">Priority {strategy.priority}</Badge>
                        <p>{strategy.description}</p>
                        <Label>Impact</Label>
                        <p>{strategy.estimatedImpact}</p>
                        <Label>Cost</Label>
                        <p>{formatCurrency(parseFloat(strategy.implementationCost || '0'))}</p>
                        <Label>Expected ROI</Label>
                        <p>{strategy.expectedROI}%</p>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Alert>
                  <AlertTriangle />
                  No merchandising strategies found. Generate pricing insights first to get personalized strategies.
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market-trends">
          <Card>
            <CardHeader>
              <CardTitle>
                <BarChart3 />
                Market Trends Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketTrends && marketTrends.length > 0 ? (
                <>
                  {marketTrends.map((trend: MarketTrends) => (
                    <Card key={trend.id}>
                      <CardContent>
                        <h4>{trend.category}</h4>
                        {getTrendIcon(trend.direction)}
                        <span>{trend.direction.toUpperCase()}</span>
                        <p>{trend.description}</p>
                        <Label>Strength</Label>
                        <Progress value={parseFloat(trend.strength) * 100} />
                        <Label>Data Points</Label>
                        <p>{trend.dataPoints}</p>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Alert>
                  <AlertTriangle />
                  No market trends available. Click "Analyze Market" to generate trend analysis.
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

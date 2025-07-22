import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  TrendingUp, 
  Car, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  RefreshCw,
  Eye,
  Clock,
  MapPin,
  Settings,
  Lightbulb,
  Award,
  Smartphone,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Filter,
  Search
} from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface InventoryInsight {
  totalVehicles: number;
  averagePrice: number;
  averageDaysOnLot: number;
  turnoverRate: number;
  profitMargin: number;
  recommendedActions: Array<{
    type: 'pricing' | 'promotion' | 'acquisition' | 'listing';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    expectedImpact: string;
    vehicleId?: number;
  }>;
  marketTrends: {
    demandByCategory: Array<{ category: string; demand: number; trend: 'up' | 'down' | 'stable' }>;
    priceOptimization: Array<{ vehicleId: number; currentPrice: number; suggestedPrice: number; reason: string }>;
    lowPerformers: Array<{ vehicleId: number; daysOnLot: number; reason: string }>;
  };
}

interface SmartFilters {
  priceOptimal: boolean;
  highDemand: boolean;
  lowPerformers: boolean;
  needsAttention: boolean;
  listingOptimized: boolean;
}

export default function IntelligentInventoryManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [smartFilters, setSmartFilters] = useState<SmartFilters>({
    priceOptimal: false,
    highDemand: false,
    lowPerformers: false,
    needsAttention: false,
    listingOptimized: false
  });
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch inventory insights
  const { data: insights, isLoading: insightsLoading } = useQuery<InventoryInsight>({
    queryKey: ['/api/inventory/insights'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch vehicles with AI enhancements
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles', smartFilters, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      Object.entries(smartFilters).forEach(([key, value]) => {
        if (value) params.append(key, 'true');
      });
      
      const response = await apiRequest("GET", `/api/vehicles?${params.toString()}`);
      return response.json();
    },
  });

  // Execute AI recommendation
  const executeRecommendationMutation = useMutation({
    mutationFn: async (recommendation: any) => {
      const response = await apiRequest("POST", `/api/inventory/execute-recommendation`, recommendation);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Recommendation executed successfully", description: data.message });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/insights'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
    onError: () => {
      toast({ title: "Failed to execute recommendation", variant: "destructive" });
    },
  });

  // Generate new insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/inventory/generate-insights`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory/insights'] });
      toast({ title: "New inventory insights generated" });
    },
  });

  // Bulk price optimization
  const optimizePricingMutation = useMutation({
    mutationFn: async (vehicleIds: number[]) => {
      const response = await apiRequest("POST", `/api/inventory/optimize-pricing`, { vehicleIds });
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Pricing optimized", description: `${data.updated} vehicles updated` });
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
  });

  const handleFilterChange = (filter: keyof SmartFilters) => {
    setSmartFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const activeFilters = Object.entries(smartFilters).filter(([_, active]) => active);

  return (
    <div className="space-y-6">
      {/* Header with AI Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Brain className="w-6 h-6 mr-2" />
            Intelligent Inventory Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400">AI-powered inventory optimization and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => generateInsightsMutation.mutate()}
            disabled={generateInsightsMutation.isPending}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh AI Insights
          </Button>
          <Button 
            onClick={() => optimizePricingMutation.mutate(vehicles.map(v => v.id))}
            disabled={optimizePricingMutation.isPending || vehicles.length === 0}
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Optimize All Pricing
          </Button>
        </div>
      </div>

      {/* Smart Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Smart Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(smartFilters).map(([filter, active]) => (
              <Button
                key={filter}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(filter as keyof SmartFilters)}
                className="justify-start"
              >
                {filter === 'priceOptimal' && <CheckCircle className="w-4 h-4 mr-2" />}
                {filter === 'highDemand' && <TrendingUp className="w-4 h-4 mr-2" />}
                {filter === 'lowPerformers' && <AlertTriangle className="w-4 h-4 mr-2" />}
                {filter === 'needsAttention' && <Clock className="w-4 h-4 mr-2" />}
                {filter === 'listingOptimized' && <Globe className="w-4 h-4 mr-2" />}
                {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Button>
            ))}
          </div>
          
          {activeFilters.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Active filters: {activeFilters.length}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSmartFilters({
                    priceOptimal: false,
                    highDemand: false,
                    lowPerformers: false,
                    needsAttention: false,
                    listingOptimized: false
                  })}
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">AI Overview</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="vehicles">Smart Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {insightsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-600 mt-2">Analyzing inventory...</p>
            </div>
          ) : insights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Key Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Inventory Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{insights.totalVehicles}</div>
                    <div className="text-sm text-gray-600">Total Vehicles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      ${insights.averagePrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Avg Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">{insights.averageDaysOnLot}</div>
                    <div className="text-sm text-gray-600">Avg Days on Lot</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Turnover Rate</span>
                      <span>{insights.turnoverRate}%</span>
                    </div>
                    <Progress value={insights.turnoverRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profit Margin</span>
                      <span>{insights.profitMargin}%</span>
                    </div>
                    <Progress value={insights.profitMargin} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Priority Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.recommendedActions.slice(0, 3).map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => executeRecommendationMutation.mutate(action)}
                          >
                            Execute
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No inventory insights available yet</p>
                <Button onClick={() => generateInsightsMutation.mutate()}>
                  Generate AI Insights
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {insights?.recommendedActions.length ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {insights.recommendedActions.map((action, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        {action.type === 'pricing' && <DollarSign className="w-5 h-5 mr-2" />}
                        {action.type === 'promotion' && <Star className="w-5 h-5 mr-2" />}
                        {action.type === 'acquisition' && <Car className="w-5 h-5 mr-2" />}
                        {action.type === 'listing' && <Globe className="w-5 h-5 mr-2" />}
                        {action.title}
                      </span>
                      <Badge className={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">{action.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        Expected Impact: {action.expectedImpact}
                      </span>
                      <Button 
                        onClick={() => executeRecommendationMutation.mutate(action)}
                        disabled={executeRecommendationMutation.isPending}
                        size="sm"
                      >
                        Execute Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No AI recommendations available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {insights?.marketTrends ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Demand by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Demand by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.marketTrends.demandByCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${category.demand}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{category.demand}%</span>
                          </div>
                          {getTrendIcon(category.trend)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Price Optimization Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Price Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.marketTrends.priceOptimization.slice(0, 5).map((optimization, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">Vehicle #{optimization.vehicleId}</p>
                            <p className="text-xs text-gray-600">{optimization.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              <span className="line-through text-gray-500">
                                ${optimization.currentPrice.toLocaleString()}
                              </span>
                              {' → '}
                              <span className="font-bold text-green-600">
                                ${optimization.suggestedPrice.toLocaleString()}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Performers */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Vehicles Needing Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insights.marketTrends.lowPerformers.map((performer, index) => (
                      <div key={index} className="p-3 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">Vehicle #{performer.vehicleId}</p>
                            <p className="text-xs text-gray-600">{performer.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">{performer.daysOnLot} days</p>
                            <p className="text-xs text-gray-600">on lot</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No market trend data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Smart Inventory View</h3>
            <div className="flex items-center space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sedan">Sedans</SelectItem>
                  <SelectItem value="suv">SUVs</SelectItem>
                  <SelectItem value="truck">Trucks</SelectItem>
                  <SelectItem value="coupe">Coupes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {vehiclesLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-600 mt-2">Loading vehicles...</p>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                      <div className="flex items-center space-x-1">
                        {vehicle.aiInsights?.priceOptimal && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {vehicle.listing?.isListed && (
                          <Globe className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Price:</span>
                      <span className="font-semibold">${vehicle.price.toLocaleString()}</span>
                    </div>
                    
                    {vehicle.aiInsights?.demandScore && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>AI Demand Score:</span>
                          <span>{vehicle.aiInsights.demandScore}%</span>
                        </div>
                        <Progress value={vehicle.aiInsights.demandScore} className="h-2" />
                      </div>
                    )}

                    {vehicle.aiInsights?.daysToSell && (
                      <div className="flex justify-between text-sm">
                        <span>Est. Days to Sell:</span>
                        <span className="font-medium">{vehicle.aiInsights.daysToSell} days</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
                        {vehicle.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No vehicles match your current filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
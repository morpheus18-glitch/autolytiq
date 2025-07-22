import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Globe, 
  Eye, 
  Edit3, 
  Camera, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Brain,
  Zap,
  Star,
  Share2,
  Settings,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Smartphone
} from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface EnhancedVehicleListingProps {
  vehicle: Vehicle;
  onUpdate?: (vehicle: Vehicle) => void;
}

export default function EnhancedVehicleListing({ vehicle, onUpdate }: EnhancedVehicleListingProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch AI insights for this vehicle
  const { data: aiInsights, isLoading: aiInsightsLoading } = useQuery({
    queryKey: [`/api/vehicles/${vehicle.id}/ai-insights`],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch listing performance data
  const { data: listingPerformance } = useQuery({
    queryKey: [`/api/vehicles/${vehicle.id}/listing-performance`],
  });

  // Update listing mutation
  const updateListingMutation = useMutation({
    mutationFn: async (listingData: any) => {
      const response = await apiRequest("PUT", `/api/vehicles/${vehicle.id}/listing`, listingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicle.id}`] });
      toast({ title: "Listing updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update listing", variant: "destructive" });
    },
  });

  // Generate AI optimizations
  const generateAIOptimizationsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/vehicles/${vehicle.id}/ai-optimize`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "AI optimizations generated", description: data.message });
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicle.id}/ai-insights`] });
    },
  });

  const handleListingToggle = (isListed: boolean) => {
    updateListingMutation.mutate({
      ...vehicle.listing,
      isListed,
      listingStatus: isListed ? 'active' : 'inactive'
    });
  };

  const listingData = vehicle.listing || {
    isListed: false,
    listingSites: [],
    listingStatus: 'inactive'
  };

  const insights = vehicle.aiInsights || {};
  const specifications = vehicle.specifications || {};
  const location = vehicle.location || {};

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">VIN: {vehicle.vin}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={vehicle.status === 'available' ? 'default' : 'secondary'}>
            {vehicle.status}
          </Badge>
          <Badge variant={listingData.isListed ? 'default' : 'outline'}>
            {listingData.isListed ? 'Listed' : 'Not Listed'}
          </Badge>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listing">Listing</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price & Valuation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Current Price:</span>
                  <span className="font-semibold">${vehicle.price.toLocaleString()}</span>
                </div>
                {vehicle.originalPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Original Price:</span>
                    <span className="text-sm">${vehicle.originalPrice.toLocaleString()}</span>
                  </div>
                )}
                {vehicle.costPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cost:</span>
                    <span className="text-sm">${vehicle.costPrice.toLocaleString()}</span>
                  </div>
                )}
                {vehicle.valuations?.aiEstimate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">AI Estimate:</span>
                    <span className="text-sm font-medium">
                      ${vehicle.valuations.aiEstimate.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Engine:</span>
                    <p className="font-medium">{specifications.engine || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Transmission:</span>
                    <p className="font-medium">{specifications.transmission || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Mileage:</span>
                    <p className="font-medium">{vehicle.mileage?.toLocaleString() || 'Unknown'} mi</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Condition:</span>
                    <p className="font-medium capitalize">{vehicle.condition || 'Good'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lot:</span>
                    <span>{location.lot || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Row:</span>
                    <span>{location.row || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Space:</span>
                    <span>{location.space || 'Not assigned'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Preview */}
          {insights && Object.keys(insights).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  AI Insights Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.demandScore && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{insights.demandScore}%</div>
                      <div className="text-sm text-gray-600">Demand Score</div>
                    </div>
                  )}
                  {insights.daysToSell && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{insights.daysToSell}</div>
                      <div className="text-sm text-gray-600">Days to Sell</div>
                    </div>
                  )}
                  {insights.marketPosition && (
                    <div className="text-center">
                      <div className="text-lg font-bold capitalize">{insights.marketPosition}</div>
                      <div className="text-sm text-gray-600">Market Position</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="listing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Listing Management
                </span>
                <Switch
                  checked={listingData.isListed}
                  onCheckedChange={handleListingToggle}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listingData.isListed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="seo-title">SEO Title</Label>
                    <Input
                      id="seo-title"
                      defaultValue={listingData.seoTitle}
                      placeholder="Optimize for search engines..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="keywords">Keywords</Label>
                    <Input
                      id="keywords"
                      defaultValue={listingData.keywords?.join(', ')}
                      placeholder="sedan, fuel-efficient, reliable..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="seo-description">SEO Description</Label>
                    <Textarea
                      id="seo-description"
                      defaultValue={listingData.seoDescription}
                      placeholder="Detailed description for better search visibility..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => generateAIOptimizationsMutation.mutate()}
                  disabled={generateAIOptimizationsMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Optimize Listing
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Listing
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiInsightsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : insights.marketPosition ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Market Position:</span>
                      <Badge variant="outline" className="capitalize">
                        {insights.marketPosition}
                      </Badge>
                    </div>
                    {insights.recommendedActions && (
                      <div>
                        <h4 className="font-semibold mb-2">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {insights.recommendedActions.map((action, index) => (
                            <li key={index} className="text-sm flex items-start">
                              <Target className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No AI insights available yet</p>
                    <Button 
                      onClick={() => generateAIOptimizationsMutation.mutate()}
                      className="mt-2"
                      variant="outline"
                      size="sm"
                    >
                      Generate Insights
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Price Optimal:</span>
                    <div className="flex items-center">
                      {insights.priceOptimal ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  {insights.demandScore && (
                    <div className="flex items-center justify-between">
                      <span>Demand Score:</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${insights.demandScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{insights.demandScore}%</span>
                      </div>
                    </div>
                  )}
                  {insights.daysToSell && (
                    <div className="flex items-center justify-between">
                      <span>Est. Days to Sell:</span>
                      <span className="font-medium">{insights.daysToSell} days</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Media Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicle.media?.map((item, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={item.url} 
                      alt={item.label}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                      <Button size="sm" variant="secondary">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                    {item.isMain && (
                      <Star className="absolute top-1 right-1 w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                )) || (
                  <div className="col-span-full text-center py-8">
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No media uploaded yet</p>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photos
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Listing Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {listingPerformance ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(listingPerformance as any)?.views || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(listingPerformance as any)?.leads || 0}
                    </div>
                    <div className="text-sm text-gray-600">Leads Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(listingPerformance as any)?.inquiries || 0}
                    </div>
                    <div className="text-sm text-gray-600">Inquiries</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No performance data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Search, Car, DollarSign, TrendingUp, Shield, Zap, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// =============================================
// AUTOMOTIVE DATA CENTER COMPONENT
// =============================================

interface VehicleData {
  vin: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  bodyStyle?: string;
  msrp?: number;
  features?: string[];
}

interface MarketData {
  vin: string;
  estimatedValue: number;
  tradeInValue: number;
  retailValue: number;
  privatePartyValue: number;
  marketTrend: 'rising' | 'falling' | 'stable';
  demandScore: number;
  daysOnMarket: number;
  competitorCount: number;
  lastUpdated: string;
}

interface IncentiveData {
  make: string;
  model: string;
  year: number;
  incentives: Array<{
    type: string;
    amount: number;
    description: string;
    validThrough: string;
    eligibility: string;
  }>;
}

interface APIHealth {
  service: string;
  status: string;
  responseTime?: number;
}

const AutomotiveDataCenter: React.FC = () => {
  const [vinInput, setVinInput] = useState('');
  const [searchParams, setSearchParams] = useState({ make: '', model: '', year: '' });
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [activeTab, setActiveTab] = useState('vin-lookup');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API Health Check Query
  const { data: apiHealth, refetch: refetchHealth } = useQuery<APIHealth[]>({
    queryKey: ['/api/automotive/health'],
    refetchInterval: 60000 // Check every minute
  });

  // VIN Decode Mutation
  const vinDecodeMutation = useMutation({
    mutationFn: async (vin: string) => {
      const response = await apiRequest('POST', '/api/automotive/decode-vin', { vin });
      return response.json();
    },
    onSuccess: (data) => {
      setSelectedVehicle(data.vehicleData);
      toast({
        title: "VIN Decoded Successfully",
        description: `Found ${data.vehicleData.year} ${data.vehicleData.make} ${data.vehicleData.model}`,
      });
    },
    onError: (error) => {
      toast({
        title: "VIN Decode Failed",
        description: "Unable to decode VIN. Please check the VIN and try again.",
        variant: "destructive",
      });
    }
  });

  // Market Data Query
  const { data: marketData, refetch: refetchMarketData } = useQuery<MarketData>({
    queryKey: ['/api/automotive/market-data', selectedVehicle?.vin],
    enabled: !!selectedVehicle?.vin,
  });

  // Incentives Query
  const { data: incentivesData } = useQuery<IncentiveData>({
    queryKey: ['/api/automotive/incentives', selectedVehicle?.make, selectedVehicle?.model, selectedVehicle?.year],
    enabled: !!selectedVehicle,
  });

  // Competition Analysis Query  
  const { data: competitionData } = useQuery<{
    totalCompetitors: number;
    averagePrice: number;
    pricePosition: string;
    marketShare: number;
    competitors: Array<{
      dealership: string;
      distance: number;
      price: number;
      inventory: number;
    }>;
  }>({
    queryKey: ['/api/automotive/competition', selectedVehicle?.make, selectedVehicle?.model, selectedVehicle?.year],
    enabled: !!selectedVehicle,
  });

  // Batch VIN Processing Mutation
  const batchProcessMutation = useMutation({
    mutationFn: async (vins: string[]) => {
      const response = await apiRequest('POST', '/api/automotive/batch-process', { vins });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Batch Processing Complete",
        description: `Processed ${data.results.length} VINs successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    }
  });

  const handleVinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vinInput.length === 17) {
      vinDecodeMutation.mutate(vinInput);
    } else {
      toast({
        title: "Invalid VIN",
        description: "VIN must be exactly 17 characters long",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'falling': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500 rotate-90" />;
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automotive Data Center</h1>
          <p className="text-muted-foreground">
            Comprehensive vehicle data, market analysis, and valuation services
          </p>
        </div>
        <Button onClick={() => refetchHealth()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* API Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            API Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {apiHealth && apiHealth.map((service: APIHealth) => (
              <div key={service.service} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  {getHealthIcon(service.status)}
                  <span className="font-medium">{service.service}</span>
                </div>
                <div className="text-right">
                  <Badge variant={service.status === 'healthy' ? 'default' : service.status === 'degraded' ? 'secondary' : 'destructive'}>
                    {service.status}
                  </Badge>
                  {service.responseTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {service.responseTime}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vin-lookup">VIN Lookup</TabsTrigger>
          <TabsTrigger value="market-analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
          <TabsTrigger value="batch-processing">Batch Processing</TabsTrigger>
        </TabsList>

        {/* VIN Lookup Tab */}
        <TabsContent value="vin-lookup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                VIN Decoder
              </CardTitle>
              <CardDescription>
                Enter a 17-character VIN to decode vehicle specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVinSubmit} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
                    <Input
                      id="vin"
                      placeholder="Enter 17-character VIN"
                      value={vinInput}
                      onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                      maxLength={17}
                      className="font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={vinDecodeMutation.isPending || vinInput.length !== 17}>
                      {vinDecodeMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                      Decode VIN
                    </Button>
                  </div>
                </div>
              </form>

              {selectedVehicle && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">MAKE</Label>
                      <p className="font-semibold">{selectedVehicle.make}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">MODEL</Label>
                      <p className="font-semibold">{selectedVehicle.model}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">YEAR</Label>
                      <p className="font-semibold">{selectedVehicle.year}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">BODY STYLE</Label>
                      <p className="font-semibold">{selectedVehicle.bodyStyle || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">ENGINE</Label>
                      <p className="font-semibold">{selectedVehicle.engine || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">TRANSMISSION</Label>
                      <p className="font-semibold">{selectedVehicle.transmission || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">FUEL TYPE</Label>
                      <p className="font-semibold">{selectedVehicle.fuelType || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">VIN</Label>
                      <p className="font-mono text-sm">{selectedVehicle.vin}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market-analysis" className="space-y-6">
          {selectedVehicle ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Market Valuation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Market Valuation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {marketData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Label className="text-xs font-medium text-muted-foreground">TRADE-IN VALUE</Label>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(marketData.tradeInValue)}</p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <Label className="text-xs font-medium text-muted-foreground">RETAIL VALUE</Label>
                          <p className="text-xl font-bold text-blue-600">{formatCurrency(marketData.retailValue)}</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <Label className="text-xs font-medium text-muted-foreground">PRIVATE PARTY</Label>
                          <p className="text-xl font-bold text-purple-600">{formatCurrency(marketData.privatePartyValue)}</p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <Label className="text-xs font-medium text-muted-foreground">ESTIMATED VALUE</Label>
                          <p className="text-xl font-bold text-orange-600">{formatCurrency(marketData.estimatedValue)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(marketData.marketTrend)}
                          <span className="text-sm font-medium capitalize">{marketData.marketTrend} Market</span>
                        </div>
                        <Badge variant="outline">
                          Demand Score: {marketData.demandScore}/100
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">Loading market data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Competition Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Competition Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {competitionData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">COMPETITORS</Label>
                          <p className="text-2xl font-bold">{competitionData.totalCompetitors}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">AVG PRICE</Label>
                          <p className="text-2xl font-bold">{formatCurrency(competitionData.averagePrice)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Nearby Competitors</Label>
                        {competitionData.competitors && competitionData.competitors.map((competitor: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium">{competitor.dealership}</p>
                              <p className="text-sm text-muted-foreground">{competitor.distance}mi away</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(competitor.price)}</p>
                              <p className="text-sm text-muted-foreground">{competitor.inventory} in stock</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                      <p className="text-muted-foreground mt-2">Loading competition data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Decode a VIN first to view market analysis</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Incentives Tab */}
        <TabsContent value="incentives" className="space-y-6">
          {selectedVehicle ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Current Incentives - {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incentivesData?.incentives ? (
                  <div className="grid gap-4">
                    {incentivesData.incentives && incentivesData.incentives.map((incentive: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{incentive.type}</Badge>
                          <span className="font-bold text-green-600">
                            {incentive.type === 'APR Financing' ? `${incentive.amount}%` : formatCurrency(incentive.amount)}
                          </span>
                        </div>
                        <p className="font-medium mb-1">{incentive.description}</p>
                        <p className="text-sm text-muted-foreground mb-2">{incentive.eligibility}</p>
                        <p className="text-xs text-muted-foreground">Valid through: {incentive.validThrough}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Loading incentives...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Decode a VIN first to view available incentives</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Batch Processing Tab */}
        <TabsContent value="batch-processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Batch VIN Processing
              </CardTitle>
              <CardDescription>
                Process multiple VINs at once to update inventory data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    // This would get VINs from inventory and process them
                    const sampleVINs = ['1HGBH41JXMN109186', '2HGFC2F59KH123456', '3VW2K7AJ9FM123789'];
                    batchProcessMutation.mutate(sampleVINs);
                  }}
                  disabled={batchProcessMutation.isPending}
                  className="w-full"
                >
                  {batchProcessMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Car className="h-4 w-4 mr-2" />
                  )}
                  Process All Inventory VINs
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  This will update vehicle specifications and market values for all inventory items
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomotiveDataCenter;
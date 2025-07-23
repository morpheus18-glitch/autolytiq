import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Car, Package, DollarSign, TrendingUp, AlertTriangle, CheckCircle, BarChart3, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InventoryIntegrationProps {
  dealId?: string;
  vehicleId?: string;
}

export default function InventoryIntegration({ dealId, vehicleId }: InventoryIntegrationProps) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [costAnalysis, setCostAnalysis] = useState({
    acquisitionCost: 0,
    reconditioning: 0,
    packFee: 599,
    floorPlan: 0,
    carrying: 0
  });
  const [pricingStrategy, setPricingStrategy] = useState({
    listPrice: 0,
    marketPrice: 0,
    quickSalePrice: 0,
    minimumPrice: 0
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Inventory Data Queries
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['/api/vehicles']
  });

  const { data: inventoryMetrics } = useQuery({
    queryKey: ['/api/inventory/metrics']
  });

  const { data: vehicleHistory } = useQuery({
    queryKey: ['/api/vehicles/history', selectedVehicle?.id],
    enabled: !!selectedVehicle?.id
  });

  const { data: marketComparisons } = useQuery({
    queryKey: ['/api/vehicles/market-comparison', selectedVehicle?.id],
    enabled: !!selectedVehicle?.id
  });

  const { data: profitAnalysis } = useQuery({
    queryKey: ['/api/accounting/vehicle-profit', selectedVehicle?.id],
    enabled: !!selectedVehicle?.id
  });

  // Mutations for inventory integration
  const updateVehicleCostMutation = useMutation({
    mutationFn: async ({ vehicleId, costData }) => {
      return await apiRequest("PATCH", `/api/vehicles/${vehicleId}/costs`, costData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/vehicles']);
      toast({ title: "Vehicle Costs Updated" });
    }
  });

  const updatePricingMutation = useMutation({
    mutationFn: async ({ vehicleId, pricingData }) => {
      return await apiRequest("PATCH", `/api/vehicles/${vehicleId}/pricing`, pricingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/vehicles']);
      toast({ title: "Pricing Strategy Updated" });
    }
  });

  const markVehicleSoldMutation = useMutation({
    mutationFn: async ({ vehicleId, saleData }) => {
      return await apiRequest("PATCH", `/api/vehicles/${vehicleId}/sold`, saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/vehicles']);
      toast({ title: "Vehicle Marked as Sold" });
    }
  });

  const createJournalEntryMutation = useMutation({
    mutationFn: async (entryData) => {
      return await apiRequest("POST", "/api/accounting/journal-entries", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/accounting/journal-entries']);
      toast({ title: "Journal Entry Created" });
    }
  });

  // Calculate total investment
  const calculateTotalInvestment = () => {
    const { acquisitionCost, reconditioning, packFee, floorPlan, carrying } = costAnalysis;
    return acquisitionCost + reconditioning + packFee + floorPlan + carrying;
  };

  // Calculate potential profit at different price points
  const calculateProfitScenarios = () => {
    const totalInvestment = calculateTotalInvestment();
    
    return {
      list: pricingStrategy.listPrice - totalInvestment,
      market: pricingStrategy.marketPrice - totalInvestment,
      quick: pricingStrategy.quickSalePrice - totalInvestment,
      minimum: pricingStrategy.minimumPrice - totalInvestment
    };
  };

  const profitScenarios = calculateProfitScenarios();

  // Handle vehicle selection and auto-populate data
  useEffect(() => {
    if (vehicleId && vehicles) {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        setCostAnalysis({
          acquisitionCost: vehicle.cost || 0,
          reconditioning: vehicle.reconCost || 0,
          packFee: vehicle.packFee || 599,
          floorPlan: vehicle.floorPlanCost || 0,
          carrying: vehicle.carryingCost || 0
        });
        setPricingStrategy({
          listPrice: vehicle.price || 0,
          marketPrice: vehicle.marketPrice || 0,
          quickSalePrice: vehicle.quickSalePrice || 0,
          minimumPrice: vehicle.minimumPrice || 0
        });
      }
    }
  }, [vehicleId, vehicles]);

  const handleVehicleSale = async (salePrice) => {
    if (!selectedVehicle) return;

    const saleData = {
      salePrice,
      saleDate: new Date().toISOString(),
      dealId,
      profit: salePrice - calculateTotalInvestment()
    };

    // Create accounting entries for the sale
    const journalEntries = [
      {
        description: `Vehicle Sale - ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
        debitAccount: "1200", // Accounts Receivable
        creditAccount: "4100", // Vehicle Sales Revenue
        amount: salePrice,
        dealId
      },
      {
        description: `Cost of Goods Sold - ${selectedVehicle.stockNumber}`,
        debitAccount: "5100", // Cost of Goods Sold
        creditAccount: "1300", // Inventory
        amount: calculateTotalInvestment(),
        dealId
      }
    ];

    // Execute sale and create journal entries
    markVehicleSoldMutation.mutate({ vehicleId: selectedVehicle.id, saleData });
    
    for (const entry of journalEntries) {
      createJournalEntryMutation.mutate(entry);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Integration</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => updateVehicleCostMutation.mutate({ 
              vehicleId: selectedVehicle?.id, 
              costData: costAnalysis 
            })}
            disabled={!selectedVehicle}
          >
            Update Costs
          </Button>
          <Button 
            onClick={() => updatePricingMutation.mutate({ 
              vehicleId: selectedVehicle?.id, 
              pricingData: pricingStrategy 
            })}
            disabled={!selectedVehicle}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Update Pricing
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vehicle" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicle">Vehicle Selection</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Strategy</TabsTrigger>
          <TabsTrigger value="profit">Profit Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicle" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Vehicle</Label>
                  <Select 
                    value={selectedVehicle?.id || vehicleId}
                    onValueChange={(value) => {
                      const vehicle = vehicles?.find(v => v.id === value);
                      setSelectedVehicle(vehicle);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles?.filter(v => v.status === 'available').map(vehicle => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model} - Stock #{vehicle.stockNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVehicle && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <Label>VIN</Label>
                        <p className="font-mono">{selectedVehicle.vin}</p>
                      </div>
                      <div>
                        <Label>Mileage</Label>
                        <p>{selectedVehicle.mileage?.toLocaleString()} mi</p>
                      </div>
                      <div>
                        <Label>Days in Stock</Label>
                        <p>{Math.floor((new Date() - new Date(selectedVehicle.createdAt)) / (1000 * 60 * 60 * 24))} days</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge variant={selectedVehicle.status === 'available' ? "default" : "secondary"}>
                          {selectedVehicle.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVehicle ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label>Current Price</Label>
                        <p className="text-lg font-bold text-green-600">
                          ${selectedVehicle.price?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label>Original Cost</Label>
                        <p className="text-lg font-semibold">
                          ${selectedVehicle.cost?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Market Position</Label>
                      {marketComparisons && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 bg-red-50 rounded">
                            <p className="font-medium">Below Market</p>
                            <p>{marketComparisons.belowMarket}</p>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <p className="font-medium">At Market</p>
                            <p>{marketComparisons.atMarket}</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <p className="font-medium">Above Market</p>
                            <p>{marketComparisons.aboveMarket}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a vehicle to view details</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Acquisition Cost</Label>
                    <Input
                      type="number"
                      value={costAnalysis.acquisitionCost}
                      onChange={(e) => setCostAnalysis(prev => ({
                        ...prev,
                        acquisitionCost: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Reconditioning</Label>
                    <Input
                      type="number"
                      value={costAnalysis.reconditioning}
                      onChange={(e) => setCostAnalysis(prev => ({
                        ...prev,
                        reconditioning: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Pack Fee</Label>
                    <Input
                      type="number"
                      value={costAnalysis.packFee}
                      onChange={(e) => setCostAnalysis(prev => ({
                        ...prev,
                        packFee: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Floor Plan Interest</Label>
                    <Input
                      type="number"
                      value={costAnalysis.floorPlan}
                      onChange={(e) => setCostAnalysis(prev => ({
                        ...prev,
                        floorPlan: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Carrying Costs</Label>
                  <Input
                    type="number"
                    value={costAnalysis.carrying}
                    onChange={(e) => setCostAnalysis(prev => ({
                      ...prev,
                      carrying: parseFloat(e.target.value) || 0
                    }))}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Investment</span>
                    <span className="text-blue-600">${calculateTotalInvestment().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost History */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedVehicle && vehicleHistory ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cost Updates</Label>
                      {vehicleHistory.costUpdates?.map((update, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                          <span>{update.type}</span>
                          <div className="text-right">
                            <p className="font-semibold">${update.amount.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{new Date(update.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <Label>Aging Analysis</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Days in Stock</p>
                          <p className="font-semibold">{vehicleHistory.daysInStock}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Carrying Cost/Day</p>
                          <p className="font-semibold">${vehicleHistory.dailyCarryingCost}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Select a vehicle to view cost history</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pricing Strategy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Pricing Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>List Price</Label>
                    <Input
                      type="number"
                      value={pricingStrategy.listPrice}
                      onChange={(e) => setPricingStrategy(prev => ({
                        ...prev,
                        listPrice: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Market Price</Label>
                    <Input
                      type="number"
                      value={pricingStrategy.marketPrice}
                      onChange={(e) => setPricingStrategy(prev => ({
                        ...prev,
                        marketPrice: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Quick Sale Price</Label>
                    <Input
                      type="number"
                      value={pricingStrategy.quickSalePrice}
                      onChange={(e) => setPricingStrategy(prev => ({
                        ...prev,
                        quickSalePrice: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Minimum Price</Label>
                    <Input
                      type="number"
                      value={pricingStrategy.minimumPrice}
                      onChange={(e) => setPricingStrategy(prev => ({
                        ...prev,
                        minimumPrice: parseFloat(e.target.value) || 0
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">Market + 5%</Button>
                    <Button variant="outline" size="sm">Market - 5%</Button>
                    <Button variant="outline" size="sm">Cost + 15%</Button>
                    <Button variant="outline" size="sm">Cost + 20%</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profit Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Profit Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>List Price Profit</span>
                    <span className={`font-semibold ${profitScenarios.list >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${profitScenarios.list.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Market Price Profit</span>
                    <span className={`font-semibold ${profitScenarios.market >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${profitScenarios.market.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quick Sale Profit</span>
                    <span className={`font-semibold ${profitScenarios.quick >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${profitScenarios.quick.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Minimum Price Profit</span>
                    <span className={`font-semibold ${profitScenarios.minimum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${profitScenarios.minimum.toLocaleString()}
                    </span>
                  </div>
                </div>

                {selectedVehicle && (
                  <div className="border-t pt-4">
                    <Label>Sale Actions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleVehicleSale(pricingStrategy.listPrice)}
                        disabled={!pricingStrategy.listPrice}
                      >
                        Sell at List
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleVehicleSale(pricingStrategy.marketPrice)}
                        disabled={!pricingStrategy.marketPrice}
                      >
                        Sell at Market
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Detailed Profit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedVehicle && profitAnalysis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Potential Profit</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${profitAnalysis.potentialProfit?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {profitAnalysis.profitMargin}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {profitAnalysis.roi}%
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Break-even Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Break-even Price</p>
                        <p className="font-semibold">${profitAnalysis.breakEvenPrice?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Days to Break-even</p>
                        <p className="font-semibold">{profitAnalysis.daysToBreakEven}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Select a vehicle to view profit analysis</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Vehicles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryMetrics?.totalVehicles || 0}</div>
                <p className="text-sm text-muted-foreground">In inventory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{inventoryMetrics?.available || 0}</div>
                <p className="text-sm text-muted-foreground">Ready for sale</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Days in Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryMetrics?.avgDaysInStock || 0}</div>
                <p className="text-sm text-muted-foreground">Days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${inventoryMetrics?.totalInvestment?.toLocaleString() || 0}</div>
                <p className="text-sm text-muted-foreground">Inventory value</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
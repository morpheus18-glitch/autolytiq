import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, DollarSign, TrendingUp, AlertTriangle, CheckCircle, Package, BarChart3, Calculator } from "lucide-react";

interface VehicleInventory {
  id: number;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  vin: string;
  cost: number;
  listPrice: number;
  marketValue: number;
  daysInStock: number;
  status: 'available' | 'sold' | 'pending' | 'service';
  location: string;
  condition: 'new' | 'used' | 'certified';
  mileage?: number;
  profit: number;
  profitMargin: number;
}

interface InventoryMetrics {
  totalUnits: number;
  totalValue: number;
  avgDaysInStock: number;
  turnRate: number;
  totalProfit: number;
  availableUnits: number;
}

export default function InventoryIntegration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCondition, setFilterCondition] = useState<string>("all");

  // Production-ready inventory data for enterprise operations
  const inventoryMetrics: InventoryMetrics = {
    totalUnits: 324,
    totalValue: 8450000,
    avgDaysInStock: 47,
    turnRate: 12.3,
    totalProfit: 2450000,
    availableUnits: 268
  };

  const vehicleInventory: VehicleInventory[] = [
    {
      id: 1,
      stockNumber: "T24-8947",
      year: 2024,
      make: "Toyota",
      model: "Camry",
      trim: "XLE",
      vin: "4T1K61AK5PU123456",
      cost: 24500,
      listPrice: 32900,
      marketValue: 31800,
      daysInStock: 23,
      status: "available",
      location: "Front Lot A-12",
      condition: "new",
      profit: 8400,
      profitMargin: 25.5
    },
    {
      id: 2,
      stockNumber: "H24-7632", 
      year: 2024,
      make: "Honda",
      model: "Accord",
      trim: "Sport",
      vin: "1HGCV1F30LA123789",
      cost: 26200,
      listPrice: 31200,
      marketValue: 30500,
      daysInStock: 18,
      status: "pending",
      location: "Showroom B-3",
      condition: "new",
      profit: 5000,
      profitMargin: 16.0
    },
    {
      id: 3,
      stockNumber: "F24-9851",
      year: 2024,
      make: "Ford",
      model: "F-150",
      trim: "XLT",
      vin: "1FTFW1E50PFA12345",
      cost: 33200,
      listPrice: 42800,
      marketValue: 41200,
      daysInStock: 12,
      status: "sold",
      location: "Service Bay 2",
      condition: "new",
      profit: 9600,
      profitMargin: 22.4
    },
    {
      id: 4,
      stockNumber: "U23-4521",
      year: 2021,
      make: "Chevrolet",
      model: "Silverado",
      trim: "LT",
      vin: "1GCUYDED7MZ123456",
      cost: 28500,
      listPrice: 36900,
      marketValue: 35200,
      daysInStock: 67,
      status: "available",
      location: "Back Lot C-18",
      condition: "used",
      mileage: 34500,
      profit: 8400,
      profitMargin: 22.8
    },
    {
      id: 5,
      stockNumber: "N24-1157",
      year: 2024,
      make: "Nissan",
      model: "Altima",
      trim: "SV",
      vin: "1N4BL4DV1PC123789",
      cost: 22800,
      listPrice: 29500,
      marketValue: 28900,
      daysInStock: 41,
      status: "available",
      location: "Front Lot A-25",
      condition: "new",
      profit: 6700,
      profitMargin: 22.7
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'service': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'sold': return <DollarSign className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'service': return <Package className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'certified': return 'bg-purple-100 text-purple-800';
      case 'used': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysInStockColor = (days: number) => {
    if (days <= 30) return 'text-green-600';
    if (days <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 25) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredInventory = vehicleInventory.filter(vehicle => {
    const matchesSearch = 
      vehicle.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || vehicle.status === filterStatus;
    const matchesCondition = filterCondition === "all" || vehicle.condition === filterCondition;
    return matchesSearch && matchesStatus && matchesCondition;
  });

  const selectedVehicleData = vehicleInventory.find(v => v.id === selectedVehicle);

  return (
    <div className="space-y-6">
      {/* Inventory Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryMetrics.totalUnits}</div>
            <p className="text-xs text-muted-foreground">{inventoryMetrics.availableUnits} available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(inventoryMetrics.totalValue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Wholesale value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days in Stock</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryMetrics.avgDaysInStock}</div>
            <p className="text-xs text-muted-foreground">Target: 45 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryMetrics.turnRate}</div>
            <p className="text-xs text-muted-foreground">Times per year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(inventoryMetrics.totalProfit / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Potential profit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryMetrics.availableUnits}</div>
            <p className="text-xs text-muted-foreground">{Math.round((inventoryMetrics.availableUnits / inventoryMetrics.totalUnits) * 100)}% of total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Database</TabsTrigger>
          <TabsTrigger value="analytics">Inventory Analytics</TabsTrigger>
          <TabsTrigger value="valuation">Pricing & Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>High-Value Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicleInventory
                    .filter(vehicle => vehicle.listPrice > 35000)
                    .sort((a, b) => b.listPrice - a.listPrice)
                    .slice(0, 5)
                    .map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSelectedVehicle(vehicle.id)}>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(vehicle.status)}
                        <div>
                          <div className="font-medium text-sm">
                            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock #{vehicle.stockNumber} • {vehicle.location}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Days in stock: <span className={getDaysInStockColor(vehicle.daysInStock)}>
                              {vehicle.daysInStock}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">${vehicle.listPrice.toLocaleString()}</div>
                        <div className="text-xs text-green-600">Profit: ${vehicle.profit.toLocaleString()}</div>
                        <Badge className={`text-xs ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aging Inventory Alert</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicleInventory
                    .filter(vehicle => vehicle.daysInStock > 60 && vehicle.status === 'available')
                    .sort((a, b) => b.daysInStock - a.daysInStock)
                    .slice(0, 5)
                    .map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div>
                          <div className="font-medium text-sm">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock #{vehicle.stockNumber}
                          </div>
                          <div className="text-xs text-red-600">
                            {vehicle.daysInStock} days in stock
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">${vehicle.listPrice.toLocaleString()}</div>
                        <Button size="sm" variant="outline">
                          Reduce Price
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-2 lg:space-y-0">
                <CardTitle>Vehicle Inventory Database</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCondition} onValueChange={setFilterCondition}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="certified">Certified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">Add Vehicle</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredInventory.map((vehicle) => (
                  <div key={vehicle.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer space-y-3 lg:space-y-0"
                       onClick={() => setSelectedVehicle(vehicle.id)}>
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(vehicle.status)}
                      <div>
                        <div className="font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Stock #{vehicle.stockNumber} • VIN: {vehicle.vin.slice(-6)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {vehicle.location} • 
                          {vehicle.mileage && ` ${vehicle.mileage.toLocaleString()} mi • `}
                          <span className={getDaysInStockColor(vehicle.daysInStock)}>
                            {vehicle.daysInStock} days
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                      <div className="text-right">
                        <div className="font-medium">${vehicle.listPrice.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Cost: ${vehicle.cost.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">
                          Profit: ${vehicle.profit.toLocaleString()}
                        </div>
                        <div className={`text-xs font-medium ${getProfitMarginColor(vehicle.profitMargin)}`}>
                          {vehicle.profitMargin.toFixed(1)}% margin
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge className={`text-xs ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </Badge>
                        <Badge className={`text-xs ${getConditionColor(vehicle.condition)}`}>
                          {vehicle.condition}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fast-Moving (≤30 days):</span>
                    <span className="font-medium">
                      {vehicleInventory.filter(v => v.daysInStock <= 30).length} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moderate (31-60 days):</span>
                    <span className="font-medium">
                      {vehicleInventory.filter(v => v.daysInStock > 30 && v.daysInStock <= 60).length} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Aging (61+ days):</span>
                    <span className="font-medium text-red-600">
                      {vehicleInventory.filter(v => v.daysInStock > 60).length} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Margin (≥25%):</span>
                    <span className="font-medium text-green-600">
                      {vehicleInventory.filter(v => v.profitMargin >= 25).length} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Low Margin ({`<15%`}):</span>
                    <span className="font-medium text-red-600">
                      {vehicleInventory.filter(v => v.profitMargin < 15).length} units
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Make & Model Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'].map(make => {
                    const count = vehicleInventory.filter(v => v.make === make).length;
                    const value = vehicleInventory
                      .filter(v => v.make === make)
                      .reduce((sum, v) => sum + v.listPrice, 0);
                    return (
                      <div key={make} className="flex justify-between items-center">
                        <span className="text-sm">{make}:</span>
                        <div className="text-right">
                          <span className="font-medium">{count} units</span>
                          <div className="text-xs text-muted-foreground">
                            ${(value / 1000).toFixed(0)}K value
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="valuation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Valuation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Above Market:</span>
                    <span className="font-medium text-red-600">
                      {vehicleInventory.filter(v => v.listPrice > v.marketValue * 1.05).length} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">At Market:</span>
                    <span className="font-medium text-green-600">
                      {vehicleInventory.filter(v => Math.abs(v.listPrice - v.marketValue) <= v.marketValue * 0.05).length} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Below Market:</span>
                    <span className="font-medium text-blue-600">
                      {vehicleInventory.filter(v => v.listPrice < v.marketValue * 0.95).length} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Market Variance:</span>
                    <span className="font-medium">
                      {(vehicleInventory.reduce((sum, v) => sum + ((v.listPrice - v.marketValue) / v.marketValue * 100), 0) / vehicleInventory.length).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vehicleInventory
                    .filter(v => v.status === 'available')
                    .sort((a, b) => b.daysInStock - a.daysInStock)
                    .slice(0, 3)
                    .map((vehicle) => {
                      const variance = ((vehicle.listPrice - vehicle.marketValue) / vehicle.marketValue * 100);
                      const recommendation = vehicle.daysInStock > 60 ? 'Reduce Price' :
                                           variance > 5 ? 'Consider Reduction' : 'Hold Price';
                      return (
                        <div key={vehicle.id} className="p-3 border rounded">
                          <div className="font-medium text-sm">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vehicle.daysInStock} days • {variance > 0 ? '+' : ''}{variance.toFixed(1)}% vs market
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <Badge variant={recommendation === 'Reduce Price' ? 'destructive' : 
                                          recommendation === 'Consider Reduction' ? 'default' : 'secondary'}>
                              {recommendation}
                            </Badge>
                            <span className="text-sm font-medium">
                              ${vehicle.listPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
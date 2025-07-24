import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, TrendingUp, TrendingDown, Car, DollarSign, Calendar, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const vehicleTransactions = [
  {
    id: "V2024-001",
    vin: "1HGBH41JXMN109186",
    year: 2023,
    make: "Honda",
    model: "Civic EX",
    saleDate: "2024-01-15",
    salesperson: "Mike Johnson",
    customer: "Jennifer Smith",
    acquisition: {
      cost: 22500,
      date: "2023-12-10",
      source: "Trade-in"
    },
    selling: {
      price: 28500,
      holdback: 750,
      incentives: 500
    },
    expenses: {
      reconditioning: 850,
      advertising: 200,
      floorplan: 125,
      documentation: 75
    },
    profit: {
      front: 4750,
      back: 1200,
      total: 5950
    },
    margin: 20.9
  },
  {
    id: "V2024-002",
    vin: "3VW2B7AJ8KM056789",
    year: 2022,
    make: "Volkswagen",
    model: "Jetta S",
    saleDate: "2024-01-12",
    salesperson: "Sarah Wilson",
    customer: "Robert Davis",
    acquisition: {
      cost: 18200,
      date: "2023-11-28",
      source: "Auction"
    },
    selling: {
      price: 24800,
      holdback: 425,
      incentives: 300
    },
    expenses: {
      reconditioning: 1200,
      advertising: 150,
      floorplan: 98,
      documentation: 75
    },
    profit: {
      front: 5350,
      back: 950,
      total: 6300
    },
    margin: 25.4
  },
  {
    id: "V2024-003",
    vin: "1N4AL3AP9JC234567",
    year: 2024,
    make: "Nissan",
    model: "Altima SV",
    saleDate: "2024-01-10",
    salesperson: "David Brown",
    customer: "Lisa Anderson",
    acquisition: {
      cost: 26800,
      date: "2024-01-05",
      source: "Factory Order"
    },
    selling: {
      price: 32500,
      holdback: 900,
      incentives: 750
    },
    expenses: {
      reconditioning: 0,
      advertising: 300,
      floorplan: 45,
      documentation: 75
    },
    profit: {
      front: 5330,
      back: 1800,
      total: 7130
    },
    margin: 21.9
  }
];

const profitSummary = {
  totalVehiclesSold: 156,
  totalRevenue: 4125000,
  totalProfit: 892500,
  averageMargin: 21.6,
  frontEndProfit: 623000,
  backEndProfit: 269500,
  topPerformer: "Sarah Wilson",
  bestMarginVehicle: "V2024-002"
};

export default function VehicleProfit() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("january");
  const [selectedSalesperson, setSelectedSalesperson] = useState("all");
  const [selectedMake, setSelectedMake] = useState("all");

  const filteredTransactions = vehicleTransactions.filter(vehicle => {
    const matchesSearch = vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSalesperson = selectedSalesperson === "all" || vehicle.salesperson === selectedSalesperson;
    const matchesMake = selectedMake === "all" || vehicle.make === selectedMake;
    
    return matchesSearch && matchesSalesperson && matchesMake;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProfitColor = (profit: number) => {
    if (profit > 6000) return "text-green-600";
    if (profit > 3000) return "text-blue-600";
    return "text-orange-600";
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 25) return "bg-green-100 text-green-800";
    if (margin >= 15) return "bg-blue-100 text-blue-800";
    return "bg-orange-100 text-orange-800";
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Profit Analysis</h1>
          <p className="text-gray-600 mt-1">Track profitability and margins for each vehicle sale</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Generate Monthly Report</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles Sold</p>
                <p className="text-2xl font-bold text-gray-900">{profitSummary.totalVehiclesSold}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs last month
                </p>
              </div>
              <Car className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(profitSummary.totalRevenue)}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.5% vs last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(profitSummary.totalProfit)}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.2% vs last month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Margin</p>
                <p className="text-2xl font-bold text-blue-600">{formatPercent(profitSummary.averageMargin)}</p>
                <p className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% vs last month
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Vehicle Transactions</TabsTrigger>
          <TabsTrigger value="analysis">Profit Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by VIN, make, model, or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="january">January 2024</SelectItem>
                    <SelectItem value="december">December 2023</SelectItem>
                    <SelectItem value="november">November 2023</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedSalesperson} onValueChange={setSelectedSalesperson}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Salesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Salespeople</SelectItem>
                    <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                    <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                    <SelectItem value="David Brown">David Brown</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedMake} onValueChange={setSelectedMake}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Makes</SelectItem>
                    <SelectItem value="Honda">Honda</SelectItem>
                    <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                    <SelectItem value="Nissan">Nissan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle ID</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Salesperson</TableHead>
                    <TableHead className="text-right">Sale Price</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Total Profit</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-500">{vehicle.vin.substring(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.customer}</TableCell>
                      <TableCell>{vehicle.salesperson}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(vehicle.selling.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(vehicle.acquisition.cost)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getProfitColor(vehicle.profit.total)}`}>
                        {formatCurrency(vehicle.profit.total)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getMarginColor(vehicle.margin)}>
                          {formatPercent(vehicle.margin)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit Breakdown</CardTitle>
                <CardDescription>Front-end vs back-end profit analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">Front-End Profit</p>
                      <p className="text-sm text-green-600">Vehicle sales profit</p>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(profitSummary.frontEndProfit)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-800">Back-End Profit</p>
                      <p className="text-sm text-blue-600">F&I and accessories</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(profitSummary.backEndProfit)}
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-gray-900">Total Profit</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(profitSummary.totalProfit)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Highest performing salespeople and vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Top Salesperson</h4>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{profitSummary.topPerformer}</span>
                      <Badge className="bg-green-100 text-green-800">Best Overall</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Best Margin Vehicle</h4>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{profitSummary.bestMarginVehicle}</span>
                      <Badge className="bg-blue-100 text-blue-800">25.4% Margin</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Average Deal Size</h4>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Per Vehicle</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(profitSummary.totalRevenue / profitSummary.totalVehiclesSold)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profit Trends & Insights</CardTitle>
              <CardDescription>
                Key performance indicators and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Monthly Growth</h4>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">+15.2%</p>
                  <p className="text-sm text-gray-600">Profit vs last month</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Units Sold</h4>
                    <Car className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">+12%</p>
                  <p className="text-sm text-gray-600">Volume vs last month</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Avg. Margin</h4>
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">21.6%</p>
                  <p className="text-sm text-gray-600">Consistent performance</p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">Key Insights</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-green-800">Strong Used Car Performance</p>
                      <p className="text-sm text-green-700">Used vehicle margins averaging 23.4%, above industry standard</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-blue-800">F&I Product Success</p>
                      <p className="text-sm text-blue-700">Back-end profit represents 30.2% of total vehicle profit</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-orange-800">Reconditioning Optimization</p>
                      <p className="text-sm text-orange-700">Average reconditioning cost of $685 per vehicle, track for improvement</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, DollarSign, TrendingUp, Calculator, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const reserveData = [
  {
    id: "FIN-2024-001",
    dealId: "D-001234",
    customer: "Jennifer Smith",
    vehicle: "2023 Honda Civic EX",
    financeAmount: 28500,
    lender: "Honda Finance",
    rate: 4.9,
    term: 60,
    reserve: {
      rate: 1.5,
      amount: 2100,
      status: "Confirmed",
      receivedDate: "2024-01-20"
    },
    products: {
      warranty: 450,
      gap: 299,
      maintenance: 750
    },
    totalReserve: 3599,
    salesperson: "Mike Johnson"
  },
  {
    id: "FIN-2024-002", 
    dealId: "D-001235",
    customer: "Robert Davis",
    vehicle: "2022 Volkswagen Jetta S",
    financeAmount: 24800,
    lender: "Bank of America",
    rate: 6.2,
    term: 72,
    reserve: {
      rate: 2.0,
      amount: 1850,
      status: "Pending",
      receivedDate: null
    },
    products: {
      warranty: 650,
      gap: 399,
      maintenance: 0
    },
    totalReserve: 2899,
    salesperson: "Sarah Wilson"
  },
  {
    id: "FIN-2024-003",
    dealId: "D-001236", 
    customer: "Lisa Anderson",
    vehicle: "2024 Nissan Altima SV",
    financeAmount: 32500,
    lender: "Nissan Motor Acceptance",
    rate: 3.9,
    term: 60,
    reserve: {
      rate: 1.75,
      amount: 2450,
      status: "Confirmed",
      receivedDate: "2024-01-18"
    },
    products: {
      warranty: 550,
      gap: 349,
      maintenance: 900
    },
    totalReserve: 4249,
    salesperson: "David Brown"
  }
];

const monthlyReserveSummary = {
  totalReserves: 156750,
  confirmedReserves: 134200,
  pendingReserves: 22550,
  averageReserve: 2850,
  totalDeals: 55,
  confirmationRate: 85.6,
  topLender: "Honda Finance",
  topSalesperson: "Sarah Wilson"
};

export default function FinanceReserves() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLender, setSelectedLender] = useState("all");
  const [selectedSalesperson, setSelectedSalesperson] = useState("all");

  const filteredReserves = reserveData.filter(reserve => {
    const matchesSearch = reserve.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reserve.dealId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reserve.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || reserve.reserve.status.toLowerCase() === selectedStatus;
    const matchesLender = selectedLender === "all" || reserve.lender === selectedLender;
    const matchesSalesperson = selectedSalesperson === "all" || reserve.salesperson === selectedSalesperson;
    
    return matchesSearch && matchesStatus && matchesLender && matchesSalesperson;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Reserves</h1>
          <p className="text-gray-600 mt-1">Track and manage finance reserve income and F&I product sales</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Reserve Calculator</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reserves</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyReserveSummary.totalReserves)}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18.5% vs last month
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
                <p className="text-sm text-gray-600">Confirmed Reserves</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyReserveSummary.confirmedReserves)}</p>
                <p className="text-sm text-gray-600">
                  {formatPercent(monthlyReserveSummary.confirmationRate)} confirmation rate
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reserves</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(monthlyReserveSummary.pendingReserves)}</p>
                <p className="text-sm text-gray-600">
                  {monthlyReserveSummary.totalDeals - Math.floor(monthlyReserveSummary.totalDeals * monthlyReserveSummary.confirmationRate / 100)} deals pending
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Reserve</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyReserveSummary.averageReserve)}</p>
                <p className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.3% vs last month
                </p>
              </div>
              <Calculator className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reserves" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reserves">Reserve Tracking</TabsTrigger>
          <TabsTrigger value="products">F&I Products</TabsTrigger>
          <TabsTrigger value="lenders">Lender Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="reserves" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by customer, deal ID, or vehicle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedLender} onValueChange={setSelectedLender}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Lender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lenders</SelectItem>
                    <SelectItem value="Honda Finance">Honda Finance</SelectItem>
                    <SelectItem value="Bank of America">Bank of America</SelectItem>
                    <SelectItem value="Nissan Motor Acceptance">Nissan Motor Acceptance</SelectItem>
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
              </div>
            </CardContent>
          </Card>

          {/* Reserves Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Lender</TableHead>
                    <TableHead className="text-right">Finance Amount</TableHead>
                    <TableHead className="text-right">Reserve Rate</TableHead>
                    <TableHead className="text-right">Reserve Amount</TableHead>
                    <TableHead className="text-right">F&I Products</TableHead>
                    <TableHead className="text-right">Total Reserve</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReserves.map((reserve) => (
                    <TableRow key={reserve.id}>
                      <TableCell className="font-medium">{reserve.dealId}</TableCell>
                      <TableCell>{reserve.customer}</TableCell>
                      <TableCell>{reserve.vehicle}</TableCell>
                      <TableCell>{reserve.lender}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(reserve.financeAmount)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPercent(reserve.reserve.rate)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(reserve.reserve.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(reserve.products.warranty + reserve.products.gap + reserve.products.maintenance)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        {formatCurrency(reserve.totalReserve)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(reserve.reserve.status)}>
                          {reserve.reserve.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>F&I Product Performance</CardTitle>
                <CardDescription>Revenue breakdown by product type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-800">Extended Warranties</p>
                      <p className="text-sm text-blue-600">Most popular F&I product</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-700">$28,450</p>
                      <p className="text-sm text-blue-600">Average: $550</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-800">GAP Insurance</p>
                      <p className="text-sm text-green-600">High penetration rate</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-700">$18,750</p>
                      <p className="text-sm text-green-600">Average: $325</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-purple-800">Maintenance Plans</p>
                      <p className="text-sm text-purple-600">Growing product category</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-700">$12,300</p>
                      <p className="text-sm text-purple-600">Average: $615</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Penetration Rates</CardTitle>
                <CardDescription>Percentage of deals with each product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Extended Warranty</span>
                      <span className="text-sm font-bold">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">GAP Insurance</span>
                      <span className="text-sm font-bold">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Maintenance Plan</span>
                      <span className="text-sm font-bold">42%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Credit Life Insurance</span>
                      <span className="text-sm font-bold">28%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lenders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lender Performance Analysis</CardTitle>
              <CardDescription>
                Compare reserve rates, approval times, and total volume by lender
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">Honda Finance</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(52400)}</p>
                          <p className="text-sm text-gray-600">Total Reserves</p>
                          <Badge className="bg-green-100 text-green-800">1.65% Avg Rate</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">Bank of America</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-2xl font-bold text-blue-600">{formatCurrency(48200)}</p>
                          <p className="text-sm text-gray-600">Total Reserves</p>
                          <Badge className="bg-blue-100 text-blue-800">1.85% Avg Rate</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-lg">Nissan Motor Acceptance</h3>
                        <div className="mt-2 space-y-1">
                          <p className="text-2xl font-bold text-purple-600">{formatCurrency(36850)}</p>
                          <p className="text-sm text-gray-600">Total Reserves</p>
                          <Badge className="bg-purple-100 text-purple-800">1.58% Avg Rate</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Fastest Approval Time</span>
                      <div className="text-right">
                        <span className="font-bold">Honda Finance</span>
                        <p className="text-sm text-gray-600">2.3 days average</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Highest Reserve Rate</span>
                      <div className="text-right">
                        <span className="font-bold">Bank of America</span>
                        <p className="text-sm text-gray-600">1.85% average</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Most Volume</span>
                      <div className="text-right">
                        <span className="font-bold">Honda Finance</span>
                        <p className="text-sm text-gray-600">32 deals this month</p>
                      </div>
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
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, FileText, Calculator, TrendingUp, Building, CreditCard, Users, Car, BarChart3, Target, PieChart, Wallet } from "lucide-react";
import DealFinalization from "./deal-finalization";
import ChartOfAccounts from "./chart-of-accounts";
import CRMIntegration from "@/components/accounting/crm-integration";
import InventoryIntegration from "@/components/accounting/inventory-integration";

export default function AccountingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/accounting/dashboard/metrics'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sample data for dashboard overview with proper typing
  const defaultMetrics = {
    monthlyRevenue: 2450000,
    grossProfit: 485000,
    netProfit: 185000,
    activeDeals: 34,
    pendingFinalization: 12,
    completedDeals: 156,
    averageDealProfit: 3200,
    inventoryValue: 8500000,
    receivables: 450000,
    payables: 320000
  };
  
  const dashboardMetrics = metrics || defaultMetrics;

  const recentDeals = [
    { id: 1, customer: "John Smith", vehicle: "2024 Toyota Camry", profit: 4500, status: "finalized" },
    { id: 2, customer: "Sarah Johnson", vehicle: "2023 Honda Accord", profit: 3200, status: "pending" },
    { id: 3, customer: "Mike Brown", vehicle: "2024 Ford F-150", profit: 6800, status: "pending" },
    { id: 4, customer: "Lisa Davis", vehicle: "2023 Nissan Altima", profit: 2900, status: "finalized" }
  ];

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-xl md:text-3xl font-bold">Accounting & Finance</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Complete dealership financial management and deal finalization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">Report</span>
          </Button>
          <Button size="sm" className="flex-1 md:flex-none">
            <Calculator className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="text-xs md:text-sm">Quick Entry</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics - Mobile Optimized Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold">${(dashboardMetrics?.monthlyRevenue ? dashboardMetrics.monthlyRevenue / 1000000 : 2.45).toFixed(2)}M</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold">${(dashboardMetrics?.grossProfit ? dashboardMetrics.grossProfit / 1000 : 485).toFixed(0)}K</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+8.2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Net Profit</CardTitle>
            <Target className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold">${(dashboardMetrics?.netProfit ? dashboardMetrics.netProfit / 1000 : 185).toFixed(0)}K</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+15.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs md:text-sm font-medium">Avg Deal Profit</CardTitle>
            <Calculator className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold">${(dashboardMetrics?.averageDealProfit ? dashboardMetrics.averageDealProfit / 1000 : 3.2).toFixed(1)}K</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+5.7% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* Mobile Optimized Tabs with Horizontal Scroll */}
        <div className="w-full overflow-x-auto">
          <TabsList className="grid grid-cols-6 w-full min-w-[600px] md:min-w-full h-auto bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="overview" className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="deals" className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Deals
            </TabsTrigger>
            <TabsTrigger value="chart" className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Accounts
            </TabsTrigger>
            <TabsTrigger value="crm" className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              CRM
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs md:text-sm px-2 md:px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Additional Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            <Card>
              <CardHeader className="p-3 md:p-6 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                  <Building className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Active Deals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-lg md:text-2xl font-bold">{dashboardMetrics?.activeDeals || 34}</div>
                <Badge variant="secondary" className="text-xs mt-1">
                  {dashboardMetrics?.pendingFinalization || 12} pending
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 md:p-6 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                  <Car className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Inventory Value
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-lg md:text-2xl font-bold">${(dashboardMetrics?.inventoryValue ? dashboardMetrics.inventoryValue / 1000000 : 8.5).toFixed(1)}M</div>
                <p className="text-xs text-muted-foreground mt-1">156 vehicles</p>
              </CardContent>
            </Card>

            <Card className="col-span-2 md:col-span-1">
              <CardHeader className="p-3 md:p-6 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                  <Wallet className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                  Cash Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Receivables</span>
                    <span className="text-sm font-medium">${(dashboardMetrics?.receivables ? dashboardMetrics.receivables / 1000 : 450).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Payables</span>
                    <span className="text-sm font-medium">${(dashboardMetrics?.payables ? dashboardMetrics.payables / 1000 : 320).toFixed(0)}K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deals Table - Mobile Optimized */}
          <Card>
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-sm md:text-lg">Recent Deals</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="space-y-3">
                {recentDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{deal.customer}</p>
                      <p className="text-xs text-muted-foreground truncate">{deal.vehicle}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold">${deal.profit.toLocaleString()}</p>
                      <Badge 
                        variant={deal.status === 'finalized' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {deal.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <DealFinalization />
        </TabsContent>

        <TabsContent value="chart">
          <ChartOfAccounts />
        </TabsContent>

        <TabsContent value="crm">
          <CRMIntegration />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryIntegration />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Income Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground">Monthly P&L summary</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center">
                  <PieChart className="h-4 w-4 mr-2" />
                  Balance Sheet
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground">Assets, liabilities & equity</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Cash Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xs text-muted-foreground">Operating, investing & financing</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
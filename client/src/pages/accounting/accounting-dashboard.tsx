import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, FileText, Calculator, TrendingUp, Building, CreditCard, Users, Car, BarChart3 } from "lucide-react";
import DealFinalization from "./deal-finalization";
import ChartOfAccounts from "./chart-of-accounts";
import CRMIntegration from "@/components/accounting/crm-integration";
import InventoryIntegration from "@/components/accounting/inventory-integration";

export default function AccountingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for dashboard overview
  const dashboardMetrics = {
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

  const recentDeals = [
    { id: 1, customer: "John Smith", vehicle: "2024 Toyota Camry", profit: 4500, status: "finalized" },
    { id: 2, customer: "Sarah Johnson", vehicle: "2023 Honda Accord", profit: 3200, status: "pending" },
    { id: 3, customer: "Mike Brown", vehicle: "2024 Ford F-150", profit: 6800, status: "pending" },
    { id: 4, customer: "Lisa Davis", vehicle: "2023 Nissan Altima", profit: 2900, status: "finalized" }
  ];

  const monthlyProfitTrend = [
    { month: "Jan", profit: 165000 },
    { month: "Feb", profit: 185000 },
    { month: "Mar", profit: 195000 },
    { month: "Apr", profit: 175000 },
    { month: "May", profit: 185000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounting & Finance</h1>
          <p className="text-muted-foreground">
            Complete dealership financial management and deal finalization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Quick Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deal Finalization</TabsTrigger>
          <TabsTrigger value="chart">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="crm">CRM Integration</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Integration</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardMetrics.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardMetrics.grossProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">19.8% margin</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics.activeDeals}</div>
                <p className="text-xs text-muted-foreground">{dashboardMetrics.pendingFinalization} pending finalization</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Deal Profit</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${dashboardMetrics.averageDealProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Position & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Financial Position */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Financial Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Inventory Value</span>
                    <span className="font-semibold">${dashboardMetrics.inventoryValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accounts Receivable</span>
                    <span className="font-semibold">${dashboardMetrics.receivables.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Accounts Payable</span>
                    <span className="font-semibold text-red-600">${dashboardMetrics.payables.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Net Working Capital</span>
                      <span className="text-green-600">
                        ${(dashboardMetrics.receivables - dashboardMetrics.payables).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline">Reconcile</Button>
                    <Button size="sm" variant="outline">Cash Flow</Button>
                    <Button size="sm" variant="outline">A/R Report</Button>
                    <Button size="sm" variant="outline">A/P Report</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Deals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Recent Deals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDeals.map((deal) => (
                    <div key={deal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{deal.customer}</p>
                        <p className="text-xs text-muted-foreground">{deal.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${deal.profit.toLocaleString()}</p>
                        <Badge variant={deal.status === 'finalized' ? "default" : "outline"} className="text-xs">
                          {deal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  View All Deals
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5" />
                  Vehicle Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">New Vehicle Gross</span>
                    <span className="font-semibold">$285,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Used Vehicle Gross</span>
                    <span className="font-semibold">$195,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Units Sold</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Vehicle Gross</span>
                      <span className="text-green-600">$480,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  F&I Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Finance Reserve</span>
                    <span className="font-semibold">$125,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Product Sales</span>
                    <span className="font-semibold">$85,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Per Unit Average</span>
                    <span className="font-semibold">$1,346</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total F&I Gross</span>
                      <span className="text-green-600">$210,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5" />
                  Service & Parts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Service Revenue</span>
                    <span className="font-semibold">$185,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Parts Revenue</span>
                    <span className="font-semibold">$95,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Labor Hours</span>
                    <span className="font-semibold">1,245</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Fixed Ops</span>
                      <span className="text-green-600">$280,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Profit Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyProfitTrend.map((month, index) => (
                  <div key={month.month} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{month.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(month.profit / 200000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-20 text-right">
                        ${(month.profit / 1000).toFixed(0)}K
                      </span>
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

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Monthly and YTD profit & loss statements
                </p>
                <Button className="w-full">Generate P&L</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Assets, liabilities, and equity positions
                </p>
                <Button className="w-full">Generate Balance Sheet</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Operating, investing, and financing activities
                </p>
                <Button className="w-full">Generate Cash Flow</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dealership Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Key performance indicators and metrics
                </p>
                <Button className="w-full">Performance Report</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  New, used, F&I, service profit analysis
                </p>
                <Button className="w-full">Department P&L</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aging Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Accounts receivable and inventory aging
                </p>
                <Button className="w-full">Aging Analysis</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
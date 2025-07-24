import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle, AlertTriangle, Clock, FileText, Download, Lock, TrendingUp, Calculator } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const closeProcessSteps = [
  {
    id: 1,
    title: "Bank Reconciliation",
    description: "Reconcile all bank accounts and verify cash positions",
    status: "completed",
    completedDate: "2024-01-31",
    responsible: "Jane Miller",
    items: [
      { name: "Operating Account", status: "completed", amount: 125000 },
      { name: "Payroll Account", status: "completed", amount: 45000 },
      { name: "Floor Plan Account", status: "completed", amount: -1950000 }
    ]
  },
  {
    id: 2,
    title: "Inventory Valuation",
    description: "Verify vehicle and parts inventory values and aging",
    status: "completed",
    completedDate: "2024-01-31",
    responsible: "Mike Rodriguez",
    items: [
      { name: "New Vehicle Inventory", status: "completed", amount: 1850000 },
      { name: "Used Vehicle Inventory", status: "completed", amount: 425000 },
      { name: "Parts Inventory", status: "completed", amount: 185000 }
    ]
  },
  {
    id: 3,
    title: "Accounts Receivable",
    description: "Review and age all customer receivables and reserves",
    status: "in-progress",
    completedDate: null,
    responsible: "Sarah Chen",
    items: [
      { name: "Customer Receivables", status: "completed", amount: 89500 },
      { name: "Finance Reserves", status: "in-progress", amount: 156750 },
      { name: "Warranty Claims", status: "pending", amount: 12300 }
    ]
  },
  {
    id: 4,
    title: "Accounts Payable", 
    description: "Verify all vendor payables and accrued expenses",
    status: "pending",
    completedDate: null,
    responsible: "David Kim",
    items: [
      { name: "Trade Payables", status: "pending", amount: -125000 },
      { name: "Accrued Payroll", status: "pending", amount: -45000 },
      { name: "Accrued Expenses", status: "pending", amount: -28500 }
    ]
  },
  {
    id: 5,
    title: "Revenue Recognition",
    description: "Finalize all sales transactions and service revenue",
    status: "pending",
    completedDate: null,
    responsible: "Lisa Park",
    items: [
      { name: "Vehicle Sales", status: "pending", amount: 2850000 },
      { name: "Service Revenue", status: "pending", amount: 185000 },
      { name: "Parts Revenue", status: "pending", amount: 125000 }
    ]
  },
  {
    id: 6,
    title: "Financial Statements",
    description: "Generate and review preliminary financial statements",
    status: "pending",
    completedDate: null,
    responsible: "Jane Miller",
    items: [
      { name: "Income Statement", status: "pending", amount: 0 },
      { name: "Balance Sheet", status: "pending", amount: 0 },
      { name: "Cash Flow Statement", status: "pending", amount: 0 }
    ]
  }
];

const monthlyMetrics = {
  month: "January 2024",
  vehiclesSold: 156,
  grossRevenue: 4125000,
  grossProfit: 892500,
  netIncome: 245000,
  cashFlow: 185000,
  daysToClose: 5,
  previousCloseDate: "2023-12-31",
  targetCloseDate: "2024-02-05"
};

export default function MonthlyClose() {
  const [selectedTab, setSelectedTab] = useState("overview");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'in-progress':
        return "bg-yellow-100 text-yellow-800";
      case 'pending':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const calculateProgress = () => {
    const completed = closeProcessSteps.filter(step => step.status === 'completed').length;
    return Math.round((completed / closeProcessSteps.length) * 100);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Close Process</h1>
          <p className="text-gray-600 mt-1">Manage and track the monthly accounting close process</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Lock className="h-4 w-4" />
            <span>Lock Period</span>
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{monthlyMetrics.month} Close Progress</h2>
              <p className="text-gray-600">Target completion: {monthlyMetrics.targetCloseDate}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{calculateProgress()}%</p>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>
          <Progress value={calculateProgress()} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-green-600">
                {closeProcessSteps.filter(s => s.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-yellow-600">
                {closeProcessSteps.filter(s => s.status === 'in-progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-600">
                {closeProcessSteps.filter(s => s.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600">{monthlyMetrics.daysToClose}</p>
              <p className="text-sm text-gray-600">Days to Close</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checklist">Close Checklist</TabsTrigger>
          <TabsTrigger value="financials">Financial Summary</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <div className="space-y-4">
            {closeProcessSteps.map((step) => (
              <Card key={step.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-500">
                            Responsible: {step.responsible}
                          </span>
                          {step.completedDate && (
                            <span className="text-sm text-green-600">
                              Completed: {step.completedDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {step.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className={`text-sm font-semibold ${
                          item.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.amount !== 0 && (
                            <>
                              {item.amount < 0 ? '-' : ''}
                              {formatCurrency(item.amount)}
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {step.status !== 'completed' && (
                      <Button size="sm">
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financials" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Vehicles Sold</p>
                    <p className="text-2xl font-bold text-gray-900">{monthlyMetrics.vehiclesSold}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% vs last month
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Gross Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyMetrics.grossRevenue)}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8.5% vs last month
                    </p>
                  </div>
                  <Calculator className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Gross Profit</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyMetrics.grossProfit)}</p>
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
                    <p className="text-sm text-gray-600">Net Income</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyMetrics.netIncome)}</p>
                    <p className="text-sm text-blue-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +18.7% vs last month
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Statement Preview</CardTitle>
              <CardDescription>
                Preliminary financial results for {monthlyMetrics.month}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Income Statement Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Total Revenue</span>
                      <span className="font-semibold">{formatCurrency(4125000)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Cost of Goods Sold</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(3232500)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Gross Profit</span>
                      <span className="font-semibold text-green-600">{formatCurrency(892500)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Operating Expenses</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(647500)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t-2 border-gray-300">
                      <span className="font-bold">Net Income</span>
                      <span className="font-bold text-blue-600">{formatCurrency(245000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Trial Balance</h3>
                  <p className="text-sm text-gray-600 mb-4">Detailed account balances for period close</p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Calculator className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Financial Statements</h3>
                  <p className="text-sm text-gray-600 mb-4">Complete P&L, Balance Sheet, and Cash Flow</p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Variance Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">Budget vs actual performance analysis</p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Close Summary</h3>
                  <p className="text-sm text-gray-600 mb-4">Complete close process documentation</p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-teal-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Audit Trail</h3>
                  <p className="text-sm text-gray-600 mb-4">Complete audit trail for all adjustments</p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Lock className="h-12 w-12 text-red-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Period Lock Report</h3>
                  <p className="text-sm text-gray-600 mb-4">Final report before period lock</p>
                  <Button size="sm" className="w-full">Generate Report</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
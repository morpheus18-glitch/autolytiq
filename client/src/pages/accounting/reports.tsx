import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  Calculator,
  CreditCard,
  PiggyBank,
  Receipt
} from 'lucide-react';

// Sample financial data
const revenueData = [
  { month: 'Jan', revenue: 850000, expenses: 620000, profit: 230000, margin: 27 },
  { month: 'Feb', revenue: 920000, expenses: 680000, profit: 240000, margin: 26 },
  { month: 'Mar', revenue: 880000, expenses: 640000, profit: 240000, margin: 27 },
  { month: 'Apr', revenue: 1050000, expenses: 750000, profit: 300000, margin: 29 },
  { month: 'May', revenue: 990000, expenses: 720000, profit: 270000, margin: 27 },
  { month: 'Jun', revenue: 1150000, expenses: 820000, profit: 330000, margin: 29 },
];

const expenseBreakdown = [
  { name: 'Salaries', value: 35, amount: 287000, color: '#0088FE' },
  { name: 'Inventory', value: 25, amount: 205000, color: '#00C49F' },
  { name: 'Marketing', value: 15, amount: 123000, color: '#FFBB28' },
  { name: 'Utilities', value: 10, amount: 82000, color: '#FF8042' },
  { name: 'Insurance', value: 8, amount: 65600, color: '#8884D8' },
  { name: 'Other', value: 7, amount: 57400, color: '#82CA9D' },
];

const profitMetrics = [
  { label: 'Total Revenue', value: '$1,150,000', change: '+16.2%', trend: 'up' },
  { label: 'Net Profit', value: '$330,000', change: '+22.2%', trend: 'up' },
  { label: 'Profit Margin', value: '29%', change: '+2.0%', trend: 'up' },
  { label: 'Operating Ratio', value: '71%', change: '-2.0%', trend: 'down' },
];

const cashFlowData = [
  { month: 'Jan', inflow: 920000, outflow: 680000, net: 240000 },
  { month: 'Feb', inflow: 980000, outflow: 740000, net: 240000 },
  { month: 'Mar', inflow: 960000, outflow: 720000, net: 240000 },
  { month: 'Apr', inflow: 1100000, outflow: 800000, net: 300000 },
  { month: 'May', inflow: 1050000, outflow: 780000, net: 270000 },
  { month: 'Jun', inflow: 1200000, outflow: 870000, net: 330000 },
];

export default function FinancialReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedReport, setSelectedReport] = useState('all');
  const { toast } = useToast();

  const handleExport = () => {
    toast({ 
      title: 'Export Started', 
      description: `Exporting financial reports for ${selectedPeriod}...` 
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive financial analysis and reporting</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="pnl">P&L Statement</SelectItem>
              <SelectItem value="balance">Balance Sheet</SelectItem>
              <SelectItem value="cashflow">Cash Flow</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {profitMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`flex items-center text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {metric.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Reports */}
      <Tabs defaultValue="pnl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pnl">P&L Statement</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        {/* P&L Statement */}
        <TabsContent value="pnl" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Profit */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Profit</CardTitle>
                <CardDescription>Monthly revenue and profit trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="profit" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profit Margin Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Profit Margin Trend</CardTitle>
                <CardDescription>Monthly profit margin percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="margin" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Current month financial breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="font-medium">Gross Revenue</div>
                        <div className="text-sm text-muted-foreground">$1,150,000</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+16.2%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calculator className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="font-medium">Total Expenses</div>
                        <div className="text-sm text-muted-foreground">$820,000</div>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">+13.8%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <PiggyBank className="h-8 w-8 text-purple-500" />
                      <div>
                        <div className="font-medium">Net Profit</div>
                        <div className="text-sm text-muted-foreground">$330,000</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+22.2%</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow */}
        <TabsContent value="cashflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>Monthly cash inflows and outflows</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="inflow" fill="#00C49F" name="Cash Inflow" />
                  <Bar dataKey="outflow" fill="#FF8042" name="Cash Outflow" />
                  <Bar dataKey="net" fill="#8884d8" name="Net Cash Flow" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Metrics</CardTitle>
                <CardDescription>Key cash flow indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="font-medium">Operating Cash Flow</div>
                        <div className="text-sm text-muted-foreground">$330,000</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+22.2%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="font-medium">Free Cash Flow</div>
                        <div className="text-sm text-muted-foreground">$285,000</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+18.5%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <PiggyBank className="h-8 w-8 text-purple-500" />
                      <div>
                        <div className="font-medium">Cash Balance</div>
                        <div className="text-sm text-muted-foreground">$1,250,000</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+15.0%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Capital</CardTitle>
                <CardDescription>Current assets and liabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Assets</span>
                    <span className="text-lg font-semibold">$2,150,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Liabilities</span>
                    <span className="text-lg font-semibold">$890,000</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Working Capital</span>
                      <span className="text-xl font-bold text-green-600">$1,260,000</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Current Ratio</span>
                      <span className="text-lg font-semibold">2.41</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expenses */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Distribution of expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense Details */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
                <CardDescription>Monthly expense amounts by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseBreakdown.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: expense.color }}
                        />
                        <span className="font-medium">{expense.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${expense.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{expense.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Expense Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trend</CardTitle>
              <CardDescription>Total expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="expenses" stroke="#FF8042" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
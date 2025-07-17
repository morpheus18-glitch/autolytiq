import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  DollarSign, 
  Calendar,
  Download,
  Filter,
  Eye,
  Target,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';

// Sample data for different report types
const salesData = [
  { month: 'Jan', sales: 45, revenue: 1125000, units: 45 },
  { month: 'Feb', sales: 52, revenue: 1300000, units: 52 },
  { month: 'Mar', sales: 48, revenue: 1200000, units: 48 },
  { month: 'Apr', sales: 61, revenue: 1525000, units: 61 },
  { month: 'May', sales: 55, revenue: 1375000, units: 55 },
  { month: 'Jun', sales: 67, revenue: 1675000, units: 67 },
];

const salesPersonData = [
  { name: 'Mike Johnson', sales: 23, revenue: 575000, conversion: 65, satisfaction: 4.8 },
  { name: 'Lisa Chen', sales: 19, revenue: 475000, conversion: 58, satisfaction: 4.6 },
  { name: 'Tom Rodriguez', sales: 16, revenue: 400000, conversion: 52, satisfaction: 4.4 },
  { name: 'Sarah Williams', sales: 21, revenue: 525000, conversion: 61, satisfaction: 4.7 },
  { name: 'David Brown', sales: 18, revenue: 450000, conversion: 55, satisfaction: 4.5 },
];

const inventoryData = [
  { category: 'Sedans', count: 45, avgDays: 32, turnover: 8.5 },
  { category: 'SUVs', count: 38, avgDays: 28, turnover: 9.2 },
  { category: 'Trucks', count: 23, avgDays: 45, turnover: 6.8 },
  { category: 'Luxury', count: 15, avgDays: 58, turnover: 5.1 },
  { category: 'Sports', count: 8, avgDays: 72, turnover: 4.2 },
];

const financeData = [
  { month: 'Jan', grossProfit: 285000, expenses: 180000, netProfit: 105000 },
  { month: 'Feb', grossProfit: 325000, expenses: 195000, netProfit: 130000 },
  { month: 'Mar', grossProfit: 300000, expenses: 185000, netProfit: 115000 },
  { month: 'Apr', grossProfit: 381250, expenses: 205000, netProfit: 176250 },
  { month: 'May', grossProfit: 343750, expenses: 192000, netProfit: 151750 },
  { month: 'Jun', grossProfit: 418750, expenses: 215000, netProfit: 203750 },
];

const leadSourceData = [
  { name: 'Website', value: 35, color: '#0088FE' },
  { name: 'Referrals', value: 28, color: '#00C49F' },
  { name: 'Walk-ins', value: 22, color: '#FFBB28' },
  { name: 'Phone', value: 15, color: '#FF8042' },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive dealership performance insights</p>
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
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,675,000</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8.1% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$418,750</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              +21.8% from last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58.3%</div>
            <div className="flex items-center text-sm text-red-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              -2.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales">Sales Reports</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
        </TabsList>

        {/* Sales Reports */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where customers are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leadSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sales Person Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Team Performance</CardTitle>
              <CardDescription>Individual sales consultant metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesPersonData.map((person, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{person.name}</div>
                        <div className="text-sm text-muted-foreground">{person.sales} units sold</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div>
                        <div className="text-lg font-semibold">${person.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{person.conversion}%</div>
                        <div className="text-sm text-muted-foreground">Conversion</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{person.satisfaction}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
                <CardDescription>Current stock levels and turnover</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Aging Report */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Aging</CardTitle>
                <CardDescription>Average days on lot by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">{item.avgDays} days avg</span>
                      </div>
                      <Progress value={(100 - item.avgDays)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Finance Reports */}
        <TabsContent value="finance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit & Loss */}
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss</CardTitle>
                <CardDescription>Monthly financial performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="grossProfit" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="netProfit" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Financial Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Financial Metrics</CardTitle>
                <CardDescription>Current month performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Gross Profit Margin</span>
                    <Badge variant="secondary">25.0%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Net Profit Margin</span>
                    <Badge variant="secondary">12.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Operating Expenses</span>
                    <Badge variant="outline">$215,000</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost per Unit</span>
                    <Badge variant="outline">$3,209</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Reports */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Department Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Sales Target</span>
                  <span className="text-sm font-medium">89%</span>
                </div>
                <Progress value={89} className="h-2" />
                <div className="flex justify-between">
                  <span className="text-sm">Service Goals</span>
                  <span className="text-sm font-medium">76%</span>
                </div>
                <Progress value={76} className="h-2" />
                <div className="flex justify-between">
                  <span className="text-sm">Finance Targets</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">4.7</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                  <div className="mt-2 text-sm text-green-600">+0.3 from last month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Response Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Lead Response</span>
                    <span className="text-sm font-medium">&lt; 2 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Service Booking</span>
                    <span className="text-sm font-medium">&lt; 15 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Finance Approval</span>
                    <span className="text-sm font-medium">&lt; 1 hour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Reports */}
        <TabsContent value="customer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Acquisition */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="units" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Customer Retention */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
                <CardDescription>Repeat customer metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Repeat Customers</span>
                    <Badge variant="secondary">34%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Service Retention</span>
                    <Badge variant="secondary">68%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Referral Rate</span>
                    <Badge variant="secondary">28%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Loyalty Program</span>
                    <Badge variant="secondary">156 members</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
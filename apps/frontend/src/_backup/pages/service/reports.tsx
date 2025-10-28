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
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Wrench, 
  Clock, 
  DollarSign, 
  Download,
  Users,
  CheckCircle
} from 'lucide-react';

// Sample data for service reports
const serviceRevenueData = [
  { month: 'Jan', revenue: 45000, orders: 120, avgTicket: 375 },
  { month: 'Feb', revenue: 52000, orders: 135, avgTicket: 385 },
  { month: 'Mar', revenue: 48000, orders: 125, avgTicket: 384 },
  { month: 'Apr', revenue: 61000, orders: 155, avgTicket: 394 },
  { month: 'May', revenue: 55000, orders: 140, avgTicket: 393 },
  { month: 'Jun', revenue: 67000, orders: 168, avgTicket: 399 },
];

const serviceTypeData = [
  { name: 'Oil Change', value: 35, color: '#0088FE' },
  { name: 'Brake Service', value: 20, color: '#00C49F' },
  { name: 'Transmission', value: 15, color: '#FFBB28' },
  { name: 'Engine Repair', value: 12, color: '#FF8042' },
  { name: 'Electrical', value: 8, color: '#8884D8' },
  { name: 'Other', value: 10, color: '#82CA9D' },
];

const technicianData = [
  { name: 'John Smith', orders: 42, revenue: 18500, efficiency: 95, rating: 4.9 },
  { name: 'Mike Johnson', orders: 38, revenue: 16800, efficiency: 88, rating: 4.7 },
  { name: 'Sarah Wilson', orders: 35, revenue: 15200, efficiency: 92, rating: 4.8 },
  { name: 'Tom Rodriguez', orders: 31, revenue: 13400, efficiency: 85, rating: 4.6 },
];

const serviceMetrics = [
  { label: 'Total Revenue', value: '$67,000', change: '+18.2%', trend: 'up' },
  { label: 'Service Orders', value: '168', change: '+20.0%', trend: 'up' },
  { label: 'Avg Ticket', value: '$399', change: '+1.5%', trend: 'up' },
  { label: 'Completion Rate', value: '94%', change: '+2.1%', trend: 'up' },
];

export default function ServiceReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedTechnician, setSelectedTechnician] = useState('all');
  const { toast } = useToast();

  const handleExport = () => {
    toast({ 
      title: 'Export Started', 
      description: `Exporting service reports for ${selectedPeriod}...` 
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Reports</h1>
          <p className="text-muted-foreground">Service department performance analytics</p>
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
          <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technicians</SelectItem>
              {technicianData.map(tech => (
                <SelectItem key={tech.name} value={tech.name}>{tech.name}</SelectItem>
              ))}
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
        {serviceMetrics.map((metric, index) => (
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
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
        </TabsList>

        {/* Revenue Reports */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Service Revenue</CardTitle>
                <CardDescription>Revenue and order volume trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Service Types */}
            <Card>
              <CardHeader>
                <CardTitle>Service Type Distribution</CardTitle>
                <CardDescription>Breakdown by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {serviceTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Average Ticket Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Average Ticket Value Trend</CardTitle>
              <CardDescription>Monthly average service ticket value</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={serviceRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgTicket" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Reports */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Service Order Volume</CardTitle>
                <CardDescription>Monthly order completion trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={serviceRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="font-medium">Average Completion Time</div>
                        <div className="text-sm text-muted-foreground">2.3 hours</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">-15 min</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="font-medium">First-Time Fix Rate</div>
                        <div className="text-sm text-muted-foreground">89%</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+3%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-8 w-8 text-orange-500" />
                      <div>
                        <div className="font-medium">Customer Satisfaction</div>
                        <div className="text-sm text-muted-foreground">4.7/5.0</div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+0.2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technician Performance */}
        <TabsContent value="technicians" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance</CardTitle>
              <CardDescription>Individual technician metrics and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicianData.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground">{tech.orders} orders completed</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div>
                        <div className="text-lg font-semibold">${tech.revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{tech.efficiency}%</div>
                        <div className="text-sm text-muted-foreground">Efficiency</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{tech.rating}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
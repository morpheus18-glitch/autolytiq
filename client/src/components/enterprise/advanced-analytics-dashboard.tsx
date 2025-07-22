import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Users,
  Car,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';

export function AdvancedAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('monthly');
  const [metricType, setMetricType] = useState('all');

  const { data: kpiMetrics, isLoading: kpiLoading } = useQuery({
    queryKey: ['/api/kpi-metrics', metricType, timeframe],
  });

  const { data: marketBenchmarks, isLoading: benchmarkLoading } = useQuery({
    queryKey: ['/api/market-benchmarks', timeframe],
  });

  const { data: predictiveAnalytics, isLoading: predictiveLoading } = useQuery({
    queryKey: ['/api/predictive-scores/analytics'],
  });

  if (kpiLoading || benchmarkLoading || predictiveLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Mock data for comprehensive analytics (would come from API in real implementation)
  const salesPerformanceData = [
    { month: 'Jan', sales: 240, target: 200, deals: 45, revenue: 1200000 },
    { month: 'Feb', sales: 280, target: 220, deals: 52, revenue: 1450000 },
    { month: 'Mar', sales: 220, target: 240, deals: 41, revenue: 1100000 },
    { month: 'Apr', sales: 320, target: 260, deals: 58, revenue: 1680000 },
    { month: 'May', sales: 380, target: 280, deals: 67, revenue: 1920000 },
    { month: 'Jun', sales: 290, target: 300, deals: 54, revenue: 1520000 }
  ];

  const inventoryTurnData = [
    { category: 'New Cars', turnRate: 8.2, daysOnLot: 45, value: 2400000 },
    { category: 'Used Cars', turnRate: 12.5, daysOnLot: 29, value: 1800000 },
    { category: 'Certified Pre-Owned', turnRate: 10.1, daysOnLot: 36, value: 1200000 },
    { category: 'Luxury', turnRate: 6.8, daysOnLot: 53, value: 3200000 },
    { category: 'Trucks & SUVs', turnRate: 9.4, daysOnLot: 39, value: 2800000 }
  ];

  const customerSegmentData = [
    { name: 'First-Time Buyers', value: 35, color: '#8884d8' },
    { name: 'Repeat Customers', value: 25, color: '#82ca9d' },
    { name: 'Referrals', value: 20, color: '#ffc658' },
    { name: 'Walk-ins', value: 15, color: '#ff7c7c' },
    { name: 'Online Leads', value: 5, color: '#8dd1e1' }
  ];

  const benchmarkData = [
    { 
      metric: 'Sales per Month', 
      ourValue: 58, 
      marketAvg: 45, 
      percentile: 78,
      trend: 'up'
    },
    { 
      metric: 'Days to Sale', 
      ourValue: 32, 
      marketAvg: 38, 
      percentile: 72,
      trend: 'up'
    },
    { 
      metric: 'Customer Satisfaction', 
      ourValue: 4.6, 
      marketAvg: 4.2, 
      percentile: 85,
      trend: 'up'
    },
    { 
      metric: 'Inventory Turn', 
      ourValue: 9.8, 
      marketAvg: 8.5, 
      percentile: 68,
      trend: 'up'
    }
  ];

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'sales': return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'inventory': return <Car className="w-5 h-5 text-blue-500" />;
      case 'operations': return <Activity className="w-5 h-5 text-purple-500" />;
      case 'finance': return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default: return <BarChart3 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                Advanced Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Real-time KPIs, market benchmarking, and predictive insights
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">$9.67M</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  12.5% from last month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Units Sold</p>
                <p className="text-2xl font-bold">298</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  8.2% from last month
                </p>
              </div>
              <Car className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Days to Sale</p>
                <p className="text-2xl font-bold">32</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  6 days improved
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Satisfaction</p>
                <p className="text-2xl font-bold">4.6/5</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  0.3 points higher
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
        </TabsList>

        {/* Performance Analytics */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance Trend</CardTitle>
                <CardDescription>Monthly sales vs targets with deal count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={salesPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="target"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                      fillOpacity={0.3}
                    />
                    <Bar yAxisId="left" dataKey="sales" fill="#8884d8" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="deals"
                      stroke="#82ca9d"
                      strokeWidth={3}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Turn Analysis</CardTitle>
                <CardDescription>Turn rates and days on lot by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryTurnData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="turnRate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend Analysis</CardTitle>
              <CardDescription>Monthly revenue performance with growth indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={salesPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Benchmarks */}
        <TabsContent value="benchmarks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Position</CardTitle>
                <CardDescription>How we compare to industry standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {benchmarkData.map((benchmark, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{benchmark.metric}</span>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(benchmark.trend)}
                            <Badge variant="secondary">{benchmark.percentile}th percentile</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>Us: <strong>{benchmark.ourValue}</strong></span>
                          <span>Market: <strong>{benchmark.marketAvg}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Percentiles</CardTitle>
                <CardDescription>Where we rank in the market</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart
                    innerRadius="20%"
                    outerRadius="80%"
                    data={benchmarkData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      dataKey="percentile"
                      cornerRadius={10}
                      fill="#8884d8"
                    />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Competitive Analysis</CardTitle>
              <CardDescription>Market performance comparison over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">78th</div>
                  <div className="text-sm text-muted-foreground">Sales Percentile</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">85th</div>
                  <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">72nd</div>
                  <div className="text-sm text-muted-foreground">Efficiency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">68th</div>
                  <div className="text-sm text-muted-foreground">Inventory Turn</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Analytics */}
        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-green-500" />
                  Sales Forecast
                </CardTitle>
                <CardDescription>AI-powered sales predictions for next 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="font-medium">Next Month Prediction</p>
                      <p className="text-sm text-muted-foreground">July 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">$2.1M</p>
                      <p className="text-sm text-muted-foreground">87% confidence</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="font-medium">Quarter Prediction</p>
                      <p className="text-sm text-muted-foreground">Q3 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">$6.8M</p>
                      <p className="text-sm text-muted-foreground">82% confidence</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                  Risk Analysis
                </CardTitle>
                <CardDescription>Identified risks and opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">High Inventory Risk</p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Luxury vehicles showing 68-day average on lot
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">Growth Opportunity</p>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Used car demand up 15% - expand inventory
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Segmentation */}
        <TabsContent value="segmentation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition Sources</CardTitle>
                <CardDescription>Breakdown of customer sources and their value</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSegmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerSegmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value Analysis</CardTitle>
                <CardDescription>Segment analysis by value and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegmentData.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="font-medium">{segment.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{segment.value}%</p>
                        <p className="text-sm text-muted-foreground">of total sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
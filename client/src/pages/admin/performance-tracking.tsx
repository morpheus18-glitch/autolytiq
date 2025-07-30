import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Users,
  Calendar,
  Download,
  Filter,
  Star,
  Award,
  Zap
} from "lucide-react";

interface PerformanceMetric {
  employeeId: string;
  name: string;
  role: string;
  department: string;
  salesTarget: number;
  salesActual: number;
  customerSatisfaction: number;
  leadConversion: number;
  revenue: number;
  rank: number;
}

export default function PerformanceTracking() {
  const [timeFrame, setTimeFrame] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  // Mock performance data - would be fetched from backend
  const performanceData: PerformanceMetric[] = [
    {
      employeeId: '1',
      name: 'Sarah Johnson',
      role: 'Sales Consultant',
      department: 'Sales',
      salesTarget: 15,
      salesActual: 18,
      customerSatisfaction: 4.8,
      leadConversion: 24,
      revenue: 450000,
      rank: 1
    },
    {
      employeeId: '2',
      name: 'Mike Davis',
      role: 'Sales Consultant',
      department: 'Sales',
      salesTarget: 15,
      salesActual: 16,
      customerSatisfaction: 4.6,
      leadConversion: 22,
      revenue: 420000,
      rank: 2
    },
    {
      employeeId: '3',
      name: 'Lisa Chen',
      role: 'F&I Manager',
      department: 'Finance',
      salesTarget: 25,
      salesActual: 23,
      customerSatisfaction: 4.7,
      leadConversion: 28,
      revenue: 380000,
      rank: 3
    },
    {
      employeeId: '4',
      name: 'David Wilson',
      role: 'Sales Consultant',
      department: 'Sales',
      salesTarget: 12,
      salesActual: 14,
      customerSatisfaction: 4.5,
      leadConversion: 20,
      revenue: 365000,
      rank: 4
    },
    {
      employeeId: '5',
      name: 'Anna Rodriguez',
      role: 'Service Advisor',
      department: 'Service',
      salesTarget: 20,
      salesActual: 19,
      customerSatisfaction: 4.9,
      leadConversion: 18,
      revenue: 280000,
      rank: 5
    }
  ];

  const monthlyTrends = [
    { month: 'Jan', avgSales: 14, avgSatisfaction: 4.3, revenue: 320000 },
    { month: 'Feb', avgSales: 16, avgSatisfaction: 4.5, revenue: 380000 },
    { month: 'Mar', avgSales: 18, avgSatisfaction: 4.7, revenue: 450000 },
    { month: 'Apr', avgSales: 17, avgSatisfaction: 4.6, revenue: 420000 },
    { month: 'May', avgSales: 19, avgSatisfaction: 4.8, revenue: 485000 },
    { month: 'Jun', avgSales: 21, avgSatisfaction: 4.9, revenue: 520000 }
  ];

  const getPerformanceColor = (actual: number, target: number) => {
    const percentage = (actual / target) * 100;
    if (percentage >= 110) return 'text-green-600';
    if (percentage >= 90) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (actual: number, target: number) => {
    const percentage = (actual / target) * 100;
    if (percentage >= 110) return { label: 'Exceeds', color: 'bg-green-100 text-green-800' };
    if (percentage >= 90) return { label: 'Meets', color: 'bg-blue-100 text-blue-800' };
    if (percentage >= 70) return { label: 'Approaching', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Below', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Performance Tracking</h1>
            <p className="text-gray-600">Monitor and analyze employee performance metrics</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeFrame} 
            onChange={(e) => setTimeFrame(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <select 
            value={selectedDepartment} 
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Departments</option>
            <option value="sales">Sales</option>
            <option value="finance">Finance</option>
            <option value="service">Service</option>
          </select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Performer</p>
                <p className="text-lg font-bold">{performanceData[0]?.name}</p>
                <p className="text-sm text-green-600">{((performanceData[0]?.salesActual / performanceData[0]?.salesTarget) * 100).toFixed(0)}% of target</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-sm text-green-600">+5% vs last month</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team Revenue</p>
                <p className="text-2xl font-bold">${(performanceData.reduce((sum, p) => sum + p.revenue, 0) / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-green-600">+12% vs last month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold">4.7</p>
                <p className="text-sm text-green-600">+0.2 vs last month</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avgSales" stroke="#3B82F6" strokeWidth={2} name="Avg Sales" />
                <Line type="monotone" dataKey="avgSatisfaction" stroke="#10B981" strokeWidth={2} name="Satisfaction" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Employee */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData.slice(0, 5)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Employee</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Sales Performance</th>
                  <th className="text-left p-3">Customer Satisfaction</th>
                  <th className="text-left p-3">Lead Conversion</th>
                  <th className="text-left p-3">Revenue</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((employee) => {
                  const performanceBadge = getPerformanceBadge(employee.salesActual, employee.salesTarget);
                  return (
                    <tr key={employee.employeeId} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {employee.rank === 1 && <Trophy className="w-4 h-4 text-yellow-600" />}
                          {employee.rank === 2 && <Award className="w-4 h-4 text-gray-400" />}
                          {employee.rank === 3 && <Star className="w-4 h-4 text-orange-600" />}
                          <span className="font-medium">#{employee.rank}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-600">{employee.role}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{employee.department}</Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className={`font-medium ${getPerformanceColor(employee.salesActual, employee.salesTarget)}`}>
                            {employee.salesActual} / {employee.salesTarget}
                          </div>
                          <div className="text-sm text-gray-600">
                            {((employee.salesActual / employee.salesTarget) * 100).toFixed(0)}% of target
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{employee.customerSatisfaction}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{employee.leadConversion}%</span>
                      </td>
                      <td className="p-3">
                        <span className="font-medium">${(employee.revenue / 1000).toFixed(0)}K</span>
                      </td>
                      <td className="p-3">
                        <Badge className={performanceBadge.color}>
                          {performanceBadge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Top Performers</span>
              </div>
              <p className="text-sm text-green-700">
                3 employees exceeded their targets by 10% or more this month
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Improvement Needed</span>
              </div>
              <p className="text-sm text-yellow-700">
                2 employees need additional support to reach their targets
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Team Average</span>
              </div>
              <p className="text-sm text-blue-700">
                Overall team performance is 8% above last month's average
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
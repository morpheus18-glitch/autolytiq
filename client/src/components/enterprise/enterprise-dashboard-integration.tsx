import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Users,
  Car,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Target,
  ArrowRight,
  Clock,
  User,
  FileText,
  Settings,
  BarChart3,
  Activity,
  Zap,
} from 'lucide-react';
import { Link } from 'wouter';

interface DashboardMetric {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface ActiveWorkflow {
  id: string;
  type: 'lead-processing' | 'deal-closing' | 'customer-onboarding' | 'follow-up';
  title: string;
  customer?: string;
  vehicle?: string;
  progress: number;
  priority: 'high' | 'medium' | 'low';
  nextStep: string;
}

interface AIInsight {
  id: string;
  type: 'pricing' | 'inventory' | 'customer' | 'market';
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  priority: 'critical' | 'important' | 'info';
}

export function EnterpriseDashboardIntegration() {
  const [activeWorkflows] = useState<ActiveWorkflow[]>([
    {
      id: 'wf-001',
      type: 'lead-processing',
      title: 'New Internet Lead',
      customer: 'Sarah Johnson',
      vehicle: '2024 Honda Accord',
      progress: 65,
      priority: 'high',
      nextStep: 'Schedule test drive',
    },
    {
      id: 'wf-002',
      type: 'deal-closing',
      title: 'Finance Approval Pending',
      customer: 'Mike Davis',
      vehicle: '2023 Toyota Camry',
      progress: 80,
      priority: 'high',
      nextStep: 'Review F&I menu',
    },
    {
      id: 'wf-003',
      type: 'customer-onboarding',
      title: 'Delivery Preparation',
      customer: 'Lisa Chen',
      vehicle: '2024 BMW X3',
      progress: 90,
      priority: 'medium',
      nextStep: 'Vehicle prep checklist',
    },
  ]);

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: 'ai-001',
      type: 'pricing',
      title: 'Pricing Optimization Alert',
      description: '3 vehicles priced $2K above market average. Adjust pricing to increase velocity.',
      actionLabel: 'Review Pricing',
      actionPath: '/competitive-pricing',
      priority: 'critical',
    },
    {
      id: 'ai-002',
      type: 'inventory',
      title: 'Low Inventory Warning',
      description: 'Compact SUV inventory below 15-day supply. Consider acquiring more units.',
      actionLabel: 'View Inventory',
      actionPath: '/inventory',
      priority: 'important',
    },
    {
      id: 'ai-003',
      type: 'customer',
      title: 'High-Value Lead Identified',
      description: 'New lead shows 87% purchase probability based on behavior patterns.',
      actionLabel: 'View Customer',
      actionPath: '/customers',
      priority: 'important',
    },
  ]);

  const metrics: DashboardMetric[] = [
    {
      title: 'Active Deals',
      value: 23,
      change: 12,
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
    },
    {
      title: 'Monthly Sales',
      value: '$1.2M',
      change: 8,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
    },
    {
      title: 'Inventory Turn',
      value: '42 days',
      change: -5,
      icon: <Car className="w-5 h-5" />,
      color: 'text-purple-600',
    },
    {
      title: 'Customer Satisfaction',
      value: '94%',
      change: 2,
      icon: <Users className="w-5 h-5" />,
      color: 'text-orange-600',
    },
  ];

  const getWorkflowIcon = (type: ActiveWorkflow['type']) => {
    switch (type) {
      case 'lead-processing':
        return <Target className="w-4 h-4" />;
      case 'deal-closing':
        return <DollarSign className="w-4 h-4" />;
      case 'customer-onboarding':
        return <User className="w-4 h-4" />;
      case 'follow-up':
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'important':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enterprise Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Intelligent dealership management with AI-powered insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Activity className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </p>
                </div>
                <div className={`${metric.color} opacity-80`}>
                  {metric.icon}
                </div>
              </div>
              <div className="mt-2">
                <Badge 
                  variant={metric.change > 0 ? "default" : "secondary"} 
                  className={`text-xs ${metric.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Active Workflows</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Active Workflows */}
        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Smart Workflow Assistant</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {activeWorkflows.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">
                        {getWorkflowIcon(workflow.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {workflow.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {workflow.customer} • {workflow.vehicle}
                        </p>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(workflow.priority)}>
                      {workflow.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 mr-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Progress</span>
                        <span className="text-xs text-gray-600">{workflow.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${workflow.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Next: {workflow.nextStep}
                    </p>
                    <Button size="sm" variant="outline">
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Continue
                    </Button>
                  </div>
                </div>
              ))}
              
              <Link href="/workflow-assistant">
                <Button className="w-full" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage All Workflows
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="ai-insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-green-600" />
                <span>AI-Powered Insights</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {aiInsights.length} Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-green-600">
                        <Brain className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {insight.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link href={insight.actionPath}>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        {insight.actionLabel}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              
              <Link href="/ai-smart-search">
                <Button className="w-full" variant="outline">
                  <Brain className="w-4 h-4 mr-2" />
                  Advanced AI Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Close Rate</span>
                    <span className="text-sm font-medium">18.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Deal Size</span>
                    <span className="text-sm font-medium">$32,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Time to Close</span>
                    <span className="text-sm font-medium">12.3 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Customer Retention</span>
                    <span className="text-sm font-medium">67%</span>
                  </div>
                </div>
                <Link href="/analytics">
                  <Button className="w-full mt-4" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/inventory">
                  <Button className="w-full" variant="outline" size="sm">
                    <Car className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Button>
                </Link>
                <Link href="/customers">
                  <Button className="w-full" variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Customer Management
                  </Button>
                </Link>
                <Link href="/deal-desk">
                  <Button className="w-full" variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Deal Desk
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button className="w-full" variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
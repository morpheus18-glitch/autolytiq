import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Car, 
  TrendingUp, 
  MessageSquare, 
  Brain, 
  Phone, 
  Target, 
  Clock, 
  DollarSign,
  ArrowRight,
  Activity,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';

interface DashboardMetrics {
  customers: {
    total: number;
    newThisWeek: number;
    hotLeads: number;
    pendingContact: number;
  };
  inventory: {
    total: number;
    available: number;
    sold: number;
    avgDaysOnLot: number;
  };
  communication: {
    messagesTotal: number;
    callsToday: number;
    responseRate: number;
    avgResponseTime: string;
  };
  ml: {
    searchQueries: number;
    accuracy: number;
    recommendations: number;
    leadScore: number;
  };
}

export default function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard metrics
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ['/api/dashboard/metrics'],
    queryFn: async () => {
      // Mock data for professional demo
      return {
        customers: {
          total: 1247,
          newThisWeek: 23,
          hotLeads: 47,
          pendingContact: 12
        },
        inventory: {
          total: 89,
          available: 76,
          sold: 13,
          avgDaysOnLot: 28
        },
        communication: {
          messagesTotal: 145,
          callsToday: 28,
          responseRate: 94.2,
          avgResponseTime: '4.5 min'
        },
        ml: {
          searchQueries: 67,
          accuracy: 92.3,
          recommendations: 156,
          leadScore: 87.5
        }
      };
    }
  });

  const quickActions = [
    {
      title: 'Add New Customer',
      description: 'Create customer profile',
      icon: Users,
      href: '/customers?action=create',
      color: 'bg-blue-500'
    },
    {
      title: 'Smart Customer Search',
      description: 'AI-powered search',
      icon: Brain,
      href: '/ai-smart-search',
      color: 'bg-purple-500'
    },
    {
      title: 'Send Bulk Messages',
      description: 'Mass communication',
      icon: MessageSquare,
      href: '/communication-demo',
      color: 'bg-green-500'
    },
    {
      title: 'Update Inventory',
      description: 'Add/edit vehicles',
      icon: Car,
      href: '/inventory?action=create',
      color: 'bg-orange-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'lead',
      title: 'New high-value lead created',
      description: 'Jennifer Wilson - $85K budget, luxury vehicles',
      timestamp: '2 min ago',
      score: 94,
      action: 'View Lead'
    },
    {
      id: 2,
      type: 'message',
      title: 'Customer message received',
      description: 'Michael Johnson asking about test drive',
      timestamp: '5 min ago',
      action: 'Respond'
    },
    {
      id: 3,
      type: 'ai',
      title: 'AI recommendation generated',
      description: '2023 Tesla Model 3 for Sarah Davis',
      timestamp: '8 min ago',
      accuracy: 89,
      action: 'Review'
    },
    {
      id: 4,
      type: 'sale',
      title: 'Deal closed successfully',
      description: '2024 Honda Accord - $28,500',
      timestamp: '1 hour ago',
      amount: '$28,500',
      action: 'View Deal'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead': return <Target className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'ai': return <Brain className="w-4 h-4" />;
      case 'sale': return <DollarSign className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lead': return 'text-blue-500';
      case 'message': return 'text-green-500';
      case 'ai': return 'text-purple-500';
      case 'sale': return 'text-yellow-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold">{metrics?.customers.total.toLocaleString()}</p>
                  <Badge variant="secondary" className="text-xs">
                    +{metrics?.customers.newThisWeek} this week
                  </Badge>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-600 font-medium">{metrics?.customers.hotLeads} hot leads</span>
              <ArrowRight className="w-3 h-3 mx-1" />
              <Link href="/customers?filter=hot_leads" className="text-blue-600 hover:underline">
                View all
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Inventory</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold">{metrics?.inventory.available}</p>
                  <Badge variant="outline" className="text-xs">
                    {metrics?.inventory.sold} sold this month
                  </Badge>
                </div>
              </div>
              <Car className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">Avg: {metrics?.inventory.avgDaysOnLot} days on lot</span>
              <ArrowRight className="w-3 h-3 mx-1" />
              <Link href="/inventory" className="text-green-600 hover:underline">
                Manage
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Performance</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold">{metrics?.ml.accuracy}%</p>
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.ml.searchQueries} searches today
                  </Badge>
                </div>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-purple-600 font-medium">{metrics?.ml.recommendations} recommendations</span>
              <ArrowRight className="w-3 h-3 mx-1" />
              <Link href="/ai-smart-search" className="text-purple-600 hover:underline">
                AI Search
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Communications</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold">{metrics?.communication.responseRate}%</p>
                  <Badge variant="secondary" className="text-xs">
                    {metrics?.communication.callsToday} calls today
                  </Badge>
                </div>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-orange-600 font-medium">{metrics?.communication.avgResponseTime} avg response</span>
              <ArrowRight className="w-3 h-3 mx-1" />
              <Link href="/communication-demo" className="text-orange-600 hover:underline">
                Messaging
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{activity.title}</h4>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-3">
                        {activity.score && (
                          <Badge variant="outline" className="text-xs">
                            Score: {activity.score}%
                          </Badge>
                        )}
                        {activity.accuracy && (
                          <Badge variant="outline" className="text-xs">
                            Accuracy: {activity.accuracy}%
                          </Badge>
                        )}
                        {activity.amount && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.amount}
                          </Badge>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="sm" className="text-xs">
                        {activity.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Link href="/activity-log">
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Recommendations Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">High-Priority Leads</h4>
              <p className="text-sm text-blue-700 mb-3">3 leads require immediate follow-up based on engagement patterns</p>
              <Link href="/customers?filter=priority_leads">
                <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                  Review Leads
                </Button>
              </Link>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Inventory Optimization</h4>
              <p className="text-sm text-green-700 mb-3">5 vehicles ready for price adjustment to increase turnover</p>
              <Link href="/competitive-pricing">
                <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                  Price Analysis
                </Button>
              </Link>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Customer Matching</h4>
              <p className="text-sm text-purple-700 mb-3">12 perfect vehicle-to-customer matches identified</p>
              <Link href="/ai-smart-search?tab=recommendations">
                <Button size="sm" variant="outline" className="text-purple-700 border-purple-300">
                  View Matches
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
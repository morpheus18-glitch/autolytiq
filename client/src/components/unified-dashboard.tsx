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
      href: '/customers',
      color: 'bg-blue-500'
    },
    {
      title: 'Smart Workflows',
      description: 'Automated processes',
      icon: Target,
      href: '/workflow-assistant',
      color: 'bg-purple-500'
    },
    {
      title: 'Send Messages',
      description: 'Customer communication',
      icon: MessageSquare,
      href: '/communication-demo',
      color: 'bg-green-500'
    },
    {
      title: 'Manage Inventory',
      description: 'Add/edit vehicles',
      icon: Car,
      href: '/inventory',
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
      action: 'View Lead',
      href: '/customers?filter=hot_leads'
    },
    {
      id: 2,
      type: 'message',
      title: 'Customer message received',
      description: 'Michael Johnson asking about test drive',
      timestamp: '5 min ago',
      action: 'Respond',
      href: '/communication-demo?tab=messages'
    },
    {
      id: 3,
      type: 'ai',
      title: 'AI recommendation generated',
      description: '2023 Tesla Model 3 for Sarah Davis',
      timestamp: '8 min ago',
      accuracy: 89,
      action: 'Review',
      href: '/ai-smart-search?tab=recommendations'
    },
    {
      id: 4,
      type: 'sale',
      title: 'Deal closed successfully',
      description: '2024 Honda Accord - $28,500',
      timestamp: '1 hour ago',
      amount: '$28,500',
      action: 'View Deal',
      href: '/deals?filter=closed_today'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Top 4 navigation cards - clicking these should navigate */}
        <Link href="/customers">
          <Card className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                  <div className="flex items-baseline space-x-1 sm:space-x-2 mt-1">
                    <p className="text-lg sm:text-2xl font-bold">{metrics?.customers.total.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-xs px-1">
                      +{metrics?.customers.newThisWeek}
                    </Badge>
                  </div>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
              </div>
              <div className="mt-2 flex items-center text-xs sm:text-sm">
                <span className="text-red-600 font-medium">{metrics?.customers.hotLeads} hot</span>
                <ArrowRight className="w-3 h-3 mx-1 flex-shrink-0" />
                <span className="text-blue-600 font-medium truncate">Click to manage</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/inventory">
          <Card className="border-l-4 border-l-green-500 cursor-pointer hover:shadow-md transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Active Inventory</p>
                  <div className="flex items-baseline space-x-1 sm:space-x-2 mt-1">
                    <p className="text-lg sm:text-2xl font-bold">{metrics?.inventory.available}</p>
                    <Badge variant="outline" className="text-xs px-1">
                      {metrics?.inventory.sold} sold
                    </Badge>
                  </div>
                </div>
                <Car className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
              </div>
              <div className="mt-2 flex items-center text-xs sm:text-sm">
                <span className="text-gray-600">{metrics?.inventory.avgDaysOnLot} days avg</span>
                <ArrowRight className="w-3 h-3 mx-1 flex-shrink-0" />
                <span className="text-green-600 font-medium truncate">Click to manage</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai-smart-search">
          <Card className="border-l-4 border-l-purple-500 cursor-pointer hover:shadow-md transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">AI Performance</p>
                  <div className="flex items-baseline space-x-1 sm:space-x-2 mt-1">
                    <p className="text-lg sm:text-2xl font-bold">{metrics?.ml.accuracy}%</p>
                    <Badge variant="secondary" className="text-xs px-1">
                      {metrics?.ml.searchQueries} searches
                    </Badge>
                  </div>
                </div>
                <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
              </div>
              <div className="mt-2 flex items-center text-xs sm:text-sm">
                <span className="text-purple-600 font-medium">{metrics?.ml.recommendations} recs</span>
                <ArrowRight className="w-3 h-3 mx-1 flex-shrink-0" />
                <span className="text-purple-600 font-medium truncate">Click for AI search</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/communication-demo">
          <Card className="border-l-4 border-l-orange-500 cursor-pointer hover:shadow-md transition-all duration-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Communications</p>
                  <div className="flex items-baseline space-x-1 sm:space-x-2 mt-1">
                    <p className="text-lg sm:text-2xl font-bold">{metrics?.communication.responseRate}%</p>
                    <Badge variant="secondary" className="text-xs px-1">
                      {metrics?.communication.callsToday} calls
                    </Badge>
                  </div>
                </div>
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
              </div>
              <div className="mt-2 flex items-center text-xs sm:text-sm">
                <span className="text-orange-600 font-medium">{metrics?.communication.avgResponseTime} avg</span>
                <ArrowRight className="w-3 h-3 mx-1 flex-shrink-0" />
                <span className="text-orange-600 font-medium truncate">Click for messaging</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="flex items-center p-2 sm:p-3 rounded-lg border hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${action.color} text-white flex-shrink-0`}>
                    <action.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate">{action.title}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{action.description}</p>
                  </div>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start p-2 sm:p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className={`p-1.5 sm:p-2 rounded-full bg-gray-100 ${getActivityColor(activity.type)} flex-shrink-0`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm sm:text-base line-clamp-1">{activity.title}</h4>
                      <span className="text-xs text-gray-500 flex-shrink-0">{activity.timestamp}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                    
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <div className="flex items-center space-x-1 sm:space-x-3 flex-wrap">
                        {activity.score && (
                          <Badge variant="outline" className="text-xs px-1">
                            Score: {activity.score}%
                          </Badge>
                        )}
                        {activity.accuracy && (
                          <Badge variant="outline" className="text-xs px-1">
                            Accuracy: {activity.accuracy}%
                          </Badge>
                        )}
                        {activity.amount && (
                          <Badge variant="secondary" className="text-xs px-1">
                            {activity.amount}
                          </Badge>
                        )}
                      </div>
                      
                      <Link href={activity.href}>
                        <Button variant="ghost" size="sm" className="text-xs flex-shrink-0 px-2">
                          {activity.action}
                        </Button>
                      </Link>
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
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import {
  Brain,
  Users,
  BarChart3,
  MessageSquare,
  Eye,
  TrendingUp,
  AlertTriangle,
  Car,
  DollarSign,
  Clock,
  Target,
  Activity,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';
import { Customer360Intelligence } from './customer-360-intelligence';
import { DealDeskCopilot } from './deal-desk-copilot';
import { RealTimeCollaboration } from './real-time-collaboration';
import { AdvancedAnalyticsDashboard } from './advanced-analytics-dashboard';

export function EnterpriseDashboardIntegration() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const { data: recentCustomers = [] } = useQuery({
    queryKey: ['/api/customers/recent'],
  });

  const { data: activeDeals = [] } = useQuery({
    queryKey: ['/api/deals/active'],
  });

  const { data: urgentInsights = [] } = useQuery({
    queryKey: ['/api/ai-insights/urgent'],
  });

  const { data: collaborationActivity = [] } = useQuery({
    queryKey: ['/api/collaboration/recent-activity'],
  });

  const enterpriseFeatures = [
    {
      id: 'customer-360',
      title: 'Customer 360° Intelligence',
      description: 'Unified customer view with predictive insights and timeline analysis',
      icon: <Eye className="w-6 h-6 text-blue-500" />,
      color: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20',
      metrics: {
        active: recentCustomers?.length || 0,
        label: 'Recent Customers'
      }
    },
    {
      id: 'deal-copilot',
      title: 'AI-Powered Deal Desk Copilot',
      description: 'Intelligent deal analysis with compliance checking and optimization',
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      color: 'border-purple-200 bg-purple-50 dark:bg-purple-900/20',
      metrics: {
        active: urgentInsights?.length || 0,
        label: 'Active Insights'
      }
    },
    {
      id: 'collaboration',
      title: 'Real-Time Team Collaboration',
      description: 'Threaded discussions, mentions, and automated workflow coordination',
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      color: 'border-green-200 bg-green-50 dark:bg-green-900/20',
      metrics: {
        active: collaborationActivity?.length || 0,
        label: 'Active Threads'
      }
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics & KPIs',
      description: 'Market benchmarking, predictive analytics, and performance dashboards',
      icon: <BarChart3 className="w-6 h-6 text-orange-500" />,
      color: 'border-orange-200 bg-orange-50 dark:bg-orange-900/20',
      metrics: {
        active: 12,
        label: 'Live Metrics'
      }
    }
  ];

  const quickActions = [
    {
      title: 'Analyze Customer Risk',
      description: 'Run AI analysis on customer credit and purchase likelihood',
      icon: <Target className="w-5 h-5 text-red-500" />,
      action: () => setActiveFeature('customer-360')
    },
    {
      title: 'Review Deal Compliance',
      description: 'Check active deals for regulatory and policy compliance',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      action: () => setActiveFeature('deal-copilot')
    },
    {
      title: 'Team Discussion',
      description: 'Start urgent discussion thread with team members',
      icon: <Users className="w-5 h-5 text-blue-500" />,
      action: () => setActiveFeature('collaboration')
    },
    {
      title: 'Performance Review',
      description: 'Generate comprehensive performance and benchmark report',
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      action: () => setActiveFeature('analytics')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center text-lg sm:text-xl lg:text-2xl">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-blue-600" />
            <span className="truncate">Enterprise Command Center</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base lg:text-lg">
            Next-generation dealership intelligence platform with AI-powered insights and real-time collaboration
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {enterpriseFeatures.map((feature) => (
              <Card key={feature.id} className={`cursor-pointer transition-all hover:shadow-md ${feature.color}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    {feature.icon}
                    <Badge variant="secondary" className="text-xs">
                      {feature.metrics.active} {feature.metrics.label}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 leading-tight">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                    {feature.description}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs sm:text-sm h-7 sm:h-8"
                        onClick={() => setActiveFeature(feature.id)}
                      >
                        <span className="hidden sm:inline">Launch</span>
                        <span className="sm:hidden">Open</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center">
                          {feature.icon}
                          <span className="ml-2">{feature.title}</span>
                        </DialogTitle>
                      </DialogHeader>
                      {feature.id === 'customer-360' && (
                        <div className="space-y-4">
                          {selectedCustomerId ? (
                            <Customer360Intelligence customerId={selectedCustomerId} />
                          ) : (
                            <div className="text-center py-8">
                              <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Customer</h3>
                              <p className="text-gray-600 mb-4">Choose a customer from the Customer Intelligence tab to view their 360° profile</p>
                              <Link href="/customers">
                                <Button>Browse All Customers</Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                      {feature.id === 'deal-copilot' && (
                        <div className="space-y-4">
                          {selectedDealId ? (
                            <DealDeskCopilot dealId={selectedDealId} />
                          ) : (
                            <div className="text-center py-8">
                              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Deal</h3>
                              <p className="text-gray-600 mb-4">Choose a deal from the Deal Intelligence tab to launch AI copilot analysis</p>
                              <Link href="/deals">
                                <Button>Browse All Deals</Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                      {feature.id === 'collaboration' && (
                        <RealTimeCollaboration entityType="dashboard" entityId={1} />
                      )}
                      {feature.id === 'analytics' && (
                        <AdvancedAnalyticsDashboard />
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unified Intelligence Dashboard */}
      <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-8 sm:h-9 lg:h-10">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-2">Overview</TabsTrigger>
          <TabsTrigger value="customer-intelligence" className="text-xs sm:text-sm px-1 sm:px-2">
            <span className="hidden lg:inline">Customer Intelligence</span>
            <span className="lg:hidden">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="deal-intelligence" className="text-xs sm:text-sm px-1 sm:px-2 col-start-1 sm:col-start-auto">
            <span className="hidden lg:inline">Deal Intelligence</span>
            <span className="lg:hidden">Deals</span>
          </TabsTrigger>
          <TabsTrigger value="team-collaboration" className="text-xs sm:text-sm px-1 sm:px-2">
            <span className="hidden lg:inline">Team Collaboration</span>
            <span className="lg:hidden">Team</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm px-1 sm:px-2">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Common enterprise workflows and tasks</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 sm:space-y-3">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={action.action}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {action.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">{action.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{action.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                  Enterprise Activity Feed
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Real-time updates from all enterprise systems</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <Link href="/deals?filter=ai_insights">
                    <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium">AI Copilot generated new deal insights</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">3 high-priority recommendations for Deal #D-2025-001</p>
                        <span className="text-xs text-blue-600">2 minutes ago</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/communication-demo?tab=team">
                    <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium">Team collaboration thread updated</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">Sarah Williams responded to "Customer financing approval"</p>
                        <span className="text-xs text-green-600">5 minutes ago</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/customers?search=John Martinez">
                    <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium">Customer 360° timeline updated</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">New service history added for John Martinez</p>
                        <span className="text-xs text-purple-600">12 minutes ago</span>
                      </div>
                    </div>
                  </Link>

                  <Link href="/analytics">
                    <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium">Analytics benchmark update</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">Monthly performance metrics refreshed - 3 new market comparisons</p>
                        <span className="text-xs text-orange-600">18 minutes ago</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health & Performance */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-sm sm:text-base">Enterprise System Health</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Real-time monitoring of all advanced features</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">99.8%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">AI Copilot Uptime</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">847ms</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Real-time Sync</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">156</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Active Integrations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Intelligence Tab */}
        <TabsContent value="customer-intelligence" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-sm sm:text-base">Customer 360° Intelligence Center</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Select a customer to view comprehensive intelligence</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {recentCustomers?.slice(0, 6).map((customer: any) => (
                  <Link key={customer.id} href={`/customers/${customer.id}`}>
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <h3 className="font-medium text-sm sm:text-base truncate">{customer.firstName} {customer.lastName}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{customer.email}</p>
                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <Badge variant="secondary" className="text-xs">{customer.status || 'Active'}</Badge>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <span className="hidden sm:inline">View 360°</span>
                            <span className="sm:hidden">View</span>
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {selectedCustomerId && (
                <div className="mt-6">
                  <Customer360Intelligence customerId={selectedCustomerId} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deal Intelligence Tab */}
        <TabsContent value="deal-intelligence" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-sm sm:text-base">AI-Powered Deal Intelligence</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Select an active deal for AI copilot analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {activeDeals?.slice(0, 4).map((deal: any) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`}>
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedDealId(deal.id)}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <h3 className="font-medium text-sm sm:text-base truncate">Deal #{deal.id}</h3>
                          <Badge variant={deal.status === 'pending' ? 'secondary' : 'default'} className="text-xs">
                            {deal.status}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                          {deal.customerName} - {deal.vehicleDescription}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600">
                            ${deal.totalAmount?.toLocaleString()}
                          </span>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            <span className="hidden sm:inline">AI Analysis</span>
                            <span className="sm:hidden">Analyze</span>
                            <Brain className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {selectedDealId && (
                <div className="mt-6">
                  <DealDeskCopilot dealId={selectedDealId} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Collaboration Tab */}
        <TabsContent value="team-collaboration" className="space-y-4">
          <RealTimeCollaboration entityType="enterprise" entityId={1} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <AdvancedAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
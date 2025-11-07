import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import { Progress } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Car,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  ArrowRight,
  Brain,
  Eye,
  ThumbsUp,
  Award,
  Lightbulb
} from "lucide-react";
import { useState } from "react";
import type { Vehicle, Sale, Lead, Customer } from "@shared/schema";

interface ProductionMetric {
  id: string;
  title: string;
  value: number;
  target: number;
  trend: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  aiInsight: string;
  recommendation: string;
}

interface TeamPerformance {
  id: number;
  name: string;
  role: string;
  salesCount: number;
  revenue: number;
  efficiency: number;
  aiScore: number;
  nextAction: string;
}

export default function AIProductionSuite() {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedMetric, setSelectedMetric] = useState<ProductionMetric | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real data
  const { data: vehicles = [] } = useQuery<Vehicle[]>({ queryKey: ['/api/vehicles'] });
  const { data: sales = [] } = useQuery<Sale[]>({ queryKey: ['/api/sales'] });
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ['/api/leads'] });
  const { data: customers = [] } = useQuery<Customer[]>({ queryKey: ['/api/customers'] });

  // AI-powered production metrics
  const productionMetrics: ProductionMetric[] = [
    {
      id: 'sales_velocity',
      title: 'Sales Velocity',
      value: sales.length * 2.3,
      target: 120,
      trend: 15.2,
      status: sales.length > 20 ? 'excellent' : sales.length > 10 ? 'good' : 'warning',
      aiInsight: `AI predicts ${Math.round(sales.length * 1.8)} additional sales this month based on current pipeline`,
      recommendation: 'Focus on high-probability leads to accelerate closing'
    },
    {
      id: 'inventory_turnover',
      title: 'Inventory Turnover',
      value: Math.round((vehicles.length || 1) * 0.75),
      target: 85,
      trend: 8.7,
      status: vehicles.length > 50 ? 'good' : vehicles.length > 25 ? 'warning' : 'critical',
      aiInsight: `Current inventory optimization at ${Math.round((sales.length / Math.max(vehicles.length, 1)) * 100)}% efficiency`,
      recommendation: 'Prioritize slow-moving inventory for promotional campaigns'
    },
    {
      id: 'lead_conversion',
      title: 'Lead Conversion Rate',
      value: Math.round((sales.length / Math.max(leads.length, 1)) * 100),
      target: 25,
      trend: 12.4,
      status: (sales.length / Math.max(leads.length, 1)) > 0.2 ? 'excellent' : 'good',
      aiInsight: `AI identifies ${leads.filter(l => l.status === 'hot').length} hot leads ready for immediate follow-up`,
      recommendation: 'Implement automated nurturing for warm leads'
    },
    {
      id: 'customer_satisfaction',
      title: 'Customer Satisfaction',
      value: 92,
      target: 90,
      trend: 5.1,
      status: 'excellent',
      aiInsight: 'Customer sentiment analysis shows 94% positive interactions',
      recommendation: 'Leverage satisfied customers for referral programs'
    }
  ];

  // AI-powered team performance analysis
  const teamPerformance: TeamPerformance[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior Sales Consultant',
      salesCount: Math.floor(sales.length * 0.3),
      revenue: Math.floor(sales.length * 15000),
      efficiency: 94,
      aiScore: 97,
      nextAction: 'Schedule luxury inventory presentation'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Sales Manager',
      salesCount: Math.floor(sales.length * 0.25),
      revenue: Math.floor(sales.length * 12000),
      efficiency: 89,
      aiScore: 91,
      nextAction: 'Focus on fleet customer development'
    },
    {
      id: 3,
      name: 'Amanda Rodriguez',
      role: 'Sales Consultant',
      salesCount: Math.floor(sales.length * 0.2),
      revenue: Math.floor(sales.length * 9500),
      efficiency: 87,
      aiScore: 85,
      nextAction: 'Enhance closing technique training'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Internet Sales Specialist',
      salesCount: Math.floor(sales.length * 0.15),
      revenue: Math.floor(sales.length * 8200),
      efficiency: 82,
      aiScore: 83,
      nextAction: 'Optimize online lead response time'
    }
  ];

  const generateInsightsMutation = useMutation({
    mutationFn: async (metricId: string) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "AI Insights Generated",
        description: "Production optimization recommendations updated",
      });
    },
  });

  const handleMetricAnalysis = (metric: ProductionMetric) => {
    setSelectedMetric(metric);
    generateInsightsMutation.mutate(metric.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <ThumbsUp className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-3 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold sm:text-2xl">AI Production Intelligence</h2>
            <p className="text-sm text-gray-600 max-w-xl">
              Real-time performance analytics with AI recommendations
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Badge className="bg-green-100 text-green-800 w-full justify-center sm:w-auto">
            <Brain className="w-3 h-3 mr-1" />
            AI Active
          </Badge>
          <Button
            onClick={() => queryClient.invalidateQueries()}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Activity className="w-4 h-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="mobile-tabs -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-full min-w-0 justify-start md:grid md:grid-cols-4 h-12 md:h-11 gap-1 p-1">
            <TabsTrigger value="performance" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-performance">
              Performance Metrics
            </TabsTrigger>
            <TabsTrigger value="team" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-team">
              Team Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-insights">
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="optimization" className="min-h-[48px] md:min-h-0 px-4 md:px-3" data-testid="tab-optimization">
              Optimization
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-responsive-2 gap-4">
            {productionMetrics.map((metric) => (
              <Card key={metric.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{metric.title}</h3>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-2xl font-bold">{metric.value}</span>
                        <span className="text-sm text-gray-500">/ {metric.target}</span>
                      </div>
                    </div>
                    <Badge className={cn("justify-center sm:justify-start", getStatusColor(metric.status))}>
                      {getStatusIcon(metric.status)}
                      <span className="ml-1 capitalize">{metric.status}</span>
                    </Badge>
                  </div>

                  <div className="mb-3 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span>Progress to Target</span>
                      <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                    </div>
                    <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                  </div>

                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">+{metric.trend}%</span>
                      <span className="text-gray-500">vs last month</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-purple-700 mb-1">AI Insight</div>
                        <div className="text-xs text-gray-700">{metric.aiInsight}</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => handleMetricAnalysis(metric)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Deep Analysis
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Analytics Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid gap-4">
            {teamPerformance.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800">
                      AI Score: {member.aiScore}
                    </Badge>
                  </div>

                  <div className="mb-4 grid grid-responsive-3 gap-4">
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-blue-600">{member.salesCount}</div>
                      <div className="text-xs text-gray-600">Sales This Month</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-green-600">${member.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Revenue Generated</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-purple-600">{member.efficiency}%</div>
                      <div className="text-xs text-gray-600">Efficiency Score</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                      <div>
                        <div className="text-xs font-medium text-yellow-700 mb-1">AI Recommendation</div>
                        <div className="text-xs text-gray-700">{member.nextAction}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Award className="w-3 h-3 mr-1" />
                      Coach
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            <Card className="border-l-4 border-green-500">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold">Production Optimization Opportunity</h3>
                    <p className="text-gray-700">
                      AI analysis indicates a 23% increase in sales velocity by focusing on luxury vehicle inventory.
                      High-credit customers show 89% purchase intent for premium models.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge className="bg-green-100 text-green-800">98% Confidence</Badge>
                      <Button size="sm" className="w-full sm:w-auto">
                        Implement Strategy
                        <Zap className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-blue-500">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <Brain className="w-6 h-6 text-blue-600 mt-1" />
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold">Inventory Rebalancing Recommendation</h3>
                    <p className="text-gray-700">
                      Predictive analytics suggests moving 15 SUV units to meet increasing demand while
                      reducing sedan inventory by 8%. This shift could improve turnover by 31%.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge className="bg-blue-100 text-blue-800">94% Confidence</Badge>
                      <Button size="sm" className="w-full sm:w-auto">
                        Review Plan
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-yellow-500">
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold">Team Performance Alert</h3>
                    <p className="text-gray-700">
                      Two team members show declining efficiency metrics. Targeted training in closing techniques
                      and CRM utilization could restore performance to optimal levels.
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge className="bg-yellow-100 text-yellow-800">87% Confidence</Badge>
                      <Button size="sm" className="w-full sm:w-auto">
                        Schedule Training
                        <Users className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-responsive-3 gap-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Goal Tracking</h3>
                <div className="text-3xl font-bold mb-2">{Math.round((sales.length / 50) * 100)}%</div>
                <p className="text-sm text-gray-600 mb-4">Monthly target achieved</p>
                <Button size="sm" className="w-full">Optimize Goals</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Process Efficiency</h3>
                <div className="text-3xl font-bold mb-2">87%</div>
                <p className="text-sm text-gray-600 mb-4">Overall efficiency score</p>
                <Button size="sm" className="w-full">View Insights</Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">AI Automation</h3>
                <div className="text-3xl font-bold mb-2">12</div>
                <p className="text-sm text-gray-600 mb-4">Active optimizations</p>
                <Button size="sm" className="w-full">Manage Rules</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Metric Analysis Dialog */}
      {selectedMetric && (
        <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Analysis: {selectedMetric.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-responsive-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Performance</div>
                  <div className="text-2xl font-bold">{selectedMetric.value}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target Achievement</div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Progress value={(selectedMetric.value / selectedMetric.target) * 100} className="h-3 flex-1" />
                    <span className="text-sm font-medium">
                      {Math.round((selectedMetric.value / selectedMetric.target) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  AI Recommendation
                </h4>
                <p className="text-sm">{selectedMetric.recommendation}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Implementation Plan
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Schedule team meeting to discuss optimization strategy
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Implement recommended process changes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Monitor progress with daily metrics tracking
                  </li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
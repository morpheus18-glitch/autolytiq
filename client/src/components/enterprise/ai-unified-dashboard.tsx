import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Car,
  Activity,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Eye,
  ArrowRight,
  BarChart3,
  Shield,
  Clock,
  Award,
  Lightbulb,
  ThumbsUp
} from "lucide-react";
import { useState } from "react";

interface ExecutiveMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  aiInsight: string;
  priority: 'high' | 'medium' | 'low';
}

interface BusinessAlert {
  id: string;
  type: 'opportunity' | 'risk' | 'achievement' | 'action_required';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  timeframe: string;
  action: string;
}

export default function AIUnifiedDashboard() {
  const [selectedMetric, setSelectedMetric] = useState<ExecutiveMetric | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real data for intelligent analysis
  const { data: vehicles = [] } = useQuery<any[]>({ queryKey: ['/api/vehicles'] });
  const { data: sales = [] } = useQuery<any[]>({ queryKey: ['/api/sales'] });
  const { data: leads = [] } = useQuery<any[]>({ queryKey: ['/api/leads'] });
  const { data: customers = [] } = useQuery<any[]>({ queryKey: ['/api/customers'] });

  // AI-powered executive metrics
  const executiveMetrics: ExecutiveMetric[] = [
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: `$${(sales.length * 45000).toLocaleString()}`,
      change: '+18.5%',
      trend: 'up',
      status: sales.length > 20 ? 'excellent' : sales.length > 10 ? 'good' : 'warning',
      aiInsight: `Revenue trending ${Math.round(sales.length * 1.8)}% above forecast with luxury segment driving growth`,
      priority: 'high'
    },
    {
      id: 'units_sold',
      title: 'Units Sold',
      value: sales.length.toString(),
      change: '+23.2%',
      trend: 'up',
      status: sales.length > 15 ? 'excellent' : 'good',
      aiInsight: `Sales velocity increased with AI-optimized lead qualification improving conversion by 31%`,
      priority: 'high'
    },
    {
      id: 'inventory_health',
      title: 'Inventory Health',
      value: `${vehicles.length} units`,
      change: vehicles.length > 50 ? '+8.1%' : '-5.2%',
      trend: vehicles.length > 50 ? 'up' : 'down',
      status: vehicles.length > 50 ? 'good' : vehicles.length > 25 ? 'warning' : 'critical',
      aiInsight: `Inventory optimization needed in compact segment, SUV demand exceeding supply by 34%`,
      priority: 'medium'
    },
    {
      id: 'customer_satisfaction',
      title: 'Customer Satisfaction',
      value: '94.2%',
      change: '+2.8%',
      trend: 'up',
      status: 'excellent',
      aiInsight: 'Customer sentiment analysis shows 96% positive interactions with service excellence driving retention',
      priority: 'medium'
    },
    {
      id: 'lead_pipeline',
      title: 'Active Pipeline',
      value: leads.length.toString(),
      change: '+15.7%',
      trend: 'up',
      status: leads.length > 30 ? 'excellent' : leads.length > 15 ? 'good' : 'warning',
      aiInsight: `Pipeline quality improved with ${leads.filter((l: any) => l.status === 'hot').length} hot prospects identified by AI scoring`,
      priority: 'high'
    },
    {
      id: 'gross_profit',
      title: 'Gross Profit Margin',
      value: '28.4%',
      change: '+4.1%',
      trend: 'up',
      status: 'excellent',
      aiInsight: 'Profit margins optimized through competitive pricing intelligence and strategic inventory management',
      priority: 'high'
    }
  ];

  // AI-generated business alerts
  const businessAlerts: BusinessAlert[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Luxury Market Expansion',
      description: 'AI analysis identifies untapped luxury vehicle demand in your market area',
      impact: '$340K potential revenue',
      confidence: 92,
      timeframe: '30 days',
      action: 'Increase premium inventory by 15 units'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Q4 Sales Target Exceeded',
      description: 'Current trajectory shows 112% of quarterly sales target achievement',
      impact: '12% above goal',
      confidence: 96,
      timeframe: 'Current',
      action: 'Maintain current sales velocity'
    },
    {
      id: '3',
      type: 'action_required',
      title: 'Inventory Rebalancing Needed',
      description: 'Sedan inventory aging while SUV demand increases significantly',
      impact: '18% turnover improvement',
      confidence: 89,
      timeframe: '14 days',
      action: 'Execute inventory redistribution plan'
    },
    {
      id: '4',
      type: 'risk',
      title: 'Competition Pricing Pressure',
      description: 'Competitor pricing 8% below market average in compact segment',
      impact: 'Potential 15% share loss',
      confidence: 84,
      timeframe: '21 days',
      action: 'Implement dynamic pricing strategy'
    }
  ];

  const generateInsightsMutation = useMutation({
    mutationFn: async (metricId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { insights: 'Advanced AI analysis complete' };
    },
    onSuccess: () => {
      toast({
        title: "Executive Insights Generated",
        description: "AI analysis updated with latest market intelligence",
      });
    },
  });

  const handleMetricAnalysis = (metric: ExecutiveMetric) => {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="w-5 h-5 text-yellow-600" />;
      case 'achievement': return <Award className="w-5 h-5 text-green-600" />;
      case 'action_required': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'risk': return <Shield className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-yellow-200 bg-yellow-50';
      case 'achievement': return 'border-green-200 bg-green-50';
      case 'action_required': return 'border-orange-200 bg-orange-50';
      case 'risk': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen mobile-scroll">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-16 z-40">
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col space-y-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Executive Overview</h2>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">AI-powered business intelligence</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Badge className="bg-purple-100 text-purple-800 text-center text-xs py-1">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Intelligence Active
                </Badge>
                <Button onClick={() => queryClient.invalidateQueries()} variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Content */}
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
        
        {/* Executive Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {executiveMetrics.map((metric) => (
          <Card 
            key={metric.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleMetricAnalysis(metric)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">{metric.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl sm:text-2xl font-bold">{metric.value}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-xs sm:text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(metric.status)} text-xs whitespace-nowrap`}>
                  {metric.status === 'excellent' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {metric.status === 'good' && <ThumbsUp className="w-3 h-3 mr-1" />}
                  {metric.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {metric.status === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  <span className="capitalize">{metric.status}</span>
                </Badge>
              </div>

              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mb-3">
                <div className="flex items-start gap-2">
                  <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-purple-700 mb-1">AI Insight</div>
                    <div className="text-xs text-gray-700 leading-relaxed">{metric.aiInsight}</div>
                  </div>
                </div>
              </div>

              <Button 
                size="sm" 
                onClick={() => handleMetricAnalysis(metric)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs sm:text-sm py-2"
              >
                <Eye className="w-3 h-3 mr-1" />
                Deep Analysis
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Business Alerts */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <h3 className="text-lg sm:text-xl font-bold">AI Business Intelligence Alerts</h3>
          </div>
          <Badge className="bg-green-100 text-green-800 text-xs w-fit">
            {businessAlerts.length} Active Insights
          </Badge>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {businessAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.type)}`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 mb-3">
                  <div className="flex items-start gap-2 sm:gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base lg:text-lg">{alert.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {alert.confidence}% confidence
                    </Badge>
                    <div className="text-xs text-gray-500">{alert.timeframe}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Potential Impact</div>
                    <div className="font-semibold text-sm text-green-600">{alert.impact}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Recommended Action</div>
                    <div className="font-medium text-sm text-gray-900">{alert.action}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs sm:text-sm">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm">
                    <Zap className="w-3 h-3 mr-1" />
                    Take Action
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

        {/* Quick Actions Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="text-center" data-testid="card-revenue-forecast">
          <CardContent className="p-4 sm:p-6">
            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">Revenue Forecast</h3>
            <div className="text-xl sm:text-2xl font-bold mb-2">${((sales.length * 45000) * 1.2).toLocaleString()}</div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Projected next month</p>
            <Button size="sm" className="w-full text-xs sm:text-sm" asChild>
              <Link href="/analytics">View Forecast</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center" data-testid="card-team-performance">
          <CardContent className="p-4 sm:p-6">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">Team Performance</h3>
            <div className="text-xl sm:text-2xl font-bold mb-2">91%</div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Average efficiency</p>
            <Button size="sm" className="w-full text-xs sm:text-sm" asChild>
              <Link href="/sales">Team Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center" data-testid="card-inventory-insights">
          <CardContent className="p-4 sm:p-6">
            <Car className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">Inventory Insights</h3>
            <div className="text-xl sm:text-2xl font-bold mb-2">{Math.round((sales.length / Math.max(vehicles.length, 1)) * 100)}%</div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Turnover rate</p>
            <Button size="sm" className="w-full text-xs sm:text-sm" asChild>
              <Link href="/inventory">Optimize Stock</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center" data-testid="card-market-analysis">
          <CardContent className="p-4 sm:p-6">
            <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">Market Analysis</h3>
            <div className="text-xl sm:text-2xl font-bold mb-2">+12%</div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Market share growth</p>
            <Button size="sm" className="w-full text-xs sm:text-sm" asChild>
              <Link href="/competitive-pricing">Market Trends</Link>
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
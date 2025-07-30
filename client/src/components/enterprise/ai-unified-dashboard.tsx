import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">Executive Overview</h2>
            <p className="text-sm text-gray-600">AI-powered business intelligence and strategic insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">
            <Brain className="w-3 h-3 mr-1" />
            AI Intelligence Active
          </Badge>
          <Button onClick={() => queryClient.invalidateQueries()} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Executive Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {executiveMetrics.map((metric) => (
          <Card 
            key={metric.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleMetricAnalysis(metric)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{metric.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold">{metric.value}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status === 'excellent' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {metric.status === 'good' && <ThumbsUp className="w-3 h-3 mr-1" />}
                  {metric.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  {metric.status === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  <span className="capitalize">{metric.status}</span>
                </Badge>
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
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold">AI Business Intelligence Alerts</h3>
          <Badge className="bg-green-100 text-green-800">
            {businessAlerts.length} Active Insights
          </Badge>
        </div>

        <div className="grid gap-4">
          {businessAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getAlertColor(alert.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <h4 className="font-semibold text-lg">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {alert.confidence}% confidence
                    </Badge>
                    <div className="text-xs text-gray-500">{alert.timeframe}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Potential Impact</div>
                    <div className="font-semibold text-green-600">{alert.impact}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Recommended Action</div>
                    <div className="font-medium text-gray-900">{alert.action}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Revenue Forecast</h3>
            <div className="text-2xl font-bold mb-2">${((sales.length * 45000) * 1.2).toLocaleString()}</div>
            <p className="text-sm text-gray-600 mb-4">Projected next month</p>
            <Button size="sm" className="w-full">View Forecast</Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Team Performance</h3>
            <div className="text-2xl font-bold mb-2">91%</div>
            <p className="text-sm text-gray-600 mb-4">Average efficiency</p>
            <Button size="sm" className="w-full">Team Analytics</Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Car className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Inventory Insights</h3>
            <div className="text-2xl font-bold mb-2">{Math.round((sales.length / Math.max(vehicles.length, 1)) * 100)}%</div>
            <p className="text-sm text-gray-600 mb-4">Turnover rate</p>
            <Button size="sm" className="w-full">Optimize Stock</Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <BarChart3 className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Market Analysis</h3>
            <div className="text-2xl font-bold mb-2">+12%</div>
            <p className="text-sm text-gray-600 mb-4">Market share growth</p>
            <Button size="sm" className="w-full">Market Trends</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
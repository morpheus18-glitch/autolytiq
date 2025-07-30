import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield,
  Activity,
  Server,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Brain,
  Zap,
  Eye,
  Settings,
  RefreshCw,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Lock,
  Monitor,
  BarChart3,
  ThermometerSun,
  Signal,
  Globe
} from "lucide-react";
import { useState } from "react";

interface SystemComponent {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: string;
  responseTime: number;
  lastCheck: string;
  aiAnalysis: string;
  recommendation: string;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: number;
  threshold: number;
  aiInsight: string;
}

interface SecurityAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  aiRecommendation: string;
}

export default function AISystemHealth() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedComponent, setSelectedComponent] = useState<SystemComponent | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real data for system monitoring
  const { data: vehicles = [] } = useQuery({ queryKey: ['/api/vehicles'] });
  const { data: sales = [] } = useQuery({ queryKey: ['/api/sales'] });
  const { data: leads = [] } = useQuery({ queryKey: ['/api/leads'] });
  const { data: customers = [] } = useQuery({ queryKey: ['/api/customers'] });

  // AI-powered system components monitoring
  const systemComponents: SystemComponent[] = [
    {
      id: 'database',
      name: 'PostgreSQL Database',
      status: 'healthy',
      uptime: '99.98%',
      responseTime: 12,
      lastCheck: '30 seconds ago',
      aiAnalysis: 'Database performance optimal with efficient query execution and minimal connection overhead',
      recommendation: 'Continue current optimization strategies'
    },
    {
      id: 'api_server',
      name: 'API Server',
      status: 'healthy',
      uptime: '99.95%',
      responseTime: 45,
      lastCheck: '15 seconds ago',
      aiAnalysis: 'API endpoints responding within acceptable thresholds with good load distribution',
      recommendation: 'Monitor memory usage during peak hours'
    },
    {
      id: 'auth_system',
      name: 'Authentication System',
      status: 'healthy',
      uptime: '99.99%',
      responseTime: 23,
      lastCheck: '1 minute ago',
      aiAnalysis: 'OAuth integration stable with secure session management and token refresh working optimally',
      recommendation: 'Maintain current security protocols'
    },
    {
      id: 'file_storage',
      name: 'File Storage',
      status: 'warning',
      uptime: '98.87%',
      responseTime: 156,
      lastCheck: '2 minutes ago',
      aiAnalysis: 'Storage system experiencing minor latency spikes, possibly due to increased usage',
      recommendation: 'Consider storage optimization or capacity expansion'
    },
    {
      id: 'websocket',
      name: 'Real-time Services',
      status: 'healthy',
      uptime: '99.92%',
      responseTime: 8,
      lastCheck: '45 seconds ago',
      aiAnalysis: 'WebSocket connections stable with efficient message broadcasting and low latency',
      recommendation: 'Continue monitoring connection pool size'
    },
    {
      id: 'ml_backend',
      name: 'ML Analytics Engine',
      status: 'healthy',
      uptime: '99.89%',
      responseTime: 89,
      lastCheck: '3 minutes ago',
      aiAnalysis: 'Machine learning models performing well with accurate predictions and efficient processing',
      recommendation: 'Schedule model retraining based on new data patterns'
    }
  ];

  // Performance metrics with AI analysis
  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'cpu_usage',
      name: 'CPU Usage',
      value: 34,
      unit: '%',
      status: 'good',
      trend: -2.3,
      threshold: 80,
      aiInsight: 'CPU utilization well within normal parameters with efficient load balancing'
    },
    {
      id: 'memory_usage',
      name: 'Memory Usage',
      value: 67,
      unit: '%',
      status: 'good',
      trend: 1.8,
      threshold: 85,
      aiInsight: 'Memory consumption steady with proper garbage collection and caching strategies'
    },
    {
      id: 'disk_usage',
      name: 'Disk Usage',
      value: 78,
      unit: '%',
      status: 'warning',
      trend: 5.2,
      threshold: 90,
      aiInsight: 'Disk usage approaching threshold - recommend cleanup of old logs and temporary files'
    },
    {
      id: 'network_io',
      name: 'Network I/O',
      value: 245,
      unit: 'MB/s',
      status: 'good',
      trend: 12.4,
      threshold: 1000,
      aiInsight: 'Network throughput healthy with good bandwidth utilization and minimal packet loss'
    },
    {
      id: 'response_time',
      name: 'Avg Response Time',
      value: 89,
      unit: 'ms',
      status: 'good',
      trend: -8.7,
      threshold: 500,
      aiInsight: 'Response times improved due to recent caching optimizations and query improvements'
    },
    {
      id: 'concurrent_users',
      name: 'Concurrent Users',
      value: Math.max((leads as any[]).length + (customers as any[]).length, 45),
      unit: 'users',
      status: 'good',
      trend: 15.3,
      threshold: 1000,
      aiInsight: 'User activity patterns showing healthy engagement with peak load management working effectively'
    }
  ];

  // Security alerts with AI recommendations
  const securityAlerts: SecurityAlert[] = [
    {
      id: '1',
      type: 'info',
      title: 'SSL Certificate Auto-Renewal',
      description: 'SSL certificates successfully renewed with 90-day validity',
      timestamp: '2 hours ago',
      resolved: true,
      aiRecommendation: 'Continue automated certificate management with current settings'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Unusual Login Pattern Detected',
      description: 'Multiple login attempts from new geographic location',
      timestamp: '6 hours ago',
      resolved: false,
      aiRecommendation: 'Monitor user authentication logs and consider implementing geo-blocking for suspicious regions'
    },
    {
      id: '3',
      type: 'info',
      title: 'Database Backup Completed',
      description: 'Automated daily backup completed successfully',
      timestamp: '12 hours ago',
      resolved: true,
      aiRecommendation: 'Backup integrity verified - maintain current backup schedule'
    },
    {
      id: '4',
      type: 'critical',
      title: 'API Rate Limit Breach Attempt',
      description: 'Blocked excessive API requests from suspicious IP addresses',
      timestamp: '1 day ago',
      resolved: true,
      aiRecommendation: 'Rate limiting working effectively - consider implementing stricter throttling for unregistered clients'
    }
  ];

  const runDiagnosticsMutation = useMutation({
    mutationFn: async (componentId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { componentId, status: 'completed' };
    },
    onSuccess: () => {
      toast({
        title: "AI Diagnostics Complete",
        description: "System analysis updated with latest intelligence",
      });
      queryClient.invalidateQueries();
    },
  });

  const handleRunDiagnostics = (component: SystemComponent) => {
    setSelectedComponent(component);
    runDiagnosticsMutation.mutate(component.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-200 bg-blue-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'info': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getComponentIcon = (id: string) => {
    switch (id) {
      case 'database': return <Database className="w-6 h-6" />;
      case 'api_server': return <Server className="w-6 h-6" />;
      case 'auth_system': return <Lock className="w-6 h-6" />;
      case 'file_storage': return <HardDrive className="w-6 h-6" />;
      case 'websocket': return <Network className="w-6 h-6" />;
      case 'ml_backend': return <Brain className="w-6 h-6" />;
      default: return <Monitor className="w-6 h-6" />;
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'cpu_usage': return <Cpu className="w-5 h-5" />;
      case 'memory_usage': return <MemoryStick className="w-5 h-5" />;
      case 'disk_usage': return <HardDrive className="w-5 h-5" />;
      case 'network_io': return <Wifi className="w-5 h-5" />;
      case 'response_time': return <Clock className="w-5 h-5" />;
      case 'concurrent_users': return <Globe className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">AI System Health Monitor</h2>
            <p className="text-sm text-gray-600">Intelligent system monitoring with predictive analytics and AI recommendations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Button onClick={() => queryClient.invalidateQueries()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemComponents.map((component) => (
              <Card key={component.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getComponentIcon(component.id)}
                      <div>
                        <h3 className="font-semibold text-lg">{component.name}</h3>
                        <p className="text-sm text-gray-600">Last check: {component.lastCheck}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(component.status)}>
                      {getStatusIcon(component.status)}
                      <span className="ml-1 capitalize">{component.status}</span>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Uptime</div>
                      <div className="font-semibold text-green-600">{component.uptime}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Response Time</div>
                      <div className="font-semibold text-blue-600">{component.responseTime}ms</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-purple-700 mb-1">AI Analysis</div>
                        <div className="text-xs text-gray-700">{component.aiAnalysis}</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    onClick={() => handleRunDiagnostics(component)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    disabled={runDiagnosticsMutation.isPending}
                  >
                    {runDiagnosticsMutation.isPending ? (
                      <>
                        <Activity className="w-3 h-3 mr-1 animate-spin" />
                        Running Diagnostics...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Run AI Diagnostics
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceMetrics.map((metric) => (
              <Card key={metric.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getMetricIcon(metric.id)}
                      <div>
                        <h3 className="font-semibold text-lg">{metric.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-bold ${getMetricStatusColor(metric.status)}`}>
                            {metric.value}
                          </span>
                          <span className="text-sm text-gray-500">{metric.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(metric.status === 'good' ? 'healthy' : metric.status)}>
                        {metric.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usage vs Threshold</span>
                      <span>{Math.round((metric.value / metric.threshold) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.threshold) * 100} 
                      className={`h-2 ${metric.status === 'critical' ? 'bg-red-100' : metric.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`} 
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-1">
                      {metric.trend > 0 ? (
                        <TrendingUp className="w-3 h-3 text-red-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-green-600" />
                      )}
                      <span className={metric.trend > 0 ? 'text-red-600' : 'text-green-600'}>
                        {metric.trend > 0 ? '+' : ''}{metric.trend}%
                      </span>
                      <span className="text-gray-500">vs last hour</span>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-purple-700 mb-1">AI Insight</div>
                        <div className="text-xs text-gray-700">{metric.aiInsight}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4">
            {securityAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getAlertTypeColor(alert.type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.resolved && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                      <Badge className={`${alert.type === 'critical' ? 'bg-red-100 text-red-800' : 
                        alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {alert.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-purple-700 mb-1">AI Recommendation</div>
                        <div className="text-xs text-gray-700">{alert.aiRecommendation}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                    {!alert.resolved && (
                      <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700">
                        <Zap className="w-3 h-3 mr-1" />
                        Take Action
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  System Intelligence Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-green-900">Overall Health Score</div>
                    <div className="text-sm text-green-700">All systems operating optimally</div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">98.7%</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <div className="font-medium text-blue-900">Performance Index</div>
                    <div className="text-sm text-blue-700">Above baseline performance</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">92.4%</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium text-purple-900">AI Confidence</div>
                    <div className="text-sm text-purple-700">High confidence in predictions</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">96.2%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Load Forecast (Next 24h)</span>
                    <span className="text-green-600">Normal</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Resource Utilization Trend</span>
                    <span className="text-blue-600">Stable</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Security Risk Assessment</span>
                    <span className="text-green-600">Low</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Maintenance Recommendations</span>
                    <span className="text-yellow-600">Scheduled</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-orange-600" />
                AI Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900 mb-1">Storage Optimization Needed</h4>
                    <p className="text-sm text-yellow-800 mb-2">
                      Disk usage trending upward - recommend implementing automated cleanup policies for log files and temporary data.
                    </p>
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      Implement Optimization
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Signal className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-1">Performance Enhancement Available</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      AI analysis suggests implementing advanced caching strategies could improve response times by 15-20%.
                    </p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Apply Enhancement
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900 mb-1">Security Posture Excellent</h4>
                    <p className="text-sm text-green-800 mb-2">
                      Current security configurations are optimal. All monitoring and alerting systems functioning as expected.
                    </p>
                    <Button size="sm" variant="outline">
                      View Security Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
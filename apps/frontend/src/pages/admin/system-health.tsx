import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Cpu,
  HardDrive,
  Network,
  TrendingUp,
  Zap
} from "lucide-react";

export default function SystemHealth() {
  const systemMetrics = [
    {
      title: "Server Performance",
      value: "98.5%",
      status: "excellent",
      icon: <Server className="w-5 h-5" />,
      details: "Response time: 45ms avg"
    },
    {
      title: "Database Health",
      value: "99.2%",
      status: "excellent", 
      icon: <Database className="w-5 h-5" />,
      details: "Connection pool: 8/20 active"
    },
    {
      title: "Network Latency",
      value: "23ms",
      status: "good",
      icon: <Network className="w-5 h-5" />,
      details: "CDN performance optimized"
    },
    {
      title: "Security Status",
      value: "Secure",
      status: "excellent",
      icon: <Shield className="w-5 h-5" />,
      details: "SSL cert valid until 2025"
    }
  ];

  const recentEvents = [
    {
      time: "2 minutes ago",
      type: "info",
      message: "Database backup completed successfully",
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    },
    {
      time: "15 minutes ago", 
      type: "warning",
      message: "High CPU usage detected on server-2",
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />
    },
    {
      time: "1 hour ago",
      type: "info", 
      message: "SSL certificate renewed automatically",
      icon: <Shield className="w-4 h-4 text-blue-500" />
    },
    {
      time: "3 hours ago",
      type: "success",
      message: "All security scans passed",
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            System Health Monitor
          </h1>
          <p className="text-gray-600">Real-time monitoring and performance tracking</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">
            <Activity className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Button variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Run Diagnostics
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => (
          <Card key={index} className={`border-l-4 ${getStatusColor(metric.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="font-medium text-sm">{metric.title}</span>
                </div>
                <Badge variant="outline" className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-xs text-gray-600">{metric.details}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU & Memory Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>CPU Usage</span>
                <span>34%</span>
              </div>
              <Progress value={34} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Memory Usage</span>
                <span>67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Disk Usage</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Response Times */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">45ms</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">99.8%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">1,247</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">8.2GB</div>
                <div className="text-sm text-gray-600">Data Transfer</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent System Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                {event.icon}
                <div className="flex-1">
                  <div className="text-sm font-medium">{event.message}</div>
                  <div className="text-xs text-gray-500">{event.time}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">SSL Certificate</div>
                <div className="text-xs text-gray-600">Valid & Active</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Firewall Status</div>
                <div className="text-xs text-gray-600">Protected</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Security Scan</div>
                <div className="text-xs text-gray-600">Passed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
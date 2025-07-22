import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Clock,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Lock,
  Eye,
  RefreshCw,
  Settings
} from "lucide-react";

interface SystemMetricProps {
  title: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  usage: number;
  details: string;
  icon: React.ReactNode;
}

function SystemMetric({ title, value, status, usage, details, icon }: SystemMetricProps) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800'
  };

  const progressColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    critical: 'bg-red-500'
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{details}</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Usage</span>
              <span>{usage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${progressColors[status]}`}
                style={{ width: `${usage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SystemHealth() {
  const systemMetrics = [
    {
      title: "CPU Usage",
      value: "23%",
      status: 'healthy' as const,
      usage: 23,
      details: "Avg over last 24 hours",
      icon: <Cpu className="w-4 h-4 text-blue-600" />
    },
    {
      title: "Memory",
      value: "4.2GB",
      status: 'healthy' as const,
      usage: 52,
      details: "8GB total available",
      icon: <MemoryStick className="w-4 h-4 text-green-600" />
    },
    {
      title: "Storage",
      value: "127GB",
      status: 'warning' as const,
      usage: 76,
      details: "167GB total capacity",
      icon: <HardDrive className="w-4 h-4 text-orange-600" />
    },
    {
      title: "Database",
      value: "2.3ms",
      status: 'healthy' as const,
      usage: 15,
      details: "Avg query response time",
      icon: <Database className="w-4 h-4 text-purple-600" />
    },
    {
      title: "Network",
      value: "45ms",
      status: 'healthy' as const,
      usage: 30,
      details: "Avg latency to CDN",
      icon: <Network className="w-4 h-4 text-indigo-600" />
    },
    {
      title: "API Response",
      value: "127ms",
      status: 'healthy' as const,
      usage: 25,
      details: "95th percentile",
      icon: <Server className="w-4 h-4 text-teal-600" />
    }
  ];

  const services = [
    { name: "Authentication Service", status: 'online', uptime: '99.98%', lastCheck: '2 min ago' },
    { name: "Database Service", status: 'online', uptime: '99.95%', lastCheck: '1 min ago' },
    { name: "File Storage", status: 'online', uptime: '99.99%', lastCheck: '3 min ago' },
    { name: "Email Service", status: 'online', uptime: '99.92%', lastCheck: '1 min ago' },
    { name: "ML Processing", status: 'warning', uptime: '98.87%', lastCheck: '5 min ago' },
    { name: "CDN Network", status: 'online', uptime: '99.97%', lastCheck: '2 min ago' }
  ];

  const securityEvents = [
    {
      type: 'login',
      message: 'Successful admin login from verified IP',
      timestamp: '2 minutes ago',
      severity: 'info'
    },
    {
      type: 'api',
      message: 'API rate limit exceeded for 192.168.1.100',
      timestamp: '15 minutes ago',
      severity: 'warning'
    },
    {
      type: 'backup',
      message: 'Database backup completed successfully',
      timestamp: '1 hour ago',
      severity: 'info'
    },
    {
      type: 'security',
      message: 'SSL certificate renewal in 30 days',
      timestamp: '2 hours ago',
      severity: 'warning'
    },
    {
      type: 'system',
      message: 'System health check passed all metrics',
      timestamp: '3 hours ago',
      severity: 'info'
    }
  ];

  const recentAlerts = [
    {
      title: "Storage Usage Warning",
      description: "Storage usage has exceeded 75% threshold",
      severity: 'warning',
      time: '10 minutes ago',
      resolved: false
    },
    {
      title: "ML Service Degraded",
      description: "Machine learning processing experiencing delays",
      severity: 'warning',
      time: '2 hours ago',
      resolved: false
    },
    {
      title: "High Traffic Volume",
      description: "Unusual traffic spike detected at 2:30 PM",
      severity: 'info',
      time: '4 hours ago',
      resolved: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring and system performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            All Systems Operational
          </Badge>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemMetrics.map((metric, index) => (
          <SystemMetric key={index} {...metric} />
        ))}
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-600" />
            Service Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <div className="flex items-center space-x-2">
                    {service.status === 'online' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                    <Badge variant={service.status === 'online' ? 'default' : 'secondary'}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Uptime: {service.uptime}</div>
                  <div>Last check: {service.lastCheck}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Security Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    event.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{event.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{event.timestamp}</div>
                  </div>
                  <Badge variant={event.severity === 'warning' ? 'secondary' : 'outline'} className="text-xs">
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                Active Alerts
              </div>
              <Badge variant="outline">{recentAlerts.filter(a => !a.resolved).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.resolved ? 'bg-gray-50 border-gray-200' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`font-medium ${
                        alert.resolved ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {alert.title}
                      </div>
                      <div className={`text-sm ${
                        alert.resolved ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {alert.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{alert.time}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={alert.resolved ? 'secondary' : 'outline'}>
                        {alert.severity}
                      </Badge>
                      {alert.resolved ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Button size="sm" variant="outline">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Performance Trends (24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.8%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-gray-600">API Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">127ms</div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">0.02%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Application</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">v2.1.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-medium">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Build:</span>
                  <span className="font-medium">#2024.01.15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Deploy:</span>
                  <span className="font-medium">2 days ago</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Infrastructure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">Replit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Region:</span>
                  <span className="font-medium">US-East</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node Version:</span>
                  <span className="font-medium">v18.17.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SSL Status:</span>
                  <span className="font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Database</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">14.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">2.1GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup:</span>
                  <span className="font-medium">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
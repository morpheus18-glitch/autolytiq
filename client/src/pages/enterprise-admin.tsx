import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Shield, 
  Settings, 
  Database, 
  Key, 
  Bell,
  Monitor,
  FileText,
  Lock,
  Globe,
  Server,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function EnterpriseAdmin() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">Enterprise admin access required</p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Login to Access Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminModules = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions across the organization",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      stats: { total: "247 Users", active: "234 Active", pending: "13 Pending" },
      actions: ["Add User", "Bulk Import", "Role Assignment"]
    },
    {
      title: "Security Center",
      description: "Monitor security events, manage access controls, and audit logs",
      icon: <Shield className="w-6 h-6 text-green-600" />,
      stats: { total: "99.8% Secure", active: "12 Policies", pending: "2 Alerts" },
      actions: ["View Logs", "Security Scan", "Policy Update"]
    },
    {
      title: "System Configuration",
      description: "Configure system settings, integrations, and business rules",
      icon: <Settings className="w-6 h-6 text-purple-600" />,
      stats: { total: "156 Settings", active: "89% Complete", pending: "17 Pending" },
      actions: ["Global Settings", "Integrations", "Workflows"]
    },
    {
      title: "Database Management",
      description: "Monitor database performance, manage backups, and data integrity",
      icon: <Database className="w-6 h-6 text-orange-600" />,
      stats: { total: "2.1GB Size", active: "99.95% Up", pending: "0 Issues" },
      actions: ["Backup Now", "Optimize", "Migration"]
    },
    {
      title: "API Management",
      description: "Manage API keys, monitor usage, and configure rate limits",
      icon: <Key className="w-6 h-6 text-indigo-600" />,
      stats: { total: "23 APIs", active: "18 Active", pending: "5 Pending" },
      actions: ["New Key", "Usage Report", "Rate Limits"]
    },
    {
      title: "Notifications",
      description: "Configure system notifications, alerts, and communication channels",
      icon: <Bell className="w-6 h-6 text-yellow-600" />,
      stats: { total: "89 Rules", active: "76 Active", pending: "13 Pending" },
      actions: ["New Rule", "Test Alert", "Templates"]
    }
  ];

  const systemMetrics = [
    { label: "Total Users", value: "247", change: "+12", status: "up" },
    { label: "Active Sessions", value: "89", change: "+5", status: "up" },
    { label: "System Uptime", value: "99.8%", change: "+0.2%", status: "up" },
    { label: "Security Score", value: "95/100", change: "+3", status: "up" }
  ];

  const recentActivities = [
    { user: "Admin", action: "Updated user permissions for Sales Team", time: "5 min ago", type: "security" },
    { user: "System", action: "Automated backup completed successfully", time: "1 hour ago", type: "system" },
    { user: "Manager", action: "Created new workflow template", time: "2 hours ago", type: "config" },
    { user: "Admin", action: "API rate limit adjusted for integration", time: "3 hours ago", type: "api" },
    { user: "System", action: "Security scan completed - no issues found", time: "4 hours ago", type: "security" }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enterprise Administration</h1>
          <p className="text-gray-600">System management and configuration center</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="w-3 h-3 mr-1" />
            All Systems Online
          </Badge>
          <Button variant="outline">
            <Monitor className="w-4 h-4 mr-2" />
            System Health
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.label}</div>
              <div className="text-xs text-green-600 mt-1">
                {metric.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System Config</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {adminModules.map((module, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    {module.icon}
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-gray-600">{module.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{module.stats.total}</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-medium text-green-700">{module.stats.active}</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="font-medium text-orange-700">{module.stats.pending}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {module.actions.map((action, actionIndex) => (
                        <Button key={actionIndex} size="sm" variant="outline" className="flex-1 text-xs">
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Management Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="font-semibold mb-4">Active Users</h3>
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Johnson", role: "Sales Manager", status: "online", lastActive: "now" },
                      { name: "Michael Chen", role: "Senior Sales", status: "online", lastActive: "5 min ago" },
                      { name: "Amanda Rodriguez", role: "Finance Manager", status: "away", lastActive: "1 hour ago" },
                      { name: "David Kim", role: "Sales Associate", status: "offline", lastActive: "2 hours ago" }
                    ].map((user, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' : 
                            user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-600">{user.role}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{user.lastActive}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Add New User
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Bulk Import
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Role Management
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Security Score</div>
                      <div className="text-sm text-gray-600">Overall system security rating</div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">95/100</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>SSL Certificate</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Valid</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Two-Factor Auth</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Password Policy</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Strong</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Failed Login Attempts</span>
                      <Badge variant="outline">0 today</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { event: "Successful admin login", time: "2 min ago", type: "info" },
                    { event: "Password policy updated", time: "1 hour ago", type: "config" },
                    { event: "Security scan completed", time: "4 hours ago", type: "scan" },
                    { event: "SSL certificate renewed", time: "2 days ago", type: "certificate" }
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-2 text-sm">
                      <div>
                        <div className="font-medium">{event.event}</div>
                        <div className="text-gray-600">{event.time}</div>
                      </div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Global Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Timezone</div>
                        <div className="text-sm text-gray-600">America/New_York</div>
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Default Currency</div>
                        <div className="text-sm text-gray-600">USD ($)</div>
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Session Timeout</div>
                        <div className="text-sm text-gray-600">8 hours</div>
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Integrations</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Email Service</div>
                        <div className="text-sm text-gray-600">SendGrid - Active</div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">SMS Service</div>
                        <div className="text-sm text-gray-600">Twilio - Configured</div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Analytics</div>
                        <div className="text-sm text-gray-600">Google Analytics</div>
                      </div>
                      <Badge variant="outline">Setup Required</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">99.8%</div>
                    <div className="text-sm text-gray-600">System Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2.3ms</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                    <div className="text-sm text-gray-600">Daily API Calls</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-2">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.type === 'security' ? 'bg-red-500' :
                            activity.type === 'system' ? 'bg-blue-500' :
                            activity.type === 'config' ? 'bg-purple-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <div className="font-medium text-sm">{activity.action}</div>
                            <div className="text-xs text-gray-600">by {activity.user}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    ))}
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
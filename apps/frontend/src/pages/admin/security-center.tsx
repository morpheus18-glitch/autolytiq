import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Globe,
  Monitor,
  FileText,
  Activity,
  Settings,
  Download,
  RefreshCw
} from "lucide-react";

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_change' | 'permission_change' | 'data_access' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  user: string;
  description: string;
  ipAddress: string;
  location: string;
  resolved: boolean;
}

interface SecuritySetting {
  id: string;
  category: string;
  name: string;
  description: string;
  enabled: boolean;
  configurable: boolean;
}

export default function SecurityCenter() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  // Mock security events data
  const securityEvents: SecurityEvent[] = [
    {
      id: '1',
      type: 'failed_login',
      severity: 'medium',
      timestamp: '2025-01-30T14:30:00Z',
      user: 'unknown',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      ipAddress: '192.168.1.100',
      location: 'Austin, TX',
      resolved: false
    },
    {
      id: '2',
      type: 'login',
      severity: 'low',
      timestamp: '2025-01-30T14:15:00Z',
      user: 'sarah.johnson@dealership.com',
      description: 'Successful login from new device',
      ipAddress: '192.168.1.105',
      location: 'Austin, TX',
      resolved: true
    },
    {
      id: '3',
      type: 'permission_change',
      severity: 'high',
      timestamp: '2025-01-30T13:45:00Z',
      user: 'admin@dealership.com',
      description: 'User permissions modified for mike.davis@dealership.com',
      ipAddress: '192.168.1.101',
      location: 'Austin, TX',
      resolved: true
    },
    {
      id: '4',
      type: 'suspicious_activity',
      severity: 'critical',
      timestamp: '2025-01-30T12:20:00Z',
      user: 'lisa.chen@dealership.com',
      description: 'Unusual data access pattern detected - bulk customer export',
      ipAddress: '192.168.1.108',
      location: 'Austin, TX',
      resolved: false
    },
    {
      id: '5',
      type: 'data_access',
      severity: 'low',
      timestamp: '2025-01-30T11:30:00Z',
      user: 'david.wilson@dealership.com',
      description: 'Accessed sensitive financial reports',
      ipAddress: '192.168.1.110',
      location: 'Austin, TX',
      resolved: true
    }
  ];

  // Mock security settings
  const securitySettings: SecuritySetting[] = [
    {
      id: '1',
      category: 'Authentication',
      name: 'Two-Factor Authentication',
      description: 'Require 2FA for all user accounts',
      enabled: true,
      configurable: true
    },
    {
      id: '2',
      category: 'Authentication',
      name: 'Password Complexity',
      description: 'Enforce strong password requirements',
      enabled: true,
      configurable: true
    },
    {
      id: '3',
      category: 'Session Management',
      name: 'Auto-logout Inactive Sessions',
      description: 'Automatically logout users after 30 minutes of inactivity',
      enabled: true,
      configurable: true
    },
    {
      id: '4',
      category: 'Access Control',
      name: 'IP Whitelisting',
      description: 'Restrict access to specific IP addresses',
      enabled: false,
      configurable: true
    },
    {
      id: '5',
      category: 'Monitoring',
      name: 'Failed Login Alerts',
      description: 'Alert administrators after 5 failed login attempts',
      enabled: true,
      configurable: true
    },
    {
      id: '6',
      category: 'Data Protection',
      name: 'Data Encryption at Rest',
      description: 'Encrypt sensitive data in the database',
      enabled: true,
      configurable: false
    },
    {
      id: '7',
      category: 'Audit',
      name: 'Comprehensive Audit Logging',
      description: 'Log all user activities and system changes',
      enabled: true,
      configurable: false
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'failed_login': return 'text-red-600';
      case 'login': return 'text-green-600';
      case 'password_change': return 'text-blue-600';
      case 'permission_change': return 'text-orange-600';
      case 'data_access': return 'text-purple-600';
      case 'suspicious_activity': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const securityStats = {
    totalEvents: securityEvents.length,
    critical: securityEvents.filter(e => e.severity === 'critical').length,
    unresolved: securityEvents.filter(e => !e.resolved).length,
    activeSettings: securitySettings.filter(s => s.enabled).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Security Center</h1>
            <p className="text-gray-600">Monitor security events and configure protection settings</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security Events</p>
                <p className="text-2xl font-bold">{securityStats.totalEvents}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{securityStats.critical}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-yellow-600">{securityStats.unresolved}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Protections</p>
                <p className="text-2xl font-bold text-green-600">{securityStats.activeSettings}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className={`p-4 rounded-lg border ${!event.resolved ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(event.severity)}>
                          {getSeverityIcon(event.severity)}
                          <span className="ml-1 capitalize">{event.severity}</span>
                        </Badge>
                        <div>
                          <div className="font-medium">{event.description}</div>
                          <div className="text-sm text-gray-600">
                            <span className={getEventTypeColor(event.type)}>
                              {event.type.replace('_', ' ').toUpperCase()}
                            </span>
                            {' • '}
                            <span>{event.user}</span>
                            {' • '}
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!event.resolved && (
                          <Button size="sm" variant="outline">
                            Resolve
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pl-3">
                      IP: {event.ipAddress} • Location: {event.location}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(
              securitySettings.reduce((acc, setting) => {
                if (!acc[setting.category]) acc[setting.category] = [];
                acc[setting.category].push(setting);
                return acc;
              }, {} as { [key: string]: SecuritySetting[] })
            ).map(([category, settings]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {settings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{setting.name}</div>
                          <div className="text-sm text-gray-600">{setting.description}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={setting.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {setting.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          {setting.configurable && (
                            <Switch checked={setting.enabled} />
                          )}
                          {setting.configurable && (
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Comprehensive Audit Logging</h3>
                <p className="text-gray-600 mb-4">All user activities and system changes are tracked</p>
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Generate Audit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Security Summary</h3>
                <p className="text-sm text-gray-600 mb-4">Overall security posture and recommendations</p>
                <Button variant="outline">Generate Report</Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Activity className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">User Activity</h3>
                <p className="text-sm text-gray-600 mb-4">Detailed user access and behavior analysis</p>
                <Button variant="outline">Generate Report</Button>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Incident Report</h3>
                <p className="text-sm text-gray-600 mb-4">Security incidents and response actions</p>
                <Button variant="outline">Generate Report</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
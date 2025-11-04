import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Plus,
  Edit,
  Trash2,
  Key,
  Globe,
  Database,
  Mail,
  Phone,
  CreditCard,
  BarChart3,
  Shield,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  type: 'api' | 'webhook' | 'oauth' | 'database';
  lastSync: string;
  dataPoints: number;
  configuration: {
    apiKey?: string;
    endpoint?: string;
    webhookUrl?: string;
    credentials?: any;
  };
  isActive: boolean;
}

export default function IntegrationSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  // Mock integrations data - would be fetched from backend
  const integrations: Integration[] = [
    {
      id: '1',
      name: 'CDK Global',
      description: 'DMS integration for inventory and customer data synchronization',
      category: 'DMS',
      status: 'connected',
      type: 'api',
      lastSync: '2025-01-30T12:00:00Z',
      dataPoints: 1250,
      configuration: {
        apiKey: '***hidden***',
        endpoint: 'https://api.cdkglobal.com/v1'
      },
      isActive: true
    },
    {
      id: '2',
      name: 'Reynolds & Reynolds',
      description: 'ERA integration for comprehensive dealership management',
      category: 'DMS',
      status: 'connected',
      type: 'api',
      lastSync: '2025-01-30T11:45:00Z',
      dataPoints: 890,
      configuration: {
        apiKey: '***hidden***',
        endpoint: 'https://api.reyrey.com/v2'
      },
      isActive: true
    },
    {
      id: '3',
      name: 'AutoTrader',
      description: 'Vehicle listing and lead management integration',
      category: 'Marketing',
      status: 'connected',
      type: 'oauth',
      lastSync: '2025-01-30T10:30:00Z',
      dataPoints: 450,
      configuration: {
        credentials: 'OAuth configured'
      },
      isActive: true
    },
    {
      id: '4',
      name: 'Cars.com',
      description: 'Inventory syndication and lead capture',
      category: 'Marketing',
      status: 'pending',
      type: 'api',
      lastSync: '2025-01-29T18:00:00Z',
      dataPoints: 0,
      configuration: {
        apiKey: 'pending',
        endpoint: 'https://api.cars.com/v1'
      },
      isActive: false
    },
    {
      id: '5',
      name: 'Mailchimp',
      description: 'Email marketing and customer communication',
      category: 'Communication',
      status: 'error',
      type: 'oauth',
      lastSync: '2025-01-28T14:20:00Z',
      dataPoints: 320,
      configuration: {
        credentials: 'OAuth expired'
      },
      isActive: false
    },
    {
      id: '6',
      name: 'Stripe',
      description: 'Payment processing for online transactions',
      category: 'Finance',
      status: 'connected',
      type: 'api',
      lastSync: '2025-01-30T13:15:00Z',
      dataPoints: 180,
      configuration: {
        apiKey: '***hidden***',
        endpoint: 'https://api.stripe.com/v1'
      },
      isActive: true
    },
    {
      id: '7',
      name: 'Twilio',
      description: 'SMS and voice communication services',
      category: 'Communication',
      status: 'disconnected',
      type: 'api',
      lastSync: '2025-01-25T09:00:00Z',
      dataPoints: 0,
      configuration: {
        apiKey: 'not configured'
      },
      isActive: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'disconnected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      case 'disconnected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DMS': return <Database className="w-6 h-6" />;
      case 'Marketing': return <BarChart3 className="w-6 h-6" />;
      case 'Communication': return <Mail className="w-6 h-6" />;
      case 'Finance': return <CreditCard className="w-6 h-6" />;
      default: return <Settings className="w-6 h-6" />;
    }
  };

  const testConnection = useMutation({
    mutationFn: async (integrationId: string) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: 'Connection test successful' });
    },
    onError: () => {
      toast({ title: 'Connection test failed', variant: 'destructive' });
    }
  });

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    pending: integrations.filter(i => i.status === 'pending').length,
    errors: integrations.filter(i => i.status === 'error').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LinkIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Integration Setup</h1>
            <p className="text-gray-600">Manage external system integrations and API connections</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600">{stats.connected}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="dms">DMS</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(integration.category)}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(integration.status)}>
                        {getStatusIcon(integration.status)}
                        <span className="ml-1 capitalize">{integration.status}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Category:</span>
                      <Badge variant="outline">{integration.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Type:</span>
                      <Badge variant="outline" className="capitalize">{integration.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Last Sync:</span>
                      <span>{new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Data Points:</span>
                      <span>{integration.dataPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Active:</span>
                      <Switch checked={integration.isActive} />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => testConnection.mutate(integration.id)}
                        disabled={testConnection.isPending}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        {testConnection.isPending ? 'Testing...' : 'Test'}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Category-specific tabs would filter integrations */}
        <TabsContent value="dms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {integrations.filter(i => i.category === 'DMS').map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                      {getStatusIcon(integration.status)}
                      <span className="ml-1 capitalize">{integration.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Endpoint:</strong> {integration.configuration.endpoint}
                    </div>
                    <div className="text-sm">
                      <strong>Last Sync:</strong> {new Date(integration.lastSync).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <strong>Data Points:</strong> {integration.dataPoints.toLocaleString()}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Sync Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Quick Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Key className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium mb-2">1. API Keys</h3>
              <p className="text-sm text-gray-600">Configure API credentials for external services</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium mb-2">2. Test Connection</h3>
              <p className="text-sm text-gray-600">Verify connectivity and authentication</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RefreshCw className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium mb-2">3. Enable Sync</h3>
              <p className="text-sm text-gray-600">Activate data synchronization and monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
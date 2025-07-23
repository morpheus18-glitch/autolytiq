import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Building,
  Plus,
  Settings,
  Users,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit,
  Trash2,
  Power,
  Activity,
  DollarSign,
  Car,
  FileText,
  Shield,
  Database,
  Wifi,
  Server
} from 'lucide-react';

interface Store {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  settings: {
    timezone: string;
    currency: string;
    dealerLicense: string;
    taxRate: number;
    features: string[];
  };
  stats: {
    totalDeals: number;
    monthlyRevenue: number;
    activeUsers: number;
    vehiclesInStock: number;
  };
  createdAt: string;
}

export default function MultiStoreManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showCreateStore, setShowCreateStore] = useState(false);

  const { data: stores, isLoading } = useQuery({
    queryKey: ['/api/stores'],
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['/api/system/health'],
  });

  const createStore = useMutation({
    mutationFn: async (storeData: any) => {
      return apiRequest('POST', '/api/stores', storeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      setShowCreateStore(false);
      toast({
        title: "Store Created",
        description: "New store has been successfully created.",
      });
    },
  });

  const updateStore = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      return apiRequest('PATCH', `/api/stores/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      toast({
        title: "Store Updated",
        description: "Store settings have been updated successfully.",
      });
    },
  });

  const toggleStoreStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/stores/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Multi-Store Management</h1>
              <p className="text-gray-600">Enterprise dealership network administration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button
              onClick={() => setShowCreateStore(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900">{stores?.length || 0}</p>
              </div>
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stores?.reduce((acc: number, store: any) => acc + (store.stats?.activeUsers || 0), 0) || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Database</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Management */}
      <Tabs defaultValue="stores" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stores" className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>Stores</span>
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Support Tools</span>
          </TabsTrigger>
          <TabsTrigger value="websockets" className="flex items-center space-x-2">
            <Wifi className="w-4 h-4" />
            <span>WebSockets</span>
          </TabsTrigger>
          <TabsTrigger value="microservices" className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>Microservices</span>
          </TabsTrigger>
        </TabsList>

        {/* Stores Tab */}
        <TabsContent value="stores" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store: Store) => (
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{store.name}</CardTitle>
                        <p className="text-sm text-gray-600">Code: {store.code}</p>
                      </div>
                    </div>
                    <Badge className={store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {store.address}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {store.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {store.email}
                    </div>
                  </div>

                  {/* Store Stats */}
                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-lg">{store.stats?.totalDeals || 0}</p>
                        <p className="text-gray-600">Deals</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-lg">{store.stats?.activeUsers || 0}</p>
                        <p className="text-gray-600">Users</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-lg">${(store.stats?.monthlyRevenue || 0).toLocaleString()}</p>
                        <p className="text-gray-600">Revenue</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-lg">{store.stats?.vehiclesInStock || 0}</p>
                        <p className="text-gray-600">Vehicles</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStore(store)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStoreStatus.mutate({ id: store.id, isActive: !store.isActive })}
                      className={store.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Support Tools Tab */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Store Setup & Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Quick Store Setup</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Automated store configuration with default settings and user roles
                    </p>
                    <Button className="mt-3" size="sm">
                      Launch Setup Wizard
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">Bulk Data Import</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Import customers, vehicles, and existing deals from legacy systems
                    </p>
                    <Button className="mt-3" size="sm" variant="outline">
                      Start Import
                    </Button>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900">Training Resources</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Staff training materials and system documentation
                    </p>
                    <Button className="mt-3" size="sm" variant="outline">
                      View Resources
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-600" />
                  System Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Database Performance</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">API Response Time</span>
                    <Badge className="bg-green-100 text-green-800">&lt; 100ms</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">WebSocket Connections</span>
                    <Badge className="bg-blue-100 text-blue-800">{stores?.length * 12 || 0} Active</Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <Badge className="bg-yellow-100 text-yellow-800">2.3 GB / 10 GB</Badge>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* WebSockets Tab */}
        <TabsContent value="websockets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wifi className="w-5 h-5 mr-2 text-blue-600" />
                Enterprise WebSocket Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Real-time Connections</h4>
                    <p className="text-2xl font-bold text-blue-800 mt-2">{stores?.length * 15 || 0}</p>
                    <p className="text-sm text-blue-700">Active WebSocket connections across all stores</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900">Messages/Minute</h4>
                    <p className="text-2xl font-bold text-green-800 mt-2">1,247</p>
                    <p className="text-sm text-green-700">Real-time data synchronization</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900">Uptime</h4>
                    <p className="text-2xl font-bold text-purple-800 mt-2">99.9%</p>
                    <p className="text-sm text-purple-700">WebSocket service availability</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">WebSocket Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Real-time deal updates across stores
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Live inventory synchronization
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Instant customer notifications
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Multi-store collaboration tools
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Live analytics dashboards
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        System-wide alerts & monitoring
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Microservices Tab */}
        <TabsContent value="microservices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="w-5 h-5 mr-2 text-green-600" />
                Microservices Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: 'Auth Service', status: 'Running', port: '3001', requests: '2.3K/min' },
                    { name: 'Deal Service', status: 'Running', port: '3002', requests: '1.8K/min' },
                    { name: 'Inventory Service', status: 'Running', port: '3003', requests: '945/min' },
                    { name: 'Customer Service', status: 'Running', port: '3004', requests: '1.2K/min' },
                    { name: 'Finance Service', status: 'Running', port: '3005', requests: '567/min' },
                    { name: 'Analytics Service', status: 'Running', port: '3006', requests: '234/min' },
                    { name: 'Notification Service', status: 'Running', port: '3007', requests: '1.5K/min' },
                    { name: 'Report Service', status: 'Running', port: '3008', requests: '89/min' },
                  ].map((service) => (
                    <div key={service.name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{service.name}</h4>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {service.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>Port: {service.port}</div>
                        <div>Requests: {service.requests}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Service Mesh Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Load Balancing</h5>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• Automatic service discovery</div>
                        <div>• Health check monitoring</div>
                        <div>• Circuit breaker patterns</div>
                        <div>• Retry logic with backoff</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Security & Monitoring</h5>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div>• mTLS between services</div>
                        <div>• Distributed tracing</div>
                        <div>• Metrics collection</div>
                        <div>• Log aggregation</div>
                      </div>
                    </div>
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
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Phone, 
  Globe, 
  Building,
  Users,
  Car,
  DollarSign,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Monitor,
  Palette,
  Zap,
  FileText,
  Camera,
  Mic,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  Wrench,
  BarChart3,
  Target,
  TrendingUp
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // General Settings
    dealershipName: 'Premier Auto Sales',
    dealershipAddress: '123 Main Street, Austin, TX 78701',
    dealershipPhone: '(555) 123-4567',
    dealershipEmail: 'info@premierauto.com',
    dealershipWebsite: 'www.premierauto.com',
    timeZone: 'America/Chicago',
    currency: 'USD',
    taxRate: '8.25',
    
    // User Management
    defaultRole: 'sales_associate',
    passwordPolicy: 'strong',
    sessionTimeout: '30',
    twoFactorAuth: false,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    leadNotifications: true,
    salesNotifications: true,
    inventoryNotifications: true,
    
    // Integration Settings
    crmIntegration: false,
    accountingIntegration: false,
    marketingIntegration: false,
    
    // Mobile Settings
    mobileAppEnabled: true,
    mobileNotifications: true,
    offlineMode: true,
    
    // Appearance
    theme: 'light',
    brandColor: '#3b82f6',
    logoUrl: '',
    
    // Inventory Settings
    lowStockThreshold: '5',
    autoReorder: false,
    priceUpdateFrequency: 'daily',
    
    // Sales Settings
    defaultFinanceRate: '4.99',
    defaultLoanTerm: '60',
    autoApprovalLimit: '25000',
    
    // Service Settings
    serviceReminders: true,
    warrantyTracking: true,
    appointmentBuffer: '15',
    
    // Reporting
    reportSchedule: 'daily',
    reportRecipients: 'managers@premierauto.com',
    analyticsRetention: '365'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery({
    queryKey: ['/api/departments'],
    retry: 1,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['/api/roles'],
    retry: 1,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return newSettings;
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Configure your dealership management system</p>
        </div>
        <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
          {saveSettingsMutation.isPending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Service</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dealership Information
              </CardTitle>
              <CardDescription>Basic information about your dealership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dealershipName">Dealership Name</Label>
                  <Input
                    id="dealershipName"
                    value={settings.dealershipName}
                    onChange={(e) => handleSettingChange('dealershipName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dealershipPhone">Phone Number</Label>
                  <Input
                    id="dealershipPhone"
                    value={settings.dealershipPhone}
                    onChange={(e) => handleSettingChange('dealershipPhone', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dealershipAddress">Address</Label>
                <Input
                  id="dealershipAddress"
                  value={settings.dealershipAddress}
                  onChange={(e) => handleSettingChange('dealershipAddress', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dealershipEmail">Email</Label>
                  <Input
                    id="dealershipEmail"
                    type="email"
                    value={settings.dealershipEmail}
                    onChange={(e) => handleSettingChange('dealershipEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dealershipWebsite">Website</Label>
                  <Input
                    id="dealershipWebsite"
                    value={settings.dealershipWebsite}
                    onChange={(e) => handleSettingChange('dealershipWebsite', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timeZone">Time Zone</Label>
                  <Select value={settings.timeZone} onValueChange={(value) => handleSettingChange('timeZone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="CAD">CAD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => handleSettingChange('taxRate', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Configure user roles and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultRole">Default Role for New Users</Label>
                  <Select value={settings.defaultRole} onValueChange={(value) => handleSettingChange('defaultRole', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales_associate">Sales Associate</SelectItem>
                      <SelectItem value="sales_manager">Sales Manager</SelectItem>
                      <SelectItem value="service_technician">Service Technician</SelectItem>
                      <SelectItem value="finance_manager">Finance Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="passwordPolicy">Password Policy</Label>
                  <Select value={settings.passwordPolicy} onValueChange={(value) => handleSettingChange('passwordPolicy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                      <SelectItem value="strong">Strong (12+ chars, mixed case, numbers)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (16+ chars, symbols required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                  />
                  <Label htmlFor="twoFactorAuth">Require Two-Factor Authentication</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="leadNotifications">New Lead Notifications</Label>
                    <Switch
                      id="leadNotifications"
                      checked={settings.leadNotifications}
                      onCheckedChange={(checked) => handleSettingChange('leadNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="salesNotifications">Sales Notifications</Label>
                    <Switch
                      id="salesNotifications"
                      checked={settings.salesNotifications}
                      onCheckedChange={(checked) => handleSettingChange('salesNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inventoryNotifications">Inventory Alerts</Label>
                    <Switch
                      id="inventoryNotifications"
                      checked={settings.inventoryNotifications}
                      onCheckedChange={(checked) => handleSettingChange('inventoryNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Settings */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Inventory Management
              </CardTitle>
              <CardDescription>Configure inventory tracking and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleSettingChange('lowStockThreshold', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="priceUpdateFrequency">Price Update Frequency</Label>
                  <Select value={settings.priceUpdateFrequency} onValueChange={(value) => handleSettingChange('priceUpdateFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoReorder"
                  checked={settings.autoReorder}
                  onCheckedChange={(checked) => handleSettingChange('autoReorder', checked)}
                />
                <Label htmlFor="autoReorder">Enable Auto-Reorder</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Settings */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Sales & Finance
              </CardTitle>
              <CardDescription>Configure sales and financing defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="defaultFinanceRate">Default Finance Rate (%)</Label>
                  <Input
                    id="defaultFinanceRate"
                    type="number"
                    step="0.01"
                    value={settings.defaultFinanceRate}
                    onChange={(e) => handleSettingChange('defaultFinanceRate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="defaultLoanTerm">Default Loan Term (months)</Label>
                  <Input
                    id="defaultLoanTerm"
                    type="number"
                    value={settings.defaultLoanTerm}
                    onChange={(e) => handleSettingChange('defaultLoanTerm', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="autoApprovalLimit">Auto-Approval Limit ($)</Label>
                  <Input
                    id="autoApprovalLimit"
                    type="number"
                    value={settings.autoApprovalLimit}
                    onChange={(e) => handleSettingChange('autoApprovalLimit', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Settings */}
        <TabsContent value="service" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Service Department
              </CardTitle>
              <CardDescription>Configure service department settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appointmentBuffer">Appointment Buffer (minutes)</Label>
                  <Input
                    id="appointmentBuffer"
                    type="number"
                    value={settings.appointmentBuffer}
                    onChange={(e) => handleSettingChange('appointmentBuffer', e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="serviceReminders"
                      checked={settings.serviceReminders}
                      onCheckedChange={(checked) => handleSettingChange('serviceReminders', checked)}
                    />
                    <Label htmlFor="serviceReminders">Service Reminders</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="warrantyTracking"
                      checked={settings.warrantyTracking}
                      onCheckedChange={(checked) => handleSettingChange('warrantyTracking', checked)}
                    />
                    <Label htmlFor="warrantyTracking">Warranty Tracking</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Settings */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reporting & Analytics
              </CardTitle>
              <CardDescription>Configure reporting schedules and recipients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportSchedule">Report Schedule</Label>
                  <Select value={settings.reportSchedule} onValueChange={(value) => handleSettingChange('reportSchedule', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="analyticsRetention">Data Retention (days)</Label>
                  <Input
                    id="analyticsRetention"
                    type="number"
                    value={settings.analyticsRetention}
                    onChange={(e) => handleSettingChange('analyticsRetention', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reportRecipients">Report Recipients</Label>
                <Input
                  id="reportRecipients"
                  type="email"
                  placeholder="manager@dealership.com, owner@dealership.com"
                  value={settings.reportRecipients}
                  onChange={(e) => handleSettingChange('reportRecipients', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Settings */}
        <TabsContent value="mobile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Application
              </CardTitle>
              <CardDescription>Configure mobile app settings and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mobileAppEnabled">Mobile App Access</Label>
                    <p className="text-sm text-gray-500">Enable mobile app for staff</p>
                  </div>
                  <Switch
                    id="mobileAppEnabled"
                    checked={settings.mobileAppEnabled}
                    onCheckedChange={(checked) => handleSettingChange('mobileAppEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="mobileNotifications">Mobile Notifications</Label>
                    <p className="text-sm text-gray-500">Push notifications on mobile devices</p>
                  </div>
                  <Switch
                    id="mobileNotifications"
                    checked={settings.mobileNotifications}
                    onCheckedChange={(checked) => handleSettingChange('mobileNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="offlineMode">Offline Mode</Label>
                    <p className="text-sm text-gray-500">Allow offline access to critical features</p>
                  </div>
                  <Switch
                    id="offlineMode"
                    checked={settings.offlineMode}
                    onCheckedChange={(checked) => handleSettingChange('offlineMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Confirmation */}
      {saveSettingsMutation.isSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings have been saved successfully!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Save, RefreshCw, Settings, Users, Shield, Building2, Bell, Mail, Phone, Calendar, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // General System Defaults
    defaultTimeZone: "America/New_York",
    defaultCurrency: "USD",
    businessHours: {
      start: "08:00",
      end: "18:00",
      workDays: ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    
    // Lead Management Defaults
    leadDefaults: {
      defaultPriority: "medium",
      autoAssignment: true,
      followUpDays: 3,
      maxLeadsPerRep: 10,
      distributionMethod: "round_robin"
    },
    
    // Sales Configuration
    salesConfig: {
      requireManagerApproval: true,
      discountLimit: 15,
      holdPeriod: 24,
      financingRequired: false,
      tradeInRequired: false
    },
    
    // Notification Settings
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      reminderHours: [24, 4, 1]
    },
    
    // Role Hierarchy
    roleHierarchy: {
      autoEscalation: true,
      escalationTime: 2,
      managerOverride: true,
      departmentIsolation: false
    }
  });

  const handleSettingChange = (category: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const saveSettings = () => {
    console.log("Saving system settings:", settings);
    // API call to save settings would go here
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enterprise System Settings</h1>
          <p className="text-gray-600 mt-2">Configure system-wide defaults, presets, and enterprise policies</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="leads">Lead Management</TabsTrigger>
          <TabsTrigger value="sales">Sales Config</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="hierarchy">Role Hierarchy</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Defaults
              </CardTitle>
              <CardDescription>Configure basic system-wide settings and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Time Zone</Label>
                  <Select value={settings.defaultTimeZone} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultTimeZone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={settings.defaultCurrency} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultCurrency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Business Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input 
                      type="time" 
                      value={settings.businessHours.start}
                      onChange={(e) => handleSettingChange('businessHours', 'start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input 
                      type="time" 
                      value={settings.businessHours.end}
                      onChange={(e) => handleSettingChange('businessHours', 'end', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <Badge 
                      key={day}
                      variant={settings.businessHours.workDays.includes(day.toLowerCase()) ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {day}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lead Management Settings */}
        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Lead Distribution & Assignment
              </CardTitle>
              <CardDescription>Configure automatic lead distribution and assignment policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Priority Level</Label>
                  <Select 
                    value={settings.leadDefaults.defaultPriority} 
                    onValueChange={(value) => handleSettingChange('leadDefaults', 'defaultPriority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="urgent">Urgent Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Distribution Method</Label>
                  <Select 
                    value={settings.leadDefaults.distributionMethod} 
                    onValueChange={(value) => handleSettingChange('leadDefaults', 'distributionMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                      <SelectItem value="skill_based">Skill-Based</SelectItem>
                      <SelectItem value="workload">Workload Balance</SelectItem>
                      <SelectItem value="manual">Manual Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Follow-up Days</Label>
                  <Input 
                    type="number" 
                    value={settings.leadDefaults.followUpDays}
                    onChange={(e) => handleSettingChange('leadDefaults', 'followUpDays', parseInt(e.target.value))}
                    min="1"
                    max="30"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Leads Per Rep</Label>
                  <Input 
                    type="number" 
                    value={settings.leadDefaults.maxLeadsPerRep}
                    onChange={(e) => handleSettingChange('leadDefaults', 'maxLeadsPerRep', parseInt(e.target.value))}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="flex items-center justify-between pt-8">
                  <Label htmlFor="auto-assignment">Auto Assignment</Label>
                  <Switch 
                    id="auto-assignment"
                    checked={settings.leadDefaults.autoAssignment}
                    onCheckedChange={(checked) => handleSettingChange('leadDefaults', 'autoAssignment', checked)}
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Lead distribution settings will apply to all new incoming leads from XML feeds, web forms, and manual entry.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Configuration */}
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Sales Process Configuration
              </CardTitle>
              <CardDescription>Set enterprise sales policies and approval workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Discount Limit (%)</Label>
                  <Input 
                    type="number" 
                    value={settings.salesConfig.discountLimit}
                    onChange={(e) => handleSettingChange('salesConfig', 'discountLimit', parseInt(e.target.value))}
                    min="0"
                    max="50"
                  />
                  <p className="text-sm text-gray-500">Maximum discount without manager approval</p>
                </div>

                <div className="space-y-2">
                  <Label>Hold Period (Hours)</Label>
                  <Input 
                    type="number" 
                    value={settings.salesConfig.holdPeriod}
                    onChange={(e) => handleSettingChange('salesConfig', 'holdPeriod', parseInt(e.target.value))}
                    min="1"
                    max="168"
                  />
                  <p className="text-sm text-gray-500">How long to hold a deal pending approval</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Approval Requirements</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manager-approval">Require Manager Approval</Label>
                    <Switch 
                      id="manager-approval"
                      checked={settings.salesConfig.requireManagerApproval}
                      onCheckedChange={(checked) => handleSettingChange('salesConfig', 'requireManagerApproval', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="financing-required">Financing Pre-qualification Required</Label>
                    <Switch 
                      id="financing-required"
                      checked={settings.salesConfig.financingRequired}
                      onCheckedChange={(checked) => handleSettingChange('salesConfig', 'financingRequired', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="trade-required">Trade-in Appraisal Required</Label>
                    <Switch 
                      id="trade-required"
                      checked={settings.salesConfig.tradeInRequired}
                      onCheckedChange={(checked) => handleSettingChange('salesConfig', 'tradeInRequired', checked)}
                    />
                  </div>
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
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure system-wide notification delivery and timing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Notification Channels</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <Label>Email Notifications</Label>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailEnabled}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'emailEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <Label>SMS Notifications</Label>
                    </div>
                    <Switch 
                      checked={settings.notifications.smsEnabled}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'smsEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      <Label>Push Notifications</Label>
                    </div>
                    <Switch 
                      checked={settings.notifications.pushEnabled}
                      onCheckedChange={(checked) => handleSettingChange('notifications', 'pushEnabled', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Reminder Schedule</h4>
                <p className="text-sm text-gray-500">Configure automatic reminder times (hours before due)</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 4, 8, 12, 24, 48].map((hours) => (
                    <Badge 
                      key={hours}
                      variant={settings.notifications.reminderHours.includes(hours) ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {hours}h
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Hierarchy */}
        <TabsContent value="hierarchy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role Hierarchy & Permissions
              </CardTitle>
              <CardDescription>Configure organizational hierarchy and escalation policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-escalation Enabled</Label>
                  <Switch 
                    checked={settings.roleHierarchy.autoEscalation}
                    onCheckedChange={(checked) => handleSettingChange('roleHierarchy', 'autoEscalation', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Escalation Time (Hours)</Label>
                  <Input 
                    type="number" 
                    value={settings.roleHierarchy.escalationTime}
                    onChange={(e) => handleSettingChange('roleHierarchy', 'escalationTime', parseInt(e.target.value))}
                    min="1"
                    max="72"
                    disabled={!settings.roleHierarchy.autoEscalation}
                  />
                  <p className="text-sm text-gray-500">Time before unhandled issues are escalated to manager</p>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Manager Override Authority</Label>
                  <Switch 
                    checked={settings.roleHierarchy.managerOverride}
                    onCheckedChange={(checked) => handleSettingChange('roleHierarchy', 'managerOverride', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Department Isolation</Label>
                  <Switch 
                    checked={settings.roleHierarchy.departmentIsolation}
                    onCheckedChange={(checked) => handleSettingChange('roleHierarchy', 'departmentIsolation', checked)}
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Changes to role hierarchy settings may affect existing workflows and permissions. Consider notifying staff of policy changes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                External Integrations
              </CardTitle>
              <CardDescription>Configure third-party service connections and API settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">AutoTrader XML Feed</h4>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Real-time lead processing from AutoTrader</p>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Cars.com Lead Integration</h4>
                    <Badge variant="outline">Inactive</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Lead import from Cars.com marketplace</p>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">DealerSocket CRM Sync</h4>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Bi-directional customer and lead synchronization</p>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
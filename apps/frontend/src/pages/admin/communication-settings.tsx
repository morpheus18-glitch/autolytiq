import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, MessageSquare, Phone, Mail, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CommunicationSetting {
  id: number;
  setting_key: string;
  setting_value: any;
  display_name: string;
  description: string;
  category: string;
  data_type: string;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MessageTemplate {
  id: number;
  name: string;
  category: string;
  subject?: string;
  body: string;
  variables?: any;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const settingCategories = [
  { value: 'sms', label: 'SMS/Text Messages', icon: MessageSquare },
  { value: 'phone', label: 'Phone System', icon: Phone },
  { value: 'email', label: 'Email Integration', icon: Mail },
  { value: 'general', label: 'General Settings', icon: Settings },
];

const templateCategories = [
  'greeting',
  'follow_up',
  'appointment',
  'promotional',
  'service',
  'sales',
  'payment',
  'delivery',
];

export default function CommunicationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState('sms');
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: 'greeting',
    subject: '',
    body: '',
    variables: {},
  });

  // Fetch communication settings
  const { data: allSettings = [], isLoading: settingsLoading } = useQuery<CommunicationSetting[]>({
    queryKey: ['/api/communication-settings'],
  });

  // Fetch message templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<MessageTemplate[]>({
    queryKey: ['/api/message-templates'],
  });

  // Save setting mutation
  const saveSettingMutation = useMutation({
    mutationFn: async (settingData: any) => {
      return await apiRequest('/api/communication-settings', {
        method: 'POST',
        body: JSON.stringify(settingData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/communication-settings'] });
      toast({
        title: 'Settings Saved',
        description: 'Communication settings have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings.',
        variant: 'destructive',
      });
    },
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      return await apiRequest('/api/message-templates', {
        method: 'POST',
        body: JSON.stringify(templateData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/message-templates'] });
      setIsAddingTemplate(false);
      setEditingTemplate(null);
      resetTemplateData();
      toast({
        title: 'Template Saved',
        description: 'Message template has been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save template.',
        variant: 'destructive',
      });
    },
  });

  const resetTemplateData = () => {
    setTemplateData({
      name: '',
      category: 'greeting',
      subject: '',
      body: '',
      variables: {},
    });
  };

  const handleSaveSetting = (settingKey: string, settingValue: any, displayName: string, description: string) => {
    saveSettingMutation.mutate({
      settingKey,
      settingValue,
      displayName,
      description,
      category: selectedCategory,
      dataType: typeof settingValue,
      isRequired: false,
    });
  };

  const handleSaveTemplate = () => {
    if (!templateData.name.trim() || !templateData.body.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in template name and body.',
        variant: 'destructive',
      });
      return;
    }

    saveTemplateMutation.mutate({
      ...templateData,
      createdBy: 'current-user', // In real app, get from auth context
    });
  };

  const getSettingsByCategory = (category: string) => {
    return allSettings.filter(setting => setting.category === category && setting.is_active);
  };

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(template => template.category === category && template.is_active);
  };

  const renderSettingsForm = (category: string) => {
    const settings = getSettingsByCategory(category);
    
    switch (category) {
      case 'sms':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMS Provider Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Provider</label>
                    <Select defaultValue="twilio">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="textmagic">TextMagic</SelectItem>
                        <SelectItem value="plivo">Plivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">From Number</label>
                    <Input 
                      placeholder="+1 (555) 123-4567" 
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Account SID</label>
                    <Input 
                      type="password" 
                      placeholder="Account SID" 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auth Token</label>
                    <Input 
                      type="password" 
                      placeholder="Auth Token" 
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Enable SMS Notifications</label>
                    <p className="text-xs text-muted-foreground">Send automated SMS notifications to customers</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button 
                  onClick={() => handleSaveSetting('sms_config', {}, 'SMS Configuration', 'SMS provider settings')}
                  disabled={saveSettingMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save SMS Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Phone System Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Phone System Provider</label>
                    <Select defaultValue="ringcentral">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ringcentral">RingCentral</SelectItem>
                        <SelectItem value="vonage">Vonage</SelectItem>
                        <SelectItem value="dialpad">Dialpad</SelectItem>
                        <SelectItem value="8x8">8x8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Main Number</label>
                    <Input 
                      placeholder="+1 (555) 123-4567" 
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">API Key</label>
                    <Input 
                      type="password" 
                      placeholder="API Key" 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">API Secret</label>
                    <Input 
                      type="password" 
                      placeholder="API Secret" 
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Call Recording</label>
                      <p className="text-xs text-muted-foreground">Automatically record all calls</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Call Analytics</label>
                      <p className="text-xs text-muted-foreground">Track call metrics and performance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSetting('phone_config', {}, 'Phone Configuration', 'Phone system settings')}
                  disabled={saveSettingMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Phone Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email Provider</label>
                    <Select defaultValue="sendgrid">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="mailgun">Mailgun</SelectItem>
                        <SelectItem value="ses">Amazon SES</SelectItem>
                        <SelectItem value="postmark">Postmark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">From Email</label>
                    <Input 
                      placeholder="noreply@dealership.com" 
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <Input 
                    type="password" 
                    placeholder="Email service API key" 
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={() => handleSaveSetting('email_config', {}, 'Email Configuration', 'Email service settings')}
                  disabled={saveSettingMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Communication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Default Time Zone</label>
                    <Select defaultValue="America/New_York">
                      <SelectTrigger className="mt-1">
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
                    <label className="text-sm font-medium">Business Hours Start</label>
                    <Input 
                      type="time" 
                      defaultValue="08:00"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Business Hours End</label>
                    <Input 
                      type="time" 
                      defaultValue="18:00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Auto-Response Delay (minutes)</label>
                    <Input 
                      type="number" 
                      placeholder="5"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Auto-Responses</label>
                      <p className="text-xs text-muted-foreground">Send automatic replies to customer inquiries</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Log All Communications</label>
                      <p className="text-xs text-muted-foreground">Keep detailed logs of all customer communications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button 
                  onClick={() => handleSaveSetting('general_config', {}, 'General Configuration', 'General communication settings')}
                  disabled={saveSettingMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Settings for {category}</div>;
    }
  };

  if (settingsLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Communication Settings</h1>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="templates">Message Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {settingCategories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <div className="lg:col-span-3">
              {renderSettingsForm(selectedCategory)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <Dialog open={isAddingTemplate} onOpenChange={setIsAddingTemplate}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Message Template</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Template Name</label>
                        <Input
                          value={templateData.name}
                          onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Welcome Message"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Category</label>
                        <Select 
                          value={templateData.category} 
                          onValueChange={(value) => setTemplateData(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {templateCategories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Subject (optional)</label>
                      <Input
                        value={templateData.subject}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Template subject..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Message Body</label>
                      <Textarea
                        value={templateData.body}
                        onChange={(e) => setTemplateData(prev => ({ ...prev, body: e.target.value }))}
                        placeholder="Hello {customerName}, welcome to AutolytiQ Motors..."
                        className="mt-1 min-h-[120px]"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Use variables like {`{customerName}`}, {`{dealerName}`}, {`{dealerPhone}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={handleSaveTemplate} 
                      disabled={saveTemplateMutation.isPending}
                      className="flex-1"
                    >
                      {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingTemplate(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {templateCategories.map(category => {
                const categoryTemplates = getTemplatesByCategory(category);
                
                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="text-lg capitalize">
                        {category.replace('_', ' ')}
                      </CardTitle>
                      <Badge variant="secondary">
                        {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {categoryTemplates.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          No templates in this category
                        </div>
                      ) : (
                        categoryTemplates.map(template => (
                          <div key={template.id} className="p-3 border rounded">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {template.body.substring(0, 80)}...
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
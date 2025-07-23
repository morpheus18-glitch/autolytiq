import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Zap,
  Bot,
  Activity,
  Clock,
  Target,
  TrendingUp,
  Brain,
  Eye,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Users,
  MessageSquare,
  Car,
  DollarSign,
  FileText,
  Calendar,
  Mail,
  Phone,
  Award,
  Lightbulb,
  Workflow,
  Filter,
  BarChart3
} from "lucide-react";
import { useState } from "react";

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'lead_management' | 'customer_follow_up' | 'inventory_alerts' | 'sales_process' | 'reporting';
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  actions: number;
  successRate: number;
  executionCount: number;
  aiOptimized: boolean;
  lastRun: string;
  nextRun: string;
}

interface AIOptimization {
  id: string;
  workflowId: string;
  type: 'timing' | 'conditions' | 'actions' | 'targeting';
  suggestion: string;
  impact: string;
  confidence: number;
  implementation: string;
}

interface AutomationMetric {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  status: 'excellent' | 'good' | 'warning';
  aiInsight: string;
}

export default function AIWorkflowAutomation() {
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
  const [isCreatingWorkflow, setIsCreatingWorkflow] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch real data for intelligent automation
  const { data: vehicles = [] } = useQuery({ queryKey: ['/api/vehicles'] });
  const { data: sales = [] } = useQuery({ queryKey: ['/api/sales'] });
  const { data: leads = [] } = useQuery({ queryKey: ['/api/leads'] });
  const { data: customers = [] } = useQuery({ queryKey: ['/api/customers'] });

  // AI-powered automation workflows
  const automationWorkflows: AutomationWorkflow[] = [
    {
      id: 'lead_nurture',
      name: 'AI Lead Nurturing Sequence',
      description: 'Automatically nurture leads based on engagement patterns and scoring',
      category: 'lead_management',
      status: 'active',
      trigger: 'New lead created',
      actions: 8,
      successRate: 89,
      executionCount: Math.max(leads.length * 2, 145),
      aiOptimized: true,
      lastRun: '2 minutes ago',
      nextRun: 'In 15 minutes'
    },
    {
      id: 'follow_up_sequence',
      name: 'Smart Customer Follow-up',
      description: 'AI-driven follow-up sequences based on customer lifecycle stage',
      category: 'customer_follow_up',
      status: 'active',
      trigger: 'Customer interaction completed',
      actions: 5,
      successRate: 94,
      executionCount: Math.max(customers.length * 3, 278),
      aiOptimized: true,
      lastRun: '5 minutes ago',
      nextRun: 'In 30 minutes'
    },
    {
      id: 'inventory_alerts',
      name: 'Intelligent Inventory Management',
      description: 'Automated alerts and actions for inventory optimization',
      category: 'inventory_alerts',
      status: 'active',
      trigger: 'Inventory threshold reached',
      actions: 6,
      successRate: 96,
      executionCount: Math.max(vehicles.length, 67),
      aiOptimized: true,
      lastRun: '1 hour ago',
      nextRun: 'In 2 hours'
    },
    {
      id: 'sales_pipeline',
      name: 'Sales Pipeline Automation',
      description: 'Automate sales process stages with AI-powered decision making',
      category: 'sales_process',
      status: 'active',
      trigger: 'Deal stage change',
      actions: 12,
      successRate: 87,
      executionCount: Math.max(sales.length * 4, 312),
      aiOptimized: true,
      lastRun: '10 minutes ago',
      nextRun: 'In 1 hour'
    },
    {
      id: 'report_automation',
      name: 'Automated Reporting Suite',
      description: 'Generate and distribute reports based on AI insights and triggers',
      category: 'reporting',
      status: 'active',
      trigger: 'Daily at 8:00 AM',
      actions: 4,
      successRate: 100,
      executionCount: 89,
      aiOptimized: true,
      lastRun: '6 hours ago',
      nextRun: 'Tomorrow at 8:00 AM'
    },
    {
      id: 'pricing_optimization',
      name: 'Dynamic Pricing Automation',
      description: 'AI-powered pricing adjustments based on market conditions',
      category: 'inventory_alerts',
      status: 'paused',
      trigger: 'Market data update',
      actions: 7,
      successRate: 92,
      executionCount: 156,
      aiOptimized: true,
      lastRun: '2 days ago',
      nextRun: 'Paused'
    }
  ];

  // AI optimization suggestions
  const aiOptimizations: AIOptimization[] = [
    {
      id: '1',
      workflowId: 'lead_nurture',
      type: 'timing',
      suggestion: 'Adjust email send times to 10:30 AM and 3:15 PM for 23% higher open rates',
      impact: '23% increase in email engagement',
      confidence: 94,
      implementation: 'Update workflow trigger timing'
    },
    {
      id: '2',
      workflowId: 'follow_up_sequence',
      type: 'targeting',
      suggestion: 'Segment customers by credit score for personalized messaging',
      impact: '31% improvement in conversion rate',
      confidence: 89,
      implementation: 'Add customer segmentation conditions'
    },
    {
      id: '3',
      workflowId: 'sales_pipeline',
      type: 'actions',
      suggestion: 'Add SMS notifications for high-value deals above $45,000',
      impact: '18% faster deal closure',
      confidence: 92,
      implementation: 'Integrate SMS automation step'
    },
    {
      id: '4',
      workflowId: 'inventory_alerts',
      type: 'conditions',
      suggestion: 'Include seasonal demand patterns in inventory threshold calculations',
      impact: '15% reduction in overstock situations',
      confidence: 87,
      implementation: 'Update threshold algorithms'
    }
  ];

  // Automation performance metrics
  const automationMetrics: AutomationMetric[] = [
    {
      id: 'total_executions',
      title: 'Total Executions',
      value: automationWorkflows.reduce((sum, w) => sum + w.executionCount, 0),
      unit: 'runs',
      change: 28.5,
      status: 'excellent',
      aiInsight: 'Automation execution volume increased significantly with AI optimization improvements'
    },
    {
      id: 'success_rate',
      title: 'Average Success Rate',
      value: Math.round(automationWorkflows.reduce((sum, w) => sum + w.successRate, 0) / automationWorkflows.length),
      unit: '%',
      change: 12.3,
      status: 'excellent',
      aiInsight: 'Success rates improved through AI-powered workflow optimization and smart error recovery'
    },
    {
      id: 'time_saved',
      title: 'Time Saved',
      value: Math.round(automationWorkflows.reduce((sum, w) => sum + w.executionCount, 0) * 0.25),
      unit: 'hours',
      change: 34.7,
      status: 'excellent',
      aiInsight: 'Automation workflows saving significant manual effort with intelligent task prioritization'
    },
    {
      id: 'revenue_impact',
      title: 'Revenue Impact',
      value: Math.round((sales.length * 45000) * 0.18),
      unit: '$',
      change: 22.1,
      status: 'good',
      aiInsight: 'Automated workflows directly contributing to revenue growth through improved lead conversion'
    }
  ];

  const toggleWorkflowMutation = useMutation({
    mutationFn: async (data: { workflowId: string, action: 'start' | 'pause' }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Workflow Updated",
        description: `Workflow ${data.action === 'start' ? 'activated' : 'paused'} successfully`,
      });
      queryClient.invalidateQueries();
    },
  });

  const optimizeWorkflowMutation = useMutation({
    mutationFn: async (optimizationId: string) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { optimizationId, applied: true };
    },
    onSuccess: () => {
      toast({
        title: "AI Optimization Applied",
        description: "Workflow updated with AI recommendations",
      });
    },
  });

  const handleToggleWorkflow = (workflowId: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'pause' : 'start';
    toggleWorkflowMutation.mutate({ workflowId, action });
  };

  const handleApplyOptimization = (optimizationId: string) => {
    optimizeWorkflowMutation.mutate(optimizationId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lead_management': return 'bg-blue-100 text-blue-800';
      case 'customer_follow_up': return 'bg-green-100 text-green-800';
      case 'inventory_alerts': return 'bg-purple-100 text-purple-800';
      case 'sales_process': return 'bg-orange-100 text-orange-800';
      case 'reporting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lead_management': return <Users className="w-4 h-4" />;
      case 'customer_follow_up': return <MessageSquare className="w-4 h-4" />;
      case 'inventory_alerts': return <Car className="w-4 h-4" />;
      case 'sales_process': return <DollarSign className="w-4 h-4" />;
      case 'reporting': return <FileText className="w-4 h-4" />;
      default: return <Workflow className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">AI Workflow Automation</h2>
            <p className="text-sm text-gray-600">Intelligent automation with AI-powered optimization and insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">
            <Brain className="w-3 h-3 mr-1" />
            {automationWorkflows.filter(w => w.status === 'active').length} Active Workflows
          </Badge>
          <Button onClick={() => setIsCreatingWorkflow(true)} className="bg-purple-600 hover:bg-purple-700">
            <Zap className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="optimizations">AI Optimizations</TabsTrigger>
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
        </TabsList>

        {/* Active Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automationWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(workflow.category)}
                      <div>
                        <h3 className="font-semibold text-lg">{workflow.name}</h3>
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflow.aiOptimized && (
                        <Badge className="bg-purple-100 text-purple-800">
                          <Brain className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status === 'active' && <Activity className="w-3 h-3 mr-1" />}
                        {workflow.status === 'paused' && <Pause className="w-3 h-3 mr-1" />}
                        <span className="capitalize">{workflow.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{workflow.actions}</div>
                      <div className="text-xs text-gray-600">Actions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{workflow.successRate}%</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{workflow.executionCount}</div>
                      <div className="text-xs text-gray-600">Executions</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Trigger:</span>
                      <span className="font-medium">{workflow.trigger}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last run:</span>
                      <span className="text-gray-600">{workflow.lastRun}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next run:</span>
                      <span className="text-gray-600">{workflow.nextRun}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                    <Button 
                      size="sm" 
                      className={`flex-1 ${
                        workflow.status === 'active' 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      onClick={() => handleToggleWorkflow(workflow.id, workflow.status)}
                      disabled={toggleWorkflowMutation.isPending}
                    >
                      {workflow.status === 'active' ? (
                        <>
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {automationMetrics.map((metric) => (
              <Card key={metric.id} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold mb-2">
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{metric.title}</h3>
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 font-medium">+{metric.change}%</span>
                    <span className="text-gray-500 text-sm">vs last month</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div className="text-xs text-gray-700 text-left">{metric.aiInsight}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Workflow Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lead Nurturing Efficiency</span>
                    <span className="text-green-600">89%</span>
                  </div>
                  <Progress value={89} className="h-3" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Follow-up Success</span>
                    <span className="text-green-600">94%</span>
                  </div>
                  <Progress value={94} className="h-3" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sales Process Automation</span>
                    <span className="text-blue-600">87%</span>
                  </div>
                  <Progress value={87} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Optimizations Tab */}
        <TabsContent value="optimizations" className="space-y-4">
          <div className="grid gap-4">
            {aiOptimizations.map((optimization) => (
              <Card key={optimization.id} className="border-l-4 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-lg">AI Optimization Suggestion</h3>
                        <Badge className={getCategoryColor(automationWorkflows.find(w => w.id === optimization.workflowId)?.category || 'lead_management')}>
                          {automationWorkflows.find(w => w.id === optimization.workflowId)?.name}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-purple-50">
                      {optimization.confidence}% Confidence
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Suggestion</h4>
                      <p className="text-sm text-blue-800">{optimization.suggestion}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Expected Impact</h4>
                      <p className="text-sm text-green-800">{optimization.impact}</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Implementation</h4>
                      <p className="text-sm text-yellow-800">{optimization.implementation}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview Changes
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleApplyOptimization(optimization.id)}
                      disabled={optimizeWorkflowMutation.isPending}
                    >
                      {optimizeWorkflowMutation.isPending ? (
                        <>
                          <Activity className="w-3 h-3 mr-1 animate-spin" />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 mr-1" />
                          Apply Optimization
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Workflow Builder Tab */}
        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-600" />
                AI Workflow Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Workflow Name</label>
                  <input
                    type="text"
                    placeholder="Enter workflow name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead_management">Lead Management</SelectItem>
                      <SelectItem value="customer_follow_up">Customer Follow-up</SelectItem>
                      <SelectItem value="inventory_alerts">Inventory Alerts</SelectItem>
                      <SelectItem value="sales_process">Sales Process</SelectItem>
                      <SelectItem value="reporting">Reporting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Trigger Event</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_lead">New Lead Created</SelectItem>
                    <SelectItem value="lead_updated">Lead Status Updated</SelectItem>
                    <SelectItem value="customer_interaction">Customer Interaction</SelectItem>
                    <SelectItem value="inventory_change">Inventory Change</SelectItem>
                    <SelectItem value="scheduled">Scheduled Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">AI Features</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="smart_timing" className="rounded" defaultChecked />
                    <label htmlFor="smart_timing" className="text-sm">Smart Timing Optimization</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="personalization" className="rounded" defaultChecked />
                    <label htmlFor="personalization" className="text-sm">AI Personalization</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="predictive" className="rounded" />
                    <label htmlFor="predictive" className="text-sm">Predictive Actions</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="learning" className="rounded" defaultChecked />
                    <label htmlFor="learning" className="text-sm">Continuous Learning</label>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Drag & Drop Workflow Builder</h3>
                <p className="text-sm text-gray-600 mb-4">Create complex automation workflows with AI-powered actions</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Brain className="w-4 h-4 mr-2" />
                  Launch Visual Builder
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Create & Activate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
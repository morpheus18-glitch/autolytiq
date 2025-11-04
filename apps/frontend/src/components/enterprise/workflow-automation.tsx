import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Workflow, 
  Play, 
  Pause, 
  Settings, 
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Car,
  FileText,
  Zap,
  BarChart3,
  Target
} from "lucide-react";
import { useState } from "react";

interface WorkflowCardProps {
  name: string;
  description: string;
  trigger: string;
  status: 'active' | 'paused' | 'draft';
  completed: number;
  total: number;
  lastRun: string;
  successRate: number;
  category: string;
  onToggle: () => void;
  onEdit: () => void;
}

function WorkflowCard({ 
  name, 
  description, 
  trigger, 
  status, 
  completed, 
  total, 
  lastRun, 
  successRate, 
  category, 
  onToggle, 
  onEdit 
}: WorkflowCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    paused: 'bg-yellow-100 text-yellow-800',
    draft: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold mb-1">{name}</CardTitle>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={statusColors[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
            <Switch checked={status === 'active'} onCheckedChange={onToggle} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium">{completed}/{total} ({Math.round((completed/total)*100)}%)</span>
            </div>
            <Progress value={(completed/total)*100} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Trigger:</div>
              <div className="font-medium">{trigger}</div>
            </div>
            <div>
              <div className="text-gray-600">Success Rate:</div>
              <div className="font-medium">{successRate}%</div>
            </div>
            <div>
              <div className="text-gray-600">Category:</div>
              <div className="font-medium">{category}</div>
            </div>
            <div>
              <div className="text-gray-600">Last Run:</div>
              <div className="font-medium">{lastRun}</div>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
              <Settings className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface WorkflowStepProps {
  step: number;
  title: string;
  description: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  status: 'completed' | 'running' | 'pending' | 'failed';
  icon: React.ReactNode;
}

function WorkflowStep({ step, title, description, type, status, icon }: WorkflowStepProps) {
  const statusColors = {
    completed: 'bg-green-500',
    running: 'bg-blue-500',
    pending: 'bg-gray-300',
    failed: 'bg-red-500'
  };

  const typeLabels = {
    trigger: 'Trigger',
    condition: 'Condition',
    action: 'Action',
    delay: 'Delay'
  };

  return (
    <div className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${statusColors[status]} flex items-center justify-center text-white text-sm font-medium`}>
          {step}
        </div>
        <Badge variant="outline" className="mt-2 text-xs">
          {typeLabels[type]}
        </Badge>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          {icon}
          <h4 className="font-medium text-gray-900">{title}</h4>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export default function WorkflowAutomation() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const workflows = [
    {
      name: "Lead Follow-up Sequence",
      description: "Automated follow-up emails and calls for new leads",
      trigger: "New lead created",
      status: 'active' as const,
      completed: 147,
      total: 189,
      lastRun: "2 hours ago",
      successRate: 82,
      category: "Sales"
    },
    {
      name: "Service Reminder Campaign",
      description: "Automatic service reminders based on mileage and time",
      trigger: "Service due date",
      status: 'active' as const,
      completed: 89,
      total: 112,
      lastRun: "1 day ago",
      successRate: 91,
      category: "Service"
    },
    {
      name: "Inventory Alert System",
      description: "Notify customers when desired vehicles arrive",
      trigger: "Vehicle added to inventory",
      status: 'active' as const,
      completed: 234,
      total: 267,
      lastRun: "4 hours ago",
      successRate: 76,
      category: "Inventory"
    },
    {
      name: "Customer Birthday Outreach",
      description: "Send personalized birthday offers and greetings",
      trigger: "Customer birthday",
      status: 'paused' as const,
      completed: 45,
      total: 78,
      lastRun: "1 week ago",
      successRate: 68,
      category: "Marketing"
    },
    {
      name: "Finance Application Processing",
      description: "Automated credit application routing and follow-up",
      trigger: "Finance application submitted",
      status: 'active' as const,
      completed: 67,
      total: 89,
      lastRun: "30 minutes ago",
      successRate: 94,
      category: "Finance"
    },
    {
      name: "Trade-in Appraisal Workflow",
      description: "Automated trade-in value notifications and scheduling",
      trigger: "Trade-in request submitted",
      status: 'draft' as const,
      completed: 12,
      total: 23,
      lastRun: "3 days ago",
      successRate: 85,
      category: "Sales"
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "New Lead Received",
      description: "Customer submits inquiry form on website",
      type: 'trigger' as const,
      status: 'completed' as const,
      icon: <Users className="w-4 h-4 text-blue-600" />
    },
    {
      step: 2,
      title: "Check Lead Score",
      description: "Evaluate lead quality based on criteria",
      type: 'condition' as const,
      status: 'completed' as const,
      icon: <Target className="w-4 h-4 text-purple-600" />
    },
    {
      step: 3,
      title: "Send Welcome Email",
      description: "Automated personalized welcome message",
      type: 'action' as const,
      status: 'running' as const,
      icon: <Mail className="w-4 h-4 text-green-600" />
    },
    {
      step: 4,
      title: "Wait 2 Hours",
      description: "Delay before next action",
      type: 'delay' as const,
      status: 'pending' as const,
      icon: <Clock className="w-4 h-4 text-orange-600" />
    },
    {
      step: 5,
      title: "Assign to Sales Rep",
      description: "Route to appropriate sales representative",
      type: 'action' as const,
      status: 'pending' as const,
      icon: <Users className="w-4 h-4 text-blue-600" />
    },
    {
      step: 6,
      title: "Schedule Follow-up Call",
      description: "Automatically schedule call in CRM",
      type: 'action' as const,
      status: 'pending' as const,
      icon: <Phone className="w-4 h-4 text-indigo-600" />
    }
  ];

  const workflowTemplates = [
    {
      name: "Customer Onboarding",
      description: "Complete new customer welcome process",
      category: "Customer Service",
      steps: 8,
      estimatedTime: "3 days"
    },
    {
      name: "Deal Closing Checklist",
      description: "Ensure all deal requirements are completed",
      category: "Sales",
      steps: 12,
      estimatedTime: "2 hours"
    },
    {
      name: "Service Upsell Campaign",
      description: "Promote additional services to existing customers",
      category: "Service",
      steps: 6,
      estimatedTime: "1 week"
    },
    {
      name: "Inventory Optimization",
      description: "Automated pricing and marketing adjustments",
      category: "Inventory",
      steps: 10,
      estimatedTime: "Daily"
    }
  ];

  const handleToggleWorkflow = (workflowName: string) => {
    console.log(`Toggling workflow: ${workflowName}`);
  };

  const handleEditWorkflow = (workflowName: string) => {
    console.log(`Editing workflow: ${workflowName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
          <p className="text-gray-600">Streamline processes with intelligent automation</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Zap className="w-3 h-3 mr-1" />
            6 Active Workflows
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Active Workflows", value: "6", change: "+2", icon: <Workflow className="w-5 h-5 text-blue-600" /> },
          { title: "Tasks Completed", value: "1,247", change: "+18%", icon: <CheckCircle className="w-5 h-5 text-green-600" /> },
          { title: "Avg Success Rate", value: "86%", change: "+4%", icon: <Target className="w-5 h-5 text-purple-600" /> },
          { title: "Time Saved", value: "127 hrs", change: "+23%", icon: <Clock className="w-5 h-5 text-orange-600" /> }
        ].map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {metric.icon}
                <Badge variant="outline" className="text-green-600">
                  {metric.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-sm text-gray-600">{metric.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Workflow className="w-5 h-5 mr-2 text-blue-600" />
              Active Workflows
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Bulk Actions
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {workflows.map((workflow, index) => (
              <WorkflowCard
                key={index}
                {...workflow}
                onToggle={() => handleToggleWorkflow(workflow.name)}
                onEdit={() => handleEditWorkflow(workflow.name)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Builder Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Example: Lead Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowSteps.map((step, index) => (
                <WorkflowStep key={index} {...step} />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Workflow Status: <span className="font-medium text-blue-600">Running</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Pause className="w-3 h-3 mr-1" />
                    Pause
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowTemplates.map((template, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{template.steps} steps • {template.estimatedTime}</span>
                    <Button size="sm" variant="outline">
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflow Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                workflow: "Lead Follow-up Sequence",
                action: "Sent welcome email to John Smith",
                time: "5 minutes ago",
                status: "success"
              },
              {
                workflow: "Service Reminder Campaign",
                action: "Scheduled service reminder call",
                time: "12 minutes ago",
                status: "success"
              },
              {
                workflow: "Inventory Alert System",
                action: "Notified 23 customers about new Toyota Camry",
                time: "28 minutes ago",
                status: "success"
              },
              {
                workflow: "Finance Application Processing",
                action: "Credit application routing failed",
                time: "1 hour ago",
                status: "error"
              },
              {
                workflow: "Lead Follow-up Sequence",
                action: "Assigned lead to Sarah Johnson",
                time: "2 hours ago",
                status: "success"
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{activity.workflow}</div>
                    <div className="text-sm text-gray-600">{activity.action}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
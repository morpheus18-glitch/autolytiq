import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Car,
  MessageSquare,
  Phone,
  Brain,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Target
} from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  type: 'customer' | 'communication' | 'ai' | 'deal' | 'followup';
  estimatedTime: string;
  data?: any;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lead_processing' | 'customer_onboarding' | 'deal_closing' | 'follow_up';
  steps: WorkflowStep[];
}

export default function WorkflowIntegration() {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowTemplate | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [workflowData, setWorkflowData] = useState<any>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Workflow templates for different business processes
  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'new_lead_processing',
      name: 'New Lead Processing',
      description: 'Complete workflow for processing and qualifying new leads',
      category: 'lead_processing',
      steps: [
        {
          id: 'create_customer',
          title: 'Create Customer Profile',
          description: 'Capture customer information and preferences',
          status: 'pending',
          type: 'customer',
          estimatedTime: '3 min'
        },
        {
          id: 'ai_analysis',
          title: 'AI Lead Scoring',
          description: 'Analyze lead quality and buying probability',
          status: 'pending',
          type: 'ai',
          estimatedTime: '30 sec'
        },
        {
          id: 'first_contact',
          title: 'Initial Contact',
          description: 'Send welcome message or make first call',
          status: 'pending',
          type: 'communication',
          estimatedTime: '5 min'
        },
        {
          id: 'inventory_match',
          title: 'Vehicle Matching',
          description: 'Find suitable vehicles using AI recommendations',
          status: 'pending',
          type: 'ai',
          estimatedTime: '2 min'
        },
        {
          id: 'schedule_appointment',
          title: 'Schedule Test Drive',
          description: 'Coordinate visit and test drive appointment',
          status: 'pending',
          type: 'followup',
          estimatedTime: '3 min'
        }
      ]
    },
    {
      id: 'deal_closing',
      name: 'Deal Closing Process',
      description: 'Streamlined workflow for finalizing vehicle sales',
      category: 'deal_closing',
      steps: [
        {
          id: 'price_negotiation',
          title: 'Price Analysis',
          description: 'Use competitive pricing data for optimal pricing',
          status: 'pending',
          type: 'ai',
          estimatedTime: '2 min'
        },
        {
          id: 'financing_options',
          title: 'Financing Setup',
          description: 'Present financing and payment options',
          status: 'pending',
          type: 'deal',
          estimatedTime: '10 min'
        },
        {
          id: 'final_confirmation',
          title: 'Deal Confirmation',
          description: 'Confirm all details and complete paperwork',
          status: 'pending',
          type: 'deal',
          estimatedTime: '15 min'
        },
        {
          id: 'delivery_coordination',
          title: 'Delivery Setup',
          description: 'Schedule vehicle delivery and handover',
          status: 'pending',
          type: 'followup',
          estimatedTime: '5 min'
        }
      ]
    }
  ];

  const startWorkflow = (template: WorkflowTemplate) => {
    setActiveWorkflow({ ...template });
    setCurrentStepIndex(0);
    setWorkflowData({});
    
    // Mark first step as active
    const updatedTemplate = { ...template };
    updatedTemplate.steps[0].status = 'active';
    setActiveWorkflow(updatedTemplate);

    toast({
      title: 'Workflow Started',
      description: `Starting ${template.name} process`,
    });
  };

  const completeStep = async (stepIndex: number, data?: any) => {
    if (!activeWorkflow) return;

    const updatedWorkflow = { ...activeWorkflow };
    updatedWorkflow.steps[stepIndex].status = 'completed';
    updatedWorkflow.steps[stepIndex].data = data;

    // Mark next step as active if exists
    if (stepIndex + 1 < updatedWorkflow.steps.length) {
      updatedWorkflow.steps[stepIndex + 1].status = 'active';
      setCurrentStepIndex(stepIndex + 1);
    }

    setActiveWorkflow(updatedWorkflow);
    setWorkflowData({ ...workflowData, [`step_${stepIndex}`]: data });

    toast({
      title: 'Step Completed',
      description: `${updatedWorkflow.steps[stepIndex].title} completed successfully`,
    });

    // If all steps completed, show success message
    if (stepIndex + 1 >= updatedWorkflow.steps.length) {
      toast({
        title: 'Workflow Complete',
        description: `${activeWorkflow.name} has been completed successfully!`,
      });
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'customer': return <User className="w-4 h-4" />;
      case 'communication': return <MessageSquare className="w-4 h-4" />;
      case 'ai': return <Brain className="w-4 h-4" />;
      case 'deal': return <Target className="w-4 h-4" />;
      case 'followup': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Render step content based on type
  const renderStepContent = (step: WorkflowStep, stepIndex: number) => {
    if (step.status !== 'active') return null;

    switch (step.type) {
      case 'customer':
        return (
          <CustomerCreationStep 
            onComplete={(data) => completeStep(stepIndex, data)} 
          />
        );
      case 'ai':
        return (
          <AIAnalysisStep 
            step={step}
            workflowData={workflowData}
            onComplete={(data) => completeStep(stepIndex, data)} 
          />
        );
      case 'communication':
        return (
          <CommunicationStep 
            onComplete={(data) => completeStep(stepIndex, data)} 
          />
        );
      default:
        return (
          <GenericStep 
            step={step}
            onComplete={(data) => completeStep(stepIndex, data)} 
          />
        );
    }
  };

  if (!activeWorkflow) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Smart Workflow Assistant</h2>
          <p className="text-gray-600 mb-8">Choose a workflow template to streamline your processes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workflowTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {template.name}
                  <Badge variant="outline">
                    {template.steps.length} steps
                  </Badge>
                </CardTitle>
                <p className="text-gray-600 text-sm">{template.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {template.steps.slice(0, 3).map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-2 text-sm">
                      {getStepIcon(step.type)}
                      <span className="text-gray-700">{step.title}</span>
                      <span className="text-gray-400">({step.estimatedTime})</span>
                    </div>
                  ))}
                  {template.steps.length > 3 && (
                    <p className="text-sm text-gray-500">+{template.steps.length - 3} more steps...</p>
                  )}
                </div>
                <Button 
                  onClick={() => startWorkflow(template)}
                  className="w-full"
                >
                  Start Workflow
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{activeWorkflow.name}</h2>
          <p className="text-gray-600">{activeWorkflow.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            Step {currentStepIndex + 1} of {activeWorkflow.steps.length}
          </Badge>
          <Button 
            variant="outline" 
            onClick={() => setActiveWorkflow(null)}
          >
            Exit Workflow
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${((currentStepIndex) / activeWorkflow.steps.length) * 100}%` }}
        ></div>
      </div>

      {/* Steps Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {activeWorkflow.steps.map((step, index) => (
              <div key={step.id} className="flex items-center space-x-4">
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${step.status === 'active' ? 'text-blue-600' : step.status === 'completed' ? 'text-green-600' : 'text-gray-700'}`}>
                      {step.title}
                    </h3>
                    <span className="text-sm text-gray-500">{step.estimatedTime}</span>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {index < activeWorkflow.steps.length - 1 && step.status === 'completed' && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Step Content */}
      {activeWorkflow.steps[currentStepIndex] && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStepIcon(activeWorkflow.steps[currentStepIndex].type)}
              <span>Current Step: {activeWorkflow.steps[currentStepIndex].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent(activeWorkflow.steps[currentStepIndex], currentStepIndex)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Individual step components
function CustomerCreationStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const handleSubmit = () => {
    if (customerData.firstName && customerData.lastName && customerData.email) {
      onComplete(customerData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="First Name"
          value={customerData.firstName}
          onChange={(e) => setCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
        />
        <Input
          placeholder="Last Name"
          value={customerData.lastName}
          onChange={(e) => setCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
        />
      </div>
      <Input
        placeholder="Email"
        type="email"
        value={customerData.email}
        onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
      />
      <Input
        placeholder="Phone Number"
        value={customerData.phone}
        onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
      />
      <Button onClick={handleSubmit} className="w-full">
        Create Customer & Continue
      </Button>
    </div>
  );
}

function AIAnalysisStep({ step, workflowData, onComplete }: { step: WorkflowStep; workflowData: any; onComplete: (data: any) => void }) {
  const [analyzing, setAnalyzing] = useState(false);

  const runAnalysis = async () => {
    setAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const results = {
        leadScore: Math.floor(Math.random() * 40) + 60, // 60-100
        buyingProbability: Math.floor(Math.random() * 30) + 70, // 70-100%
        recommendedActions: [
          'Schedule immediate follow-up call',
          'Send luxury vehicle brochures',
          'Offer premium test drive experience'
        ]
      };
      
      setAnalyzing(false);
      onComplete(results);
    }, 2000);
  };

  return (
    <div className="space-y-4 text-center">
      <Brain className="w-12 h-12 text-purple-500 mx-auto" />
      <h3 className="font-medium">AI Analysis in Progress</h3>
      <p className="text-gray-600">Analyzing customer data and generating insights...</p>
      
      {!analyzing ? (
        <Button onClick={runAnalysis} className="w-full">
          Run AI Analysis
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="animate-pulse">
            <div className="h-2 bg-purple-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-2 bg-purple-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-500">Processing...</p>
        </div>
      )}
    </div>
  );
}

function CommunicationStep({ onComplete }: { onComplete: (data: any) => void }) {
  const [messageType, setMessageType] = useState<'sms' | 'email' | 'call'>('sms');
  const [message, setMessage] = useState('');

  const sendCommunication = () => {
    const data = {
      type: messageType,
      content: message,
      sentAt: new Date().toISOString()
    };
    onComplete(data);
  };

  return (
    <div className="space-y-4">
      <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sms">SMS Message</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="call">Phone Call</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        placeholder="Enter your message or call notes..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
      />

      <Button onClick={sendCommunication} className="w-full">
        {messageType === 'call' ? 'Log Call' : `Send ${messageType.toUpperCase()}`}
      </Button>
    </div>
  );
}

function GenericStep({ step, onComplete }: { step: WorkflowStep; onComplete: (data: any) => void }) {
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'customer': return <User className="w-8 h-8 mx-auto text-blue-500" />;
      case 'communication': return <MessageSquare className="w-8 h-8 mx-auto text-green-500" />;
      case 'ai': return <Brain className="w-8 h-8 mx-auto text-purple-500" />;
      case 'deal': return <Target className="w-8 h-8 mx-auto text-orange-500" />;
      case 'followup': return <Clock className="w-8 h-8 mx-auto text-gray-500" />;
      default: return <CheckCircle className="w-8 h-8 mx-auto text-green-500" />;
    }
  };

  return (
    <div className="space-y-4 text-center">
      {getStepIcon(step.type)}
      <h3 className="font-medium">{step.title}</h3>
      <p className="text-gray-600">{step.description}</p>
      
      <Button onClick={() => onComplete({ completed: true })} className="w-full">
        Mark as Complete
      </Button>
    </div>
  );
}
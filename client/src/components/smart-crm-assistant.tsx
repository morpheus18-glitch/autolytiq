import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  MessageSquare,
  Zap,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Heart,
  Shield,
  Award,
  Lightbulb,
  Smartphone,
  Video,
  FileText,
  DollarSign
} from "lucide-react";
import type { Customer } from "@shared/schema";

interface SmartCRMAssistantProps {
  customer?: Customer;
  onActionComplete?: (action: string) => void;
}

interface AIRecommendation {
  type: 'follow-up' | 'offer' | 'reminder' | 'escalation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action: string;
  confidence: number;
  estimatedImpact: string;
}

interface CustomerInsight {
  buyingSignals: Array<{
    signal: string;
    strength: 'weak' | 'moderate' | 'strong';
    description: string;
  }>;
  nextBestAction: string;
  riskFactors: string[];
  opportunities: string[];
  predictedTimeline: string;
  engagementScore: number;
}

export default function SmartCRMAssistant({ customer, onActionComplete }: SmartCRMAssistantProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("insights");
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  // Fetch AI recommendations for customer
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery<AIRecommendation[]>({
    queryKey: [`/api/customers/${customer?.id}/ai-recommendations`],
    enabled: !!customer?.id,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch customer insights
  const { data: insights } = useQuery<CustomerInsight>({
    queryKey: [`/api/customers/${customer?.id}/insights`],
    enabled: !!customer?.id,
  });

  // Execute AI recommendation
  const executeRecommendationMutation = useMutation({
    mutationFn: async (recommendation: AIRecommendation) => {
      const response = await apiRequest("POST", `/api/customers/${customer?.id}/execute-recommendation`, {
        recommendationType: recommendation.type,
        action: recommendation.action
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({ 
        title: "Action completed successfully", 
        description: `${variables.action} has been executed.` 
      });
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customer?.id}`] });
      onActionComplete?.(variables.action);
    },
    onError: () => {
      toast({ title: "Failed to execute action", variant: "destructive" });
    },
  });

  // Generate new insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/customers/${customer?.id}/generate-insights`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customer?.id}/insights`] });
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customer?.id}/ai-recommendations`] });
      toast({ title: "New insights generated" });
    },
  });

  const customerJourney = customer?.customerJourney || {
    stage: 'prospect',
    touchpoints: [],
    probability: 0
  };

  const digitalProfile = customer?.digitalProfile || {
    websiteVisits: 0,
    emailEngagement: 0,
    smsEngagement: 0
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'prospect': return 'bg-gray-100 text-gray-800';
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'negotiating': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!customer) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Select a customer to view AI insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Quick Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Smart CRM Assistant
            </span>
            <Button 
              onClick={() => generateInsightsMutation.mutate()}
              disabled={generateInsightsMutation.isPending}
              variant="outline"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Refresh Insights
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{customer.firstName} {customer.lastName}</h3>
              <p className="text-sm text-gray-600">{customer.email}</p>
            </div>
            <div className="text-right">
              <Badge className={getStageColor(customerJourney.stage)}>
                {customerJourney.stage}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">
                Lead Score: {customer.leadScore || 0}/100
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Assistant Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insights ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Buying Signals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Buying Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {insights.buyingSignals?.map((signal, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        signal.strength === 'strong' ? 'bg-green-500' :
                        signal.strength === 'moderate' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{signal.signal}</p>
                        <p className="text-xs text-gray-600">{signal.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {signal.strength}
                      </Badge>
                    </div>
                  )) || (
                    <p className="text-gray-600 text-sm">No buying signals detected</p>
                  )}
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement Score</span>
                      <span>{insights.engagementScore || 0}%</span>
                    </div>
                    <Progress value={insights.engagementScore || 0} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Close Probability</span>
                      <span>{customerJourney.probability || 0}%</span>
                    </div>
                    <Progress value={customerJourney.probability || 0} className="h-2" />
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Predicted Timeline:</span>
                    <p className="font-medium">{insights.predictedTimeline || 'Unknown'}</p>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Next Best Action:</span>
                    <p className="font-medium">{insights.nextBestAction || 'No specific action recommended'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Opportunities & Risks */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    Opportunities & Risk Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                        <Award className="w-4 h-4 mr-2" />
                        Opportunities
                      </h4>
                      <ul className="space-y-1">
                        {insights.opportunities?.map((opportunity, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                            {opportunity}
                          </li>
                        )) || (
                          <li className="text-sm text-gray-600">No opportunities identified</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Risk Factors
                      </h4>
                      <ul className="space-y-1">
                        {insights.riskFactors?.map((risk, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-red-500" />
                            {risk}
                          </li>
                        )) || (
                          <li className="text-sm text-gray-600">No risk factors identified</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No AI insights available yet</p>
                <Button 
                  onClick={() => generateInsightsMutation.mutate()}
                  disabled={generateInsightsMutation.isPending}
                >
                  Generate AI Insights
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recommendationsLoading ? (
              <div className="lg:col-span-2 text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600 mt-2">Generating recommendations...</p>
              </div>
            ) : recommendations.length > 0 ? (
              recommendations.map((recommendation, index) => (
                <Card key={index} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center">
                        {recommendation.type === 'follow-up' && <Phone className="w-5 h-5 mr-2" />}
                        {recommendation.type === 'offer' && <DollarSign className="w-5 h-5 mr-2" />}
                        {recommendation.type === 'reminder' && <Clock className="w-5 h-5 mr-2" />}
                        {recommendation.type === 'escalation' && <AlertTriangle className="w-5 h-5 mr-2" />}
                        {recommendation.title}
                      </span>
                      <Badge variant="outline" className={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">{recommendation.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Confidence: {recommendation.confidence}%</span>
                      <span>Impact: {recommendation.estimatedImpact}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Progress value={recommendation.confidence} className="h-2 flex-1 mr-3" />
                      <Button 
                        onClick={() => executeRecommendationMutation.mutate(recommendation)}
                        disabled={executeRecommendationMutation.isPending}
                        size="sm"
                      >
                        Execute
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="lg:col-span-2">
                <CardContent className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No AI recommendations available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Customer Journey Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerJourney.touchpoints?.map((touchpoint, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{touchpoint.type}</h4>
                        <span className="text-xs text-gray-500">{touchpoint.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{touchpoint.notes}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {touchpoint.outcome}
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-600 text-center py-4">No touchpoint history available</p>
                )}
                
                {customerJourney.nextAction && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Next Scheduled Action</h4>
                    <p className="text-blue-800">{customerJourney.nextAction}</p>
                    {customerJourney.actionDueDate && (
                      <p className="text-sm text-blue-600 mt-1">
                        Due: {new Date(customerJourney.actionDueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Digital Engagement */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Digital Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Website Visits:</span>
                  <span className="font-medium">{digitalProfile.websiteVisits || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Email Engagement:</span>
                  <span className="font-medium">{digitalProfile.emailEngagement || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SMS Engagement:</span>
                  <span className="font-medium">{digitalProfile.smsEngagement || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Visit:</span>
                  <span className="font-medium">
                    {digitalProfile.lastWebsiteVisit 
                      ? new Date(digitalProfile.lastWebsiteVisit).toLocaleDateString()
                      : 'Never'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Communication Preferences */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Preferred Method:</span>
                  <span className="font-medium capitalize">
                    {customer.preferredContactMethod || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Style:</span>
                  <span className="font-medium capitalize">
                    {digitalProfile.communicationStyle || 'Professional'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Best Time:</span>
                  <span className="font-medium">
                    {digitalProfile.preferredContactTime || 'Anytime'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule Call
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send SMS
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
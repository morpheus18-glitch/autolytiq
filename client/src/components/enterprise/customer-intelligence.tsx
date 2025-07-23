import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  User, 
  Brain, 
  Target, 
  TrendingUp, 
  Star, 
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Car,
  Heart,
  AlertCircle,
  CheckCircle,
  Clock,
  Award,
  Users,
  PieChart,
  BarChart3,
  Eye,
  Zap,
  MessageSquare,
  Activity,
  ChevronRight,
  Database,
  Lightbulb,
  ThumbsUp,
  Filter,
  Search
} from "lucide-react";
import { useState } from "react";

interface CustomerSegmentProps {
  name: string;
  count: number;
  percentage: number;
  value: string;
  color: string;
  growth: string;
}

function CustomerSegment({ name, count, percentage, value, color, growth }: CustomerSegmentProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-4 h-4 rounded-full ${color}`}></div>
          <Badge variant="outline" className="text-green-600">
            {growth}
          </Badge>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1">{name}</h3>
          <div className="text-2xl font-bold text-gray-900 mb-2">{count.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mb-3">Avg Value: {value}</div>
          <Progress value={percentage} className="h-2" />
          <div className="text-xs text-gray-500 mt-1">{percentage}% of total customers</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CustomerProfileProps {
  name: string;
  email: string;
  phone: string;
  segment: string;
  score: number;
  lastContact: string;
  nextAction: string;
  vehicles: number;
  lifetime: string;
  status: 'hot' | 'warm' | 'cold';
}

function CustomerProfile({ name, email, phone, segment, score, lastContact, nextAction, vehicles, lifetime, status }: CustomerProfileProps) {
  const statusColors = {
    hot: 'bg-red-100 text-red-800',
    warm: 'bg-yellow-100 text-yellow-800',
    cold: 'bg-blue-100 text-blue-800'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">{email}</p>
          </div>
          <Badge className={statusColors[status]}>
            {status.toUpperCase()}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Lead Score:</span>
            <span className="font-medium">{score}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Segment:</span>
            <span className="font-medium">{segment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Vehicles:</span>
            <span className="font-medium">{vehicles}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Lifetime Value:</span>
            <span className="font-medium">{lifetime}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Last Contact: {lastContact}</div>
          <div className="text-xs font-medium text-blue-600">{nextAction}</div>
        </div>

        <div className="flex space-x-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="w-3 h-3 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Mail className="w-3 h-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CustomerIntelligence() {
  const [selectedSegment, setSelectedSegment] = useState<string>("all");

  const customerSegments = [
    {
      name: "VIP Customers",
      count: 127,
      percentage: 8,
      value: "$89,500",
      color: "bg-purple-500",
      growth: "+12%"
    },
    {
      name: "Repeat Buyers",
      count: 342,
      percentage: 22,
      value: "$47,200",
      color: "bg-blue-500",
      growth: "+8%"
    },
    {
      name: "First Time Buyers",
      count: 789,
      percentage: 51,
      value: "$32,800",
      color: "bg-green-500",
      growth: "+15%"
    },
    {
      name: "Service Customers",
      count: 445,
      percentage: 29,
      value: "$12,400",
      color: "bg-orange-500",
      growth: "+6%"
    }
  ];

  const hotProspects = [
    {
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 123-4567",
      segment: "Luxury Buyer",
      score: 95,
      lastContact: "2 hours ago",
      nextAction: "Send BMW X5 inventory",
      vehicles: 3,
      lifetime: "$145,000",
      status: 'hot' as const
    },
    {
      name: "Michael Chen",
      email: "m.chen@company.com",
      phone: "(555) 987-6543",
      segment: "Fleet Manager",
      score: 88,
      lastContact: "Yesterday",
      nextAction: "Schedule fleet demo",
      vehicles: 12,
      lifetime: "$320,000",
      status: 'hot' as const
    },
    {
      name: "Amanda Rodriguez",
      email: "amanda.r@gmail.com",
      phone: "(555) 456-7890",
      segment: "Family Buyer",
      score: 82,
      lastContact: "3 days ago",
      nextAction: "Follow up on Highlander",
      vehicles: 2,
      lifetime: "$67,500",
      status: 'warm' as const
    },
    {
      name: "David Kim",
      email: "d.kim@startup.io",
      phone: "(555) 234-5678",
      segment: "Young Professional",
      score: 76,
      lastContact: "1 week ago",
      nextAction: "Price update on Camry",
      vehicles: 1,
      lifetime: "$28,900",
      status: 'warm' as const
    }
  ];

  const intelligenceInsights = [
    {
      title: "Predictive Purchase Intent",
      description: "AI identifies customers likely to buy within 30 days",
      value: "23 customers",
      trend: "+18%",
      icon: <Brain className="w-5 h-5 text-purple-600" />
    },
    {
      title: "Churn Risk Analysis",
      description: "Customers at risk of switching to competitors",
      value: "12 customers",
      trend: "-8%",
      icon: <AlertCircle className="w-5 h-5 text-red-600" />
    },
    {
      title: "Upsell Opportunities",
      description: "Service customers ready for vehicle upgrades",
      value: "47 customers",
      trend: "+25%",
      icon: <TrendingUp className="w-5 h-5 text-green-600" />
    },
    {
      title: "Loyalty Score Increase",
      description: "Customers with improving engagement",
      value: "89 customers",
      trend: "+14%",
      icon: <Heart className="w-5 h-5 text-pink-600" />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Intelligence</h1>
          <p className="text-gray-600">AI-powered customer insights and behavioral analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Brain className="w-3 h-3 mr-1" />
            AI Active
          </Badge>
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Intelligence Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {intelligenceInsights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {insight.icon}
                <Badge variant="outline" className="text-green-600">
                  {insight.trend}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</div>
              <div className="text-sm font-medium text-gray-900">{insight.title}</div>
              <div className="text-xs text-gray-600 mt-1">{insight.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-600" />
            Customer Segmentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customerSegments.map((segment, index) => (
              <CustomerSegment key={index} {...segment} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Intelligence Tabs */}
      <Tabs defaultValue="prospects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prospects">Hot Prospects</TabsTrigger>
          <TabsTrigger value="behavior">Behavior Analysis</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle Stage</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {hotProspects.map((prospect, index) => (
              <CustomerProfile key={index} {...prospect} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="behavior">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Website Behavior Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { page: "Vehicle Detail Pages", visits: 3247, conversion: "12.3%", trend: "+8%" },
                    { page: "Inventory Search", visits: 2891, conversion: "8.7%", trend: "+15%" },
                    { page: "Finance Calculator", visits: 1456, conversion: "23.1%", trend: "+22%" },
                    { page: "Trade-in Appraisal", visits: 987, conversion: "18.4%", trend: "+11%" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{item.page}</div>
                        <div className="text-sm text-gray-600">{item.visits} visits • {item.conversion} conversion</div>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        {item.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: "Email", preference: 68, response: "24%" },
                    { method: "Phone Call", preference: 45, response: "31%" },
                    { method: "Text Message", preference: 82, response: "52%" },
                    { method: "In-Person Visit", preference: 23, response: "78%" }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-900">{item.method}</span>
                        <span className="text-gray-600">{item.response} response rate</span>
                      </div>
                      <Progress value={item.preference} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lifecycle">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                stage: "Awareness",
                count: 1247,
                percentage: 42,
                actions: ["SEO Content", "Social Media", "Advertising"],
                color: "bg-blue-500"
              },
              {
                stage: "Consideration",
                count: 834,
                percentage: 28,
                actions: ["Email Nurturing", "Vehicle Comparisons", "Incentives"],
                color: "bg-yellow-500"
              },
              {
                stage: "Decision",
                count: 445,
                percentage: 15,
                actions: ["Personal Follow-up", "Test Drives", "Negotiations"],
                color: "bg-green-500"
              },
              {
                stage: "Purchase",
                count: 267,
                percentage: 9,
                actions: ["Deal Finalization", "Financing", "Delivery"],
                color: "bg-purple-500"
              },
              {
                stage: "Advocacy",
                count: 178,
                percentage: 6,
                actions: ["Referral Program", "Reviews", "Service"],
                color: "bg-pink-500"
              }
            ].map((stage, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-4 h-4 rounded-full ${stage.color}`}></div>
                    <Badge variant="outline">{stage.percentage}%</Badge>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{stage.stage}</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-4">{stage.count.toLocaleString()}</div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Key Actions:</div>
                    {stage.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="text-sm text-gray-600">• {action}</div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Predictions (Next 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { customer: "Jennifer Wilson", probability: 92, vehicle: "2024 Toyota Camry", value: "$32,500" },
                    { customer: "Robert Taylor", probability: 87, vehicle: "2024 Honda CR-V", value: "$38,200" },
                    { customer: "Lisa Martinez", probability: 81, vehicle: "2023 BMW 3 Series", value: "$52,800" },
                    { customer: "James Anderson", probability: 76, vehicle: "2024 Ford F-150", value: "$48,900" }
                  ].map((prediction, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{prediction.customer}</div>
                        <Badge variant="outline" className="text-green-600">
                          {prediction.probability}% likely
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">{prediction.vehicle}</div>
                      <div className="text-sm font-medium text-gray-900">{prediction.value}</div>
                      <Progress value={prediction.probability} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      action: "Send personalized inventory alert",
                      impact: "High",
                      customers: 23,
                      description: "Customers waiting for specific models"
                    },
                    {
                      action: "Schedule follow-up calls",
                      impact: "Medium",
                      customers: 45,
                      description: "Test drive prospects from last week"
                    },
                    {
                      action: "Offer trade-in appraisal",
                      impact: "High",
                      customers: 18,
                      description: "Customers researching new vehicles"
                    },
                    {
                      action: "Send financing pre-approval",
                      impact: "Medium",
                      customers: 34,
                      description: "Qualified buyers in consideration stage"
                    }
                  ].map((rec, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{rec.action}</div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={rec.impact === 'High' ? 'default' : 'secondary'}>
                            {rec.impact} Impact
                          </Badge>
                          <Badge variant="outline">{rec.customers} customers</Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">{rec.description}</div>
                      <Button size="sm" className="mt-2">
                        Execute Action
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
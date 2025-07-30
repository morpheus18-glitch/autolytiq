import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  Globe, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Phone, 
  Mail,
  MessageSquare,
  Clock,
  Target,
  Activity,
  Brain,
  DollarSign,
  BarChart3,
  ExternalLink,
  Star,
  ArrowRight,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Real-time market leads from live API using hooks at top level
function MarketLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedTab, setSelectedTab] = useState("leads");
  const [filterStage, setFilterStage] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Real-time market leads from live API
  const { data: marketLeads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/market-leads'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
  });

  // Fallback sample data only for initial demo
  const sampleMarketLeads = marketLeads.length > 0 ? marketLeads : [
  {
    id: "ML-001",
    name: "Jessica Park",
    email: "jessica.park@email.com", 
    phone: "(555) 123-4567",
    source: "reddit.com/r/cars",
    sourceUrl: "https://reddit.com/r/cars/comments/abc123",
    postContent: "Looking to buy a reliable Honda Civic this week. Have financing approved and ready to make a deal. Anyone know best dealerships in Austin area?",
    vehicleInterest: ["Honda Civic", "compact car"],
    intentScore: 92,
    lifecycleStage: "purchase",
    region: "Austin, TX",
    budgetRange: "$25,000-$30,000",
    timeframe: "this week",
    lastSeen: "2 hours ago",
    status: "new",
    isConverted: false,
    createdAt: "2024-01-29T10:30:00Z",
    activities: [
      { type: "lead_captured", detail: "Lead captured from reddit.com/r/cars", timestamp: "2024-01-29T10:30:00Z" },
      { type: "high_intent_detected", detail: "92% purchase intent detected", timestamp: "2024-01-29T10:31:00Z" }
    ]
  },
  {
    id: "ML-002", 
    name: "Mike Rodriguez",
    email: "mrod87@email.com",
    source: "cars.com/forum",
    sourceUrl: "https://cars.com/forum/topic/456789",
    postContent: "Shopping for a family SUV. Comparing Toyota Highlander vs Honda Pilot. Need 3rd row seating and good mpg. Test driving both this weekend.",
    vehicleInterest: ["Toyota Highlander", "Honda Pilot", "family SUV"],
    intentScore: 78,
    lifecycleStage: "intent",
    region: "Dallas, TX", 
    budgetRange: "$35,000-$45,000",
    timeframe: "next 2 weeks",
    lastSeen: "1 day ago",
    status: "contacted",
    isConverted: false,
    createdAt: "2024-01-28T14:20:00Z",
    activities: [
      { type: "lead_captured", detail: "Lead captured from cars.com/forum", timestamp: "2024-01-28T14:20:00Z" },
      { type: "intent_detected", detail: "78% purchase intent detected", timestamp: "2024-01-28T14:21:00Z" },
      { type: "contacted", detail: "Initial contact made via email", timestamp: "2024-01-29T09:15:00Z" }
    ]
  },
  {
    id: "ML-003",
    name: "Sarah Chen", 
    email: "sarah.chen.99@email.com",
    source: "facebook.com/marketplace",
    postContent: "Need a pickup truck for work. Looking at Ford F-150 vs Chevy Silverado. Which has better towing capacity? Want to buy end of month.",
    vehicleInterest: ["Ford F-150", "Chevy Silverado", "pickup truck"],
    intentScore: 85,
    lifecycleStage: "purchase",
    region: "Houston, TX",
    budgetRange: "$40,000-$55,000", 
    timeframe: "end of month",
    lastSeen: "5 hours ago",
    status: "qualified",
    isConverted: false,
    createdAt: "2024-01-27T16:45:00Z",
    activities: [
      { type: "lead_captured", detail: "Lead captured from facebook.com/marketplace", timestamp: "2024-01-27T16:45:00Z" },
      { type: "high_intent_detected", detail: "85% purchase intent detected", timestamp: "2024-01-27T16:46:00Z" },
      { type: "qualified", detail: "Lead qualified as ready to purchase", timestamp: "2024-01-29T11:20:00Z" }
    ]
  },
  {
    id: "ML-004",
    name: "David Wilson",
    contact: "@dwilson_cars", 
    source: "twitter.com",
    postContent: "Just browsing car lots today. Maybe thinking about upgrading my sedan to something newer. Not in a rush though.",
    vehicleInterest: ["sedan", "upgrade"],
    intentScore: 32,
    lifecycleStage: "awareness",
    region: "San Antonio, TX",
    budgetRange: "unknown",
    timeframe: "maybe next year", 
    lastSeen: "3 days ago",
    status: "new",
    isConverted: false,
    createdAt: "2024-01-26T12:10:00Z",
    activities: [
      { type: "lead_captured", detail: "Lead captured from twitter.com", timestamp: "2024-01-26T12:10:00Z" },
      { type: "low_intent_detected", detail: "32% purchase intent detected", timestamp: "2024-01-26T12:11:00Z" }
    ]
  }
];

const sampleAlerts = [
  {
    id: "AL-001",
    leadId: "ML-001",
    trigger: "high_intent_purchase",
    message: "Jessica Park shows 92% purchase intent - Contact immediately!",
    priority: "critical",
    status: "new",
    createdAt: "2024-01-29T10:31:00Z",
    lead: sampleMarketLeads[0]
  },
  {
    id: "AL-002", 
    leadId: "ML-003",
    trigger: "active_shopping",
    message: "Sarah Chen is actively shopping with 85% intent - High priority follow-up needed",
    priority: "high",
    status: "new",
    createdAt: "2024-01-27T16:46:00Z",
    lead: sampleMarketLeads[2]
  }
];

const leadAnalytics = {
  totalLeads: 1247,
  highIntentLeads: 89,
  readyToBuyLeads: 23,
  activeAlerts: 12,
  convertedLeads: 186,
  conversionRate: 15,
  stageDistribution: [
    { stage: "awareness", count: 523 },
    { stage: "consideration", count: 398 },
    { stage: "intent", count: 234 },
    { stage: "purchase", count: 92 }
  ]
};

  // Filter and search logic

  const filteredLeads = sampleMarketLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.postContent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "all" || lead.lifecycleStage === filterStage;
    return matchesSearch && matchesStage;
  });

  const filteredAlerts = sampleAlerts.filter(alert => {
    const matchesPriority = filterPriority === "all" || alert.priority === filterPriority;
    return matchesPriority;
  });

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      awareness: "bg-blue-100 text-blue-800",
      consideration: "bg-yellow-100 text-yellow-800",
      intent: "bg-orange-100 text-orange-800", 
      purchase: "bg-green-100 text-green-800"
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800", 
      qualified: "bg-green-100 text-green-800",
      lost: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">AI Market Lead Engine</h1>
            <p className="text-sm text-gray-600">AI-powered lead generation and automotive shopper intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            <Activity className="w-3 h-3 mr-1" />
            Lead Engine Active
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Leads
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold">{leadAnalytics.totalLeads.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Intent</p>
                <p className="text-2xl font-bold text-orange-600">{leadAnalytics.highIntentLeads}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Buy</p>
                <p className="text-2xl font-bold text-red-600">{leadAnalytics.readyToBuyLeads}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-purple-600">{leadAnalytics.activeAlerts}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-green-600">{leadAnalytics.convertedLeads}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{leadAnalytics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */} 
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads">Market Leads</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sources">Lead Sources</TabsTrigger>
        </TabsList>

        {/* Market Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Market Leads</CardTitle>
                  <CardDescription>AI-captured leads from automotive marketplaces and social media</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterStage} onValueChange={setFilterStage}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="consideration">Consideration</SelectItem>
                      <SelectItem value="intent">Intent</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Intent Score</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Vehicle Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.email || lead.contact}</div>
                          <div className="text-sm text-gray-500">{lead.region}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">{lead.source}</div>
                            {lead.sourceUrl && (
                              <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer" 
                                 className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" />
                                View Post
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={lead.intentScore} className="w-16" />
                          <span className="text-sm font-medium">{lead.intentScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStageColor(lead.lifecycleStage)}>
                          {lead.lifecycleStage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lead.vehicleInterest.slice(0, 2).map((vehicle, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {vehicle}
                            </Badge>
                          ))}
                          {lead.vehicleInterest.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{lead.vehicleInterest.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{lead.lastSeen}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    Active Alerts
                  </CardTitle>
                  <CardDescription>High-priority leads requiring immediate attention</CardDescription>
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <div className="font-medium">{alert.lead.name}</div>
                        <div className="text-sm text-gray-600">{alert.message}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">{alert.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Phone className="w-4 h-4 mr-1" />
                        Call Now
                      </Button>
                      <Button size="sm" variant="outline">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lead Pipeline Distribution</CardTitle>
                <CardDescription>Breakdown of leads by lifecycle stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leadAnalytics.stageDistribution.map((stage, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getStageColor(stage.stage)}>
                          {stage.stage}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(stage.count / leadAnalytics.totalLeads) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{stage.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Lead generation and conversion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Total Leads Generated</span>
                    <span className="text-lg font-bold">{leadAnalytics.totalLeads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">High Intent Leads</span>
                    <span className="text-lg font-bold text-orange-600">{leadAnalytics.highIntentLeads}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Leads Converted</span>
                    <span className="text-lg font-bold text-green-600">{leadAnalytics.convertedLeads}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Conversion Rate</span>
                    <span className="text-lg font-bold">{leadAnalytics.conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lead Sources Tab */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Performance of different lead generation sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Lead source analytics coming soon...</p>
                <p className="text-sm">Track performance across Reddit, Facebook, Twitter, and automotive forums</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MarketLeads;
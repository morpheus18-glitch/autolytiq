import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Eye, TrendingUp, Globe, Clock, Target, Users, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const customerJourneyData = [
  {
    id: "CJ-001",
    customerId: "C-12345",
    name: "Jennifer Martinez",
    email: "jennifer.m@email.com",
    startDate: "2024-01-15",
    currentStage: "research",
    purchaseIntent: 85,
    totalSessions: 47,
    totalPageViews: 342,
    timeSpent: "18h 32m",
    websites: [
      { site: "AutoTrader", visits: 12, timeSpent: "4h 15m" },
      { site: "Cars.com", visits: 8, timeSpent: "2h 45m" },
      { site: "CarGurus", visits: 15, timeSpent: "5h 22m" },
      { site: "Dealer Website", visits: 12, timeSpent: "6h 10m" }
    ],
    searchTerms: ["honda civic 2024", "best compact cars", "honda financing", "civic safety rating"],
    behavior: {
      viewedVehicles: 23,
      savedVehicles: 5,
      requestedInfo: 3,
      calculatorUse: 8,
      financingViews: 12
    },
    lifecycle: [
      { stage: "awareness", date: "2024-01-15", duration: "3 days" },
      { stage: "interest", date: "2024-01-18", duration: "7 days" },
      { stage: "consideration", date: "2024-01-25", duration: "5 days" },
      { stage: "research", date: "2024-01-30", duration: "ongoing" }
    ],
    signals: [
      { type: "high_intent", signal: "Visited financing page 12 times", strength: 95 },
      { type: "comparison", signal: "Compared 3 vehicles extensively", strength: 88 },
      { type: "local_search", signal: "Searched for local inventory 8 times", strength: 92 },
      { type: "price_check", signal: "Used payment calculator 8 times", strength: 85 }
    ]
  },
  {
    id: "CJ-002",
    customerId: "C-12346",
    name: "Michael Chen",
    email: "m.chen@email.com",
    startDate: "2024-01-10",
    currentStage: "decision",
    purchaseIntent: 96,
    totalSessions: 63,
    totalPageViews: 487,
    timeSpent: "28h 45m",
    websites: [
      { site: "AutoTrader", visits: 18, timeSpent: "6h 30m" },
      { site: "Cars.com", visits: 12, timeSpent: "4h 15m" },
      { site: "CarGurus", visits: 22, timeSpent: "8h 20m" },
      { site: "Dealer Website", visits: 11, timeSpent: "9h 40m" }
    ],
    searchTerms: ["toyota camry vs honda accord", "best financing deals", "toyota dealer near me", "camry incentives"],
    behavior: {
      viewedVehicles: 31,
      savedVehicles: 8,
      requestedInfo: 6,
      calculatorUse: 15,
      financingViews: 22
    },
    lifecycle: [
      { stage: "awareness", date: "2024-01-10", duration: "2 days" },
      { stage: "interest", date: "2024-01-12", duration: "6 days" },
      { stage: "consideration", date: "2024-01-18", duration: "8 days" },
      { stage: "research", date: "2024-01-26", duration: "6 days" },
      { stage: "decision", date: "2024-02-01", duration: "ongoing" }
    ],
    signals: [
      { type: "ready_to_buy", signal: "Scheduled test drive appointment", strength: 98 },
      { type: "financing_ready", signal: "Applied for pre-approval", strength: 95 },
      { type: "dealer_contact", signal: "Called dealership 3 times", strength: 92 },
      { type: "urgency", signal: "Visited inventory daily for 5 days", strength: 89 }
    ]
  }
];

const aggregatedInsights = {
  totalTrackedCustomers: 1247,
  averageJourneyLength: "18.5 days",
  conversionRate: 12.8,
  topDropoffStage: "consideration",
  averageSessionsBeforePurchase: 42,
  topPurchaseSignals: [
    { signal: "Multiple financing page visits", accuracy: 94 },
    { signal: "Payment calculator usage", accuracy: 91 },
    { signal: "Local inventory searches", accuracy: 89 },
    { signal: "Comparison shopping behavior", accuracy: 87 }
  ]
};

export default function CustomerLifecycleTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedIntent, setSelectedIntent] = useState("all");

  const filteredCustomers = customerJourneyData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStage === "all" || customer.currentStage === selectedStage;
    const matchesIntent = selectedIntent === "all" || 
                         (selectedIntent === "high" && customer.purchaseIntent >= 80) ||
                         (selectedIntent === "medium" && customer.purchaseIntent >= 50 && customer.purchaseIntent < 80) ||
                         (selectedIntent === "low" && customer.purchaseIntent < 50);
    
    return matchesSearch && matchesStage && matchesIntent;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'awareness':
        return "bg-gray-100 text-gray-800";
      case 'interest':
        return "bg-blue-100 text-blue-800";
      case 'consideration':
        return "bg-yellow-100 text-yellow-800";
      case 'research':
        return "bg-orange-100 text-orange-800";
      case 'decision':
        return "bg-green-100 text-green-800";
      case 'purchase':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIntentColor = (intent: number) => {
    if (intent >= 80) return "text-green-600";
    if (intent >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 90) return "bg-green-500";
    if (strength >= 80) return "bg-yellow-500";
    return "bg-orange-500";
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Lifecycle Tracking</h1>
          <p className="text-gray-600 mt-1">Track every online shopper's journey from awareness to purchase</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Journey Data</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Setup Tracking</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tracked Customers</p>
                <p className="text-2xl font-bold text-gray-900">{aggregatedInsights.totalTrackedCustomers.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +23% this month
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Journey Length</p>
                <p className="text-2xl font-bold text-blue-600">{aggregatedInsights.averageJourneyLength}</p>
                <p className="text-sm text-blue-600">From first visit to purchase</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600">{aggregatedInsights.conversionRate}%</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.3% vs last month
                </p>
              </div>
              <Target className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Sessions</p>
                <p className="text-2xl font-bold text-purple-600">{aggregatedInsights.averageSessionsBeforePurchase}</p>
                <p className="text-sm text-purple-600">Before purchase</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="journeys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="journeys">Customer Journeys</TabsTrigger>
          <TabsTrigger value="insights">Behavioral Insights</TabsTrigger>
          <TabsTrigger value="signals">Purchase Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="journeys" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by customer name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Journey Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="interest">Interest</SelectItem>
                    <SelectItem value="consideration">Consideration</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="decision">Decision</SelectItem>
                    <SelectItem value="purchase">Purchase</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedIntent} onValueChange={setSelectedIntent}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Purchase Intent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Intent Levels</SelectItem>
                    <SelectItem value="high">High (80%+)</SelectItem>
                    <SelectItem value="medium">Medium (50-79%)</SelectItem>
                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Journey Cards */}
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{customer.name}</h3>
                        <Badge className={getStageColor(customer.currentStage)}>
                          {customer.currentStage}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span className={`font-semibold ${getIntentColor(customer.purchaseIntent)}`}>
                            {customer.purchaseIntent}% Intent
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{customer.email}</p>
                      <p className="text-gray-500 text-xs">Journey started: {customer.startDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Activity</p>
                      <p className="font-semibold">{customer.totalSessions} sessions</p>
                      <p className="text-sm text-gray-600">{customer.totalPageViews} page views</p>
                      <p className="text-sm text-gray-600">{customer.timeSpent} spent</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Journey Timeline */}
                    <div>
                      <h4 className="font-semibold mb-3">Journey Timeline</h4>
                      <div className="space-y-3">
                        {customer.lifecycle.map((stage, index) => (
                          <div key={stage.stage} className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              index === customer.lifecycle.length - 1 ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium capitalize">{stage.stage}</p>
                              <p className="text-xs text-gray-500">{stage.date} • {stage.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Website Activity */}
                    <div>
                      <h4 className="font-semibold mb-3">Website Activity</h4>
                      <div className="space-y-2">
                        {customer.websites.map((site) => (
                          <div key={site.site} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="text-sm font-medium">{site.site}</p>
                              <p className="text-xs text-gray-500">{site.visits} visits • {site.timeSpent}</p>
                            </div>
                            <Globe className="h-4 w-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Purchase Signals */}
                    <div>
                      <h4 className="font-semibold mb-3">Purchase Signals</h4>
                      <div className="space-y-2">
                        {customer.signals.slice(0, 3).map((signal, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-gray-700">{signal.type.replace('_', ' ')}</p>
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${getSignalStrengthColor(signal.strength)}`}></div>
                                <span className="text-xs font-semibold">{signal.strength}%</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">{signal.signal}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Viewed: {customer.behavior.viewedVehicles} vehicles</span>
                      <span>Saved: {customer.behavior.savedVehicles}</span>
                      <span>Info Requests: {customer.behavior.requestedInfo}</span>
                      <span>Calculator Use: {customer.behavior.calculatorUse}</span>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>View Full Journey</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel Analysis</CardTitle>
                <CardDescription>Drop-off rates at each journey stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Awareness</span>
                      <span className="text-sm font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Interest</span>
                      <span className="text-sm font-bold">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Consideration</span>
                      <span className="text-sm font-bold">43%</span>
                    </div>
                    <Progress value={43} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Research</span>
                      <span className="text-sm font-bold">28%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Decision</span>
                      <span className="text-sm font-bold">18%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Purchase</span>
                      <span className="text-sm font-bold">12.8%</span>
                    </div>
                    <Progress value={12.8} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Purchase Predictors</CardTitle>
                <CardDescription>Behavioral signals with highest accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aggregatedInsights.topPurchaseSignals.map((signal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{signal.signal}</p>
                        <p className="text-xs text-gray-600">Prediction accuracy</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{signal.accuracy}%</p>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getSignalStrengthColor(signal.accuracy)}`}></div>
                          <span className="text-xs text-gray-500">High accuracy</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Purchase Signal Monitoring</CardTitle>
              <CardDescription>
                Live tracking of high-intent behaviors across all customer journeys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-red-600">47</p>
                    <p className="text-sm text-gray-600">Critical Intent</p>
                    <p className="text-xs text-gray-500">95%+ probability</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">123</p>
                    <p className="text-sm text-gray-600">High Intent</p>
                    <p className="text-xs text-gray-500">80-94% probability</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">298</p>
                    <p className="text-sm text-gray-600">Medium Intent</p>
                    <p className="text-xs text-gray-500">60-79% probability</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">779</p>
                    <p className="text-sm text-gray-600">Early Stage</p>
                    <p className="text-xs text-gray-500">&lt;60% probability</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Recent High-Intent Activities</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">Jennifer Martinez completed credit application</p>
                        <p className="text-sm text-red-600">2 minutes ago • 98% purchase probability</p>
                      </div>
                      <Button size="sm" variant="outline">Contact Now</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div>
                        <p className="font-medium text-orange-800">Michael Chen scheduled test drive for tomorrow</p>
                        <p className="text-sm text-orange-600">15 minutes ago • 94% purchase probability</p>
                      </div>
                      <Button size="sm" variant="outline">Prepare Vehicle</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-800">Sarah Johnson used payment calculator 12 times today</p>
                        <p className="text-sm text-yellow-600">1 hour ago • 87% purchase probability</p>
                      </div>
                      <Button size="sm" variant="outline">Send Offer</Button>
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
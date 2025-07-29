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
  Clock, 
  Target, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  AlertCircle,
  ArrowRight,
  MousePointer,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Car,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Sample customer lifecycle data
const customerJourneyData = [
  {
    id: "CJ-001",
    customerId: "C-12345",
    name: "Jennifer Martinez",
    email: "jennifer.m@email.com",
    phone: "(555) 234-5678",
    startDate: "2024-01-15",
    currentStage: "research",
    purchaseIntent: 85,
    totalSessions: 47,
    totalPageViews: 342,
    timeSpent: "18h 32m",
    estimatedValue: 28000,
    websites: [
      { site: "AutoTrader", visits: 12, timeSpent: "4h 15m", lastVisit: "2 hours ago" },
      { site: "Cars.com", visits: 8, timeSpent: "2h 45m", lastVisit: "1 day ago" },
      { site: "CarGurus", visits: 15, timeSpent: "5h 22m", lastVisit: "3 hours ago" },
      { site: "Dealer Website", visits: 12, timeSpent: "6h 10m", lastVisit: "1 hour ago" }
    ],
    searchTerms: ["honda civic 2024", "best compact cars", "honda financing", "civic safety rating"],
    interestedVehicles: ["2024 Honda Civic", "2024 Toyota Corolla", "2024 Nissan Sentra"],
    behavior: {
      viewedVehicles: 23,
      savedVehicles: 5,
      requestedInfo: 3,
      calculatorUse: 8,
      financingViews: 12,
      dealerContacts: 2
    },
    lifecycle: [
      { stage: "awareness", date: "2024-01-15", duration: "3 days", completed: true },
      { stage: "interest", date: "2024-01-18", duration: "7 days", completed: true },
      { stage: "consideration", date: "2024-01-25", duration: "5 days", completed: true },
      { stage: "research", date: "2024-01-30", duration: "ongoing", completed: false }
    ],
    signals: [
      { type: "high_intent", signal: "Visited financing page 12 times", strength: 95, priority: "urgent" },
      { type: "comparison", signal: "Compared 3 vehicles extensively", strength: 88, priority: "high" },
      { type: "local_search", signal: "Searched for local inventory 8 times", strength: 92, priority: "urgent" },
      { type: "price_check", signal: "Used payment calculator 8 times", strength: 85, priority: "high" }
    ],
    nextActions: [
      "Schedule test drive",
      "Send personalized financing options", 
      "Follow up on saved vehicles"
    ],
    urgency: "high"
  },
  {
    id: "CJ-002", 
    customerId: "C-12346",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "(555) 345-6789",
    startDate: "2024-01-10",
    currentStage: "decision",
    purchaseIntent: 96,
    totalSessions: 63,
    totalPageViews: 487,
    timeSpent: "28h 45m",
    estimatedValue: 35000,
    websites: [
      { site: "AutoTrader", visits: 18, timeSpent: "6h 30m", lastVisit: "30 minutes ago" },
      { site: "Cars.com", visits: 12, timeSpent: "4h 15m", lastVisit: "2 hours ago" },
      { site: "CarGurus", visits: 22, timeSpent: "8h 20m", lastVisit: "1 hour ago" },
      { site: "Dealer Website", visits: 11, timeSpent: "9h 40m", lastVisit: "15 minutes ago" }
    ],
    searchTerms: ["toyota camry vs honda accord", "best financing deals", "toyota dealer near me", "camry incentives"],
    interestedVehicles: ["2024 Toyota Camry", "2024 Honda Accord", "2024 Mazda6"],
    behavior: {
      viewedVehicles: 31,
      savedVehicles: 8,
      requestedInfo: 6,
      calculatorUse: 15,
      financingViews: 22,
      dealerContacts: 4
    },
    lifecycle: [
      { stage: "awareness", date: "2024-01-10", duration: "2 days", completed: true },
      { stage: "interest", date: "2024-01-12", duration: "5 days", completed: true },
      { stage: "consideration", date: "2024-01-17", duration: "8 days", completed: true },
      { stage: "research", date: "2024-01-25", duration: "7 days", completed: true },
      { stage: "decision", date: "2024-02-01", duration: "ongoing", completed: false }
    ],
    signals: [
      { type: "ready_to_buy", signal: "Visited dealer website 4 times today", strength: 98, priority: "critical" },
      { type: "financing", signal: "Completed financing application", strength: 95, priority: "critical" },
      { type: "comparison", signal: "Final comparison between 2 models", strength: 92, priority: "urgent" },
      { type: "urgency", signal: "Searched 'best deals this month'", strength: 89, priority: "high" }
    ],
    nextActions: [
      "Call immediately - ready to purchase",
      "Present final offer",
      "Schedule immediate appointment"
    ],
    urgency: "critical"
  }
];

const lifecycleMetrics = {
  totalCustomers: 1847,
  activeJourneys: 312,
  highIntentCustomers: 47,
  readyToBuy: 12,
  avgJourneyDuration: "14.6 days",
  conversionRate: 18.4,
  totalValuePipeline: 2840000
};

export default function AICustomerLifecycle() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterStage, setFilterStage] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customerJourneyData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "all" || customer.currentStage === filterStage;
    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      awareness: "bg-blue-100 text-blue-800",
      interest: "bg-green-100 text-green-800", 
      consideration: "bg-yellow-100 text-yellow-800",
      research: "bg-orange-100 text-orange-800",
      decision: "bg-purple-100 text-purple-800",
      purchase: "bg-emerald-100 text-emerald-800"
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: { [key: string]: string } = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800", 
      urgent: "bg-red-100 text-red-800",
      critical: "bg-red-200 text-red-900 font-bold"
    };
    return colors[urgency] || "bg-gray-100 text-gray-800";
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case "critical": return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "urgent": return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case "high": return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Customer Lifecycle Intelligence</h2>
            <p className="text-sm text-gray-600">AI-powered customer journey tracking and purchase intent analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            <Activity className="w-3 h-3 mr-1" />
            Real-time Tracking Active
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{lifecycleMetrics.totalCustomers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Journeys</p>
                <p className="text-2xl font-bold text-green-600">{lifecycleMetrics.activeJourneys}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Intent</p>
                <p className="text-2xl font-bold text-orange-600">{lifecycleMetrics.highIntentCustomers}</p>
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
                <p className="text-2xl font-bold text-red-600">{lifecycleMetrics.readyToBuy}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Journey</p>
                <p className="text-2xl font-bold">{lifecycleMetrics.avgJourneyDuration}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion</p>
                <p className="text-2xl font-bold">{lifecycleMetrics.conversionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                <p className="text-xl font-bold">${(lifecycleMetrics.totalValuePipeline / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
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
      </div>

      {/* Customer Journey Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Customer Journey Analytics
          </CardTitle>
          <CardDescription>
            Real-time tracking of customer digital behavior and purchase intent scoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Current Stage</TableHead>
                <TableHead>Purchase Intent</TableHead>
                <TableHead>Journey Duration</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Estimated Value</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      <div className="text-sm text-gray-500">{customer.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStageColor(customer.currentStage)}>
                      {customer.currentStage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={customer.purchaseIntent} className="w-16" />
                      <span className="text-sm font-medium">{customer.purchaseIntent}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{Math.floor((Date.now() - new Date(customer.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</div>
                      <div className="text-gray-500">{customer.timeSpent} active</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{customer.totalSessions} sessions</div>
                      <div className="text-gray-500">{customer.totalPageViews} page views</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${customer.estimatedValue.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getUrgencyColor(customer.urgency)}>
                      {customer.urgency}
                    </Badge>
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

      {/* High Priority Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Urgent Customer Actions Required
          </CardTitle>
          <CardDescription>
            Customers showing immediate purchase intent requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customerJourneyData
              .filter(customer => customer.urgency === "critical" || customer.urgency === "urgent")
              .map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">
                        {customer.purchaseIntent}% purchase intent • {customer.urgency} priority
                      </div>
                      <div className="text-sm text-red-600 font-medium">
                        {customer.nextActions[0]}
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
    </div>
  );
}
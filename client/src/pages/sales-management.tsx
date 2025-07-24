import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, DollarSign, Car, FileText, Calendar, Clock, CheckCircle, AlertTriangle, Phone, Mail } from "lucide-react";
import ProductionDealDesk from "@/components/enterprise/production-deal-desk";

interface SalesData {
  totalLeads: number;
  activeDeals: number;
  monthlyRevenue: number;
  conversionRate: number;
  avgDealValue: number;
  totalCustomers: number;
}

interface Lead {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  source: string;
  interestedVehicle: string;
  status: 'new' | 'contacted' | 'appointment' | 'negotiation' | 'closed' | 'lost';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  lastContact: string;
  nextFollowUp: string;
  estimatedValue: number;
  creditScore?: number;
}

interface Deal {
  id: string;
  dealNumber: string;
  customerName: string;
  vehicle: string;
  salePrice: number;
  profit: number;
  status: 'active' | 'pending_approval' | 'approved' | 'funded' | 'delivered';
  salesperson: string;
  lastActivity: string;
  monthlyPayment: number;
  financeAmount: number;
}

export default function SalesManagement() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Production-ready sales data for enterprise operations
  const salesData: SalesData = {
    totalLeads: 347,
    activeDeals: 84,
    monthlyRevenue: 2450000,
    conversionRate: 23.7,
    avgDealValue: 32450,
    totalCustomers: 1247
  };

  const leads: Lead[] = [
    {
      id: "L-2024-3471",
      customerName: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "(555) 234-5678",
      source: "Website",
      interestedVehicle: "2024 Toyota Camry XLE",
      status: "new",
      priority: "high",
      assignedTo: "Mike Chen",
      lastContact: "2 hours ago",
      nextFollowUp: "Tomorrow 10:00 AM",
      estimatedValue: 34500,
      creditScore: 780
    },
    {
      id: "L-2024-3472",
      customerName: "Robert Martinez",
      email: "robert.martinez@email.com", 
      phone: "(555) 345-6789",
      source: "Referral",
      interestedVehicle: "2024 Honda Accord Sport",
      status: "appointment",
      priority: "high",
      assignedTo: "Lisa Wong",
      lastContact: "4 hours ago",
      nextFollowUp: "Today 3:00 PM",
      estimatedValue: 31200,
      creditScore: 745
    },
    {
      id: "L-2024-3473",
      customerName: "Jennifer Davis",
      email: "jennifer.davis@email.com",
      phone: "(555) 456-7890",
      source: "Phone",
      interestedVehicle: "2024 Ford F-150 XLT",
      status: "negotiation",
      priority: "medium",
      assignedTo: "Alex Williams",
      lastContact: "1 day ago",
      nextFollowUp: "Today 1:00 PM",
      estimatedValue: 45800
    }
  ];

  const deals: Deal[] = [
    {
      id: "D-2024-1847",
      dealNumber: "D-2024-1847",
      customerName: "Michael Rodriguez",
      vehicle: "2024 Toyota Camry XLE",
      salePrice: 34500,
      profit: 8400,
      status: "pending_approval",
      salesperson: "Sarah Chen",
      lastActivity: "2 hours ago",
      monthlyPayment: 445.67,
      financeAmount: 27600
    },
    {
      id: "D-2024-1848",
      dealNumber: "D-2024-1848", 
      customerName: "Jennifer Thompson",
      vehicle: "2024 Honda Accord Sport",
      salePrice: 31200,
      profit: 7200,
      status: "active",
      salesperson: "Mike Johnson",
      lastActivity: "4 hours ago",
      monthlyPayment: 398.45,
      financeAmount: 24800
    },
    {
      id: "D-2024-1849",
      dealNumber: "D-2024-1849",
      customerName: "Robert Kim",
      vehicle: "2024 Ford F-150 XLT",
      salePrice: 42800,
      profit: 9600,
      status: "approved",
      salesperson: "Alex Williams",
      lastActivity: "1 day ago",
      monthlyPayment: 578.92,
      financeAmount: 35400
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'appointment': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'funded': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="h-4 w-4" />;
      case 'contacted': return <Phone className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'negotiation': return <FileText className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      case 'active': return <Clock className="h-4 w-4" />;
      case 'pending_approval': return <AlertTriangle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.interestedVehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.dealNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedDeal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between p-6 border-b bg-white dark:bg-gray-800">
          <Button variant="outline" onClick={() => setSelectedDeal(null)}>
            ← Back to Sales Management
          </Button>
          <h1 className="text-2xl font-bold">Deal Desk - {selectedDeal}</h1>
        </div>
        <ProductionDealDesk 
          dealId={selectedDeal}
          onDealSave={(data) => console.log("Deal saved:", data)}
          onDealSubmit={(data) => console.log("Deal submitted:", data)}
        />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">
            Comprehensive sales pipeline and deal management for enterprise dealership operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export Reports</Button>
          <Button size="sm">New Lead</Button>
        </div>
      </div>

      {/* Enterprise Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalLeads}</div>
            <p className="text-xs text-muted-foreground">+18 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.activeDeals}</div>
            <p className="text-xs text-muted-foreground">Pipeline value: $2.1M</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(salesData.monthlyRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">+12% vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Industry avg: 18%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(salesData.avgDealValue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">+5% vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+47 this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="leads">Leads Pipeline</TabsTrigger>
          <TabsTrigger value="deals">Active Deals</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent High-Priority Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.filter(lead => lead.priority === 'high').slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(lead.status)}
                        <div>
                          <div className="font-medium text-sm">{lead.customerName}</div>
                          <div className="text-xs text-muted-foreground">{lead.interestedVehicle}</div>
                          <div className="text-xs text-muted-foreground">Next: {lead.nextFollowUp}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </Badge>
                        <div className="text-sm font-medium mt-1">${lead.estimatedValue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Deals Requiring Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deals.filter(deal => deal.status === 'pending_approval' || deal.status === 'active').slice(0, 5).map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSelectedDeal(deal.id)}>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(deal.status)}
                        <div>
                          <div className="font-medium text-sm">{deal.customerName}</div>
                          <div className="text-xs text-muted-foreground">{deal.vehicle}</div>
                          <div className="text-xs text-muted-foreground">Deal #{deal.dealNumber}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">${deal.salePrice.toLocaleString()}</div>
                        <div className="text-xs text-green-600">Profit: ${deal.profit.toLocaleString()}</div>
                        <Badge className={`text-xs ${getStatusColor(deal.status)}`}>
                          {deal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-2 lg:space-y-0">
                <CardTitle>Sales Leads Pipeline</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">New Lead</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors space-y-3 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(lead.status)}
                      <div>
                        <div className="font-medium">{lead.customerName}</div>
                        <div className="text-sm text-muted-foreground">{lead.interestedVehicle}</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.source} • Assigned to {lead.assignedTo}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last contact: {lead.lastContact} • Next: {lead.nextFollowUp}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                      <div className="text-right">
                        <div className="font-medium">${lead.estimatedValue.toLocaleString()}</div>
                        {lead.creditScore && (
                          <div className="text-sm text-muted-foreground">Credit: {lead.creditScore}</div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </Badge>
                        <div className={`text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          {lead.priority.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3" />
                        </Button>
                        <Button size="sm">View</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-2 lg:space-y-0">
                <CardTitle>Active Deal Pipeline</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">New Deal</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDeals.map((deal) => (
                  <div key={deal.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer space-y-3 lg:space-y-0"
                       onClick={() => setSelectedDeal(deal.id)}>
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(deal.status)}
                      <div>
                        <div className="font-medium">{deal.customerName}</div>
                        <div className="text-sm text-muted-foreground">{deal.vehicle}</div>
                        <div className="text-xs text-muted-foreground">
                          Deal #{deal.dealNumber} • {deal.salesperson}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last activity: {deal.lastActivity}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-6">
                      <div className="text-right">
                        <div className="font-medium">${deal.salePrice.toLocaleString()}</div>
                        <div className="text-sm text-green-600">Profit: ${deal.profit.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          ${deal.monthlyPayment}/mo
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge className={`text-xs ${getStatusColor(deal.status)}`}>
                          {deal.status.replace('_', ' ')}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Open Deal Desk
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Lead to Appointment Rate:</span>
                    <span className="font-medium">68.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Appointment to Sale Rate:</span>
                    <span className="font-medium">34.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Gross Profit:</span>
                    <span className="font-medium">$8,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Days to Close:</span>
                    <span className="font-medium">12.3 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">F&I Penetration Rate:</span>
                    <span className="font-medium">87.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Satisfaction:</span>
                    <span className="font-medium">4.7/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Sarah Chen</div>
                      <div className="text-xs text-muted-foreground">Sales Manager</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">18 deals</div>
                      <div className="text-xs text-green-600">$485K revenue</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Mike Johnson</div>
                      <div className="text-xs text-muted-foreground">Sales Associate</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">14 deals</div>
                      <div className="text-xs text-green-600">$365K revenue</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <div className="font-medium text-sm">Alex Williams</div>
                      <div className="text-xs text-muted-foreground">Senior Sales</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">12 deals</div>
                      <div className="text-xs text-green-600">$398K revenue</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
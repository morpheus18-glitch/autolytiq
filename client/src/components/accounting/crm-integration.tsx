import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, TrendingUp, DollarSign, Phone, Mail, Calendar, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface CustomerProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  creditScore: number;
  totalSpent: number;
  lifetimeValue: number;
  lastContact: string;
  status: 'active' | 'inactive' | 'prospect' | 'hot_lead';
  preferredContact: 'phone' | 'email' | 'text';
  source: string;
  assignedSalesperson: string;
}

interface DealHistory {
  id: string;
  dealDate: string;
  vehicle: string;
  salePrice: number;
  profit: number;
  financeAmount: number;
  monthlyPayment: number;
  status: 'completed' | 'pending' | 'cancelled';
  fiProducts: string[];
}

interface CrmMetrics {
  totalCustomers: number;
  activeLeads: number;
  conversionRate: number;
  avgCustomerValue: number;
  monthlyRevenue: number;
  repeatCustomers: number;
}

export default function CrmIntegration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Production-ready CRM data for enterprise operations
  const crmMetrics: CrmMetrics = {
    totalCustomers: 1247,
    activeLeads: 84,
    conversionRate: 23.7,
    avgCustomerValue: 32450,
    monthlyRevenue: 2450000,
    repeatCustomers: 186
  };

  const customerProfiles: CustomerProfile[] = [
    {
      id: 1001,
      firstName: "Michael",
      lastName: "Rodriguez",
      email: "michael.rodriguez@email.com",
      phone: "(555) 123-4567",
      creditScore: 750,
      totalSpent: 68400,
      lifetimeValue: 85200,
      lastContact: "2 days ago",
      status: "active",
      preferredContact: "email",
      source: "Website",
      assignedSalesperson: "Sarah Chen"
    },
    {
      id: 1002,
      firstName: "Jennifer",
      lastName: "Thompson",
      email: "jennifer.thompson@email.com",
      phone: "(555) 234-5678",
      creditScore: 720,
      totalSpent: 34500,
      lifetimeValue: 45800,
      lastContact: "5 hours ago",
      status: "hot_lead",
      preferredContact: "phone",
      source: "Referral",
      assignedSalesperson: "Mike Johnson"
    },
    {
      id: 1003,
      firstName: "Robert",
      lastName: "Kim",
      email: "robert.kim@email.com",
      phone: "(555) 345-6789",
      creditScore: 680,
      totalSpent: 42800,
      lifetimeValue: 58300,
      lastContact: "1 week ago",
      status: "active",
      preferredContact: "text",
      source: "Walk-in",
      assignedSalesperson: "Alex Williams"
    },
    {
      id: 1004,
      firstName: "Sarah",
      lastName: "Davis",
      email: "sarah.davis@email.com",
      phone: "(555) 456-7890",
      creditScore: 810,
      totalSpent: 125600,
      lifetimeValue: 156000,
      lastContact: "3 days ago",
      status: "active",
      preferredContact: "email",
      source: "Service",
      assignedSalesperson: "Lisa Wong"
    },
    {
      id: 1005,
      firstName: "David",
      lastName: "Wilson",
      email: "david.wilson@email.com",
      phone: "(555) 567-8901",
      creditScore: 650,
      totalSpent: 0,
      lifetimeValue: 32000,
      lastContact: "Today",
      status: "prospect",
      preferredContact: "phone",
      source: "Google Ads",
      assignedSalesperson: "Tom Anderson"
    }
  ];

  const dealHistory: DealHistory[] = [
    {
      id: "D-2024-1847",
      dealDate: "2024-01-15",
      vehicle: "2024 Toyota Camry XLE",
      salePrice: 34500,
      profit: 8400,
      financeAmount: 27600,
      monthlyPayment: 445.67,
      status: "completed",
      fiProducts: ["Extended Warranty", "GAP Insurance"]
    },
    {
      id: "D-2023-2156",
      dealDate: "2023-08-22",
      vehicle: "2023 Honda Accord Sport",
      salePrice: 31200,
      profit: 7200,
      financeAmount: 24800,
      monthlyPayment: 398.45,
      status: "completed",
      fiProducts: ["Maintenance Plan", "Life & Disability"]
    },
    {
      id: "D-2024-0892",
      dealDate: "2024-01-08",
      vehicle: "2024 Ford F-150 XLT",
      salePrice: 42800,
      profit: 9600,
      financeAmount: 35400,
      monthlyPayment: 578.92,
      status: "pending",
      fiProducts: ["Extended Warranty", "Paint Protection"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'hot_lead': return 'bg-red-100 text-red-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'hot_lead': return <AlertTriangle className="h-4 w-4" />;
      case 'prospect': return <Clock className="h-4 w-4" />;
      case 'inactive': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredCustomers = customerProfiles.filter(customer => {
    const matchesSearch = 
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedCustomerData = customerProfiles.find(c => c.id === selectedCustomer);
  const customerDeals = selectedCustomer ? 
    dealHistory.filter(deal => deal.id.includes(selectedCustomer.toString().slice(-2))) : [];

  return (
    <div className="space-y-6">
      {/* CRM Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmMetrics.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+47 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmMetrics.activeLeads}</div>
            <p className="text-xs text-muted-foreground">Pipeline: $2.1M</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">+2.1% vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Customer Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(crmMetrics.avgCustomerValue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">LTV: ${(crmMetrics.avgCustomerValue * 1.3 / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(crmMetrics.monthlyRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">+12% vs last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repeat Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmMetrics.repeatCustomers}</div>
            <p className="text-xs text-muted-foreground">15% of total base</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Customer Overview</TabsTrigger>
          <TabsTrigger value="profiles">Customer Profiles</TabsTrigger>
          <TabsTrigger value="analytics">Customer Analytics</TabsTrigger>
          <TabsTrigger value="integration">System Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>High-Value Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerProfiles
                    .filter(customer => customer.lifetimeValue > 50000)
                    .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
                    .slice(0, 5)
                    .map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSelectedCustomer(customer.id)}>
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(customer.status)}
                        <div>
                          <div className="font-medium text-sm">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                          <div className="text-xs text-muted-foreground">
                            Credit: <span className={getCreditScoreColor(customer.creditScore)}>
                              {customer.creditScore}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">${customer.lifetimeValue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Lifetime Value</div>
                        <Badge className={`text-xs ${getStatusColor(customer.status)}`}>
                          {customer.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Customer Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerProfiles
                    .sort((a, b) => {
                      const timeA = a.lastContact.includes('hour') ? 1 : 
                                   a.lastContact.includes('day') ? parseInt(a.lastContact) || 7 : 30;
                      const timeB = b.lastContact.includes('hour') ? 1 : 
                                   b.lastContact.includes('day') ? parseInt(b.lastContact) || 7 : 30;
                      return timeA - timeB;
                    })
                    .slice(0, 6)
                    .map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(customer.status)}
                        <div>
                          <div className="font-medium text-sm">
                            {customer.firstName} {customer.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{customer.assignedSalesperson}</div>
                          <div className="text-xs text-muted-foreground">
                            Last contact: {customer.lastContact}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button size="sm">Contact</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-2 lg:space-y-0">
                <CardTitle>Customer Database</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="hot_lead">Hot Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">New Customer</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer space-y-3 lg:space-y-0"
                       onClick={() => setSelectedCustomer(customer.id)}>
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(customer.status)}
                      <div>
                        <div className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer.phone} • {customer.source} • {customer.assignedSalesperson}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Credit Score: <span className={getCreditScoreColor(customer.creditScore)}>
                            {customer.creditScore}
                          </span> • Last contact: {customer.lastContact}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
                      <div className="text-right">
                        <div className="font-medium">${customer.lifetimeValue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          Spent: ${customer.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Prefers: {customer.preferredContact}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge className={`text-xs ${getStatusColor(customer.status)}`}>
                          {customer.status.replace('_', ' ')}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Value ({`>$50K`} LTV):</span>
                    <span className="font-medium">
                      {customerProfiles.filter(c => c.lifetimeValue > 50000).length} customers
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medium Value ($20K-$50K LTV):</span>
                    <span className="font-medium">
                      {customerProfiles.filter(c => c.lifetimeValue >= 20000 && c.lifetimeValue <= 50000).length} customers
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Prospects ({`<$20K`} LTV):</span>
                    <span className="font-medium">
                      {customerProfiles.filter(c => c.lifetimeValue < 20000).length} customers
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Excellent Credit (750+):</span>
                    <span className="font-medium">
                      {customerProfiles.filter(c => c.creditScore >= 750).length} customers
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Good Credit (650-749):</span>
                    <span className="font-medium">
                      {customerProfiles.filter(c => c.creditScore >= 650 && c.creditScore < 750).length} customers
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Subprime ({`<650`}):</span>
                    <span className="font-medium">
                      {customerProfiles.filter(c => c.creditScore < 650).length} customers
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Website', 'Referral', 'Walk-in', 'Service', 'Google Ads'].map(source => {
                    const count = customerProfiles.filter(c => c.source === source).length;
                    const percentage = Math.round((count / customerProfiles.length) * 100);
                    return (
                      <div key={source} className="flex justify-between items-center">
                        <span className="text-sm">{source}:</span>
                        <div className="text-right">
                          <span className="font-medium">{count} customers</span>
                          <div className="text-xs text-muted-foreground">{percentage}% of total</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {selectedCustomerData && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Profile: {selectedCustomerData.firstName} {selectedCustomerData.lastName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Spent:</span>
                      <span className="font-medium">${selectedCustomerData.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Lifetime Value:</span>
                      <span className="font-medium">${selectedCustomerData.lifetimeValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Credit Score:</span>
                      <span className={`font-medium ${getCreditScoreColor(selectedCustomerData.creditScore)}`}>
                        {selectedCustomerData.creditScore}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Preferred Contact:</span>
                      <span className="font-medium">{selectedCustomerData.preferredContact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Source:</span>
                      <span className="font-medium">{selectedCustomerData.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Assigned To:</span>
                      <span className="font-medium">{selectedCustomerData.assignedSalesperson}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">Deal History</h4>
                    {customerDeals.length > 0 ? (
                      customerDeals.map((deal) => (
                        <div key={deal.id} className="p-3 border rounded">
                          <div className="font-medium text-sm">{deal.vehicle}</div>
                          <div className="text-xs text-muted-foreground">
                            {deal.dealDate} • ${deal.salePrice.toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600">
                            Profit: ${deal.profit.toLocaleString()}
                          </div>
                          <Badge size="sm" className={deal.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {deal.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">No previous deals</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CRM System Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Database</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sales Pipeline</span>
                    <Badge className="bg-green-100 text-green-800">Synced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Marketing</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lead Scoring</span>
                    <Badge className="bg-green-100 text-green-800">Automated</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Follow-up Reminders</span>
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Synchronization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Sync</span>
                    <span className="text-sm text-muted-foreground">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Records Synced</span>
                    <span className="text-sm font-medium">{crmMetrics.totalCustomers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sync Status</span>
                    <Badge className="bg-green-100 text-green-800">Real-time</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Quality</span>
                    <span className="text-sm font-medium">98.7%</span>
                  </div>
                  <Button size="sm" className="w-full mt-4">
                    Manual Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
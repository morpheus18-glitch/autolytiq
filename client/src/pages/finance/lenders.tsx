import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Building, DollarSign, TrendingUp, Star, Settings, Phone, Mail, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const lenderData = [
  {
    id: "LEN001",
    name: "Honda Finance",
    type: "Captive",
    status: "Active",
    priority: "Tier 1",
    contact: {
      rep: "Jennifer Martinez",
      phone: "(555) 123-4567",
      email: "j.martinez@hondafinance.com"
    },
    terms: {
      minFico: 620,
      maxLtv: 125,
      maxTerm: 84,
      minAmount: 5000,
      maxAmount: 150000
    },
    performance: {
      approvalRate: 78.5,
      avgRate: 4.9,
      avgReserve: 1.65,
      turnaroundHours: 2.3,
      volume: 32
    },
    products: ["New", "Used", "Lease", "Refinance"]
  },
  {
    id: "LEN002", 
    name: "Bank of America",
    type: "Bank",
    status: "Active",
    priority: "Tier 1",
    contact: {
      rep: "Michael Chen",
      phone: "(555) 234-5678",
      email: "m.chen@bankofamerica.com"
    },
    terms: {
      minFico: 650,
      maxLtv: 120,
      maxTerm: 72,
      minAmount: 10000,
      maxAmount: 200000
    },
    performance: {
      approvalRate: 82.1,
      avgRate: 5.4,
      avgReserve: 1.85,
      turnaroundHours: 4.2,
      volume: 28
    },
    products: ["New", "Used", "Refinance"]
  },
  {
    id: "LEN003",
    name: "Nissan Motor Acceptance",
    type: "Captive",
    status: "Active", 
    priority: "Tier 1",
    contact: {
      rep: "Sarah Kim",
      phone: "(555) 345-6789",
      email: "s.kim@nissanusa.com"
    },
    terms: {
      minFico: 600,
      maxLtv: 130,
      maxTerm: 84,
      minAmount: 8000,
      maxAmount: 175000
    },
    performance: {
      approvalRate: 75.3,
      avgRate: 4.2,
      avgReserve: 1.58,
      turnaroundHours: 3.1,
      volume: 24
    },
    products: ["New", "Used", "Lease"]
  },
  {
    id: "LEN004",
    name: "Wells Fargo Dealer Services",
    type: "Bank",
    status: "Active",
    priority: "Tier 2",
    contact: {
      rep: "David Rodriguez",
      phone: "(555) 456-7890", 
      email: "d.rodriguez@wellsfargo.com"
    },
    terms: {
      minFico: 580,
      maxLtv: 115,
      maxTerm: 75,
      minAmount: 7500,
      maxAmount: 125000
    },
    performance: {
      approvalRate: 68.9,
      avgRate: 6.8,
      avgReserve: 2.25,
      turnaroundHours: 6.5,
      volume: 18
    },
    products: ["New", "Used", "Refinance"]
  },
  {
    id: "LEN005",
    name: "Capital One Auto Finance",
    type: "Bank",
    status: "Active",
    priority: "Tier 2",
    contact: {
      rep: "Lisa Park",
      phone: "(555) 567-8901",
      email: "l.park@capitalone.com"
    },
    terms: {
      minFico: 540,
      maxLtv: 110,
      maxTerm: 72,
      minAmount: 5000,
      maxAmount: 100000
    },
    performance: {
      approvalRate: 72.4,
      avgRate: 7.9,
      avgReserve: 2.75,
      turnaroundHours: 8.2,
      volume: 15
    },
    products: ["New", "Used"]
  }
];

export default function LenderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredLenders = lenderData.filter(lender => {
    const matchesSearch = lender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lender.contact.rep.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || lender.type === selectedType;
    const matchesPriority = selectedPriority === "all" || lender.priority === selectedPriority;
    const matchesStatus = selectedStatus === "all" || lender.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Tier 1':
        return "bg-green-100 text-green-800";
      case 'Tier 2':
        return "bg-blue-100 text-blue-800";
      case 'Tier 3':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return "bg-green-100 text-green-800";
      case 'Inactive':
        return "bg-red-100 text-red-800";
      case 'Pending':
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalVolume = lenderData.reduce((sum, lender) => sum + lender.performance.volume, 0);
  const avgApprovalRate = lenderData.reduce((sum, lender) => sum + lender.performance.approvalRate, 0) / lenderData.length;
  const avgReserve = lenderData.reduce((sum, lender) => sum + lender.performance.avgReserve, 0) / lenderData.length;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lender Management</h1>
          <p className="text-gray-600 mt-1">Manage relationships and track performance with finance partners</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Rate Sheets</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Lender</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Lenders</p>
                <p className="text-2xl font-bold text-gray-900">{lenderData.filter(l => l.status === 'Active').length}</p>
                <p className="text-sm text-green-600">All operational</p>
              </div>
              <Building className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Volume</p>
                <p className="text-2xl font-bold text-blue-600">{totalVolume}</p>
                <p className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% vs last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Approval Rate</p>
                <p className="text-2xl font-bold text-green-600">{formatPercent(avgApprovalRate)}</p>
                <p className="text-sm text-green-600">Strong performance</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Reserve Rate</p>
                <p className="text-2xl font-bold text-purple-600">{formatPercent(avgReserve)}</p>
                <p className="text-sm text-purple-600">Competitive rates</p>
              </div>
              <Star className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lenders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="lenders">All Lenders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="lenders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by lender name or rep..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Lender Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Captive">Captive</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                    <SelectItem value="Credit Union">Credit Union</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Tier 1">Tier 1</SelectItem>
                    <SelectItem value="Tier 2">Tier 2</SelectItem>
                    <SelectItem value="Tier 3">Tier 3</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lenders Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Approval Rate</TableHead>
                    <TableHead className="text-right">Avg Rate</TableHead>
                    <TableHead className="text-right">Reserve</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLenders.map((lender) => (
                    <TableRow key={lender.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lender.name}</p>
                          <p className="text-sm text-gray-500">{lender.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lender.contact.rep}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Phone className="h-3 w-3" />
                            <span>{lender.contact.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{lender.type}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(lender.priority)}>
                          {lender.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPercent(lender.performance.approvalRate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPercent(lender.performance.avgRate)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatPercent(lender.performance.avgReserve)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {lender.performance.volume}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(lender.status)}>
                          {lender.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="h-3 w-3" />
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

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Lenders</CardTitle>
                <CardDescription>Based on approval rate and volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lenderData
                    .sort((a, b) => b.performance.approvalRate - a.performance.approvalRate)
                    .slice(0, 3)
                    .map((lender, index) => (
                    <div key={lender.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          'bg-orange-400 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{lender.name}</p>
                          <p className="text-sm text-gray-600">{formatPercent(lender.performance.approvalRate)} approval</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{lender.performance.volume}</p>
                        <p className="text-sm text-gray-600">deals</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reserve Income Leaders</CardTitle>
                <CardDescription>Highest reserve rate providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lenderData
                    .sort((a, b) => b.performance.avgReserve - a.performance.avgReserve)
                    .slice(0, 3)
                    .map((lender, index) => (
                    <div key={lender.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-green-400 text-green-900' :
                          index === 1 ? 'bg-blue-400 text-blue-900' :
                          'bg-purple-400 text-purple-900'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{lender.name}</p>
                          <p className="text-sm text-gray-600">{formatPercent(lender.performance.avgReserve)} reserve</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(lender.performance.avgReserve * lender.performance.volume * 25000 / 100)}</p>
                        <p className="text-sm text-gray-600">est. monthly</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {(lenderData.reduce((sum, l) => sum + l.performance.turnaroundHours, 0) / lenderData.length).toFixed(1)}h
                  </p>
                  <p className="text-sm text-gray-600">Avg Turnaround</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPercent(lenderData.reduce((sum, l) => sum + l.performance.approvalRate, 0) / lenderData.length)}
                  </p>
                  <p className="text-sm text-gray-600">Overall Approval</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatPercent(lenderData.reduce((sum, l) => sum + l.performance.avgReserve, 0) / lenderData.length)}
                  </p>
                  <p className="text-sm text-gray-600">Avg Reserve</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {lenderData.reduce((sum, l) => sum + l.performance.volume, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Monthly Volume</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lender Management Settings</CardTitle>
              <CardDescription>
                Configure lender routing rules and approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">Routing Rules</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Auto-route Tier 1 credit (720+ FICO) to captive lenders first</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Route sub-prime applications (&lt; 600 FICO) to specialty lenders</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Prioritize lenders by reserve rate for similar credit profiles</span>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Approval Workflow</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Require manager approval for deals &gt; $75,000</span>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Auto-decline applications below minimum FICO requirements</span>
                      <Button variant="outline" size="sm">Enable</Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Send automatic notifications for approval/decline decisions</span>
                      <Button variant="outline" size="sm">Enable</Button>
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
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LeadManagementGrid } from '@/components/loose/lead-management-grid.tsx';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Car,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Target,
  Phone,
  Mail,
  User,
  FileText,
  CreditCard,
  Zap,
  BarChart3,
  Filter,
  Download,
  Star,
  ThumbsUp,
  MessageCircle,
  ArrowRight,
  Eye
} from 'lucide-react';

interface Lead {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  interestedIn: string;
  status: string;
  temperature: string;
  source: string;
  assignedTo: string;
  createdAt: string;
  estimatedValue: number;
  conversionProbability: number;
}

interface Sale {
  id: number;
  customerId: number;
  vehicleId: number;
  salesPersonId: number;
  saleDate: string;
  salePrice: number;
  downPayment: number;
  financeAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;
  status: string;
  financeCompany: string;
  notes: string;
  createdAt: string;
}

export default function Sales() {
  const [activeTab, setActiveTab] = useState('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTemperature, setFilterTemperature] = useState('all');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
    retry: 1,
    retryDelay: 1000,
  });

  const { data: sales = [], isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ['/api/sales'],
    retry: 1,
    retryDelay: 1000,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest(`/api/leads/${id}`, 'PUT', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Success",
        description: "Lead updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead",
        variant: "destructive",
      });
    },
  });

  const filteredLeads = leads.filter((lead: Lead) => {
    const matchesSearch = lead.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.interestedIn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesTemperature = filterTemperature === 'all' || lead.temperature === filterTemperature;
    return matchesSearch && matchesStatus && matchesTemperature;
  });

  const getStatusVariant = (status: string): 'info' | 'warning' | 'success' | 'secondary' | 'error' | 'default' => {
    switch (status) {
      case 'new': return 'info';
      case 'contacted': return 'warning';
      case 'qualified': return 'success';
      case 'proposal': return 'secondary';
      case 'negotiation': return 'warning';
      case 'closed': return 'secondary';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const getTemperatureVariant = (temperature: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (temperature) {
      case 'hot': return 'error';
      case 'warm': return 'warning';
      case 'cold': return 'info';
      default: return 'default';
    }
  };

  const getTemperatureIcon = (temperature: string) => {
    switch (temperature) {
      case 'hot': return <Zap className="h-4 w-4" />;
      case 'warm': return <Target className="h-4 w-4" />;
      case 'cold': return <Clock className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const totalLeadValue = filteredLeads.reduce((sum: number, lead: Lead) => sum + (lead.estimatedValue || 0), 0);
  const avgConversionProbability = filteredLeads.length > 0 
    ? filteredLeads.reduce((sum: number, lead: Lead) => sum + (lead.conversionProbability || 0), 0) / filteredLeads.length
    : 0;

  const totalSalesValue = sales.reduce((sum: number, sale: Sale) => sum + sale.salePrice, 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Sales Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage leads and track sales performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="btn-embossed w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Leads</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{leads.length}</p>
              </div>
              <Users className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Pipeline</p>
                <p className="text-base sm:text-lg md:text-xl font-bold">${(totalLeadValue / 1000).toFixed(0)}k</p>
              </div>
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Conversion</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{avgConversionProbability.toFixed(0)}%</p>
              </div>
              <Target className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="flex-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">Sales</p>
                <p className="text-base sm:text-lg md:text-xl font-bold">${(totalSalesValue / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600 self-end sm:self-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leads">Professional Leads</TabsTrigger>
          <TabsTrigger value="sales">Closed Sales</TabsTrigger>
        </TabsList>

        {/* Leads Tab - Professional Lead Management Grid */}
        <TabsContent value="leads" className="space-y-4">
          <LeadManagementGrid />
        </TabsContent>

        {/* Original Leads Tab Content - Now Hidden */}
        <TabsContent value="original-leads" className="space-y-4 hidden">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed">Closed</option>
                <option value="lost">Lost</option>
              </select>
              <select
                value={filterTemperature}
                onChange={(e) => setFilterTemperature(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Temperature</option>
                <option value="hot">Hot</option>
                <option value="warm">Warm</option>
                <option value="cold">Cold</option>
              </select>
            </div>
          </div>

          {/* Leads List */}
          {leadsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading leads...</p>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leads found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' || filterTemperature !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by adding your first lead'}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredLeads.map((lead: Lead) => (
                  <Card key={lead.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{lead.customerName}</h3>
                        <p className="text-sm text-gray-600">{lead.interestedIn}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getTemperatureVariant(lead.temperature)}>
                          {getTemperatureIcon(lead.temperature)}
                          <span className="ml-1">{lead.temperature}</span>
                        </Badge>
                        <Badge variant={getStatusVariant(lead.status)}>
                          {lead.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{lead.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{lead.customerPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Value:</span>
                        <span className="font-semibold">${lead.estimatedValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Conversion:</span>
                        <span className="font-semibold">{lead.conversionProbability}%</span>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => updateLeadMutation.mutate({ id: lead.id, status: 'qualified' })}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Temperature</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Conversion</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead: Lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{lead.customerName}</div>
                              <div className="text-sm text-gray-600">{lead.source}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{lead.customerEmail}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{lead.customerPhone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{lead.interestedIn}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(lead.status)}>
                              {lead.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getTemperatureVariant(lead.temperature)}>
                              {getTemperatureIcon(lead.temperature)}
                              <span className="ml-1">{lead.temperature}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${lead.estimatedValue?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${lead.conversionProbability}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{lead.conversionProbability}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{lead.assignedTo}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" title="Contact">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" title="Edit">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => updateLeadMutation.mutate({ id: lead.id, status: 'qualified' })}
                                title="Advance Stage"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          {salesLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading sales...</p>
              </div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
              <p className="text-gray-600 mb-4">Start converting leads to see your sales here</p>
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Sale Price</TableHead>
                    <TableHead>Down Payment</TableHead>
                    <TableHead>Finance Amount</TableHead>
                    <TableHead>Monthly Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale: Sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                      <TableCell>Customer #{sale.customerId}</TableCell>
                      <TableCell>Vehicle #{sale.vehicleId}</TableCell>
                      <TableCell className="font-semibold">${sale.salePrice.toLocaleString()}</TableCell>
                      <TableCell>${sale.downPayment.toLocaleString()}</TableCell>
                      <TableCell>${sale.financeAmount.toLocaleString()}</TableCell>
                      <TableCell>${sale.monthlyPayment.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(sale.status)}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
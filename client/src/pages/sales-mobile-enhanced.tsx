import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import LeadDistributionConfig from '@/components/lead-distribution-config';
import RolePermissionsConfig from '@/components/role-permissions-config';
import { 
  Plus, 
  Search, 
  Filter,
  Download,
  Upload,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Car,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Settings,
  FileText,
  Zap,
  ArrowRight,
  UserCheck,
  ArrowUpDown,
  ChevronRight,
  Activity,
  BarChart3,
  Globe,
  Shield,
  Bell,
  Smartphone,
  Monitor,
  Copy,
  Code,
  Database
} from 'lucide-react';
import type { XmlLead, LeadDistributionRule, SystemRole, ModuleConfig } from '@shared/schema';

interface MobileLeadCard {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  interestedIn: string;
  status: 'new' | 'assigned' | 'contacted' | 'qualified' | 'lost' | 'converted';
  priority: 'high' | 'medium' | 'low';
  source: string;
  assignedTo?: string;
  leadType: string;
  vehicleOfInterest?: string;
  appointmentRequested: boolean;
  createdAt: string;
  lastContact?: string;
  nextFollowUp?: string;
  rawXml?: string;
}

const mockXmlLeads: MobileLeadCard[] = [
  {
    id: 1,
    customerName: "John Smith",
    customerEmail: "john.smith@email.com",
    customerPhone: "(555) 123-4567",
    interestedIn: "2023 Honda Civic",
    status: "new",
    priority: "high",
    source: "AutoTrader",
    leadType: "inquiry",
    vehicleOfInterest: "2023 Honda Civic LX",
    appointmentRequested: true,
    createdAt: "2025-01-21T14:30:00Z",
    rawXml: `<?xml version="1.0" encoding="UTF-8"?>
<ADF>
  <Prospect>
    <Customer>
      <Name>John Smith</Name>
      <Email>john.smith@email.com</Email>
      <Phone>5551234567</Phone>
    </Customer>
    <Vehicle interest="buy" status="new">
      <Year>2023</Year>
      <Make>Honda</Make>
      <Model>Civic</Model>
      <Trim>LX</Trim>
    </Vehicle>
    <Comments>Looking for financing options. Interested in test drive this weekend.</Comments>
  </Prospect>
</ADF>`
  },
  {
    id: 2,
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    customerPhone: "(555) 987-6543",
    interestedIn: "2024 Toyota Camry",
    status: "assigned",
    priority: "medium",
    source: "Cars.com",
    assignedTo: "Mike Wilson",
    leadType: "appointment",
    vehicleOfInterest: "2024 Toyota Camry SE",
    appointmentRequested: true,
    createdAt: "2025-01-21T10:15:00Z",
    lastContact: "2025-01-21T11:00:00Z",
    nextFollowUp: "2025-01-22T09:00:00Z",
    rawXml: `<?xml version="1.0" encoding="UTF-8"?>
<ADF>
  <Prospect>
    <Customer>
      <Name>Sarah Johnson</Name>
      <Email>sarah.j@email.com</Email>
      <Phone>5559876543</Phone>
    </Customer>
    <Vehicle interest="buy" status="new">
      <Year>2024</Year>
      <Make>Toyota</Make>
      <Model>Camry</Model>
      <Trim>SE</Trim>
    </Vehicle>
    <RequestDate>2025-01-22</RequestDate>
    <Comments>Wants to schedule test drive for tomorrow morning</Comments>
  </Prospect>
</ADF>`
  },
  {
    id: 3,
    customerName: "Robert Davis",
    customerEmail: "r.davis@email.com",
    customerPhone: "(555) 456-7890",
    interestedIn: "Used Ford F-150",
    status: "contacted",
    priority: "low",
    source: "CarMax",
    assignedTo: "Lisa Chen",
    leadType: "trade_inquiry",
    vehicleOfInterest: "2022 Ford F-150 XLT",
    appointmentRequested: false,
    createdAt: "2025-01-20T16:45:00Z",
    lastContact: "2025-01-21T08:30:00Z",
    nextFollowUp: "2025-01-23T14:00:00Z",
    rawXml: `<?xml version="1.0" encoding="UTF-8"?>
<ADF>
  <Prospect>
    <Customer>
      <Name>Robert Davis</Name>
      <Email>r.davis@email.com</Email>
      <Phone>5554567890</Phone>
    </Customer>
    <Vehicle interest="buy" status="used">
      <Year>2022</Year>
      <Make>Ford</Make>
      <Model>F-150</Model>
      <Trim>XLT</Trim>
    </Vehicle>
    <TradeIn>
      <Year>2018</Year>
      <Make>Chevrolet</Make>
      <Model>Silverado</Model>
      <Mileage>85000</Mileage>
    </TradeIn>
    <Comments>Has trade-in. Looking for financing under 5% APR</Comments>
  </Prospect>
</ADF>`
  }
];

export default function SalesMobileEnhanced() {
  const [activeTab, setActiveTab] = useState('leads');
  const [viewMode, setViewMode] = useState<'mobile' | 'raw'>('mobile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [selectedLead, setSelectedLead] = useState<MobileLeadCard | null>(null);
  const [showRawXml, setShowRawXml] = useState(false);
  const [showDistributionConfig, setShowDistributionConfig] = useState(false);
  const [showRoleConfig, setShowRoleConfig] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();

  // Simulate XML Lead data query
  const { data: xmlLeads = mockXmlLeads, isLoading: leadsLoading } = useQuery({
    queryKey: ['/api/xml-leads'],
    queryFn: async () => {
      // For demo purposes, return mock data
      // In production, this would fetch from /api/xml-leads
      return mockXmlLeads;
    }
  });

  const filteredLeads = xmlLeads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.interestedIn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'assigned': return <UserCheck className="w-4 h-4" />;
      case 'contacted': return <Phone className="w-4 h-4" />;
      case 'qualified': return <CheckCircle className="w-4 h-4" />;
      case 'lost': return <XCircle className="w-4 h-4" />;
      case 'converted': return <Target className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const parseXmlPreview = (xmlString?: string) => {
    if (!xmlString) return null;
    
    try {
      // Simple XML parsing for preview
      const customerName = xmlString.match(/<Name>(.*?)<\/Name>/)?.[1] || 'N/A';
      const email = xmlString.match(/<Email>(.*?)<\/Email>/)?.[1] || 'N/A';
      const phone = xmlString.match(/<Phone>(.*?)<\/Phone>/)?.[1] || 'N/A';
      const year = xmlString.match(/<Year>(.*?)<\/Year>/)?.[1] || '';
      const make = xmlString.match(/<Make>(.*?)<\/Make>/)?.[1] || '';
      const model = xmlString.match(/<Model>(.*?)<\/Model>/)?.[1] || '';
      const comments = xmlString.match(/<Comments>(.*?)<\/Comments>/)?.[1] || '';
      
      return {
        customerName,
        email,
        phone,
        vehicle: year && make && model ? `${year} ${make} ${model}` : 'N/A',
        comments
      };
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-3 md:p-6">
        {/* Mobile-First Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-4 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Sales & Leads</h1>
              <p className="text-sm text-gray-600">Mobile-optimized lead management with XML processing</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={() => setShowDistributionConfig(true)}
                className="flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Distribution</span>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowRoleConfig(true)}
                className="flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Roles</span>
              </Button>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import XML</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-4 p-4">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, email, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            
            {/* Filters Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-xs md:text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="text-xs md:text-sm">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="text-xs md:text-sm">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="AutoTrader">AutoTrader</SelectItem>
                  <SelectItem value="Cars.com">Cars.com</SelectItem>
                  <SelectItem value="CarMax">CarMax</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setFilterStatus('all');
                  setFilterPriority('all');
                  setFilterSource('all');
                  setSearchTerm('');
                }}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setViewMode('mobile')}
                className="flex items-center gap-1 text-xs"
              >
                <Smartphone className="w-4 h-4" />
                Mobile View
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'raw' ? 'default' : 'ghost'}
                onClick={() => setViewMode('raw')}
                className="flex items-center gap-1 text-xs"
              >
                <Code className="w-4 h-4" />
                Raw XML
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Lead Cards */}
        {viewMode === 'mobile' ? (
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {lead.customerName}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">
                          {lead.customerEmail}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        <Badge 
                          className={cn("text-xs px-2 py-0.5", getStatusColor(lead.status))}
                        >
                          <div className="flex items-center gap-1">
                            {getStatusIcon(lead.status)}
                            {lead.status}
                          </div>
                        </Badge>
                        <Badge 
                          className={cn("text-xs px-2 py-0.5", getPriorityColor(lead.priority))}
                        >
                          {lead.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="bg-gray-50 rounded-md p-2">
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <Car className="w-3 h-3" />
                        <span className="font-medium">{lead.interestedIn}</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Globe className="w-3 h-3" />
                        {lead.source}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3 h-3" />
                        {formatDate(lead.createdAt)}
                      </div>
                      {lead.assignedTo && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <User className="w-3 h-3" />
                          {lead.assignedTo}
                        </div>
                      )}
                      {lead.appointmentRequested && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Calendar className="w-3 h-3" />
                          Appointment
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowRawXml(true);
                        }}
                      >
                        <Code className="w-3 h-3 mr-1" />
                        XML
                      </Button>
                      <Button size="sm" className="flex-1 text-xs">
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredLeads.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No leads found matching your criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Raw XML View */
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Raw XML Data - {lead.customerName}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (lead.rawXml) {
                          navigator.clipboard.writeText(lead.rawXml);
                          toast({ title: 'XML copied to clipboard' });
                        }
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-3 rounded-md text-xs font-mono overflow-x-auto">
                    <pre>{lead.rawXml}</pre>
                  </div>
                  
                  {/* Parsed Preview */}
                  {(() => {
                    const parsed = parseXmlPreview(lead.rawXml);
                    return parsed && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
                        <h4 className="font-medium text-sm text-blue-900 mb-2">Parsed Data Preview</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><strong>Name:</strong> {parsed.customerName}</div>
                          <div><strong>Email:</strong> {parsed.email}</div>
                          <div><strong>Phone:</strong> {parsed.phone}</div>
                          <div><strong>Vehicle:</strong> {parsed.vehicle}</div>
                        </div>
                        {parsed.comments && (
                          <div className="mt-2 text-xs">
                            <strong>Comments:</strong> {parsed.comments}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead && !showRawXml} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details - {selectedLead?.customerName}</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer Name</Label>
                  <p className="text-sm text-gray-700">{selectedLead.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-700">{selectedLead.customerEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm text-gray-700">{selectedLead.customerPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <p className="text-sm text-gray-700">{selectedLead.source}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={cn("text-xs", getStatusColor(selectedLead.status))}>
                    {selectedLead.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={cn("text-xs", getPriorityColor(selectedLead.priority))}>
                    {selectedLead.priority}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Vehicle of Interest</Label>
                <p className="text-sm text-gray-700">{selectedLead.vehicleOfInterest}</p>
              </div>
              
              {selectedLead.assignedTo && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-gray-700">{selectedLead.assignedTo}</p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Customer
                </Button>
                <Button variant="outline" className="flex-1">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Raw XML Modal */}
      <Dialog open={showRawXml} onOpenChange={() => setShowRawXml(false)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Raw XML Data - {selectedLead?.customerName}</DialogTitle>
          </DialogHeader>
          
          {selectedLead?.rawXml && (
            <div className="space-y-4">
              <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
                <pre>{selectedLead.rawXml}</pre>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedLead.rawXml!);
                    toast({ title: 'XML copied to clipboard' });
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy XML
                </Button>
                <Button>
                  <Database className="w-4 h-4 mr-2" />
                  Process Lead
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Distribution Configuration Modal */}
      <LeadDistributionConfig 
        isOpen={showDistributionConfig} 
        onClose={() => setShowDistributionConfig(false)} 
      />

      {/* Role Configuration Modal */}
      <RolePermissionsConfig 
        isOpen={showRoleConfig} 
        onClose={() => setShowRoleConfig(false)} 
      />
    </div>
  );
}
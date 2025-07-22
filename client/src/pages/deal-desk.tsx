import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  Car, 
  User, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Plus,
  Edit,
  Save,
  Search,
  Calendar,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

// Deal status options
const DEAL_STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'finalized', label: 'Finalized', color: 'bg-green-100 text-green-800' },
  { value: 'funded', label: 'Funded', color: 'bg-purple-100 text-purple-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

// Deal types
const DEAL_TYPES = [
  { value: 'retail', label: 'Retail' },
  { value: 'lease', label: 'Lease' },
  { value: 'cash', label: 'Cash' },
];

// Define deal interface to match API response
interface DealData {
  id: string;
  customerId?: number;
  customerName?: string;
  dealNumber?: string;
  status: string;
  dealType?: string;
  salePrice?: number;
  cashDown?: number;
  financeBalance?: number;
  rebates?: number;
  salesTax?: number;
  docFee?: number;
  titleFee?: number;
  registrationFee?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function DealDesk() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDeal, setSelectedDeal] = useState<DealData | null>(null);
  const [newDeal, setNewDeal] = useState({
    id: crypto.randomUUID(),
    dealNumber: `DEAL-${Date.now()}`,
    status: 'open',
    dealType: 'retail',
    customerName: '',
    salePrice: 0,
    cashDown: 0,
    rebates: 0,
    salesTax: 0,
    docFee: 599,
    titleFee: 85,
    registrationFee: 150,
  });
  const [isCreatingDeal, setIsCreatingDeal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all deals
  const { data: deals = [], isLoading: dealsLoading } = useQuery<DealData[]>({
    queryKey: ['/api/deals'],
  });

  // Fetch customers for selection
  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
  });

  // Fetch vehicles for selection
  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      const response = await apiRequest('POST', '/api/deals', dealData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      setIsCreatingDeal(false);
      resetNewDeal();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create deal",
        variant: "destructive",
      });
    },
  });

  // Update deal mutation
  const updateDealMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PUT', `/api/deals/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
    },
  });

  const resetNewDeal = () => {
    setNewDeal({
      dealNumber: `DEAL-${Date.now()}`,
      status: 'open',
      dealType: 'retail',
      customerName: '',
      salePrice: 0,
      cashDown: 0,
      rebates: 0,
      salesTax: 0,
      docFee: 599,
      titleFee: 85,
      registrationFee: 150,
    });
  };

  const handleCreateDeal = () => {
    if (!newDeal.customerName) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive",
      });
      return;
    }

    createDealMutation.mutate({
      ...newDeal,
      id: newDeal.dealNumber,
      financeBalance: newDeal.salePrice - newDeal.cashDown,
    });
  };

  const filteredDeals = deals.filter((deal: DealData) => 
    (deal.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deal.dealNumber || deal.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = DEAL_STATUSES.find(s => s.value === status);
    return statusConfig ? statusConfig : DEAL_STATUSES[0];
  };

  if (dealsLoading) {
    return (
      <div className="p-3 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Deal Desk</h1>
            <p className="text-sm md:text-base text-gray-600">Comprehensive deal management workspace</p>
          </div>
          <Button 
            onClick={() => setIsCreatingDeal(true)}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search deals by customer name or deal number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="finalized">Finalized</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Deals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{deals.length}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Open Deals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {deals.filter((d: DealData) => d.status === 'open').length}
                </div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Finalized</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  {deals.filter((d: DealData) => d.status === 'finalized').length}
                </div>
                <p className="text-xs text-muted-foreground">Ready</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">
                  ${deals.reduce((sum: number, d: DealData) => sum + (d.salePrice || 0), 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All deals</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Recent Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {filteredDeals.slice(0, 5).map((deal: DealData) => {
                  const statusBadge = getStatusBadge(deal.status);
                  return (
                    <div key={deal.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-gray-50 cursor-pointer gap-3 sm:gap-0"
                         onClick={() => setSelectedDeal(deal)}>
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm md:text-base font-medium">{deal.customerName}</p>
                          <p className="text-xs md:text-sm text-gray-500">Deal #{deal.dealNumber || deal.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-3 md:space-x-4">
                        <div className="text-right">
                          <p className="text-sm md:text-base font-medium">${(deal.salePrice || 0).toLocaleString()}</p>
                          <p className="text-xs md:text-sm text-gray-500">{deal.dealType}</p>
                        </div>
                        <Badge className={`${statusBadge.color} text-xs`}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {filteredDeals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No deals found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Deals Tab */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Active Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {filteredDeals.filter((d: DealData) => d.status === 'open').map((deal: DealData) => (
                  <div key={deal.id} className="p-3 md:p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                      <div>
                        <h3 className="text-sm md:text-base font-medium">{deal.customerName}</h3>
                        <p className="text-xs md:text-sm text-gray-500">Deal #{deal.dealNumber || deal.id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Open</Badge>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                      <div>
                        <span className="text-gray-500">Sale Price:</span>
                        <span className="ml-2 font-medium">${(deal.salePrice || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Down Payment:</span>
                        <span className="ml-2 font-medium">${(deal.cashDown || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Finance:</span>
                        <span className="ml-2 font-medium">${(deal.financeBalance || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDeals.filter((d: DealData) => d.status === 'open').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No active deals found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finalized Deals Tab */}
        <TabsContent value="finalized">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Finalized Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {filteredDeals.filter((d: DealData) => d.status === 'finalized').map((deal: DealData) => (
                  <div key={deal.id} className="p-3 md:p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                      <div>
                        <h3 className="text-sm md:text-base font-medium">{deal.customerName}</h3>
                        <p className="text-xs md:text-sm text-gray-500">Deal #{deal.dealNumber || deal.id}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs self-start sm:self-center">Finalized</Badge>
                    </div>
                  </div>
                ))}
                {filteredDeals.filter((d: DealData) => d.status === 'finalized').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No finalized deals found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Deal Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DEAL_STATUSES.map((status) => {
                    const count = deals.filter((d: DealData) => d.status === status.value).length;
                    const percentage = deals.length > 0 ? (count / deals.length) * 100 : 0;
                    return (
                      <div key={status.value} className="flex justify-between items-center">
                        <span className="text-xs md:text-sm">{status.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 md:w-24 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs md:text-sm text-gray-500 w-6 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Average Deal Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">
                  ${deals.length > 0 ? Math.round(deals.reduce((sum: number, d: DealData) => sum + (d.salePrice || 0), 0) / deals.length).toLocaleString() : 0}
                </div>
                <p className="text-xs md:text-sm text-gray-500 mt-2">Based on {deals.length} deals</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Deal Dialog */}
      <Dialog open={isCreatingDeal} onOpenChange={setIsCreatingDeal}>
        <DialogContent className="max-w-xs sm:max-w-2xl mx-4">
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Deal Number</Label>
                <Input
                  value={newDeal.dealNumber}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, dealNumber: e.target.value }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Deal Type</Label>
                <Select value={newDeal.dealType} onValueChange={(value) => setNewDeal(prev => ({ ...prev, dealType: value }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm">Customer Name</Label>
              <Input
                value={newDeal.customerName}
                onChange={(e) => setNewDeal(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer's name"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Sale Price</Label>
                <Input
                  type="number"
                  value={newDeal.salePrice}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, salePrice: parseInt(e.target.value) || 0 }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Cash Down</Label>
                <Input
                  type="number"
                  value={newDeal.cashDown}
                  onChange={(e) => setNewDeal(prev => ({ ...prev, cashDown: parseInt(e.target.value) || 0 }))}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" onClick={() => setIsCreatingDeal(false)} className="text-sm">
                Cancel
              </Button>
              <Button 
                onClick={handleCreateDeal}
                disabled={createDealMutation.isPending}
                className="text-sm"
              >
                {createDealMutation.isPending ? 'Creating...' : 'Create Deal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
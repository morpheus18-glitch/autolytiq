import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  DollarSign, 
  Calendar, 
  User, 
  Car,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Calculator,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Building,
  Phone,
  Mail
} from "lucide-react";

// Deal status configurations
const DEAL_STATUSES = [
  { value: 'structuring', label: 'Deal Structuring', color: 'bg-yellow-100 text-yellow-800', icon: Calculator },
  { value: 'financing', label: 'Financing', color: 'bg-blue-100 text-blue-800', icon: CreditCard },
  { value: 'contracting', label: 'Contracting', color: 'bg-purple-100 text-purple-800', icon: FileText },
  { value: 'funded', label: 'Funded', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
];

interface Deal {
  id: string;
  dealNumber: string;
  status: string;
  buyerName: string;
  salePrice: number;
  createdAt: string;
  vehicleId?: string;
  customerId?: string;
  dealType: string;
  cashDown?: number;
  financeBalance?: number;
}

export default function DealsUnified() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showNewDealDialog, setShowNewDealDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Quick deal creation state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [dealType, setDealType] = useState('retail');
  const [salePrice, setSalePrice] = useState('');
  const [cashDown, setCashDown] = useState('');

  // Fetch all deals
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
    staleTime: 30000,
  });

  // Fetch customers for new deal creation
  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
  });

  // Fetch vehicles for new deal creation
  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  // Create new deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      const response = await apiRequest('POST', '/api/deals', dealData);
      return response.json();
    },
    onSuccess: (deal) => {
      toast({
        title: "Deal Created Successfully",
        description: `Deal ${deal.dealNumber} has been created and is ready for structuring.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      setShowNewDealDialog(false);
      resetForm();
      
      // Switch to active tab to see the new deal
      setActiveTab('active');
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Deal",
        description: error.message || "There was an error creating the deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update deal status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/deals/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Deal status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal status",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedCustomerId('');
    setSelectedVehicleId('');
    setDealType('retail');
    setSalePrice('');
    setCashDown('');
  };

  const selectedCustomer = customers.find((c: any) => c.id.toString() === selectedCustomerId);
  const selectedVehicle = vehicles.find((v: any) => v.id.toString() === selectedVehicleId);

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId || !selectedVehicleId) {
      toast({
        title: "Missing Information",
        description: "Please select both a customer and a vehicle to create a deal.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCustomer || !selectedVehicle) {
      toast({
        title: "Invalid Selection",
        description: "Selected customer or vehicle not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const dealData = {
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      buyerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      dealType: dealType,
      salePrice: salePrice ? parseInt(salePrice) : selectedVehicle.price || 0,
      cashDown: cashDown ? parseInt(cashDown) : 0,
      status: 'structuring',
    };

    createDealMutation.mutate(dealData);
  };

  // Filter deals based on search and status
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.dealNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group deals by status for tabs
  const dealsByStatus = {
    active: filteredDeals.filter(deal => ['structuring', 'financing', 'contracting'].includes(deal.status)),
    funded: filteredDeals.filter(deal => deal.status === 'funded'),
    cancelled: filteredDeals.filter(deal => deal.status === 'cancelled'),
  };

  const getStatusConfig = (status: string) => {
    return DEAL_STATUSES.find(s => s.value === status) || DEAL_STATUSES[0];
  };

  const handleStatusChange = (dealId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: dealId, status: newStatus });
  };

  if (isLoading) {
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
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Deal Management</h1>
            <p className="text-sm md:text-base text-gray-600">Create and manage all dealership transactions</p>
          </div>
          <Dialog open={showNewDealDialog} onOpenChange={setShowNewDealDialog}>
            <DialogTrigger asChild>
              <Button className="btn-aiq-primary w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDeal} className="space-y-6">
                {/* Customer Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Customer
                  </Label>
                  <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName} ({customer.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Vehicle
                  </Label>
                  <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price?.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Deal Type */}
                <div className="space-y-2">
                  <Label>Deal Type</Label>
                  <Select value={dealType} onValueChange={setDealType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="lease">Lease</SelectItem>
                      <SelectItem value="cash">Cash Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sale Price */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Sale Price
                  </Label>
                  <Input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder={selectedVehicle?.price?.toString() || "Enter sale price"}
                  />
                </div>

                {/* Cash Down */}
                <div className="space-y-2">
                  <Label>Cash Down Payment</Label>
                  <Input
                    type="number"
                    value={cashDown}
                    onChange={(e) => setCashDown(e.target.value)}
                    placeholder="0"
                  />
                </div>

                {/* Summary */}
                {(selectedCustomer || selectedVehicle) && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <h4 className="font-medium text-blue-900">Deal Summary</h4>
                    {selectedCustomer && (
                      <p className="text-sm text-blue-700">
                        Customer: {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </p>
                    )}
                    {selectedVehicle && (
                      <p className="text-sm text-blue-700">
                        Vehicle: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                      </p>
                    )}
                    {salePrice && (
                      <p className="text-sm text-blue-700">
                        Sale Price: ${parseInt(salePrice).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full btn-aiq-primary"
                  disabled={createDealMutation.isPending || !selectedCustomerId || !selectedVehicleId}
                >
                  {createDealMutation.isPending ? "Creating Deal..." : "Create Deal & Start Structuring"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search deals by customer name or deal number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {DEAL_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs for Deal States */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active Deals ({dealsByStatus.active.length})
          </TabsTrigger>
          <TabsTrigger value="funded">
            Funded ({dealsByStatus.funded.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({dealsByStatus.cancelled.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Deals Tab */}
        <TabsContent value="active">
          <div className="space-y-4">
            {dealsByStatus.active.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Deals</h3>
                  <p className="text-gray-600 mb-4">Create your first deal to get started</p>
                  <Button onClick={() => setShowNewDealDialog(true)} className="btn-aiq-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Deal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              dealsByStatus.active.map((deal) => {
                const statusConfig = getStatusConfig(deal.status);
                return (
                  <Card key={deal.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <h3 className="text-lg font-semibold">{deal.buyerName}</h3>
                            </div>
                            <Badge className={`${statusConfig.color} text-xs`}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Deal #:</span> {deal.dealNumber}
                            </div>
                            <div>
                              <span className="font-medium">Sale Price:</span> ${deal.salePrice?.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Type:</span> {deal.dealType}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span> {new Date(deal.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Select 
                            value={deal.status} 
                            onValueChange={(status) => handleStatusChange(deal.id, status)}
                          >
                            <SelectTrigger className="w-full sm:w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DEAL_STATUSES.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Funded Deals Tab */}
        <TabsContent value="funded">
          <div className="space-y-4">
            {dealsByStatus.funded.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{deal.buyerName}</h3>
                      <p className="text-gray-600">Deal #{deal.dealNumber} • ${deal.salePrice?.toLocaleString()}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Funded
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Cancelled Deals Tab */}
        <TabsContent value="cancelled">
          <div className="space-y-4">
            {dealsByStatus.cancelled.map((deal) => (
              <Card key={deal.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{deal.buyerName}</h3>
                      <p className="text-gray-600">Deal #{deal.dealNumber} • ${deal.salePrice?.toLocaleString()}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      Cancelled
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
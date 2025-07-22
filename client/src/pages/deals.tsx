import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  TrendingUp
} from "lucide-react";

// Deal status configurations
const DEAL_STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800', icon: Clock },
  { value: 'finalized', label: 'Finalized', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'funded', label: 'Funded', color: 'bg-purple-100 text-purple-800', icon: DollarSign },
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

export default function Deals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showNewDealDialog, setShowNewDealDialog] = useState(false);

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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New deal created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      setShowNewDealDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create deal",
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
        title: "Success",
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

  // Filter deals based on search and status
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.dealNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group deals by status for tabs
  const dealsByStatus = {
    open: filteredDeals.filter(deal => deal.status === 'open'),
    finalized: filteredDeals.filter(deal => deal.status === 'finalized'),
    funded: filteredDeals.filter(deal => deal.status === 'funded'),
    cancelled: filteredDeals.filter(deal => deal.status === 'cancelled'),
  };

  const getStatusConfig = (status: string) => {
    return DEAL_STATUSES.find(s => s.value === status) || DEAL_STATUSES[0];
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const dealData = {
      id: crypto.randomUUID(),
      dealNumber: `DEAL-${Date.now()}`,
      buyerName: formData.get('buyerName') as string,
      customerId: formData.get('customerId') as string,
      vehicleId: formData.get('vehicleId') as string,
      dealType: formData.get('dealType') as string,
      salePrice: parseInt(formData.get('salePrice') as string) || 0,
      cashDown: parseInt(formData.get('cashDown') as string) || 0,
      status: 'open',
    };

    createDealMutation.mutate(dealData);
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Deals Management</h1>
            <p className="text-sm md:text-base text-gray-600">Track and manage all dealership transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/deal-desk">
              <Button variant="outline" className="btn-aiq-secondary">
                <Calculator className="w-4 h-4 mr-2" />
                Deal Desk
              </Button>
            </Link>
            <Dialog open={showNewDealDialog} onOpenChange={setShowNewDealDialog}>
              <DialogTrigger asChild>
                <Button className="btn-aiq-primary w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Deal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Deal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDeal} className="space-y-4">
                  <div>
                    <Label htmlFor="buyerName">Buyer Name *</Label>
                    <Input
                      id="buyerName"
                      name="buyerName"
                      required
                      placeholder="Enter buyer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerId">Customer</Label>
                    <Select name="customerId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {(customers as any[]).map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.firstName} {customer.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vehicleId">Vehicle</Label>
                    <Select name="vehicleId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {(vehicles as any[]).map((vehicle: any) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dealType">Deal Type</Label>
                    <Select name="dealType" defaultValue="retail">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="lease">Lease</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price</Label>
                    <Input
                      id="salePrice"
                      name="salePrice"
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cashDown">Cash Down</Label>
                    <Input
                      id="cashDown"
                      name="cashDown"
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-aiq-primary"
                    disabled={createDealMutation.isPending}
                  >
                    {createDealMutation.isPending ? 'Creating...' : 'Create Deal'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search deals by buyer name or deal number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {DEAL_STATUSES.map(status => {
          const count = dealsByStatus[status.value as keyof typeof dealsByStatus]?.length || 0;
          const StatusIcon = status.icon;
          return (
            <Card key={status.value}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{status.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <StatusIcon className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deals Tabs */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {DEAL_STATUSES.map(status => (
            <TabsTrigger key={status.value} value={status.value}>
              {status.label} ({dealsByStatus[status.value as keyof typeof dealsByStatus]?.length || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        {DEAL_STATUSES.map(status => (
          <TabsContent key={status.value} value={status.value}>
            <div className="grid gap-4">
              {dealsByStatus[status.value as keyof typeof dealsByStatus]?.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No {status.label.toLowerCase()} deals found</p>
                  </CardContent>
                </Card>
              ) : (
                dealsByStatus[status.value as keyof typeof dealsByStatus]?.map(deal => {
                  const statusConfig = getStatusConfig(deal.status);
                  return (
                    <Card key={deal.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center">
                              <User className="w-5 h-5 mr-2" />
                              {deal.buyerName}
                            </CardTitle>
                            <p className="text-sm text-gray-600">Deal #{deal.dealNumber}</p>
                          </div>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Sale Price</p>
                            <p className="font-semibold">${deal.salePrice?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Deal Type</p>
                            <p className="font-semibold capitalize">{deal.dealType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Created</p>
                            <p className="font-semibold">
                              {new Date(deal.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Finance Balance</p>
                            <p className="font-semibold">${deal.financeBalance?.toLocaleString() || 0}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Select
                              value={deal.status}
                              onValueChange={(newStatus) => handleStatusChange(deal.id, newStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DEAL_STATUSES.map(s => (
                                  <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Link href={`/deal-desk?id=${deal.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedDeal(deal)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
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
        ))}
      </Tabs>

      {/* Deal Details Modal */}
      {selectedDeal && (
        <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deal Details - {selectedDeal.dealNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Buyer Name</Label>
                  <p className="font-semibold">{selectedDeal.buyerName}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusConfig(selectedDeal.status).color}>
                    {getStatusConfig(selectedDeal.status).label}
                  </Badge>
                </div>
                <div>
                  <Label>Deal Type</Label>
                  <p className="font-semibold capitalize">{selectedDeal.dealType}</p>
                </div>
                <div>
                  <Label>Sale Price</Label>
                  <p className="font-semibold">${selectedDeal.salePrice?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <Label>Cash Down</Label>
                  <p className="font-semibold">${selectedDeal.cashDown?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <Label>Finance Balance</Label>
                  <p className="font-semibold">${selectedDeal.financeBalance?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedDeal(null)}>
                  Close
                </Button>
                <Link href={`/deal-desk?id=${selectedDeal.id}`}>
                  <Button className="btn-aiq-primary">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Deal
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
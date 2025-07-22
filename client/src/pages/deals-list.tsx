import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Search, 
  Calculator, 
  FileSignature, 
  Archive,
  Eye,
  Plus,
  DollarSign,
  Calendar,
  User,
  Car,
  Handshake,
  ClipboardList
} from "lucide-react";

interface Deal {
  id: string;
  dealNumber: string;
  customerName: string;
  customerPhone?: string;
  vehicleDescription: string;
  salePrice: number;
  status: 'structuring' | 'pending_contract' | 'completed' | 'cancelled';
  createdAt: string;
  salesPerson?: string;
  financeAmount?: number;
  monthlyPayment?: number;
}

const DEAL_STATUSES = [
  { value: 'structuring', label: 'Structuring', color: 'bg-blue-100 text-blue-800', icon: Calculator },
  { value: 'pending_contract', label: 'Pending Contract', color: 'bg-yellow-100 text-yellow-800', icon: ClipboardList },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: Archive },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Archive },
];

export default function DealsList() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch deals
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
    staleTime: 30000,
  });

  // Filter and sort deals
  const filteredDeals = deals
    .filter(deal => {
      const matchesSearch = 
        deal.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.dealNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.vehicleDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price_high':
          return b.salePrice - a.salePrice;
        case 'price_low':
          return a.salePrice - b.salePrice;
        case 'customer':
          return a.customerName.localeCompare(b.customerName);
        default:
          return 0;
      }
    });

  const getStatusConfig = (status: string) => {
    return DEAL_STATUSES.find(s => s.value === status) || DEAL_STATUSES[0];
  };

  const handleDeskDeal = (deal: Deal) => {
    // Navigate to desking tool with deal info
    navigate(`/deals/desk?dealId=${deal.id}&customerId=${deal.customerName}&vehicleId=${deal.vehicleDescription}`);
  };

  const handleFinanceDeal = (deal: Deal) => {
    // Navigate to finance suite
    navigate(`/deals/finance?dealId=${deal.id}`);
  };

  const handleViewDeal = (deal: Deal) => {
    navigate(`/deals/${deal.id}`);
  };

  // Summary stats
  const stats = {
    total: deals.length,
    structuring: deals.filter(d => d.status === 'structuring').length,
    pending: deals.filter(d => d.status === 'pending_contract').length,
    completed: deals.filter(d => d.status === 'completed').length,
    totalValue: deals.reduce((sum, d) => sum + d.salePrice, 0),
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Deal Management</h1>
          <p className="text-gray-600">Track and manage all dealership transactions</p>
        </div>
        <Button onClick={() => navigate('/customers')} className="btn-aiq-primary">
          <Plus className="w-4 h-4 mr-2" />
          Start New Deal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Handshake className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Structuring</p>
                <p className="text-2xl font-bold">{stats.structuring}</p>
              </div>
              <Calculator className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <Archive className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-xl font-bold">${(stats.totalValue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer name, deal number, or vehicle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="price_high">Price (High to Low)</SelectItem>
                <SelectItem value="price_low">Price (Low to High)</SelectItem>
                <SelectItem value="customer">Customer Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deals List */}
      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Deals Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No deals match your current filters' 
                  : 'Start your first deal by adding a customer and vehicle'
                }
              </p>
              <Button onClick={() => navigate('/customers')} className="btn-aiq-primary">
                <Plus className="w-4 h-4 mr-2" />
                Start New Deal
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredDeals.map((deal) => {
            const statusConfig = getStatusConfig(deal.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card key={deal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    {/* Deal Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-lg font-semibold">{deal.customerName}</h3>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Deal #:</span> {deal.dealNumber}
                        </div>
                        <div>
                          <span className="font-medium">Vehicle:</span> {deal.vehicleDescription}
                        </div>
                        <div>
                          <span className="font-medium">Sale Price:</span> ${deal.salePrice.toLocaleString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Sales Person:</span> {deal.salesPerson || 'Unassigned'}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(deal.createdAt).toLocaleDateString()}
                        </div>
                        {deal.monthlyPayment && (
                          <div>
                            <span className="font-medium">Payment:</span> ${deal.monthlyPayment.toLocaleString()}/mo
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {deal.status === 'structuring' && (
                        <Button 
                          onClick={() => handleDeskDeal(deal)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Calculator className="w-4 h-4 mr-2" />
                          Desk Deal
                        </Button>
                      )}
                      
                      {deal.status === 'pending_contract' && (
                        <Button 
                          onClick={() => handleFinanceDeal(deal)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <FileSignature className="w-4 h-4 mr-2" />
                          Finance
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        onClick={() => handleViewDeal(deal)}
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
    </div>
  );
}
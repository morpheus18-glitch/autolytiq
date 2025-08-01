import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { 
  Search, 
  Calculator, 
  FileSignature, 
  Plus,
  DollarSign,
  Calendar,
  User,
  Car,
  Eye,
  ChevronRight
} from "lucide-react";

interface Deal {
  id: string;
  dealNumber: string;
  status: string;
  vehicleId: string;
  vin: string;
  msrp: number;
  salePrice: number;
  customerId: string;
  buyerName: string;
  coBuyerName?: string;
  tradeVin?: string;
  tradeYear?: number;
  tradeMake?: string;
  tradeModel?: string;
  tradeAllowance?: number;
  dealType: string;
  cashDown: number;
  financeBalance: number;
  creditStatus: string;
  creditTier: string;
  term: number;
  rate: string;
  createdAt: string;
  updatedAt: string;
  salesPersonId: string;
  financeManagerId: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'structuring':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Structuring</Badge>;
    case 'credit_pending':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Credit Pending</Badge>;
    case 'funded':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Funded</Badge>;
    case 'delivered':
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Delivered</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
  }
};

export default function DealsList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch deals
  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
    staleTime: 30000,
  });

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.dealNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.tradeMake && deal.tradeModel && 
       `${deal.tradeMake} ${deal.tradeModel}`.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewDeal = () => {
    navigate('/showroom-manager');
  };

  const handleViewDeal = (dealId: string) => {
    navigate(`/showroom-manager?dealId=${dealId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deal Management</h1>
            <p className="text-gray-600">Manage all customer deals and transactions</p>
          </div>
          <Button 
            onClick={handleNewDeal}
            className="bg-blue-600 hover:bg-blue-700 text-white mt-4 sm:mt-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by deal number, customer, or VIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="structuring">Structuring</SelectItem>
                  <SelectItem value="credit_pending">Credit Pending</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deals Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calculator className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileSignature className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Structuring</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deals.filter(d => d.status === 'structuring').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Funded</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deals.filter(d => d.status === 'funded').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deals.filter(d => new Date(d.createdAt).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Deals</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDeals.length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Get started by creating your first deal'
                  }
                </p>
                <Button onClick={handleNewDeal} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Deal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewDeal(deal.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center text-gray-900">
                              <span className="font-bold text-blue-600 mr-3">{deal.dealNumber}</span>
                              <User className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="font-semibold">{deal.buyerName}</span>
                              {deal.coBuyerName && (
                                <span className="text-gray-500 ml-2">& {deal.coBuyerName}</span>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(deal.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Car className="w-4 h-4 mr-2" />
                            <span>VIN: {deal.vin?.slice(-8) || 'N/A'}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>MSRP: ${deal.msrp?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                            <span>Sale: ${deal.salePrice?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(deal.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {/* Trade Information */}
                        {deal.tradeVin && (
                          <div className="flex items-center text-sm text-orange-600 mb-2">
                            <Car className="w-4 h-4 mr-2" />
                            <span>Trade: {deal.tradeYear} {deal.tradeMake} {deal.tradeModel} - ${deal.tradeAllowance?.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {/* Financial Summary */}
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium">Finance: ${deal.financeBalance?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">{deal.term}mo @ {deal.rate}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Tier {deal.creditTier}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDeal(deal.id);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Search, 
  Filter,
  DollarSign,
  FileText,
  Calendar,
  User,
  Eye,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Target,
  BarChart3,
  Calculator,
  Edit,
  Printer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Deal } from '@shared/schema';

export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
  });

  const createDealMutation = useMutation({
    mutationFn: async (dealData: any) => {
      const response = await apiRequest('POST', '/api/deals', dealData);
      return response.json();
    },
    onSuccess: (newDeal) => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      toast({
        title: 'Deal Created',
        description: `Deal #${newDeal.dealNumber} has been created successfully.`,
      });
      setLocation(`/deals/${newDeal.id}`);
    },
    onError: () => {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create new deal.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateDeal = () => {
    createDealMutation.mutate({
      buyerName: 'New Customer',
      dealType: 'finance',
      salePrice: 0,
      status: 'open',
    });
  };

  // Handle pending deal from showroom sessions
  useEffect(() => {
    const pendingDeal = localStorage.getItem('pendingDeal');
    if (pendingDeal) {
      try {
        const dealData = JSON.parse(pendingDeal);
        localStorage.removeItem('pendingDeal');
        
        // Fetch customer name for the deal
        const customerName = `Customer #${dealData.customerId}`;
        
        // Create deal from showroom session data
        createDealMutation.mutate({
          buyerName: customerName,
          dealNumber: dealData.dealNumber,
          dealType: 'finance',
          salePrice: dealData.salePrice || 0,
          status: 'open',
          customerId: dealData.customerId,
          vehicleId: dealData.vehicleId,
          stockNumber: dealData.stockNumber,
          salespersonId: dealData.salespersonId,
          leadSource: dealData.leadSource,
          notes: dealData.notes,
          sessionId: dealData.sessionId,
        });
        
        toast({
          title: 'Deal Created from Showroom',
          description: `Deal ${dealData.dealNumber} has been created from showroom session.`,
        });
      } catch (error) {
        console.error('Error processing pending deal:', error);
        localStorage.removeItem('pendingDeal');
        toast({
          title: 'Error',
          description: 'Failed to create deal from showroom session.',
          variant: 'destructive',
        });
      }
    }
  }, [createDealMutation, toast]);

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.dealNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'open' && deal.status === 'open') ||
                      (activeTab === 'pending' && deal.status === 'pending') ||
                      (activeTab === 'approved' && deal.status === 'approved') ||
                      (activeTab === 'finalized' && deal.status === 'finalized');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'finalized': return 'bg-purple-100 text-purple-800';
      case 'funded': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const dealStats = {
    total: deals.length,
    open: deals.filter(d => d.status === 'open').length,
    pending: deals.filter(d => d.status === 'pending').length,
    approved: deals.filter(d => d.status === 'approved').length,
    finalized: deals.filter(d => d.status === 'finalized').length,
    totalValue: deals.reduce((sum, deal) => sum + (deal.salePrice || 0), 0),
    avgDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + (deal.salePrice || 0), 0) / deals.length : 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Deal Desk</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all vehicle deals and transactions</p>
          </div>
          <Button 
            onClick={handleCreateDeal}
            disabled={createDealMutation.isPending}
            className="btn-aiq-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Deal
          </Button>
        </div>

        {/* Deal Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dealStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold">{dealStats.open}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{dealStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Finalized</p>
                <p className="text-2xl font-bold">{dealStats.finalized}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg font-bold">{formatCurrency(dealStats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Target className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Deal</p>
                <p className="text-lg font-bold">{formatCurrency(dealStats.avgDealSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by buyer name, deal number, or VIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="finalized">Finalized</SelectItem>
                <SelectItem value="funded">Funded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deal Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All ({dealStats.total})
          </TabsTrigger>
          <TabsTrigger value="open" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Open ({dealStats.open})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending ({dealStats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({dealStats.approved})
          </TabsTrigger>
          <TabsTrigger value="finalized" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Finalized ({dealStats.finalized})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Deals Table */}
          <Card>
            <CardContent className="p-0">
              {filteredDeals.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No deals found</p>
                  <p className="text-gray-500 mt-2">
                    {deals.length === 0 ? 'Create your first deal to get started' : 'Try adjusting your search filters'}
                  </p>
                  {deals.length === 0 && (
                    <Button 
                      onClick={handleCreateDeal}
                      className="mt-4"
                      disabled={createDealMutation.isPending}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Deal
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">Deal #</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">Customer</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">Vehicle</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">Sale Price</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">Finance</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">Created</th>
                        <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeals.map((deal) => (
                        <tr key={deal.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <div className="font-medium text-blue-600">
                              {deal.dealNumber}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium">{deal.buyerName}</div>
                            {deal.coBuyerName && (
                              <div className="text-sm text-gray-500">+ {deal.coBuyerName}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              {deal.vin ? (
                                <span className="font-mono">{deal.vin}</span>
                              ) : (
                                <span className="text-gray-400">No VIN</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium">
                              {formatCurrency(deal.salePrice)}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm">
                              {deal.financeBalance && deal.financeBalance > 0 ? (
                                <>
                                  <div className="font-medium">{formatCurrency(deal.financeBalance)}</div>
                                  <div className="text-gray-500">{deal.rate} • {deal.term}mo</div>
                                </>
                              ) : (
                                <span className="text-gray-400">Cash</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={getStatusColor(deal.status)}>
                              {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-600">
                              {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : '-'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Link href={`/deals/${deal.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/deals/${deal.id}?tab=finance`}>
                                <Button variant="outline" size="sm">
                                  <Calculator className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/deals/${deal.id}?tab=print`}>
                                <Button variant="outline" size="sm">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
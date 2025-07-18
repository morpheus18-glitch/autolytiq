import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  DollarSign, 
  Calculator, 
  Printer, 
  Book,
  Edit,
  Check,
  X
} from 'lucide-react';
import DealStructureTab from './structure';
import DealFinanceTab from './finance';
import DealPrintTab from './print';
import DealAccountingTab from './accounting';
import DealHistoryTab from './history';
import type { Deal } from '@shared/schema';

export default function DealDetailPage() {
  const [match, params] = useRoute('/deals/:id');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('structure');

  const { data: deal, isLoading } = useQuery<Deal>({
    queryKey: ['/api/deals', params?.id],
    enabled: !!params?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest('PATCH', `/api/deals/${params?.id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals', params?.id] });
      toast({
        title: 'Deal Status Updated',
        description: 'The deal status has been successfully updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update deal status.',
        variant: 'destructive',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'finalized': return 'bg-green-100 text-green-800';
      case 'funded': return 'bg-purple-100 text-purple-800';
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Deal not found</h3>
          <p className="text-gray-500">The requested deal could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deal #{deal.dealNumber}</h1>
          <p className="text-gray-600 mt-1">{deal.buyerName} - {deal.vin}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(deal.status)}>
            {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
          </Badge>
          {deal.status === 'open' && (
            <Button 
              onClick={() => updateStatusMutation.mutate('finalized')}
              disabled={updateStatusMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Finalize Deal
            </Button>
          )}
          {deal.status === 'finalized' && (
            <Button 
              onClick={() => updateStatusMutation.mutate('funded')}
              disabled={updateStatusMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Mark Funded
            </Button>
          )}
          {(deal.status === 'open' || deal.status === 'finalized') && (
            <Button 
              variant="destructive"
              onClick={() => updateStatusMutation.mutate('cancelled')}
              disabled={updateStatusMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Deal
            </Button>
          )}
        </div>
      </div>

      {/* Deal Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sale Price</p>
                <p className="text-2xl font-bold">{formatCurrency(deal.salePrice)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Finance Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(deal.financeBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Deal Type</p>
                <p className="text-2xl font-bold capitalize">{deal.dealType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Book className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Credit Tier</p>
                <p className="text-2xl font-bold">{deal.creditTier || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6">
              <TabsList className="grid w-full grid-cols-5 bg-transparent">
                <TabsTrigger value="structure" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Structure
                </TabsTrigger>
                <TabsTrigger value="finance" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Finance
                </TabsTrigger>
                <TabsTrigger value="print" className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print Forms
                </TabsTrigger>
                <TabsTrigger value="accounting" className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  Accounting
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="structure" className="mt-0">
                <DealStructureTab deal={deal} />
              </TabsContent>
              
              <TabsContent value="finance" className="mt-0">
                <DealFinanceTab deal={deal} />
              </TabsContent>
              
              <TabsContent value="print" className="mt-0">
                <DealPrintTab deal={deal} />
              </TabsContent>
              
              <TabsContent value="accounting" className="mt-0">
                <DealAccountingTab deal={deal} />
              </TabsContent>
              
              <TabsContent value="history" className="mt-0">
                <DealHistoryTab deal={deal} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
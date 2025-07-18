import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { apiRequest } from '@/lib/queryClient';
import EnhancedCustomerSearch from '@/components/enhanced-customer-search';
import CustomerModal from '@/components/customer-modal';
import CustomerDetailModal from '@/components/customer-detail-modal';
import { 
  SlidersHorizontal, 
  List, 
  Users, 
  BarChart3, 
  Download, 
  Upload,
  UserPlus
} from 'lucide-react';
import type { Customer } from '@shared/schema';

export default function Customers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'enhanced' | 'basic'>('enhanced');

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({ title: 'Customer deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete customer', variant: 'destructive' });
    },
  });

  const handleEdit = (customer: Customer) => {
    trackInteraction('customer_edit', `customer-${customer.id}`, customer.id);
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    trackInteraction('customer_add', 'add-customer-button');
    setSelectedCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleView = (customer: Customer) => {
    trackInteraction('customer_view', `customer-${customer.id}`, customer.id);
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      trackInteraction('customer_delete', `customer-${id}`, id);
      deleteCustomerMutation.mutate(id);
    }
  };

  const handleExport = () => {
    trackInteraction('customer_export', 'export-button');
    toast({ title: 'Export started', description: 'Your customer data is being exported...' });
  };

  const handleImport = () => {
    trackInteraction('customer_import', 'import-button');
    toast({ title: 'Import ready', description: 'Select a file to import customer data...' });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AutolytiQ - Customer Management</h1>
          <p className="text-gray-600">Advanced CRM with comprehensive customer analytics</p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleAdd} className="bg-primary hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'enhanced' | 'basic')}>
          <TabsList>
            <TabsTrigger value="enhanced" className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Enhanced Search
            </TabsTrigger>
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Basic View
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Users className="w-4 h-4 mr-1" />
            CRM Analytics
          </Badge>
          <Badge variant="outline">
            <BarChart3 className="w-4 h-4 mr-1" />
            Sales Insights
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {viewMode === 'enhanced' ? (
          <EnhancedCustomerSearch
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onAdd={handleAdd}
            showAddButton={true}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Basic Customer View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>Switch to Enhanced Search for advanced customer analytics and filtering</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setViewMode('enhanced')}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Try Enhanced Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Customer Modal */}
      {isAddModalOpen && (
        <CustomerModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          customer={null}
        />
      )}
      
      {isEditModalOpen && (
        <CustomerModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          customer={selectedCustomer}
        />
      )}

      {/* Customer Detail Modal */}
      {isDetailModalOpen && selectedCustomer && (
        <CustomerDetailModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          customer={selectedCustomer}
        />
      )}
    </div>
  );
}
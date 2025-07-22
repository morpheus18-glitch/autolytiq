import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { trackInteraction } from '@/lib/pixel-tracker';
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
  usePixelTracker(); // Initialize pixel tracking
  const [, navigate] = useLocation();
  
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

  const { trackInteraction } = usePixelTracker();

  const handleEdit = (customer: Customer) => {
    trackInteraction('customer_edit', 'edit-button', customer.id);
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleAdd = () => {
    trackInteraction('customer_add', 'add-customer-button');
    setSelectedCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleView = (customer: Customer) => {
    trackInteraction('customer_view', 'view-button', customer.id);
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      trackInteraction('customer_delete', 'delete-button', id);
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

  const [isStartingSession, setIsStartingSession] = useState(false);

  const handleStartShowroomSession = async (customer: Customer) => {
    if (isStartingSession) return; // Prevent multiple clicks
    
    setIsStartingSession(true);
    trackInteraction('showroom_session_start', `customer-${customer.id}`);
    
    try {
      // Create showroom session data
      const sessionData = {
        customerId: customer.id,
        eventStatus: 'working',
        dealStage: 'vehicle_selection',
        notes: `Started showroom visit for ${customer.firstName} ${customer.lastName}`,
        sessionDate: new Date().toISOString().split('T')[0],
      };

      // Create the session directly via API
      const response = await apiRequest('/api/showroom-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
      
      const newSession = await response.json();
      setIsStartingSession(false);
      toast({ 
        title: 'Customer visit started successfully',
        description: `Session ${newSession.id} created for ${customer.firstName} ${customer.lastName}`
      });
      // Navigate to showroom manager
      navigate('/showroom-manager');
    } catch (error) {
      setIsStartingSession(false);
      console.error('Error creating session:', error);
      toast({ 
        title: 'Error starting showroom session', 
        description: error instanceof Error ? error.message : 'Failed to create session', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AiQ - Customer Management</h1>
          <p className="text-gray-600">Advanced CRM with comprehensive customer analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExport} size="sm" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" onClick={handleImport} size="sm" className="flex-1 sm:flex-none">
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Import</span>
          </Button>
          <Button onClick={handleAdd} className="bg-primary hover:bg-blue-700 flex-1 sm:flex-none" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Customer</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'enhanced' | 'basic')}>
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="enhanced" className="flex items-center gap-2 flex-1 md:flex-none">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Enhanced Search</span>
              <span className="sm:hidden">Enhanced</span>
            </TabsTrigger>
            <TabsTrigger value="basic" className="flex items-center gap-2 flex-1 md:flex-none">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Basic View</span>
              <span className="sm:hidden">Basic</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">CRM Analytics</span>
            <span className="sm:hidden">CRM</span>
          </Badge>
          <Badge variant="outline" className="text-xs">
            <BarChart3 className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Sales Insights</span>
            <span className="sm:hidden">Sales</span>
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
            onStartShowroomSession={handleStartShowroomSession}
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
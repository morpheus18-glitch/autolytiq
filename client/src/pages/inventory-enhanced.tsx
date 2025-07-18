import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { apiRequest } from '@/lib/queryClient';
import EnhancedInventorySearch from '@/components/enhanced-inventory-search';
import InventoryTable from '@/components/inventory/inventory-table';
import VehicleModal from '@/components/vehicle-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlidersHorizontal, List, Grid, BarChart3, Download, Upload } from 'lucide-react';
import type { Vehicle } from '@shared/schema';

export default function Inventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'enhanced' | 'basic'>('enhanced');
  const [showSearch, setShowSearch] = useState(false);

  // Note: vehicles data is fetched inside EnhancedInventorySearch component

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: 'Vehicle deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete vehicle', variant: 'destructive' });
    },
  });

  const generatePricingMutation = useMutation({
    mutationFn: async (vehicle: Vehicle) => {
      const response = await apiRequest('POST', '/api/generate-pricing-insights', {
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        currentPrice: vehicle.price,
        mileage: vehicle.mileage
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pricing-insights'] });
      toast({ title: 'Pricing insights generated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to generate pricing insights', variant: 'destructive' });
    },
  });

  const handleEdit = (vehicle: Vehicle) => {
    trackInteraction('vehicle_edit', `vehicle-${vehicle.id}`, vehicle.id);
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    trackInteraction('vehicle_add', 'add-vehicle-button');
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleView = (vehicle: Vehicle) => {
    trackInteraction('vehicle_view', `vehicle-${vehicle.id}`, vehicle.id);
    // Navigate to vehicle detail page
    window.location.href = `/inventory/${vehicle.id}`;
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      trackInteraction('vehicle_delete', `vehicle-${id}`, id);
      deleteMutation.mutate(id);
    }
  };

  const handleGeneratePricing = (vehicle: Vehicle) => {
    trackInteraction('pricing_insights', `vehicle-${vehicle.id}`, vehicle.id);
    generatePricingMutation.mutate(vehicle);
  };

  const handleExport = () => {
    trackInteraction('inventory_export', 'export-button');
    // Export functionality
    toast({ title: 'Export started', description: 'Your inventory data is being exported...' });
  };

  const handleImport = () => {
    trackInteraction('inventory_import', 'import-button');
    // Import functionality
    toast({ title: 'Import ready', description: 'Select a file to import inventory data...' });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AutolytiQ - Inventory Management</h1>
          <p className="text-gray-600">Advanced search and filtering with pricing insights</p>
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
            Add Vehicle
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
            <BarChart3 className="w-4 h-4 mr-1" />
            Advanced Analytics
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {viewMode === 'enhanced' ? (
          <EnhancedInventorySearch
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onGeneratePricing={handleGeneratePricing}
            onAdd={handleAdd}
            showAddButton={true}
          />
        ) : (
          <InventoryTable
            onEdit={handleEdit}
            onDelete={(vehicle) => handleDelete(vehicle.id)}
            onGeneratePricing={handleGeneratePricing}
            showActions={true}
          />
        )}
      </div>

      {/* Vehicle Modal */}
      {isModalOpen && (
        <VehicleModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          vehicle={selectedVehicle}
        />
      )}
    </div>
  );
}
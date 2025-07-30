import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import MobileResponsiveLayout from '@/components/layout/mobile-responsive-layout';
import AdvancedSearch from '@/components/search/advanced-search';
import SearchResults from '@/components/search/search-results';
import StatsGrid from '@/components/layout/stats-grid';
import { useSearch } from '@/hooks/use-search';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Car, 
  DollarSign, 
  Eye,
  Download,
  Upload,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import type { Vehicle } from '@shared/schema';

export default function EnhancedInventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackInteraction } = usePixelTracker();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Enhanced search with advanced filtering
  const {
    searchTerm,
    filters,
    updateSearchTerm,
    updateFilter,
    clearFilters,
    hasActiveFilters
  } = useSearch({
    searchFields: ['make', 'model', 'year', 'vin', 'description'],
    initialFilters: {}
  });

  // Fetch vehicles data
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  // Filter options for advanced search
  const filterOptions = [
    {
      id: 'make',
      label: 'Make',
      type: 'select' as const,
      options: [
        { label: 'Honda', value: 'Honda' },
        { label: 'Toyota', value: 'Toyota' },
        { label: 'Ford', value: 'Ford' },
        { label: 'Chevrolet', value: 'Chevrolet' },
        { label: 'BMW', value: 'BMW' },
        { label: 'Mercedes-Benz', value: 'Mercedes-Benz' },
        { label: 'Audi', value: 'Audi' },
        { label: 'Lexus', value: 'Lexus' }
      ]
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Sold', value: 'sold' },
        { label: 'Reserved', value: 'reserved' },
        { label: 'Pending', value: 'pending' }
      ]
    },
    {
      id: 'year',
      label: 'Year',
      type: 'range' as const,
      placeholder: 'Enter year range'
    },
    {
      id: 'price',
      label: 'Price',
      type: 'range' as const,
      placeholder: 'Enter price range'
    },
    {
      id: 'mileage',
      label: 'Mileage',
      type: 'range' as const,
      placeholder: 'Enter mileage range'
    },
    {
      id: 'createdAt',
      label: 'Date Added',
      type: 'date' as const,
      placeholder: 'Select date'
    }
  ];

  // Apply filters to vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    // Search term filter
    if (searchTerm) {
      const searchFields = [
        vehicle.make,
        vehicle.model,
        vehicle.year?.toString(),
        vehicle.vin,
        vehicle.description || ''
      ].join(' ').toLowerCase();
      
      if (!searchFields.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Advanced filters
    if (filters.make && vehicle.make !== filters.make) return false;
    if (filters.status && vehicle.status !== filters.status) return false;
    
    if (filters.year) {
      const { min, max } = filters.year;
      if (min && vehicle.year < parseInt(min)) return false;
      if (max && vehicle.year > parseInt(max)) return false;
    }
    
    if (filters.price) {
      const { min, max } = filters.price;
      if (min && vehicle.price < parseFloat(min)) return false;
      if (max && vehicle.price > parseFloat(max)) return false;
    }

    if (filters.mileage) {
      const { min, max } = filters.mileage;
      if (min && (vehicle.mileage || 0) < parseInt(min)) return false;
      if (max && (vehicle.mileage || 0) > parseInt(max)) return false;
    }

    return true;
  });

  // Convert vehicles to search results format
  const searchResults = filteredVehicles.map(vehicle => ({
    id: vehicle.id,
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    subtitle: `VIN: ${vehicle.vin}`,
    description: vehicle.description || 'No description available',
    badges: [
      { label: vehicle.status || 'Unknown', variant: vehicle.status === 'available' ? 'default' : 'secondary' as const },
      { label: `$${vehicle.price?.toLocaleString()}`, variant: 'outline' as const }
    ],
    metadata: {
      year: vehicle.year,
      mileage: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'N/A',
      price: `$${vehicle.price?.toLocaleString()}`,
      dateAdded: vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'
    },
    actions: [
      {
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => {
          trackInteraction('button_click', { action: 'view_vehicle', vehicleId: vehicle.id });
          toast({ title: 'Vehicle Details', description: `Viewing ${vehicle.year} ${vehicle.make} ${vehicle.model}` });
        }
      },
      {
        label: 'Edit',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => {
          trackInteraction('button_click', { action: 'edit_vehicle', vehicleId: vehicle.id });
          toast({ title: 'Edit Vehicle', description: 'Opening edit dialog...' });
        }
      },
      {
        label: 'Delete',
        icon: <Trash2 className="w-4 h-4" />,
        onClick: () => {
          trackInteraction('button_click', { action: 'delete_vehicle', vehicleId: vehicle.id });
          toast({ title: 'Delete Vehicle', description: 'Are you sure?', variant: 'destructive' });
        },
        variant: 'destructive' as const
      }
    ]
  }));

  // Stats for inventory
  const stats = [
    {
      label: 'Total Vehicles',
      value: vehicles.length,
      icon: <Car className="w-4 h-4" />,
      color: 'blue' as const
    },
    {
      label: 'Available',
      value: vehicles.filter(v => v.status === 'available').length,
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'green' as const
    },
    {
      label: 'Total Value',
      value: `$${vehicles.reduce((sum, v) => sum + (v.price || 0), 0).toLocaleString()}`,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'orange' as const
    },
    {
      label: 'Filtered Results',
      value: filteredVehicles.length,
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'default' as const
    }
  ];

  const headerActions = (
    <>
      <Button variant="outline" className="gap-2">
        <Upload className="w-4 h-4" />
        Import
      </Button>
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        Add Vehicle
      </Button>
    </>
  );

  return (
    <MobileResponsiveLayout
      title="Vehicle Inventory"
      subtitle="Manage your dealership's vehicle inventory with advanced search and filtering"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <StatsGrid stats={stats} cols={4} />

        {/* Advanced Search */}
        <AdvancedSearch
          searchTerm={searchTerm}
          onSearchChange={updateSearchTerm}
          filters={filterOptions}
          activeFilters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          onExport={() => {
            trackInteraction('button_click', { action: 'export_inventory' });
            toast({ title: 'Export Started', description: 'Downloading inventory data...' });
          }}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
            toast({ title: 'Data Refreshed', description: 'Inventory updated successfully' });
          }}
          resultCount={filteredVehicles.length}
          loading={isLoading}
        />

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          loading={isLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOptions={[
            { label: 'Make & Model', value: 'name' },
            { label: 'Year', value: 'year' },
            { label: 'Price', value: 'price' },
            { label: 'Mileage', value: 'mileage' },
            { label: 'Date Added', value: 'createdAt' }
          ]}
          emptyMessage={hasActiveFilters ? 
            "No vehicles match your search criteria. Try adjusting your filters." :
            "No vehicles in inventory. Add some vehicles to get started."
          }
          showActions={true}
        />
      </div>
    </MobileResponsiveLayout>
  );
}
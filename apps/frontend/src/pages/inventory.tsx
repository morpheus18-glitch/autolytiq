import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Button,
  Badge,
  Card,
  CardContent,
  Alert,
  StatCard,
  SearchInput,
  Modal
} from '@repo/ui';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { useDealStudioLauncher } from '@/hooks/useDealStudioLauncher';
import { VehicleEntryForm } from '@/components/forms/VehicleEntryForm';
import {
  Search,
  Filter,
  Car,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  MapPin,
  Eye,
  Edit,
  Share2,
  Tag,
  AlertCircle,
  Calculator,
  Plus
} from 'lucide-react';
import type { Vehicle } from '@shared/schema';

export default function Inventory() {
  const { toast } = useToast();
  const { trackInteraction } = usePixelTracker();
  const [, setLocation] = useLocation();
  const { openDealStudio } = useDealStudioLauncher();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('grid');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  // Demo data for immediate functionality
  const demoVehicles: Vehicle[] = [
    {
      id: 'V001',
      stockNumber: 'STK-2024-001',
      vin: '1HGBH41JXMN109186',
      year: 2024,
      make: 'Toyota',
      model: 'Camry',
      trim: 'XSE',
      price: 32500,
      status: 'available',
      mileage: 15,
      daysInStock: 12,
    },
    {
      id: 'V002',
      stockNumber: 'STK-2024-002',
      vin: '2T3BFREV5HW123456',
      year: 2023,
      make: 'Honda',
      model: 'CR-V',
      trim: 'EX-L',
      price: 28900,
      status: 'available',
      mileage: 8245,
      daysInStock: 8,
    },
    {
      id: 'V003',
      stockNumber: 'STK-2024-003',
      vin: '1FTFW1ET9MFC12345',
      year: 2024,
      make: 'Ford',
      model: 'F-150',
      trim: 'XLT',
      price: 45200,
      status: 'available',
      mileage: 3200,
      daysInStock: 5,
    },
  ];

  const { data: vehicles = demoVehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/vehicles');
        const json = await response.json();
        // Backend returns { data: vehicles }, extract the array
        return json.data || demoVehicles;
      } catch {
        return demoVehicles;
      }
    },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="error" className="max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Inventory</h3>
            <p>Unable to load vehicle data</p>
          </div>
        </Alert>
      </div>
    );
  }

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vehicle.make?.toLowerCase().includes(query) ||
      vehicle.model?.toLowerCase().includes(query) ||
      vehicle.stockNumber?.toLowerCase().includes(query) ||
      vehicle.vin?.toLowerCase().includes(query)
    );
  });

  // Calculate stats
  const totalUnits = vehicles.length;
  const avgDaysInStock = vehicles.length > 0 
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.daysInStock || 0), 0) / vehicles.length)
    : 0;
  const totalValue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
  const availableCount = vehicles.filter(v => v.status === 'available').length;

  const InventoryStatCard = ({ stat }: { stat: any }) => (
    <StatCard
      label={stat.label}
      value={stat.value}
      change={stat.change}
      icon={stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      trend={stat.trend}
    />
  );

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    const getStatusVariant = (status: string) => {
      switch (status) {
        case 'available': return 'success' as const;
        case 'in-transit': return 'info' as const;
        default: return 'secondary' as const;
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'available': return 'Available';
        case 'in-transit': return 'In Transit';
        default: return 'Sold';
      }
    };

    return (
      <Card hover>
        <CardContent className="p-0">
          {/* Vehicle Image */}
          <div className="relative">
            <div className="h-36 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <Car className="w-16 h-16 text-white/30" />
            </div>
            <div className="absolute top-3 right-3">
              <Badge variant={getStatusVariant(vehicle.status || 'available')}>
                {getStatusLabel(vehicle.status || 'available')}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="text-white text-xs font-semibold">Stock #{vehicle.stockNumber}</span>
            </div>
          </div>

          <div className="p-4">
            {/* Vehicle Title */}
            <h3 className="font-bold text-lg mb-1">{vehicle.year} {vehicle.make}</h3>
            <p className="text-text-secondary text-sm mb-3">{vehicle.model} {vehicle.trim}</p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="flex items-center gap-1 text-text-secondary">
                <Calendar className="w-3 h-3" />
                <span>{vehicle.daysInStock || 0} days</span>
              </div>
              <div className="flex items-center gap-1 text-text-secondary">
                <MapPin className="w-3 h-3" />
                <span>{vehicle.location || 'Lot A'}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex justify-between items-center pt-3 border-t border-border-base">
              <div>
                <div className="text-xs text-text-tertiary">List Price</div>
                <div className="text-xl font-bold text-accent-primary">${vehicle.price?.toLocaleString()}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedVehicle(vehicle)}
                data-testid={`button-view-vehicle-${vehicle.id}`}
              >
                <Eye className="w-5 h-5" />
              </Button>
            </div>

            {/* Profit Indicator */}
            <div className="mt-3 p-2 bg-status-success/10 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Potential Gross</span>
                <span className="font-bold text-status-success">
                  ${((vehicle.price || 0) - (vehicle.cost || vehicle.price || 0) * 0.85).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const statsData = [
    { label: 'Total Units', value: totalUnits, change: '+3', trend: 'up' },
    { label: 'Avg Days in Stock', value: avgDaysInStock, change: '-2', trend: 'down' },
    { label: 'Total Value', value: `$${(totalValue / 1000000).toFixed(1)}M`, change: '+$120K', trend: 'up' },
    { label: 'Available', value: availableCount, change: '+1', trend: 'up' }
  ];

  return (
    <div className="bg-surface-base min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold" data-testid="text-page-title">Inventory</h1>
            <Button
              variant="primary"
              onClick={() => setShowVehicleForm(true)}
              data-testid="button-add-vehicle"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by stock, VIN, make, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="input-search-inventory"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilterOpen(!filterOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              data-testid="button-filter"
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>

          {/* View Toggles */}
          <div className="flex gap-2">
            <Button
              variant={selectedView === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('grid')}
              className={selectedView === 'grid' ? '' : 'text-white hover:bg-white/20'}
              data-testid="button-grid-view"
            >
              Grid View
            </Button>
            <Button
              variant={selectedView === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedView('list')}
              className={selectedView === 'list' ? '' : 'text-white hover:bg-white/20'}
              data-testid="button-list-view"
            >
              List View
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statsData.map((stat, index) => (
            <InventoryStatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <Button variant="primary" size="sm" data-testid="filter-all">
            All ({totalUnits})
          </Button>
          <Button variant="secondary" size="sm" data-testid="filter-available">
            Available ({availableCount})
          </Button>
          <Button variant="secondary" size="sm" data-testid="filter-in-transit">
            In Transit (0)
          </Button>
          <Button variant="secondary" size="sm" data-testid="filter-aging">
            Aging (0)
          </Button>
        </div>

        {/* Inventory Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-6">
            {filteredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
            {filteredVehicles.length === 0 && (
              <div className="text-center py-12">
                <Car className="w-12 h-12 mx-auto mb-3 text-text-tertiary" />
                <p className="text-text-secondary">No vehicles found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <Modal
          open={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          title={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Vehicle Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center">
              <Car className="w-24 h-24 text-white/30" />
            </div>

            <p className="text-text-secondary text-lg">{selectedVehicle.trim}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-text-tertiary mb-1">Stock Number</div>
                <div className="font-semibold">#{selectedVehicle.stockNumber}</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary mb-1">Status</div>
                <div className="font-semibold capitalize">{selectedVehicle.status}</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary mb-1">VIN</div>
                <div className="font-mono text-sm">{selectedVehicle.vin}</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary mb-1">Location</div>
                <div className="font-semibold">{selectedVehicle.location || 'Lot A'}</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary mb-1">Exterior Color</div>
                <div className="font-semibold">{selectedVehicle.exteriorColor || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-text-tertiary mb-1">Mileage</div>
                <div className="font-semibold">{selectedVehicle.mileage?.toLocaleString() || '0'} mi</div>
              </div>
            </div>

            {/* Financial Info */}
            <Card className="bg-accent-primary/5">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3">Financial Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Cost</span>
                    <span className="font-semibold">${((selectedVehicle.cost || selectedVehicle.price || 0) * 0.85).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">List Price</span>
                    <span className="font-semibold">${selectedVehicle.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border-base">
                    <span className="font-bold">Potential Gross</span>
                    <span className="font-bold text-status-success">
                      ${((selectedVehicle.price || 0) - (selectedVehicle.cost || selectedVehicle.price || 0) * 0.85).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Aging Info */}
            <Card className="bg-status-warning/5">
              <CardContent className="p-4">
                <h3 className="font-bold mb-3">Aging Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Days in Stock</span>
                    <span className="font-semibold">{selectedVehicle.daysInStock || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Floor Plan Days</span>
                    <span className="font-semibold">{selectedVehicle.daysInStock || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Est. Floor Interest</span>
                    <span className="font-semibold text-status-warning">
                      ${Math.round(((selectedVehicle.cost || selectedVehicle.price || 0) * 0.85) * 0.05 * ((selectedVehicle.daysInStock || 0) / 365)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedVehicle(null);
                  trackInteraction('start_deal_from_inventory', { vehicleId: selectedVehicle.id });
                  openDealStudio({ vehicleId: selectedVehicle.id });
                }}
                data-testid="button-create-deal"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Start Deal
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedVehicle(null);
                  setLocation(`/inventory/edit/${selectedVehicle.id}`);
                }}
                data-testid="button-edit-vehicle"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="secondary" data-testid="button-share-vehicle">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="secondary" data-testid="button-price-vehicle">
                <Tag className="w-4 h-4 mr-2" />
                Price
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Vehicle Entry Form Modal */}
      <VehicleEntryForm
        isOpen={showVehicleForm}
        onClose={() => setShowVehicleForm(false)}
        onSuccess={(vehicle) => {
          setShowVehicleForm(false);
          toast({ title: `Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} added successfully!` });
        }}
      />
    </div>
  );
}

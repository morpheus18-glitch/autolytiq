import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import { useDealStudioLauncher } from '@/hooks/useDealStudioLauncher';
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
  Calculator
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
        return response.json();
      } catch {
        return demoVehicles;
      }
    },
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Inventory</h3>
          <p className="text-gray-600">Unable to load vehicle data</p>
        </div>
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

  const StatCard = ({ stat }: { stat: any }) => (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-gray-600">{stat.label}</div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${
          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {stat.change}
        </div>
      </div>
      <div className="text-2xl font-bold">{stat.value}</div>
    </div>
  );

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Status Badge */}
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <Car className="w-16 h-16 text-white/30" />
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            vehicle.status === 'available' ? 'bg-green-500 text-white' : 
            vehicle.status === 'in-transit' ? 'bg-blue-500 text-white' : 
            'bg-gray-500 text-white'
          }`}>
            {vehicle.status === 'available' ? 'Available' : vehicle.status === 'in-transit' ? 'In Transit' : 'Sold'}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg">
          <span className="text-white text-xs font-semibold">Stock #{vehicle.stockNumber}</span>
        </div>
      </div>

      <div className="p-4">
        {/* Vehicle Title */}
        <h3 className="font-bold text-lg mb-1">{vehicle.year} {vehicle.make}</h3>
        <p className="text-gray-600 text-sm mb-3">{vehicle.model} {vehicle.trim}</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{vehicle.daysInStock || 0} days</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{vehicle.location || 'Lot A'}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">List Price</div>
            <div className="text-xl font-bold text-blue-600">${vehicle.price?.toLocaleString()}</div>
          </div>
          <button 
            onClick={() => setSelectedVehicle(vehicle)}
            className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
            data-testid={`button-view-vehicle-${vehicle.id}`}
          >
            <Eye className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        {/* Profit Indicator */}
        <div className="mt-3 p-2 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Potential Gross</span>
            <span className="font-bold text-green-600">
              ${((vehicle.price || 0) - (vehicle.cost || vehicle.price || 0) * 0.85).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const statsData = [
    { label: 'Total Units', value: totalUnits, change: '+3', trend: 'up' },
    { label: 'Avg Days in Stock', value: avgDaysInStock, change: '-2', trend: 'down' },
    { label: 'Total Value', value: `$${(totalValue / 1000000).toFixed(1)}M`, change: '+$120K', trend: 'up' },
    { label: 'Available', value: availableCount, change: '+1', trend: 'up' }
  ];

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold" data-testid="text-page-title">Inventory</h1>
            <button 
              onClick={() => setLocation('/inventory/new')}
              className="px-4 py-2 bg-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
              data-testid="button-add-vehicle"
            >
              + Add Vehicle
            </button>
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
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
              data-testid="button-filter"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* View Toggles */}
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedView('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === 'grid' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              data-testid="button-grid-view"
            >
              Grid View
            </button>
            <button 
              onClick={() => setSelectedView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === 'list' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              data-testid="button-list-view"
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statsData.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium whitespace-nowrap" data-testid="filter-all">
            All ({totalUnits})
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-50" data-testid="filter-available">
            Available ({availableCount})
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-50" data-testid="filter-in-transit">
            In Transit (0)
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-50" data-testid="filter-aging">
            Aging (0)
          </button>
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
              <div className="text-center py-12 text-gray-500">
                <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No vehicles found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedVehicle(null)}
          />
          <div className="relative w-full md:max-w-2xl bg-white md:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-6 md:hidden" />
            
            {/* Header */}
            <div className="px-6 pb-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1" data-testid="text-vehicle-detail-title">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <p className="text-gray-600">{selectedVehicle.trim}</p>
                </div>
                <button 
                  onClick={() => setSelectedVehicle(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  data-testid="button-close-modal"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Vehicle Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl flex items-center justify-center mb-6">
                <Car className="w-24 h-24 text-white/30" />
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Stock Number</div>
                  <div className="font-semibold">#{selectedVehicle.stockNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className="font-semibold capitalize">{selectedVehicle.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">VIN</div>
                  <div className="font-mono text-sm">{selectedVehicle.vin}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-semibold">{selectedVehicle.location || 'Lot A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Exterior Color</div>
                  <div className="font-semibold">{selectedVehicle.exteriorColor || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Mileage</div>
                  <div className="font-semibold">{selectedVehicle.mileage?.toLocaleString() || '0'} mi</div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold mb-3">Financial Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost</span>
                    <span className="font-semibold">${((selectedVehicle.cost || selectedVehicle.price || 0) * 0.85).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">List Price</span>
                    <span className="font-semibold">${selectedVehicle.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold">Potential Gross</span>
                    <span className="font-bold text-green-600">
                      ${((selectedVehicle.price || 0) - (selectedVehicle.cost || selectedVehicle.price || 0) * 0.85).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Aging Info */}
              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold mb-3">Aging Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days in Stock</span>
                    <span className="font-semibold">{selectedVehicle.daysInStock || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor Plan Days</span>
                    <span className="font-semibold">{selectedVehicle.daysInStock || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Floor Interest</span>
                    <span className="font-semibold text-orange-600">
                      ${Math.round(((selectedVehicle.cost || selectedVehicle.price || 0) * 0.85) * 0.05 * ((selectedVehicle.daysInStock || 0) / 365)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedVehicle(null);
                    trackInteraction('start_deal_from_inventory', { vehicleId: selectedVehicle.id });
                    openDealStudio({ vehicleId: selectedVehicle.id });
                  }}
                  className="py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-create-deal"
                >
                  <Calculator className="w-4 h-4" />
                  Start Deal
                </button>
                <button 
                  onClick={() => {
                    setSelectedVehicle(null);
                    setLocation(`/inventory/edit/${selectedVehicle.id}`);
                  }}
                  className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-edit-vehicle"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2" data-testid="button-share-vehicle">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2" data-testid="button-price-vehicle">
                  <Tag className="w-4 h-4" />
                  Price
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

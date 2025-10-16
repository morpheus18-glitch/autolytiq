import React, { useState } from 'react';
import { Search, Filter, Car, TrendingUp, TrendingDown, Calendar, DollarSign, MapPin, MoreVertical, Eye, Edit, Share2, Tag } from 'lucide-react';

const InventoryManagementUI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('grid');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const inventoryData = [
    {
      id: 1,
      stock: 'A7845',
      year: 2024,
      make: 'Toyota',
      model: 'Camry XSE',
      trim: 'Premium',
      vin: '4T1B11HK8RU123456',
      color: 'Celestial Silver',
      mileage: 12,
      cost: 28500,
      price: 32500,
      daysInStock: 8,
      status: 'Available',
      location: 'Lot A-12',
      floorPlanDays: 8
    },
    {
      id: 2,
      stock: 'B3421',
      year: 2024,
      make: 'Honda',
      model: 'Accord Sport',
      trim: 'Sport 2.0T',
      vin: '1HGCV1F47RA123789',
      color: 'Platinum White',
      mileage: 8,
      cost: 29200,
      price: 33500,
      daysInStock: 15,
      status: 'Available',
      location: 'Lot B-05',
      floorPlanDays: 15
    },
    {
      id: 3,
      stock: 'C9012',
      year: 2023,
      make: 'Ford',
      model: 'F-150',
      trim: 'Lariat 4WD',
      vin: '1FTFW1E84NFA12345',
      color: 'Agate Black',
      mileage: 18500,
      cost: 38900,
      price: 44500,
      daysInStock: 42,
      status: 'Available',
      location: 'Lot C-18',
      floorPlanDays: 42
    },
    {
      id: 4,
      stock: 'D2156',
      year: 2024,
      make: 'Tesla',
      model: 'Model 3',
      trim: 'Long Range AWD',
      vin: '5YJ3E1EA6RF123456',
      color: 'Deep Blue Metallic',
      mileage: 5,
      cost: 42000,
      price: 46990,
      daysInStock: 5,
      status: 'In Transit',
      location: 'In Transit',
      floorPlanDays: 0
    },
    {
      id: 5,
      stock: 'E8734',
      year: 2024,
      make: 'Chevrolet',
      model: 'Silverado 1500',
      trim: 'RST Crew Cab',
      vin: '1GCUYGEL7RZ123456',
      color: 'Summit White',
      mileage: 22,
      cost: 41200,
      price: 47500,
      daysInStock: 23,
      status: 'Available',
      location: 'Lot A-24',
      floorPlanDays: 23
    }
  ];

  const statsData = [
    { label: 'Total Units', value: '47', change: '+3', trend: 'up' },
    { label: 'Avg Days in Stock', value: '28', change: '-2', trend: 'down' },
    { label: 'Total Value', value: '$1.8M', change: '+$120K', trend: 'up' },
    { label: 'Available', value: '42', change: '+1', trend: 'up' }
  ];

  const VehicleCard = ({ vehicle }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Status Badge */}
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <Car className="w-16 h-16 text-white/30" />
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            vehicle.status === 'Available' ? 'bg-green-500 text-white' : 
            vehicle.status === 'In Transit' ? 'bg-blue-500 text-white' : 
            'bg-gray-500 text-white'
          }`}>
            {vehicle.status}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg">
          <span className="text-white text-xs font-semibold">Stock #{vehicle.stock}</span>
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
            <span>{vehicle.daysInStock} days</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{vehicle.location}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">List Price</div>
            <div className="text-xl font-bold text-blue-600">${vehicle.price.toLocaleString()}</div>
          </div>
          <button 
            onClick={() => setSelectedVehicle(vehicle)}
            className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors"
          >
            <Eye className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        {/* Profit Indicator */}
        <div className="mt-3 p-2 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Potential Gross</span>
            <span className="font-bold text-green-600">${(vehicle.price - vehicle.cost).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ stat }) => (
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Inventory</h1>
            <button className="px-4 py-2 bg-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
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
            />
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
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
            >
              Grid View
            </button>
            <button 
              onClick={() => setSelectedView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedView === 'list' ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
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
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium whitespace-nowrap">
            All (47)
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-50">
            Available (42)
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-50">
            In Transit (3)
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-gray-50">
            Aging (5)
          </button>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 gap-4 pb-6">
          {inventoryData.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
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
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h2>
                  <p className="text-gray-600">{selectedVehicle.trim}</p>
                </div>
                <button 
                  onClick={() => setSelectedVehicle(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
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
                  <div className="font-semibold">#{selectedVehicle.stock}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className="font-semibold">{selectedVehicle.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">VIN</div>
                  <div className="font-mono text-sm">{selectedVehicle.vin}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-semibold">{selectedVehicle.location}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Exterior Color</div>
                  <div className="font-semibold">{selectedVehicle.color}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Mileage</div>
                  <div className="font-semibold">{selectedVehicle.mileage.toLocaleString()} mi</div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold mb-3">Financial Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost</span>
                    <span className="font-semibold">${selectedVehicle.cost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">List Price</span>
                    <span className="font-semibold">${selectedVehicle.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold">Potential Gross</span>
                    <span className="font-bold text-green-600">
                      ${(selectedVehicle.price - selectedVehicle.cost).toLocaleString()}
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
                    <span className="font-semibold">{selectedVehicle.daysInStock} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor Plan Days</span>
                    <span className="font-semibold">{selectedVehicle.floorPlanDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Floor Interest</span>
                    <span className="font-semibold text-orange-600">
                      ${Math.round(selectedVehicle.cost * 0.05 * (selectedVehicle.floorPlanDays / 365)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Create Deal
                </button>
                <button className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
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
};

export default InventoryManagementUI;

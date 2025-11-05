/**
 * Customer & Vehicle Selector
 *
 * Dropdown selectors for choosing customer and vehicle from database
 * Automatically populates deal fields when selections are made
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDealStudio } from '@/contexts/DealStudioContext';
import { Search, User, Car, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  addressZip?: string;
  creditScore?: number;
}

interface Vehicle {
  id: string;
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  cost: number;
  msrp: number;
  mileage?: number;
}

export function CustomerVehicleSelector() {
  const { deal, updateDeal } = useDealStudio();
  const [customerSearch, setCustomerSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [customerOpen, setCustomerOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['/api/customers', customerSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (customerSearch) params.append('search', customerSearch);
      params.append('limit', '10');
      return apiRequest('GET', `/api/customers?${params.toString()}`);
    },
    enabled: customerOpen,
  });

  const customers = customersData?.data || [];

  // Fetch vehicles
  const { data: vehiclesData } = useQuery({
    queryKey: ['/api/vehicles', vehicleSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (vehicleSearch) params.append('search', vehicleSearch);
      params.append('status', 'AVAILABLE');
      params.append('limit', '10');
      return apiRequest('GET', `/api/vehicles?${params.toString()}`);
    },
    enabled: vehicleOpen,
  });

  const vehicles = vehiclesData?.data || [];

  // Handle customer selection
  const handleCustomerSelect = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerOpen(false);
    setCustomerSearch('');

    // Update deal with customer info
    updateDeal({
      customerId: customer.id,
      creditScore: customer.creditScore || 700,
      // Store zip for tax calculation
      ...(customer.addressZip && { customerZip: customer.addressZip }),
    });
  }, [updateDeal]);

  // Handle vehicle selection
  const handleVehicleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleOpen(false);
    setVehicleSearch('');

    // Update deal with vehicle info
    updateDeal({
      vehicleId: vehicle.id,
      vehiclePrice: vehicle.price,
      vehicleCost: vehicle.cost,
      salePrice: vehicle.price, // Initial sale price = list price
    });
  }, [updateDeal]);

  // Clear selections
  const clearCustomer = () => {
    setSelectedCustomer(null);
    updateDeal({ customerId: undefined, creditScore: 720 });
  };

  const clearVehicle = () => {
    setSelectedVehicle(null);
    updateDeal({
      vehicleId: undefined,
      vehiclePrice: 0,
      vehicleCost: 0,
      salePrice: 0,
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 p-4 space-y-3">
      {/* Customer Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
          Customer
        </label>
        <div className="relative">
          {selectedCustomer ? (
            <div className="flex items-center justify-between p-3 border border-slate-300 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </div>
                  <div className="text-xs text-slate-600">
                    {selectedCustomer.email || selectedCustomer.phone || 'No contact info'}
                  </div>
                </div>
              </div>
              <button
                onClick={clearCustomer}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setCustomerOpen(!customerOpen)}
                className="w-full flex items-center justify-between p-3 border border-slate-300 rounded-lg text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm text-slate-500">Select customer...</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {customerOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 border-b border-slate-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    {customers.length > 0 ? (
                      customers.map((customer: Customer) => (
                        <button
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-xs text-slate-600">
                              {customer.email || customer.phone || 'No contact'}
                              {customer.creditScore && (
                                <span className="ml-2 text-green-600">
                                  • FICO {customer.creditScore}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No customers found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Vehicle Selector */}
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
          Vehicle
        </label>
        <div className="relative">
          {selectedVehicle ? (
            <div className="flex items-center justify-between p-3 border border-slate-300 rounded-lg bg-purple-50">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </div>
                  <div className="text-xs text-slate-600">
                    Stock #{selectedVehicle.stockNumber} • ${selectedVehicle.price.toLocaleString()}
                  </div>
                </div>
              </div>
              <button
                onClick={clearVehicle}
                className="p-1 hover:bg-slate-200 rounded transition-colors"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setVehicleOpen(!vehicleOpen)}
                className="w-full flex items-center justify-between p-3 border border-slate-300 rounded-lg text-left hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm text-slate-500">Select vehicle...</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {vehicleOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 border-b border-slate-200">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search vehicles..."
                        value={vehicleSearch}
                        onChange={(e) => setVehicleSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    {vehicles.length > 0 ? (
                      vehicles.map((vehicle: Vehicle) => (
                        <button
                          key={vehicle.id}
                          onClick={() => handleVehicleSelect(vehicle)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          <Car className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                            </div>
                            <div className="text-xs text-slate-600">
                              Stock #{vehicle.stockNumber} • VIN: {vehicle.vin.slice(-8)}
                              <span className="ml-2 text-green-600 font-semibold">
                                ${vehicle.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500">
                        No vehicles found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

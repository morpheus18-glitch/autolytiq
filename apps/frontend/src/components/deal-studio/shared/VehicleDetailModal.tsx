/**
 * Vehicle Detail Modal
 *
 * Pops up when clicking vehicle in Deal Studio
 * Shows full vehicle specs, pricing, cost, inventory details
 */

import { useQuery } from '@tanstack/react-query';
import { X, Car, DollarSign, Calendar, MapPin, Gauge, Palette } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface VehicleDetailModalProps {
  vehicleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleDetailModal({ vehicleId, isOpen, onClose }: VehicleDetailModalProps) {
  const { data: vehicleData, isLoading } = useQuery({
    queryKey: ['/api/vehicles', vehicleId],
    queryFn: () => apiRequest('GET', `/api/vehicles/${vehicleId}`),
    enabled: isOpen && !!vehicleId,
  });

  const vehicle = vehicleData?.data;

  if (!isOpen) return null;

  const profit = vehicle ? vehicle.price - vehicle.cost : 0;
  const margin = vehicle && vehicle.price > 0
    ? ((profit / vehicle.price) * 100).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Vehicle Details</h2>
              {vehicle && (
                <p className="text-purple-100 text-sm">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
          </div>
        ) : vehicle ? (
          <div className="p-6 space-y-6">
            {/* Vehicle Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl flex items-center justify-center">
              <Car className="w-24 h-24 text-white/30" />
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Vehicle Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoCard label="Stock #" value={vehicle.stockNumber} />
                <InfoCard label="VIN" value={vehicle.vin.slice(-8)} />
                <InfoCard label="Status" value={vehicle.status || 'Available'} highlight />
                <InfoCard
                  icon={Calendar}
                  label="Year"
                  value={vehicle.year.toString()}
                />
                <InfoCard
                  icon={Gauge}
                  label="Mileage"
                  value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'N/A'}
                />
                <InfoCard
                  icon={MapPin}
                  label="Location"
                  value={vehicle.location || 'Lot A'}
                />
              </div>
            </div>

            {/* Specs */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="Trim" value={vehicle.trim || 'Base'} />
                <InfoCard label="Body Style" value={vehicle.bodyStyle || 'N/A'} />
                <InfoCard
                  icon={Palette}
                  label="Exterior Color"
                  value={vehicle.exteriorColor || 'N/A'}
                />
                <InfoCard
                  icon={Palette}
                  label="Interior Color"
                  value={vehicle.interiorColor || 'N/A'}
                />
                <InfoCard label="Engine" value={vehicle.engineType || 'N/A'} />
                <InfoCard label="Transmission" value={vehicle.transmission || 'N/A'} />
                <InfoCard label="Drivetrain" value={vehicle.drivetrain || 'N/A'} />
                <InfoCard label="Fuel Type" value={vehicle.fuelType || 'N/A'} />
              </div>
            </div>

            {/* Pricing & Profit */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Pricing & Profitability
              </h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-1">MSRP</div>
                    <div className="text-lg font-bold text-slate-900">
                      ${vehicle.msrp?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-1">Cost</div>
                    <div className="text-lg font-bold text-slate-900">
                      ${vehicle.cost.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-1">List Price</div>
                    <div className="text-xl font-bold text-blue-600">
                      ${vehicle.price.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-600 mb-1">Days in Stock</div>
                    <div className={cn(
                      'text-lg font-bold',
                      vehicle.daysInStock && vehicle.daysInStock > 60 ? 'text-orange-600' : 'text-slate-900'
                    )}>
                      {vehicle.daysInStock || 0} days
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-green-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600">Potential Gross Profit</span>
                    <span className="text-2xl font-black text-green-600">
                      ${profit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">Margin</span>
                    <span className="text-lg font-bold text-green-600">
                      {margin}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                View Full Details
              </button>
              <button className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                Edit Pricing
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            Vehicle not found
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  highlight = false,
  className,
}: {
  icon?: any;
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('bg-slate-50 rounded-lg p-3', className)}>
      <div className="flex items-start gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-600 mb-0.5">{label}</div>
          <div className={cn(
            'text-sm font-semibold truncate',
            highlight ? 'text-green-600' : 'text-slate-900'
          )}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

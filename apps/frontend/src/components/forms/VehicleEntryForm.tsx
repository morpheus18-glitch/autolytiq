/**
 * Vehicle Entry Form
 *
 * Comprehensive form for creating/editing vehicles
 * Features:
 * - VIN decoder (auto-populate specs)
 * - Manual data entry for all vehicle fields
 * - Pricing in dollars (converted to cents on backend)
 * - Validation with react-hook-form + zod
 * - Persistent storage to database
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { X, Car, Loader2, DollarSign, Info, Sparkles } from 'lucide-react';

/**
 * Vehicle form validation schema
 */
const vehicleFormSchema = z.object({
  // Required fields
  stockNumber: z.string().min(1, 'Stock number is required'),
  vin: z.string().length(17, 'VIN must be 17 characters'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  type: z.enum(['NEW', 'USED', 'CERTIFIED']),

  // Optional fields
  trim: z.string().optional(),
  bodyStyle: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  mileage: z.number().int().min(0).optional().or(z.nan()),
  engineType: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID', 'PLUGIN_HYBRID', 'OTHER']).default('GASOLINE'),
  condition: z.enum(['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR']).optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'PENDING', 'ON_HOLD', 'IN_TRANSIT', 'AT_AUCTION']).default('AVAILABLE'),

  // Pricing (in dollars, converted to cents on submit)
  cost: z.number().min(0).optional().or(z.nan()),
  price: z.number().min(0).optional().or(z.nan()),
  msrp: z.number().min(0).optional().or(z.nan()),
  invoiceCost: z.number().min(0).optional().or(z.nan()),

  // Acquisition
  acquiredFrom: z.string().optional(),
  acquisitionType: z.enum(['TRADE_IN', 'AUCTION', 'WHOLESALE', 'DEALER_TRANSFER', 'MANUFACTURER', 'LEASE_RETURN', 'REPO', 'OTHER']).optional(),

  // Location
  location: z.string().optional(),

  // Additional
  certifiedPreOwned: z.boolean().default(false),
  certificationNumber: z.string().optional(),
  notes: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: string;
  onSuccess?: (vehicle: any) => void;
}

export function VehicleEntryForm({ isOpen, onClose, vehicleId, onSuccess }: VehicleEntryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDecoding, setIsDecoding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      type: 'USED',
      fuelType: 'GASOLINE',
      status: 'AVAILABLE',
      certifiedPreOwned: false,
    },
  });

  const vinValue = watch('vin');

  // Create vehicle mutation
  const createVehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      // Convert dollars to cents
      const payload = {
        ...data,
        costCents: data.cost ? Math.round(data.cost * 100) : undefined,
        priceCents: data.price ? Math.round(data.price * 100) : undefined,
        msrpCents: data.msrp ? Math.round(data.msrp * 100) : undefined,
        invoiceCents: data.invoiceCost ? Math.round(data.invoiceCost * 100) : undefined,
      };
      // Remove dollar fields before sending
      delete (payload as any).cost;
      delete (payload as any).price;
      delete (payload as any).msrp;
      delete (payload as any).invoiceCost;

      return apiRequest('POST', '/api/vehicles', payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({ title: 'Vehicle added successfully!' });
      if (onSuccess) onSuccess(response.data);
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add vehicle',
        description: error?.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Decode VIN mutation
  const decodeVINMutation = useMutation({
    mutationFn: async (vin: string) => {
      const response = await fetch('/api/vin/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to decode VIN');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      if (!data.valid) {
        toast({
          title: 'Invalid VIN',
          description: data.errorMessage || 'Unable to decode VIN',
          variant: 'destructive',
        });
        return;
      }

      // Auto-populate form fields from decoded VIN
      if (data.year) setValue('year', data.year);
      if (data.make) setValue('make', data.make);
      if (data.model) setValue('model', data.model);
      if (data.trim) setValue('trim', data.trim);
      if (data.bodyStyle) setValue('bodyStyle', data.bodyStyle);
      if (data.engineType) setValue('engineType', data.engineType);
      if (data.transmission) setValue('transmission', data.transmission);
      if (data.driveType) setValue('drivetrain', data.driveType);
      if (data.fuelType) {
        // Map fuel types to our enum
        const fuelTypeMap: Record<string, string> = {
          'Gasoline': 'GASOLINE',
          'Diesel': 'DIESEL',
          'Electric': 'ELECTRIC',
          'Hybrid': 'HYBRID',
          'Plug-in Hybrid': 'PLUGIN_HYBRID',
        };
        const mappedFuelType = fuelTypeMap[data.fuelType] || 'OTHER';
        setValue('fuelType', mappedFuelType as any);
      }

      toast({
        title: 'VIN decoded successfully!',
        description: `${data.year} ${data.make} ${data.model}${data.source === 'cache' ? ' (from cache)' : ''}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to decode VIN',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleDecodeVIN = async () => {
    if (!vinValue || vinValue.length !== 17) {
      toast({ title: 'Please enter a valid 17-character VIN', variant: 'destructive' });
      return;
    }
    setIsDecoding(true);
    await decodeVINMutation.mutateAsync(vinValue);
    setIsDecoding(false);
  };

  const onSubmit = async (data: VehicleFormData) => {
    await createVehicleMutation.mutateAsync(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Add New Vehicle</h2>
              <p className="text-purple-100 text-sm">Enter VIN to auto-populate or fill manually</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* VIN Decoder */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              VIN Decoder
            </h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  VIN (17 characters) <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('vin')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none uppercase font-mono"
                  placeholder="1HGBH41JXMN109186"
                  maxLength={17}
                  onBlur={(e) => {
                    // Auto-decode when user finishes typing 17 characters
                    const vin = e.target.value;
                    if (vin && vin.length === 17 && !isDecoding) {
                      handleDecodeVIN();
                    }
                  }}
                />
                {errors.vin && (
                  <p className="text-red-500 text-xs mt-1">{errors.vin.message}</p>
                )}
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleDecodeVIN}
                  disabled={isDecoding || !vinValue || vinValue.length !== 17}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDecoding ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Decoding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Decode
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Stock Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('stockNumber')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="STK-001"
                />
                {errors.stockNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.stockNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="NEW">New</option>
                  <option value="USED">Used</option>
                  <option value="CERTIFIED">Certified Pre-Owned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Year <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('year', { valueAsNumber: true })}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 2}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="2024"
                />
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('make')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Ford"
                />
                {errors.make && (
                  <p className="text-red-500 text-xs mt-1">{errors.make.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('model')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="F-150"
                />
                {errors.model && (
                  <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Trim</label>
                <input
                  {...register('trim')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Lariat"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Body Style</label>
                <input
                  {...register('bodyStyle')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Crew Cab Pickup"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mileage</label>
                <input
                  {...register('mileage', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Exterior Color</label>
                <input
                  {...register('exteriorColor')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="White"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Interior Color</label>
                <input
                  {...register('interiorColor')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="SOLD">Sold</option>
                  <option value="PENDING">Pending</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="AT_AUCTION">At Auction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Condition</label>
                <select
                  {...register('condition')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="NEW">New</option>
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Car className="h-5 w-5 text-indigo-600" />
              Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Engine Type</label>
                <input
                  {...register('engineType')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="3.5L V6 EcoBoost"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Transmission</label>
                <input
                  {...register('transmission')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="10-Speed Automatic"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Drivetrain</label>
                <input
                  {...register('drivetrain')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="4WD"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fuel Type</label>
                <select
                  {...register('fuelType')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="GASOLINE">Gasoline</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="PLUGIN_HYBRID">Plug-in Hybrid</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Cost</label>
                <input
                  {...register('cost', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="35000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">List Price</label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="42000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">MSRP</label>
                <input
                  {...register('msrp', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="45000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Invoice Cost</label>
                <input
                  {...register('invoiceCost', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="33000.00"
                />
              </div>
            </div>
          </div>

          {/* Acquisition */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Acquisition</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Acquired From</label>
                <input
                  {...register('acquiredFrom')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Auction, Trade-in, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Acquisition Type</label>
                <select
                  {...register('acquisitionType')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="TRADE_IN">Trade-in</option>
                  <option value="AUCTION">Auction</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DEALER_TRANSFER">Dealer Transfer</option>
                  <option value="MANUFACTURER">Manufacturer</option>
                  <option value="LEASE_RETURN">Lease Return</option>
                  <option value="REPO">Repo</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                <input
                  {...register('location')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Lot A"
                />
              </div>
            </div>
          </div>

          {/* Certification */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Certification</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  {...register('certifiedPreOwned')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">Certified Pre-Owned</span>
              </label>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Certification Number</label>
                <input
                  {...register('certificationNumber')}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="CPO-12345"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
              placeholder="Additional notes..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Vehicle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

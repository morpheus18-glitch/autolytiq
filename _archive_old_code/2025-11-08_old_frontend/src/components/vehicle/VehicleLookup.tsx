/**
 * Vehicle Lookup Component
 *
 * Unified vehicle lookup with:
 * - VIN scanner (camera)
 * - VIN decoder
 * - Integration with universal search
 * - Quick add to inventory
 */

import { useState } from 'react';
import { Button } from '@repo/ui';
import { Input, Label } from '@repo/ui';
import { Card } from '@repo/ui';
import { Camera, Search, Loader, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import VINScanner from '../shared/VINScanner';

interface VehicleLookupProps {
  onVehicleSelect?: (vehicle: any) => void;
  onVINDecoded?: (decoded: any) => void;
  showAddToInventory?: boolean;
}

export default function VehicleLookup({
  onVehicleSelect,
  onVINDecoded,
  showAddToInventory = true,
}: VehicleLookupProps) {
  const [vin, setVin] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedVehicle, setDecodedVehicle] = useState<any>(null);
  const [existingVehicles, setExistingVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const handleVINScan = (scannedVIN: string) => {
    setVin(scannedVIN);
    setShowScanner(false);
    decodeVIN(scannedVIN);
  };

  const decodeVIN = async (vinToDecode?: string) => {
    const vinValue = vinToDecode || vin;

    if (!vinValue || vinValue.length !== 17) {
      setError('VIN must be exactly 17 characters');
      return;
    }

    setIsDecoding(true);
    setError(null);
    setDecodedVehicle(null);
    setExistingVehicles([]);

    try {
      // Call the dedicated VIN decoder endpoint
      const response = await fetch('/api/vin/decode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin: vinValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decode VIN');
      }

      if (!data.valid) {
        setError(data.errorMessage || 'Invalid VIN');
        return;
      }

      setDecodedVehicle(data);

      // Notify parent
      if (onVINDecoded) {
        onVINDecoded(data);
      }

      // Search for existing vehicles with this VIN
      await searchExistingVehicles(vinValue);
    } catch (err) {
      console.error('VIN decode error:', err);
      setError(err instanceof Error ? err.message : 'Failed to decode VIN');
    } finally {
      setIsDecoding(false);
    }
  };

  const searchExistingVehicles = async (vinValue: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: vinValue, limit: 10 }),
      });

      const data = await response.json();

      const vehicles = data.results.filter((r: any) => r.type === 'vehicle');
      setExistingVehicles(vehicles);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const formatVIN = (value: string) => {
    return value.replace(/[^A-HJ-NPR-Z0-9]/gi, '').toUpperCase().slice(0, 17);
  };

  const handleAddToInventory = () => {
    if (!decodedVehicle) return;

    // Navigate to add vehicle page with pre-filled data
    const params = new URLSearchParams({
      vin: decodedVehicle.vin,
      year: decodedVehicle.year?.toString() || '',
      make: decodedVehicle.make || '',
      model: decodedVehicle.model || '',
      trim: decodedVehicle.trim || '',
    });

    window.location.href = `/inventory/add?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      {/* VIN Input */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="vin-input">Vehicle Identification Number (VIN)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="vin-input"
                value={vin}
                onChange={(e) => setVin(formatVIN(e.target.value))}
                placeholder="Enter 17-character VIN"
                maxLength={17}
                className="font-mono text-lg flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    decodeVIN();
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowScanner(true)}
                title="Scan VIN with camera"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => decodeVIN()}
                disabled={isDecoding || vin.length !== 17}
              >
                {isDecoding ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Decoding...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Decode
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">{vin.length}/17 characters</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Decoded Vehicle Info */}
      {decodedVehicle && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">VIN Decoded Successfully</h3>
            </div>
            {decodedVehicle.source === 'cache' && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Cached
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Vehicle</Label>
              <p className="text-lg font-semibold mt-1">
                {decodedVehicle.year} {decodedVehicle.make} {decodedVehicle.model}
              </p>
              {decodedVehicle.trim && (
                <p className="text-sm text-gray-600">{decodedVehicle.trim}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">VIN</Label>
              <p className="text-sm font-mono mt-1">{decodedVehicle.vin}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {decodedVehicle.bodyStyle && (
              <div>
                <Label className="text-xs text-gray-600">Body Style</Label>
                <p className="font-medium">{decodedVehicle.bodyStyle}</p>
              </div>
            )}
            {decodedVehicle.engineType && (
              <div>
                <Label className="text-xs text-gray-600">Engine</Label>
                <p className="font-medium">{decodedVehicle.engineType}</p>
              </div>
            )}
            {decodedVehicle.transmission && (
              <div>
                <Label className="text-xs text-gray-600">Transmission</Label>
                <p className="font-medium">{decodedVehicle.transmission}</p>
              </div>
            )}
            {decodedVehicle.driveType && (
              <div>
                <Label className="text-xs text-gray-600">Drive Type</Label>
                <p className="font-medium">{decodedVehicle.driveType}</p>
              </div>
            )}
          </div>

          {showAddToInventory && existingVehicles.length === 0 && (
            <div className="mt-4 pt-4 border-t border-green-300">
              <Button
                onClick={handleAddToInventory}
                className="w-full"
                variant="primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Inventory
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Existing Vehicles */}
      {existingVehicles.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            Found {existingVehicles.length} vehicle(s) in inventory
          </h3>
          <div className="space-y-2">
            {existingVehicles.map((vehicle: any) => (
              <div
                key={vehicle.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                onClick={() => onVehicleSelect?.(vehicle.data)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {vehicle.data.year} {vehicle.data.make} {vehicle.data.model}
                    </p>
                    <p className="text-sm text-gray-600">
                      Stock: {vehicle.data.stockNumber} • VIN: {vehicle.data.vin}
                    </p>
                  </div>
                  <div className="text-right">
                    {vehicle.data.price && (
                      <p className="font-semibold">
                        ${(vehicle.data.price / 100).toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">{vehicle.data.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* VIN Scanner Modal */}
      {showScanner && (
        <VINScanner onScan={handleVINScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}

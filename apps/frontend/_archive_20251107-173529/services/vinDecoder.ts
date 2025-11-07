// VIN Decoder Service
// Uses NHTSA VIN Decoder API (free, no API key required)

export interface VINDecodeResult {
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  bodyStyle?: string;
  engineType?: string;
  transmission?: string;
  driveType?: string;
  fuelType?: string;
  doors?: number;
  manufacturer?: string;
  plant?: string;
  vehicleType?: string;
  errors?: string[];
}

// Validate VIN format
export function validateVIN(vin: string): { valid: boolean; error?: string } {
  const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

  if (cleanVIN.length !== 17) {
    return { valid: false, error: 'VIN must be exactly 17 characters' };
  }

  // VINs cannot contain I, O, or Q
  if (/[IOQ]/.test(cleanVIN)) {
    return { valid: false, error: 'VIN cannot contain letters I, O, or Q' };
  }

  return { valid: true };
}

// Decode VIN using our backend API (includes NHTSA + caching)
export async function decodeVIN(vin: string): Promise<VINDecodeResult> {
  const validation = validateVIN(vin);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid VIN');
  }

  const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

  try {
    // Use our backend API for VIN decoding (includes caching and better error handling)
    const response = await fetch('/api/vin/decode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vin: cleanVIN }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to decode VIN');
    }

    const data = await response.json();

    if (!data.valid) {
      throw new Error(data.errorMessage || 'Invalid VIN');
    }

    // Map backend response to our VINDecodeResult format
    const decoded: VINDecodeResult = {
      vin: data.vin,
      year: data.year,
      make: data.make,
      model: data.model,
      trim: data.trim,
      bodyStyle: data.bodyStyle,
      engineType: data.engineType,
      transmission: data.transmission,
      driveType: data.driveType,
      fuelType: data.fuelType,
      doors: data.doors,
      manufacturer: data.manufacturer,
      plant: data.plantCity && data.plantState
        ? `${data.plantCity}, ${data.plantState}`
        : undefined,
      vehicleType: data.vehicleType,
    };

    // Check for any errors from backend
    if (data.errorMessage) {
      decoded.errors = [data.errorMessage];
    }

    return decoded;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to decode VIN'
    );
  }
}

// Estimate vehicle value (simplified - in production, use actual valuation API)
export async function estimateVehicleValue(
  decoded: VINDecodeResult,
  mileage?: number,
  condition?: 'excellent' | 'good' | 'fair' | 'poor'
): Promise<{ trade: number; retail: number; wholesale: number }> {
  // This is a simplified estimation
  // In production, integrate with KBB, Edmunds, or Black Book API

  const baseYear = new Date().getFullYear();
  const vehicleAge = decoded.year ? baseYear - decoded.year : 0;

  // Rough depreciation curve (20% first year, 15% each year after)
  let estimatedRetail = 35000; // Default base value

  if (vehicleAge === 0) estimatedRetail *= 1.0;
  else if (vehicleAge === 1) estimatedRetail *= 0.80;
  else if (vehicleAge === 2) estimatedRetail *= 0.68;
  else if (vehicleAge === 3) estimatedRetail *= 0.58;
  else if (vehicleAge === 4) estimatedRetail *= 0.49;
  else if (vehicleAge === 5) estimatedRetail *= 0.42;
  else estimatedRetail *= Math.max(0.42 - (vehicleAge - 5) * 0.05, 0.15);

  // Adjust for mileage
  if (mileage) {
    const avgMilesPerYear = 12000;
    const expectedMiles = vehicleAge * avgMilesPerYear;
    const mileageDiff = mileage - expectedMiles;

    if (mileageDiff > 0) {
      // Higher than average mileage - reduce value
      estimatedRetail *= Math.max(1 - (mileageDiff / 100000) * 0.15, 0.70);
    } else if (mileageDiff < 0) {
      // Lower than average mileage - increase value
      estimatedRetail *= Math.min(1 + (Math.abs(mileageDiff) / 100000) * 0.10, 1.15);
    }
  }

  // Adjust for condition
  const conditionMultipliers = {
    excellent: 1.10,
    good: 1.00,
    fair: 0.85,
    poor: 0.70,
  };

  if (condition) {
    estimatedRetail *= conditionMultipliers[condition];
  }

  // Calculate trade and wholesale
  const trade = estimatedRetail * 0.75; // 75% of retail
  const wholesale = estimatedRetail * 0.65; // 65% of retail

  return {
    trade: Math.round(trade),
    retail: Math.round(estimatedRetail),
    wholesale: Math.round(wholesale),
  };
}

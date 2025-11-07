/**
 * VIN Decoder API
 *
 * Comprehensive VIN decoding with multiple providers:
 * - NHTSA (free, US government database)
 * - VIN Audit API (commercial, more detailed)
 * - Local cache for performance
 */

import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';
import { prisma } from '@repo/db';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();
router.use(authMiddleware);
router.use(tenantMiddleware);

// VIN validation schema
const vinSchema = z.object({
  vin: z.string().length(17).regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format'),
});

// VIN Decoder Response Type
export interface VINDecodeResponse {
  vin: string;
  valid: boolean;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  bodyStyle?: string;
  engineType?: string;
  engineCylinders?: number;
  engineLiters?: number;
  transmission?: string;
  driveType?: string;
  fuelType?: string;
  doors?: number;
  manufacturer?: string;
  manufacturerCountry?: string;
  plantCity?: string;
  plantState?: string;
  plantCountry?: string;
  vehicleType?: string;
  vehicleClass?: string;
  series?: string;
  abs?: string;
  airbags?: string;
  errorMessage?: string;
  source: 'nhtsa' | 'cache' | 'fallback';
  cachedAt?: string;
}

/**
 * Validate VIN format
 */
function validateVINFormat(vin: string): { valid: boolean; error?: string } {
  const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

  if (cleanVIN.length !== 17) {
    return { valid: false, error: 'VIN must be exactly 17 characters' };
  }

  // VINs cannot contain I, O, or Q (to avoid confusion with 1, 0)
  if (/[IOQ]/.test(cleanVIN)) {
    return { valid: false, error: 'VIN cannot contain letters I, O, or Q' };
  }

  return { valid: true };
}

/**
 * Decode VIN using NHTSA API (free, official US government database)
 */
async function decodeVINNHTSA(vin: string): Promise<VINDecodeResponse> {
  const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

  try {
    const response = await axios.get(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${cleanVIN}?format=json`,
      { timeout: 5000 }
    );

    if (!response.data.Results || response.data.Results.length === 0) {
      throw new Error('No results from NHTSA');
    }

    const result = response.data.Results[0];

    // Check for NHTSA errors
    if (result.ErrorCode && result.ErrorCode !== '0') {
      return {
        vin: cleanVIN,
        valid: false,
        errorMessage: result.ErrorText || 'Invalid VIN',
        source: 'nhtsa',
      };
    }

    // Extract engine info
    const engineCylinders = result.EngineCylinders
      ? parseInt(result.EngineCylinders)
      : undefined;
    const engineLiters = result.DisplacementL
      ? parseFloat(result.DisplacementL)
      : undefined;
    const engineType = [
      result.EngineConfiguration,
      result.EngineCylinders ? `${result.EngineCylinders} cyl` : '',
      result.DisplacementL ? `${result.DisplacementL}L` : '',
      result.EngineHP ? `${result.EngineHP}hp` : '',
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined;

    const decoded: VINDecodeResponse = {
      vin: cleanVIN,
      valid: !!(result.Make && result.Model && result.ModelYear),
      year: result.ModelYear ? parseInt(result.ModelYear) : undefined,
      make: result.Make || undefined,
      model: result.Model || undefined,
      trim: result.Trim || undefined,
      bodyStyle: result.BodyClass || undefined,
      engineType,
      engineCylinders,
      engineLiters,
      transmission: result.TransmissionStyle || undefined,
      driveType: result.DriveType || undefined,
      fuelType: result.FuelTypePrimary || undefined,
      doors: result.Doors ? parseInt(result.Doors) : undefined,
      manufacturer: result.Manufacturer || undefined,
      manufacturerCountry: result.ManufacturerCountry || undefined,
      plantCity: result.PlantCity || undefined,
      plantState: result.PlantState || undefined,
      plantCountry: result.PlantCountry || undefined,
      vehicleType: result.VehicleType || undefined,
      vehicleClass: result.VehicleType || undefined,
      series: result.Series || undefined,
      abs: result.ABS || undefined,
      airbags: result.AirBagLocCurtain || undefined,
      source: 'nhtsa',
    };

    return decoded;
  } catch (error) {
    console.error('NHTSA VIN decode error:', error);
    throw new Error('Failed to decode VIN from NHTSA');
  }
}

/**
 * Get cached VIN decode result
 */
async function getCachedVINDecode(vin: string): Promise<VINDecodeResponse | null> {
  try {
    // Check if we have a vehicle in our database with this VIN
    const vehicle = await prisma.vehicle.findFirst({
      where: { vin },
      select: {
        vin: true,
        year: true,
        make: true,
        model: true,
        trim: true,
        bodyStyle: true,
        engine: true,
        transmission: true,
        drivetrain: true,
        fuelType: true,
        updatedAt: true,
      },
    });

    if (vehicle) {
      return {
        vin: vehicle.vin,
        valid: true,
        year: vehicle.year || undefined,
        make: vehicle.make || undefined,
        model: vehicle.model || undefined,
        trim: vehicle.trim || undefined,
        bodyStyle: vehicle.bodyStyle || undefined,
        engineType: vehicle.engine || undefined,
        transmission: vehicle.transmission || undefined,
        driveType: vehicle.drivetrain || undefined,
        fuelType: vehicle.fuelType || undefined,
        source: 'cache',
        cachedAt: vehicle.updatedAt.toISOString(),
      };
    }

    return null;
  } catch (error) {
    console.error('Cache lookup error:', error);
    return null;
  }
}

/**
 * Save VIN decode result to cache (as a vehicle record)
 */
async function cacheVINDecode(decoded: VINDecodeResponse, tenantId: string) {
  try {
    if (!decoded.valid || !decoded.year || !decoded.make || !decoded.model) {
      return; // Don't cache invalid decodes
    }

    // Check if vehicle already exists
    const existing = await prisma.vehicle.findFirst({
      where: { vin: decoded.vin },
    });

    if (existing) {
      return; // Already in database
    }

    // Create a placeholder vehicle record for caching purposes
    await prisma.vehicle.create({
      data: {
        tenantId,
        vin: decoded.vin,
        year: decoded.year,
        make: decoded.make,
        model: decoded.model,
        trim: decoded.trim || null,
        bodyStyle: decoded.bodyStyle || null,
        engine: decoded.engineType || null,
        transmission: decoded.transmission || null,
        drivetrain: decoded.driveType || null,
        fuelType: decoded.fuelType || null,
        status: 'PENDING', // Mark as pending since it's just from VIN decode
        type: 'NEW', // Default type
        // Don't set pricing or other fields - this is just a VIN decode cache
      },
    });
  } catch (error) {
    // Ignore cache errors - they're not critical
    console.error('Failed to cache VIN decode:', error);
  }
}

// =============================================================================
// POST /api/vin/decode - Decode VIN
// =============================================================================

router.post('/decode', async (req, res) => {
  try {
    const { vin } = vinSchema.parse(req.body);
    const tenantId = req.tenantId!;

    // 1. Validate VIN format
    const validation = validateVINFormat(vin);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        vin: vin.toUpperCase(),
        valid: false,
      });
    }

    const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

    // 2. Check cache first
    const cached = await getCachedVINDecode(cleanVIN);
    if (cached) {
      return res.json(cached);
    }

    // 3. Decode using NHTSA
    const decoded = await decodeVINNHTSA(cleanVIN);

    // 4. Cache the result if valid
    if (decoded.valid) {
      await cacheVINDecode(decoded, tenantId);
    }

    res.json(decoded);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('VIN decode error:', error);
    res.status(500).json({
      error: 'Failed to decode VIN',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// =============================================================================
// GET /api/vin/:vin - Decode VIN (alternative GET endpoint)
// =============================================================================

router.get('/:vin', async (req, res) => {
  try {
    const { vin } = vinSchema.parse({ vin: req.params.vin });
    const tenantId = req.tenantId!;

    const validation = validateVINFormat(vin);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
        vin: vin.toUpperCase(),
        valid: false,
      });
    }

    const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

    // Check cache
    const cached = await getCachedVINDecode(cleanVIN);
    if (cached) {
      return res.json(cached);
    }

    // Decode
    const decoded = await decodeVINNHTSA(cleanVIN);

    // Cache if valid
    if (decoded.valid) {
      await cacheVINDecode(decoded, tenantId);
    }

    res.json(decoded);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('VIN decode error:', error);
    res.status(500).json({
      error: 'Failed to decode VIN',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// =============================================================================
// POST /api/vin/bulk-decode - Bulk decode multiple VINs
// =============================================================================

router.post('/bulk-decode', async (req, res) => {
  try {
    const { vins } = z
      .object({
        vins: z.array(z.string().length(17)).max(50), // Limit to 50 VINs at once
      })
      .parse(req.body);

    const tenantId = req.tenantId!;

    const results = await Promise.allSettled(
      vins.map(async (vin) => {
        const validation = validateVINFormat(vin);
        if (!validation.valid) {
          return {
            vin: vin.toUpperCase(),
            valid: false,
            error: validation.error,
          };
        }

        const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

        // Check cache
        const cached = await getCachedVINDecode(cleanVIN);
        if (cached) return cached;

        // Decode
        const decoded = await decodeVINNHTSA(cleanVIN);

        // Cache if valid
        if (decoded.valid) {
          await cacheVINDecode(decoded, tenantId);
        }

        return decoded;
      })
    );

    const decoded = results.map((r) =>
      r.status === 'fulfilled'
        ? r.value
        : { vin: '', valid: false, error: 'Failed to decode' }
    );

    res.json({ results: decoded });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Bulk VIN decode error:', error);
    res.status(500).json({ error: 'Failed to decode VINs' });
  }
});

export default router;

/**
 * useVINDecoder Hook
 *
 * Auto-fill vehicle information when VIN is entered
 * Works with appraisal forms, trade-in forms, and inventory forms
 */

import { useState, useCallback } from 'react';

export interface VINDecodeResult {
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
  vehicleType?: string;
  source?: 'nhtsa' | 'cache' | 'fallback';
  errorMessage?: string;
}

export interface UseVINDecoderOptions {
  onSuccess?: (decoded: VINDecodeResult) => void;
  onError?: (error: string) => void;
  autoFillFields?: boolean; // If true, returns field mapping for form auto-fill
}

export function useVINDecoder(options: UseVINDecoderOptions = {}) {
  const [isDecoding, setIsDecoding] = useState(false);
  const [decodedData, setDecodedData] = useState<VINDecodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate VIN format before sending to API
   */
  const validateVIN = (vin: string): { valid: boolean; error?: string } => {
    const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

    if (cleanVIN.length !== 17) {
      return { valid: false, error: 'VIN must be exactly 17 characters' };
    }

    // VINs cannot contain I, O, or Q
    if (/[IOQ]/.test(cleanVIN)) {
      return { valid: false, error: 'VIN cannot contain letters I, O, or Q' };
    }

    return { valid: true };
  };

  /**
   * Decode VIN and auto-fill vehicle information
   */
  const decodeVIN = useCallback(
    async (vin: string): Promise<VINDecodeResult | null> => {
      // Validate format first
      const validation = validateVIN(vin);
      if (!validation.valid) {
        setError(validation.error || 'Invalid VIN');
        if (options.onError) {
          options.onError(validation.error || 'Invalid VIN');
        }
        return null;
      }

      const cleanVIN = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

      setIsDecoding(true);
      setError(null);
      setDecodedData(null);

      try {
        const response = await fetch('/api/vin/decode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vin: cleanVIN }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to decode VIN');
        }

        if (!data.valid) {
          const errorMsg = data.errorMessage || 'Invalid VIN';
          setError(errorMsg);
          if (options.onError) {
            options.onError(errorMsg);
          }
          return null;
        }

        // Success - store decoded data
        setDecodedData(data);

        if (options.onSuccess) {
          options.onSuccess(data);
        }

        return data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to decode VIN';
        setError(errorMsg);
        if (options.onError) {
          options.onError(errorMsg);
        }
        return null;
      } finally {
        setIsDecoding(false);
      }
    },
    [options]
  );

  /**
   * Convert decoded VIN data to form field values
   * This is useful for auto-filling React Hook Form or similar
   */
  const getFormFields = useCallback((decoded: VINDecodeResult | null) => {
    if (!decoded || !decoded.valid) return {};

    return {
      vin: decoded.vin,
      year: decoded.year,
      make: decoded.make,
      model: decoded.model,
      trim: decoded.trim || '',
      bodyStyle: decoded.bodyStyle || '',
      bodyType: decoded.bodyStyle || '', // Some forms use bodyType
      engine: decoded.engineType || '',
      engineType: decoded.engineType || '',
      engineCylinders: decoded.engineCylinders,
      transmission: decoded.transmission || '',
      drivetrain: decoded.driveType || '',
      driveType: decoded.driveType || '',
      fuelType: decoded.fuelType || '',
      doors: decoded.doors,
    };
  }, []);

  /**
   * Clear decoded data and errors
   */
  const reset = useCallback(() => {
    setDecodedData(null);
    setError(null);
    setIsDecoding(false);
  }, []);

  return {
    decodeVIN,
    isDecoding,
    decodedData,
    error,
    validateVIN,
    getFormFields,
    reset,
  };
}

/**
 * Format VIN input (uppercase, remove invalid characters)
 */
export function formatVINInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, '') // Remove I, O, Q and non-alphanumeric
    .slice(0, 17); // Max 17 characters
}

/**
 * Get character count display for VIN input
 */
export function getVINCharCount(vin: string): string {
  return `${vin.length}/17`;
}

/**
 * Check if VIN is complete (17 characters)
 */
export function isVINComplete(vin: string): boolean {
  return vin.length === 17;
}

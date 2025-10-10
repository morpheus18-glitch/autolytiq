/**
 * VIN → Stock Number Service
 * 
 * Automatically generates stock numbers from VINs and manages overrides.
 * Default: Last 8 characters of VIN, uppercase.
 * Allows manual override with uniqueness validation.
 */

export class VinStockService {
  /**
   * Derives a stock number from a VIN
   * @param vin - 17-character VIN
   * @returns Stock number (last 8 chars, uppercase)
   */
  static deriveStockFromVin(vin: string): string {
    if (!vin || vin.length !== 17) {
      throw new Error('VIN must be exactly 17 characters');
    }
    
    // Return last 8 characters, uppercase
    return vin.slice(-8).toUpperCase();
  }

  /**
   * Validates VIN format
   * @param vin - VIN to validate
   * @returns true if valid, false otherwise
   */
  static validateVin(vin: string): boolean {
    if (!vin || vin.length !== 17) {
      return false;
    }
    
    // VIN cannot contain I, O, or Q
    const invalidChars = /[IOQ]/i;
    if (invalidChars.test(vin)) {
      return false;
    }
    
    // Must be alphanumeric
    const validFormat = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return validFormat.test(vin);
  }

  /**
   * Checks if a VIN checksum is valid (9th digit)
   * @param vin - 17-character VIN
   * @returns true if checksum is valid
   */
  static validateVinChecksum(vin: string): boolean {
    if (!this.validateVin(vin)) {
      return false;
    }

    const transliterate: Record<string, number> = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
      J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
      S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
      '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    };

    const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      const char = vin[i].toUpperCase();
      const value = transliterate[char];
      if (value === undefined) return false;
      sum += value * weights[i];
    }

    const checkDigit = sum % 11;
    const expectedCheck = vin[8];
    
    if (checkDigit === 10) {
      return expectedCheck === 'X';
    } else {
      return expectedCheck === checkDigit.toString();
    }
  }

  /**
   * Decodes basic VIN information
   * @param vin - 17-character VIN
   * @returns Decoded VIN data
   */
  static decodeVin(vin: string): {
    wmi: string;          // World Manufacturer Identifier (positions 1-3)
    vds: string;          // Vehicle Descriptor Section (positions 4-8)
    checkDigit: string;   // Check digit (position 9)
    modelYear: string;    // Model year (position 10)
    plant: string;        // Assembly plant (position 11)
    serial: string;       // Serial number (positions 12-17)
    isValid: boolean;
  } {
    if (!this.validateVin(vin)) {
      throw new Error('Invalid VIN format');
    }

    const vinUpper = vin.toUpperCase();
    
    return {
      wmi: vinUpper.slice(0, 3),
      vds: vinUpper.slice(3, 8),
      checkDigit: vinUpper[8],
      modelYear: vinUpper[9],
      plant: vinUpper[10],
      serial: vinUpper.slice(11, 17),
      isValid: this.validateVinChecksum(vin),
    };
  }

  /**
   * Formats a stock number consistently
   * @param stockNo - Stock number to format
   * @returns Formatted stock number (uppercase, trimmed)
   */
  static formatStockNumber(stockNo: string): string {
    return stockNo.trim().toUpperCase();
  }
}

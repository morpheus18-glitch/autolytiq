import { Request, Response } from 'express';

interface VINDecodedData {
  make: string;
  model: string;
  year: number;
  trim?: string;
  bodyStyle?: string;
  engineType?: string;
  transmission?: string;
  fuelType?: string;
  drivetrain?: string;
  manufacturerName?: string;
  vehicleType?: string;
  plantCountry?: string;
  plantCity?: string;
  plantState?: string;
  series?: string;
  errorCode?: string;
  errorText?: string;
}

// NHTSA VIN Decoder Service (Free API)
export class VINDecoderService {
  private static readonly NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';
  
  static async decodeVIN(vin: string): Promise<VINDecodedData | null> {
    try {
      // Validate VIN format (17 characters, alphanumeric except I, O, Q)
      if (!this.validateVIN(vin)) {
        throw new Error('Invalid VIN format');
      }

      const response = await fetch(
        `${this.NHTSA_API_BASE}/decodevin/${vin}?format=json`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.Results || data.Results.length === 0) {
        throw new Error('No results found for this VIN');
      }

      // Parse NHTSA response
      const results = data.Results;
      const decodedData: VINDecodedData = {
        make: this.extractValue(results, 'Make'),
        model: this.extractValue(results, 'Model'),
        year: parseInt(this.extractValue(results, 'Model Year')) || new Date().getFullYear(),
        trim: this.extractValue(results, 'Trim'),
        bodyStyle: this.extractValue(results, 'Body Class'),
        engineType: this.extractValue(results, 'Engine Configuration'),
        transmission: this.extractValue(results, 'Transmission Style'),
        fuelType: this.extractValue(results, 'Fuel Type - Primary'),
        drivetrain: this.extractValue(results, 'Drive Type'),
        manufacturerName: this.extractValue(results, 'Manufacturer Name'),
        vehicleType: this.extractValue(results, 'Vehicle Type'),
        plantCountry: this.extractValue(results, 'Plant Country'),
        plantCity: this.extractValue(results, 'Plant City'),
        plantState: this.extractValue(results, 'Plant State'),
        series: this.extractValue(results, 'Series')
      };

      return decodedData;
    } catch (error) {
      console.error('VIN decoding error:', error);
      return null;
    }
  }

  private static extractValue(results: any[], variableName: string): string {
    const result = results.find(r => r.Variable === variableName);
    return result?.Value || '';
  }

  private static validateVIN(vin: string): boolean {
    // VIN must be exactly 17 characters
    if (vin.length !== 17) return false;
    
    // VIN cannot contain I, O, or Q
    if (/[IOQ]/.test(vin.toUpperCase())) return false;
    
    // VIN must be alphanumeric
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin.toUpperCase())) return false;
    
    return true;
  }

  // Alternative free VIN decoder (backup)
  static async decodeVINAlternative(vin: string): Promise<VINDecodedData | null> {
    try {
      if (!this.validateVIN(vin)) {
        throw new Error('Invalid VIN format');
      }

      // Basic VIN decoding using VIN structure
      const year = this.decodeYear(vin.charAt(9));
      const make = this.decodeMake(vin.substring(0, 3));
      
      return {
        make: make || 'Unknown',
        model: 'Unknown',
        year: year || new Date().getFullYear()
      };
    } catch (error) {
      console.error('Alternative VIN decoding error:', error);
      return null;
    }
  }

  private static decodeYear(yearCode: string): number {
    const yearMap: { [key: string]: number } = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
      'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
      'Y': 2030, 'Z': 2031,
      '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
      '6': 2006, '7': 2007, '8': 2008, '9': 2009
    };
    
    return yearMap[yearCode.toUpperCase()] || new Date().getFullYear();
  }

  private static decodeMake(wmi: string): string {
    const makeMap: { [key: string]: string } = {
      '1HG': 'Honda', '1HT': 'Honda', '2HG': 'Honda', '3HG': 'Honda',
      '4T1': 'Toyota', '4T3': 'Toyota', '5TD': 'Toyota', '5TF': 'Toyota',
      '1FT': 'Ford', '1FA': 'Ford', '1FB': 'Ford', '1FC': 'Ford',
      '1G1': 'Chevrolet', '1G6': 'Chevrolet', '1GC': 'Chevrolet',
      '1J4': 'Jeep', '1J8': 'Jeep',
      'WBA': 'BMW', 'WBS': 'BMW', 'WBX': 'BMW',
      'WDB': 'Mercedes-Benz', 'WDC': 'Mercedes-Benz', 'WDD': 'Mercedes-Benz',
      'WAU': 'Audi', 'WA1': 'Audi'
    };
    
    // Try exact match first
    if (makeMap[wmi]) return makeMap[wmi];
    
    // Try first two characters
    const twoChar = wmi.substring(0, 2);
    for (const [key, value] of Object.entries(makeMap)) {
      if (key.startsWith(twoChar)) return value;
    }
    
    return 'Unknown';
  }
}

// Express route handler
export async function decodeVINHandler(req: Request, res: Response) {
  try {
    const { vin } = req.params;
    
    if (!vin) {
      return res.status(400).json({ error: 'VIN is required' });
    }

    const decodedData = await VINDecoderService.decodeVIN(vin);
    
    if (!decodedData) {
      // Try alternative decoder
      const alternativeData = await VINDecoderService.decodeVINAlternative(vin);
      if (alternativeData) {
        return res.json(alternativeData);
      }
      return res.status(404).json({ error: 'Unable to decode VIN' });
    }

    res.json(decodedData);
  } catch (error) {
    console.error('VIN decode handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
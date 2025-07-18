// Free Vehicle Valuation Service
// Integrates multiple free APIs for comprehensive vehicle valuations

interface VehicleSpec {
  make: string;
  model: string;
  year: number;
  vin?: string;
  trim?: string;
  mileage?: number;
}

interface ValuationData {
  source: string;
  tradeInValue?: number;
  retailValue?: number;
  privatePartyValue?: number;
  marketValue?: number;
  lastUpdated: string;
  confidence?: string;
  dataPoints?: number;
}

interface VINDecodeData {
  make: string;
  model: string;
  year: number;
  trim?: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  bodyType?: string;
  doors?: number;
  drivetrain?: string;
}

// NHTSA vPIC API - 100% Free VIN Decoder
export async function decodeVIN(vin: string): Promise<VINDecodeData | null> {
  try {
    const cleanVIN = vin.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    if (cleanVIN.length !== 17) {
      throw new Error('Invalid VIN length');
    }

    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${cleanVIN}?format=json`
    );
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      return null;
    }

    // Extract relevant fields from NHTSA response
    const results = data.Results;
    const getValue = (variableName: string) => {
      const item = results.find((r: any) => r.Variable === variableName);
      return item?.Value || null;
    };

    const decodedData = {
      make: getValue('Make') || '',
      model: getValue('Model') || '',
      year: parseInt(getValue('Model Year') || '0'),
      trim: getValue('Trim') || getValue('Series') || undefined,
      engine: getValue('Engine Configuration') || getValue('Engine Number of Cylinders') || getValue('Displacement (L)') || undefined,
      transmission: getValue('Transmission Style') || getValue('Transmission Speeds') || undefined,
      fuelType: getValue('Fuel Type - Primary') || getValue('Fuel Type - Secondary') || undefined,
      bodyType: getValue('Body Class') || getValue('Vehicle Type') || undefined,
      doors: parseInt(getValue('Doors') || '0') || parseInt(getValue('Number of Doors') || '0') || undefined,
      drivetrain: getValue('Drive Type') || getValue('Wheel Base Type') || undefined,
    };

    console.log('🔍 VIN Decoded:', JSON.stringify(decodedData, null, 2));
    return decodedData;
  } catch (error) {
    console.error('VIN decode error:', error);
    return null;
  }
}

// VinCheck.info API - Free Vehicle Valuation
export async function getVinCheckValuation(vin: string): Promise<ValuationData | null> {
  try {
    const cleanVIN = vin.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // VinCheck.info free API endpoint
    const response = await fetch(
      `https://vincheck.info/api/v1/value?vin=${cleanVIN}`,
      {
        headers: {
          'User-Agent': 'AutolytiQ-Dealership-System/1.0',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('VinCheck API rate limit reached');
        return null;
      }
      throw new Error(`VinCheck API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.value) {
      return null;
    }

    return {
      source: 'VinCheck.info',
      marketValue: data.value.market_value || undefined,
      tradeInValue: data.value.trade_in || undefined,
      retailValue: data.value.retail || undefined,
      privatePartyValue: data.value.private_party || undefined,
      lastUpdated: new Date().toISOString(),
      confidence: data.value.confidence || 'medium',
      dataPoints: data.value.data_points || 0
    };
  } catch (error) {
    console.error('VinCheck valuation error:', error);
    return null;
  }
}

// Alternative Market Data - Using public sources
export async function getMarketValuation(vehicle: VehicleSpec): Promise<ValuationData | null> {
  try {
    // Estimate based on market trends and depreciation models
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicle.year;
    
    // Basic depreciation calculation (industry standard approximation)
    let depreciationRate = 0.15; // 15% first year
    if (age > 1) {
      depreciationRate = 0.15 + (age - 1) * 0.12; // 12% subsequent years
    }
    
    // Luxury vs economy multipliers
    const luxuryBrands = ['mercedes', 'bmw', 'audi', 'lexus', 'acura', 'infiniti', 'cadillac'];
    const economyBrands = ['honda', 'toyota', 'nissan', 'hyundai', 'kia', 'mazda'];
    
    const makeLower = vehicle.make.toLowerCase();
    let baseValue = 25000; // Average new car price
    
    if (luxuryBrands.includes(makeLower)) {
      baseValue = 45000;
    } else if (economyBrands.includes(makeLower)) {
      baseValue = 22000;
    }
    
    // Apply depreciation
    const currentValue = baseValue * (1 - Math.min(depreciationRate, 0.8));
    
    // Mileage adjustment (if provided)
    let mileageAdjustment = 1.0;
    if (vehicle.mileage) {
      const avgMileagePerYear = 12000;
      const expectedMileage = age * avgMileagePerYear;
      const mileageDifference = vehicle.mileage - expectedMileage;
      
      // Adjust value based on mileage ($0.10 per mile over/under average)
      mileageAdjustment = 1 - (mileageDifference * 0.10) / currentValue;
    }
    
    const adjustedValue = Math.max(currentValue * mileageAdjustment, 1000);
    
    return {
      source: 'Market Estimation',
      marketValue: Math.round(adjustedValue),
      tradeInValue: Math.round(adjustedValue * 0.85), // Typically 85% of market
      retailValue: Math.round(adjustedValue * 1.15), // Typically 115% of market
      privatePartyValue: Math.round(adjustedValue * 1.05), // Typically 105% of market
      lastUpdated: new Date().toISOString(),
      confidence: 'estimated',
      dataPoints: 1
    };
  } catch (error) {
    console.error('Market valuation error:', error);
    return null;
  }
}

// Comprehensive valuation using multiple sources
export async function getComprehensiveValuation(vin: string): Promise<{
  vinData: VINDecodeData | null;
  valuations: ValuationData[];
  averageMarketValue?: number;
  recommendedPrice?: number;
}> {
  try {
    console.log(`🔍 Getting comprehensive valuation for VIN: ${vin}`);
    
    // Step 1: Decode VIN for vehicle specifications
    const vinData = await decodeVIN(vin);
    console.log('✅ VIN decoded:', vinData?.make, vinData?.model, vinData?.year);
    
    const valuations: ValuationData[] = [];
    
    // Step 2: Try VinCheck.info for real market data
    const vinCheckVal = await getVinCheckValuation(vin);
    if (vinCheckVal) {
      valuations.push(vinCheckVal);
      console.log('✅ VinCheck valuation obtained');
    }
    
    // Step 3: Generate market estimation if we have vehicle specs
    if (vinData && vinData.make && vinData.model && vinData.year) {
      const marketVal = await getMarketValuation({
        make: vinData.make,
        model: vinData.model,
        year: vinData.year,
        vin: vin
      });
      
      if (marketVal) {
        valuations.push(marketVal);
        console.log('✅ Market estimation calculated');
      }
    }
    
    // Step 4: Calculate averages and recommendations
    let averageMarketValue: number | undefined;
    let recommendedPrice: number | undefined;
    
    if (valuations.length > 0) {
      const marketValues = valuations
        .map(v => v.marketValue)
        .filter((v): v is number => v !== undefined);
        
      if (marketValues.length > 0) {
        averageMarketValue = Math.round(
          marketValues.reduce((sum, val) => sum + val, 0) / marketValues.length
        );
        
        // Recommended dealer price (competitive but profitable)
        recommendedPrice = Math.round(averageMarketValue * 1.08); // 8% markup
      }
    }
    
    console.log(`📊 Valuation complete: ${valuations.length} sources, avg: $${averageMarketValue}`);
    
    return {
      vinData,
      valuations,
      averageMarketValue,
      recommendedPrice
    };
  } catch (error) {
    console.error('Comprehensive valuation error:', error);
    return {
      vinData: null,
      valuations: [],
    };
  }
}

// Quick valuation by make/model/year (when VIN not available)
export async function getQuickValuation(
  make: string, 
  model: string, 
  year: number, 
  mileage?: number
): Promise<ValuationData | null> {
  return await getMarketValuation({ make, model, year, mileage });
}

// Batch valuation for multiple vehicles
export async function getBatchValuations(vins: string[]): Promise<{
  [vin: string]: {
    vinData: VINDecodeData | null;
    valuations: ValuationData[];
    averageMarketValue?: number;
  }
}> {
  const results: { [vin: string]: any } = {};
  
  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < vins.length; i += batchSize) {
    const batch = vins.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (vin) => {
      const result = await getComprehensiveValuation(vin);
      return { vin, result };
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    for (const { vin, result } of batchResults) {
      results[vin] = result;
    }
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < vins.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

export {
  type VehicleSpec,
  type ValuationData,
  type VINDecodeData
};
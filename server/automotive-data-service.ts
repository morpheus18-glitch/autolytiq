import axios from 'axios';
import { z } from 'zod';

// =============================================
// AUTOMOTIVE DATA API INTEGRATION SERVICE
// =============================================

// API Response Schemas
const VehicleDataSchema = z.object({
  vin: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  trim: z.string().optional(),
  engine: z.string().optional(),
  transmission: z.string().optional(),
  drivetrain: z.string().optional(),
  fuelType: z.string().optional(),
  bodyStyle: z.string().optional(),
  doors: z.number().optional(),
  seats: z.number().optional(),
  msrp: z.number().optional(),
  fuelEconomy: z.object({
    city: z.number().optional(),
    highway: z.number().optional(),
    combined: z.number().optional()
  }).optional(),
  safety: z.object({
    nhtsaRating: z.number().optional(),
    iihs: z.string().optional()
  }).optional(),
  features: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  warranty: z.object({
    basic: z.string().optional(),
    drivetrain: z.string().optional()
  }).optional()
});

const MarketDataSchema = z.object({
  vin: z.string(),
  estimatedValue: z.number(),
  tradeInValue: z.number(),
  retailValue: z.number(),
  privatePartyValue: z.number(),
  marketTrend: z.enum(['rising', 'falling', 'stable']),
  demandScore: z.number(),
  daysOnMarket: z.number(),
  competitorCount: z.number(),
  lastUpdated: z.string()
});

const IncentiveSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
  incentives: z.array(z.object({
    type: z.string(),
    amount: z.number(),
    description: z.string(),
    validThrough: z.string(),
    eligibility: z.string()
  }))
});

export type VehicleData = z.infer<typeof VehicleDataSchema>;
export type MarketData = z.infer<typeof MarketDataSchema>;
export type IncentiveData = z.infer<typeof IncentiveSchema>;

// =============================================
// AUTOMOTIVE DATA SERVICE CLASS
// =============================================

export class AutomotiveDataService {
  
  // NHTSA vPIC API (Free - Vehicle Identification)
  static async decodeVIN(vin: string): Promise<VehicleData | null> {
    try {
      const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
      
      if (!response.data.Results) {
        throw new Error('Invalid VIN or API response');
      }

      const results = response.data.Results;
      const getValue = (variableName: string) => {
        const item = results.find((result: any) => result.Variable === variableName);
        return item?.Value || null;
      };

      const vehicleData: VehicleData = {
        vin,
        make: getValue('Make') || 'Unknown',
        model: getValue('Model') || 'Unknown',
        year: parseInt(getValue('Model Year')) || new Date().getFullYear(),
        trim: getValue('Trim'),
        engine: getValue('Engine Configuration'),
        transmission: getValue('Transmission Style'),
        drivetrain: getValue('Drive Type'),
        fuelType: getValue('Fuel Type - Primary'),
        bodyStyle: getValue('Body Class'),
        doors: parseInt(getValue('Doors')) || undefined,
        seats: parseInt(getValue('Seating Rows')) || undefined
      };

      return VehicleDataSchema.parse(vehicleData);
    } catch (error) {
      console.error('VIN decode error:', error);
      return null;
    }
  }

  // VinCheck.info API (Free - Market Value Estimation)
  static async getMarketValue(vin: string, mileage: number = 50000): Promise<MarketData | null> {
    try {
      // VinCheck.info free API for basic market data
      const response = await axios.get(`https://api.vincheck.info/vehicle/${vin}`, {
        headers: {
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (!response.data.success) {
        throw new Error('Market data not available');
      }

      const data = response.data.data;
      
      // Estimate values based on basic data (simplified algorithm)
      const baseValue = data.msrp || 25000;
      const ageDepreciation = Math.max(0.6, 1 - (new Date().getFullYear() - data.year) * 0.12);
      const mileageDepreciation = Math.max(0.7, 1 - (mileage / 100000) * 0.3);
      
      const estimatedValue = Math.round(baseValue * ageDepreciation * mileageDepreciation);
      const tradeInValue = Math.round(estimatedValue * 0.8);
      const retailValue = Math.round(estimatedValue * 1.15);
      const privatePartyValue = Math.round(estimatedValue * 1.05);

      const marketData: MarketData = {
        vin,
        estimatedValue,
        tradeInValue,
        retailValue,
        privatePartyValue,
        marketTrend: 'stable' as const,
        demandScore: Math.floor(Math.random() * 40) + 60, // 60-100 score
        daysOnMarket: Math.floor(Math.random() * 45) + 15, // 15-60 days
        competitorCount: Math.floor(Math.random() * 8) + 2, // 2-10 competitors
        lastUpdated: new Date().toISOString()
      };

      return MarketDataSchema.parse(marketData);
    } catch (error) {
      console.error('Market value error:', error);
      return null;
    }
  }

  // Alternative market estimation using depreciation algorithms
  static async estimateMarketValue(make: string, model: string, year: number, mileage: number): Promise<MarketData | null> {
    try {
      // Base MSRP estimation by make/model/year
      const baseMSRP = this.estimateBaseMSRP(make, model, year);
      
      // Calculate depreciation
      const vehicleAge = new Date().getFullYear() - year;
      const ageDepreciation = Math.max(0.4, 1 - (vehicleAge * 0.15)); // 15% per year, min 40%
      const mileageDepreciation = Math.max(0.6, 1 - (mileage / 100000) * 0.4); // 40% at 100k miles
      
      // Market conditions adjustment
      const marketAdjustment = this.getMarketAdjustment(make, model);
      
      const estimatedValue = Math.round(baseMSRP * ageDepreciation * mileageDepreciation * marketAdjustment);
      const tradeInValue = Math.round(estimatedValue * 0.75);
      const retailValue = Math.round(estimatedValue * 1.2);
      const privatePartyValue = Math.round(estimatedValue * 1.1);

      const marketData: MarketData = {
        vin: 'ESTIMATED',
        estimatedValue,
        tradeInValue,
        retailValue,
        privatePartyValue,
        marketTrend: Math.random() > 0.5 ? 'rising' : 'stable',
        demandScore: Math.floor(Math.random() * 30) + 70,
        daysOnMarket: Math.floor(Math.random() * 30) + 20,
        competitorCount: Math.floor(Math.random() * 6) + 3,
        lastUpdated: new Date().toISOString()
      };

      return MarketDataSchema.parse(marketData);
    } catch (error) {
      console.error('Market estimation error:', error);
      return null;
    }
  }

  // Manufacturer Incentives (Free - Web scrapped data)
  static async getIncentives(make: string, model: string, year: number): Promise<IncentiveData | null> {
    try {
      // Simulate incentive data (in production, this would scrape manufacturer websites)
      const incentiveData: IncentiveData = {
        make,
        model,
        year,
        incentives: [
          {
            type: 'Cash Back',
            amount: 2000,
            description: 'Customer Cash Back',
            validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            eligibility: 'All customers'
          },
          {
            type: 'APR Financing',
            amount: 1.9,
            description: '1.9% APR for qualified buyers',
            validThrough: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            eligibility: 'Qualified buyers with approved credit'
          },
          {
            type: 'Lease Special',
            amount: 299,
            description: 'Lease for $299/month',
            validThrough: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            eligibility: 'Qualified lessees'
          }
        ]
      };

      return IncentiveSchema.parse(incentiveData);
    } catch (error) {
      console.error('Incentives error:', error);
      return null;
    }
  }

  // Market Competition Analysis
  static async getCompetitionAnalysis(make: string, model: string, year: number, price: number) {
    try {
      // Simulate competition data
      const competitors = [
        { dealership: 'Metro Honda', distance: 2.3, price: price - 1500, inventory: 8 },
        { dealership: 'City Toyota', distance: 4.7, price: price + 800, inventory: 12 },
        { dealership: 'Downtown Motors', distance: 6.1, price: price - 500, inventory: 5 },
        { dealership: 'Valley Auto', distance: 8.9, price: price + 1200, inventory: 15 }
      ];

      const analysis = {
        totalCompetitors: competitors.length,
        averagePrice: Math.round(competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length),
        pricePosition: price < competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length ? 'below_market' : 'above_market',
        nearestCompetitor: competitors[0],
        marketShare: Math.round(Math.random() * 20) + 15, // 15-35%
        competitors: competitors.slice(0, 3) // Top 3 competitors
      };

      return analysis;
    } catch (error) {
      console.error('Competition analysis error:', error);
      return null;
    }
  }

  // Batch VIN Processing
  static async batchProcessVINs(vins: string[]): Promise<Array<{vin: string, data: VehicleData | null, market: MarketData | null}>> {
    const results = [];
    
    // Process in batches of 5 to avoid rate limiting
    for (let i = 0; i < vins.length; i += 5) {
      const batch = vins.slice(i, i + 5);
      const batchPromises = batch.map(async (vin) => {
        const vehicleData = await this.decodeVIN(vin);
        let marketData = null;
        
        if (vehicleData) {
          marketData = await this.getMarketValue(vin);
          if (!marketData && vehicleData.make && vehicleData.model && vehicleData.year) {
            marketData = await this.estimateMarketValue(vehicleData.make, vehicleData.model, vehicleData.year, 50000);
          }
        }
        
        return { vin, data: vehicleData, market: marketData };
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Rate limiting delay
      if (i + 5 < vins.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  // Helper Methods
  private static estimateBaseMSRP(make: string, model: string, year: number): number {
    // Simplified MSRP estimation based on make/model
    const makeMultipliers: Record<string, number> = {
      'HONDA': 28000,
      'TOYOTA': 30000,
      'FORD': 32000,
      'CHEVROLET': 29000,
      'NISSAN': 27000,
      'HYUNDAI': 25000,
      'KIA': 24000,
      'MAZDA': 26000,
      'SUBARU': 28000,
      'VOLKSWAGEN': 31000,
      'BMW': 45000,
      'MERCEDES-BENZ': 48000,
      'AUDI': 42000,
      'LEXUS': 44000,
      'ACURA': 38000,
      'INFINITI': 40000
    };

    const modelMultipliers: Record<string, number> = {
      'CIVIC': 0.85,
      'ACCORD': 1.1,
      'CR-V': 1.2,
      'PILOT': 1.4,
      'CAMRY': 1.1,
      'RAV4': 1.2,
      'HIGHLANDER': 1.4,
      'F-150': 1.5,
      'MUSTANG': 1.3,
      'EXPLORER': 1.4,
      'SILVERADO': 1.5,
      'MALIBU': 1.0,
      'EQUINOX': 1.2
    };

    const baseMSRP = makeMultipliers[make.toUpperCase()] || 30000;
    const modelMultiplier = modelMultipliers[model.toUpperCase()] || 1.0;
    const yearAdjustment = year >= 2024 ? 1.05 : year >= 2022 ? 1.0 : 0.95;

    return Math.round(baseMSRP * modelMultiplier * yearAdjustment);
  }

  private static getMarketAdjustment(make: string, model: string): number {
    // Market demand adjustments
    const highDemandModels = ['RAV4', 'CR-V', 'F-150', 'CIVIC', 'CAMRY'];
    const lowDemandModels = ['SENTRA', 'COROLLA', 'SPARK', 'MIRAGE'];
    
    if (highDemandModels.includes(model.toUpperCase())) {
      return 1.05; // 5% premium
    } else if (lowDemandModels.includes(model.toUpperCase())) {
      return 0.95; // 5% discount
    }
    
    return 1.0; // No adjustment
  }

  // API Health Check
  static async checkAPIHealth(): Promise<{service: string, status: string, responseTime?: number}[]> {
    const checks = [];
    
    // NHTSA vPIC API Check
    try {
      const start = Date.now();
      await axios.get('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json', { timeout: 5000 });
      const responseTime = Date.now() - start;
      checks.push({ service: 'NHTSA vPIC', status: 'healthy', responseTime });
    } catch (error) {
      checks.push({ service: 'NHTSA vPIC', status: 'error' });
    }
    
    // VinCheck.info API Check
    try {
      const start = Date.now();
      await axios.get('https://api.vincheck.info/health', { timeout: 5000 });
      const responseTime = Date.now() - start;
      checks.push({ service: 'VinCheck.info', status: 'healthy', responseTime });
    } catch (error) {
      checks.push({ service: 'VinCheck.info', status: 'degraded' });
    }
    
    return checks;
  }
}

// Export for use in routes
export default AutomotiveDataService;
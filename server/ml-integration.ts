/**
 * ML Integration Layer for AutolytiQ
 * Provides vehicle pricing intelligence and competitive analysis
 */

interface VehiclePrediction {
  estimatedPrice: number;
  confidence: number;
  marketTrend: 'up' | 'down' | 'stable';
  similarVehicles: any[];
  priceRange: {
    low: number;
    high: number;
  };
}

interface CompetitivePricing {
  avgMarketPrice: number;
  competitorPrices: Array<{
    dealer: string;
    price: number;
    mileage: number;
    distance: number;
  }>;
  pricePosition: 'below' | 'at' | 'above';
  recommendation: string;
}

export class MLPricingService {
  private baseUrl: string;
  private fallbackEnabled: boolean = true;

  constructor() {
    this.baseUrl = process.env.ML_API_URL || 'http://localhost:5001';
  }

  async getVehiclePricing(vehicle: {
    make: string;
    model: string;
    year: number;
    mileage?: number;
    condition?: string;
  }): Promise<VehiclePrediction> {
    try {
      // Try ML backend first
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return this.formatPrediction(data);
      }
    } catch (error) {
      console.log('ML backend unavailable, using fallback pricing');
    }

    // Fallback to rule-based pricing
    return this.getFallbackPricing(vehicle);
  }

  async getCompetitivePricing(vehicle: {
    make: string;
    model: string;
    year: number;
    mileage?: number;
    zipCode?: string;
  }): Promise<CompetitivePricing> {
    try {
      const response = await fetch(`${this.baseUrl}/competitive-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return this.formatCompetitiveData(data);
      }
    } catch (error) {
      console.log('Competitive analysis unavailable, using sample data');
    }

    // Fallback to sample competitive data
    return this.getFallbackCompetitive(vehicle);
  }

  async getMarketTrends(filters?: {
    make?: string;
    bodyType?: string;
    priceRange?: { min: number; max: number };
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/market-trends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters || {}),
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Market trends unavailable, using fallback data');
    }

    // Fallback market trends
    return this.getFallbackMarketTrends();
  }

  private formatPrediction(data: any): VehiclePrediction {
    return {
      estimatedPrice: data.predicted_price || data.price,
      confidence: data.confidence || 0.85,
      marketTrend: data.trend || 'stable',
      similarVehicles: data.similar_vehicles || [],
      priceRange: {
        low: data.price_range?.low || (data.predicted_price * 0.9),
        high: data.price_range?.high || (data.predicted_price * 1.1)
      }
    };
  }

  private formatCompetitiveData(data: any): CompetitivePricing {
    return {
      avgMarketPrice: data.avg_market_price || data.averagePrice,
      competitorPrices: data.competitor_prices || data.competitors || [],
      pricePosition: data.price_position || 'at',
      recommendation: data.recommendation || 'Price is competitive with market'
    };
  }

  private getFallbackPricing(vehicle: any): VehiclePrediction {
    // Rule-based pricing using vehicle age, mileage, and market factors
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicle.year;
    const mileage = vehicle.mileage || 50000;

    // Base price lookup by make/model (simplified)
    const basePrices: Record<string, number> = {
      'Honda Civic': 25000,
      'Toyota Camry': 28000,
      'Ford F-150': 35000,
      'Chevrolet Silverado': 34000,
      'BMW 3 Series': 42000,
      'Mercedes-Benz C-Class': 45000,
      'Audi A4': 40000,
      'Lexus ES': 42000
    };

    const key = `${vehicle.make} ${vehicle.model}`;
    let basePrice = basePrices[key] || 30000;

    // Apply depreciation (10% per year for first 5 years, 5% thereafter)
    for (let i = 0; i < age; i++) {
      const depreciationRate = i < 5 ? 0.10 : 0.05;
      basePrice *= (1 - depreciationRate);
    }

    // Apply mileage factor (decrease value for high mileage)
    const avgMileagePerYear = 12000;
    const expectedMileage = age * avgMileagePerYear;
    const mileageDifference = mileage - expectedMileage;
    const mileageAdjustment = mileageDifference * -0.10; // -$0.10 per excess mile
    basePrice += mileageAdjustment;

    const estimatedPrice = Math.max(basePrice, 5000); // Minimum $5,000

    return {
      estimatedPrice: Math.round(estimatedPrice),
      confidence: 0.75, // Lower confidence for fallback
      marketTrend: 'stable',
      similarVehicles: [],
      priceRange: {
        low: Math.round(estimatedPrice * 0.85),
        high: Math.round(estimatedPrice * 1.15)
      }
    };
  }

  private getFallbackCompetitive(vehicle: any): CompetitivePricing {
    const estimatedPrice = this.getFallbackPricing(vehicle).estimatedPrice;
    
    // Generate sample competitive data
    const competitors = [
      { dealer: 'Central Auto', price: estimatedPrice * 0.95, mileage: (vehicle.mileage || 50000) + 5000, distance: 12 },
      { dealer: 'Metro Motors', price: estimatedPrice * 1.05, mileage: (vehicle.mileage || 50000) - 3000, distance: 8 },
      { dealer: 'Highway Cars', price: estimatedPrice * 0.98, mileage: (vehicle.mileage || 50000) + 2000, distance: 15 },
      { dealer: 'Premier Auto', price: estimatedPrice * 1.02, mileage: (vehicle.mileage || 50000) - 1000, distance: 20 }
    ];

    const avgMarketPrice = competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length;

    return {
      avgMarketPrice: Math.round(avgMarketPrice),
      competitorPrices: competitors.map(comp => ({
        ...comp,
        price: Math.round(comp.price)
      })),
      pricePosition: estimatedPrice < avgMarketPrice ? 'below' : estimatedPrice > avgMarketPrice ? 'above' : 'at',
      recommendation: `Vehicle is priced ${estimatedPrice < avgMarketPrice ? 'competitively below' : estimatedPrice > avgMarketPrice ? 'above' : 'at'} market average`
    };
  }

  private getFallbackMarketTrends() {
    return {
      overall_trend: 'stable',
      trending_makes: ['Toyota', 'Honda', 'Ford'],
      hot_segments: ['SUV', 'Truck', 'Electric'],
      price_movements: {
        'Toyota': { trend: 'up', change: 2.5 },
        'Honda': { trend: 'stable', change: 0.8 },
        'Ford': { trend: 'up', change: 1.2 }
      },
      market_insights: [
        'SUV segment showing strong demand',
        'Electric vehicle prices stabilizing',
        'Used car market remains competitive'
      ]
    };
  }
}

// Export singleton instance
export const mlPricingService = new MLPricingService();
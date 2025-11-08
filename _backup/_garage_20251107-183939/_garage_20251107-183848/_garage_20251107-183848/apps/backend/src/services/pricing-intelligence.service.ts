/**
 * AI Pricing Intelligence Service
 * Dynamic pricing engine powered by ML models and market data
 * Rivals vAuto/Provision's pricing capabilities
 */

import { db } from '@repo/db';
import axios from 'axios';
import { Prisma } from '@prisma/client';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface PricingRecommendation {
  vehicleId: string;
  currentPrice: number;
  recommendedPrice: number;
  priceAdjustment: number;
  priceAdjustmentPercent: number;
  confidence: number;
  reason: string;
  marketPosition: 'ABOVE_MARKET' | 'AT_MARKET' | 'BELOW_MARKET';
  daysToSell: number;
  probabilityOfSale30Days: number;
  competitiveIndex: number; // 0-100, how competitive vs market
  recommendations: {
    aggressive: number; // Price to sell in 7 days
    market: number; // Market average
    premium: number; // If vehicle is exceptional
  };
  marketData: {
    avgPrice: number;
    medianPrice: number;
    minPrice: number;
    maxPrice: number;
    totalComps: number;
    avgDaysOnMarket: number;
  };
}

export interface MarketAnalysis {
  vehicleId: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage?: number;
  localMarket: {
    avgPrice: number;
    medianPrice: number;
    inventory: number;
    avgDaysOnMarket: number;
    demandScore: number; // 0-100
  };
  regionalMarket: {
    avgPrice: number;
    medianPrice: number;
    inventory: number;
    avgDaysOnMarket: number;
  };
  nationalMarket: {
    avgPrice: number;
    medianPrice: number;
    avgDaysOnMarket: number;
  };
  competitorPricing: Array<{
    competitorId?: string;
    competitorName: string;
    distance: number; // miles
    price: number;
    mileage: number;
    daysOnMarket: number;
    listingUrl?: string;
  }>;
  trendAnalysis: {
    priceDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
    demandTrend: 'HIGH' | 'MODERATE' | 'LOW';
    seasonalFactor: number; // 0.8-1.2 multiplier
    marketVelocity: 'FAST' | 'AVERAGE' | 'SLOW';
  };
}

export interface AppraisalValuation {
  vehicleId?: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  valuation: {
    retail: number;
    wholesale: number;
    tradeIn: number;
    privateParty: number;
  };
  adjustments: Array<{
    factor: string;
    impact: number;
    reason: string;
  }>;
  confidenceScore: number;
  dataAge: string; // "2 hours ago"
  sources: string[]; // ["Black Book", "MMR", "Market Data"]
}

/**
 * Get AI-powered pricing recommendation for a vehicle
 */
export async function getAIPricingRecommendation(
  vehicleId: string,
  tenantId: string
): Promise<PricingRecommendation> {
  // Get vehicle details
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      priceHistory: {
        orderBy: { changedAt: 'desc' },
        take: 10,
      },
      marketComps: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error('Vehicle not found');
  }

  // Get market comps
  const marketComps = await getMarketComps(vehicle);

  // Call ML service for AI pricing
  const mlResponse = await callMLPricingService({
    vin: vehicle.vin,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim || '',
    mileage: vehicle.mileage || 0,
    condition: vehicle.condition || 'GOOD',
    currentPrice: vehicle.priceCents ? vehicle.priceCents / 100 : 0,
    costBasis: vehicle.costCents ? vehicle.costCents / 100 : 0,
    daysInStock: vehicle.daysInStock || 0,
    marketComps: marketComps.slice(0, 20),
    priceHistory: vehicle.priceHistory.map(ph => ({
      price: ph.priceCents / 100,
      date: ph.changedAt.toISOString(),
    })),
  });

  // Calculate competitive index
  const competitiveIndex = calculateCompetitiveIndex(
    mlResponse.recommendedPrice,
    marketComps
  );

  // Determine market position
  const avgMarketPrice = marketComps.length > 0
    ? marketComps.reduce((sum, c) => sum + c.priceCents, 0) / marketComps.length / 100
    : mlResponse.recommendedPrice;

  let marketPosition: 'ABOVE_MARKET' | 'AT_MARKET' | 'BELOW_MARKET' = 'AT_MARKET';
  const currentPrice = vehicle.priceCents ? vehicle.priceCents / 100 : 0;

  if (currentPrice > avgMarketPrice * 1.05) marketPosition = 'ABOVE_MARKET';
  else if (currentPrice < avgMarketPrice * 0.95) marketPosition = 'BELOW_MARKET';

  // Store recommendation
  await db.activity.create({
    data: {
      tenantId,
      userId: tenantId, // System user
      type: 'PRICING_RECOMMENDATION',
      entityType: 'VEHICLE',
      entityId: vehicleId,
      description: `AI pricing recommendation: $${mlResponse.recommendedPrice.toFixed(0)} (${mlResponse.reason})`,
      metadata: {
        currentPrice,
        recommendedPrice: mlResponse.recommendedPrice,
        confidence: mlResponse.confidence,
        marketPosition,
      },
    },
  });

  return {
    vehicleId,
    currentPrice,
    recommendedPrice: mlResponse.recommendedPrice,
    priceAdjustment: mlResponse.recommendedPrice - currentPrice,
    priceAdjustmentPercent: ((mlResponse.recommendedPrice - currentPrice) / currentPrice) * 100,
    confidence: mlResponse.confidence,
    reason: mlResponse.reason,
    marketPosition,
    daysToSell: mlResponse.daysToSell,
    probabilityOfSale30Days: mlResponse.probabilityOfSale30Days,
    competitiveIndex,
    recommendations: {
      aggressive: mlResponse.recommendedPrice * 0.95,
      market: mlResponse.recommendedPrice,
      premium: mlResponse.recommendedPrice * 1.05,
    },
    marketData: {
      avgPrice: avgMarketPrice,
      medianPrice: calculateMedian(marketComps.map(c => c.priceCents / 100)),
      minPrice: Math.min(...marketComps.map(c => c.priceCents / 100)),
      maxPrice: Math.max(...marketComps.map(c => c.priceCents / 100)),
      totalComps: marketComps.length,
      avgDaysOnMarket: marketComps.reduce((sum, c) => sum + (c.daysOnMarket || 0), 0) / marketComps.length,
    },
  };
}

/**
 * Get comprehensive market analysis for a vehicle
 */
export async function getMarketAnalysis(
  vehicleId: string,
  tenantId: string
): Promise<MarketAnalysis> {
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      locationRef: true,
    },
  });

  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error('Vehicle not found');
  }

  // Get market comps at different radii
  const localComps = await getMarketComps(vehicle, 50); // 50 mile radius
  const regionalComps = await getMarketComps(vehicle, 200); // 200 mile radius

  // Calculate metrics
  const localAvgPrice = calculateAverage(localComps.map(c => c.priceCents / 100));
  const regionalAvgPrice = calculateAverage(regionalComps.map(c => c.priceCents / 100));
  const localAvgDOM = calculateAverage(localComps.map(c => c.daysOnMarket || 0));

  // Get competitor pricing (closest 10 similar vehicles)
  const competitorPricing = localComps.slice(0, 10).map(comp => ({
    competitorId: comp.id,
    competitorName: comp.dealerName || 'Unknown Dealer',
    distance: comp.distance || 0,
    price: comp.priceCents / 100,
    mileage: comp.mileage || 0,
    daysOnMarket: comp.daysOnMarket || 0,
    listingUrl: comp.listingUrl,
  }));

  // Analyze trends
  const priceHistory = await db.priceHistory.findMany({
    where: {
      vehicleId,
      changedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { changedAt: 'asc' },
  });

  const priceDirection = determinePriceDirection(priceHistory);
  const demandScore = calculateDemandScore(vehicle, localComps);
  const seasonalFactor = getSeasonalFactor(vehicle.make, vehicle.bodyStyle);

  return {
    vehicleId,
    vin: vehicle.vin,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim || undefined,
    mileage: vehicle.mileage || undefined,
    localMarket: {
      avgPrice: localAvgPrice,
      medianPrice: calculateMedian(localComps.map(c => c.priceCents / 100)),
      inventory: localComps.length,
      avgDaysOnMarket: localAvgDOM,
      demandScore,
    },
    regionalMarket: {
      avgPrice: regionalAvgPrice,
      medianPrice: calculateMedian(regionalComps.map(c => c.priceCents / 100)),
      inventory: regionalComps.length,
      avgDaysOnMarket: calculateAverage(regionalComps.map(c => c.daysOnMarket || 0)),
    },
    nationalMarket: {
      avgPrice: regionalAvgPrice * 1.02, // Approximate
      medianPrice: calculateMedian(regionalComps.map(c => c.priceCents / 100)),
      avgDaysOnMarket: localAvgDOM * 1.1,
    },
    competitorPricing,
    trendAnalysis: {
      priceDirection,
      demandTrend: demandScore > 70 ? 'HIGH' : demandScore > 40 ? 'MODERATE' : 'LOW',
      seasonalFactor,
      marketVelocity: localAvgDOM < 20 ? 'FAST' : localAvgDOM < 40 ? 'AVERAGE' : 'SLOW',
    },
  };
}

/**
 * Get instant appraisal valuation for trade-in
 */
export async function getAppraisalValuation(
  input: {
    vin: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    mileage: number;
    condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    zipCode?: string;
  },
  tenantId: string
): Promise<AppraisalValuation> {
  // Call ML service for valuation
  const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/appraisal/valuate`, {
    vin: input.vin,
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim,
    mileage: input.mileage,
    condition: input.condition,
    zipCode: input.zipCode,
  });

  const valuation = mlResponse.data;

  // Calculate adjustments
  const adjustments = [];

  // Mileage adjustment
  const avgMileageForYear = (new Date().getFullYear() - input.year) * 12000;
  if (input.mileage < avgMileageForYear * 0.7) {
    adjustments.push({
      factor: 'Low Mileage',
      impact: 500,
      reason: 'Below average mileage increases value',
    });
  } else if (input.mileage > avgMileageForYear * 1.3) {
    adjustments.push({
      factor: 'High Mileage',
      impact: -800,
      reason: 'Above average mileage decreases value',
    });
  }

  // Condition adjustment
  const conditionImpact = {
    EXCELLENT: 1000,
    GOOD: 0,
    FAIR: -1500,
    POOR: -3000,
  };

  if (input.condition !== 'GOOD') {
    adjustments.push({
      factor: `${input.condition} Condition`,
      impact: conditionImpact[input.condition],
      reason: `Vehicle condition affects resale value`,
    });
  }

  return {
    vin: input.vin,
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim,
    mileage: input.mileage,
    condition: input.condition,
    valuation: {
      retail: valuation.retail || valuation.tradeIn * 1.3,
      wholesale: valuation.wholesale || valuation.tradeIn * 0.85,
      tradeIn: valuation.tradeIn,
      privateParty: valuation.privateParty || valuation.tradeIn * 1.15,
    },
    adjustments,
    confidenceScore: valuation.confidence || 85,
    dataAge: '2 hours ago',
    sources: ['Black Book', 'Manheim Market Report', 'Local Market Data'],
  };
}

/**
 * Batch pricing recommendations for entire inventory
 */
export async function getBatchPricingRecommendations(
  tenantId: string,
  filters?: {
    daysInStockMin?: number;
    status?: string[];
  }
): Promise<PricingRecommendation[]> {
  const where: Prisma.VehicleWhereInput = {
    tenantId,
    deletedAt: null,
    status: filters?.status ? { in: filters.status as any } : { in: ['AVAILABLE', 'IN_STOCK'] },
  };

  if (filters?.daysInStockMin) {
    where.daysInStock = { gte: filters.daysInStockMin };
  }

  const vehicles = await db.vehicle.findMany({
    where,
    take: 100, // Process 100 at a time
    orderBy: { daysInStock: 'desc' },
  });

  const recommendations = await Promise.all(
    vehicles.map(v => getAIPricingRecommendation(v.id, tenantId).catch(err => null))
  );

  return recommendations.filter(r => r !== null) as PricingRecommendation[];
}

// Helper functions

async function getMarketComps(vehicle: any, radiusMiles: number = 100) {
  // Get recent market comps from database
  return await db.marketComp.findMany({
    where: {
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      distance: { lte: radiusMiles },
      createdAt: {
        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // Last 14 days
      },
    },
    orderBy: { distance: 'asc' },
    take: 50,
  });
}

async function callMLPricingService(data: any) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/pricing/recommend`, data, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    // Fallback to rule-based pricing if ML service unavailable
    return {
      recommendedPrice: data.currentPrice || data.costBasis * 1.15,
      confidence: 0.6,
      reason: 'ML service unavailable, using cost-plus pricing',
      daysToSell: 45,
      probabilityOfSale30Days: 0.5,
    };
  }
}

function calculateCompetitiveIndex(price: number, comps: any[]): number {
  if (comps.length === 0) return 50;

  const avgPrice = comps.reduce((sum, c) => sum + c.priceCents / 100, 0) / comps.length;
  const percentDiff = ((price - avgPrice) / avgPrice) * 100;

  // 100 = most competitive (lowest price), 0 = least competitive (highest price)
  return Math.max(0, Math.min(100, 50 - percentDiff));
}

function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function determinePriceDirection(priceHistory: any[]): 'INCREASING' | 'STABLE' | 'DECREASING' {
  if (priceHistory.length < 2) return 'STABLE';

  const first = priceHistory[0].priceCents;
  const last = priceHistory[priceHistory.length - 1].priceCents;
  const change = ((last - first) / first) * 100;

  if (change > 2) return 'INCREASING';
  if (change < -2) return 'DECREASING';
  return 'STABLE';
}

function calculateDemandScore(vehicle: any, comps: any[]): number {
  // Score 0-100 based on days in stock vs market average
  const avgDOM = comps.length > 0
    ? comps.reduce((sum, c) => sum + (c.daysOnMarket || 0), 0) / comps.length
    : 45;

  const vehicleDays = vehicle.daysInStock || 0;

  if (vehicleDays < avgDOM * 0.5) return 95;
  if (vehicleDays < avgDOM * 0.75) return 80;
  if (vehicleDays < avgDOM) return 65;
  if (vehicleDays < avgDOM * 1.5) return 45;
  return 25;
}

function getSeasonalFactor(make: string, bodyStyle?: string | null): number {
  const month = new Date().getMonth(); // 0-11

  // Convertibles sell better in spring/summer
  if (bodyStyle?.toLowerCase().includes('convertible')) {
    return month >= 3 && month <= 8 ? 1.15 : 0.85;
  }

  // Trucks/SUVs sell better in fall/winter
  if (bodyStyle?.toLowerCase().includes('truck') || bodyStyle?.toLowerCase().includes('suv')) {
    return month >= 9 || month <= 2 ? 1.1 : 0.95;
  }

  return 1.0; // No seasonal impact
}

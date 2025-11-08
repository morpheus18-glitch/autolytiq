/**
 * Merchandising & Content Automation Service
 * AI-powered vehicle descriptions, feature extraction, and content generation
 * Rivals vAuto's merchandising automation
 */

import { db } from '@repo/db';
import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface MerchandisingContent {
  vehicleId: string;
  description: {
    headline: string;
    summary: string;
    fullDescription: string;
    sellingPoints: string[];
    keywords: string[];
  };
  features: {
    standard: string[];
    premium: string[];
    safety: string[];
    technology: string[];
    comfort: string[];
  };
  seoData: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    keywords: string[];
  };
  socialMedia: {
    facebookPost: string;
    instagramCaption: string;
    twitterPost: string;
  };
  generatedAt: Date;
  confidence: number;
}

export interface RetailReadinessScore {
  vehicleId: string;
  overallScore: number; // 0-100
  breakdown: {
    photos: {
      score: number;
      status: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL';
      issues: string[];
      photoCount: number;
      has360: boolean;
      hasInterior: boolean;
      hasExterior: boolean;
    };
    pricing: {
      score: number;
      status: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL';
      issues: string[];
      marketPosition: string;
      daysWithoutPriceChange: number;
    };
    description: {
      score: number;
      status: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL';
      issues: string[];
      wordCount: number;
      hasKeyFeatures: boolean;
    };
    recon: {
      score: number;
      status: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL';
      issues: string[];
      isComplete: boolean;
      daysInRecon: number;
    };
    documentation: {
      score: number;
      status: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL';
      issues: string[];
      hasCarfax: boolean;
      hasAutocheck: boolean;
      hasCertification: boolean;
    };
  };
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    impact: string;
  }>;
  estimatedImpact: {
    potentialViews: number;
    potentialLeads: number;
    pricingOpportunity: number; // Potential price increase
  };
}

export interface VDPAnalytics {
  vehicleId: string;
  period: string;
  metrics: {
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number; // seconds
    bounceRate: number; // percentage
    leads: number;
    conversationRate: number; // leads / views
    photoViews: number;
    videoPlays: number;
    saveCount: number;
    shareCount: number;
    printCount: number;
  };
  traffic: {
    sources: Array<{
      source: string;
      views: number;
      leads: number;
    }>;
    devices: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  engagement: {
    photoEngagement: number; // % who viewed photos
    videoEngagement: number; // % who watched video
    avgPhotosViewed: number;
    ctaClicks: {
      contactDealer: number;
      scheduleTestDrive: number;
      getFinancing: number;
      viewCarfax: number;
    };
  };
  comparison: {
    vsAverage: {
      views: number; // % difference
      leads: number;
      conversionRate: number;
    };
    ranking: number; // Out of total inventory
  };
}

/**
 * Generate AI-powered merchandising content
 */
export async function generateMerchandisingContent(
  vehicleId: string,
  tenantId: string
): Promise<MerchandisingContent> {
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error('Vehicle not found');
  }

  // Call ML service for content generation
  const mlResponse = await axios.post(`${ML_SERVICE_URL}/api/merchandising/generate`, {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    mileage: vehicle.mileage,
    condition: vehicle.condition,
    features: vehicle.features,
    bodyStyle: vehicle.bodyStyle,
    exteriorColor: vehicle.exteriorColor,
    interiorColor: vehicle.interiorColor,
    engineType: vehicle.engineType,
    transmission: vehicle.transmission,
    drivetrain: vehicle.drivetrain,
  }).catch(() => ({
    data: generateFallbackContent(vehicle),
  }));

  const content = mlResponse.data;

  // Store generated content
  await db.vehicle.update({
    where: { id: vehicleId },
    data: {
      notes: content.description.fullDescription,
      features: content.features.standard.concat(
        content.features.premium,
        content.features.safety,
        content.features.technology
      ),
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      tenantId,
      userId: tenantId,
      type: 'CONTENT_GENERATED',
      entityType: 'VEHICLE',
      entityId: vehicleId,
      description: 'AI-generated merchandising content',
      metadata: {
        wordCount: content.description.fullDescription.split(' ').length,
        featureCount: Object.values(content.features).flat().length,
      },
    },
  });

  return {
    vehicleId,
    description: content.description,
    features: content.features,
    seoData: content.seoData,
    socialMedia: content.socialMedia,
    generatedAt: new Date(),
    confidence: content.confidence || 0.85,
  };
}

/**
 * Calculate retail readiness score
 */
export async function calculateRetailReadiness(
  vehicleId: string,
  tenantId: string
): Promise<RetailReadinessScore> {
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      priceHistory: true,
      reconItems: true,
    },
  });

  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error('Vehicle not found');
  }

  // Assess photos
  const photoScore = assessPhotos(vehicle);
  const pricingScore = assessPricing(vehicle);
  const descriptionScore = assessDescription(vehicle);
  const reconScore = assessRecon(vehicle);
  const documentationScore = assessDocumentation(vehicle);

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    photoScore.score * 0.30 +
    pricingScore.score * 0.25 +
    descriptionScore.score * 0.20 +
    reconScore.score * 0.15 +
    documentationScore.score * 0.10
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    photoScore,
    pricingScore,
    descriptionScore,
    reconScore,
    documentationScore
  );

  // Estimate impact of improvements
  const estimatedImpact = {
    potentialViews: Math.round((100 - overallScore) * 10), // More views with better score
    potentialLeads: Math.round((100 - overallScore) * 0.5),
    pricingOpportunity: overallScore < 70 ? 0 : Math.round((overallScore - 70) * 50),
  };

  return {
    vehicleId,
    overallScore,
    breakdown: {
      photos: photoScore,
      pricing: pricingScore,
      description: descriptionScore,
      recon: reconScore,
      documentation: documentationScore,
    },
    recommendations,
    estimatedImpact,
  };
}

/**
 * Get VDP analytics for a vehicle
 */
export async function getVDPAnalytics(
  vehicleId: string,
  tenantId: string,
  periodDays: number = 30
): Promise<VDPAnalytics> {
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle || vehicle.tenantId !== tenantId) {
    throw new Error('Vehicle not found');
  }

  // Get analytics from tracking system
  // TODO: Integrate with actual analytics provider (Google Analytics, etc.)

  // Mock data for now - replace with real analytics
  const mockData = generateMockVDPAnalytics(vehicle, periodDays);

  return mockData;
}

/**
 * Batch retail readiness for entire inventory
 */
export async function getBatchRetailReadiness(
  tenantId: string
): Promise<Array<{ vehicleId: string; score: number; criticalIssues: string[] }>> {
  const vehicles = await db.vehicle.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: { in: ['AVAILABLE', 'IN_STOCK'] },
    },
    include: {
      priceHistory: true,
      reconItems: true,
    },
    take: 100,
  });

  return vehicles.map(vehicle => {
    const photoScore = assessPhotos(vehicle);
    const pricingScore = assessPricing(vehicle);
    const descriptionScore = assessDescription(vehicle);
    const reconScore = assessRecon(vehicle);
    const documentationScore = assessDocumentation(vehicle);

    const overallScore = Math.round(
      photoScore.score * 0.30 +
      pricingScore.score * 0.25 +
      descriptionScore.score * 0.20 +
      reconScore.score * 0.15 +
      documentationScore.score * 0.10
    );

    const criticalIssues = [
      ...photoScore.issues.filter(() => photoScore.status === 'CRITICAL'),
      ...pricingScore.issues.filter(() => pricingScore.status === 'CRITICAL'),
      ...reconScore.issues.filter(() => reconScore.status === 'CRITICAL'),
    ];

    return {
      vehicleId: vehicle.id,
      score: overallScore,
      criticalIssues,
    };
  });
}

// Helper functions

function assessPhotos(vehicle: any) {
  const photoCount = vehicle.imageUrls?.length || 0;
  const hasInterior = vehicle.imageUrls?.some((url: string) => url.includes('interior')) || false;
  const hasExterior = vehicle.imageUrls?.some((url: string) => url.includes('exterior')) || false;
  const has360 = vehicle.imageUrls?.some((url: string) => url.includes('360')) || false;

  const issues = [];
  let score = 0;

  if (photoCount === 0) {
    issues.push('No photos uploaded');
    return { score: 0, status: 'CRITICAL' as const, issues, photoCount, has360, hasInterior, hasExterior };
  }

  if (photoCount < 10) issues.push('Need at least 10 photos');
  else if (photoCount < 20) score += 30;
  else score += 50;

  if (!hasExterior) issues.push('Missing exterior photos');
  else score += 20;

  if (!hasInterior) issues.push('Missing interior photos');
  else score += 20;

  if (has360) score += 10;
  else issues.push('Consider adding 360° view');

  const status = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'NEEDS_WORK' : 'CRITICAL';

  return { score, status, issues, photoCount, has360, hasInterior, hasExterior };
}

function assessPricing(vehicle: any) {
  const issues = [];
  let score = 50; // Start at baseline

  const hasPrice = vehicle.priceCents && vehicle.priceCents > 0;
  if (!hasPrice) {
    issues.push('No price set');
    return { score: 0, status: 'CRITICAL' as const, issues, marketPosition: 'UNKNOWN', daysWithoutPriceChange: 0 };
  }

  score += 20;

  const daysWithoutPriceChange = vehicle.lastPriceChangeDate
    ? Math.floor((Date.now() - vehicle.lastPriceChangeDate.getTime()) / (1000 * 60 * 60 * 24))
    : vehicle.daysInStock || 0;

  if (daysWithoutPriceChange > 30 && vehicle.daysInStock > 30) {
    issues.push('Price not adjusted in 30+ days');
    score -= 10;
  } else {
    score += 15;
  }

  if (vehicle.daysInStock > 60) {
    issues.push('Consider price reduction for aging inventory');
    score -= 10;
  } else {
    score += 15;
  }

  const status = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'NEEDS_WORK' : 'CRITICAL';
  const marketPosition = score >= 70 ? 'COMPETITIVE' : 'NEEDS_REVIEW';

  return { score, status, issues, marketPosition, daysWithoutPriceChange };
}

function assessDescription(vehicle: any) {
  const issues = [];
  let score = 0;

  const description = vehicle.notes || '';
  const wordCount = description.split(' ').length;
  const hasKeyFeatures = (vehicle.features?.length || 0) > 5;

  if (wordCount === 0) {
    issues.push('No description provided');
    return { score: 0, status: 'CRITICAL' as const, issues, wordCount, hasKeyFeatures };
  }

  if (wordCount < 50) {
    issues.push('Description too short (min 50 words)');
    score += 20;
  } else if (wordCount < 100) {
    score += 50;
  } else {
    score += 70;
  }

  if (!hasKeyFeatures) {
    issues.push('Add key features and highlights');
    score -= 10;
  } else {
    score += 30;
  }

  const status = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'NEEDS_WORK' : 'CRITICAL';

  return { score, status, issues, wordCount, hasKeyFeatures };
}

function assessRecon(vehicle: any) {
  const issues = [];
  let score = 50; // Baseline

  const hasReconItems = vehicle.reconItems && vehicle.reconItems.length > 0;
  const isComplete = vehicle.reconCompletedAt !== null;
  const inRecon = vehicle.status === 'RECON';

  if (inRecon) {
    const daysInRecon = vehicle.daysInStock || 0;
    if (daysInRecon > 14) {
      issues.push('Recon taking too long (14+ days)');
      score -= 20;
    }
  }

  if (isComplete) {
    score += 50;
  } else if (!inRecon) {
    score += 30; // Not in recon, assume it's fine
  } else {
    issues.push('Recon not complete');
  }

  const status = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'NEEDS_WORK' : 'CRITICAL';
  const daysInRecon = inRecon ? (vehicle.daysInStock || 0) : 0;

  return { score, status, issues, isComplete, daysInRecon };
}

function assessDocumentation(vehicle: any) {
  const issues = [];
  let score = 40; // Baseline

  const hasCarfax = vehicle.hasCarfax || false;
  const hasAutocheck = vehicle.hasAutocheck || false;
  const hasCertification = vehicle.certifiedPreOwned || false;

  if (hasCarfax) score += 25;
  else issues.push('Add Carfax report');

  if (hasAutocheck) score += 15;
  else issues.push('Consider adding AutoCheck report');

  if (hasCertification) score += 20;

  const status = score >= 80 ? 'EXCELLENT' : score >= 60 ? 'GOOD' : score >= 40 ? 'NEEDS_WORK' : 'CRITICAL';

  return { score, status, issues, hasCarfax, hasAutocheck, hasCertification };
}

function generateRecommendations(
  photoScore: any,
  pricingScore: any,
  descriptionScore: any,
  reconScore: any,
  documentationScore: any
) {
  const recommendations = [];

  if (photoScore.score < 60) {
    recommendations.push({
      priority: 'HIGH' as const,
      action: 'Add professional photos (minimum 15 photos with interior and exterior)',
      impact: 'Increase views by 40-60%',
    });
  }

  if (pricingScore.score < 60) {
    recommendations.push({
      priority: 'HIGH' as const,
      action: 'Review and adjust pricing based on market data',
      impact: 'Improve time-to-sale by 25%',
    });
  }

  if (descriptionScore.score < 60) {
    recommendations.push({
      priority: 'MEDIUM' as const,
      action: 'Generate AI-powered description with key features',
      impact: 'Increase engagement by 15-20%',
    });
  }

  if (reconScore.score < 60) {
    recommendations.push({
      priority: 'HIGH' as const,
      action: 'Complete recon and move to retail status',
      impact: 'Make vehicle saleable immediately',
    });
  }

  if (documentationScore.score < 60) {
    recommendations.push({
      priority: 'MEDIUM' as const,
      action: 'Add vehicle history report (Carfax/AutoCheck)',
      impact: 'Increase buyer confidence and leads by 10-15%',
    });
  }

  return recommendations;
}

function generateFallbackContent(vehicle: any) {
  const year = vehicle.year;
  const make = vehicle.make;
  const model = vehicle.model;
  const trim = vehicle.trim || '';

  const headline = `${year} ${make} ${model} ${trim}`.trim();
  const summary = `Experience the perfect blend of performance and reliability with this ${year} ${make} ${model}. ` +
    `This vehicle offers exceptional value and comes ready to drive.`;

  const fullDescription =
    `Discover this outstanding ${year} ${make} ${model} ${trim}. ` +
    `This vehicle combines style, comfort, and performance in one impressive package. ` +
    `With ${vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'low mileage'}, ` +
    `this ${make} ${model} is in ${vehicle.condition?.toLowerCase() || 'excellent'} condition and ready for its next owner. ` +
    `Don't miss this opportunity to own a quality vehicle at a great price.`;

  return {
    description: {
      headline,
      summary,
      fullDescription,
      sellingPoints: [
        `${year} ${make} ${model}`,
        vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'Low mileage',
        vehicle.condition ? `${vehicle.condition} condition` : 'Great condition',
        'Well maintained',
        'Ready to drive',
      ],
      keywords: [make.toLowerCase(), model.toLowerCase(), year.toString(), 'used car', 'for sale'],
    },
    features: {
      standard: vehicle.features || [],
      premium: [],
      safety: [],
      technology: [],
      comfort: [],
    },
    seoData: {
      metaTitle: `${year} ${make} ${model} ${trim} For Sale`.trim(),
      metaDescription: summary,
      slug: `${year}-${make}-${model}-${vehicle.vin.slice(-6)}`.toLowerCase().replace(/\s+/g, '-'),
      keywords: [make, model, year.toString(), 'car', 'sale'],
    },
    socialMedia: {
      facebookPost: `🚗 ${headline}\n\n${summary}\n\nContact us today for more information!`,
      instagramCaption: `${headline} ✨\n\n${summary}\n\n#${make} #${model} #UsedCars #CarSales`,
      twitterPost: `🚗 ${headline} - ${summary}`,
    },
    confidence: 0.6,
  };
}

function generateMockVDPAnalytics(vehicle: any, periodDays: number): VDPAnalytics {
  // Generate realistic mock data - replace with actual analytics integration
  const baseViews = 100 + Math.floor(Math.random() * 400);
  const uniqueViews = Math.floor(baseViews * 0.7);
  const leads = Math.floor(uniqueViews * 0.05);

  return {
    vehicleId: vehicle.id,
    period: `Last ${periodDays} days`,
    metrics: {
      views: baseViews,
      uniqueViews,
      avgTimeOnPage: 45 + Math.floor(Math.random() * 60),
      bounceRate: 35 + Math.floor(Math.random() * 30),
      leads,
      conversationRate: leads / baseViews,
      photoViews: baseViews * 5,
      videoPlays: Math.floor(baseViews * 0.3),
      saveCount: Math.floor(uniqueViews * 0.08),
      shareCount: Math.floor(uniqueViews * 0.02),
      printCount: Math.floor(uniqueViews * 0.01),
    },
    traffic: {
      sources: [
        { source: 'Cars.com', views: Math.floor(baseViews * 0.35), leads: Math.floor(leads * 0.4) },
        { source: 'AutoTrader', views: Math.floor(baseViews * 0.25), leads: Math.floor(leads * 0.3) },
        { source: 'Direct', views: Math.floor(baseViews * 0.20), leads: Math.floor(leads * 0.2) },
        { source: 'Google', views: Math.floor(baseViews * 0.15), leads: Math.floor(leads * 0.1) },
        { source: 'Facebook', views: Math.floor(baseViews * 0.05), leads: 0 },
      ],
      devices: {
        desktop: Math.floor(baseViews * 0.35),
        mobile: Math.floor(baseViews * 0.55),
        tablet: Math.floor(baseViews * 0.10),
      },
    },
    engagement: {
      photoEngagement: 0.75,
      videoEngagement: 0.30,
      avgPhotosViewed: 5.2,
      ctaClicks: {
        contactDealer: Math.floor(baseViews * 0.08),
        scheduleTestDrive: Math.floor(baseViews * 0.03),
        getFinancing: Math.floor(baseViews * 0.02),
        viewCarfax: Math.floor(baseViews * 0.12),
      },
    },
    comparison: {
      vsAverage: {
        views: Math.floor(Math.random() * 40) - 20,
        leads: Math.floor(Math.random() * 50) - 25,
        conversionRate: Math.floor(Math.random() * 30) - 15,
      },
      ranking: Math.floor(Math.random() * 50) + 1,
    },
  };
}

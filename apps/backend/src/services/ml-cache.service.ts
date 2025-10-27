import { Prisma } from '@prisma/client';
import { prisma, toInputJson } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/**
 * ML Feature Types
 * Defines the types of ML predictions that can be cached
 */
export enum MLFeatureType {
  // Lead intelligence
  LEAD_SCORE = 'LEAD_SCORE',
  LEAD_NEXT_ACTION = 'LEAD_NEXT_ACTION',
  CLOSE_PROBABILITY = 'CLOSE_PROBABILITY',

  // Deal optimization
  DEAL_OPTIMIZATION = 'DEAL_OPTIMIZATION',
  COUNTER_ANALYSIS = 'COUNTER_ANALYSIS',
  APPROVAL_PREDICTION = 'APPROVAL_PREDICTION',

  // Sentiment & Communication
  SENTIMENT_ANALYSIS = 'SENTIMENT_ANALYSIS',

  // Vehicle pricing
  VEHICLE_PRICE_PREDICTION = 'VEHICLE_PRICE_PREDICTION',
  MARKET_COMPARISON = 'MARKET_COMPARISON',
}

/**
 * ML Entity Types
 * Defines what type of entity the prediction is for
 */
export enum MLEntityType {
  CUSTOMER = 'CUSTOMER',
  LEAD = 'LEAD',
  DEAL = 'DEAL',
  VEHICLE = 'VEHICLE',
  COMMUNICATION = 'COMMUNICATION',
}

const MODEL_VERSION = '1.0.0'; // Increment when ML model changes
const DEFAULT_TTL_HOURS = 24; // Cache expires after 24 hours

/**
 * Get cached ML prediction
 *
 * @param tenantId - Tenant context
 * @param entityType - Type of entity (VEHICLE, LEAD, DEAL, etc.)
 * @param entityId - Entity ID
 * @param featureType - Type of ML prediction
 * @returns Cached prediction or null if not found/expired
 */
export async function getCachedPrediction<T = unknown>(
  tenantId: string,
  entityType: MLEntityType,
  entityId: string,
  featureType: MLFeatureType,
): Promise<T | null> {
  const cached = await prisma.mLFeatureCache.findUnique({
    where: {
      tenantId_entityType_entityId_featureType_modelVersion: {
        tenantId,
        entityType,
        entityId,
        featureType,
        modelVersion: MODEL_VERSION,
      },
    },
  });

  // Check if exists and not expired
  if (!cached || cached.expiresAt < new Date()) {
    logger.debug('ML cache miss', {
      entityType,
      entityId,
      featureType,
      expired: cached ? cached.expiresAt < new Date() : false,
    });
    return null;
  }

  logger.info('ML cache hit', {
    entityType,
    entityId,
    featureType,
    age: Date.now() - cached.computedAt.getTime(),
  });

  return cached.prediction as T;
}

/**
 * Cache ML prediction
 *
 * @param tenantId - Tenant context
 * @param entityType - Type of entity
 * @param entityId - Entity ID
 * @param featureType - Type of ML prediction
 * @param features - Input features used for prediction
 * @param prediction - ML prediction result
 * @param confidence - Prediction confidence (0-1)
 * @param ttlHours - Cache TTL in hours (default 24)
 */
export async function cachePrediction(
  tenantId: string,
  entityType: MLEntityType,
  entityId: string,
  featureType: MLFeatureType,
  features: Record<string, unknown>,
  prediction: Record<string, unknown>,
  confidence?: number,
  ttlHours: number = DEFAULT_TTL_HOURS,
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

  await prisma.mLFeatureCache.upsert({
    where: {
      tenantId_entityType_entityId_featureType_modelVersion: {
        tenantId,
        entityType,
        entityId,
        featureType,
        modelVersion: MODEL_VERSION,
      },
    },
    create: {
      tenantId,
      entityType,
      entityId,
      featureType,
      modelVersion: MODEL_VERSION,
      features: toInputJson(features),
      prediction: toInputJson(prediction),
      confidence: confidence != null ? new Prisma.Decimal(confidence) : null,
      computedAt: now,
      expiresAt,
    },
    update: {
      features: toInputJson(features),
      prediction: toInputJson(prediction),
      confidence: confidence != null ? new Prisma.Decimal(confidence) : null,
      computedAt: now,
      expiresAt,
    },
  });

  logger.debug('ML prediction cached', {
    entityType,
    entityId,
    featureType,
    ttlHours,
  });
}

/**
 * Invalidate cached predictions for an entity
 * Use this when entity data changes and predictions should be recomputed
 *
 * @param tenantId - Tenant context
 * @param entityType - Type of entity
 * @param entityId - Entity ID
 * @param featureType - Optional: specific feature type to invalidate
 */
export async function invalidateCache(
  tenantId: string,
  entityType: MLEntityType,
  entityId: string,
  featureType?: MLFeatureType,
): Promise<number> {
  const where: Record<string, unknown> = {
    tenantId,
    entityType,
    entityId,
  };

  if (featureType) {
    where.featureType = featureType;
  }

  const result = await prisma.mLFeatureCache.deleteMany({ where });

  logger.info('ML cache invalidated', {
    entityType,
    entityId,
    featureType: featureType ?? 'all',
    count: result.count,
  });

  return result.count;
}

/**
 * Clean up expired cache entries
 * Run this periodically (e.g., hourly via cron job)
 */
export async function cleanupExpiredCache(): Promise<number> {
  const result = await prisma.mLFeatureCache.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  logger.info('ML cache cleanup completed', { deleted: result.count });
  return result.count;
}

/**
 * Get cache statistics
 * Useful for monitoring and optimization
 */
export async function getCacheStats(tenantId?: string) {
  const where = tenantId ? { tenantId } : {};

  const [total, expired, byFeatureType] = await Promise.all([
    // Total entries
    prisma.mLFeatureCache.count({ where }),

    // Expired entries
    prisma.mLFeatureCache.count({
      where: {
        ...where,
        expiresAt: { lt: new Date() },
      },
    }),

    // Breakdown by feature type
    prisma.mLFeatureCache.groupBy({
      by: ['featureType'],
      where,
      _count: true,
    }),
  ]);

  return {
    total,
    expired,
    active: total - expired,
    byFeatureType: byFeatureType.map((item) => ({
      featureType: item.featureType,
      count: item._count,
    })),
  };
}

/**
 * Fallback heuristic functions
 * These provide approximate predictions when ML service is unavailable
 */

/**
 * Fallback lead score
 * Simple heuristic based on available data
 */
export function fallbackLeadScore(data: {
  daysInPipeline?: number;
  interactionCount?: number;
  emailOpens?: number;
  phoneConnects?: number;
}): number {
  let score = 50; // Base score

  // Recency (fresher leads score higher)
  if (data.daysInPipeline != null) {
    if (data.daysInPipeline < 7) score += 20;
    else if (data.daysInPipeline < 30) score += 10;
    else score -= 10;
  }

  // Engagement
  if (data.interactionCount != null) {
    score += Math.min(data.interactionCount * 5, 20);
  }

  if (data.emailOpens != null) {
    score += Math.min(data.emailOpens * 2, 10);
  }

  if (data.phoneConnects != null) {
    score += Math.min(data.phoneConnects * 10, 20);
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Fallback vehicle price prediction
 * Simple depreciation model
 */
export function fallbackVehiclePrice(data: {
  year: number;
  basePrice?: number;
  mileage?: number;
  condition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}): number {
  const basePrice = data.basePrice ?? 20000;
  const currentYear = new Date().getFullYear();
  const age = currentYear - data.year;

  // Depreciation: 15% per year for first 5 years, 10% thereafter
  let depreciationRate = age <= 5 ? 0.15 : 0.10;
  let price = basePrice * Math.pow(1 - depreciationRate, age);

  // Mileage depreciation: $0.05 per mile
  if (data.mileage) {
    price -= data.mileage * 0.05;
  }

  // Condition multiplier
  const conditionMultiplier = {
    EXCELLENT: 1.15,
    GOOD: 1.0,
    FAIR: 0.85,
    POOR: 0.7,
  }[data.condition ?? 'GOOD'];

  price *= conditionMultiplier;

  return Math.max(5000, price); // Minimum $5k floor
}

/**
 * Fallback approval probability
 * Simple credit-based heuristic
 */
export function fallbackApprovalProbability(data: {
  creditScore?: number;
  downPaymentPercent?: number;
  debtToIncome?: number;
}): number {
  let probability = 0.5; // Base 50%

  // Credit score impact
  if (data.creditScore != null) {
    if (data.creditScore >= 750) probability = 0.9;
    else if (data.creditScore >= 700) probability = 0.8;
    else if (data.creditScore >= 650) probability = 0.6;
    else if (data.creditScore >= 600) probability = 0.4;
    else probability = 0.2;
  }

  // Down payment impact
  if (data.downPaymentPercent != null) {
    if (data.downPaymentPercent >= 20) probability += 0.1;
    else if (data.downPaymentPercent >= 10) probability += 0.05;
  }

  // Debt-to-income impact
  if (data.debtToIncome != null) {
    if (data.debtToIncome < 0.3) probability += 0.1;
    else if (data.debtToIncome > 0.5) probability -= 0.2;
  }

  return Math.max(0, Math.min(1, probability));
}

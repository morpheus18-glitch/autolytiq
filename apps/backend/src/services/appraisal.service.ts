/**
 * Comprehensive Appraisal Service
 * Enterprise-grade trade-in appraisal system with full platform integration
 * Rivals vAuto/Black Book appraisal tools
 */

import { db } from '@repo/db';
import { AppraisalStatus, AppraisalConditionGrade, Prisma, VehicleType } from '@prisma/client';
import axios from 'axios';
import { getAppraisalValuation } from './pricing-intelligence.service.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const VIN_DECODER_API = process.env.VIN_DECODER_API || 'https://vpic.nhtsa.dot.gov/api/vehicles';

export interface CreateAppraisalInput {
  tenantId: string;
  appraiserId: string;
  customerId?: string;
  leadId?: string;
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  mileage: number;
  exteriorColor?: string;
  interiorColor?: string;
  conditionGrade?: AppraisalConditionGrade;
  conditionNotes?: string;
  warningLights?: string[];
  photos?: string[];
  notes?: string;
}

export interface UpdateAppraisalInput {
  mileage?: number;
  exteriorColor?: string;
  interiorColor?: string;
  conditionGrade?: AppraisalConditionGrade;
  conditionScore?: number;
  conditionNotes?: string;
  warningLights?: string[];
  photos?: string[];
  notes?: string;
  estimatedValue?: number;
}

export interface AppraisalWithValuations {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  conditionGrade: AppraisalConditionGrade;
  conditionScore?: number;
  photos: string[];
  status: AppraisalStatus;
  valuations: {
    retail: number;
    wholesale: number;
    tradeIn: number;
    privateParty: number;
    aiSuggested: number;
    offerAmount: number; // What we're offering customer
  };
  reconEstimate: {
    items: Array<{
      category: string;
      description: string;
      estimatedCost: number;
    }>;
    totalCost: number;
  };
  profitAnalysis: {
    acv: number; // Actual Cash Value (trade-in + recon)
    projectedRetail: number;
    estimatedProfit: number;
    profitMargin: number; // Percentage
    daysToTurn: number; // Estimated
    roi: number; // Return on investment %
  };
  marketData: {
    localComps: number;
    avgMarketPrice: number;
    demandScore: number;
    marketVelocity: string;
  };
  appraiser: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    name: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  lead?: {
    id: string;
    source: string;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface VINDecodeResult {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
  engineType?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  doors?: number;
  msrp?: number;
  valid: boolean;
  errorMessage?: string;
}

export interface ReconEstimate {
  items: Array<{
    category: 'MECHANICAL' | 'BODY' | 'INTERIOR' | 'TIRES' | 'DETAILING' | 'OTHER';
    description: string;
    estimatedCost: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    required: boolean;
  }>;
  totalCost: number;
  estimatedDays: number;
}

export interface AppraisalApprovalDecision {
  appraisalId: string;
  managerId: string;
  approved: boolean;
  offerAmount?: number;
  adjustmentReason?: string;
  expiresInHours?: number;
  notes?: string;
}

export interface ConvertToInventoryInput {
  appraisalId: string;
  tenantId: string;
  userId: string;
  stockNumber: string;
  costCents: number; // What we paid for it
  priceCents: number; // Initial retail price
  locationId?: string;
  status?: string;
}

/**
 * Decode VIN and get vehicle information
 */
export async function decodeVIN(vin: string): Promise<VINDecodeResult> {
  try {
    // Call NHTSA VIN decoder API
    const response = await axios.get(`${VIN_DECODER_API}/DecodeVin/${vin}?format=json`, {
      timeout: 5000,
    });

    const data = response.data.Results;

    // Extract key fields
    const year = parseInt(data.find((r: any) => r.Variable === 'Model Year')?.Value || '0');
    const make = data.find((r: any) => r.Variable === 'Make')?.Value || '';
    const model = data.find((r: any) => r.Variable === 'Model')?.Value || '';
    const trim = data.find((r: any) => r.Variable === 'Trim')?.Value || null;
    const bodyStyle = data.find((r: any) => r.Variable === 'Body Class')?.Value || null;
    const engineType = data.find((r: any) => r.Variable === 'Engine Configuration')?.Value || null;
    const transmission = data.find((r: any) => r.Variable === 'Transmission Style')?.Value || null;
    const drivetrain = data.find((r: any) => r.Variable === 'Drive Type')?.Value || null;
    const fuelType = data.find((r: any) => r.Variable === 'Fuel Type - Primary')?.Value || null;
    const doors = parseInt(data.find((r: any) => r.Variable === 'Doors')?.Value || '0');

    const valid = year > 0 && make && model;

    return {
      vin,
      year,
      make,
      model,
      trim: trim || undefined,
      bodyStyle: bodyStyle || undefined,
      engineType: engineType || undefined,
      transmission: transmission || undefined,
      drivetrain: drivetrain || undefined,
      fuelType: fuelType || undefined,
      doors: doors || undefined,
      valid,
    };
  } catch (error) {
    console.error('VIN decode error:', error);
    return {
      vin,
      year: 0,
      make: '',
      model: '',
      valid: false,
      errorMessage: 'Failed to decode VIN',
    };
  }
}

/**
 * Create new appraisal with VIN decode and AI valuation
 */
export async function createAppraisal(input: CreateAppraisalInput) {
  // Decode VIN if vehicle info not provided
  let vehicleInfo = {
    year: input.year,
    make: input.make,
    model: input.model,
    trim: input.trim,
  };

  if (!input.year || !input.make || !input.model) {
    const decoded = await decodeVIN(input.vin);
    if (decoded.valid) {
      vehicleInfo = {
        year: decoded.year,
        make: decoded.make,
        model: decoded.model,
        trim: decoded.trim || input.trim,
      };
    }
  }

  // Get AI valuation
  const valuation = await getAppraisalValuation(
    {
      vin: input.vin,
      year: vehicleInfo.year!,
      make: vehicleInfo.make!,
      model: vehicleInfo.model!,
      trim: vehicleInfo.trim,
      mileage: input.mileage,
      condition: mapConditionGradeToValuation(input.conditionGrade || 'AVERAGE'),
    },
    input.tenantId
  );

  // Calculate recon estimate
  const reconEstimate = await estimateReconCosts(
    {
      year: vehicleInfo.year!,
      make: vehicleInfo.make!,
      model: vehicleInfo.model!,
      mileage: input.mileage,
      conditionGrade: input.conditionGrade || 'AVERAGE',
      warningLights: input.warningLights || [],
    },
    input.tenantId
  );

  // Calculate condition score
  const conditionScore = calculateConditionScore(
    input.conditionGrade || 'AVERAGE',
    input.mileage,
    vehicleInfo.year!,
    input.warningLights?.length || 0
  );

  // Calculate expiration (24 hours from now)
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Create appraisal
  const appraisal = await db.appraisal.create({
    data: {
      tenantId: input.tenantId,
      appraiserId: input.appraiserId,
      vin: input.vin,
      year: vehicleInfo.year!,
      make: vehicleInfo.make!,
      model: vehicleInfo.model!,
      trim: vehicleInfo.trim,
      mileage: input.mileage,
      exteriorColor: input.exteriorColor,
      interiorColor: input.interiorColor,
      conditionGrade: input.conditionGrade || 'AVERAGE',
      conditionScore,
      conditionNotes: input.conditionNotes,
      warningLights: input.warningLights || [],
      photos: input.photos || [],
      estimatedValue: valuation.valuation.tradeIn,
      marketValue: valuation.valuation.retail,
      aiSuggestedValue: valuation.valuation.tradeIn * 0.95, // Offer slightly less than trade-in value
      reconEstimate: reconEstimate as any,
      status: 'DRAFT',
      expiresAt,
      notes: input.notes,
    },
    include: {
      appraiser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Link to customer if provided
  if (input.customerId) {
    await db.customer.update({
      where: { id: input.customerId },
      data: {
        // Could add appraisal reference
      },
    });
  }

  // Link to lead if provided
  if (input.leadId) {
    await db.lead.update({
      where: { id: input.leadId },
      data: {
        // Could add appraisal reference
      },
    });
  }

  // Log activity
  await db.activity.create({
    data: {
      tenantId: input.tenantId,
      userId: input.appraiserId,
      type: 'APPRAISAL_CREATED',
      entityType: 'APPRAISAL',
      entityId: appraisal.id,
      description: `Created appraisal for ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model} (VIN: ${input.vin})`,
      metadata: {
        vin: input.vin,
        year: vehicleInfo.year,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        mileage: input.mileage,
        estimatedValue: valuation.valuation.tradeIn,
      },
    },
  });

  return appraisal;
}

/**
 * Get appraisal with full valuations and analysis
 */
export async function getAppraisalById(
  id: string,
  tenantId: string
): Promise<AppraisalWithValuations> {
  const appraisal = await db.appraisal.findUnique({
    where: { id },
    include: {
      appraiser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      reconItems: true,
    },
  });

  if (!appraisal || appraisal.tenantId !== tenantId) {
    throw new Error('Appraisal not found');
  }

  // Get fresh market data
  const marketData = await getMarketDataForAppraisal(appraisal);

  // Calculate profit analysis
  const reconCost = (appraisal.reconEstimate as any)?.totalCost || 0;
  const acv = parseFloat(appraisal.estimatedValue?.toString() || '0') + reconCost;
  const projectedRetail = parseFloat(appraisal.marketValue?.toString() || '0');
  const estimatedProfit = projectedRetail - acv;
  const profitMargin = projectedRetail > 0 ? (estimatedProfit / projectedRetail) * 100 : 0;

  return {
    id: appraisal.id,
    vin: appraisal.vin,
    year: appraisal.year!,
    make: appraisal.make!,
    model: appraisal.model!,
    trim: appraisal.trim || undefined,
    mileage: appraisal.mileage!,
    conditionGrade: appraisal.conditionGrade!,
    conditionScore: appraisal.conditionScore || undefined,
    photos: appraisal.photos,
    status: appraisal.status,
    valuations: {
      retail: parseFloat(appraisal.marketValue?.toString() || '0'),
      wholesale: parseFloat(appraisal.estimatedValue?.toString() || '0') * 0.85,
      tradeIn: parseFloat(appraisal.estimatedValue?.toString() || '0'),
      privateParty: parseFloat(appraisal.estimatedValue?.toString() || '0') * 1.15,
      aiSuggested: parseFloat(appraisal.aiSuggestedValue?.toString() || '0'),
      offerAmount: parseFloat(appraisal.aiSuggestedValue?.toString() || '0'),
    },
    reconEstimate: (appraisal.reconEstimate as any) || { items: [], totalCost: 0 },
    profitAnalysis: {
      acv,
      projectedRetail,
      estimatedProfit,
      profitMargin,
      daysToTurn: marketData.avgDaysOnMarket,
      roi: acv > 0 ? (estimatedProfit / acv) * 100 : 0,
    },
    marketData,
    appraiser: {
      id: appraisal.appraiser.id,
      name: `${appraisal.appraiser.firstName} ${appraisal.appraiser.lastName}`,
    },
    manager: appraisal.manager
      ? {
          id: appraisal.manager.id,
          name: `${appraisal.manager.firstName} ${appraisal.manager.lastName}`,
        }
      : undefined,
    createdAt: appraisal.createdAt,
    updatedAt: appraisal.updatedAt,
    expiresAt: appraisal.expiresAt || undefined,
  };
}

/**
 * Update appraisal
 */
export async function updateAppraisal(
  id: string,
  tenantId: string,
  userId: string,
  updates: UpdateAppraisalInput
) {
  const existing = await db.appraisal.findUnique({
    where: { id },
    select: { tenantId: true, status: true },
  });

  if (!existing || existing.tenantId !== tenantId) {
    throw new Error('Appraisal not found');
  }

  if (existing.status === 'APPROVED' || existing.status === 'REJECTED') {
    throw new Error('Cannot update approved or rejected appraisal');
  }

  // Recalculate condition score if relevant fields changed
  let conditionScore = updates.conditionScore;
  if (updates.conditionGrade || updates.mileage) {
    conditionScore = calculateConditionScore(
      updates.conditionGrade || 'AVERAGE',
      updates.mileage || 0,
      2020, // TODO: Get actual year
      updates.warningLights?.length || 0
    );
  }

  const appraisal = await db.appraisal.update({
    where: { id },
    data: {
      ...updates,
      conditionScore,
      estimatedValue: updates.estimatedValue !== undefined ? updates.estimatedValue : undefined,
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      tenantId,
      userId,
      type: 'APPRAISAL_UPDATED',
      entityType: 'APPRAISAL',
      entityId: id,
      description: 'Updated appraisal details',
      metadata: updates,
    },
  });

  return appraisal;
}

/**
 * Submit appraisal for manager approval
 */
export async function submitAppraisal(id: string, tenantId: string, userId: string) {
  const appraisal = await db.appraisal.findUnique({
    where: { id },
    select: { tenantId: true, status: true },
  });

  if (!appraisal || appraisal.tenantId !== tenantId) {
    throw new Error('Appraisal not found');
  }

  if (appraisal.status !== 'DRAFT') {
    throw new Error('Appraisal already submitted');
  }

  const updated = await db.appraisal.update({
    where: { id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      tenantId,
      userId,
      type: 'APPRAISAL_SUBMITTED',
      entityType: 'APPRAISAL',
      entityId: id,
      description: 'Submitted appraisal for manager review',
    },
  });

  return updated;
}

/**
 * Manager approval/rejection of appraisal
 */
export async function processApprovalDecision(decision: AppraisalApprovalDecision) {
  const appraisal = await db.appraisal.findUnique({
    where: { id: decision.appraisalId },
  });

  if (!appraisal) {
    throw new Error('Appraisal not found');
  }

  if (appraisal.status !== 'SUBMITTED' && appraisal.status !== 'IN_REVIEW') {
    throw new Error('Appraisal not in reviewable state');
  }

  let expiresAt = appraisal.expiresAt;
  if (decision.approved && decision.expiresInHours) {
    expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + decision.expiresInHours);
  }

  const updated = await db.appraisal.update({
    where: { id: decision.appraisalId },
    data: {
      status: decision.approved ? 'APPROVED' : 'REJECTED',
      managerId: decision.managerId,
      approvedAt: decision.approved ? new Date() : null,
      rejectedAt: decision.approved ? null : new Date(),
      aiSuggestedValue: decision.offerAmount || appraisal.aiSuggestedValue,
      expiresAt,
      notes: decision.notes
        ? `${appraisal.notes || ''}\n\nManager: ${decision.notes}`.trim()
        : appraisal.notes,
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      tenantId: appraisal.tenantId,
      userId: decision.managerId,
      type: decision.approved ? 'APPRAISAL_APPROVED' : 'APPRAISAL_REJECTED',
      entityType: 'APPRAISAL',
      entityId: decision.appraisalId,
      description: decision.approved
        ? `Approved appraisal with offer of $${decision.offerAmount || 0}`
        : 'Rejected appraisal',
      metadata: {
        offerAmount: decision.offerAmount,
        reason: decision.adjustmentReason,
      },
    },
  });

  return updated;
}

/**
 * Convert approved appraisal to inventory
 */
export async function convertAppraisalToInventory(input: ConvertToInventoryInput) {
  const appraisal = await db.appraisal.findUnique({
    where: { id: input.appraisalId },
    include: {
      reconItems: true,
    },
  });

  if (!appraisal || appraisal.tenantId !== input.tenantId) {
    throw new Error('Appraisal not found');
  }

  if (appraisal.status !== 'APPROVED') {
    throw new Error('Only approved appraisals can be converted to inventory');
  }

  // Create vehicle in inventory
  const vehicle = await db.vehicle.create({
    data: {
      tenantId: input.tenantId,
      stockNumber: input.stockNumber,
      vin: appraisal.vin,
      type: determineVehicleType(appraisal.year!, appraisal.mileage!),
      year: appraisal.year!,
      make: appraisal.make!,
      model: appraisal.model!,
      trim: appraisal.trim,
      exteriorColor: appraisal.exteriorColor,
      interiorColor: appraisal.interiorColor,
      mileage: appraisal.mileage,
      costCents: input.costCents,
      priceCents: input.priceCents,
      status: (input.status as any) || 'RECON',
      locationId: input.locationId,
      imageUrls: appraisal.photos,
      daysInStock: 0,
      acquiredDate: new Date(),
      acquiredFrom: 'Trade-In',
      fuelType: 'GASOLINE', // Default
      condition: mapConditionGradeToVehicleCondition(appraisal.conditionGrade!),
    },
  });

  // Link appraisal to vehicle
  await db.appraisal.update({
    where: { id: input.appraisalId },
    data: {
      vehicleId: vehicle.id,
    },
  });

  // Copy recon items to vehicle
  if (appraisal.reconItems && appraisal.reconItems.length > 0) {
    await db.reconItem.createMany({
      data: appraisal.reconItems.map(item => ({
        tenantId: input.tenantId,
        vehicleId: vehicle.id,
        title: item.title,
        description: item.description,
        category: item.category,
        estimatedCost: item.estimatedCost,
        status: 'PENDING',
      })),
    });
  }

  // Log activity
  await db.activity.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      type: 'APPRAISAL_CONVERTED_TO_INVENTORY',
      entityType: 'VEHICLE',
      entityId: vehicle.id,
      description: `Converted appraisal to inventory (Stock: ${input.stockNumber})`,
      metadata: {
        appraisalId: input.appraisalId,
        vin: vehicle.vin,
        stockNumber: input.stockNumber,
      },
    },
  });

  return vehicle;
}

/**
 * Get list of appraisals with filters
 */
export async function getAppraisals(filters: {
  tenantId: string;
  status?: AppraisalStatus[];
  appraiserId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const where: Prisma.AppraisalWhereInput = {
    tenantId: filters.tenantId,
  };

  if (filters.status) {
    where.status = { in: filters.status };
  }

  if (filters.appraiserId) {
    where.appraiserId = filters.appraiserId;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
    if (filters.dateTo) where.createdAt.lte = filters.dateTo;
  }

  const appraisals = await db.appraisal.findMany({
    where,
    include: {
      appraiser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return appraisals.map(a => ({
    ...a,
    appraiserName: `${a.appraiser.firstName} ${a.appraiser.lastName}`,
    managerName: a.manager ? `${a.manager.firstName} ${a.manager.lastName}` : null,
  }));
}

// Helper functions

function mapConditionGradeToValuation(
  grade: AppraisalConditionGrade
): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
  const map: Record<AppraisalConditionGrade, any> = {
    EXCELLENT: 'EXCELLENT',
    CLEAN: 'GOOD',
    AVERAGE: 'FAIR',
    ROUGH: 'POOR',
  };
  return map[grade];
}

function mapConditionGradeToVehicleCondition(grade: AppraisalConditionGrade): string {
  const map: Record<AppraisalConditionGrade, string> = {
    EXCELLENT: 'EXCELLENT',
    CLEAN: 'GOOD',
    AVERAGE: 'FAIR',
    ROUGH: 'POOR',
  };
  return map[grade];
}

function calculateConditionScore(
  grade: AppraisalConditionGrade,
  mileage: number,
  year: number,
  warningLightsCount: number
): number {
  let score = 0;

  // Base score from condition grade
  const gradeScores = {
    EXCELLENT: 90,
    CLEAN: 75,
    AVERAGE: 60,
    ROUGH: 40,
  };
  score = gradeScores[grade];

  // Adjust for mileage
  const avgMileageForYear = (new Date().getFullYear() - year) * 12000;
  if (mileage < avgMileageForYear * 0.7) score += 10;
  else if (mileage > avgMileageForYear * 1.3) score -= 10;

  // Deduct for warning lights
  score -= warningLightsCount * 5;

  return Math.max(0, Math.min(100, score));
}

async function estimateReconCosts(
  vehicle: {
    year: number;
    make: string;
    model: string;
    mileage: number;
    conditionGrade: AppraisalConditionGrade;
    warningLights: string[];
  },
  tenantId: string
): Promise<ReconEstimate> {
  const items: ReconEstimate['items'] = [];

  // Base detailing
  items.push({
    category: 'DETAILING',
    description: 'Full interior and exterior detailing',
    estimatedCost: 150,
    priority: 'HIGH',
    required: true,
  });

  // Condition-based items
  if (vehicle.conditionGrade === 'ROUGH' || vehicle.conditionGrade === 'AVERAGE') {
    items.push({
      category: 'BODY',
      description: 'Paint touch-up and minor body work',
      estimatedCost: 400,
      priority: 'MEDIUM',
      required: true,
    });
  }

  // Mileage-based maintenance
  const avgMileage = (new Date().getFullYear() - vehicle.year) * 12000;
  if (vehicle.mileage > avgMileage * 1.2) {
    items.push({
      category: 'MECHANICAL',
      description: 'Brake inspection and service',
      estimatedCost: 300,
      priority: 'HIGH',
      required: true,
    });
  }

  // Warning lights
  if (vehicle.warningLights.length > 0) {
    items.push({
      category: 'MECHANICAL',
      description: 'Diagnostic scan and repair',
      estimatedCost: 500,
      priority: 'HIGH',
      required: true,
    });
  }

  // Tires (if high mileage)
  if (vehicle.mileage > 60000) {
    items.push({
      category: 'TIRES',
      description: 'Tire replacement (if needed)',
      estimatedCost: 600,
      priority: 'MEDIUM',
      required: false,
    });
  }

  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const estimatedDays = Math.ceil(items.filter(i => i.required).length * 1.5);

  return {
    items,
    totalCost,
    estimatedDays,
  };
}

async function getMarketDataForAppraisal(appraisal: any) {
  // Get market comps (simplified)
  const comps = await db.marketComp.findMany({
    where: {
      year: appraisal.year,
      make: appraisal.make,
      model: appraisal.model,
      distance: { lte: 100 },
    },
    take: 20,
  });

  const avgPrice = comps.length > 0
    ? comps.reduce((sum, c) => sum + c.priceCents, 0) / comps.length / 100
    : 0;

  const avgDaysOnMarket = comps.length > 0
    ? comps.reduce((sum, c) => sum + (c.daysOnMarket || 0), 0) / comps.length
    : 45;

  return {
    localComps: comps.length,
    avgMarketPrice: avgPrice,
    demandScore: avgDaysOnMarket < 30 ? 80 : avgDaysOnMarket < 45 ? 60 : 40,
    avgDaysOnMarket: Math.round(avgDaysOnMarket),
    marketVelocity: avgDaysOnMarket < 30 ? 'FAST' : avgDaysOnMarket < 45 ? 'AVERAGE' : 'SLOW',
  };
}

function determineVehicleType(year: number, mileage: number): VehicleType {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age <= 1 && mileage < 15000) return 'NEW';
  if (age <= 5 && mileage < 50000) return 'CPO'; // Could be certified
  return 'USED';
}

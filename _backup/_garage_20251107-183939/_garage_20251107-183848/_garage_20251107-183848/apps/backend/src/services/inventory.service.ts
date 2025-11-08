/**
 * Inventory Management Service
 * Handles vehicle inventory operations, tracking, pricing, and analytics
 */

import { db } from '@repo/db';
import { VehicleStatus, VehicleType, Prisma } from '@prisma/client';

export interface InventoryFilters {
  tenantId: string;
  status?: VehicleStatus[];
  type?: VehicleType[];
  year?: { min?: number; max?: number };
  make?: string[];
  model?: string[];
  locationId?: string;
  priceMin?: number;
  priceMax?: number;
  daysInStockMin?: number;
  daysInStockMax?: number;
  search?: string;
}

export interface CreateVehicleInput {
  tenantId: string;
  stockNumber: string;
  vin: string;
  type: VehicleType;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyStyle?: string;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  engineType?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType: string;
  condition?: string;
  costCents?: number;
  msrpCents?: number;
  priceCents?: number;
  minPriceCents?: number;
  locationId?: string;
  acquiredFrom?: string;
  acquiredDate?: Date;
  features?: string[];
  images?: string[];
  primaryImageUrl?: string;
  certifiedPreOwned?: boolean;
  notes?: string;
}

export interface UpdateVehicleInput {
  stockNumber?: string;
  status?: VehicleStatus;
  mileage?: number;
  condition?: string;
  costCents?: number;
  msrpCents?: number;
  priceCents?: number;
  minPriceCents?: number;
  locationId?: string;
  exteriorColor?: string;
  interiorColor?: string;
  features?: string[];
  images?: string[];
  primaryImageUrl?: string;
  certifiedPreOwned?: boolean;
  notes?: string;
  reconEstimate?: number;
  reconActual?: number;
  reconCompletedAt?: Date;
  agingBucket?: string;
}

export interface PriceUpdateInput {
  priceCents: number;
  minPriceCents?: number;
  pricingNotes?: string;
  userId: string;
}

/**
 * Get inventory with advanced filtering
 */
export async function getInventory(filters: InventoryFilters) {
  const {
    tenantId,
    status,
    type,
    year,
    make,
    model,
    locationId,
    priceMin,
    priceMax,
    daysInStockMin,
    daysInStockMax,
    search,
  } = filters;

  const where: Prisma.VehicleWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (status && status.length > 0) {
    where.status = { in: status };
  }

  if (type && type.length > 0) {
    where.type = { in: type };
  }

  if (year) {
    where.year = {};
    if (year.min) where.year.gte = year.min;
    if (year.max) where.year.lte = year.max;
  }

  if (make && make.length > 0) {
    where.make = { in: make };
  }

  if (model && model.length > 0) {
    where.model = { in: model };
  }

  if (locationId) {
    where.locationId = locationId;
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    where.priceCents = {};
    if (priceMin !== undefined) where.priceCents.gte = priceMin * 100;
    if (priceMax !== undefined) where.priceCents.lte = priceMax * 100;
  }

  if (daysInStockMin !== undefined || daysInStockMax !== undefined) {
    where.daysInStock = {};
    if (daysInStockMin !== undefined) where.daysInStock.gte = daysInStockMin;
    if (daysInStockMax !== undefined) where.daysInStock.lte = daysInStockMax;
  }

  if (search) {
    where.OR = [
      { vin: { contains: search, mode: 'insensitive' } },
      { stockNumber: { contains: search, mode: 'insensitive' } },
      { make: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
  }

  const vehicles = await db.vehicle.findMany({
    where,
    include: {
      locationRef: {
        select: {
          id: true,
          name: true,
        },
      },
      deals: {
        where: {
          status: { in: ['WORKING', 'PENDING', 'APPROVED'] },
        },
        select: {
          id: true,
          status: true,
          salesperson: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  return vehicles.map((vehicle) => ({
    ...vehicle,
    price: vehicle.priceCents ? vehicle.priceCents / 100 : null,
    cost: vehicle.costCents ? vehicle.costCents / 100 : null,
    msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : null,
    minPrice: vehicle.minPriceCents ? vehicle.minPriceCents / 100 : null,
    grossProfit: vehicle.priceCents && vehicle.costCents
      ? (vehicle.priceCents - vehicle.costCents) / 100
      : null,
    hasActiveDeals: vehicle.deals.length > 0,
    activeDealCount: vehicle.deals.length,
  }));
}

/**
 * Get a single vehicle by ID with full details
 */
export async function getVehicleById(id: string, tenantId: string) {
  const vehicle = await db.vehicle.findUnique({
    where: { id },
    include: {
      locationRef: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      deals: {
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          salesperson: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      priceHistory: {
        orderBy: { changedAt: 'desc' },
        take: 10,
      },
      appraisals: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      serviceOrders: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      reconItems: {
        orderBy: { createdAt: 'desc' },
      },
      histories: {
        orderBy: { timestamp: 'desc' },
        take: 20,
      },
    },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  if (vehicle.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  return {
    ...vehicle,
    price: vehicle.priceCents ? vehicle.priceCents / 100 : null,
    cost: vehicle.costCents ? vehicle.costCents / 100 : null,
    msrp: vehicle.msrpCents ? vehicle.msrpCents / 100 : null,
    minPrice: vehicle.minPriceCents ? vehicle.minPriceCents / 100 : null,
    grossProfit: vehicle.priceCents && vehicle.costCents
      ? (vehicle.priceCents - vehicle.costCents) / 100
      : null,
  };
}

/**
 * Create a new vehicle in inventory
 */
export async function createVehicle(input: CreateVehicleInput) {
  // Check if VIN already exists
  const existingVehicle = await db.vehicle.findUnique({
    where: { vin: input.vin },
  });

  if (existingVehicle && !existingVehicle.deletedAt) {
    throw new Error('Vehicle with this VIN already exists');
  }

  // Calculate days in stock
  const daysInStock = input.acquiredDate
    ? Math.floor((Date.now() - input.acquiredDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const vehicle = await db.vehicle.create({
    data: {
      tenantId: input.tenantId,
      stockNumber: input.stockNumber,
      vin: input.vin,
      type: input.type,
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim,
      bodyStyle: input.bodyStyle,
      exteriorColor: input.exteriorColor,
      interiorColor: input.interiorColor,
      mileage: input.mileage,
      engineType: input.engineType,
      transmission: input.transmission,
      drivetrain: input.drivetrain,
      fuelType: input.fuelType as any,
      condition: input.condition as any,
      costCents: input.costCents,
      msrpCents: input.msrpCents,
      priceCents: input.priceCents,
      minPriceCents: input.minPriceCents,
      locationId: input.locationId,
      acquiredFrom: input.acquiredFrom,
      acquiredDate: input.acquiredDate,
      daysInStock,
      features: input.features || [],
      imageUrls: input.images || [],
      primaryImageUrl: input.primaryImageUrl,
      certifiedPreOwned: input.certifiedPreOwned || false,
      notes: input.notes,
    },
    include: {
      locationRef: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      tenantId: input.tenantId,
      userId: input.tenantId, // TODO: Pass actual user ID
      type: 'VEHICLE_ADDED',
      entityType: 'VEHICLE',
      entityId: vehicle.id,
      description: `Added vehicle ${input.year} ${input.make} ${input.model} (Stock: ${input.stockNumber})`,
      metadata: {
        vin: input.vin,
        stockNumber: input.stockNumber,
        year: input.year,
        make: input.make,
        model: input.model,
      },
    },
  });

  return vehicle;
}

/**
 * Update a vehicle
 */
export async function updateVehicle(
  id: string,
  tenantId: string,
  userId: string,
  updates: UpdateVehicleInput
) {
  // Verify vehicle exists and belongs to tenant
  const existingVehicle = await db.vehicle.findUnique({
    where: { id },
    select: { tenantId: true, status: true, priceCents: true },
  });

  if (!existingVehicle) {
    throw new Error('Vehicle not found');
  }

  if (existingVehicle.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  const vehicle = await db.vehicle.update({
    where: { id },
    data: updates,
    include: {
      locationRef: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Log status changes
  if (updates.status && updates.status !== existingVehicle.status) {
    await db.activity.create({
      data: {
        tenantId,
        userId,
        type: 'VEHICLE_STATUS_CHANGED',
        entityType: 'VEHICLE',
        entityId: id,
        description: `Changed vehicle status from ${existingVehicle.status} to ${updates.status}`,
        metadata: {
          oldStatus: existingVehicle.status,
          newStatus: updates.status,
        },
      },
    });
  }

  return vehicle;
}

/**
 * Delete (soft delete) a vehicle
 */
export async function deleteVehicle(id: string, tenantId: string, userId: string) {
  // Verify vehicle exists and belongs to tenant
  const existingVehicle = await db.vehicle.findUnique({
    where: { id },
    select: { tenantId: true, stockNumber: true, make: true, model: true, year: true },
  });

  if (!existingVehicle) {
    throw new Error('Vehicle not found');
  }

  if (existingVehicle.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  await db.vehicle.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  // Log deletion
  await db.activity.create({
    data: {
      tenantId,
      userId,
      type: 'VEHICLE_DELETED',
      entityType: 'VEHICLE',
      entityId: id,
      description: `Deleted vehicle ${existingVehicle.year} ${existingVehicle.make} ${existingVehicle.model} (Stock: ${existingVehicle.stockNumber})`,
    },
  });
}

/**
 * Update vehicle status
 */
export async function updateVehicleStatus(
  id: string,
  tenantId: string,
  userId: string,
  status: VehicleStatus,
  notes?: string
) {
  const vehicle = await db.vehicle.findUnique({
    where: { id },
    select: { tenantId: true, status: true },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  if (vehicle.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  const updatedVehicle = await db.vehicle.update({
    where: { id },
    data: {
      status,
      ...(status === 'SOLD' && { dateSold: new Date() }),
    },
  });

  // Log status change
  await db.activity.create({
    data: {
      tenantId,
      userId,
      type: 'VEHICLE_STATUS_CHANGED',
      entityType: 'VEHICLE',
      entityId: id,
      description: `Changed vehicle status from ${vehicle.status} to ${status}`,
      metadata: {
        oldStatus: vehicle.status,
        newStatus: status,
        notes,
      },
    },
  });

  return updatedVehicle;
}

/**
 * Update vehicle price
 */
export async function updateVehiclePrice(
  id: string,
  tenantId: string,
  priceUpdate: PriceUpdateInput
) {
  const vehicle = await db.vehicle.findUnique({
    where: { id },
    select: { tenantId: true, priceCents: true, stockNumber: true },
  });

  if (!vehicle) {
    throw new Error('Vehicle not found');
  }

  if (vehicle.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  // Update vehicle price
  const updatedVehicle = await db.vehicle.update({
    where: { id },
    data: {
      priceCents: priceUpdate.priceCents,
      minPriceCents: priceUpdate.minPriceCents,
      pricingNotes: priceUpdate.pricingNotes,
      lastPriceChangeDate: new Date(),
    },
  });

  // Create price history record
  await db.priceHistory.create({
    data: {
      tenantId,
      vehicleId: id,
      priceCents: priceUpdate.priceCents,
      previousPriceCents: vehicle.priceCents,
      changedBy: priceUpdate.userId,
      reason: priceUpdate.pricingNotes || 'Manual price adjustment',
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      tenantId,
      userId: priceUpdate.userId,
      type: 'VEHICLE_PRICE_CHANGED',
      entityType: 'VEHICLE',
      entityId: id,
      description: `Changed price from $${vehicle.priceCents ? vehicle.priceCents / 100 : 0} to $${priceUpdate.priceCents / 100}`,
      metadata: {
        oldPrice: vehicle.priceCents,
        newPrice: priceUpdate.priceCents,
        stockNumber: vehicle.stockNumber,
      },
    },
  });

  return updatedVehicle;
}

/**
 * Get inventory metrics for dashboard
 */
export async function getInventoryMetrics(tenantId: string) {
  const [
    totalInventory,
    availableCount,
    soldThisMonth,
    avgDaysInStock,
    totalInventoryValue,
    statusDistribution,
    typeDistribution,
  ] = await Promise.all([
    // Total inventory count
    db.vehicle.count({
      where: {
        tenantId,
        deletedAt: null,
      },
    }),

    // Available vehicles
    db.vehicle.count({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['AVAILABLE', 'IN_STOCK'] },
      },
    }),

    // Sold this month
    db.vehicle.count({
      where: {
        tenantId,
        status: 'SOLD',
        dateSold: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    // Average days in stock
    db.vehicle.aggregate({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['AVAILABLE', 'IN_STOCK'] },
      },
      _avg: {
        daysInStock: true,
      },
    }),

    // Total inventory value
    db.vehicle.aggregate({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ['AVAILABLE', 'IN_STOCK'] },
      },
      _sum: {
        costCents: true,
      },
    }),

    // Status distribution
    db.vehicle.groupBy({
      by: ['status'],
      where: {
        tenantId,
        deletedAt: null,
      },
      _count: { id: true },
    }),

    // Type distribution
    db.vehicle.groupBy({
      by: ['type'],
      where: {
        tenantId,
        deletedAt: null,
      },
      _count: { id: true },
    }),
  ]);

  return {
    totalInventory,
    availableCount,
    soldThisMonth,
    avgDaysInStock: Math.round(avgDaysInStock._avg.daysInStock || 0),
    totalInventoryValue: totalInventoryValue._sum.costCents
      ? totalInventoryValue._sum.costCents / 100
      : 0,
    statusDistribution: statusDistribution.map((s) => ({
      status: s.status,
      count: s._count.id,
    })),
    typeDistribution: typeDistribution.map((t) => ({
      type: t.type,
      count: t._count.id,
    })),
  };
}

/**
 * Get aging analysis (vehicles grouped by days in stock)
 */
export async function getAgingAnalysis(tenantId: string) {
  const vehicles = await db.vehicle.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: { in: ['AVAILABLE', 'IN_STOCK'] },
    },
    select: {
      id: true,
      stockNumber: true,
      year: true,
      make: true,
      model: true,
      daysInStock: true,
      priceCents: true,
      costCents: true,
    },
  });

  // Group by aging buckets
  const buckets = {
    '0-30': [] as any[],
    '31-60': [] as any[],
    '61-90': [] as any[],
    '91-120': [] as any[],
    '121+': [] as any[],
  };

  vehicles.forEach((vehicle) => {
    const days = vehicle.daysInStock || 0;
    if (days <= 30) buckets['0-30'].push(vehicle);
    else if (days <= 60) buckets['31-60'].push(vehicle);
    else if (days <= 90) buckets['61-90'].push(vehicle);
    else if (days <= 120) buckets['91-120'].push(vehicle);
    else buckets['121+'].push(vehicle);
  });

  return {
    buckets: Object.entries(buckets).map(([range, vehicles]) => ({
      range,
      count: vehicles.length,
      totalValue: vehicles.reduce((sum, v) => sum + (v.costCents || 0), 0) / 100,
      vehicles: vehicles.map((v) => ({
        id: v.id,
        stockNumber: v.stockNumber,
        description: `${v.year} ${v.make} ${v.model}`,
        daysInStock: v.daysInStock,
        price: v.priceCents ? v.priceCents / 100 : null,
      })),
    })),
  };
}

/**
 * Get turn rate metrics
 */
export async function getTurnRateMetrics(tenantId: string, months: number = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const soldVehicles = await db.vehicle.findMany({
    where: {
      tenantId,
      status: 'SOLD',
      dateSold: {
        gte: startDate,
      },
    },
    select: {
      dateSold: true,
      daysInStock: true,
      acquiredDate: true,
    },
  });

  const avgInventory = await db.vehicle.count({
    where: {
      tenantId,
      deletedAt: null,
      status: { in: ['AVAILABLE', 'IN_STOCK'] },
    },
  });

  const soldCount = soldVehicles.length;
  const turnRate = avgInventory > 0 ? (soldCount / avgInventory) * (12 / months) : 0;

  const avgTimeToSell =
    soldVehicles.length > 0
      ? soldVehicles.reduce((sum, v) => sum + (v.daysInStock || 0), 0) / soldVehicles.length
      : 0;

  return {
    period: `${months} months`,
    soldCount,
    avgInventory,
    turnRate: Math.round(turnRate * 100) / 100,
    avgTimeToSell: Math.round(avgTimeToSell),
  };
}

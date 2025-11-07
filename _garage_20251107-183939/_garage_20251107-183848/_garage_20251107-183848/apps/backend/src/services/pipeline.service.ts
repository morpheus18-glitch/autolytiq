/**
 * CRM Pipeline Service
 * Manages deal pipeline operations and stage transitions
 */

import { db } from '@repo/db';
import { DealStage, DealStatus, Prisma } from '@prisma/client';

export interface PipelineFilters {
  tenantId: string;
  salesPersonId?: string;
  salesManagerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: DealStatus[];
  minValue?: number;
  maxValue?: number;
}

export interface PipelineDeal {
  id: string;
  stage: DealStage;
  status: DealStatus;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    vin: string;
  } | null;
  salesperson: {
    id: string;
    name: string;
  } | null;
  sellingPrice: number | null;
  grossProfit: number | null;
  createdAt: Date;
  updatedAt: Date;
  daysInStage: number;
  totalDays: number;
}

export interface PipelineColumn {
  stage: DealStage;
  deals: PipelineDeal[];
  totalDeals: number;
  totalValue: number;
  avgDaysInStage: number;
}

export interface PipelineData {
  columns: PipelineColumn[];
  summary: {
    totalDeals: number;
    totalValue: number;
    avgDealValue: number;
    avgDaysToClose: number;
  };
}

/**
 * Get pipeline data with deals grouped by stage
 */
export async function getPipelineData(filters: PipelineFilters): Promise<PipelineData> {
  const { tenantId, salesPersonId, salesManagerId, dateFrom, dateTo, status, minValue, maxValue } =
    filters;

  // Build where clause
  const where: Prisma.DealWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (salesPersonId) {
    where.salesPersonId = salesPersonId;
  }

  if (salesManagerId) {
    where.salesManagerId = salesManagerId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  if (status && status.length > 0) {
    where.status = { in: status };
  }

  if (minValue !== undefined || maxValue !== undefined) {
    where.sellingPrice = {};
    if (minValue !== undefined) where.sellingPrice.gte = minValue;
    if (maxValue !== undefined) where.sellingPrice.lte = maxValue;
  }

  // Fetch all deals
  const deals = await db.deal.findMany({
    where,
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
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true,
        },
      },
      salesPerson: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      stageTransitions: {
        orderBy: { transitionedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [{ stage: 'asc' }, { createdAt: 'desc' }],
  });

  // Group deals by stage
  const stages: DealStage[] = [
    'LEAD',
    'WORKING',
    'PENDING_FINANCE',
    'APPROVED',
    'PENDING_DELIVERY',
    'DELIVERED',
    'LOST',
  ];

  const columns: PipelineColumn[] = stages.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);

    const pipelineDeals: PipelineDeal[] = stageDeals.map((deal) => {
      const now = new Date();
      const createdAt = new Date(deal.createdAt);
      const totalDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate days in current stage
      const lastTransition = deal.stageTransitions[0];
      const stageStartDate = lastTransition ? new Date(lastTransition.transitionedAt) : createdAt;
      const daysInStage = Math.floor(
        (now.getTime() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: deal.id,
        stage: deal.stage,
        status: deal.status,
        customer: {
          id: deal.customer.id,
          name: `${deal.customer.firstName} ${deal.customer.lastName}`,
          email: deal.customer.email,
          phone: deal.customer.phone,
        },
        vehicle: deal.vehicle
          ? {
              id: deal.vehicle.id,
              year: deal.vehicle.year,
              make: deal.vehicle.make,
              model: deal.vehicle.model,
              vin: deal.vehicle.vin,
            }
          : null,
        salesperson: deal.salesPerson
          ? {
              id: deal.salesPerson.id,
              name: `${deal.salesPerson.firstName} ${deal.salesPerson.lastName}`,
            }
          : null,
        sellingPrice: deal.sellingPrice ? parseFloat(deal.sellingPrice) : null,
        grossProfit: deal.grossProfit ? parseFloat(deal.grossProfit) : null,
        createdAt: deal.createdAt,
        updatedAt: deal.updatedAt,
        daysInStage,
        totalDays,
      };
    });

    const totalValue = pipelineDeals.reduce((sum, d) => sum + (d.sellingPrice || 0), 0);
    const avgDaysInStage =
      pipelineDeals.length > 0
        ? pipelineDeals.reduce((sum, d) => sum + d.daysInStage, 0) / pipelineDeals.length
        : 0;

    return {
      stage,
      deals: pipelineDeals,
      totalDeals: pipelineDeals.length,
      totalValue,
      avgDaysInStage: Math.round(avgDaysInStage),
    };
  });

  // Calculate summary
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + parseFloat(d.sellingPrice || '0'), 0);
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  // Calculate average days to close for delivered deals
  const deliveredDeals = deals.filter((d) => d.stage === 'DELIVERED');
  const avgDaysToClose =
    deliveredDeals.length > 0
      ? deliveredDeals.reduce((sum, d) => {
          const days = Math.floor(
            (new Date(d.updatedAt).getTime() - new Date(d.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0) / deliveredDeals.length
      : 0;

  return {
    columns,
    summary: {
      totalDeals,
      totalValue,
      avgDealValue,
      avgDaysToClose: Math.round(avgDaysToClose),
    },
  };
}

/**
 * Move deal to a new stage
 */
export async function moveDealToStage(
  dealId: string,
  newStage: DealStage,
  userId: string,
  tenantId: string,
  notes?: string
): Promise<void> {
  const deal = await db.deal.findUnique({
    where: { id: dealId },
    select: { stage: true, tenantId: true },
  });

  if (!deal) {
    throw new Error('Deal not found');
  }

  if (deal.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  const oldStage = deal.stage;

  // Update deal stage
  await db.deal.update({
    where: { id: dealId },
    data: {
      stage: newStage,
      updatedAt: new Date(),
    },
  });

  // Create stage transition record
  await db.stageTransition.create({
    data: {
      tenantId,
      dealId,
      fromStage: oldStage,
      toStage: newStage,
      transitionedBy: userId,
      transitionedAt: new Date(),
      notes,
    },
  });

  // Create activity log
  await db.activity.create({
    data: {
      tenantId,
      userId,
      type: 'STAGE_CHANGE',
      entityType: 'DEAL',
      entityId: dealId,
      description: `Moved deal from ${oldStage} to ${newStage}`,
      metadata: {
        oldStage,
        newStage,
        notes,
      },
    },
  });
}

/**
 * Bulk update deals
 */
export async function bulkUpdateDeals(
  dealIds: string[],
  updates: {
    stage?: DealStage;
    status?: DealStatus;
    salesPersonId?: string;
    salesManagerId?: string;
  },
  userId: string,
  tenantId: string
): Promise<void> {
  // Verify all deals belong to this tenant
  const deals = await db.deal.findMany({
    where: {
      id: { in: dealIds },
      tenantId,
    },
    select: { id: true, stage: true },
  });

  if (deals.length !== dealIds.length) {
    throw new Error('Some deals not found or unauthorized');
  }

  // Update all deals
  await db.deal.updateMany({
    where: {
      id: { in: dealIds },
      tenantId,
    },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
  });

  // If stage is being updated, create stage transitions
  if (updates.stage) {
    const transitions = deals.map((deal) => ({
      tenantId,
      dealId: deal.id,
      fromStage: deal.stage,
      toStage: updates.stage!,
      transitionedBy: userId,
      transitionedAt: new Date(),
    }));

    await db.stageTransition.createMany({
      data: transitions,
    });
  }

  // Create bulk activity log
  await db.activity.create({
    data: {
      tenantId,
      userId,
      type: 'BULK_UPDATE',
      entityType: 'DEAL',
      description: `Bulk updated ${dealIds.length} deals`,
      metadata: {
        dealIds,
        updates,
      },
    },
  });
}

/**
 * Get pipeline statistics
 */
export async function getPipelineStats(tenantId: string, dateFrom?: Date, dateTo?: Date) {
  const where: Prisma.DealWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  // Get stage distribution
  const stageDistribution = await db.deal.groupBy({
    by: ['stage'],
    where,
    _count: { id: true },
    _sum: { sellingPrice: true },
  });

  // Get conversion rates
  const totalDeals = await db.deal.count({ where });
  const deliveredDeals = await db.deal.count({
    where: { ...where, stage: 'DELIVERED' },
  });
  const lostDeals = await db.deal.count({
    where: { ...where, stage: 'LOST' },
  });

  const conversionRate = totalDeals > 0 ? (deliveredDeals / totalDeals) * 100 : 0;
  const lossRate = totalDeals > 0 ? (lostDeals / totalDeals) * 100 : 0;

  // Get average time in each stage
  const avgTimeByStage = await db.$queryRaw<
    Array<{ stage: string; avg_days: number }>
  >`
    SELECT
      st.to_stage as stage,
      AVG(EXTRACT(DAY FROM (COALESCE(next_transition.transitioned_at, NOW()) - st.transitioned_at))) as avg_days
    FROM stage_transitions st
    LEFT JOIN LATERAL (
      SELECT transitioned_at
      FROM stage_transitions
      WHERE deal_id = st.deal_id
        AND transitioned_at > st.transitioned_at
      ORDER BY transitioned_at ASC
      LIMIT 1
    ) next_transition ON true
    WHERE st.tenant_id = ${tenantId}
    GROUP BY st.to_stage
  `;

  return {
    stageDistribution: stageDistribution.map((s) => ({
      stage: s.stage,
      count: s._count.id,
      value: parseFloat(s._sum.sellingPrice || '0'),
    })),
    conversionRate: Math.round(conversionRate * 10) / 10,
    lossRate: Math.round(lossRate * 10) / 10,
    avgTimeByStage: avgTimeByStage.map((s) => ({
      stage: s.stage,
      avgDays: Math.round(s.avg_days),
    })),
    totalDeals,
    deliveredDeals,
    lostDeals,
  };
}

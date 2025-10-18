import { Prisma } from '@prisma/client';
import { endOfDay, startOfDay, startOfMonth, subMonths } from 'date-fns';
import prisma from '../lib/prisma.js';

const CONTRACTED_STATUSES = ['Contracted', 'Funded', 'Delivered'] as const;
const APPROVED_LENDER_STATUSES = ['APPROVED', 'CONDITIONAL'] as const;

export interface DashboardFilters {
  start: Date;
  end: Date;
  lenderId?: string;
  salespersonId?: string;
}

interface DealSnapshot {
  totalFiGross: Prisma.Decimal | number | string | null;
  fiProducts: Prisma.JsonValue | null;
}

interface ParsedProduct {
  name: string;
  category: string | null;
  provider: string | null;
  price: number;
  cost: number;
}

interface DealMetrics {
  deals: number;
  productsSold: number;
  dealsWithProducts: number;
  totalGross: number;
}

const COMMISSION_SETTINGS_KEY = 'fi_commission_settings';
const defaultCommissionSettings = {
  rate: 0.25,
  volumeTarget: 15,
  volumeBonus: 500,
  grossTarget: 40000,
  grossBonus: 750,
};

type CommissionSettings = typeof defaultCommissionSettings;

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (value instanceof Prisma.Decimal) {
    return Number(value.toNumber());
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return Number.isFinite(value) ? Number(value) : 0;
}

function coerceNumberInput(input: unknown, fallback: number): number {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input;
  }
  if (typeof input === 'string') {
    const parsed = Number(input);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function normalizeProducts(fiProducts: Prisma.JsonValue | null): ParsedProduct[] {
  if (!fiProducts) {
    return [];
  }

  const raw = Array.isArray(fiProducts)
    ? (fiProducts as Array<Record<string, unknown>>)
    : typeof fiProducts === 'object'
      ? ((fiProducts as Record<string, unknown>).selectedProducts as Array<Record<string, unknown>>) ??
        ((fiProducts as Record<string, unknown>).products as Array<Record<string, unknown>>) ??
        []
      : [];

  const entries: ParsedProduct[] = [];
  for (const entry of raw) {
    if (!entry) {
      continue;
    }
    const name = String(entry.name ?? entry.title ?? '').trim();
    if (!name) {
      continue;
    }
    const category = entry.category ? String(entry.category) : null;
    const provider = entry.provider ? String(entry.provider) : entry.vendor ? String(entry.vendor) : null;
    const priceSource = entry.price ?? entry.retailPrice ?? entry.amount ?? entry.total;
    const costSource = entry.cost ?? entry.dealerCost ?? entry.baseCost;
    const price = toNumber(typeof priceSource === 'object' && priceSource !== null ? Number.NaN : (priceSource as any));
    const cost = toNumber(typeof costSource === 'object' && costSource !== null ? Number.NaN : (costSource as any));
    entries.push({ name, category, provider, price, cost });
  }
  return entries;
}

function collectMetrics(deals: DealSnapshot[]): DealMetrics {
  return deals.reduce<DealMetrics>(
    (acc, deal) => {
      const products = normalizeProducts(deal.fiProducts);
      const productCount = products.length;
      acc.deals += 1;
      acc.productsSold += productCount;
      if (productCount > 0) {
        acc.dealsWithProducts += 1;
      }
      acc.totalGross += toNumber(deal.totalFiGross);
      return acc;
    },
    { deals: 0, productsSold: 0, dealsWithProducts: 0, totalGross: 0 },
  );
}

function buildDealWhere(filters: DashboardFilters): Prisma.DealJacketWhereInput {
  const where: Prisma.DealJacketWhereInput = {
    dealDate: {
      gte: startOfDay(filters.start),
      lte: endOfDay(filters.end),
    },
  };

  if (filters.lenderId) {
    where.lenderId = filters.lenderId;
  }
  if (filters.salespersonId) {
    where.salespersonId = filters.salespersonId;
  }

  return where;
}

function buildPreviousRange(range: DashboardFilters): { start: Date; end: Date } {
  const previousStart = subMonths(range.start, 1);
  const previousEnd = subMonths(range.end, 1);
  return { start: previousStart, end: previousEnd };
}

function deriveMetric(value: number, previous: number) {
  const delta = value - previous;
  const percentChange = previous === 0 ? null : (delta / previous) * 100;
  return {
    value,
    previous,
    delta,
    percentChange,
  };
}

export const fiDashboardService = {
  resolveRange(partial?: Partial<DashboardFilters>): DashboardFilters {
    const now = new Date();
    const start = partial?.start ? startOfDay(partial.start) : startOfMonth(now);
    const end = partial?.end ? endOfDay(partial.end) : endOfDay(now);
    return {
      start,
      end,
      lenderId: partial?.lenderId,
      salespersonId: partial?.salespersonId,
    } satisfies DashboardFilters;
  },

  async getKpis(tenantId: string, filters: DashboardFilters) {
    const currentWhere: Prisma.DealJacketWhereInput = {
      ...buildDealWhere(filters),
      status: { in: [...CONTRACTED_STATUSES] },
    };

    const previousRange = buildPreviousRange(filters);
    const previousWhere: Prisma.DealJacketWhereInput = {
      ...buildDealWhere({ ...filters, ...previousRange }),
      status: { in: [...CONTRACTED_STATUSES] },
    };

    const [currentDeals, previousDeals] = await Promise.all([
      prisma.dealJacket.findMany({
        where: currentWhere,
        select: {
          id: true,
          totalFiGross: true,
          fiProducts: true,
        },
      }),
      prisma.dealJacket.findMany({
        where: previousWhere,
        select: {
          id: true,
          totalFiGross: true,
          fiProducts: true,
        },
      }),
    ]);

    const currentMetrics = collectMetrics(currentDeals);
    const previousMetrics = collectMetrics(previousDeals);

    const ppd = currentMetrics.deals === 0 ? 0 : currentMetrics.productsSold / currentMetrics.deals;
    const previousPpd = previousMetrics.deals === 0 ? 0 : previousMetrics.productsSold / previousMetrics.deals;
    const penetration = currentMetrics.deals === 0 ? 0 : (currentMetrics.dealsWithProducts / currentMetrics.deals) * 100;
    const previousPenetration =
      previousMetrics.deals === 0 ? 0 : (previousMetrics.dealsWithProducts / previousMetrics.deals) * 100;

    return {
      range: { start: filters.start.toISOString(), end: filters.end.toISOString() },
      dealsContracted: deriveMetric(currentMetrics.deals, previousMetrics.deals),
      productsPerDeal: deriveMetric(Number(ppd.toFixed(2)), Number(previousPpd.toFixed(2))),
      productPenetration: deriveMetric(Number(penetration.toFixed(2)), Number(previousPenetration.toFixed(2))),
      backGross: deriveMetric(Number(currentMetrics.totalGross.toFixed(2)), Number(previousMetrics.totalGross.toFixed(2))),
    };
  },

  async getActiveDeals(tenantId: string, filters: DashboardFilters) {
    const where: Prisma.DealJacketWhereInput = {
      ...buildDealWhere(filters),
      status: { notIn: ['Delivered', 'Cancelled'] },
    };

    const deals = await prisma.dealJacket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 12,
      select: {
        id: true,
        dealNumber: true,
        status: true,
        dealDate: true,
        contractDate: true,
        updatedAt: true,
        amountFinanced: true,
        totalFiGross: true,
        lenderId: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        vehicle: {
          select: {
            year: true,
            make: true,
            model: true,
          },
        },
        salesperson: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        fiManager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const lenderIds = [...new Set(deals.map((deal) => deal.lenderId).filter((id): id is string => Boolean(id)))];
    const lenders = lenderIds.length
      ? await prisma.lender.findMany({
          where: { id: { in: lenderIds } },
          select: { id: true, name: true },
        })
      : [];
    const lenderMap = new Map(lenders.map((entry) => [entry.id, entry.name] as const));

    return deals.map((deal) => ({
      id: deal.id,
      dealNumber: deal.dealNumber,
      status: deal.status,
      dealDate: deal.dealDate?.toISOString() ?? null,
      contractDate: deal.contractDate?.toISOString() ?? null,
      updatedAt: deal.updatedAt?.toISOString() ?? null,
      amountFinanced: toNumber(deal.amountFinanced),
      totalFiGross: toNumber(deal.totalFiGross),
      lenderId: deal.lenderId,
      lenderName: deal.lenderId ? lenderMap.get(deal.lenderId) ?? null : null,
      customerName: [deal.customer?.firstName, deal.customer?.lastName].filter(Boolean).join(' ').trim(),
      vehicle: deal.vehicle
        ? {
            year: deal.vehicle.year ?? null,
            make: deal.vehicle.make ?? null,
            model: deal.vehicle.model ?? null,
          }
        : null,
      salesperson: deal.salesperson
        ? {
            id: deal.salesperson.id,
            name: [deal.salesperson.firstName, deal.salesperson.lastName].filter(Boolean).join(' ').trim(),
          }
        : null,
      fiManager: deal.fiManager
        ? {
            id: deal.fiManager.id,
            name: [deal.fiManager.firstName, deal.fiManager.lastName].filter(Boolean).join(' ').trim(),
          }
        : null,
    }));
  },

  async getProductPerformance(tenantId: string, filters: DashboardFilters) {
    const where: Prisma.DealJacketWhereInput = {
      ...buildDealWhere(filters),
      status: { in: [...CONTRACTED_STATUSES] },
    };

    const deals = await prisma.dealJacket.findMany({
      where,
      select: {
        id: true,
        fiProducts: true,
      },
    });

    const totalDeals = deals.length;
    const aggregator = new Map<
      string,
      {
        productName: string;
        category: string | null;
        provider: string | null;
        sold: number;
        totalRevenue: number;
        totalMarkup: number;
      }
    >();

    for (const deal of deals) {
      const products = normalizeProducts(deal.fiProducts);
      for (const product of products) {
        const key = `${product.name.toLowerCase()}::${product.provider ?? ''}`;
        const existing = aggregator.get(key);
        const revenue = product.price;
        const markup = product.price - product.cost;
        if (existing) {
          existing.sold += 1;
          existing.totalRevenue += revenue;
          existing.totalMarkup += markup;
        } else {
          aggregator.set(key, {
            productName: product.name,
            category: product.category,
            provider: product.provider,
            sold: 1,
            totalRevenue: revenue,
            totalMarkup: markup,
          });
        }
      }
    }

    return Array.from(aggregator.values())
      .map((entry) => ({
        productName: entry.productName,
        category: entry.category,
        provider: entry.provider,
        soldCount: entry.sold,
        penetrationRate: totalDeals === 0 ? 0 : Number(((entry.sold / totalDeals) * 100).toFixed(2)),
        averagePrice: entry.sold === 0 ? 0 : Number((entry.totalRevenue / entry.sold).toFixed(2)),
        totalRevenue: Number(entry.totalRevenue.toFixed(2)),
        averageMarkup: entry.sold === 0 ? 0 : Number((entry.totalMarkup / entry.sold).toFixed(2)),
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  },

  async getLenderPerformance(tenantId: string, filters: DashboardFilters) {
    const submissionWhere: Prisma.LenderSubmissionWhereInput = {
      createdAt: {
        gte: startOfDay(filters.start),
        lte: endOfDay(filters.end),
      },
    };

    if (filters.salespersonId) {
      submissionWhere.deal = { salespersonId: filters.salespersonId };
    }
    if (filters.lenderId) {
      submissionWhere.lenderId = filters.lenderId;
    }

    const [submittedGroup, approvedGroup, aprGroup] = await Promise.all([
      prisma.lenderSubmission.groupBy({
        by: ['lenderId'],
        where: submissionWhere,
        _count: { _all: true },
      }),
      prisma.lenderSubmission.groupBy({
        by: ['lenderId'],
        where: { ...submissionWhere, status: { in: [...APPROVED_LENDER_STATUSES] } },
        _count: { _all: true },
      }),
      prisma.dealJacket.groupBy({
        by: ['lenderId'],
        where: {
          ...buildDealWhere(filters),
          lenderId: { not: null },
          status: { in: [...CONTRACTED_STATUSES] },
        },
        _avg: { apr: true },
      }),
    ]);

    const lenderIds = new Set<string>();
    for (const entry of submittedGroup) {
      if (entry.lenderId) lenderIds.add(entry.lenderId);
    }
    for (const entry of approvedGroup) {
      if (entry.lenderId) lenderIds.add(entry.lenderId);
    }
    for (const entry of aprGroup) {
      if (entry.lenderId) lenderIds.add(entry.lenderId);
    }

    if (filters.lenderId) {
      lenderIds.add(filters.lenderId);
    }

    const lenders = lenderIds.size
      ? await prisma.lender.findMany({
          where: { id: { in: Array.from(lenderIds) } },
          select: { id: true, name: true },
        })
      : [];

    const submittedMap = new Map(submittedGroup.map((entry) => [entry.lenderId ?? 'unknown', entry._count._all] as const));
    const approvedMap = new Map(approvedGroup.map((entry) => [entry.lenderId ?? 'unknown', entry._count._all] as const));
    const aprMap = new Map(aprGroup.map((entry) => [entry.lenderId ?? 'unknown', toNumber(entry._avg.apr)] as const));

    return Array.from(lenders)
      .map((lender) => {
        const lenderKey = lender.id ?? 'unknown';
        const submitted = submittedMap.get(lenderKey) ?? 0;
        const approved = approvedMap.get(lenderKey) ?? 0;
        const approvalRate = submitted === 0 ? 0 : Number(((approved / submitted) * 100).toFixed(2));
        const averageApr = aprMap.get(lenderKey) ?? 0;
        return {
          lenderId: lender.id,
          lenderName: lender.name,
          submitted,
          approved,
          approvalRate,
          averageApr: Number(averageApr.toFixed(3)),
        };
      })
      .sort((a, b) => b.submitted - a.submitted);
  },

  async getCommissionSummary(tenantId: string, filters: DashboardFilters) {
    const where: Prisma.DealJacketWhereInput = {
      ...buildDealWhere(filters),
      status: { in: [...CONTRACTED_STATUSES] },
    };

    const deals = await prisma.dealJacket.findMany({
      where,
      select: {
        id: true,
        totalFiGross: true,
      },
    });

    const metrics = collectMetrics(deals);

    const settingsRecord = await prisma.systemSetting.findFirst({
      where: { tenantId, key: COMMISSION_SETTINGS_KEY },
      select: { value: true },
    });

    let commissionSettings: CommissionSettings = defaultCommissionSettings;
    if (settingsRecord?.value && typeof settingsRecord.value === 'object') {
      const value = settingsRecord.value as Partial<Record<keyof CommissionSettings, unknown>>;
      commissionSettings = {
        rate: coerceNumberInput(value.rate, defaultCommissionSettings.rate),
        volumeTarget: Math.round(coerceNumberInput(value.volumeTarget, defaultCommissionSettings.volumeTarget)),
        volumeBonus: coerceNumberInput(value.volumeBonus, defaultCommissionSettings.volumeBonus),
        grossTarget: coerceNumberInput(value.grossTarget, defaultCommissionSettings.grossTarget),
        grossBonus: coerceNumberInput(value.grossBonus, defaultCommissionSettings.grossBonus),
      } satisfies CommissionSettings;
    }

    const totalGross = metrics.totalGross;
    const rate = commissionSettings.rate ?? defaultCommissionSettings.rate;
    const baseCommission = Number((totalGross * rate).toFixed(2));
    const volumeBonus = metrics.deals >= (commissionSettings.volumeTarget ?? defaultCommissionSettings.volumeTarget)
      ? commissionSettings.volumeBonus ?? defaultCommissionSettings.volumeBonus
      : 0;
    const grossBonus = totalGross >= (commissionSettings.grossTarget ?? defaultCommissionSettings.grossTarget)
      ? commissionSettings.grossBonus ?? defaultCommissionSettings.grossBonus
      : 0;
    const totalBonus = Number((volumeBonus + grossBonus).toFixed(2));

    return {
      dealsClosed: metrics.deals,
      totalBackGross: Number(totalGross.toFixed(2)),
      rate,
      baseCommission,
      bonuses: {
        volumeTarget: commissionSettings.volumeTarget,
        volumeBonus,
        volumeAchieved: metrics.deals >= (commissionSettings.volumeTarget ?? defaultCommissionSettings.volumeTarget),
        grossTarget: commissionSettings.grossTarget,
        grossBonus,
        grossAchieved: totalGross >= (commissionSettings.grossTarget ?? defaultCommissionSettings.grossTarget),
        totalBonus,
      },
      totalCompensation: Number((baseCommission + totalBonus).toFixed(2)),
    };
  },
};

export type FiDashboardService = typeof fiDashboardService;

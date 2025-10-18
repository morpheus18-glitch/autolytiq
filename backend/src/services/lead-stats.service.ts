import { LeadSource, LeadStatus, Prisma } from '@prisma/client';
import { differenceInCalendarDays, endOfDay, startOfDay, subDays } from 'date-fns';
import prisma from '../lib/prisma.js';

const KPI_STATUSES: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.HOT,
  LeadStatus.WARM,
  LeadStatus.COLD,
  LeadStatus.WON,
];

const FUNNEL_STAGES: { label: string; statuses: LeadStatus[] }[] = [
  { label: 'NEW', statuses: [LeadStatus.NEW] },
  { label: 'CONTACTED', statuses: [LeadStatus.CONTACTED] },
  { label: 'QUALIFIED', statuses: [LeadStatus.QUALIFIED] },
  { label: 'PROPOSAL', statuses: [LeadStatus.SCHEDULED, LeadStatus.NEGOTIATION] },
  { label: 'WON', statuses: [LeadStatus.WON] },
  { label: 'LOST', statuses: [LeadStatus.LOST] },
];

const AGE_BUCKETS = ['<1d', '1-3d', '4-7d', '8-14d', '15-30d', '>30d'] as const;

export interface LeadStatsParams {
  tenantId: string;
  from?: Date;
  to?: Date;
}

export async function getLeadStats({ tenantId, from, to }: LeadStatsParams) {
  const periodEnd = endOfDay(to ?? new Date());
  const periodStart = startOfDay(from ?? subDays(periodEnd, 29));
  const periodLength = Math.max(1, differenceInCalendarDays(periodEnd, periodStart) + 1);
  const previousEnd = startOfDay(subDays(periodStart, 1));
  const previousStart = startOfDay(subDays(previousEnd, periodLength - 1));

  const currentWhere: Prisma.LeadWhereInput = {
    createdAt: { gte: periodStart, lte: periodEnd },
    isArchived: false,
  };

  const previousWhere: Prisma.LeadWhereInput = {
    createdAt: { gte: previousStart, lte: previousEnd },
    isArchived: false,
  };

  const [current, previous, sources, trendRows, ageRows, responseRows] = await Promise.all([
    prisma.lead.groupBy({
      by: ['status'],
      where: currentWhere,
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ['status'],
      where: previousWhere,
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ['source'],
      where: currentWhere,
      _count: { _all: true },
    }),
    prisma.$queryRaw<{ day: Date; count: bigint }[]>(Prisma.sql`
      SELECT DATE("createdAt") AS day, COUNT(*)::bigint AS count
      FROM "Lead"
      WHERE "tenantId" = ${tenantId}
        AND NOT "isArchived"
        AND "createdAt" BETWEEN ${periodStart} AND ${periodEnd}
      GROUP BY day
      ORDER BY day ASC
    `),
    prisma.$queryRaw<{ bucket: string; count: bigint }[]>(Prisma.sql`
      SELECT bucket, COUNT(*)::bigint AS count
      FROM (
        SELECT CASE
          WHEN CURRENT_TIMESTAMP - "createdAt" < INTERVAL '1 day' THEN '<1d'
          WHEN CURRENT_TIMESTAMP - "createdAt" < INTERVAL '3 days' THEN '1-3d'
          WHEN CURRENT_TIMESTAMP - "createdAt" < INTERVAL '7 days' THEN '4-7d'
          WHEN CURRENT_TIMESTAMP - "createdAt" < INTERVAL '14 days' THEN '8-14d'
          WHEN CURRENT_TIMESTAMP - "createdAt" < INTERVAL '30 days' THEN '15-30d'
          ELSE '>30d'
        END AS bucket
        FROM "Lead"
        WHERE "tenantId" = ${tenantId} AND NOT "isArchived"
      ) buckets
      GROUP BY bucket
    `),
    prisma.$queryRaw<{ median: number | null; p90: number | null; p95: number | null }[]>(Prisma.sql`
      SELECT
        percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (first_contact - created_at)) / 60) AS median,
        percentile_cont(0.9) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (first_contact - created_at)) / 60) AS p90,
        percentile_cont(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (first_contact - created_at)) / 60) AS p95
      FROM (
        SELECT l."createdAt" AS created_at, MIN(c."createdAt") AS first_contact
        FROM "Lead" l
        LEFT JOIN "Communication" c ON c."leadId" = l."id" AND c."tenantId" = l."tenantId"
        WHERE l."tenantId" = ${tenantId}
          AND NOT l."isArchived"
          AND l."createdAt" BETWEEN ${periodStart} AND ${periodEnd}
        GROUP BY l."id", l."createdAt"
      ) sub
      WHERE first_contact IS NOT NULL
    `),
  ]);

  const extractCount = (count: unknown) => {
    if (count && typeof count === 'object' && '_all' in (count as Record<string, unknown>)) {
      const value = (count as Record<string, unknown>)._all;
      return typeof value === 'number' ? value : Number(value ?? 0);
    }
    return 0;
  };

  const currentMap = new Map<LeadStatus, number>();
  for (const entry of current) {
    currentMap.set(entry.status, extractCount(entry._count));
  }
  const previousMap = new Map<LeadStatus, number>();
  for (const entry of previous) {
    previousMap.set(entry.status, extractCount(entry._count));
  }

  const kpis = KPI_STATUSES.map((status) => {
    const currentValue = currentMap.get(status) ?? 0;
    const previousValue = previousMap.get(status) ?? 0;
    return {
      status,
      value: currentValue,
      delta: currentValue - previousValue,
    };
  });

  const funnel = FUNNEL_STAGES.map((stage) => ({
    stage: stage.label,
    count: stage.statuses.reduce((acc, status) => acc + (currentMap.get(status) ?? 0), 0),
  }));

  const volumeBySource = sources
    .map((entry) => ({ source: entry.source as LeadSource, count: extractCount(entry._count) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const trend = trendRows.map((row) => ({ date: row.day, count: Number(row.count) }));

  const ageMap = new Map<string, number>();
  for (const row of ageRows) {
    ageMap.set(row.bucket, Number(row.count));
  }
  const ageDistribution = AGE_BUCKETS.map((bucket) => ({
    bucket,
    count: ageMap.get(bucket) ?? 0,
  }));

  const responseRow = responseRows[0] ?? { median: null, p90: null, p95: null };
  const responseTime = {
    medianMinutes: responseRow.median !== null && responseRow.median !== undefined ? Number(responseRow.median) : null,
    p90Minutes: responseRow.p90 !== null && responseRow.p90 !== undefined ? Number(responseRow.p90) : null,
    p95Minutes: responseRow.p95 !== null && responseRow.p95 !== undefined ? Number(responseRow.p95) : null,
  };

  return {
    period: { from: periodStart, to: periodEnd },
    kpis,
    volumeBySource,
    funnel,
    trend,
    ageDistribution,
    responseTime,
  };
}


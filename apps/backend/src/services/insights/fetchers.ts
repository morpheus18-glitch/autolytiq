/**
 * Insight Data Fetchers
 *
 * Tenant-scoped data accessors for predicate evaluation
 */

import { PrismaClient } from '@repo/db';

const prisma = new PrismaClient();

/**
 * Get deal by ID
 */
export async function getDealById(tenantId: string, dealId: string) {
  return prisma.deal.findFirst({
    where: { tenantId, id: dealId },
    include: {
      customer: true,
      vehicle: true,
      creditApplications: true,
    },
  });
}

/**
 * Get deals by status
 */
export async function getDealsByStatus(tenantId: string, status: string) {
  return prisma.deal.findMany({
    where: { tenantId, status },
    include: {
      customer: true,
      vehicle: true,
    },
  });
}

/**
 * Get deals with pending F&I over threshold
 */
export async function getPendingFIOver(tenantId: string, minutes: number) {
  const threshold = new Date(Date.now() - minutes * 60 * 1000);

  return prisma.deal.findMany({
    where: {
      tenantId,
      fiStatus: 'pending',
      fiSubmittedAt: { lt: threshold },
    },
    include: {
      customer: true,
      vehicle: true,
    },
  });
}

/**
 * Get leads with no contact
 */
export async function getLeadNoContact(
  tenantId: string,
  hours: number,
  minScore: number = 80
) {
  const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

  return prisma.lead.findMany({
    where: {
      tenantId,
      status: 'new',
      score: { gte: minScore },
      lastContactAt: null,
      createdAt: { lt: threshold },
    },
    include: {
      customer: true,
    },
  });
}

/**
 * Get hot leads cooling off
 */
export async function getHotLeadsCooling(tenantId: string, hours: number) {
  const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

  return prisma.lead.findMany({
    where: {
      tenantId,
      status: { in: ['hot', 'engaged'] },
      score: { gte: 70 },
      OR: [
        { lastContactAt: { lt: threshold } },
        { lastContactAt: null, updatedAt: { lt: threshold } },
      ],
    },
    include: {
      customer: true,
    },
  });
}

/**
 * Get aging inventory
 */
export async function getAgingInventory(tenantId: string, days: number) {
  return prisma.vehicle.findMany({
    where: {
      tenantId,
      status: 'available',
      daysInStock: { gt: days },
    },
    orderBy: { daysInStock: 'desc' },
    take: 10,
  });
}

/**
 * Get approved service ROs without parts ordered
 */
export async function getServiceROsApprovedNoParts(
  tenantId: string,
  minutes: number
) {
  const threshold = new Date(Date.now() - minutes * 60 * 1000);

  return prisma.$queryRaw`
    SELECT id, "approvedAt"
    FROM "ServiceRO"
    WHERE "tenantId" = ${tenantId}
      AND status = 'approved'
      AND "approvedAt" IS NOT NULL
      AND "approvedAt" < ${threshold}
      AND "partsOrderedAt" IS NULL
    LIMIT 10
  `;
}

/**
 * Get deals with no activity
 */
export async function getDealsNoActivity(tenantId: string, minutes: number) {
  const threshold = new Date(Date.now() - minutes * 60 * 1000);

  return prisma.$queryRaw`
    SELECT d.id, d."updatedAt",
      COALESCE(MAX(da."createdAt"), d."updatedAt") as "lastActivity"
    FROM "Deal" d
    LEFT JOIN "DealActivity" da ON da."dealId" = d.id
    WHERE d."tenantId" = ${tenantId}
      AND d.status NOT IN ('closed', 'cancelled')
    GROUP BY d.id, d."updatedAt"
    HAVING COALESCE(MAX(da."createdAt"), d."updatedAt") < ${threshold}
    LIMIT 10
  `;
}

/**
 * Generic query executor for custom predicates
 */
export async function executeQuery<T>(
  query: string,
  args?: any[]
): Promise<T> {
  // Use Prisma's raw query for complex queries
  return prisma.$queryRawUnsafe(query, ...(args || [])) as Promise<T>;
}

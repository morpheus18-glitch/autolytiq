import { differenceInCalendarDays } from 'date-fns';
import { DealStatus, PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { withTenantId } from '../lib/tenant-context.js';

const client = prisma as PrismaClient;

async function updateVehicleAging(tenantId: string) {
  const vehicles = await client.vehicle.findMany({
    where: { tenantId },
    select: { id: true, tenantId: true, dateReceived: true, dateSold: true, status: true },
  });

  for (const vehicle of vehicles) {
    if (!vehicle.dateReceived) continue;

    const referenceDate = vehicle.dateSold ?? new Date();
    const daysInStock = differenceInCalendarDays(referenceDate, vehicle.dateReceived);

    await client.vehicle.updateMany({
      where: { id: vehicle.id, tenantId },
      data: { daysInStock },
    });
  }
}

async function updateCustomerLifetimeValue(tenantId: string) {
  const aggregates = await client.deal.groupBy({
    by: ['customerId'],
    where: {
      tenantId,
      status: { in: [DealStatus.APPROVED, DealStatus.FUNDED, DealStatus.DELIVERED] },
    },
    _sum: { netVehiclePrice: true },
  });

  for (const aggregate of aggregates) {
    await client.customer.updateMany({
      where: { tenantId, id: aggregate.customerId },
      data: { lifetimeValue: aggregate._sum.netVehiclePrice ?? 0 },
    });
  }
}

async function archiveOldInteractions(tenantId: string) {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 2);

  await client.customerInteraction.updateMany({
    where: {
      tenantId,
      completedAt: { lt: cutoff },
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });
}

async function runMaintenance() {
  const tenants = await client.tenant.findMany({ select: { id: true } });

  for (const tenant of tenants) {
    await withTenantId(tenant.id, async () => {
      await updateVehicleAging(tenant.id);
      await updateCustomerLifetimeValue(tenant.id);
      await archiveOldInteractions(tenant.id);
    });
  }

  try {
    await client.$executeRawUnsafe('VACUUM ANALYZE');
  } catch (error) {
    console.warn('VACUUM command failed (permission required):', error);
  }
}

runMaintenance()
  .then(() => {
    console.log('Database maintenance completed.');
    return client.$disconnect();
  })
  .catch(async (error) => {
    console.error('Database maintenance failed:', error);
    await client.$disconnect();
    process.exit(1);
  });

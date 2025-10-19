import { Prisma, VehicleStatus } from '@prisma/client';
import { EVENT_TOPICS, emitEvent } from '../events/index.js';
import { prisma } from '../lib/prisma.js';

function isPrismaNotFound(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === 'P2025' || error.code === 'P2001')
  );
}

async function updateVehicle(
  vehicleId: string,
  data: Prisma.VehicleUpdateInput,
): Promise<void> {
  try {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data,
    });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      return;
    }
    throw error;
  }
}

export async function refreshVehicleAging(tenantId: string, vehicleId: string): Promise<void> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { dateReceived: true },
  });

  if (!vehicle?.dateReceived) {
    return;
  }

  const now = new Date();
  const millis = now.getTime() - vehicle.dateReceived.getTime();
  const daysInStock = Math.max(0, Math.floor(millis / (1000 * 60 * 60 * 24)));

  await updateVehicle(vehicleId, { daysInStock });
  await emitEvent(EVENT_TOPICS.INVENTORY_DAYS_IN_STOCK_UPDATED, {
    tenantId,
    vehicleId,
    daysInStock,
  });
}

export async function reserveVehicleInventory(
  tenantId: string,
  dealId: string,
  worksheetId: string,
  vehicleId: string,
): Promise<void> {
  await updateVehicle(vehicleId, {
    status: VehicleStatus.PENDING,
  });

  await emitEvent(EVENT_TOPICS.INVENTORY_VEHICLE_RESERVED, {
    tenantId,
    dealId,
    vehicleId,
    reservedByWorksheetId: worksheetId,
  });

  await refreshVehicleAging(tenantId, vehicleId);
}

export async function releaseVehicleInventory(
  tenantId: string,
  dealId: string,
  worksheetId: string,
  vehicleId: string,
  releaseReason: 'LOST' | 'CLOSED',
): Promise<void> {
  const nextStatus = releaseReason === 'CLOSED' ? VehicleStatus.SOLD : VehicleStatus.AVAILABLE;
  const update: Prisma.VehicleUpdateInput = {
    status: nextStatus,
  };
  if (releaseReason === 'CLOSED') {
    update.dateSold = new Date();
  }

  await updateVehicle(vehicleId, update);

  await emitEvent(EVENT_TOPICS.INVENTORY_VEHICLE_RELEASED, {
    tenantId,
    dealId,
    vehicleId,
    releasedByWorksheetId: worksheetId,
    status: releaseReason,
  });

  await refreshVehicleAging(tenantId, vehicleId);
}

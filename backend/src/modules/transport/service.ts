import prisma from '../../lib/prisma.js';
import { BadRequest, NotFound } from '../../lib/errors.js';
import { emitToTenantRoom } from '../../lib/socket.js';
import type { z } from 'zod';
import { transportOrderCreateSchema, transportOrderUpdateSchema } from './dto.js';

type TransportOrderCreateInput = z.infer<typeof transportOrderCreateSchema>;
type TransportOrderUpdateInput = z.infer<typeof transportOrderUpdateSchema>;

export async function createTransportOrder(
  tenantId: string,
  input: TransportOrderCreateInput,
) {
  const workflow = await prisma.vehicleWorkflow.findFirst({
    where: { tenantId, id: input.workflowId },
    select: { id: true },
  });
  if (!workflow) {
    throw BadRequest('Workflow not found for transport order.');
  }

  const order = await prisma.transportOrder.create({
    data: {
      tenantId,
      workflowId: input.workflowId,
      vehicleId: input.vehicleId,
      stageId: input.stageId,
      vendor: input.vendor,
      pickupAddress: input.pickupAddress,
      dropoffAddress: input.dropoffAddress,
      scheduledAt: input.scheduledAt,
      status: input.status,
      costCents: input.costCents,
    },
  });

  emitToTenantRoom(tenantId, 'pipeline.transport.created', order);
  return order;
}

export async function updateTransportOrder(
  tenantId: string,
  orderId: string,
  input: TransportOrderUpdateInput,
) {
  const existing = await prisma.transportOrder.findFirst({
    where: { tenantId, id: orderId },
  });
  if (!existing) {
    throw NotFound('Transport order not found.');
  }

  const order = await prisma.transportOrder.update({
    where: { id: orderId },
    data: {
      ...(input.stageId !== undefined ? { stageId: input.stageId } : {}),
      ...(input.vendor !== undefined ? { vendor: input.vendor } : {}),
      ...(input.pickupAddress !== undefined ? { pickupAddress: input.pickupAddress } : {}),
      ...(input.dropoffAddress !== undefined ? { dropoffAddress: input.dropoffAddress } : {}),
      ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.costCents !== undefined ? { costCents: input.costCents } : {}),
    },
  });

  emitToTenantRoom(tenantId, 'pipeline.transport.updated', order);
  return order;
}

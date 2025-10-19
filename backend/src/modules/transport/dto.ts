import { TransportOrderStatus } from '@prisma/client';
import { z } from 'zod';

export const transportOrderCreateSchema = z.object({
  workflowId: z.string().min(1),
  vehicleId: z.string().min(1),
  stageId: z.string().optional(),
  vendor: z.string().optional(),
  pickupAddress: z.string().optional(),
  dropoffAddress: z.string().optional(),
  scheduledAt: z.preprocess((value) => (value ? new Date(String(value)) : undefined), z.date().optional()),
  status: z.nativeEnum(TransportOrderStatus).default(TransportOrderStatus.REQUESTED),
  costCents: z.number().int().min(0).optional(),
});

export const transportOrderUpdateSchema = transportOrderCreateSchema.partial();

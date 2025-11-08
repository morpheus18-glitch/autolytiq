import { z } from 'zod';

export const customerSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CustomerSchema = z.infer<typeof customerSchema>;

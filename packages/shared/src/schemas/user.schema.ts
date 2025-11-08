import { z } from 'zod';

export const userRoleSchema = z.enum([
  'SALESPERSON',
  'SALES_MANAGER',
  'FINANCE_MANAGER',
  'GM',
  'ADMIN',
]);

export const userSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserSchemaType = z.infer<typeof userSchema>;

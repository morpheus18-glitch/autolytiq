// src/schemas/user.schema.ts
import { z } from "zod";
var userRoleSchema = z.enum([
  "SALESPERSON",
  "SALES_MANAGER",
  "FINANCE_MANAGER",
  "GM",
  "ADMIN"
]);
var userSchema = z.object({
  id: z.string().cuid(),
  tenantId: z.string().cuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: userRoleSchema,
  createdAt: z.date(),
  updatedAt: z.date()
});

// src/schemas/customer.schema.ts
import { z as z2 } from "zod";
var customerSchema = z2.object({
  id: z2.string().cuid(),
  tenantId: z2.string().cuid(),
  firstName: z2.string().min(1),
  lastName: z2.string().min(1),
  email: z2.string().email().optional(),
  phone: z2.string().optional(),
  createdAt: z2.date(),
  updatedAt: z2.date()
});
export {
  customerSchema,
  userRoleSchema,
  userSchema
};
//# sourceMappingURL=index.js.map
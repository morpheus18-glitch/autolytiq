import { z } from 'zod';

type UserRole = 'SALESPERSON' | 'SALES_MANAGER' | 'FINANCE_MANAGER' | 'GM' | 'ADMIN';
interface User {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

interface Customer {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Vehicle {
    id: string;
    tenantId: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    mileage?: number;
    cost?: number;
    price?: number;
    createdAt: Date;
    updatedAt: Date;
}

declare const userRoleSchema: z.ZodEnum<["SALESPERSON", "SALES_MANAGER", "FINANCE_MANAGER", "GM", "ADMIN"]>;
declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodEnum<["SALESPERSON", "SALES_MANAGER", "FINANCE_MANAGER", "GM", "ADMIN"]>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "SALESPERSON" | "SALES_MANAGER" | "FINANCE_MANAGER" | "GM" | "ADMIN";
    createdAt: Date;
    updatedAt: Date;
}, {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "SALESPERSON" | "SALES_MANAGER" | "FINANCE_MANAGER" | "GM" | "ADMIN";
    createdAt: Date;
    updatedAt: Date;
}>;
type UserSchemaType = z.infer<typeof userSchema>;

declare const customerSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    id: string;
    tenantId: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    email?: string | undefined;
    phone?: string | undefined;
}>;
type CustomerSchema = z.infer<typeof customerSchema>;

export { type Customer, type CustomerSchema, type User, type UserRole, type UserSchemaType, type Vehicle, customerSchema, userRoleSchema, userSchema };

import type { Prisma } from '@prisma/client';
import { prisma, getEffectiveTenantId } from '../../lib/prisma.js';
import { buildCustomerSearchVector } from '../../shared/search-vector.js';
import type { CustomerSearchVectorInput } from '../../shared/search-vector.js';

type NullableString = string | null | undefined;

type CustomerSearchFields = Partial<CustomerSearchVectorInput>;

function ensureTenantId(): string {
  const tenantId = getEffectiveTenantId();
  if (!tenantId) {
    throw new Error('Tenant context is required for customer search operations.');
  }
  return tenantId;
}

function resolveFieldValue(input: unknown): NullableString {
  if (input === undefined) {
    return undefined;
  }
  if (input === null || typeof input === 'string') {
    return input;
  }
  if (typeof input === 'object' && input !== null && 'set' in (input as Record<string, unknown>)) {
    const value = (input as Record<string, unknown>).set;
    if (value === undefined || value === null || typeof value === 'string') {
      return value as NullableString;
    }
  }
  return undefined;
}

function normalizeFields(data: CustomerSearchFields): CustomerSearchVectorInput {
  return {
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
  };
}

function extractFieldsFromCreate(
  data: Prisma.CustomerCreateInput | Prisma.CustomerUncheckedCreateInput,
): CustomerSearchFields {
  return {
    firstName: resolveFieldValue((data as Record<string, unknown>).firstName),
    lastName: resolveFieldValue((data as Record<string, unknown>).lastName),
    email: resolveFieldValue((data as Record<string, unknown>).email),
    phone: resolveFieldValue((data as Record<string, unknown>).phone),
  };
}

function mergeFieldsForUpdate(
  update: Prisma.CustomerUpdateInput | Prisma.CustomerUncheckedUpdateInput,
  fallback: CustomerSearchVectorInput,
): CustomerSearchFields {
  const result: CustomerSearchFields = { ...fallback };
  for (const key of ['firstName', 'lastName', 'email', 'phone'] as const) {
    const value = resolveFieldValue((update as Record<string, unknown>)[key]);
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

export async function createCustomerWithSearch(
  data: Prisma.CustomerCreateInput | Prisma.CustomerUncheckedCreateInput,
) {
  ensureTenantId();
  const fields = normalizeFields(extractFieldsFromCreate(data));
  const searchVector = buildCustomerSearchVector(fields);

  return prisma.customer.create({
    data: {
      ...data,
      searchVector,
    },
  });
}

export async function updateCustomerWithSearch(
  id: string,
  data: Prisma.CustomerUpdateInput | Prisma.CustomerUncheckedUpdateInput,
) {
  const tenantId = ensureTenantId();
  const current = await prisma.customer.findFirst({
    where: { id, tenantId },
    select: { firstName: true, lastName: true, email: true, phone: true },
  });

  const baseline: CustomerSearchVectorInput = {
    firstName: current?.firstName ?? null,
    lastName: current?.lastName ?? null,
    email: current?.email ?? null,
    phone: current?.phone ?? null,
  };

  const fields = normalizeFields(mergeFieldsForUpdate(data, baseline));
  const searchVector = buildCustomerSearchVector(fields);

  return prisma.customer.update({
    where: { id },
    data: {
      ...data,
      searchVector,
    },
  });
}

export async function searchCustomers(query: string, limit = 20) {
  const tenantId = ensureTenantId();
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const tokens = normalized.split(/\s+/u).filter(Boolean);
  const searchConditions = tokens.map((token) => ({ searchVector: { contains: token } }));
  const searchWhere = searchConditions.length > 0 ? { AND: searchConditions } : {};

  return prisma.customer.findMany({
    where: {
      tenantId,
      ...searchWhere,
    },
    take: limit,
    orderBy: { updatedAt: 'desc' },
  });
}

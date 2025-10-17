import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContextValue {
  tenantId?: string;
  userId?: string;
  isSuperAdmin?: boolean;
  impersonatedTenantId?: string;
}

const tenantStorage = new AsyncLocalStorage<TenantContextValue>();

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantContextError';
  }
}

export function runWithTenantContext<T>(
  context: TenantContextValue,
  callback: () => T | Promise<T>,
): T | Promise<T> {
  return tenantStorage.run({ ...context }, callback);
}

export function setTenantContext(partial: Partial<TenantContextValue>) {
  const current = tenantStorage.getStore();
  if (!current) {
    throw new TenantContextError('Attempted to mutate tenant context outside of scope.');
  }
  Object.assign(current, partial);
}

export function getTenantContext(): TenantContextValue | null {
  return tenantStorage.getStore() ?? null;
}

export function getEffectiveTenantId(): string | null {
  const ctx = tenantStorage.getStore();
  if (!ctx) return null;
  return ctx.impersonatedTenantId ?? ctx.tenantId ?? null;
}

export function requireTenantId(): string {
  const tenantId = getEffectiveTenantId();
  if (!tenantId) {
    throw new TenantContextError('Tenant context is required for multi-tenant operations.');
  }
  return tenantId;
}

export function isSuperAdmin(): boolean {
  return tenantStorage.getStore()?.isSuperAdmin ?? false;
}

export function getUserId(): string | null {
  return tenantStorage.getStore()?.userId ?? null;
}

export function withTenant<T>(
  context: TenantContextValue,
  callback: () => T | Promise<T>,
): Promise<T> | T {
  return runWithTenantContext(context, callback);
}
export function withTenantId<T>(tenantId: string, callback: () => T | Promise<T>) {
  return withTenant({ tenantId }, callback);
}

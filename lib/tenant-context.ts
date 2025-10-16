import { AsyncLocalStorage } from 'node:async_hooks';
import jwt from 'jsonwebtoken';

type TenantContextValue = {
  tenantId?: string;
};

const tenantStorage = new AsyncLocalStorage<TenantContextValue>();

export class TenantContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantContextError';
  }
}

export function runWithTenantContext<T>(tenantId: string, callback: () => T | Promise<T>): Promise<T> | T {
  return tenantStorage.run({ tenantId }, callback);
}

export function setTenantId(tenantId: string) {
  const store = tenantStorage.getStore();
  if (!store) {
    tenantStorage.enterWith({ tenantId });
    return;
  }

  store.tenantId = tenantId;
}

export function clearTenantId() {
  const store = tenantStorage.getStore();
  if (store) {
    delete store.tenantId;
  }
}

export function getTenantIdFromContext(): string | null {
  return tenantStorage.getStore()?.tenantId ?? null;
}

export function requireTenantId(): string {
  const tenantId = getTenantIdFromContext();
  if (!tenantId) {
    throw new TenantContextError('Tenant context is required for multi-tenant operations.');
  }
  return tenantId;
}

function extractTenantFromSubdomain(host?: string | null): string | null {
  if (!host) return null;
  const normalizedHost = host.toLowerCase().split(':')[0];
  const segments = normalizedHost.split('.');
  if (segments.length < 3) {
    return null;
  }
  return segments[0];
}

function extractTenantFromHeaders(headers: Headers | Record<string, string | undefined>): string | null {
  const headerValue = headers instanceof Headers
    ? headers.get('x-tenant-id') ?? headers.get('X-Tenant-Id')
    : headers['x-tenant-id'] ?? headers['X-Tenant-Id'];
  return headerValue ?? null;
}

function extractTenantFromJwt(authorizationHeader?: string | null): string | null {
  if (!authorizationHeader) return null;
  const token = authorizationHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.decode(token) as { tenantId?: string } | null;
    return decoded?.tenantId ?? null;
  } catch (error) {
    return null;
  }
}

export async function getTenantId(requestLike?: Request | { headers?: Headers | Record<string, string | undefined> }): Promise<string | null> {
  if (!requestLike) {
    return getTenantIdFromContext();
  }

  const headers = requestLike instanceof Request ? requestLike.headers : requestLike.headers;
  const tenantFromHeader = headers ? extractTenantFromHeaders(headers) : null;
  if (tenantFromHeader) {
    return tenantFromHeader;
  }

  const host = headers instanceof Headers ? headers.get('host') : (headers as Record<string, string | undefined>)?.host;
  const tenantFromSubdomain = extractTenantFromSubdomain(host);
  if (tenantFromSubdomain) {
    return tenantFromSubdomain;
  }

  const authorization = headers instanceof Headers ? headers.get('authorization') : (headers as Record<string, string | undefined>)?.authorization;
  const tenantFromJwt = extractTenantFromJwt(authorization);
  if (tenantFromJwt) {
    return tenantFromJwt;
  }

  return getTenantIdFromContext();
}

export async function requireTenant(requestLike?: Request | { headers?: Headers | Record<string, string | undefined> }): Promise<string> {
  const tenantId = await getTenantId(requestLike);
  if (!tenantId) {
    throw new TenantContextError('Tenant could not be resolved from the request context.');
  }
  return tenantId;
}

export function withTenantId<T>(tenantId: string, callback: () => T | Promise<T>): Promise<T> | T {
  return runWithTenantContext(tenantId, callback);
}

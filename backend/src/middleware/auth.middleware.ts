import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Unauthorized } from '../lib/errors.js';
import { runWithTenantContext } from '../lib/tenant-context.js';
import type { AppRole } from '../types/express.js';

type TokenPayload = JwtPayload & {
  userId: string;
  tenantId?: string;
  role: AppRole;
  permissions?: string[];
  isSuperAdmin?: boolean;
};

function extractToken(authorization?: string) {
  if (!authorization) {
    return undefined;
  }
  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    throw Unauthorized('Authentication required');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, secret) as TokenPayload;
  } catch {
    throw Unauthorized('Invalid token');
  }

  if (!payload.userId || !payload.role) {
    throw Unauthorized('Invalid token payload');
  }

  const impersonatedTenantId =
    payload.isSuperAdmin && req.header('x-tenant-id') ? req.header('x-tenant-id') ?? undefined : undefined;

  const initialTenantId = payload.tenantId ?? impersonatedTenantId;

  req.user = {
    userId: payload.userId,
    tenantId: initialTenantId ?? '',
    role: payload.role,
    permissions: payload.permissions ?? [],
    ip: req.ip,
    isSuperAdmin: Boolean(payload.isSuperAdmin),
    impersonatedTenantId,
  };

  runWithTenantContext(
    {
      tenantId: initialTenantId,
      userId: payload.userId,
      isSuperAdmin: payload.isSuperAdmin,
      impersonatedTenantId,
    },
    () => next(),
  );
}

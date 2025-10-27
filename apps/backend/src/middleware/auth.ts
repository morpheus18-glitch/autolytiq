import type { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { Role } from '../types/roles.js';
import { Roles } from '../types/roles.js';

interface TokenPayload extends JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  tenantId?: string;
  tenant_id?: string;
  roles?: string[] | string;
  [key: string]: unknown;
}

function extractTenantId(payload: TokenPayload): string | undefined {
  if (payload.tenantId && typeof payload.tenantId === 'string') {
    return payload.tenantId;
  }

  if (payload.tenant_id && typeof payload.tenant_id === 'string') {
    return payload.tenant_id;
  }

  const customTenant = payload['https://autolytiq.com/tenant'];
  if (typeof customTenant === 'string') {
    return customTenant;
  }

  return undefined;
}

function normalizeRoles(rawRoles: TokenPayload['roles']): Role[] {
  if (!rawRoles) {
    return [];
  }

  const normalize = (value: string) => value.trim().toUpperCase();
  const allowed = new Set<string>(Roles as unknown as string[]);

  if (Array.isArray(rawRoles)) {
    return rawRoles.map(normalize).filter((role) => allowed.has(role)) as Role[];
  }

  return rawRoles
    .split(',')
    .map(normalize)
    .filter((role) => role.length > 0 && allowed.has(role)) as Role[];
}

const publicKey = env.JWT_PUBLIC_KEY;

export const authenticate: RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: env.JWT_AUDIENCE,
      issuer: env.JWT_ISSUER,
    }) as TokenPayload;

    if (!payload.sub) {
      return res.status(401).json({ message: 'Token subject missing' });
    }

    const tenantId = extractTenantId(payload);
    const roles = normalizeRoles(payload.roles);

    req.context = {
      ...req.context,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        tenantId,
      },
      roles,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

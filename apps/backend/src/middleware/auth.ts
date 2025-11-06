import type { RequestHandler } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../types/roles';
import { Roles } from '../types/roles';

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

export const authenticate: RequestHandler = async (req, res, next) => {
  // BYPASS MODE: If BYPASS_AUTH is enabled, skip JWT validation and auto-login
  if (process.env.BYPASS_AUTH === 'true') {
    console.log('[AUTH BYPASS] Skipping JWT validation, auto-logging in first active user');

    // Use hardcoded user context for bypass mode
    // In a real scenario, you'd fetch from database, but for simplicity we use known values
    req.context = {
      ...req.context,
      user: {
        id: 'c0600bf6-def8-4e56-98cd-73bff976acf4',
        email: 'developer@sunrisemotors.demo',
        name: 'Dana Reeves',
        tenantId: 'fdc31355-36b9-4e44-8982-7a231f74e1fd',
      },
      roles: ['ADMIN'] as Role[],
    };

    return next();
  }

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

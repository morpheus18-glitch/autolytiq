import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  [key: string]: any;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Simple API key middleware placeholder. In production integrate with the
 * platform's authentication/authorization system.
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    console.warn('API_KEY not configured. Allowing request for development.');
    req.user = {
      id: 'dev-user',
      tenantId: (req.headers['x-tenant-id'] as string) || 'dev-tenant',
    };
    return next();
  }

  if (apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const tenantId = (req.headers['x-tenant-id'] as string) || 'default-tenant';
  req.user = {
    id: 'api-key-user',
    tenantId,
  };
  next();
}

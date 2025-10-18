import { Request, Response, NextFunction } from 'express';
import { Forbidden } from '../lib/errors.js';

export function requireDeveloperAccess(req: Request, _res: Response, next: NextFunction) {
  const permissions = req.user?.permissions ?? [];
  const isAdmin = req.user?.role === 'ADMIN';
  const isSuperAdmin = req.user?.isSuperAdmin ?? false;

  if (!isAdmin && !isSuperAdmin) {
    throw Forbidden('Admin required');
  }

  if (!isSuperAdmin && !permissions.includes('developer')) {
    throw Forbidden('Developer permission required');
  }

  next();
}

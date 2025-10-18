import { NextFunction, Request, Response } from 'express';
import { Forbidden } from '../lib/errors.js';

export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.isSuperAdmin) {
    throw Forbidden('Super-admin privileges required');
  }

  next();
}

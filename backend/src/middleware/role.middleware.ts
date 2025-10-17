import { Request, Response, NextFunction } from 'express';
import { Forbidden } from '../lib/errors.js';
import type { AppRole } from '../types/express.js';

export function requireRole(roles: AppRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      throw Forbidden('Insufficient role');
    }
    next();
  };
}

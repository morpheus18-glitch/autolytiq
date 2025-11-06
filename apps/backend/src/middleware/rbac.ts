import type { RequestHandler } from 'express';
import type { Role } from '../types/roles';

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, res, next) => {
    const user = req.context?.user;
    const userRoles = req.context?.roles ?? [];

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (roles.length === 0) {
      return next();
    }

    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

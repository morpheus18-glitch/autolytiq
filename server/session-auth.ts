import type { RequestHandler } from 'express';

export interface SessionUserAccess {
  homePath?: string;
  allowedRoutes: string[];
  navigationSections: string[];
  quickActions: string[];
}

export interface SessionStoreInfo {
  id: string;
  code: string;
  name: string;
  timezone: string;
}

export interface SessionUser {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  featureFlags: string[];
  tenantId: string;
  store: SessionStoreInfo;
  access: SessionUserAccess;
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
    authToken?: string;
    loginTime?: string;
  }
}

export const requireSessionAuth: RequestHandler = (req, res, next) => {
  const sessionUser = req.session?.user;
  if (!sessionUser) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  (req as any).user = sessionUser;
  next();
};

export function isSuperUser(sessionUser: SessionUser | undefined): boolean {
  if (!sessionUser) {
    return false;
  }

  return sessionUser.permissions.includes('*') || sessionUser.role.toUpperCase() === 'SUPER_ADMIN';
}

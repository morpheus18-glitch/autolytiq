import 'express';

export type AppRole = 'ADMIN' | 'MANAGER' | 'SALES' | 'FINANCE' | 'SERVICE' | 'BDC';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      tenantId: string;
      role: AppRole;
      permissions?: string[];
      ip?: string;
      isSuperAdmin?: boolean;
      impersonatedTenantId?: string;
    };
  }
}

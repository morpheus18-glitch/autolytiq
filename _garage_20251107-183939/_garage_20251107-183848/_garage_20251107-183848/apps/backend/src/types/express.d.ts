import type { RequestContext, AuthenticatedUser } from './context';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
      tenantId?: string;
      userId?: string;
      user?: AuthenticatedUser & { roles?: string[] };
    }
  }
}

export {};

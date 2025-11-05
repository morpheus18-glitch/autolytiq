import type { RequestContext } from './context';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
      tenantId?: string;
      userId?: string;
    }
  }
}

export {};

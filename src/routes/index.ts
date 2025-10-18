import type { Express, RequestHandler } from 'express';
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenant.js';
import { leadRouter } from './leads.js';

export function registerRoutes(app: Express) {
  app.get('/health', ((req, res) => {
    res.json({ ok: true, tenant: req.context?.tenantId ?? null });
  }) as RequestHandler);

  const apiRouter = Router();
  apiRouter.use(authenticate);
  apiRouter.use(tenantScope);

  apiRouter.use('/leads', leadRouter);

  app.use('/api', apiRouter);
}

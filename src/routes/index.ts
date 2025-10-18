import type { Express, RequestHandler } from 'express';
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenant.js';
import { leadRouter } from './leads.js';
import webhookRouter from './webhooks.routes.js';
import { activityRouter } from './activity.routes.js';
import { communicationRouter } from './communication.routes.js';
import { appointmentRouter } from './appointment.routes.js';

export function registerRoutes(app: Express) {
  app.get('/health', ((req, res) => {
    res.json({ ok: true, tenant: req.context?.tenantId ?? null });
  }) as RequestHandler);

  const apiRouter = Router();
  apiRouter.use(authenticate);
  apiRouter.use(tenantScope);

  apiRouter.use('/leads', leadRouter);
  apiRouter.use('/activities', activityRouter);
  apiRouter.use('/communications', communicationRouter);
  apiRouter.use('/appointments', appointmentRouter);

  app.use('/api', webhookRouter);
  app.use('/api', apiRouter);
}

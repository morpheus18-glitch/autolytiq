import type { Express, RequestHandler } from 'express';
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenant.js';
import { requireRole } from '../middleware/rbac.js';
import type { Role } from '../types/roles.js';
import { leadRouter } from './leads.js';
import webhookRouter from './webhooks.routes.js';
import { activityRouter } from './activity.routes.js';
import { communicationRouter } from './communication.routes.js';
import { appointmentRouter } from './appointment.routes.js';
import { automationRouter } from './automation.routes.js';
import { mlRouter } from './ml.routes.js';
import { simulateLeadRouting } from '../services/lead-routing.service.js';
import { fiRouter } from './fi/index.js';
import { deskingRouter } from './desking.routes.js';
import { healthRouter } from './health.routes.js';
import timelineRouter from './timeline.routes.js';
import { authRouter } from './auth.routes.js';
import { pricingRouter } from './pricing.routes.js';
import { customerRouter } from './customer.routes.js';
import { vehicleRouter } from './vehicle.routes.js';

export function registerRoutes(app: Express) {
  // Health check routes (no auth required)
  app.use('/', healthRouter);

  // Auth routes (no auth required for login)
  // IMPORTANT: Must be registered before apiRouter to avoid authenticate middleware
  app.use('/api/auth', authRouter);

  // Protected API routes
  const apiRouter = Router();
  apiRouter.use(authenticate);
  apiRouter.use(tenantScope);

  apiRouter.use('/leads', leadRouter);
  apiRouter.use('/activities', activityRouter);
  apiRouter.use('/communications', communicationRouter);
  apiRouter.use('/appointments', appointmentRouter);
  apiRouter.use('/automations', automationRouter);
  apiRouter.use('/timeline', timelineRouter);
  apiRouter.use('/ml', mlRouter);
  apiRouter.use('/fi', fiRouter);
  apiRouter.use('/desking', deskingRouter);
  apiRouter.use('/pricing', pricingRouter);
  apiRouter.use('/customers', customerRouter);
  apiRouter.use('/vehicles', vehicleRouter);

  const leadRoutingRoles: Role[] = ['ADMIN', 'BDC', 'SALES'];
  apiRouter.post(
    '/lead-routing/test',
    requireRole(...leadRoutingRoles),
    (async (req, res, next) => {
      try {
        const result = await simulateLeadRouting(req.body ?? {});
        res.json({ data: result });
      } catch (error) {
        next(error);
      }
    }) as RequestHandler,
  );

  app.use('/api', webhookRouter);
  app.use('/api', apiRouter);
}

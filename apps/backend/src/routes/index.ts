import type { Express, RequestHandler } from 'express';
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { tenantScope } from '../middleware/tenant';
import { requireRole } from '../middleware/rbac';
import type { Role } from '../types/roles';
import { leadRouter } from './leads';
import webhookRouter from './webhooks.routes';
import { activityRouter } from './activity.routes';
import { communicationRouter } from './communication.routes';
import { appointmentRouter } from './appointment.routes';
import { automationRouter } from './automation.routes';
import { mlRouter } from './ml.routes';
import { simulateLeadRouting } from '../services/lead-routing.service';
import { fiRouter } from './fi/index';
import { deskingRouter } from './desking.routes';
import { healthRouter } from './health.routes';
import timelineRouter from './timeline.routes';
import { authRouter } from './auth.routes';
import { pricingRouter } from './pricing.routes';
import { customerRouter } from './customer.routes';
import { vehicleRouter } from './vehicle.routes';
import { dashboardRouter } from './dashboard.routes';
import { searchRouter } from './search.routes';
import { pipelineRouter } from './pipeline.routes';
import { serviceOrderRouter } from './service-order.routes';
import { inventoryRouter } from './inventory.routes';
import { pricingIntelligenceRouter } from './pricing-intelligence.routes';
import { merchandisingRouter } from './merchandising.routes';
import { appraisalRouter } from './appraisal.routes';
import { accountingRouter } from './accounting.routes';
import insightsRouter from './insights';

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
  apiRouter.use('/dashboard', dashboardRouter);
  apiRouter.use('/search', searchRouter);
  apiRouter.use('/pipeline', pipelineRouter);
  apiRouter.use('/service-orders', serviceOrderRouter);
  apiRouter.use('/inventory', inventoryRouter);
  apiRouter.use('/pricing-intelligence', pricingIntelligenceRouter);
  apiRouter.use('/merchandising', merchandisingRouter);
  apiRouter.use('/appraisals', appraisalRouter);
  apiRouter.use('/accounting', accountingRouter);
  apiRouter.use('/insights', insightsRouter);

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

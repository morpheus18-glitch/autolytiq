import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import settingsRoutes from './settings.routes.js';
import superAdminRoutes from './superadmin.routes.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { tenantScope } from '../middleware/tenant.middleware.js';
import { requireSuperAdmin } from '../middleware/superadmin.middleware.js';
import { errorHandler } from '../lib/errors.js';
import { getTenantContext } from '../lib/tenant-context.js';
import crmRoutes from './crm.routes.js';

async function loadOptionalRoutes(): Promise<express.Router[]> {
  const optionalImports = [
    { path: './deals.routes.js', mount: '/deals' },
    { path: './customers.routes.js', mount: '/customers' },
    { path: './vehicles.routes.js', mount: '/vehicles' },
    { path: './inventory.routes.js', mount: '/inventory' },
    { path: './accounting.routes.js', mount: '/accounting' },
    { path: './analytics.routes.js', mount: '/analytics' },
  ] as const;

  const routers: express.Router[] = [];

  for (const candidate of optionalImports) {
    try {
      const module = await import(candidate.path);
      if (module?.default) {
        const router = express.Router();
        router.use(candidate.mount, module.default as express.Router);
        routers.push(router);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Optional route module ${candidate.path} unavailable:`, error instanceof Error ? error.message : error);
      }
    }
  }

  return routers;
}

export async function registerApiRoutes(app: express.Application) {
  const api = express.Router();

  api.use(express.json({ limit: '4mb' }));
  api.use(express.urlencoded({ extended: true }));

  api.get('/health', (req, res) => {
    const tenantContext = getTenantContext();
    res.json({
      ok: true,
      service: 'autolytiq-backend',
      timestamp: new Date().toISOString(),
      tenant: tenantContext?.tenantId ?? req.header('x-tenant-id') ?? null,
    });
  });

  const mlProxy = createProxyMiddleware({
    target: process.env.ML_SERVICE_URL ?? 'http://localhost:5001',
    changeOrigin: true,
    pathRewrite: { '^/ml': '/api/ml' },
  });

  api.use('/ml', mlProxy);

  api.use(authenticate);

  api.use('/superadmin', requireSuperAdmin, superAdminRoutes);

  api.use(tenantScope);

  api.use('/settings', settingsRoutes);
  api.use('/crm', crmRoutes);

  const optionalRouters = await loadOptionalRoutes();
  for (const router of optionalRouters) {
    api.use(router);
  }

  api.use(errorHandler);

  app.use('/api', api);
}

import express from 'express';
import { toApiError } from './lib/errors.js';
import { initializeContext } from './middleware/context.js';
import { registerRoutes } from './routes/index.js';
import { initializeDomainIntegrations } from './integrations/index.js';
import { watchScoringConfig } from './config/scoring.js';
import { logger, requestTracingMiddleware } from './lib/logger.js';

watchScoringConfig();
initializeDomainIntegrations();

export function createApp() {
  const app = express();

  // Add request tracing for better debugging
  app.use(requestTracingMiddleware);
  app.use(initializeContext);
  app.use(express.json());

  registerRoutes(app);

  // Enhanced error handler with logging
  app.use((err: unknown, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const normalized = toApiError(err);
    
    // Log all errors for debugging
    logger.error('Request error', err as Error, {
      path: req.path,
      method: req.method,
      statusCode: normalized.status,
      errorCode: normalized.code,
    });

    const payload: Record<string, unknown> = {
      code: normalized.code,
      message: normalized.message,
    };
    if (typeof normalized.details !== 'undefined') {
      payload.details = normalized.details;
    }
    
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && err instanceof Error) {
      payload.stack = err.stack;
    }
    
    res.status(normalized.status).json(payload);
  });

  return app;
}

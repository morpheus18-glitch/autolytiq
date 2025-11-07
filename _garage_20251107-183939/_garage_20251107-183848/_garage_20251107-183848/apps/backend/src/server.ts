import express from 'express';
import { toApiError } from './lib/errors';
import { initializeContext } from './middleware/context';
import { registerRoutes } from './routes/index';
import { initializeDomainIntegrations } from './integrations/index';
import { watchScoringConfig } from './config/scoring';
import { logger, requestTracingMiddleware } from './lib/logger';

watchScoringConfig();
initializeDomainIntegrations();

export function createApp() {
  const app = express();

  // CORS middleware - must be before other middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://app.autolytiq.com',
      'https://autolytiq.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization'
    );
    res.setHeader('Access-Control-Max-Age', '1728000');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

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

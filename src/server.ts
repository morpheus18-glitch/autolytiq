import express from 'express';
import { toApiError } from './lib/errors.js';
import { initializeContext } from './middleware/context.js';
import { registerRoutes } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(initializeContext);
  app.use(express.json());

  registerRoutes(app);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const normalized = toApiError(err);
    const payload: Record<string, unknown> = {
      code: normalized.code,
      message: normalized.message,
    };
    if (typeof normalized.details !== 'undefined') {
      payload.details = normalized.details;
    }
    res.status(normalized.status).json(payload);
  });

  return app;
}

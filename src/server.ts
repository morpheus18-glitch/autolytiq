import express from 'express';
import { initializeContext } from './middleware/context.js';
import { registerRoutes } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(initializeContext);
  app.use(express.json());

  registerRoutes(app);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = typeof err === 'object' && err && 'status' in err ? (err as any).status : 500;
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(status).json({ message });
  });

  return app;
}

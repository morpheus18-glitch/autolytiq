import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { metricsController, metricsMiddleware } from './lib/metrics.js';
import { registerApiRoutes } from './routes/index.js';

export async function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: env.SOCKET_IO_CORS_ORIGIN.split(',').map((entry) => entry.trim()),
      credentials: true,
    }),
  );

  app.use(helmet());
  app.use(compression());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(metricsMiddleware);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.get('/metrics', metricsController);

  await registerApiRoutes(app);

  return app;
}

export default createApp;

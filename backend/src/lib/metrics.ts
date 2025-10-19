import type { NextFunction, Request, Response } from 'express';
import client from 'prom-client';

const registry = new client.Registry();
registry.setDefaultLabels({ service: 'autolytiq-backend' });
client.collectDefaultMetrics({ register: registry });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
});

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status_code'],
});

registry.registerMetric(httpRequestDuration);
registry.registerMetric(httpRequestCounter);

function resolveRouteLabel(req: Request): string {
  if (req.route?.path) {
    return `${req.baseUrl}${req.route.path}`;
  }
  if (req.baseUrl) {
    return req.baseUrl;
  }
  return req.originalUrl.split('?')[0];
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/metrics') {
    return next();
  }

  const stopTimer = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const route = resolveRouteLabel(req);
    const labels = { method: req.method, route, status_code: String(res.statusCode) };
    stopTimer(labels);
    httpRequestCounter.inc(labels);
  });

  next();
}

export async function metricsController(_req: Request, res: Response) {
  res.setHeader('Content-Type', registry.contentType);
  res.send(await registry.metrics());
}

export { registry };

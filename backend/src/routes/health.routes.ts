import express from 'express';
import axios from 'axios';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import client from 'prom-client';

const router = express.Router();
const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379/0';
const clickhouseHost = process.env.CLICKHOUSE_HOST ?? 'localhost';
const clickhousePort = process.env.CLICKHOUSE_PORT ?? '8123';
const mlServiceUrl = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';

const register = new client.Registry();
register.setDefaultLabels({ service: 'autolytiq-backend' });
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

router.use((req, res, next) => {
  const end = httpRequestDuration.startTimer({ method: req.method, route: req.path });
  res.on('finish', () => {
    end({ status_code: res.statusCode });
  });
  next();
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/health/live', (_req, res) => {
  res.json({ status: 'alive' });
});

router.get('/health/ready', async (_req, res) => {
  const checks: Record<string, 'ok' | 'error'> = {
    database: 'error',
    redis: 'error',
    clickhouse: 'error',
    mlService: 'error',
  };

  let ready = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (error) {
    ready = false;
  }

  const redis = new Redis(redisUrl, { lazyConnect: true });
  try {
    await redis.connect();
    await redis.ping();
    checks.redis = 'ok';
  } catch (error) {
    ready = false;
  } finally {
    redis.disconnect();
  }

  try {
    const clickhouseUrl = `http://${clickhouseHost}:${clickhousePort}/ping`;
    const response = await axios.get(clickhouseUrl, { timeout: 2000 });
    checks.clickhouse = response.status === 200 && response.data === 'Ok.' ? 'ok' : 'error';
    if (checks.clickhouse === 'error') {
      ready = false;
    }
  } catch (error) {
    ready = false;
  }

  try {
    const response = await axios.get(`${mlServiceUrl}/health`, { timeout: 2000 });
    checks.mlService = response.status === 200 ? 'ok' : 'error';
  } catch (error) {
    // ML service is optional; do not fail readiness but report state
    checks.mlService = 'error';
  }

  res.status(ready ? 200 : 503).json({
    ready,
    checks,
    timestamp: new Date().toISOString(),
  });
});

router.get('/health/detailed', async (_req, res) => {
  const details: Record<string, unknown> = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
  };

  try {
    const [stats] = await prisma.$queryRaw<Array<{ tenants: bigint; users: bigint; deals: bigint }>>`
      SELECT 
        (SELECT COUNT(*) FROM tenants) as tenants,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM deals) as deals
    `;
    details.database = {
      tenants: Number(stats.tenants ?? 0),
      users: Number(stats.users ?? 0),
      deals: Number(stats.deals ?? 0),
    };
  } catch (error) {
    details.database = { error: 'Failed to fetch stats' };
  }

  res.json(details);
});

router.get('/metrics', async (_req, res) => {
  try {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (error) {
    res.status(500).send('# Metrics collection failed');
  }
});

export default router;

import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';
import { metricsController } from '../lib/metrics.js';
import { createCacheClient } from '../lib/cache.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

router.get('/health/live', (_req, res) => {
  res.json({ status: 'alive' });
});

router.get('/health/ready', async (_req, res) => {
  const checks: Record<string, 'ok' | 'error'> = {
    database: 'error',
    redis: 'error',
    clickhouse: 'ok',
    mlService: 'ok',
  };

  let ready = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (error) {
    ready = false;
    checks.database = 'error';
  }

  const redis = createCacheClient();
  try {
    await redis.connect();
    await redis.ping();
    checks.redis = 'ok';
  } catch (error) {
    ready = false;
    checks.redis = 'error';
  } finally {
    try {
      if (redis.status !== 'end') {
        await redis.quit();
      }
    } catch (quitError) {
      redis.disconnect();
      if (env.NODE_ENV === 'development') {
        console.warn('Failed to quit Redis client during health check:', quitError);
      }
    }
  }

  const clickhouseHost = env.CLICKHOUSE_HOST;
  if (clickhouseHost) {
    try {
      const clickhouseUrl = `http://${clickhouseHost}:${env.CLICKHOUSE_PORT}/ping`;
      const response = await axios.get(clickhouseUrl, { timeout: 2000 });
      checks.clickhouse = response.status === 200 && response.data === 'Ok.' ? 'ok' : 'error';
      if (checks.clickhouse === 'error') {
        ready = false;
      }
    } catch (error) {
      ready = false;
      checks.clickhouse = 'error';
    }
  }

  try {
    const response = await axios.get(`${env.ML_SERVICE_URL.replace(/\/$/, '')}/health`, { timeout: 2000 });
    checks.mlService = response.status === 200 ? 'ok' : 'error';
  } catch (error) {
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

router.get('/metrics', metricsController);

export default router;

import { Router } from 'express';
import { mlService } from '../services/ml.service.js';
import { prisma } from '../lib/prisma.js';
import { getCacheStats } from '../services/ml-cache.service.js';
import { checkHealth as checkPricingHealth } from '../services/pricing.service.js';

const router = Router();

/**
 * Overall system health check
 * Returns 200 if all critical services are healthy
 */
router.get('/health', async (req, res) => {
  try {
    const start = Date.now();

    // Check database
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - start;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'healthy',
          latency: dbLatency,
        },
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
    });
  }
});

router.get('/health/pricing', async (_req, res) => {
  const start = Date.now();
  try {
    const health = await checkPricingHealth();
    const latency = Date.now() - start;

    if (health.healthy) {
      res.json({
        status: 'healthy',
        latency,
        version: health.version,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        latency,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    const latency = Date.now() - start;
    res.status(503).json({
      status: 'unhealthy',
      latency,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * ML service health check
 * Tests connectivity and response time of ML service
 */
router.get('/health/ml', async (req, res) => {
  const start = Date.now();

  try {
    // Try to call ML service health endpoint
    // Most ML services expose /health or /api/health
    const response = await fetch(`${process.env.ML_SERVICE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1000), // 1 second timeout
    });

    const latency = Date.now() - start;
    const data = await response.json();

    if (response.ok) {
      res.json({
        status: 'healthy',
        latency,
        version: data.version,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        latency,
        error: 'ML service returned non-200 status',
        statusCode: response.status,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    const latency = Date.now() - start;
    res.status(503).json({
      status: 'unhealthy',
      latency,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * ML cache statistics
 * Returns cache hit rates and statistics
 */
router.get('/health/ml/cache', async (req, res) => {
  try {
    const stats = await getCacheStats();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      cache: {
        total: stats.total,
        active: stats.active,
        expired: stats.expired,
        hitRate: stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(2) : '0.00',
        byFeatureType: stats.byFeatureType,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Database health and connection pool stats
 */
router.get('/health/database', async (req, res) => {
  try {
    const start = Date.now();

    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    const queryLatency = Date.now() - start;

    // Get rough count of connections (via active transaction test)
    const canConnect = await prisma.$queryRaw`SELECT COUNT(*) as count FROM information_schema.tables LIMIT 1`;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        queryLatency,
        canQuery: !!canConnect,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
    });
  }
});

/**
 * Readiness probe (for Kubernetes)
 * Returns 200 when service is ready to accept traffic
 */
router.get('/ready', async (req, res) => {
  try {
    // Check critical dependencies
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Liveness probe (for Kubernetes)
 * Returns 200 if service is alive (even if not ready)
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

export { router as healthRouter };

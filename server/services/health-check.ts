import { checkDatabaseHealth } from '../prisma';
import { db, pool } from '../db';
import { env } from '../config/env';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    database: {
      healthy: boolean;
      latency: number;
      error?: string;
      provider: 'prisma' | 'drizzle';
    };
    memory: {
      healthy: boolean;
      used: number;
      total: number;
      percentage: number;
    };
    process: {
      healthy: boolean;
      pid: number;
      uptime: number;
    };
  };
}

/**
 * Comprehensive health check for production monitoring
 * Checks database, memory, and process health
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = {
    database: await checkDatabaseConnection(),
    memory: checkMemoryUsage(),
    process: checkProcessHealth(),
  };

  // Determine overall status
  const allHealthy = Object.values(checks).every((check) => check.healthy);
  const anyUnhealthy = Object.values(checks).some((check) => !check.healthy);

  const status: HealthCheckResult['status'] = allHealthy
    ? 'healthy'
    : anyUnhealthy
    ? 'degraded'
    : 'unhealthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    checks,
  };
}

/**
 * Check database connection health
 * Tests both Prisma and Drizzle connections
 */
async function checkDatabaseConnection(): Promise<HealthCheckResult['checks']['database']> {
  try {
    // Check Prisma connection
    const prismaHealth = await checkDatabaseHealth();

    if (!prismaHealth.healthy) {
      return {
        healthy: false,
        latency: prismaHealth.latency,
        error: prismaHealth.error,
        provider: 'prisma',
      };
    }

    // Try Drizzle connection as well
    try {
      const start = Date.now();
      await db.execute('SELECT 1');
      const drizzleLatency = Date.now() - start;

      return {
        healthy: true,
        latency: Math.max(prismaHealth.latency, drizzleLatency),
        provider: 'drizzle',
      };
    } catch (drizzleError) {
      // Fallback to Prisma if Drizzle fails
      return {
        healthy: prismaHealth.healthy,
        latency: prismaHealth.latency,
        error: drizzleError instanceof Error ? drizzleError.message : undefined,
        provider: 'prisma',
      };
    }
  } catch (error) {
    return {
      healthy: false,
      latency: 0,
      error: error instanceof Error ? error.message : 'Unknown database error',
      provider: 'prisma',
    };
  }
}

/**
 * Check memory usage
 * Returns unhealthy if memory usage exceeds 90%
 */
function checkMemoryUsage(): HealthCheckResult['checks']['memory'] {
  const memUsage = process.memoryUsage();
  const total = memUsage.heapTotal;
  const used = memUsage.heapUsed;
  const percentage = (used / total) * 100;

  return {
    healthy: percentage < 90,
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentage: Math.round(percentage),
  };
}

/**
 * Check process health
 */
function checkProcessHealth(): HealthCheckResult['checks']['process'] {
  return {
    healthy: true,
    pid: process.pid,
    uptime: Math.round(process.uptime()),
  };
}

/**
 * Simple liveness probe
 * Just checks if the process is running
 */
export function livenessProbe(): { alive: boolean } {
  return { alive: true };
}

/**
 * Readiness probe
 * Checks if the service is ready to accept traffic
 */
export async function readinessProbe(): Promise<{ ready: boolean; reason?: string }> {
  try {
    const dbHealth = await checkDatabaseHealth();
    if (!dbHealth.healthy) {
      return { ready: false, reason: 'Database not ready' };
    }

    const memHealth = checkMemoryUsage();
    if (!memHealth.healthy) {
      return { ready: false, reason: 'Memory usage too high' };
    }

    return { ready: true };
  } catch (error) {
    return {
      ready: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

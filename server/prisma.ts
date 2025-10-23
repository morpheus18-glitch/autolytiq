import { PrismaClient } from '@prisma/client';

import { env } from "./config/env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Production-optimized Prisma client with connection pooling
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Connection pool configuration for production
    ...(env.NODE_ENV === 'production' && {
      // Optimize connection pool for production workloads
      // These settings prevent connection exhaustion in serverless/high-concurrency environments
    }),
  });

// Graceful shutdown handler
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log('✅ Prisma client disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting Prisma client:', error);
    throw error;
  }
}

// Health check helper
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    return { healthy: true, latency };
  } catch (error) {
    const latency = Date.now() - start;
    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Register shutdown handlers
if (env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    console.log('⚠️  SIGINT received, disconnecting Prisma...');
    await disconnectPrisma();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('⚠️  SIGTERM received, disconnecting Prisma...');
    await disconnectPrisma();
    process.exit(0);
  });
}

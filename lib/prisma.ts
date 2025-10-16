import { Prisma, PrismaClient } from '@prisma/client';
import { tenantIsolationMiddleware } from './prisma-middleware.js';

const logConfiguration: Prisma.LogLevel[] = process.env.NODE_ENV === 'development'
  ? ['query', 'info', 'warn', 'error']
  : ['error'];

type GlobalPrisma = typeof globalThis & { prisma?: PrismaClient };

function createClient() {
  const client = new PrismaClient({
    log: logConfiguration,
  });

  client.$use(tenantIsolationMiddleware());

  return client;
}

const globalWithPrisma = globalThis as GlobalPrisma;

export const prisma = globalWithPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalWithPrisma.prisma = prisma;
}

export default prisma;

import Redis from 'ioredis';
import { env } from '../config/env.js';

let sharedClient: Redis | null = null;

function buildClient() {
  return new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 2,
    enableAutoPipelining: true,
  });
}

export function createCacheClient(): Redis {
  return buildClient();
}

export function getCacheClient(): Redis {
  if (!sharedClient) {
    sharedClient = buildClient();
  }
  return sharedClient;
}

export async function shutdownCache(): Promise<void> {
  if (sharedClient) {
    await sharedClient.quit();
    sharedClient = null;
  }
}

export async function quickSmoke(): Promise<boolean> {
  const client = createCacheClient();
  try {
    await client.connect();
    const key = `cache:smoke:${Date.now()}`;
    await client.set(key, 'ok', 'EX', 5);
    const result = await client.get(key);
    if (result !== 'ok') {
      throw new Error('Redis smoke test failed to read cached value');
    }
    return true;
  } finally {
    await client.quit();
  }
}

export type CacheClient = Redis;

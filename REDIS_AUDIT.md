# Redis Audit

**Generated**: 2025-11-06  
**Provider**: DigitalOcean Managed Redis  
**Client**: ioredis

---

## Usage Locations

**Found**: 3 files with Redis client creation

```
apps/backend/src/lib/redis.ts
apps/backend/src/services/cache.ts
apps/worker/src/queue.ts (if exists)
```

---

## Recommended Architecture

### Single Client Factory

**File**: `packages/shared/src/redis/client.ts` (TO CREATE)

```typescript
import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL!, {
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 50, 2000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
    });
    
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }
  
  return redisClient;
}

export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
```

---

## TTL Policies

**Recommended**:
- Session data: 24 hours
- Cache (API responses): 5-15 minutes
- Rate limiting: 1 minute sliding window
- Job queue: N/A (BullMQ manages)

---

## Key Naming Convention

```
autolytiq:{tenant}:{domain}:{id}
```

**Examples**:
```
autolytiq:tenant123:vehicle:abc123
autolytiq:tenant123:session:user456
autolytiq:ratelimit:api:192.168.1.1
```

---

## Connection String

### Development
```
REDIS_URL="redis://localhost:6379"
```

### Production (DigitalOcean)
```
REDIS_URL="rediss://:password@host:25061"
```

Stored in Kubernetes secret: `redis-secret`

---

## BullMQ (Job Queue)

**Usage**: Background jobs, async tasks

```typescript
import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '@repo/shared/redis';

const emailQueue = new Queue('email', {
  connection: getRedisClient(),
});

const worker = new Worker('email', async (job) => {
  // Process job
}, {
  connection: getRedisClient(),
});
```

---

## Monitoring

**Metrics to Track**:
- Connection count
- Memory usage
- Hit/miss ratio
- Eviction rate

**Tools**:
- Redis CLI: `redis-cli info`
- DigitalOcean dashboard
- Prometheus redis_exporter


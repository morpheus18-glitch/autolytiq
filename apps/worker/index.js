import { PrismaClient } from '@prisma/client';
import { Kafka, logLevel } from 'kafkajs';
import pRetry from 'p-retry';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const kafkaBrokers = (process.env.KAFKA_BROKERS || 'localhost:9092')
  .split(',')
  .map((broker) => broker.trim())
  .filter(Boolean);

if (kafkaBrokers.length === 0) {
  throw new Error('KAFKA_BROKERS environment variable must be set');
}

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'autolytiq-outbox-worker',
  brokers: kafkaBrokers,
  logLevel: logLevel.WARN,
});

const producer = kafka.producer({
  allowAutoTopicCreation: true,
});

let isShuttingDown = false;

async function publishOutboxEvent(event) {
  const payloadBuffer = Buffer.from(JSON.stringify(event.payload));

  await producer.send({
    topic: event.topic,
    messages: [
      {
        key: event.tenantId,
        value: payloadBuffer,
        headers: {
          'x-tenant-id': event.tenantId,
          'x-event-type': event.eventType,
          'x-occurred-at': event.occurredAt.toISOString(),
        },
      },
    ],
  });

  await prisma.outbox.update({
    where: { id: event.id },
    data: { publishedAt: new Date() },
  });
}

async function processBatch() {
  const events = await prisma.outbox.findMany({
    where: { publishedAt: null },
    orderBy: { occurredAt: 'asc' },
    take: Number(process.env.OUTBOX_BATCH_SIZE || 50),
  });

  if (events.length === 0) {
    return 0;
  }

  for (const event of events) {
    await pRetry(() => publishOutboxEvent(event), {
      retries: 5,
      factor: 2,
      minTimeout: 500,
      onFailedAttempt: (error) => {
        console.warn('Failed to publish outbox event, retrying', {
          id: event.id,
          attemptNumber: error.attemptNumber,
          retriesLeft: error.retriesLeft,
        });
      },
    });
  }

  return events.length;
}

async function workerLoop() {
  const pollIntervalMs = Number(process.env.OUTBOX_POLL_INTERVAL_MS || 1000);

  while (!isShuttingDown) {
    try {
      const processed = await processBatch();
      if (processed > 0) {
        console.info(`Published ${processed} outbox events`);
      }
    } catch (error) {
      console.error('Outbox worker loop error', error);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
}

async function main() {
  console.info('Starting outbox worker...');
  await producer.connect();
  await workerLoop();
}

process.on('SIGINT', async () => {
  console.info('Received SIGINT, shutting down worker...');
  isShuttingDown = true;
  await producer.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.info('Received SIGTERM, shutting down worker...');
  isShuttingDown = true;
  await producer.disconnect();
  await prisma.$disconnect();
  process.exit(0);
});

main().catch(async (error) => {
  console.error('Failed to start outbox worker', error);
  await producer.disconnect().catch(() => undefined);
  await prisma.$disconnect();
  process.exit(1);
});

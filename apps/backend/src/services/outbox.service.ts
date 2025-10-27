import { prisma, toInputJson } from '../lib/prisma.js';

/**
 * Outbox Event Topics
 * Use versioned topic names for backward compatibility
 */
export const OutboxTopics = {
  // CRM Domain
  CUSTOMER: 'crm.customer.v1',
  LEAD: 'crm.lead.v1',
  ACTIVITY: 'crm.activity.v1',

  // Inventory Domain
  VEHICLE: 'inventory.vehicle.v1',
  APPRAISAL: 'inventory.appraisal.v1',
  RECON: 'inventory.recon.v1',

  // Deal/F&I Domain
  DEAL: 'fi.deal.v1',
  DEAL_WORKSHEET: 'fi.worksheet.v1',
  DEAL_VERSION: 'fi.version.v1',
  CREDIT_APP: 'fi.credit.v1',

  // Accounting Domain
  JOURNAL: 'accounting.journal.v1',
  COMMISSION: 'accounting.commission.v1',
} as const;

export type OutboxTopic = (typeof OutboxTopics)[keyof typeof OutboxTopics];

export interface OutboxEventData {
  topic: OutboxTopic;
  eventType: string;
  payload: Record<string, unknown>;
}

/**
 * Publish an event to the outbox for durable, ordered processing
 *
 * The outbox pattern ensures:
 * - Events are stored atomically with business transaction
 * - Events are never lost (durability)
 * - Events can be published to external systems (e.g., message bus)
 * - Events maintain ordering within a tenant
 *
 * @param tenantId - Tenant context for event
 * @param event - Event data to publish
 */
export async function publishToOutbox(
  tenantId: string,
  event: OutboxEventData,
): Promise<void> {
  await prisma.outbox.create({
    data: {
      tenantId,
      topic: event.topic,
      eventType: event.eventType,
      payload: toInputJson(event.payload),
    },
  });
}

/**
 * Publish multiple events atomically within a transaction
 * Use this when multiple domain events happen in a single business operation
 */
export async function publishBatchToOutbox(
  tenantId: string,
  events: OutboxEventData[],
): Promise<void> {
  await prisma.$transaction(
    events.map((event) =>
      prisma.outbox.create({
        data: {
          tenantId,
          topic: event.topic,
          eventType: event.eventType,
          payload: toInputJson(event.payload),
        },
      }),
    ),
  );
}

/**
 * Get unpublished events for processing by external consumers
 * This would typically be called by a background job that:
 * 1. Fetches unpublished events
 * 2. Publishes to message bus (Kafka, RabbitMQ, etc.)
 * 3. Marks as published
 *
 * @param limit - Maximum events to fetch
 */
export async function getUnpublishedEvents(limit: number = 100) {
  return prisma.outbox.findMany({
    where: {
      publishedAt: null,
    },
    orderBy: {
      occurredAt: 'asc',
    },
    take: limit,
  });
}

/**
 * Mark events as published after successful external delivery
 */
export async function markEventsPublished(eventIds: string[]): Promise<void> {
  await prisma.outbox.updateMany({
    where: {
      id: { in: eventIds },
    },
    data: {
      publishedAt: new Date(),
    },
  });
}

/**
 * Get event history for a specific tenant
 * Useful for debugging, auditing, and replay scenarios
 */
export async function getOutboxHistory(
  tenantId: string,
  options: {
    topic?: OutboxTopic;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {},
) {
  const where: Record<string, unknown> = {
    tenantId,
  };

  if (options.topic) {
    where.topic = options.topic;
  }

  if (options.startDate || options.endDate) {
    where.occurredAt = {};
    if (options.startDate) {
      (where.occurredAt as Record<string, unknown>).gte = options.startDate;
    }
    if (options.endDate) {
      (where.occurredAt as Record<string, unknown>).lte = options.endDate;
    }
  }

  return prisma.outbox.findMany({
    where,
    orderBy: {
      occurredAt: 'desc',
    },
    take: options.limit ?? 50,
  });
}

/**
 * Clean up old published events
 * Run this periodically (e.g., daily) to prevent unbounded table growth
 * Keep events for at least 30 days for audit/replay purposes
 */
export async function cleanupOldEvents(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.outbox.deleteMany({
    where: {
      publishedAt: {
        not: null,
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}

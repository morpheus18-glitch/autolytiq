import crypto from 'crypto';
import { prisma, toInputJson } from '../lib/prisma';
import { publishToOutbox, OutboxTopics } from './outbox.service';

/**
 * Deal Event Types
 * These represent immutable state transitions in the deal lifecycle
 */
export const DealEventType = {
  // Initial creation
  DEAL_CREATED: 'DEAL_CREATED',

  // Quote/Worksheet events
  DEAL_QUOTED: 'DEAL_QUOTED',
  WORKSHEET_UPDATED: 'WORKSHEET_UPDATED',
  VERSION_COMMITTED: 'VERSION_COMMITTED',
  VERSION_SELECTED: 'VERSION_SELECTED',

  // Deal status changes
  DEAL_SUBMITTED: 'DEAL_SUBMITTED',
  DEAL_APPROVED: 'DEAL_APPROVED',
  DEAL_REJECTED: 'DEAL_REJECTED',
  DEAL_FUNDED: 'DEAL_FUNDED',
  DEAL_DELIVERED: 'DEAL_DELIVERED',
  DEAL_CANCELLED: 'DEAL_CANCELLED',

  // F&I events
  CREDIT_APP_SUBMITTED: 'CREDIT_APP_SUBMITTED',
  LENDER_SUBMITTED: 'LENDER_SUBMITTED',
  LENDER_RESPONDED: 'LENDER_RESPONDED',
  FI_PRODUCT_ADDED: 'FI_PRODUCT_ADDED',
  FI_PRODUCT_REMOVED: 'FI_PRODUCT_REMOVED',

  // Counter-offers
  COUNTER_OFFER_RECEIVED: 'COUNTER_OFFER_RECEIVED',
  COUNTER_OFFER_ACCEPTED: 'COUNTER_OFFER_ACCEPTED',
  COUNTER_OFFER_REJECTED: 'COUNTER_OFFER_REJECTED',

  // Optimization
  DEAL_OPTIMIZED: 'DEAL_OPTIMIZED',

  // Compliance
  COMPLIANCE_CHECK_COMPLETED: 'COMPLIANCE_CHECK_COMPLETED',
  DOCUMENT_SIGNED: 'DOCUMENT_SIGNED',
} as const;

export type DealEventTypeValue = (typeof DealEventType)[keyof typeof DealEventType];

export interface DealEventInput {
  dealId: string;
  eventType: DealEventTypeValue;
  payload: Record<string, unknown>;
  userId?: string | null;
}

/**
 * Compute SHA-256 hash of event for tamper detection
 * Hash includes: dealId, eventType, payload, prevHash, timestamp
 *
 * This creates an immutable chain - if any event is modified,
 * the hash chain breaks and can be detected.
 */
function computeEventHash(event: {
  dealId: string;
  eventType: string;
  payload: Record<string, unknown>;
  prevHash: string | null;
  occurredAt: Date;
}): string {
  const data = JSON.stringify({
    dealId: event.dealId,
    eventType: event.eventType,
    payload: event.payload,
    prevHash: event.prevHash,
    occurredAt: event.occurredAt.toISOString(),
  });

  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Append an immutable event to the deal event log
 *
 * This function:
 * 1. Retrieves the last event for hash chaining
 * 2. Computes the new event's hash (including previous hash)
 * 3. Stores the event (never UPDATE/DELETE)
 * 4. Publishes to outbox for external consumers
 *
 * The hash chain ensures:
 * - Tamper detection (any modification breaks the chain)
 * - Event ordering (each event references previous)
 * - Audit compliance (complete history with cryptographic proof)
 *
 * @param tenantId - Tenant context
 * @param event - Event data to append
 */
export async function appendDealEvent(
  tenantId: string,
  event: DealEventInput,
): Promise<void> {
  // Get last event for this deal to build hash chain
  const lastEvent = await prisma.dealEvent.findFirst({
    where: {
      tenantId,
      dealId: event.dealId,
    },
    orderBy: {
      occurredAt: 'desc',
    },
    select: {
      thisHash: true,
    },
  });

  const occurredAt = new Date();
  const prevHash = lastEvent?.thisHash ?? null;

  // Compute hash for this event
  const thisHash = computeEventHash({
    dealId: event.dealId,
    eventType: event.eventType,
    payload: event.payload,
    prevHash,
    occurredAt,
  });

  // Append event (NEVER update or delete - append-only log)
  await prisma.dealEvent.create({
    data: {
      tenantId,
      dealId: event.dealId,
      eventType: event.eventType,
      payload: toInputJson(event.payload),
      userId: event.userId ?? null,
      prevHash,
      thisHash,
      occurredAt,
    },
  });

  // Publish to outbox for external consumers
  await publishToOutbox(tenantId, {
    topic: OutboxTopics.DEAL,
    eventType: event.eventType,
    payload: {
      dealId: event.dealId,
      eventType: event.eventType,
      occurredAt: occurredAt.toISOString(),
      ...event.payload,
    },
  });
}

/**
 * Verify the integrity of the deal event chain
 *
 * This function:
 * 1. Fetches all events for a deal in order
 * 2. Recomputes each hash
 * 3. Verifies hash chain linkage
 *
 * Returns:
 * - valid: true if chain is intact
 * - errors: array of detected issues
 *
 * Use this for:
 * - Periodic audit checks
 * - Pre-funding verification
 * - Compliance reporting
 * - Forensic investigation
 */
export async function verifyDealEventChain(
  dealId: string,
): Promise<{ valid: boolean; errors: string[] }> {
  const events = await prisma.dealEvent.findMany({
    where: { dealId },
    orderBy: { occurredAt: 'asc' },
  });

  const errors: string[] = [];
  let prevHash: string | null = null;

  for (const event of events) {
    // Verify hash matches computed value
    const expectedHash = computeEventHash({
      dealId: event.dealId,
      eventType: event.eventType,
      payload: event.payload as Record<string, unknown>,
      prevHash: event.prevHash,
      occurredAt: event.occurredAt,
    });

    if (expectedHash !== event.thisHash) {
      errors.push(
        `Event ${event.id} (${event.eventType}): Hash mismatch. ` +
          `Expected ${expectedHash}, got ${event.thisHash}`,
      );
    }

    // Verify chain linkage
    if (event.prevHash !== prevHash) {
      errors.push(
        `Event ${event.id} (${event.eventType}): Chain broken. ` +
          `Expected prevHash ${prevHash}, got ${event.prevHash}`,
      );
    }

    prevHash = event.thisHash;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Reconstruct deal state at any point in time (time travel)
 *
 * This is critical for:
 * - "What did the deal look like on April 15?"
 * - Compliance audits (prove what customer saw)
 * - Dispute resolution
 * - Rollback scenarios
 *
 * Implementation:
 * 1. Fetch all events up to timestamp
 * 2. Replay events in order
 * 3. Build aggregate state
 *
 * @param dealId - Deal to reconstruct
 * @param timestamp - Point in time to reconstruct
 */
export async function getDealStateAt(
  dealId: string,
  timestamp: Date,
): Promise<Record<string, unknown>> {
  const events = await prisma.dealEvent.findMany({
    where: {
      dealId,
      occurredAt: { lte: timestamp },
    },
    orderBy: { occurredAt: 'asc' },
  });

  // Replay events to build state
  let state: Record<string, unknown> = {};

  for (const event of events) {
    const payload = event.payload as Record<string, unknown>;

    switch (event.eventType) {
      case DealEventType.DEAL_CREATED:
        state = { ...payload, dealId, status: 'DRAFT' };
        break;

      case DealEventType.DEAL_QUOTED:
        state = {
          ...state,
          quote: payload.quote,
          quotedAt: event.occurredAt.toISOString(),
        };
        break;

      case DealEventType.WORKSHEET_UPDATED:
        state = {
          ...state,
          worksheet: payload.worksheet,
          worksheetUpdatedAt: event.occurredAt.toISOString(),
        };
        break;

      case DealEventType.VERSION_COMMITTED:
        state = {
          ...state,
          currentVersion: payload.version,
          versionCommittedAt: event.occurredAt.toISOString(),
        };
        break;

      case DealEventType.VERSION_SELECTED:
        state = {
          ...state,
          selectedVersion: payload.versionId,
          versionSelectedAt: event.occurredAt.toISOString(),
        };
        break;

      case DealEventType.DEAL_SUBMITTED:
        state = {
          ...state,
          status: 'SUBMITTED',
          submittedAt: event.occurredAt.toISOString(),
          submittedBy: payload.userId,
        };
        break;

      case DealEventType.DEAL_APPROVED:
        state = {
          ...state,
          status: 'APPROVED',
          approvedAt: event.occurredAt.toISOString(),
          approvedBy: payload.approvedBy,
          lender: payload.lender,
        };
        break;

      case DealEventType.DEAL_REJECTED:
        state = {
          ...state,
          status: 'REJECTED',
          rejectedAt: event.occurredAt.toISOString(),
          rejectionReason: payload.reason,
        };
        break;

      case DealEventType.DEAL_FUNDED:
        state = {
          ...state,
          status: 'FUNDED',
          fundedAt: event.occurredAt.toISOString(),
          fundingAmount: payload.amount,
        };
        break;

      case DealEventType.DEAL_DELIVERED:
        state = {
          ...state,
          status: 'DELIVERED',
          deliveredAt: event.occurredAt.toISOString(),
        };
        break;

      case DealEventType.DEAL_CANCELLED:
        state = {
          ...state,
          status: 'CANCELLED',
          cancelledAt: event.occurredAt.toISOString(),
          cancellationReason: payload.reason,
        };
        break;

      case DealEventType.FI_PRODUCT_ADDED:
        {
          const products = (state.fiProducts as unknown[] | undefined) ?? [];
          state = {
            ...state,
            fiProducts: [...products, payload.product],
          };
        }
        break;

      case DealEventType.FI_PRODUCT_REMOVED:
        {
          const products = (state.fiProducts as unknown[] | undefined) ?? [];
          state = {
            ...state,
            fiProducts: products.filter(
              (p: unknown) =>
                (p as Record<string, unknown>).id !== payload.productId,
            ),
          };
        }
        break;

      case DealEventType.COUNTER_OFFER_RECEIVED:
        state = {
          ...state,
          counterOffer: payload.counterOffer,
          counterOfferReceivedAt: event.occurredAt.toISOString(),
        };
        break;

      case DealEventType.COUNTER_OFFER_ACCEPTED:
        state = {
          ...state,
          counterOfferStatus: 'ACCEPTED',
          counterOfferAcceptedAt: event.occurredAt.toISOString(),
        };
        break;

      default:
        // Store unknown events in metadata
        const metadata = (state.metadata as Record<string, unknown[]> | undefined) ?? {
          events: [],
        };
        const eventList = metadata.events ?? [];
        state = {
          ...state,
          metadata: {
            ...metadata,
            events: [
              ...eventList,
              {
                type: event.eventType,
                occurredAt: event.occurredAt.toISOString(),
                payload,
              },
            ],
          },
        };
    }
  }

  return state;
}

/**
 * Get complete event history for a deal
 * Useful for audit trails, debugging, and timeline views
 */
export async function getDealEventHistory(
  tenantId: string,
  dealId: string,
): Promise<
  Array<{
    id: string;
    eventType: string;
    payload: Record<string, unknown>;
    userId: string | null;
    occurredAt: string;
  }>
> {
  const events = await prisma.dealEvent.findMany({
    where: { tenantId, dealId },
    orderBy: { occurredAt: 'asc' },
    select: {
      id: true,
      eventType: true,
      payload: true,
      userId: true,
      occurredAt: true,
    },
  });

  return events.map((event) => ({
    ...event,
    payload: event.payload as Record<string, unknown>,
    occurredAt: event.occurredAt.toISOString(),
  }));
}

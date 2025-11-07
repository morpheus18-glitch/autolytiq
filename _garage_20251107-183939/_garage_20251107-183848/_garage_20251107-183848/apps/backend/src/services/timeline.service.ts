import { Prisma } from '@prisma/client';
import { prisma, getTenantId } from '../lib/prisma';

export interface TimelineEventBase {
  id: string;
  category: 'ACTIVITY' | 'COMMUNICATION' | 'APPOINTMENT' | 'DEAL' | 'SERVICE';
  type: string;
  title: string | null;
  body: string | null;
  occurredAt: Date;
  createdAt: Date;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  metadata?: Record<string, unknown>;
}

export interface ActivityTimelineEvent extends TimelineEventBase {
  category: 'ACTIVITY';
  type: 'EMAIL' | 'CALL' | 'SMS' | 'NOTE' | 'TASK' | 'MEETING' | 'FOLLOW_UP' | 'TEST_DRIVE' | 'VISIT';
  status: string;
  outcome?: string;
  dueAt?: Date;
}

export interface CommunicationTimelineEvent extends TimelineEventBase {
  category: 'COMMUNICATION';
  type: 'SMS' | 'EMAIL' | 'CALL';
  direction: 'INBOUND' | 'OUTBOUND';
  status: string;
  provider?: string;
  to?: string;
  from?: string;
}

export interface AppointmentTimelineEvent extends TimelineEventBase {
  category: 'APPOINTMENT';
  type: 'SALES' | 'SERVICE' | 'DELIVERY' | 'FOLLOW_UP' | 'TEST_DRIVE';
  status: string;
  startAt: Date;
  endAt?: Date;
  location?: string;
  outcome?: string;
}

export interface DealTimelineEvent extends TimelineEventBase {
  category: 'DEAL';
  type: 'CREATED' | 'UPDATED' | 'STAGE_CHANGED' | 'SUBMITTED' | 'APPROVED' | 'FUNDED' | 'DELIVERED';
  dealId: string;
  stage?: string;
  amount?: number;
  vehicle?: {
    year: number;
    make: string;
    model: string;
  };
}

export interface ServiceTimelineEvent extends TimelineEventBase {
  category: 'SERVICE';
  type: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID';
  roNumber: string;
  status: string;
  totalCents?: number;
  mileage?: number;
}

export type TimelineEvent =
  | ActivityTimelineEvent
  | CommunicationTimelineEvent
  | AppointmentTimelineEvent
  | DealTimelineEvent
  | ServiceTimelineEvent;

interface TimelineQuery {
  customerId?: string;
  leadId?: string;
  categories?: TimelineEvent['category'][];
  types?: string[];
  actorId?: string;
  fromDate?: Date;
  toDate?: Date;
  cursor?: string; // ISO timestamp
  limit?: number;
}

interface TimelineResponse {
  events: TimelineEvent[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

function requireTenantId(): string {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error('Tenant context required for timeline operations');
  }
  return tenantId;
}

/**
 * Builds a unified customer timeline aggregating all touchpoints
 * (activities, communications, appointments, deals, services)
 */
export async function buildCustomerTimeline(query: TimelineQuery): Promise<TimelineResponse> {
  const tenantId = requireTenantId();
  const limit = query.limit ?? 50;
  const cursor = query.cursor ? new Date(query.cursor) : null;

  // Validate that we have at least one identifier
  if (!query.customerId && !query.leadId) {
    throw new Error('Either customerId or leadId must be provided');
  }

  // Build base where clause
  const buildBaseWhere = (cursorField: string = 'createdAt'): Record<string, unknown> => {
    const where: Record<string, unknown> = { tenantId };

    // Add customer/lead filter
    if (query.customerId && query.leadId) {
      where.OR = [{ customerId: query.customerId }, { leadId: query.leadId }];
    } else if (query.customerId) {
      where.customerId = query.customerId;
    } else if (query.leadId) {
      where.leadId = query.leadId;
    }

    // Add cursor pagination
    if (cursor) {
      where[cursorField] = { lt: cursor };
    }

    // Add date range filters
    if (query.fromDate || query.toDate) {
      const dateFilter: Record<string, unknown> = {};
      if (query.fromDate) dateFilter.gte = query.fromDate;
      if (query.toDate) dateFilter.lte = query.toDate;

      if (cursor) {
        where[cursorField] = { ...where[cursorField], ...dateFilter };
      } else {
        where[cursorField] = dateFilter;
      }
    }

    // Add actor filter
    if (query.actorId) {
      where.userId = query.actorId;
    }

    return where;
  };

  // Fetch activities
  let activities: TimelineEvent[] = [];
  if (!query.categories || query.categories.includes('ACTIVITY')) {
    const activityWhere = buildBaseWhere() as Prisma.ActivityWhereInput;

    if (query.types) {
      activityWhere.type = { in: query.types as any };
    }

    const activityRecords = await prisma.activity.findMany({
      where: activityWhere,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    activities = activityRecords.map(
      (a): ActivityTimelineEvent => ({
        id: a.id,
        category: 'ACTIVITY',
        type: a.type as any,
        title: a.subject,
        body: a.description,
        occurredAt: a.createdAt,
        createdAt: a.createdAt,
        actor: a.user,
        status: a.status,
        outcome: a.outcome ?? undefined,
        dueAt: a.dueAt ?? undefined,
        metadata: a.metadata as any,
      })
    );
  }

  // Fetch communications
  let communications: TimelineEvent[] = [];
  if (!query.categories || query.categories.includes('COMMUNICATION')) {
    const commWhere = buildBaseWhere() as Prisma.CommunicationWhereInput;

    if (query.types) {
      commWhere.type = { in: query.types as any };
    }

    const commRecords = await prisma.communication.findMany({
      where: commWhere,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    communications = commRecords.map(
      (c): CommunicationTimelineEvent => ({
        id: c.id,
        category: 'COMMUNICATION',
        type: c.type as any,
        title: c.subject,
        body: c.body,
        occurredAt: c.createdAt,
        createdAt: c.createdAt,
        actor: c.user,
        direction: c.direction as any,
        status: c.status,
        provider: (c.metadata as any)?.provider,
        to: c.to ?? undefined,
        from: c.from ?? undefined,
        metadata: c.metadata as any,
      })
    );
  }

  // Fetch appointments
  let appointments: TimelineEvent[] = [];
  if (!query.categories || query.categories.includes('APPOINTMENT')) {
    const apptWhere = buildBaseWhere('startAt') as Prisma.AppointmentWhereInput;

    if (query.types) {
      apptWhere.type = { in: query.types as any };
    }

    // Override actor field for appointments
    if (query.actorId) {
      delete (apptWhere as any).userId;
      apptWhere.assignedToId = query.actorId;
    }

    const apptRecords = await prisma.appointment.findMany({
      where: apptWhere,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { startAt: 'desc' },
      take: limit,
    });

    appointments = apptRecords.map(
      (a): AppointmentTimelineEvent => ({
        id: a.id,
        category: 'APPOINTMENT',
        type: a.type as any,
        title: a.title,
        body: a.notes,
        occurredAt: a.startAt,
        createdAt: a.createdAt,
        actor: a.assignedTo,
        status: a.status,
        startAt: a.startAt,
        endAt: a.endAt ?? undefined,
        location: a.location ?? undefined,
        outcome: a.outcome ?? undefined,
      })
    );
  }

  // Merge and sort all events
  const allEvents = [...activities, ...communications, ...appointments].sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()
  );

  // Paginate
  const events = allEvents.slice(0, limit);
  const hasMore = allEvents.length > limit;
  const nextCursor = hasMore ? events[events.length - 1].occurredAt.toISOString() : null;

  return {
    events,
    nextCursor,
    hasMore,
  };
}

/**
 * Gets timeline statistics for a customer
 */
export async function getTimelineStats(customerId: string) {
  const tenantId = requireTenantId();

  const [activityCount, communicationCount, appointmentCount, lastActivity, lastCommunication] =
    await Promise.all([
      prisma.activity.count({
        where: { tenantId, customerId },
      }),
      prisma.communication.count({
        where: { tenantId, customerId },
      }),
      prisma.appointment.count({
        where: { tenantId, customerId },
      }),
      prisma.activity.findFirst({
        where: { tenantId, customerId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.communication.findFirst({
        where: { tenantId, customerId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

  const lastInteraction =
    lastActivity && lastCommunication
      ? lastActivity.createdAt > lastCommunication.createdAt
        ? lastActivity.createdAt
        : lastCommunication.createdAt
      : lastActivity?.createdAt ?? lastCommunication?.createdAt ?? null;

  return {
    totalEvents: activityCount + communicationCount + appointmentCount,
    activityCount,
    communicationCount,
    appointmentCount,
    lastInteraction,
  };
}

# Unified Customer Timeline - Architecture Design

**Date**: 2025-11-01
**Status**: Design Phase
**Priority**: High (Foundation for Revolutionary CRM)

---

## 1. Executive Summary

The **Unified Customer Timeline** consolidates all customer touchpoints (activities, communications, appointments, deals, service orders) into a **single chronological view**. This provides a 360° customer history and serves as the foundation for AI-driven insights.

### Current State
- ✅ Activities tracked in separate `Activity` table
- ✅ Communications in `Communication` table
- ✅ Appointments in `Appointment` table
- ✅ Deal events in `DealEvent` table
- ❌ No unified view
- ❌ Frontend shows separate tabs/sections

### Target State
- ✅ Single timeline query aggregating all events
- ✅ Real-time updates via WebSocket
- ✅ Infinite scroll UI component
- ✅ Rich event context (who, what, when, where, why)
- ✅ Filtering by type, date range, user
- ✅ Search across all event types

---

## 2. Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Timeline View                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │  │
│  │  ┃ 🔵 Call completed • 2 min ago                   ┃  │  │
│  │  ┃ Sarah called customer • Duration: 5:23          ┃  │  │
│  │  ┃ Sentiment: Positive • Next: Schedule test drive┃  │  │
│  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ 📧 Email sent • 1 hour ago                      │  │  │
│  │  │ "2024 Camry pricing and availability"           │  │  │
│  │  │ Opened: Yes • Clicked: Yes                      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ 📅 Appointment scheduled • Yesterday            │  │  │
│  │  │ Test Drive - Saturday 2pm with Mike             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ 🚗 Deal created • 2 days ago                    │  │  │
│  │  │ 2024 Toyota Camry SE • $28,500                  │  │  │
│  │  │ Status: Pending Finance                         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                    WebSocket updates
                           │
┌─────────────────────────────────────────────────────────────┐
│            Backend Timeline Service (Node.js)                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  buildCustomerTimeline(customerId, options)         │   │
│  │    → Aggregates: Activity + Communication           │   │
│  │                  + Appointment + DealEvent           │   │
│  │    → Sorts chronologically                           │   │
│  │    → Enriches with user/lead context                 │   │
│  │    → Paginated (cursor-based)                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │
                     Prisma queries
                           │
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  activities  │  │  communications  │  │ appointments │  │
│  │  ────────────│  │  ────────────────│  │ ──────────── │  │
│  │  id          │  │  id              │  │ id           │  │
│  │  customerId  │  │  customerId      │  │ customerId   │  │
│  │  type        │  │  type            │  │ type         │  │
│  │  createdAt   │  │  createdAt       │  │ startAt      │  │
│  └──────────────┘  └──────────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────────┐                    │
│  │ deal_events  │  │ service_orders   │                    │
│  │ ────────────│  │  ────────────────│                     │
│  │  id          │  │  id              │                     │
│  │  customerId  │  │  customerId      │                     │
│  │  event       │  │  status          │                     │
│  │  createdAt   │  │  createdAt       │                     │
│  └──────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model Design

### Option A: Materialized View (Recommended)

**Approach**: Create a database view that unions all event sources.

**Pros**:
- ✅ No schema changes required
- ✅ Leverages existing models
- ✅ Simple to implement
- ✅ Fast queries with proper indexes

**Cons**:
- ⚠️ Slightly slower than denormalized table
- ⚠️ Need to refresh for real-time (use WebSocket)

**Implementation**:

```sql
-- PostgreSQL View
CREATE OR REPLACE VIEW customer_timeline_events AS
SELECT
  id,
  tenant_id,
  customer_id,
  lead_id,
  'ACTIVITY' AS event_category,
  type AS event_type,
  subject AS title,
  description AS body,
  user_id AS actor_id,
  metadata,
  created_at AS occurred_at,
  created_at
FROM activities
WHERE customer_id IS NOT NULL OR lead_id IN (SELECT id FROM leads WHERE customer_id IS NOT NULL)

UNION ALL

SELECT
  id,
  tenant_id,
  customer_id,
  lead_id,
  'COMMUNICATION' AS event_category,
  type AS event_type,
  subject AS title,
  body,
  user_id AS actor_id,
  metadata,
  created_at AS occurred_at,
  created_at
FROM communications
WHERE customer_id IS NOT NULL OR lead_id IN (SELECT id FROM leads WHERE customer_id IS NOT NULL)

UNION ALL

SELECT
  id,
  tenant_id,
  customer_id,
  lead_id,
  'APPOINTMENT' AS event_category,
  type AS event_type,
  title,
  notes AS body,
  assigned_to_id AS actor_id,
  NULL AS metadata,
  start_at AS occurred_at,
  created_at
FROM appointments
WHERE customer_id IS NOT NULL OR lead_id IN (SELECT id FROM leads WHERE customer_id IS NOT NULL)

UNION ALL

SELECT
  id,
  tenant_id,
  customer_id,
  lead_id,
  'DEAL_EVENT' AS event_category,
  event AS event_type,
  description AS title,
  NULL AS body,
  user_id AS actor_id,
  metadata,
  created_at AS occurred_at,
  created_at
FROM deal_events
WHERE customer_id IS NOT NULL

ORDER BY occurred_at DESC;
```

**Indexes**:
```sql
-- Existing indexes already cover this
CREATE INDEX IF NOT EXISTS idx_activities_customer_created ON activities(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_customer_created ON communications(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_start ON appointments(customer_id, start_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_events_customer_created ON deal_events(customer_id, created_at DESC);
```

---

### Option B: Denormalized Timeline Table (Future Optimization)

**Approach**: Create a dedicated `timeline_events` table populated via triggers.

**Pros**:
- ✅ Fastest query performance
- ✅ Can add timeline-specific fields (e.g., `is_pinned`, `importance`)
- ✅ Easy to add custom event types

**Cons**:
- ❌ Schema changes required
- ❌ Data duplication
- ❌ Triggers add write overhead
- ❌ More complex to maintain

**Schema** (for future):
```prisma
model TimelineEvent {
  id             String   @id @default(cuid())
  tenantId       String   @map("tenant_id")
  customerId     String?  @map("customer_id")
  leadId         String?  @map("lead_id")

  // Event classification
  category       TimelineEventCategory  // ACTIVITY, COMMUNICATION, APPOINTMENT, DEAL, SERVICE
  type           String                 // EMAIL, CALL, MEETING, etc.

  // Event content
  title          String?
  body           String?
  metadata       Json?

  // Context
  actorId        String?  @map("actor_id")  // User who performed action
  sourceId       String   @map("source_id")  // Original record ID
  sourceTable    String   @map("source_table")

  // Timestamps
  occurredAt     DateTime @map("occurred_at") @db.Timestamptz(6)
  createdAt      DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  // Relations
  tenant         Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer       Customer? @relation(fields: [customerId], references: [id])
  lead           Lead?    @relation(fields: [leadId], references: [id])
  actor          User?    @relation(fields: [actorId], references: [id])

  @@index([tenantId, customerId, occurredAt(sort: Desc)])
  @@index([tenantId, leadId, occurredAt(sort: Desc)])
  @@map("timeline_events")
}

enum TimelineEventCategory {
  ACTIVITY
  COMMUNICATION
  APPOINTMENT
  DEAL
  SERVICE
  SYSTEM
}
```

**Decision**: Start with **Option A (View)**, migrate to **Option B** if performance requires.

---

## 4. Backend Service Implementation

### Timeline Service

**File**: `apps/backend/src/services/timeline.service.ts`

```typescript
import { Prisma } from '@prisma/client';
import { prisma, getTenantId } from '../lib/prisma.js';

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
  cursor?: string;  // ISO timestamp
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

export async function buildCustomerTimeline(
  query: TimelineQuery
): Promise<TimelineResponse> {
  const tenantId = requireTenantId();
  const limit = query.limit ?? 50;
  const cursor = query.cursor ? new Date(query.cursor) : null;

  // Build where clauses for each source
  const baseWhere: Prisma.ActivityWhereInput = {
    tenantId,
    OR: [
      query.customerId ? { customerId: query.customerId } : {},
      query.leadId ? { leadId: query.leadId } : {},
    ].filter((w) => Object.keys(w).length > 0),
  };

  if (cursor) {
    baseWhere.createdAt = { lt: cursor };
  }

  if (query.fromDate || query.toDate) {
    baseWhere.createdAt = {
      ...(baseWhere.createdAt as object),
      ...(query.fromDate ? { gte: query.fromDate } : {}),
      ...(query.toDate ? { lte: query.toDate } : {}),
    };
  }

  if (query.actorId) {
    baseWhere.userId = query.actorId;
  }

  // Fetch activities
  let activities: TimelineEvent[] = [];
  if (!query.categories || query.categories.includes('ACTIVITY')) {
    const activityRecords = await prisma.activity.findMany({
      where: {
        ...baseWhere,
        ...(query.types ? { type: { in: query.types as any } } : {}),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    activities = activityRecords.map((a): ActivityTimelineEvent => ({
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
    }));
  }

  // Fetch communications
  let communications: TimelineEvent[] = [];
  if (!query.categories || query.categories.includes('COMMUNICATION')) {
    const commRecords = await prisma.communication.findMany({
      where: {
        tenantId,
        ...(query.customerId ? { customerId: query.customerId } : {}),
        ...(query.leadId ? { leadId: query.leadId } : {}),
        ...(cursor ? { createdAt: { lt: cursor } } : {}),
        ...(query.fromDate || query.toDate
          ? {
              createdAt: {
                ...(query.fromDate ? { gte: query.fromDate } : {}),
                ...(query.toDate ? { lte: query.toDate } : {}),
              },
            }
          : {}),
        ...(query.types ? { type: { in: query.types as any } } : {}),
        ...(query.actorId ? { userId: query.actorId } : {}),
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    communications = commRecords.map((c): CommunicationTimelineEvent => ({
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
    }));
  }

  // Fetch appointments
  let appointments: TimelineEvent[] = [];
  if (!query.categories || query.categories.includes('APPOINTMENT')) {
    const apptRecords = await prisma.appointment.findMany({
      where: {
        tenantId,
        ...(query.customerId ? { customerId: query.customerId } : {}),
        ...(query.leadId ? { leadId: query.leadId } : {}),
        ...(cursor ? { startAt: { lt: cursor } } : {}),
        ...(query.fromDate || query.toDate
          ? {
              startAt: {
                ...(query.fromDate ? { gte: query.fromDate } : {}),
                ...(query.toDate ? { lte: query.toDate } : {}),
              },
            }
          : {}),
        ...(query.types ? { type: { in: query.types as any } } : {}),
        ...(query.actorId ? { assignedToId: query.actorId } : {}),
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { startAt: 'desc' },
      take: limit,
    });

    appointments = apptRecords.map((a): AppointmentTimelineEvent => ({
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
    }));
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

export async function getTimelineStats(customerId: string) {
  const tenantId = requireTenantId();

  const [
    activityCount,
    communicationCount,
    appointmentCount,
    lastActivity,
    lastCommunication,
  ] = await Promise.all([
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
```

---

## 5. API Endpoints

### REST API

**File**: `apps/backend/src/routes/timeline.routes.ts`

```typescript
import { Router } from 'express';
import { z } from 'zod';
import { buildCustomerTimeline, getTimelineStats } from '../services/timeline.service.js';

const router = Router();

const timelineQuerySchema = z.object({
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  categories: z.array(z.enum(['ACTIVITY', 'COMMUNICATION', 'APPOINTMENT', 'DEAL', 'SERVICE'])).optional(),
  types: z.array(z.string()).optional(),
  actorId: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

// GET /api/timeline?customerId=xxx&limit=50&cursor=2025-10-31T...
router.get('/', async (req, res, next) => {
  try {
    const query = timelineQuerySchema.parse(req.query);

    if (!query.customerId && !query.leadId) {
      return res.status(400).json({
        error: { code: 'INVALID_QUERY', message: 'Either customerId or leadId is required' },
      });
    }

    const timeline = await buildCustomerTimeline(query);
    res.json(timeline);
  } catch (error) {
    next(error);
  }
});

// GET /api/timeline/stats/:customerId
router.get('/stats/:customerId', async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const stats = await getTimelineStats(customerId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
```

**Add to main app**:
```typescript
// apps/backend/src/index.ts
import timelineRoutes from './routes/timeline.routes.js';
app.use('/api/timeline', authenticate, timelineRoutes);
```

---

## 6. Real-Time Updates

### WebSocket Integration

**Existing Infrastructure** (from analysis):
- ✅ `emitTenantEvent(tenantId, eventName, payload)` in `lib/socket.js`
- ✅ Used in lead-score.service.ts line 58

**Enhancement**:

```typescript
// In activity.service.ts (after creating activity)
import { emitTenantEvent } from '../lib/socket.js';

export async function createActivity(input: ActivityCreateInput) {
  const activity = await prisma.activity.create({ /* ... */ });

  // Emit real-time timeline event
  const customerId = activity.customerId;
  if (customerId) {
    emitTenantEvent(activity.tenantId, 'timeline:event', {
      customerId,
      event: {
        id: activity.id,
        category: 'ACTIVITY',
        type: activity.type,
        title: activity.subject,
        occurredAt: activity.createdAt,
      },
    });
  }

  return activity;
}

// Similarly in communication.service.ts, appointment.service.ts, etc.
```

**Frontend Socket Listener**:
```typescript
// apps/frontend/src/hooks/useTimeline.ts
import { useEffect } from 'react';
import { socket } from '../lib/socket';

export function useTimelineSubscription(customerId: string, onEvent: (event) => void) {
  useEffect(() => {
    const handler = (payload) => {
      if (payload.customerId === customerId) {
        onEvent(payload.event);
      }
    };

    socket.on('timeline:event', handler);
    return () => socket.off('timeline:event', handler);
  }, [customerId, onEvent]);
}
```

---

## 7. Frontend Implementation

### React Component

**File**: `apps/frontend/src/features/crm/components/CustomerTimeline.tsx`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { format, formatDistance } from 'date-fns';
import { useTimelineSubscription } from '../../../hooks/useTimeline';

interface TimelineEvent {
  id: string;
  category: 'ACTIVITY' | 'COMMUNICATION' | 'APPOINTMENT' | 'DEAL' | 'SERVICE';
  type: string;
  title: string | null;
  body: string | null;
  occurredAt: string;
  actor: { firstName: string; lastName: string } | null;
}

interface CustomerTimelineProps {
  customerId: string;
}

export function CustomerTimeline({ customerId }: CustomerTimelineProps) {
  const { ref: loadMoreRef, inView } = useInView();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['timeline', customerId],
    queryFn: async ({ pageParam = null }) => {
      const params = new URLSearchParams({
        customerId,
        limit: '50',
        ...(pageParam ? { cursor: pageParam } : {}),
      });
      const res = await fetch(`/api/timeline?${params}`);
      if (!res.ok) throw new Error('Failed to fetch timeline');
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Auto-load more when scrolling
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Real-time updates
  useTimelineSubscription(customerId, (event) => {
    // Prepend new event to the list
    queryClient.setQueryData(['timeline', customerId], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        pages: [
          {
            events: [event, ...old.pages[0].events],
            nextCursor: old.pages[0].nextCursor,
            hasMore: old.pages[0].hasMore,
          },
          ...old.pages.slice(1),
        ],
      };
    });
  });

  const events = data?.pages.flatMap((page) => page.events) ?? [];

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>Customer Timeline</h2>
        <TimelineFilters />
      </div>

      <div className="timeline-list">
        {events.map((event) => (
          <TimelineEventCard key={event.id} event={event} />
        ))}

        {hasNextPage && (
          <div ref={loadMoreRef} className="timeline-loader">
            {isFetchingNextPage ? 'Loading more...' : 'Scroll for more'}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineEventCard({ event }: { event: TimelineEvent }) {
  const icon = getEventIcon(event.category, event.type);
  const color = getEventColor(event.category);

  return (
    <div className={`timeline-event timeline-event--${color}`}>
      <div className="timeline-event__icon">{icon}</div>
      <div className="timeline-event__content">
        <div className="timeline-event__header">
          <span className="timeline-event__type">{event.type}</span>
          <span className="timeline-event__time">
            {formatDistance(new Date(event.occurredAt), new Date(), { addSuffix: true })}
          </span>
        </div>
        <div className="timeline-event__title">{event.title}</div>
        {event.body && (
          <div className="timeline-event__body">{event.body}</div>
        )}
        {event.actor && (
          <div className="timeline-event__actor">
            by {event.actor.firstName} {event.actor.lastName}
          </div>
        )}
      </div>
    </div>
  );
}

function getEventIcon(category: string, type: string) {
  switch (category) {
    case 'ACTIVITY':
      return type === 'EMAIL' ? '📧' : type === 'CALL' ? '📞' : type === 'SMS' ? '💬' : '📝';
    case 'COMMUNICATION':
      return type === 'EMAIL' ? '📧' : type === 'CALL' ? '📞' : '💬';
    case 'APPOINTMENT':
      return '📅';
    case 'DEAL':
      return '🚗';
    case 'SERVICE':
      return '🔧';
    default:
      return '•';
  }
}

function getEventColor(category: string) {
  switch (category) {
    case 'ACTIVITY': return 'blue';
    case 'COMMUNICATION': return 'green';
    case 'APPOINTMENT': return 'purple';
    case 'DEAL': return 'orange';
    case 'SERVICE': return 'teal';
    default: return 'gray';
  }
}
```

---

## 8. Performance Optimization

### Indexes (Already Exist)
✅ From CRM analysis, these indexes are already in place:
```sql
CREATE INDEX idx_activities_customer_created ON activities(customer_id, created_at DESC);
CREATE INDEX idx_communications_customer_created ON communications(customer_id, created_at DESC);
CREATE INDEX idx_appointments_customer_start ON appointments(customer_id, start_at DESC);
```

### Query Optimization
- **Cursor-based pagination**: Uses timestamps for efficient pagination
- **Limit per source**: Fetch 50 records from each source, merge, then slice
- **Parallel queries**: Use `Promise.all()` to fetch all sources simultaneously

### Caching Strategy
```typescript
// Redis caching for timeline stats
export async function getTimelineStats(customerId: string) {
  const cacheKey = `timeline:stats:${customerId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const stats = await computeTimelineStats(customerId);
  await redis.setex(cacheKey, 300, JSON.stringify(stats)); // 5 min TTL

  return stats;
}
```

---

## 9. Implementation Roadmap

### Phase 1: Core Timeline (Week 1) ✅
**Effort**: 20 hours

- [x] Create timeline.service.ts
- [x] Implement buildCustomerTimeline() with Activity + Communication + Appointment
- [ ] Add timeline.routes.ts
- [ ] Add unit tests
- [ ] API documentation

**Deliverable**: Backend API returning merged timeline

---

### Phase 2: Frontend Component (Week 1) ✅
**Effort**: 16 hours

- [ ] Create CustomerTimeline.tsx
- [ ] Implement infinite scroll with react-query
- [ ] Add TimelineEventCard components
- [ ] Styling with design system tokens
- [ ] Mobile responsive layout

**Deliverable**: Working timeline UI in customer detail page

---

### Phase 3: Real-Time Updates (Week 2) ✅
**Effort**: 12 hours

- [ ] Add WebSocket emissions in all services (activity, communication, appointment)
- [ ] Frontend useTimelineSubscription hook
- [ ] Test real-time event prepending
- [ ] Handle edge cases (reconnection, missed events)

**Deliverable**: Live-updating timeline

---

### Phase 4: Advanced Features (Week 2-3) ⏳
**Effort**: 16 hours

- [ ] Timeline filtering UI (category, type, date range, actor)
- [ ] Search across timeline events
- [ ] Export timeline to PDF
- [ ] Timeline stats dashboard
- [ ] Add Deal and Service events
- [ ] Event pinning/highlighting

**Deliverable**: Full-featured timeline

---

### Phase 5: AI Enhancements (Week 3-4) 🔮
**Effort**: 24 hours

- [ ] Sentiment analysis on communications
- [ ] Auto-generated timeline summaries
- [ ] Anomaly detection (unusual gaps)
- [ ] Next-best-action recommendations
- [ ] Predictive timeline (upcoming events)

**Deliverable**: AI-powered timeline insights

---

## 10. Testing Strategy

### Unit Tests
```typescript
// timeline.service.test.ts
describe('buildCustomerTimeline', () => {
  it('should merge activities and communications chronologically', async () => {
    const result = await buildCustomerTimeline({ customerId: 'test-123' });
    expect(result.events).toHaveLength(50);
    expect(result.events[0].occurredAt).toBeGreaterThanOrEqual(result.events[1].occurredAt);
  });

  it('should filter by category', async () => {
    const result = await buildCustomerTimeline({
      customerId: 'test-123',
      categories: ['ACTIVITY'],
    });
    expect(result.events.every((e) => e.category === 'ACTIVITY')).toBe(true);
  });

  it('should paginate with cursor', async () => {
    const page1 = await buildCustomerTimeline({ customerId: 'test-123', limit: 10 });
    const page2 = await buildCustomerTimeline({
      customerId: 'test-123',
      limit: 10,
      cursor: page1.nextCursor!,
    });
    expect(page2.events[0].id).not.toBe(page1.events[0].id);
  });
});
```

### Integration Tests
```typescript
describe('Timeline API', () => {
  it('GET /api/timeline returns customer timeline', async () => {
    const res = await request(app)
      .get('/api/timeline')
      .query({ customerId: 'cust-123' })
      .set('Authorization', `Bearer ${token}`)
      .set('X-Tenant', tenantId);

    expect(res.status).toBe(200);
    expect(res.body.events).toBeInstanceOf(Array);
    expect(res.body.hasMore).toBeDefined();
  });
});
```

### E2E Tests (Playwright)
```typescript
test('Timeline loads and updates in real-time', async ({ page }) => {
  await page.goto('/customers/cust-123');

  // Wait for timeline to load
  await page.waitForSelector('.timeline-event');

  // Verify initial events
  const events = await page.locator('.timeline-event').count();
  expect(events).toBeGreaterThan(0);

  // Simulate new activity via API
  await createActivity({ customerId: 'cust-123', type: 'NOTE', subject: 'Test' });

  // Verify real-time update (should prepend)
  await page.waitForSelector('.timeline-event:has-text("Test")');
  const updatedEvents = await page.locator('.timeline-event').count();
  expect(updatedEvents).toBe(events + 1);
});
```

---

## 11. Success Metrics

### Performance Targets
- ✅ Timeline load time: < 500ms (p95)
- ✅ Scroll smoothness: 60 FPS
- ✅ Real-time update latency: < 200ms
- ✅ Memory usage: < 50MB for 1000 events

### Business Metrics
- 📊 Timeline adoption: 80% of customer detail page views
- 📊 Average session time: +30% (more context = longer engagement)
- 📊 Support ticket resolution: -15% (complete history)
- 📊 Sales cycle time: -10% (faster context gathering)

---

## 12. Security & Privacy

### Data Access Control
- ✅ Tenant isolation enforced at query level
- ✅ User permissions checked via middleware
- ✅ Sensitive data (SSN, credit scores) redacted in timeline
- ✅ Audit log for timeline access

### GDPR Compliance
- ✅ Right to erasure: Soft delete cascades to timeline
- ✅ Data portability: Export timeline to JSON
- ✅ Access logging: Audit trail for timeline views

---

## 13. Future Enhancements

### Advanced Features (Post-MVP)
1. **Timeline Collaboration**
   - Add comments on timeline events
   - @mention team members
   - Event reactions (important, follow-up, etc.)

2. **Timeline Templates**
   - Predefined views (Last 30 days, This month's calls, etc.)
   - Saved filters
   - Shareable timeline links

3. **Timeline Analytics**
   - Engagement heatmap
   - Response time analysis
   - Communication frequency trends

4. **External Integrations**
   - Import events from external CRMs
   - Sync with Google Calendar
   - Webhook exports to third parties

---

## 14. Conclusion

The Unified Customer Timeline is the **foundation for all revolutionary CRM features**:

- ✅ **Conversational Intelligence** needs timeline to display transcripts
- ✅ **Auto-Personalized Messaging** needs timeline for context
- ✅ **Deal Coaching** needs timeline to understand customer journey
- ✅ **Digital Twin** needs timeline as historical data source

**Status**: Ready for implementation
**Estimated Effort**: 3-4 weeks (88 hours)
**Priority**: Critical path for revolutionary CRM

---

**Next Document**: `CRM-ADAPTIVE-LEAD-SCORING.md`
**Related Documents**:
- `CRM-CAPABILITIES-ANALYSIS.md`
- `REVOLUTIONARY-CRM-IMPLEMENTATION-PLAN.md`

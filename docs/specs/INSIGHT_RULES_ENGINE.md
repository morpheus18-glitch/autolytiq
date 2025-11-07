# Insight Rules Engine

## Overview

The **Insight Rules Engine** is a proactive intelligence system that delivers actionable signals to dealership users based on real-time business conditions. Instead of forcing users to hunt for critical information, the engine evaluates business rules continuously and surfaces insights in a prioritized queue.

### Key Features

- **Role-Based Targeting**: Insights delivered only to relevant roles (sales, F&I, service, inventory, etc.)
- **User-Specific Insights**: Rules can target specific users or entire roles
- **Priority Scoring**: Automatic scoring based on severity, recency, and role relevance
- **Smart Cooldown**: Prevents insight fatigue by respecting cooldown windows
- **Time-To-Live (TTL)**: Insights auto-expire when no longer relevant
- **User Control**: Users can snooze or permanently mute specific insight types
- **Composable DSL**: Expressive Domain-Specific Language for rule authoring
- **RBAC Integration**: Insights respect existing permission boundaries

### Why This Matters

Traditional CRM/DMS systems are reactive—users must remember to check dashboards, run reports, and hunt for problems. The Insight Rules Engine inverts this model: **the system proactively tells you what needs attention**.

**Example**: A hot lead comes in at 2:00 PM. By 4:00 PM, if no one has contacted them, the system fires an `urgent` insight to the sales team. The lead doesn't slip through the cracks.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Insight Rules Engine                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Rule        │───▶│  Evaluator   │───▶│  Queue       │  │
│  │  Registry    │    │  Engine      │    │  Manager     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         │                    │                    │          │
│  ┌──────▼──────┐    ┌────────▼───────┐    ┌──────▼──────┐  │
│  │ Predicates  │    │  Fetchers      │    │  Database   │  │
│  │ (DSL)       │    │  (Data Access) │    │  (Prisma)   │  │
│  └─────────────┘    └────────────────┘    └─────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌────────────────────┐
              │  REST API Endpoints │
              │  /api/insights/*    │
              └────────────────────┘
                          │
                          ▼
              ┌────────────────────┐
              │  Frontend Hooks    │
              │  useInsightsQueue  │
              └────────────────────┘
```

**Data Flow**:
1. **Rule Registration**: Rules defined using DSL, registered at startup
2. **Evaluation Trigger**: Cron job or event listener triggers evaluation
3. **Predicate Execution**: Each rule's `when` predicate queries database
4. **Scoring**: Matched rules scored based on severity, recency, role
5. **Queue Insertion**: High-priority insights written to `InsightQueue` table
6. **Frontend Polling**: React hooks fetch queue via REST API
7. **User Action**: User acknowledges, snoozes, or mutes insights

---

## Core Concepts

### Insight

An **Insight** is a single actionable signal delivered to a user. It contains:
- **Message**: Human-readable description (e.g., "Deal #abc123 has been pending F&I for over 45 minutes")
- **Severity**: `info`, `notice`, `warning`, `urgent`
- **Score**: Priority value (0.0 to 1.0) for sorting
- **Card**: Structured payload for UI rendering (action buttons, filters, etc.)
- **State**: Lifecycle stage (`new` → `seen` → `snoozed`/`done`)

### Rule

A **Rule** is a reusable definition that generates insights. It consists of:
- **Key**: Unique identifier (e.g., `deal.pendingFI.tooLong`)
- **Domain**: Functional area (`sales`, `fi`, `inventory`, `service`, etc.)
- **Audience**: Target roles (`['sales', 'fi']`) and/or specific user IDs
- **Predicate (`when`)**: Boolean condition that triggers the insight
- **Scorer (`score`)**: Function that calculates priority (optional, defaults to severity-based)
- **Message Generator**: Function that creates the insight message
- **Card**: UI payload with action metadata
- **TTL**: Time-to-live in minutes (auto-expire stale insights)
- **Cooldown**: Minimum minutes between repeat firings

### Predicate

A **Predicate** is a composable boolean function that evaluates business conditions. Predicates have access to:
- **Context**: `tenantId`, `userId`, `role`, `now` (current timestamp)
- **Fetch Function**: Generic query executor for database access
- **Helper Functions**: Time utilities (`olderThan`, `within`, `between`)

Predicates are pure functions: `(ctx: PredicateCtx) => Promise<boolean>`

### Scorer

A **Scorer** calculates the priority of an insight. The default scorer combines:
- **Severity Weight**: `urgent=1.0`, `warning=0.75`, `notice=0.5`, `info=0.2`
- **Recency Boost**: Newer events score higher (linear decay over 24 hours)
- **Role Weight**: More relevant roles get higher scores

Scorers are functions: `(ctx: PredicateCtx) => Promise<number>`

### Queue

The **Queue** is a prioritized inbox per role/user. Insights are:
- **Sorted by Score**: Highest-priority insights appear first
- **Filtered by State**: Only `new` and `seen` insights shown (not `done` or expired)
- **Filtered by Snooze**: Snoozed insights hidden until `snoozeUntil` passes
- **Filtered by TTL**: Expired insights automatically excluded

### State Machine

Insights transition through states:
1. **`new`**: Just created, unread
2. **`seen`**: User opened the insight (optional intermediate state)
3. **`snoozed`**: User snoozed for X minutes (still in queue, but hidden)
4. **`done`**: User acknowledged/completed the insight (removed from queue)
5. **`muted`**: Rule permanently muted by user (never fires again)

---

## DSL Guide

### Time Predicates

Check age or recency of dates:

```typescript
import { olderThan, within, between } from '@repo/shared/insights';

// Deal updated more than 48 hours ago
olderThan(2880, async (ctx) => {
  const deal = await ctx.fetch<{ updatedAt: Date }>('SELECT ...');
  return deal.updatedAt;
});

// Lead created within last 2 hours
within(120, async (ctx) => {
  const lead = await ctx.fetch<{ createdAt: Date }>('SELECT ...');
  return lead.createdAt;
});

// Business hours only (9 AM - 5 PM)
between(
  async (ctx) => new Date(ctx.now.setHours(9, 0, 0)),
  async (ctx) => new Date(ctx.now.setHours(17, 0, 0))
);
```

### Deal Predicates

Domain-specific helpers for deal workflows:

```typescript
import { pendingFIOver, stuckInStatus, noActivityFor, dealAtRisk } from '@repo/shared/insights';

// Any deal pending F&I > 45 minutes
pendingFIOver(45);

// Any deal stuck in 'pending_approval' > 24 hours
stuckInStatus('pending_approval', 1440);

// Active deals with no activity > 48 hours
noActivityFor(2880);

// Complex risk signals (rejected credit app + no follow-up)
dealAtRisk();
```

### Lead Predicates

Helpers for lead management:

```typescript
import { leadNoContact, hotLeadCooling, leadResponseOverdue } from '@repo/shared/insights';

// Hot leads (score >= 80) not contacted in 2 hours
leadNoContact(2, 80);

// Previously hot leads with no contact in 48 hours
hotLeadCooling(48);

// Lead inquiry not responded to in 4 hours
leadResponseOverdue(4);
```

### Inventory Predicates

Helpers for inventory management:

```typescript
import { agingOver, pricedBelowMarket, lowInventory } from '@repo/shared/insights';

// Vehicles in stock > 45 days
agingOver(45);

// Vehicles priced 10%+ below market value
pricedBelowMarket(10);

// Low inventory for a make (< 5 units)
lowInventory('Toyota', 5);
```

### Composing Conditions

Combine predicates with boolean logic:

```typescript
// AND: Both conditions must be true
when: async (ctx) => {
  const isOld = await olderThan(1440, ...)(ctx);
  const isStuck = await stuckInStatus('pending', 720)(ctx);
  return isOld && isStuck;
}

// OR: Either condition triggers
when: async (ctx) => {
  const isPendingFI = await pendingFIOver(45)(ctx);
  const isNoActivity = await noActivityFor(2880)(ctx);
  return isPendingFI || isNoActivity;
}
```

---

## Scoring Algorithm

### Base Severity Weights

```typescript
const baseSeverityWeights = {
  info: 0.2,      // Informational, low priority
  notice: 0.5,    // Needs attention eventually
  warning: 0.75,  // Action needed soon
  urgent: 1.0,    // Immediate action required
};
```

### Recency Boost

Newer events score higher. Formula:

```typescript
recencyBoost(minutes) = max(0.5, 1 - (minutes / 1440) * 0.5)
```

- Events < 1 minute old: **1.0 boost**
- Events 24 hours old: **0.5 boost** (minimum floor)
- Linear decay between

**Example**:
- Fresh event (5 min): `1 - (5/1440)*0.5 ≈ 0.998`
- 12-hour-old event: `1 - (720/1440)*0.5 = 0.75`
- 24-hour-old event: `1 - (1440/1440)*0.5 = 0.5`

### Role Weights

```typescript
const roleWeights = {
  sales: 1.0,      // Core revenue role
  fi: 1.0,         // Core revenue role
  service: 0.9,    // High importance
  inventory: 0.9,  // High importance
  accounting: 0.8, // Support role
  admin: 0.8,      // Support role
  dev: 0.6,        // Technical role
};
```

### Combined Score Calculation

```typescript
function combine(severityWeight, recency, custom = 0.5, roleW = 1.0): number {
  // Weighted average: 60% severity, 20% recency, 20% custom
  const baseScore = severityWeight * 0.6 + recency * 0.2 + custom * 0.2;

  // Scale by role relevance
  return min(1, baseScore * roleW);
}
```

### Example Calculation

**Scenario**: Urgent insight for sales role, event 30 minutes old

```typescript
severity = 'urgent' → severityWeight = 1.0
recency = 30 minutes → recencyBoost = 1 - (30/1440)*0.5 ≈ 0.990
roleWeight = 'sales' → roleW = 1.0
custom = 0.5 (default)

baseScore = 1.0 * 0.6 + 0.990 * 0.2 + 0.5 * 0.2
          = 0.6 + 0.198 + 0.1
          = 0.898

finalScore = 0.898 * 1.0 = 0.898
```

This insight would rank near the top of the queue.

---

## Adding a New Rule (5-Minute Guide)

### Step-by-Step Template

**1. Choose a Domain and Key**

```typescript
domain: 'service'
key: 'service.ro.awaitingApproval'
```

**2. Define Audience**

```typescript
audience: {
  roles: ['service', 'admin']
  // OR userIds: ['user123', 'user456']
}
```

**3. Write the Predicate**

Use DSL helpers or raw queries:

```typescript
when: async (ctx: PredicateCtx): Promise<boolean> => {
  // Option A: Use DSL helper
  return await roAwaitingCustomerApproval(120)(ctx);

  // Option B: Raw query
  const ros = await ctx.fetch<any[]>(
    `SELECT id FROM "ServiceOrder"
     WHERE "tenantId" = $1
       AND status = 'awaiting_approval'
       AND "createdAt" < NOW() - INTERVAL '2 hours'`,
    [ctx.tenantId]
  );
  return ros.length > 0;
}
```

**4. Write the Message Generator**

```typescript
message: async (ctx: PredicateCtx): Promise<string> => {
  const ros = await ctx.fetch<any[]>('SELECT ...');
  const count = ros.length;

  if (count === 1) {
    return `Service RO #${ros[0].id.slice(0, 8)} is awaiting customer approval`;
  }
  return `${count} service ROs are awaiting customer approval`;
}
```

**5. Define Card Payload**

```typescript
card: {
  type: 'action',  // or 'alert', 'summary'
  payload: {
    action: 'open',
    target: 'service',
    filter: { status: 'awaiting_approval' },
  },
}
```

**6. Set TTL and Cooldown**

```typescript
ttlMinutes: 240,      // Expire after 4 hours
cooldownMinutes: 60,  // Don't re-fire for 1 hour
```

**7. Register the Rule**

```typescript
import { registerRule } from '@repo/shared/insights';
import { cuid } from '@paralleldrive/cuid2';
import { defaultScore } from '@repo/shared/insights';

registerRule({
  id: cuid(),
  key: 'service.ro.awaitingApproval',
  domain: 'service',
  audience: { roles: ['service', 'admin'] },
  severity: 'notice',
  when: async (ctx) => {
    // ... predicate logic
  },
  score: async (ctx) => defaultScore('notice', 120, ctx.role),
  message: async (ctx) => {
    // ... message logic
  },
  card: {
    type: 'action',
    payload: { action: 'open', target: 'service' },
  },
  ttlMinutes: 240,
  cooldownMinutes: 60,
  tags: ['service', 'approval', 'sla'],
});
```

**8. Add to `rules.builtin.ts`**

Place your rule in `/root/autolytiq/apps/backend/src/services/insights/rules.builtin.ts`

---

## Complete Example: New Rule

**Scenario**: Alert inventory managers when a vehicle needs reconditioning and has been sitting for 7+ days.

```typescript
import { registerRule } from '@repo/shared/insights';
import { cuid } from '@paralleldrive/cuid2';
import { defaultScore, olderThan } from '@repo/shared/insights';

registerRule({
  id: cuid(),
  key: 'inventory.recon.overdue',
  domain: 'inventory',
  audience: { roles: ['inventory', 'service'] },
  severity: 'warning',

  when: async (ctx) => {
    const vehicles = await ctx.fetch<any[]>(
      `SELECT v.id, v.vin, v.year, v.make, v.model, v."acquiredAt"
       FROM "Vehicle" v
       LEFT JOIN "ReconItem" ri ON ri."vehicleId" = v.id
       WHERE v."tenantId" = $1
         AND v.status = 'recon'
         AND v."acquiredAt" < NOW() - INTERVAL '7 days'
         AND (ri.status IS NULL OR ri.status != 'completed')
       LIMIT 1`,
      [ctx.tenantId]
    );

    return vehicles.length > 0;
  },

  score: async (ctx) => {
    // 7 days = 10,080 minutes
    return defaultScore('warning', 10080, ctx.role);
  },

  message: async (ctx) => {
    const vehicles = await ctx.fetch<any[]>(
      `SELECT v.id, v.vin, v.year, v.make, v.model
       FROM "Vehicle" v
       WHERE v."tenantId" = $1
         AND v.status = 'recon'
         AND v."acquiredAt" < NOW() - INTERVAL '7 days'`,
      [ctx.tenantId]
    );

    const count = vehicles.length;
    if (count === 1) {
      const v = vehicles[0];
      return `${v.year} ${v.make} ${v.model} (${v.vin}) needs reconditioning (7+ days old)`;
    }
    return `${count} vehicles need reconditioning (7+ days old)`;
  },

  card: {
    type: 'action',
    payload: {
      action: 'open',
      target: 'inventory',
      filter: { status: 'recon', minDaysInStock: 7 },
    },
  },

  ttlMinutes: 720,    // 12 hours
  cooldownMinutes: 180, // 3 hours
  tags: ['inventory', 'recon', 'aging'],
});
```

**Result**: Inventory managers will see this insight in their queue, sorted by priority. Clicking it opens the inventory page filtered to overdue recon vehicles.

---

## API Reference

### 1. List All Rules

**Endpoint**: `GET /api/insights/rules`

**Description**: Returns metadata for all registered insight rules.

**Request**: None

**Response**:
```json
[
  {
    "key": "deal.pendingFI.tooLong",
    "domain": "fi",
    "severity": "warning",
    "audience": { "roles": ["fi", "sales"] },
    "tags": ["time", "sla", "fi"]
  },
  {
    "key": "lead.noContact.hot",
    "domain": "sales",
    "severity": "urgent",
    "audience": { "roles": ["sales"] },
    "tags": ["time", "sla", "leads"]
  }
]
```

**Example**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://app.autolytiq.com/api/insights/rules
```

---

### 2. Dry-Run Evaluation

**Endpoint**: `POST /api/insights/evaluate/dry-run`

**Description**: Evaluates all rules for a user/role without writing to the database. Useful for debugging.

**Request**:
```json
{
  "tenantId": "tenant_abc123",
  "userId": "user_xyz789",
  "role": "sales"
}
```

**Response**:
```json
[
  {
    "ruleKey": "deal.pendingFI.tooLong",
    "domain": "fi",
    "severity": "warning",
    "matched": true,
    "score": 0.85,
    "message": "2 deals have been pending F&I for over 45 minutes",
    "executionTimeMs": 34
  },
  {
    "ruleKey": "lead.noContact.hot",
    "domain": "sales",
    "severity": "urgent",
    "matched": false,
    "executionTimeMs": 12
  }
]
```

**Example**:
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"tenant_abc","userId":"user_xyz","role":"sales"}' \
  https://app.autolytiq.com/api/insights/evaluate/dry-run
```

---

### 3. Get User Queue

**Endpoint**: `GET /api/insights/queue`

**Description**: Returns prioritized insights for the authenticated user. Automatically filters by:
- User's role and tenant
- State (`new`, `seen` only)
- TTL (excludes expired insights)
- Snooze (excludes snoozed insights)

**Query Parameters**:
- `role` (optional): Override role filter
- `userId` (optional): Filter to specific user

**Request**: None (uses JWT auth context)

**Response**:
```json
{
  "insights": [
    {
      "id": "ins_abc123",
      "ruleKey": "lead.noContact.hot",
      "severity": "urgent",
      "score": 0.95,
      "message": "Hot lead John Doe (score: 85) has not been contacted",
      "card": {
        "type": "action",
        "payload": {
          "action": "open",
          "target": "leads",
          "filter": { "status": "new", "minScore": 80 }
        }
      },
      "state": "new",
      "createdAt": "2025-11-07T14:30:00Z",
      "expiresAt": "2025-11-07T17:30:00Z"
    }
  ],
  "total": 1
}
```

**Example**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://app.autolytiq.com/api/insights/queue
```

---

### 4. Acknowledge Insight

**Endpoint**: `POST /api/insights/queue/ack`

**Description**: Mark an insight as `done`, removing it from the queue.

**Request**:
```json
{
  "id": "ins_abc123"
}
```

**Response**:
```json
{
  "success": true,
  "id": "ins_abc123",
  "state": "done"
}
```

**Example**:
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"ins_abc123"}' \
  https://app.autolytiq.com/api/insights/queue/ack
```

---

### 5. Snooze Insight

**Endpoint**: `POST /api/insights/queue/snooze`

**Description**: Hide an insight for a specified duration. It will reappear after the snooze period.

**Request**:
```json
{
  "id": "ins_abc123",
  "minutes": 60
}
```

**Response**:
```json
{
  "success": true,
  "id": "ins_abc123",
  "state": "snoozed",
  "snoozeUntil": "2025-11-07T15:30:00Z"
}
```

**Example**:
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"ins_abc123","minutes":60}' \
  https://app.autolytiq.com/api/insights/queue/snooze
```

---

### 6. Mute Rule

**Endpoint**: `POST /api/insights/mute`

**Description**: Permanently mute a rule so it never fires again for this user (or entire tenant if `userId` omitted).

**Request**:
```json
{
  "ruleKey": "lead.noContact.hot",
  "minutes": 10080  // Optional: temporary mute for 7 days (omit for permanent)
}
```

**Response**:
```json
{
  "success": true,
  "ruleKey": "lead.noContact.hot",
  "mutedUntil": "2025-11-14T14:30:00Z"  // or null if permanent
}
```

**Example (permanent mute)**:
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ruleKey":"lead.noContact.hot"}' \
  https://app.autolytiq.com/api/insights/mute
```

**Example (temporary mute for 24 hours)**:
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ruleKey":"lead.noContact.hot","minutes":1440}' \
  https://app.autolytiq.com/api/insights/mute
```

---

### 7. Unmute Rule

**Endpoint**: `DELETE /api/insights/mute/:ruleKey`

**Description**: Remove a mute so the rule fires again.

**Request**: None (ruleKey in URL path)

**Response**:
```json
{
  "success": true,
  "ruleKey": "lead.noContact.hot"
}
```

**Example**:
```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://app.autolytiq.com/api/insights/mute/lead.noContact.hot
```

---

## RBAC Integration

### How Audience Targeting Works

Each rule defines an **audience** with:
- **Roles**: Array of role names (e.g., `['sales', 'fi']`)
- **User IDs** (optional): Specific users who should see the insight

**Example**:
```typescript
// All sales reps see this
audience: { roles: ['sales'] }

// Only F&I managers see this
audience: { roles: ['fi'] }

// Only specific user sees this
audience: { roles: [], userIds: ['user_abc123'] }

// Sales reps AND specific users see this
audience: { roles: ['sales'], userIds: ['user_special'] }
```

### Effective Permission Filtering

The evaluator checks two conditions before firing a rule:

```typescript
const hasAccess =
  rule.audience.userIds?.includes(context.userId) ||
  rule.audience.roles.includes(context.role);

if (!hasAccess) {
  return; // Skip rule
}
```

**This respects RBAC boundaries**: If a salesperson doesn't have the `fi` role, they will never see F&I insights, even if they somehow query the API.

### Example: GM vs. Salesperson

**GM User** (role: `admin`):
- Sees insights for: `admin`, plus any role-level insights they're granted
- Does NOT see role-specific insights unless explicitly granted

**Salesperson** (role: `sales`):
- Sees insights for: `sales` only
- Does NOT see `fi`, `inventory`, `service` insights

**F&I Manager** (role: `fi`):
- Sees insights for: `fi` and `sales` (if rule targets both)
- Does NOT see `service` or `inventory` insights

---

## Testing Guide

### Test Predicates in Isolation

Predicates are pure functions, so you can test them without the full engine:

```typescript
import { olderThan } from '@repo/shared/insights';

test('olderThan returns true for old dates', async () => {
  const ctx = {
    tenantId: 'test',
    userId: 'user1',
    role: 'sales',
    now: new Date('2025-11-07T14:00:00Z'),
    fetch: async () => new Date('2025-11-07T12:00:00Z'), // 2 hours ago
  };

  const predicate = olderThan(60, async (c) => await c.fetch());
  const result = await predicate(ctx);

  expect(result).toBe(true); // 120 minutes > 60 minutes
});
```

### Test with Dry-Run Evaluation

Use the dry-run endpoint to test rules without database side effects:

```bash
curl -X POST \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "test_tenant",
    "userId": "test_user",
    "role": "sales"
  }' \
  http://localhost:3000/api/insights/evaluate/dry-run
```

**Expected Output**: Array of `{ ruleKey, matched, score, message, executionTimeMs }`

### Test Cooldown/TTL Behavior

**Cooldown Test**:
1. Create an insight manually via evaluator
2. Wait 30 seconds (less than cooldown)
3. Run evaluator again
4. Verify insight is NOT re-created

**TTL Test**:
1. Create an insight with `ttlMinutes: 5`
2. Query queue immediately → insight appears
3. Wait 6 minutes
4. Query queue again → insight is filtered out (expired)

### Example Test Cases

```typescript
describe('Insight Rules Engine', () => {
  test('Rule fires when condition met', async () => {
    // Arrange: Seed database with pending F&I deal
    await prisma.deal.create({
      data: {
        tenantId: 'test',
        fiStatus: 'pending',
        fiSubmittedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
    });

    // Act: Evaluate rules
    await evaluateRules({
      tenantId: 'test',
      userId: 'user1',
      role: 'fi',
      now: new Date(),
    });

    // Assert: Insight created
    const insights = await prisma.insightQueue.findMany({
      where: { tenantId: 'test', ruleKey: 'deal.pendingFI.tooLong' },
    });

    expect(insights.length).toBe(1);
    expect(insights[0].severity).toBe('warning');
  });

  test('Rule respects cooldown', async () => {
    // Arrange: Create insight
    await prisma.insightQueue.create({
      data: {
        tenantId: 'test',
        ruleKey: 'deal.pendingFI.tooLong',
        role: 'fi',
        score: 0.8,
        message: 'Test',
        card: {},
        createdAt: new Date(), // Just now
      },
    });

    // Act: Evaluate again immediately
    await evaluateRules({
      tenantId: 'test',
      userId: 'user1',
      role: 'fi',
      now: new Date(),
    });

    // Assert: No duplicate insight
    const insights = await prisma.insightQueue.findMany({
      where: { tenantId: 'test', ruleKey: 'deal.pendingFI.tooLong' },
    });

    expect(insights.length).toBe(1); // Still only 1
  });
});
```

---

## Deployment Checklist

### 1. Environment Variables

Add to `.env` files (backend):

```bash
# Enable insights engine
INSIGHTS_ENABLED=true

# Database connection (should already exist)
DATABASE_URL="postgresql://user:pass@localhost:5432/autolytiq"
```

### 2. Database Migration

Run Prisma migration to create insight tables:

```bash
cd /root/autolytiq/packages/db
pnpm prisma migrate dev --name add_insight_tables
```

**Verification**:
```bash
pnpm prisma studio
# Check for tables: InsightRule, InsightEvent, InsightQueue, InsightMute
```

### 3. Seed Built-in Rules

Seed the 10 built-in rules into the database:

```bash
cd /root/autolytiq/apps/backend
pnpm ts-node prisma/seed-insights.ts
```

**Verification**:
```bash
psql $DATABASE_URL -c "SELECT key, domain, severity FROM insight_rules;"
# Should show 10 rules
```

### 4. Register API Routes

Wire the insight router into the Express app:

```typescript
// In apps/backend/src/index.ts or server.ts
import insightRoutes from './routes/insights';

app.use('/api/insights', insightRoutes);
```

### 5. Verify Endpoints

Test all endpoints:

```bash
# List rules
curl http://localhost:3000/api/insights/rules

# Dry-run (use real JWT token)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"test","userId":"user1","role":"sales"}' \
  http://localhost:3000/api/insights/evaluate/dry-run

# Get queue (empty if no insights yet)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/insights/queue
```

### 6. Set Up Evaluation Trigger

**Option A**: Cron job (runs every 5 minutes)

```typescript
import cron from 'node-cron';
import { evaluateRules } from './services/insights/evaluator';

cron.schedule('*/5 * * * *', async () => {
  console.log('[Cron] Evaluating insights...');

  // Get all active users
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, tenantId: true, role: true },
  });

  for (const user of users) {
    await evaluateRules({
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      now: new Date(),
    });
  }
});
```

**Option B**: Event-driven (React to database changes)

```typescript
// On deal update
eventEmitter.on('deal.updated', async (dealId) => {
  const deal = await prisma.deal.findUnique({ where: { id: dealId } });

  // Trigger evaluation for relevant users
  const users = await prisma.user.findMany({
    where: { tenantId: deal.tenantId, role: { in: ['sales', 'fi'] } },
  });

  for (const user of users) {
    await evaluateRules({ ...user, now: new Date() });
  }
});
```

---

## Troubleshooting

### Issue: No Insights Appearing

**Symptoms**: Queue is always empty, even when conditions are met.

**Checklist**:
1. **Check feature flag**: Verify `INSIGHTS_ENABLED=true` in `.env`
2. **Check database**: Run `SELECT * FROM insight_queue` to see if insights exist
3. **Check audience**: Verify your user's role matches rule's `audience.roles`
4. **Check cooldown**: Rule may be in cooldown period (check `createdAt` of last insight)
5. **Check TTL**: Insights may have expired (check `expiresAt`)
6. **Check dry-run**: Use `/api/insights/evaluate/dry-run` to see which rules match

**Example Fix**:
```bash
# Check if insights exist but are expired
psql $DATABASE_URL -c "
  SELECT rule_key, state, expires_at, created_at
  FROM insight_queue
  WHERE tenant_id = 'your_tenant'
  ORDER BY created_at DESC;
"

# Result: Insights expired 2 hours ago
# Fix: Increase TTL or trigger evaluation more frequently
```

---

### Issue: Same Insight Keeps Appearing

**Symptoms**: Acknowledging an insight doesn't prevent it from reappearing.

**Checklist**:
1. **Check cooldown**: Rule may have no cooldown set (always fires)
2. **Check state**: Verify insight state changed to `done` after ack
3. **Check query filter**: Queue query should exclude `state: 'done'`
4. **Check upsert logic**: Evaluator may be creating new insights instead of updating

**Example Fix**:
```typescript
// Add cooldown to rule
registerRule({
  // ...
  cooldownMinutes: 60, // Don't re-fire for 1 hour
});
```

---

### Issue: Old Insights Not Expiring

**Symptoms**: Insights remain in queue long after TTL should have expired them.

**Checklist**:
1. **Check TTL setting**: Verify rule has `ttlMinutes` set
2. **Check queue query**: Verify query filters by `expiresAt > now`
3. **Check `expiresAt` column**: May be null (no expiration)

**Example Fix**:
```typescript
// Queue query should filter expired insights
const now = new Date();
const insights = await prisma.insightQueue.findMany({
  where: {
    tenantId,
    role,
    state: { in: ['new', 'seen'] },
    OR: [
      { expiresAt: null },        // No expiration
      { expiresAt: { gt: now } }, // Not yet expired
    ],
  },
});
```

---

### Issue: Wrong Insights Delivered to User

**Symptoms**: User sees insights for roles they don't have.

**Checklist**:
1. **Check JWT role**: Verify `req.user.role` matches user's actual role
2. **Check audience**: Verify rule's `audience.roles` includes user's role
3. **Check RBAC integration**: Evaluator should filter by `hasAccess`

**Example Fix**:
```typescript
// Evaluator should check audience
const hasAccess =
  rule.audience.userIds?.includes(context.userId) ||
  rule.audience.roles.includes(context.role);

if (!hasAccess) {
  continue; // Skip rule
}
```

---

### Issue: Slow Query Performance

**Symptoms**: Evaluation takes > 5 seconds, impacts user experience.

**Checklist**:
1. **Check indexes**: Verify indexes exist on `[tenantId, status]`, `[tenantId, createdAt]`
2. **Check query complexity**: Avoid N+1 queries in fetchers
3. **Check rule count**: 100+ rules may need batching
4. **Enable query logging**: Set `DATABASE_LOG=query` to see slow queries

**Example Fix**:
```sql
-- Add missing index
CREATE INDEX idx_deals_tenant_status ON deals(tenant_id, status);

-- Add composite index for common queries
CREATE INDEX idx_deals_tenant_fi_submitted
  ON deals(tenant_id, fi_status, fi_submitted_at);
```

---

## Summary

The **Insight Rules Engine** transforms Autolytiq from a reactive system into a proactive assistant. By encoding business rules as composable predicates, the system surfaces critical information exactly when and where it's needed—no hunting, no dashboards, no missed opportunities.

**Key Takeaways**:
- **Composable DSL**: Easy-to-read predicates that mirror business logic
- **Smart Prioritization**: Severity + recency + role = optimal queue order
- **User Control**: Snooze, mute, and acknowledge workflows prevent fatigue
- **RBAC-Aware**: Insights respect permission boundaries automatically
- **Performance**: Cooldown and TTL prevent spam and stale data

**Next Steps**:
1. Add more domain-specific predicates (inventory, service, accounting)
2. Wire up event-driven evaluation (React to database changes)
3. Build frontend UI components (notification bell, insight cards)
4. Add analytics (track which insights drive most actions)
5. Implement WebSocket subscriptions for real-time delivery

---

**File**: `/root/autolytiq/docs/specs/INSIGHT_RULES_ENGINE.md`
**Version**: 1.0.0
**Last Updated**: 2025-11-07

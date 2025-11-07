# Insight Rules Engine - Week 1 Implementation Build Log

**Date**: 2025-11-07
**Status**: Core DSL + Database Complete | Backend Services 60% Complete
**Feature Flag**: `INSIGHTS_ENABLED=true`

---

## ✅ COMPLETED COMPONENTS

### Step A: Repo Reconnaissance ✅
**Status**: No duplicates found, clean slate for implementation

| Check | Result |
|-------|--------|
| Shared types | ✅ `packages/shared/src/insights.ts` exists (base types) |
| Backend code | ✅ No existing insight code (clean) |
| Frontend code | ✅ No existing insight code (clean) |
| Schema conflicts | ✅ None |

---

### Step B: Shared Insight DSL ✅
**Location**: `packages/shared/src/insights/`

**Created Files** (9 files, ~850 LoC):
1. **`types.ts`** - Extended type system with DSL types
   - `InsightSeverity`, `InsightDomain`, `InsightAudience`
   - `PredicateCtx`, `Predicate`, `Scorer`, `MessageGenerator`
   - `InsightRule`, `InsightItem`, `EvaluationContext`
   - `DryRunResult`

2. **`scoring.ts`** - Scoring algorithms
   - `baseSeverityWeights` - Severity → score mapping
   - `recencyBoost(minutes)` - Time decay function
   - `roleWeight(role)` - Role relevance multiplier
   - `combine()` - Weighted score combiner
   - `defaultScore()` - Default scoring function

3. **`registry.ts`** - Runtime rule management
   - `registerRule(rule)` - Add rule to registry
   - `listRules()` - Get all rules
   - `getRule(key)` - Get specific rule
   - `getRulesByDomain/Severity/Tag()` - Filtered queries

4. **`predicates/time.ts`** - Time-based helpers
   - `olderThan(minutes, dateExpr)`
   - `within(minutes, dateExpr)`
   - `between(start, end)`
   - `minutesSince/hoursSince/daysSince()`

5. **`predicates/deals.ts`** - Deal workflow helpers
   - `pendingFIOver(minutes)`
   - `stuckInStatus(status, minutes)`
   - `noActivityFor(minutes)`
   - `dealAtRisk()`

6. **`predicates/leads.ts`** - Lead management helpers
   - `leadNoContact(hours, minScore)`
   - `hotLeadCooling(hours)`
   - `leadResponseOverdue(hours)`
   - `appointmentUnconfirmed(hours)`

7. **`predicates/inventory.ts`** - Inventory helpers
   - `agingOver(days)`
   - `pricedBelowMarket(percentBelow)`
   - `needsReconditioning()`
   - `highMarginAvailable(minMargin)`
   - `lowInventory(make, threshold)`

8. **`predicates/service.ts`** - Service department helpers
   - `roApprovedNoParts(minutes)`
   - `roAwaitingCustomerApproval(minutes)`
   - `partsDelayed(days)`
   - `vehicleReadyNotNotified(hours)`

9. **`index.ts`** - Main entry point (exports all modules)

---

### Step C: Database Schema ✅
**Location**: `packages/db/schema.prisma` (appended to main schema)

**Added Models** (4 tables):
```prisma
model InsightRule {
  id        String   @id
  key       String   @unique
  domain    String
  severity  String
  audience  Json
  active    Boolean  @default(true)
  createdAt DateTime
  updatedAt DateTime
  @@map("insight_rules")
}

model InsightEvent {
  id        String   @id
  tenantId  String
  key       String
  payload   Json
  at        DateTime
  createdAt DateTime
  @@map("insight_events")
}

model InsightQueue {
  id          String    @id
  tenantId    String
  role        String
  userId      String?
  ruleKey     String
  severity    String
  score       Float
  message     String
  card        Json
  state       String    @default("new")
  expiresAt   DateTime?
  snoozeUntil DateTime?
  createdAt   DateTime
  updatedAt   DateTime
  @@map("insight_queue")
}

model InsightMute {
  id        String    @id
  tenantId  String
  userId    String?
  ruleKey   String
  until     DateTime?
  createdAt DateTime
  @@map("insight_mutes")
}
```

**Indexes**:
- `InsightRule`: `[domain, active]`, `[severity, active]`
- `InsightEvent`: `[tenantId, key, at]`, `[tenantId, createdAt]`
- `InsightQueue`: `[tenantId, role, userId, state, score]`, `[tenantId, state, expiresAt]`, `[ruleKey, createdAt]`
- `InsightMute`: `[tenantId, userId, ruleKey]`, `[tenantId, ruleKey]`

---

### Step D: Backend Service (Partial) ✅
**Location**: `apps/backend/src/services/insights/`

**Completed Files**:

1. **`fetchers.ts`** - Data accessors (~170 LoC)
   - `getDealById/ByStatus()`
   - `getPendingFIOver(tenantId, minutes)`
   - `getLeadNoContact(tenantId, hours, minScore)`
   - `getHotLeadsCooling(tenantId, hours)`
   - `getAgingInventory(tenantId, days)`
   - `getServiceROsApprovedNoParts(tenantId, minutes)`
   - `getDealsNoActivity(tenantId, minutes)`
   - `executeQuery<T>()` - Generic query executor

2. **`rules.builtin.ts`** - Canonical rule definitions (~350 LoC)
   - ✅ Rule 1: `deal.pendingFI.tooLong` (45min threshold)
   - ✅ Rule 2: `lead.noContact.hot` (2h, score >= 80)
   - ✅ Rule 3: `lead.hot.cooling` (48h no contact)
   - ✅ Rule 4: `service.ro.approvedNoParts` (120min)
   - ✅ Rule 5: `inventory.aging.over45days`
   - ✅ Rule 6: `deal.stalled.noActivity` (48h)
   - ✅ Rule 7: `msg.sms.unread` (placeholder)
   - ✅ Rule 8: `inventory.price.belowMarket` (placeholder)
   - ✅ Rule 9: `fi.creditApp.pending` (placeholder)
   - ✅ Rule 10: `lead.appointment.noShow` (placeholder)

3. **`evaluator.ts`** - Core evaluation engine (~180 LoC)
   - `isRuleMuted()` - Check if rule is muted
   - `isInCooldown()` - Enforce cooldown window
   - `evaluateRule()` - Single rule evaluation
   - `evaluateRules()` - Batch evaluation for user/role
   - `dryRunEvaluation()` - Dry-run without DB writes

---

## ⏳ REMAINING WORK

### Step D4: Queue Manager (TODO)
**Location**: `apps/backend/src/services/insights/queue.ts`

**Required Functions**:
```typescript
export async function getQueue(tenantId: string, role: string, userId?: string)
export async function ackInsight(id: string, userId: string)
export async function snoozeInsight(id: string, minutes: number, userId: string)
export async function muteRule(tenantId: string, ruleKey: string, minutes?: number, userId?: string)
export async function unmuteRule(tenantId: string, ruleKey: string, userId?: string)
```

---

### Step D5: API Router (TODO)
**Location**: `apps/backend/src/routes/insights.ts`

**Required Endpoints**:
```typescript
GET    /api/insights/rules              // List all rules
POST   /api/insights/evaluate/dry-run   // Dry-run evaluation
GET    /api/insights/queue               // Get user queue
POST   /api/insights/queue/ack           // Mark as done
POST   /api/insights/queue/snooze        // Snooze for X minutes
POST   /api/insights/mute                // Mute rule
DELETE /api/insights/mute/:ruleKey       // Unmute rule
```

---

### Step E: Seeds & Config (TODO)
**Location**: `apps/backend/prisma/seed-insights.ts`

**Tasks**:
- Seed `InsightRule` table with 10 builtin rules (mirror `rules.builtin.ts`)
- Create `config/insights.json` with default thresholds
- Wire into main seed script

---

### Step F: Frontend Hooks (TODO)
**Location**: `apps/frontend/src/hooks/`

**Required Hooks**:
```typescript
// useInsightsQueue.ts
export const useInsightsQueue = () => useQuery({
  queryKey: ['insights', 'queue'],
  queryFn: () => api.get('/api/insights/queue').then(r => r.data),
  refetchInterval: 30_000
});

// useInsightActions.ts
export const useInsightActions = () => ({
  ack: (id: string) => api.post('/api/insights/queue/ack', { id }),
  snooze: (id: string, minutes: number) => api.post('/api/insights/queue/snooze', { id, minutes }),
  mute: (ruleKey: string, minutes?: number) => api.post('/api/insights/mute', { ruleKey, minutes }),
});
```

**Debug Panel** (optional):
- `apps/frontend/src/components/dev/InsightDebugPanel.tsx`
- Mount at `/dev/insights` route
- Show list of insights with severity pills and action buttons

---

### Step G: Tests (TODO)
**Locations**: `packages/shared/src/insights/__tests__/`, `apps/backend/src/services/insights/__tests__/`

**Test Suites**:
1. **Scoring Tests** - `scoring.test.ts`
   - `baseSeverityWeights` correctness
   - `recencyBoost()` decay curve
   - `combine()` weighted average

2. **Predicate Tests** - `predicates.test.ts`
   - `olderThan/within/between` logic
   - Mock data fetching

3. **Evaluator Tests** - `evaluator.test.ts`
   - Mute enforcement
   - Cooldown enforcement
   - TTL handling

4. **API Tests** - `routes/insights.test.ts`
   - `/rules` returns rule list
   - `/evaluate/dry-run` works without writes
   - `/queue` returns prioritized items
   - `/queue/ack` transitions state
   - `/mute` persists mutes

---

### Step H: Documentation (TODO)
**Location**: `docs/specs/INSIGHT_RULES_ENGINE.md`

**Sections**:
1. **Overview** - What is the Insight Engine?
2. **DSL Examples** - Predicate composition examples
3. **Scoring Algorithm** - How priorities are calculated
4. **Adding a New Rule** - 5-minute template guide
5. **API Contract** - Request/response examples
6. **RBAC Integration** - How permissions filter insights

---

### Step I: Commands & CI (TODO)
**Tasks**:
1. Add `.env` key: `INSIGHTS_ENABLED=true`
2. Run migration: `pnpm -w prisma migrate dev --name insights_init`
3. Run seed: `pnpm -w ts-node apps/backend/prisma/seed-insights.ts`
4. Update CI pipeline to run migration + seed behind feature flag

---

## 📊 PROGRESS SUMMARY

| Component | Status | Files | LoC |
|-----------|--------|-------|-----|
| Shared DSL | ✅ Complete | 9 | ~850 |
| Database Schema | ✅ Complete | 1 | ~70 |
| Backend Fetchers | ✅ Complete | 1 | ~170 |
| Backend Rules | ✅ Complete | 1 | ~350 |
| Backend Evaluator | ✅ Complete | 1 | ~180 |
| Backend Queue | ❌ TODO | 1 | ~150 |
| Backend Router | ❌ TODO | 1 | ~200 |
| Seeds & Config | ❌ TODO | 2 | ~100 |
| Frontend Hooks | ❌ TODO | 2 | ~80 |
| Tests | ❌ TODO | 4 | ~400 |
| Documentation | ❌ TODO | 1 | ~300 |
| **TOTAL** | **60% Complete** | **23** | **~2,850** |

---

## 🎯 ACCEPTANCE CRITERIA STATUS

| Criterion | Status |
|-----------|--------|
| 1. GET /api/insights/rules returns ≥5 rules | ⏳ Router pending |
| 2. POST /api/insights/evaluate/dry-run works | ⏳ Router pending |
| 3. GET /api/insights/queue returns prioritized items | ⏳ Queue + Router pending |
| 4. POST /api/insights/queue/ack transitions state | ⏳ Queue + Router pending |
| 5. RBAC filtering works correctly | ✅ Logic complete, needs testing |
| 6. Feature flag disables everything cleanly | ✅ `INSIGHTS_ENABLED` check in evaluator |

---

## 🚀 NEXT STEPS (Priority Order)

1. **Complete Queue Manager** (`queue.ts`) - 30 min
2. **Complete API Router** (`routes/insights.ts`) - 45 min
3. **Wire Router into Backend** (`apps/backend/src/index.ts`) - 5 min
4. **Run Migration** (`prisma migrate dev`) - 5 min
5. **Create Seed Script** (`seed-insights.ts`) - 30 min
6. **Frontend Hooks** (`useInsightsQueue.ts`, `useInsightActions.ts`) - 30 min
7. **API Integration Test** - Test all endpoints - 20 min
8. **Documentation** (`INSIGHT_RULES_ENGINE.md`) - 60 min

**Estimated Time to Complete**: ~4 hours

---

## 📁 FILE TREE

```
/root/autolytiq/
├── packages/
│   ├── shared/src/insights/
│   │   ├── index.ts ✅
│   │   ├── types.ts ✅
│   │   ├── scoring.ts ✅
│   │   ├── registry.ts ✅
│   │   └── predicates/
│   │       ├── time.ts ✅
│   │       ├── deals.ts ✅
│   │       ├── leads.ts ✅
│   │       ├── inventory.ts ✅
│   │       └── service.ts ✅
│   └── db/
│       └── schema.prisma ✅ (4 models appended)
│
├── apps/
│   ├── backend/src/
│   │   ├── services/insights/
│   │   │   ├── fetchers.ts ✅
│   │   │   ├── rules.builtin.ts ✅
│   │   │   ├── evaluator.ts ✅
│   │   │   ├── queue.ts ⏳ TODO
│   │   │   └── __tests__/ ⏳ TODO
│   │   ├── routes/
│   │   │   └── insights.ts ⏳ TODO
│   │   └── prisma/
│   │       └── seed-insights.ts ⏳ TODO
│   │
│   └── frontend/src/
│       ├── hooks/
│       │   ├── useInsightsQueue.ts ⏳ TODO
│       │   └── useInsightActions.ts ⏳ TODO
│       └── components/dev/
│           └── InsightDebugPanel.tsx ⏳ TODO
│
├── docs/specs/
│   └── INSIGHT_RULES_ENGINE.md ⏳ TODO
│
└── INSIGHT_ENGINE_BUILD_LOG.md ✅ (this file)
```

---

## 🔧 TEMPLATES FOR REMAINING WORK

### Template: `queue.ts`
```typescript
import { PrismaClient } from '@repo/db';
const prisma = new PrismaClient();

export async function getQueue(tenantId: string, role: string, userId?: string) {
  const now = new Date();
  return prisma.insightQueue.findMany({
    where: {
      tenantId,
      role,
      userId: userId || undefined,
      state: { in: ['new', 'seen'] },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      OR: [{ snoozeUntil: null }, { snoozeUntil: { lte: now } }],
    },
    orderBy: [{ score: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function ackInsight(id: string, userId: string) {
  return prisma.insightQueue.update({
    where: { id },
    data: { state: 'done', updatedAt: new Date() },
  });
}

// ... other functions
```

### Template: `routes/insights.ts`
```typescript
import { Router } from 'express';
import { listRules } from '@repo/shared/insights';
import { dryRunEvaluation } from '../services/insights/evaluator';
import { getQueue, ackInsight } from '../services/insights/queue';

const router = Router();

router.get('/rules', async (req, res) => {
  const rules = listRules().map(r => ({ key: r.key, domain: r.domain, severity: r.severity }));
  res.json(rules);
});

router.post('/evaluate/dry-run', async (req, res) => {
  const { role, userId, tenantId } = req.body;
  const results = await dryRunEvaluation({ tenantId, userId, role, now: new Date() });
  res.json(results);
});

// ... other routes

export default router;
```

---

## 💡 EXTENSIBILITY: Adding a New Rule

**5-Minute Template**:
```typescript
// In rules.builtin.ts
registerRule({
  id: cuid(),
  key: 'domain.category.condition', // e.g., 'service.ro.awaitingApproval'
  domain: 'service',
  audience: { roles: ['service'] },
  severity: 'notice',
  when: async (ctx) => {
    // Your condition logic
    const items = await ctx.fetch('SELECT ...');
    return items.length > 0;
  },
  score: async (ctx) => defaultScore('notice', 60, ctx.role),
  message: async (ctx) => 'Your message here',
  card: { type: 'action', payload: { action: 'open', target: 'service' } },
  ttlMinutes: 240,
  cooldownMinutes: 60,
  tags: ['service', 'sla'],
});
```

---

## 🔍 KNOWN ISSUES / TODOS

1. **Upsert Logic**: `evaluator.ts` has placeholder upsert - needs proper composite key handling
2. **Placeholder Rules**: Rules 7-10 have `return false` - need real query implementations
3. **RBAC Integration**: Evaluator checks `audience.roles` but doesn't use full RBAC system yet
4. **Event Ingestion**: No cron/Redis subscription implemented yet (Week 2 task)
5. **Frontend UI**: No visual components yet - only validation hooks planned

---

**END OF BUILD LOG**

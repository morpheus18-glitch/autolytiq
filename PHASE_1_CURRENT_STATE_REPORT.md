# PHASE 1: CURRENT STATE ANALYSIS REPORT
## Automotive DMS Architecture Assessment

**Date:** October 27, 2025
**Branch:** `claude/dms-architecture-upgrade-011CUXuRAvaocVpmsk8YtVUX`

---

## EXECUTIVE SUMMARY

The AutoLytiq DMS codebase already has **significant architectural foundations** in place:
- ✅ Multi-tenancy with AsyncLocalStorage-based isolation
- ✅ In-memory event bus with typed domain events
- ✅ ML service with circuit breaker and retry logic
- ✅ Search vector functionality for Customer and Vehicle models

**Key Gaps Identified:**
- ⚠️ No durable outbox pattern for events (in-memory only)
- ⚠️ No immutable event sourcing for deals (uses mutable AuditLog)
- ⚠️ ML service timeout too high (10s vs recommended 300ms)
- ⚠️ No ML result caching layer
- ⚠️ Signature model missing tenantId
- ⚠️ Limited structured logging with trace IDs

---

## 1. CURRENT ARCHITECTURE

### Application Structure
```
autolytiq/
├── apps/
│   ├── client/           # React + Vite frontend
│   └── server/           # Express.js backend
│       ├── src/
│       │   ├── lib/
│       │   │   ├── prisma.ts           # ✅ Tenant middleware exists
│       │   │   └── event-bus.ts        # ⚠️ In-memory only
│       │   ├── services/               # 25+ service files
│       │   │   ├── desking.service.ts  # Deal/F&I operations
│       │   │   ├── ml.service.ts       # ✅ Has circuit breaker
│       │   │   ├── twilio.service.ts   # External integration
│       │   │   └── sendgrid.service.ts # External integration
│       │   ├── events/
│       │   │   ├── topics.ts           # ✅ Typed event topics
│       │   │   └── index.ts            # Event emission
│       │   └── integrations/           # Domain integration handlers
├── packages/
│   ├── db/
│   │   └── schema.prisma  # 57 models, 54 with tenantId
│   └── shared/            # Shared utilities
```

### Technology Stack
- **Frontend:** React 18.3, Vite, TanStack Query, Tailwind CSS
- **Backend:** Express.js 4.21, TypeScript 5.6
- **Database:** PostgreSQL (via Prisma ORM 5.22)
- **ML Service:** External service (FastAPI assumed, URL: env.ML_SERVICE_URL)
- **External Services:** Twilio (SMS), SendGrid (Email)
- **Queue:** BullMQ (Redis-backed)
- **Session:** Redis/MemoryStore

---

## 2. TENANCY STATUS

### ✅ WHAT'S WORKING

**Tenant Isolation Middleware** (`apps/server/src/lib/prisma.ts:64-130`):
- AsyncLocalStorage-based tenant context
- Automatic tenantId injection on all CRUD operations
- Supports: findMany, findFirst, findUnique, create, update, delete, upsert
- **Security:** Throws error if tenant context missing for scoped models

**Tenant-Scoped Models** (33 models currently tracked):
```typescript
const tenantScopedModels = new Set<Prisma.ModelName>([
  User, Customer, Lead, Activity, Appointment, LeadScore,
  Communication, EmailTemplate, SMSTemplate, Automation, AutomationExecution,
  ComplianceChecklist, Deal, DealWorksheet, DealVersion, DealOptimization,
  CounterOffer, ApprovalPrediction, Vehicle
]);
```

### ⚠️ GAPS IDENTIFIED

**Models WITH tenantId but NOT in tenantScopedModels Set:**
1. **CustomerInteraction** (line 179) - Has tenantId, not in middleware
2. **Appraisal** (line 556) - Has tenantId, not in middleware
3. **ReconItem** (line 599) - Has tenantId, not in middleware
4. **PriceHistory** (line 627) - Has tenantId, not in middleware
5. **AuctionPurchase** (line 648) - Has tenantId, not in middleware
6. **WholesaleListing** (line 676) - Has tenantId, not in middleware
7. **MarketComp** (line 701) - Has tenantId, not in middleware
8. **DealJacket** (line 984) - Has tenantId, not in middleware
9. **Contract** (line 1032) - Has tenantId, not in middleware
10. **FIProduct** (line 1076) - Has tenantId, not in middleware
11. **MenuConfiguration** (line 1102) - Has tenantId, not in middleware
12. **DealDocument** (line 1124) - Has tenantId, not in middleware
13. **CreditApplication** (line 1167) - Has tenantId, not in middleware
14. **CreditReport** (line 1216) - Has tenantId, not in middleware
15. **Lender** (line 1257) - Has tenantId, not in middleware
16. **LenderSubmission** (line 1280) - Has tenantId, not in middleware
17. **FundingChecklist** (line 1314) - Has tenantId, not in middleware
18. **FundingRequest** (line 1332) - Has tenantId, not in middleware
19. **GLAccount** (line 1360) - Has tenantId, not in middleware
20. **JournalEntry** (line 1382) - Has tenantId, not in middleware
21. **JournalEntryLine** (line 1404) - Has tenantId, not in middleware
22. **Commission** (line 1423) - Has tenantId, not in middleware
23. **Report** (line 1445) - Has tenantId, not in middleware
24. **Notification** (line 1463) - Has tenantId, not in middleware
25. **WorkflowDefinition** (line 1487) - Has tenantId, not in middleware
26. **WorkflowStage** (line 1503) - Has tenantId, not in middleware
27. **VehicleWorkflow** (line 1527) - Has tenantId, not in middleware
28. **StageTransition** (line 1550) - Has tenantId, not in middleware
29. **WorkflowTask** (line 1569) - Has tenantId, not in middleware
30. **TransportOrder** (line 1600) - Has tenantId, not in middleware
31. **PipelineAggregate** (line 1625) - Has tenantId, not in middleware
32. **AuditLog** (line 1645) - Has tenantId, not in middleware
33. **SystemSetting** (line 1663) - Has tenantId, not in middleware
34. **CustomerVehicle** (line 433) - Has tenantId, not in middleware
35. **VehicleHistory** (line 539) - Has tenantId, not in middleware
36. **CreditSubmissionDraft** (line 870) - Has tenantId, not in middleware

**Model WITHOUT tenantId (needs addition):**
- **Signature** (line 1061) - Should inherit tenantId from Contract

### ⚠️ Row-Level Security (RLS)
**Status:** NOT IMPLEMENTED at database level
**Current Approach:** Application-level via Prisma middleware
**Risk:** Direct database access bypasses tenant isolation
**Recommendation:** Keep application-level for now, add RLS in future sprint

---

## 3. CROSS-DOMAIN COUPLING

### ✅ GOOD: Event-Driven Patterns Exist

**Event Topics** (`apps/server/src/events/topics.ts`):
```
Domain: Deal/F&I
- deal.worksheet.created
- deal.version.created
- deal.status.updated
- deal.status.closed
- deal.counter.accepted

Domain: Inventory
- inventory.vehicle.reserved
- inventory.vehicle.released

Domain: Accounting
- accounting.journal.created
```

**Event Consumers:**
- `apps/server/src/integrations/inventory.integration.ts` - Listens to deal events
- `apps/server/src/integrations/accounting.integration.ts` - Listens to deal events

### ⚠️ COUPLING VIOLATIONS FOUND

**1. DealOptimizer Directly Queries Vehicle** (`dealOptimizer.service.ts:314`):
```typescript
const record = await prisma.vehicle.findFirst({ where });
```
**Impact:** Desk/F&I domain depends on Inventory schema
**Fix:** Create DeskVehicleView read model

**2. Desking Service Includes Vehicle Relations** (`desking.service.ts:281`):
```typescript
include: { versionPointer: true, customer: true, vehicle: true, salesperson: true }
```
**Impact:** Direct joins across domains
**Fix:** Use denormalized read models or event-driven views

**3. No Read Model Pattern:**
- All services query `prisma.vehicle`, `prisma.customer` directly
- No domain-specific materialized views
- Risk: Schema changes in one domain break others

### Recommendation: Introduce Read Models in Sprint 2
```
DeskVehicleView (for F&I domain)
├── vehicleId
├── vin, make, model, year
├── cost, listPrice
├── status
└── Updated via inventory.vehicle.* events
```

---

## 4. ML SERVICE INTEGRATION

### ✅ WHAT'S WORKING

**Circuit Breaker Implementation** (`ml.service.ts:23-66`):
- Failure threshold: 5 failures
- Reset timeout: 30 seconds
- States: CLOSED, OPEN, HALF_OPEN

**Retry Logic** (`ml.service.ts:125-143`):
- Max retries: 3
- Exponential backoff: 200ms base delay
- Retries on: 408, 429, 500, 502, 503, 504, ETIMEDOUT

**ML Service Endpoints:**
```
POST /score-lead              - Lead scoring
POST /next-action             - Lead engagement AI
POST /sentiment-analysis      - Communication sentiment
POST /desking/optimize        - Deal optimization
POST /desking/counter         - Counter-offer analysis
POST /desking/approval        - Lender approval prediction
GET  /close-probability       - Deal close probability
```

### ⚠️ ISSUES IDENTIFIED

**1. Timeout Too High** (`ml.service.ts:77`):
```typescript
timeout: 10000  // 10 seconds
```
**Impact:**
- Blocks request thread for up to 10 seconds
- User experiences long delays
- Server can become unresponsive under load

**Recommendation:** Reduce to 300ms with aggressive fallbacks

**2. No Caching Layer:**
```typescript
// Every call hits ML service
await mlService.scoreLead(payload)  // No cache check
```
**Impact:**
- Duplicate predictions for same inputs
- Wasted ML compute
- Slower response times

**Recommendation:** Add MLFeatureCache table (24-hour TTL)

**3. No Health Check Endpoint:**
- `/health/ml` route doesn't exist
- Can't proactively detect ML service degradation
- No monitoring integration point

**4. Fallback Strategy:**
- Circuit breaker opens after 5 failures
- But no graceful degradation logic
- Users see errors instead of approximate results

### ML Service Call Locations

**File: `dealOptimizer.service.ts`**
- `optimizeDeal()` - Calls `mlService.optimizeDeal()`
- No timeout override, uses default 10s

**File: `lead-score.service.ts`**
- `calculateLeadScore()` - Calls `mlService.scoreLead()`
- No caching

**File: `approvalPredictor.service.ts`**
- `predictApproval()` - Calls `mlService.predictApproval()`
- No fallback to rules engine

---

## 5. AUDIT TRAIL & EVENT SOURCING

### ⚠️ CURRENT STATE: Not Audit-Proof

**Deal Event Logging** (`dealEventLog.service.ts`):
```typescript
await prisma.auditLog.create({
  data: {
    action: 'DEAL_EVENT',
    resource: `deal:${dealId}`,
    details: { event, ...payload }
  }
});
```

**Problems:**
1. **Mutable:** AuditLog records can be UPDATE/DELETE
2. **No Hash Chain:** Can't verify integrity
3. **No Time Travel:** Can't reconstruct deal state at specific timestamp
4. **Generic Schema:** Not optimized for deal lifecycle queries

**Database Schema - AuditLog** (line 1645):
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  tenantId  String
  userId    String?
  action    String
  resource  String
  details   Json
  createdAt DateTime @default(now())
}
```

### What's Missing for Compliance

**For automotive F&I compliance, we need:**
1. **Immutability:** Once written, never changed
2. **Hash Chain:** Cryptographic proof of tampering
3. **Complete History:** Every quote, counter, approval attempt
4. **Time Travel:** "Show me deal state on April 15 at 2:30pm"
5. **Version Lineage:** Clear parent-child relationships

### ✅ GOOD: DealVersion Exists

**DealVersion Model** (line 838):
```prisma
model DealVersion {
  id                  String
  dealId              String
  worksheetId         String
  snapshot            Json      // Captures full state
  grossBreakdown      Json?
  closeProbability    Decimal?
  approvalProbability Decimal?
  label               String?
  createdById         String
  createdAt           DateTime
}
```

**This is a good foundation but lacks:**
- Hash chain for tamper detection
- Link to previous version (prevHash)
- Immutable enforcement (no UPDATE/DELETE)

---

## 6. EXTERNAL INTEGRATIONS

### Twilio (SMS)
**File:** `apps/server/src/services/twilio.service.ts`
**Usage:** Customer communication, appointment reminders
**Risk Level:** Low (transactional, not critical path)

### SendGrid (Email)
**File:** `apps/server/src/services/sendgrid.service.ts`
**Usage:** Email templates, customer notifications
**Risk Level:** Low (async, queued)

### Stripe (Payments)
**Dependencies:** `stripe` package in package.json
**Usage:** Subscription billing (tenant level)
**Risk Level:** Medium (tenant billing critical)

---

## 7. ARCHITECTURE DIAGRAM (ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT FRONTEND (Vite)                       │
│                    TanStack Query + Zustand                     │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST + WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS BACKEND                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TENANT MIDDLEWARE (AsyncLocalStorage)                   │  │
│  │  ✅ Auto-injects tenantId on all Prisma operations      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ CRM Services │  │ Desk/F&I Svc │  │ Inventory Sv │         │
│  │              │  │              │  │              │         │
│  │ - Customer   │  │ - Desking    │  │ - Vehicle    │         │
│  │ - Lead       │  │ - Optimizer  │  │ - Appraisal  │         │
│  │ - Activity   │  │ - F&I        │  │ - Recon      │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            ▼                                      │
│         ┌──────────────────────────────────────┐                │
│         │   PRISMA CLIENT (with Middleware)    │                │
│         │   ⚠️ In-memory only, not durable   │                │
│         └──────────────────┬───────────────────┘                │
│                            │                                      │
│         ┌──────────────────┴───────────────────┐                │
│         │   IN-MEMORY EVENT BUS                │                │
│         │   ⚠️ No persistence (lost on crash) │                │
│         └──────────────────┬───────────────────┘                │
│                            │                                      │
│         ┌──────────────────┴───────────────────┐                │
│         │   DOMAIN EVENT HANDLERS              │                │
│         │   - inventory.integration.ts         │                │
│         │   - accounting.integration.ts        │                │
│         └──────────────────────────────────────┘                │
└────────────────────┬──────────────┬──────────────────────────────┘
                     │              │
        ┌────────────▼──────┐   ┌──▼─────────────┐
        │   PostgreSQL      │   │  ML SERVICE    │
        │   (Prisma)        │   │  (FastAPI)     │
        │                   │   │                │
        │  57 Models        │   │  ✅ Circuit    │
        │  54 w/ tenantId   │   │     Breaker   │
        │  ⚠️ No Outbox    │   │  ⚠️ 10s       │
        │                   │   │     Timeout   │
        └───────────────────┘   │  ⚠️ No Cache  │
                                └────────────────┘

EXTERNAL SERVICES:
  ├── Twilio (SMS)
  ├── SendGrid (Email)
  └── Stripe (Billing)
```

---

## 8. SECURITY ASSESSMENT

### ✅ STRENGTHS
1. **Tenant Isolation:** Automatic via middleware (no manual filtering needed)
2. **Password Hashing:** bcrypt used for user passwords
3. **Session Management:** Redis-backed sessions with TTL
4. **SQL Injection:** Protected by Prisma ORM

### ⚠️ AREAS FOR IMPROVEMENT
1. **Direct DB Access:** Bypasses tenant middleware (mitigate with RLS)
2. **ML Service Auth:** Token-based, but no token rotation visible
3. **Audit Trail:** Not tamper-proof (mutable AuditLog)
4. **Secret Management:** Uses .env files (consider vault in production)

---

## 9. PERFORMANCE OBSERVATIONS

### Database
- **Connection Pooling:** Default Prisma connection pool
- **Indexes:** Present on tenantId, foreign keys
- **N+1 Queries:** Likely exists (use Prisma query logging to identify)

### ML Service
- **Blocking Calls:** All ML calls are synchronous
- **No Caching:** Every request hits ML service
- **High Timeout:** 10 seconds blocks request thread

### Recommendations
1. Reduce ML timeout to 300ms
2. Add Redis cache for ML predictions (24h TTL)
3. Implement async job queue for non-critical ML calls
4. Profile with `node --inspect` to identify bottlenecks

---

## 10. CRITICAL NEXT STEPS (SPRINT PRIORITIES)

### SPRINT 1: GUARDRAILS (Highest Priority)
1. ✅ Add missing 36 models to `tenantScopedModels` set
2. ✅ Add tenantId to Signature model
3. ✅ Create Outbox table for durable event log
4. ✅ Implement outbox service
5. ✅ Add structured logging with traceId + tenantId

### SPRINT 2: F&I TRUTH (High Priority)
1. ✅ Create DealEvent model with hash chain
2. ✅ Implement immutable event append service
3. ✅ Create hash verification function
4. ✅ Implement time-travel getDealStateAt()
5. ✅ Refactor desking service to use events

### SPRINT 3: ML RESILIENCE (Medium Priority)
1. ✅ Create MLFeatureCache table
2. ✅ Reduce ML timeout to 300ms
3. ✅ Add caching layer with 24h TTL
4. ✅ Implement fallback heuristics
5. ✅ Add /health/ml endpoint

### SPRINT 4: PERFORMANCE (Low Priority, If Needed)
1. Benchmark current performance
2. Profile CPU-bound operations
3. Optimize hot paths
4. Consider Rust microservice if justified

---

## CONCLUSION

**Strengths:**
- Solid multi-tenancy foundation with AsyncLocalStorage
- Type-safe event system already in place
- ML service has basic resilience (circuit breaker, retry)
- 79 TypeScript files - well-organized codebase

**Critical Gaps:**
- 36 models not in tenant middleware scope
- No durable event storage (in-memory only)
- No immutable audit trail for compliance
- ML service too slow (10s timeout) and uncached

**Estimated Effort:**
- Sprint 1: 2-3 days (guardrails)
- Sprint 2: 3-4 days (event sourcing)
- Sprint 3: 2-3 days (ML resilience)
- Sprint 4: 2-3 days (performance) - OPTIONAL

**Risk Level:** MEDIUM
Main risk is data loss from in-memory event bus and lack of compliance-ready audit trail.

---

**Report Generated By:** Claude Code
**Next Action:** Execute Sprint 1 - Guardrails & Outbox Pattern

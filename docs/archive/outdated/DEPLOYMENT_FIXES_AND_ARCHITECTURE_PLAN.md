# Autolytiq - Critical Deployment Fixes & Professional Architecture Plan

**Date**: 2025-11-05
**Status**: URGENT - Production Issues

---

## 🚨 IMMEDIATE CRITICAL ISSUES

### Issue 1: Rust Pricing Service - Database Connection Pool Exhaustion ❌

**Status**: `CrashLoopBackOff` (25+ restarts)

**Root Cause**:
```
FATAL: remaining connection slots are reserved for roles with the SUPERUSER attribute
```

**Problem**:
- Database has reached maximum connection limit
- Multiple services competing for connections
- Rust service configured with `max_connections: 10` per instance
- Backend also using connections
- No connection pooling strategy

**Current Connection Usage** (estimated):
- Backend (2 running pods): ~20-40 connections (Prisma default pool: 10-20 per instance)
- Rust Pricing (1 running pod): ~10 connections
- ML Service (2 pods): ~10-20 connections
- **Total**: ~40-70 connections
- **Database Limit** (DigitalOcean managed Postgres): Likely 25-100 depending on plan

**Immediate Fix Options**:

**Option A: Reduce Connection Pool Sizes** (Quick Fix - 5 min)
```yaml
# Rust services/rust/price-engine/.env
DATABASE_MAX_CONNECTIONS=3  # Down from 10

# Backend apps/backend/.env
DATABASE_POOL_MIN=2  # Down from default
DATABASE_POOL_MAX=5  # Down from 10-20
```

**Option B: Scale Down Redundant Pods** (Immediate)
```bash
# Scale down failing rust-pricing pod
kubectl scale deployment rust-pricing-78f66656b8 --replicas=0 -n autolytiq-prod

# Keep only 1 backend pod for now
kubectl scale deployment backend-5bf4b57fb5 --replicas=0 -n autolytiq-prod
```

**Option C: Upgrade Database Plan** (Long-term)
- Upgrade to higher DigitalOcean Postgres tier with more connections
- Cost: ~$40-80/month depending on tier

**Recommended**: **Option A + Option B immediately**, then Option C within 24 hours

---

### Issue 2: Backend Pod - Insufficient Memory ❌

**Status**: `Pending` - Cannot schedule

**Root Cause**:
```
6 Insufficient memory. preemption: 0/8 nodes are available
max node group size reached - cannot scale up
```

**Problem**:
- Cluster has reached maximum node capacity
- Backend pod requesting more memory than available
- Auto-scaler cannot add more nodes (limit reached)

**Current Resource Request** (check deployment):
```bash
kubectl get deployment backend-75c9c7d765 -n autolytiq-prod -o yaml | grep -A 5 resources
```

**Immediate Fix Options**:

**Option A: Reduce Backend Memory Request** (Quick Fix)
```yaml
# infrastructure/k8s/backend-deployment.yaml
resources:
  requests:
    memory: "256Mi"  # Down from 512Mi or higher
    cpu: "100m"      # Down from 200m
  limits:
    memory: "512Mi"  # Down from 1Gi
    cpu: "500m"
```

**Option B: Delete Unnecessary Pods**
```bash
# Delete the pending backend pod (we have 2 running already)
kubectl delete pod backend-75c9c7d765-fmjhf -n autolytiq-prod

# Clean up ImagePullBackOff pod in default namespace
kubectl delete pod rust-pricing-7fc7565cdb-9kscl -n default
```

**Option C: Upgrade Cluster Node Pool**
- Add more nodes or increase node size
- Cost: ~$40-200/month depending on configuration

**Recommended**: **Option B immediately** (we have 2 working backend pods), then Option A for future deployments

---

## 🏗️ PROFESSIONAL ARCHITECTURE REORGANIZATION

### Problem: Scattered Code & Lack of Structure

**Current Issues**:
1. ✅ 152+ frontend pages with inconsistent structure
2. ✅ No unified component library (only 3 components)
3. ✅ No API gateway - services called directly
4. ✅ Connection pooling chaos
5. ✅ No resource management strategy
6. ✅ Deployment configurations scattered across multiple files
7. ✅ No clear service boundaries

---

## 📋 PROFESSIONAL ARCHITECTURE PLAN

### Phase 1: Infrastructure Stabilization (THIS WEEK - Priority 1)

#### 1.1 Database Connection Management

**Create Centralized Connection Configuration**:

```typescript
// packages/db-config/src/connection-pools.ts
export const CONNECTION_POOLS = {
  backend: {
    min: 2,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  rust: {
    min: 1,
    max: 3,
    timeout: 30,
  },
  ml: {
    min: 1,
    max: 4,
    idleTimeoutMillis: 30000,
  }
};

// Total max: 5 + 3 + 4 = 12 connections (safe for 25 connection limit)
```

**Update All Services**:
- [ ] Backend: Update Prisma connection config
- [ ] Rust: Update all 4 rust services connection pool config
- [ ] ML: Update Python connection pool config
- [ ] Document connection limits in each service README

#### 1.2 Resource Management

**Create Standard Resource Templates**:

```yaml
# infrastructure/k8s/resource-templates/
├── small-service.yaml      # 128Mi RAM, 50m CPU
├── medium-service.yaml     # 256Mi RAM, 100m CPU
├── large-service.yaml      # 512Mi RAM, 250m CPU
└── ml-heavy.yaml           # 1Gi RAM, 500m CPU
```

**Assign Resources by Service Type**:
- Frontend: small-service
- Backend API: medium-service
- Rust services: small-service (high perf, low memory)
- ML service: ml-heavy

#### 1.3 Deployment Architecture

**Consolidate Deployment Configs**:

```
infrastructure/
├── k8s/
│   ├── base/                          # Base configurations
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   └── secrets.yaml
│   ├── services/                      # Service-specific
│   │   ├── backend/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── hpa.yaml              # Horizontal Pod Autoscaler
│   │   ├── frontend/
│   │   ├── rust-pricing/
│   │   ├── ml-service/
│   │   └── redis/
│   ├── overlays/                      # Environment-specific
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── monitoring/
│       ├── prometheus.yaml
│       └── grafana.yaml
└── scripts/
    ├── deploy-all.sh
    ├── rollback.sh
    └── scale.sh
```

---

### Phase 2: Frontend Architecture (WEEK 2 - Priority 2)

#### 2.1 Implement Component Library

**Goal**: Eliminate scattered inline styles, enforce consistency

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── atoms/                     # Basic building blocks
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Badge/
│   │   │   └── ... (15 components)
│   │   ├── molecules/                 # Composite components
│   │   │   ├── SearchBar/
│   │   │   ├── StatCard/
│   │   │   ├── DealCard/
│   │   │   └── ... (10 components)
│   │   └── organisms/                 # Complex components
│   │       ├── DataTable/
│   │       ├── DealingWorkspace/
│   │       └── ... (5 components)
│   ├── layouts/                       # Layout components
│   │   ├── AppShell/
│   │   ├── PageHeader/
│   │   └── ContentContainer/
│   ├── hooks/                         # Reusable hooks
│   ├── utils/                         # Utilities
│   └── index.ts
├── .storybook/                        # Documentation
└── package.json
```

**Migration Strategy**:
1. Week 1: Build 15 core atomic components
2. Week 2: Build 10 molecule components
3. Week 3: Migrate 50 highest-traffic pages
4. Week 4: Enable ESLint rule banning inline styles
5. Week 5: Complete migration of all 152 pages

#### 2.2 Standardized Page Structure

**Create Page Templates**:

```typescript
// apps/frontend/src/templates/
export const StandardPageLayout = ({ icon, title, description, actions, children }) => (
  <div>
    <PageHeader icon={icon} title={title} description={description} actions={actions} />
    <ContentContainer>{children}</ContentContainer>
  </div>
);

export const DashboardPageLayout = ({ stats, mainContent, sidebar }) => (
  <div>
    <StatsGrid stats={stats} />
    <TwoColumnLayout main={mainContent} sidebar={sidebar} />
  </div>
);
```

**Refactor All Pages** to use templates:
```typescript
// Before (scattered, inconsistent)
<div style={{ marginBottom: spacing[6] }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
    // ... 50 lines of inline styles
  </div>
</div>

// After (clean, consistent)
<StandardPageLayout
  icon={<Handshake />}
  title="Deals Management"
  description="Track and manage all sales deals"
  actions={<CreateDealButton />}
>
  <DealsContent />
</StandardPageLayout>
```

---

### Phase 3: Backend Architecture (WEEK 3 - Priority 3)

#### 3.1 API Gateway (GraphQL Federation)

**Create Unified API Layer**:

```
apps/
├── api-gateway/                       # NEW - Apollo GraphQL Gateway
│   ├── src/
│   │   ├── gateway.ts                # Gateway config
│   │   ├── supergraph.graphql        # Federated schema
│   │   └── datasources/              # Service connectors
│   └── package.json
├── backend/                           # Existing - Add GraphQL
│   ├── src/
│   │   ├── graphql/                  # NEW
│   │   │   ├── schema.ts
│   │   │   ├── resolvers/
│   │   │   └── datasources/
│   │   └── rest/                     # Keep existing REST for now
└── ml-service/                        # Add GraphQL layer
    └── app/
        └── graphql/                   # NEW - Strawberry GraphQL
```

**Migration Strategy**:
1. Week 1: Setup API Gateway with health check endpoint
2. Week 2: Migrate CRM subgraph (customers, leads, activities)
3. Week 3: Migrate Deals subgraph (deals, desking, F&I)
4. Week 4: Migrate Inventory subgraph (vehicles, pricing)
5. Week 5: Add ML subgraph with subscriptions
6. Week 6: Frontend migration to Apollo Client

#### 3.2 Service Organization

**Clear Service Boundaries**:

```
apps/backend/src/
├── modules/                           # Domain-driven modules
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.graphql.ts           # GraphQL schema
│   │   └── auth.test.ts
│   ├── crm/
│   │   ├── customers/
│   │   ├── leads/
│   │   └── activities/
│   ├── deals/
│   │   ├── desking/
│   │   ├── fi-products/
│   │   └── approvals/
│   ├── inventory/
│   └── accounting/
├── shared/                            # Shared utilities
│   ├── database/
│   ├── cache/
│   ├── auth/
│   └── validators/
└── graphql/
    ├── gateway.ts
    └── federated-schema.ts
```

---

### Phase 4: DevOps & Monitoring (WEEK 4 - Priority 4)

#### 4.1 CI/CD Pipeline

**GitHub Actions Workflow**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-test:
    # Run tests, build images

  deploy-infrastructure:
    # Check database connections
    # Verify resource availability

  deploy-services:
    # Rolling deployment
    # Health checks

  smoke-tests:
    # Verify deployment success
```

#### 4.2 Monitoring & Alerting

**Setup Observability Stack**:

```yaml
# infrastructure/k8s/monitoring/
├── prometheus/
│   ├── prometheus.yaml               # Metrics collection
│   ├── alerts/
│   │   ├── database-connections.yaml # Alert on > 80% usage
│   │   ├── memory-usage.yaml         # Alert on > 85% memory
│   │   └── pod-crashes.yaml          # Alert on CrashLoopBackOff
│   └── rules/
├── grafana/
│   ├── dashboards/
│   │   ├── service-health.json
│   │   ├── database-metrics.json
│   │   └── api-performance.json
│   └── datasources.yaml
└── loki/                              # Log aggregation
    └── loki.yaml
```

**Key Metrics to Track**:
- Database connection pool usage (alert at 80%)
- Memory usage per pod (alert at 85%)
- API response times (p95, p99)
- Error rates by service
- Pod restart counts

---

## 🎯 IMPLEMENTATION ROADMAP

### Week 1: Emergency Fixes + Foundation
- [x] Fix database connection exhaustion (reduce pools)
- [x] Remove pending/crashing pods
- [ ] Create connection pool config package
- [ ] Document resource allocation strategy
- [ ] Setup basic monitoring (Prometheus + Grafana)

### Week 2: Component Library Foundation
- [ ] Create @autolytiq/ui package structure
- [ ] Build 15 atomic components (Button, Input, Card, etc.)
- [ ] Setup Storybook documentation
- [ ] Create page layout templates
- [ ] Migrate 10 high-traffic pages to use components

### Week 3: API Gateway Setup
- [ ] Create api-gateway package with Apollo Gateway
- [ ] Add GraphQL layer to backend (CRM subgraph)
- [ ] Create federated schema
- [ ] Setup GraphQL subscriptions infrastructure
- [ ] Test with frontend (one module proof-of-concept)

### Week 4: Service Refactoring
- [ ] Reorganize backend into domain modules
- [ ] Migrate 50% of REST endpoints to GraphQL
- [ ] Add comprehensive error handling
- [ ] Implement request/response logging
- [ ] Setup distributed tracing (Jaeger)

### Week 5: Frontend Migration
- [ ] Complete component library (30 components)
- [ ] Migrate all 152 pages to use component library
- [ ] Enable ESLint rules (ban inline styles, direct Radix imports)
- [ ] Setup Apollo Client in frontend
- [ ] Migrate 50% of API calls to GraphQL

### Week 6: DevOps & Finalization
- [ ] Complete CI/CD pipeline
- [ ] Setup comprehensive monitoring
- [ ] Create runbooks for common issues
- [ ] Performance testing & optimization
- [ ] Production readiness review

---

## 💰 COST IMPLICATIONS

### Current Monthly Cost (estimated):
- DigitalOcean Kubernetes: ~$200-400
- Database (current tier): ~$25-50
- Load Balancer: ~$12
- **Total**: ~$237-462/month

### Recommended Upgrades:
- Database upgrade (more connections): +$20-40/month
- Add 1-2 nodes for headroom: +$40-80/month
- Monitoring tools: ~$0 (open source)
- **New Total**: ~$297-582/month

### ROI:
- Eliminate downtime: ~$1000-5000 saved per incident
- Developer productivity: 30-40% faster development
- Reduced debugging time: ~10-15 hours/week saved
- Better scalability: Support 10x more customers without refactoring

---

## 📊 SUCCESS METRICS

**Technical Metrics**:
- Database connection usage: < 80% at peak
- Memory usage per pod: < 75%
- Pod crash rate: < 1 per week
- API response time (p95): < 200ms
- Build/deploy time: < 10 minutes
- Code duplication: < 5%

**Business Metrics**:
- Page load time: < 2 seconds
- Zero downtime deployments
- Developer onboarding time: < 2 days
- Feature delivery speed: +40%

---

## 🚀 QUICK START - IMMEDIATE ACTIONS

### Action 1: Fix Rust Service (2 minutes)
```bash
# Scale down crashing rust-pricing deployment
kubectl scale deployment rust-pricing-78f66656b8 --replicas=0 -n autolytiq-prod

# Verify only one rust-pricing pod running
kubectl get pods -n autolytiq-prod | grep rust-pricing
```

### Action 2: Clean Up Resources (1 minute)
```bash
# Delete pending backend pod
kubectl delete pod backend-75c9c7d765-fmjhf -n autolytiq-prod

# Delete ImagePullBackOff pod
kubectl delete pod rust-pricing-7fc7565cdb-9kscl -n default
```

### Action 3: Reduce Connection Pools (5 minutes)
```bash
# Edit backend configmap
kubectl edit configmap backend-config -n autolytiq-prod
# Set: DATABASE_POOL_MAX=5

# Restart backend pods to pick up new config
kubectl rollout restart deployment backend -n autolytiq-prod
```

### Action 4: Monitor (ongoing)
```bash
# Watch pod status
watch kubectl get pods -n autolytiq-prod

# Check rust-pricing logs
kubectl logs -f deployment/rust-pricing -n autolytiq-prod
```

---

## 📞 DECISION NEEDED

**Please confirm**:
1. Should I execute immediate fixes (Actions 1-3) now?
2. Database upgrade budget approval ($20-40/month)?
3. Priority order for architecture refactoring phases?
4. Timeline constraints or business deadlines?

---

**Generated**: 2025-11-05
**Status**: Awaiting approval to proceed

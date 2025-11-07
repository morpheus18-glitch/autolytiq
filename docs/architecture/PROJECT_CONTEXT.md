# Autolytiq - Project Context & Workspace Guide

**Generated**: 2025-11-06  
**Purpose**: Repository spine and shared mental model  
**Audience**: All developers working in the monorepo

---

## 🏗️ Workspace Architecture

### Repository Layout

```
autolytiq/
├── apps/
│   ├── frontend/          # React SPA (Vite + React Router 6)
│   ├── backend/           # Express.js REST API
│   ├── ml_backend/        # Python ML services (FastAPI)
│   ├── pricing-rust/      # Standalone Rust pricing (legacy?)
│   └── worker/            # Background job processor
│
├── packages/
│   ├── ui/                # Shared component library (@repo/ui)
│   ├── tokens/            # Design tokens (@repo/tokens)
│   ├── db/                # Prisma schema + migrations (@repo/db)
│   ├── shared/            # Shared utilities (@repo/shared)
│   └── domain/            # ⚠️  MISSING - Should contain business logic
│
├── services/
│   ├── rust/              # Rust microservices workspace
│   │   ├── price-engine/  # Real-time pricing calculations
│   │   ├── comm-service/  # Communications orchestration
│   │   ├── cache-service/ # Distributed caching
│   │   ├── rate-limiter/  # API rate limiting
│   │   └── shared/        # Shared Rust libraries
│   └── rust-pricing/      # Legacy? (duplicate?)
│
├── ml_service/            # Python ML models (FastAPI)
│
├── infrastructure/
│   ├── k8s/               # Kubernetes manifests
│   ├── docker/            # Docker configs
│   └── monitoring/        # Grafana/Prometheus
│
└── .github/workflows/     # CI/CD pipelines
```

### Technology Stack

**Frontend**:
- React 18.3 + Vite 5.4
- React Router 6 (nested routing)
- TanStack Query 5 (server state)
- Tailwind CSS 3.4 + CVA
- Design tokens from @repo/tokens

**Backend**:
- Express.js 4.21 (TypeScript)
- Prisma 5.22 ORM
- PostgreSQL (DigitalOcean Managed)
- Redis (DigitalOcean Managed)
- BullMQ (job queue)
- Socket.IO 4.8 (WebSocket)

**Rust Services**:
- Tonic (gRPC)
- Tokio (async runtime)
- Diesel (ORM - if database access)
- Tower (middleware)

**ML Services**:
- Python 3.11
- FastAPI
- scikit-learn
- Celery (task queue)

**Infrastructure**:
- DigitalOcean Kubernetes (DOKS)
- DO Container Registry (DOCR)
- DO Managed Postgres
- DO Managed Redis
- GitHub Actions (CI/CD)

---

## ⚖️ Golden Rules

### 1. Component Placement
**Rule**: Reusable UI → `packages/ui`; app-specific → `apps/frontend`

**Examples**:
```
✅ PROMOTE to packages/ui:
- Button, Input, Card (generic primitives)
- VehicleCard, CustomerCard (domain entities)
- ListDetailLayout, PageHeader (layout patterns)
- UniformShell (navigation wrapper)

❌ KEEP in apps/frontend:
- AppShell (navigation config)
- DealStudioDesktop (specific workflow)
- AccountingDashboard (page composition)
- QuickViewContext (app-specific state)
```

### 2. API Layer Abstraction
**Rule**: No direct API calls from UI; use `@repo/domain` adapters

**Current State**: ❌ Direct fetch/axios in components  
**Target State**: ✅ `@repo/domain/vehicle/api.ts`, `@repo/domain/customer/api.ts`

```typescript
// ❌ BAD - Direct API call in component
const response = await fetch('/api/vehicles');

// ✅ GOOD - Use domain adapter
import { getVehicles } from '@repo/domain/vehicle/api';
const vehicles = await getVehicles({ status: 'active' });
```

### 3. VIN Decode Centralization
**Rule**: VIN decode logic → `@repo/domain/vehicle/vin.ts`; never duplicate

**Current State**: Multiple VIN decode implementations found  
**Action Required**: Consolidate to single source of truth

```typescript
// @repo/domain/vehicle/vin.ts
export function decodeVIN(vin: string): Promise<VehicleData>;
export function validateVIN(vin: string): boolean;
export function useVINDecoder(): { decode, loading, error };

// Import everywhere else
import { useVINDecoder } from '@repo/domain/vehicle/vin';
```

**Hook Location**: `apps/frontend/src/hooks/useVINDecoder.ts` (PROMOTE to domain)

### 4. Instant Calculations
**Rule**: Debounce to Rust pricing service; no 'Calculate' button

**Pattern**:
```typescript
import { useDebouncedValue } from '@repo/ui/hooks';
import { calculatePayment } from '@repo/domain/pricing/api';

const [params, setParams] = useState(initialParams);
const debouncedParams = useDebouncedValue(params, 300); // 300ms debounce

const { data: payment } = useQuery({
  queryKey: ['payment', debouncedParams],
  queryFn: () => calculatePayment(debouncedParams),
  enabled: !!debouncedParams
});
```

**Rust Service**: `services/rust/price-engine` (Port 50051, gRPC)

### 5. PII Protection
**Rule**: Enforce in UI (Redacted/PermissionGate) AND API; never render restricted fields to DOM

**UI Components**:
```typescript
import { Redacted, PermissionGate } from '@repo/ui/security';

<Redacted field="ssn" permission="view_pii">
  {customer.ssn}
</Redacted>

<PermissionGate requires="view_financial">
  <CreditScore score={customer.creditScore} />
</PermissionGate>
```

**API Middleware**: `apps/backend/src/middleware/pii-filter.ts`

### 6. Build Order
**Rule**: CI builds packages first (tokens → shared → ui) then apps

**Dependency Graph**:
```
@repo/tokens (no deps)
    ↓
@repo/shared (uses tokens)
    ↓
@repo/ui (uses tokens + shared)
    ↓
@repo/domain (uses ui + shared)
    ↓
apps/frontend (uses all packages)
```

**Docker Multi-Stage**:
```dockerfile
# Build packages in order
RUN pnpm --filter @repo/tokens build
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/ui build
RUN pnpm --filter @repo/domain build  # When created

# Then build app
RUN pnpm --filter @repo/frontend build
```

---

## 📦 Package Purposes

### @repo/ui (packages/ui)
**Purpose**: Reusable UI components + hooks  
**Exports**:
- Primitives: Button, Input, Card, Badge, Table
- Layouts: PageHeader, PageContainer, ResponsiveGrid
- Mobile: MobileCard, ResponsiveButton, BottomNav
- Hooks: useBreakpoint, useMobileBreakpoint
- Utils: cn (tailwind-merge wrapper)

**Current State**: 54 components, needs ~30 more promoted

### @repo/tokens (packages/tokens)
**Purpose**: Design system tokens (colors, typography, spacing)  
**Exports**:
- CSS: dist/tokens.css (CSS custom properties)
- TS: dist/index.ts (typed token values)
- Tailwind: dist/tailwind.preset.cjs

**Build**: `pnpm tokens:build` (generates from scripts/build-tokens.ts)

### @repo/db (packages/db)
**Purpose**: Prisma schema + migrations  
**Location**: `packages/db/schema.prisma`  
**Models**: 80+ (Customer, Vehicle, Deal, Lead, etc.)  
**Migrations**: `packages/db/migrations/`

**Commands**:
```bash
pnpm --filter @repo/db prisma migrate dev --name <name>
pnpm --filter @repo/db prisma generate
pnpm --filter @repo/db prisma studio
```

### @repo/shared (packages/shared)
**Purpose**: Cross-platform utilities  
**Exports**:
- Types: shared TypeScript interfaces
- Validators: Zod schemas
- Constants: environment configs
- Utils: date formatting, currency, etc.

### @repo/domain (packages/domain) ⚠️  TO CREATE
**Purpose**: Business logic layer (API adapters, hooks, validators)  
**Planned Structure**:
```
packages/domain/
├── src/
│   ├── vehicle/
│   │   ├── api.ts          # getVehicles, createVehicle
│   │   ├── vin.ts          # VIN decode/validate
│   │   ├── hooks.ts        # useVehicles, useVehicle
│   │   └── types.ts        # Vehicle interfaces
│   ├── customer/
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── deal/
│   ├── pricing/
│   │   ├── api.ts          # calculatePayment (Rust client)
│   │   └── hooks.ts
│   └── index.ts
```

---

## 🔌 Service Communication

### Frontend → Backend API
**Protocol**: REST (HTTP)  
**Base URL**: `https://api.autolytiq.com` (production)  
**Auth**: JWT (RS256) in Authorization header  
**Pattern**: TanStack Query via @repo/domain adapters

### Backend → Rust Services
**Protocol**: gRPC  
**Services**:
- Price Engine: `localhost:50051` (or k8s service name)
- Comm Service: `localhost:50052`
- Cache Service: `localhost:50053`
- Rate Limiter: `localhost:50054`

**Client**: `@grpc/grpc-js` (Node.js gRPC client)

### Backend → ML Service
**Protocol**: HTTP (REST)  
**Endpoint**: `http://ml-service:8000` (k8s internal)  
**Usage**: Deal optimization, approval prediction

### Real-Time (Frontend ↔ Backend)
**Protocol**: Socket.IO (WebSocket)  
**Path**: `/ws/notifications`  
**Events**: notifications, deal_updates, messages

---

## 🗄️ Data Layer

### PostgreSQL (DigitalOcean Managed)
**Connection**: Via Prisma  
**Pool Size**: 20 (production)  
**Schema**: `packages/db/schema.prisma`  
**Migrations**: Managed by Prisma Migrate  
**Seed**: `packages/db/seed/`

**Multitenancy**: All models have `tenantId` field (RLS enforced in middleware)

### Redis (DigitalOcean Managed)
**Usage**:
- Session storage
- Cache layer
- BullMQ job queue
- Rate limiting

**Client**: ioredis  
**Pattern**: Single client factory (TO BE CREATED in @repo/shared)

### File Storage
**Provider**: AWS S3 or DigitalOcean Spaces  
**Usage**: Vehicle images, documents, exports  
**SDK**: `@aws-sdk/client-s3`

---

## 🚀 Deployment Architecture

### Production Environment

**Platform**: DigitalOcean Kubernetes (DOKS)  
**Namespace**: `autolytiq-prod`  
**Registry**: registry.digitalocean.com/autolytiq/*

**Services**:
```
frontend:          registry.digitalocean.com/autolytiq/frontend:${SHA}
backend:           registry.digitalocean.com/autolytiq/backend:${SHA}
price-engine:      registry.digitalocean.com/autolytiq/price-engine:${SHA}
comm-service:      registry.digitalocean.com/autolytiq/comm-service:${SHA}
cache-service:     registry.digitalocean.com/autolytiq/cache-service:${SHA}
rate-limiter:      registry.digitalocean.com/autolytiq/rate-limiter:${SHA}
ml-service:        registry.digitalocean.com/autolytiq/ml-service:${SHA}
```

**Managed Services**:
- Postgres: `autolytiq-prod-db` (connection string in secret)
- Redis: `autolytiq-prod-redis` (connection string in secret)

**Ingress**: nginx-ingress controller  
**TLS**: Let's Encrypt (cert-manager)  
**DNS**: autolytiq.com, api.autolytiq.com

### CI/CD Pipeline

**GitHub Actions** (6 workflows detected):
1. `.github/workflows/frontend.yml` - Frontend build + deploy
2. `.github/workflows/backend.yml` - Backend build + deploy
3. `.github/workflows/rust.yml` - Rust services
4. `.github/workflows/ml.yml` - ML service
5. `.github/workflows/rust-comm-service.yml` - Comm service
6. `.github/workflows/redis.yml` - Redis (?)

**Triggers**: Push to main, PR to main  
**Strategy**: Build → Test → Push to DOCR → Deploy to K8s

---

## 📊 Current State Assessment

### ✅ Working Well
- React Router 6 migration complete
- Design tokens system mature
- Mobile-first components library started
- Docker multi-stage builds working
- Prisma schema comprehensive (80+ models)
- Multitenancy fully implemented

### ⚠️  Needs Attention
- **No @repo/domain package** - API calls scattered in components
- **VIN decode duplication** - Multiple implementations
- **Component library incomplete** - Only 54/~80 components in package
- **No unified error handling** - Inconsistent patterns
- **Redis client scattered** - No single factory
- **CI workflow gaps** - Missing pnpm cache, build order

### 🔴 Critical Issues
- **PII protection incomplete** - No UI enforcement layer
- **No API gateway** - Frontend calls microservices directly
- **Performance monitoring missing** - No Web Vitals tracking
- **E2E tests missing** - No Playwright setup
- **Documentation gaps** - Missing API docs, runbooks

---

## 📝 File Counts (as of 2025-11-06)

| Category | Count |
|----------|-------|
| Frontend components | 197 |
| Frontend pages | 151 |
| UI package components | 54 |
| Hooks | 18 |
| Contexts | 3 |
| Prisma models | 80+ |
| Rust services | 4 |
| Dockerfiles | 9 |
| CI workflows | 6 |

---

## 🎯 Next Actions

1. **Create @repo/domain package** - Business logic layer
2. **Consolidate VIN decode** - Single source of truth
3. **Promote components** - Move 30+ to @repo/ui
4. **Unified Redis client** - Factory in @repo/shared
5. **Complete CI workflows** - Add missing steps
6. **Add PII protection** - UI components + middleware
7. **API documentation** - OpenAPI/Swagger
8. **E2E test suite** - Playwright setup

---

**See Also**:
- COMPONENT_MIGRATION_PLAN.md - What to promote
- CI_PIPELINE_PLAN.md - CI workflow improvements
- K8S_READINESS.md - Deployment commands
- DB_SCHEMA_AUDIT.md - Database status


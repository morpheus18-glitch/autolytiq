# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

AutolytiQ is an end-to-end retail automotive platform (CRM, desking, F&I, analytics, ML operations). The repository is a **pnpm monorepo** organized with TypeScript apps, shared packages, Python ML services, Rust microservices, and Kubernetes deployment tooling.

**Critical**: Read `AGENTS.md` for engineering standards and workflow requirements before making changes.

## Essential Commands

### Development

```bash
# Install dependencies (runs postinstall hook to generate Prisma client)
pnpm install

# Run full stack locally (backend + frontend in parallel)
pnpm dev

# Run services individually
pnpm dev:server        # Backend only on http://localhost:5000
pnpm dev:client        # Frontend only (Vite dev server)
pnpm dev:sandbox       # Experimental frontend sandbox

# Database operations
pnpm db:generate       # Generate Prisma client (required after schema changes)
pnpm db:migrate:dev    # Create and apply migration in development
pnpm db:migrate:deploy # Apply migrations in production (safe, no prompts)
pnpm db:push           # Sync schema without migration (dev only, destructive)
pnpm db:seed           # Seed baseline tenant + sample data
```

### Quality & Testing

```bash
# Type-checking (entire monorepo)
pnpm typecheck

# Linting (all packages except frontend)
pnpm lint

# Frontend-specific lint
pnpm --filter @repo/frontend lint

# Unit tests (all packages)
pnpm test

# Backend tests only
pnpm --filter @repo/backend test

# E2E tests (requires Playwright setup)
pnpm test:e2e

# Full CI pipeline (matches CI environment)
pnpm ci  # db:generate → typecheck → lint → test → build
```

### Building

```bash
# Build all packages (production)
pnpm build

# Build specific packages
pnpm --filter @repo/backend build
pnpm --filter @repo/frontend build
pnpm --filter @repo/shared build
pnpm --filter @repo/tokens build

# Build frontend with design tokens (tokens are built automatically via prebuild hook)
pnpm build:client

# Build static frontend into backend/public for single-server deployment
pnpm build:client:static
```

### Rust Services

```bash
# Build all Rust services
cd services/rust && cargo build

# Run specific service
cargo run --bin price-engine

# Run tests
cargo test

# Docker build for Rust services
docker build --build-arg SERVICE_NAME=price-engine -t price-engine:latest services/rust/
```

### Deployment

```bash
# Local Docker Compose deployment
pnpm deploy:local
# OR
./scripts/quick-deploy.sh

# Production Kubernetes deployment
pnpm deploy:production
# OR
./scripts/deploy-production.sh

# VPS/Droplet deployment
pnpm deploy:droplet
# OR
./scripts/deploy-to-droplet.sh YOUR_IP

# Preflight checks
pnpm preflight              # Local environment check
pnpm preflight:production   # Production readiness check

# Health checks
pnpm health:check
pnpm validate:deployment
```

### Mandatory Changelog

**IMPORTANT**: After staging changes but before committing, always run:

```bash
pnpm changelog:update "Brief description of changes"
```

This is enforced by the team workflow (see `AGENTS.md` §6).

### Documentation File Organization Rule

**CRITICAL**: All `.md` files MUST be stored in the `docs/` directory hierarchy:

```
✅ CORRECT:
docs/specs/FEATURE_NAME.md
docs/ui/COMPONENT_GUIDE.md
docs/architecture/DESIGN.md
docs/deployment/GUIDE.md
README.md (root level only)

❌ INCORRECT:
ROOT_LEVEL_DOC.md (except README.md)
apps/backend/NOTES.md
packages/ui/RANDOM.md
```

**Enforcement**:
- **ONLY** `README.md` is allowed at repository root
- All other markdown files → `docs/` with appropriate subdirectories:
  - `docs/specs/` - Feature specifications
  - `docs/ui/` - Component library & UI documentation
  - `docs/architecture/` - System design & architecture
  - `docs/deployment/` - Deployment & operations
  - `docs/guides/` - How-to guides & troubleshooting
  - `docs/features/` - Feature documentation
  - `docs/operations/` - Runbooks & procedures
- Package-specific READMEs (e.g., `packages/db/seed/README.md`) are allowed
- App-specific READMEs (e.g., `apps/frontend/README.md`) are allowed

**Pre-commit check**: `scripts/check-markdown-location.sh` validates this rule.

## Architecture Overview

### Monorepo Structure

```
apps/
  backend/           # Express + Socket.IO API (TypeScript)
    src/
      index.ts       # Entry point, bootstraps HTTP server + WebSockets
      server.ts      # Express app factory, middleware registration
      routes/        # Route handlers (authenticate → tenantScope → handlers)
      services/      # Business logic (lead routing, automation, desking, ML integration)
      middleware/    # Auth, RBAC, tenant scoping, context initialization
      lib/           # Utilities (errors, logger, Prisma client, socket helpers)
      config/        # Environment variables, scoring config watchers
      integrations/  # Domain integrations (email, SMS, external APIs)
      validations/   # Zod schemas for runtime input validation

  frontend/          # Production React 18 + Vite SPA
    src/
      main.tsx       # React root
      App.tsx        # App entry
      components/    # Reusable UI components (shadcn/ui primitives)
      pages/         # Page-level components
      routes/        # Routing configuration (wouter)
      hooks/         # Custom React hooks
      lib/           # Frontend utilities, API clients, query keys
      stores/        # State management (Zustand)
      contexts/      # React contexts
      features/      # Feature-specific modules
    tailwind.config.js  # MOBILE-FIRST Tailwind configuration with design tokens

  frontend-dev/      # Experimental sandbox UI (DO NOT DEPLOY)

  ml_backend/        # Python offline training pipelines + data engineering

  pricing-rust/      # Rust gRPC pricing microservice (see below)

  worker/            # Node.js background workers with BullMQ

packages/
  db/                # Prisma schema, migrations, seed scripts
    schema.prisma    # Multi-tenant database schema (Tenant model + RLS patterns)

  shared/            # TypeScript types/utilities shared across apps
    src/index.ts     # Centralized export point (update when adding modules)

  tokens/            # Design tokens compiled with tsup
    src/index.ts     # MOBILE-FIRST design tokens (mobile → tablet → desktop padding)
    # Must be rebuilt before frontend builds when tokens change

ml_service/          # FastAPI + Celery for real-time ML inference
  app/
    main.py          # FastAPI app with scoring endpoints
    services/        # ML models (close predictor, approval predictor, deal optimizer)
    routers/         # API routes
  workers/           # Celery workers for async ML tasks

services/rust/       # High-performance Rust microservices
  price-engine/      # Port 50051 - Market pricing & gross profit calculations (25-35x faster than Node.js)
  comm-service/      # Port 50052 - Communication layer with idempotency, retries, circuit breaker
  cache-service/     # Port 50053 - Multi-level caching (LRU + Redis) [Stub]
  rate-limiter/      # Port 50054 - Token bucket rate limiting per tenant [Stub]
  shared/            # Shared Rust utilities and types
  README.md          # Detailed Rust services documentation

infrastructure/      # Docker, Kubernetes manifests, Terraform
  docker/
    Dockerfile.backend    # Multi-stage Node build
    Dockerfile.frontend   # NGINX static serving
    Dockerfile.ml         # Python ML service

scripts/             # Deployment automation, migrations, health checks
```

### Key Architectural Patterns

#### Rust Microservices Architecture

**Performance-Critical Services**: Rust services handle high-throughput, low-latency operations:

- **PriceEngine (Port 50051)**: Market data analysis, competitive pricing, gross profit calculations (front-end, finance reserve, back-end), payment amortization with DTI/PTI ratios, markdown suggestions based on vehicle aging. **Performance**: 25-35x faster than Node.js, handles 100k+ concurrent requests, ~15MB memory vs ~150MB for Node.js equivalent.

- **CommService (Port 50052)**: Communication reliability layer with idempotent request handling (24h cache), exponential backoff retry logic, circuit breaker pattern, request deduplication.

- **Integration Pattern**: Node.js backend orchestrates business logic and calls Rust services via gRPC for performance-critical operations.

```
Node.js Backend (Port 5000)
    ↓ gRPC
Rust PriceEngine (Port 50051) + CommService (Port 50052)
    ↓ Direct DB Access
PostgreSQL + Redis
```

See `services/rust/README.md` and `services/rust/ARCHITECTURE.md` for detailed documentation.

#### Multi-Tenancy
- **Tenant scoping**: All API routes require `x-tenant-id` header or authenticated user's `tenantId`
- **Middleware chain**: `authenticate` → `tenantScope` → route handlers
- **Prisma tenant context**: `apps/backend/src/middleware/tenant.ts` uses `tenantContext.run()` for scoped queries
- **Database**: Tenant is the root isolation model in `packages/db/schema.prisma`

#### Authentication & Authorization
- **Authentication**: JWT-based, enforced via `apps/backend/src/middleware/auth.ts`
- **RBAC**: Role-based access control in `apps/backend/src/middleware/rbac.ts`
- **Roles**: Defined in `apps/backend/src/types/roles.ts` (e.g., ADMIN, BDC, SALES, FINANCE)
- **Protected routes**: Chain `authenticate`, `tenantScope`, and optionally `requireRole(...roles)`

#### Frontend Architecture - MOBILE-FIRST DESIGN

**CRITICAL**: All UI components and themes MUST follow a mobile-first approach.

- **Component library**: shadcn/ui (Radix primitives + Tailwind)
- **Routing**: wouter (lightweight React router)
- **State**: TanStack Query for server state, Zustand for client state
- **Styling**: Tailwind CSS with design tokens from `@repo/tokens`
- **MOBILE-FIRST**: Design tokens define responsive padding (mobile: 1rem, tablet: 1.5rem, desktop: 2rem)
- **Tailwind config**: Uses mobile-first breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- **Responsive patterns**:
  - Default styles target mobile devices
  - Use `md:`, `lg:`, `xl:` prefixes for larger screens
  - Container padding scales from `designTokens.layout.container.padding.mobile` upward
  - Test all components on mobile viewports first
- **Vite aliases**: `@/` → `src/`, `@shared/schema`, `@shared/settings-schema`
- **Build**: Design tokens auto-rebuild via `prebuild` hook before frontend builds

**Design Token Philosophy** (from `packages/tokens/src/index.ts`):
- Clarity over decoration
- Consistency over creativity
- Data density with breathing room
- Professional, trustworthy, premium
- **MOBILE-FIRST RESPONSIVE SCALING**

#### Backend Architecture
- **Framework**: Express.js with TypeScript (ESM modules)
- **WebSockets**: Socket.IO for real-time CRM events (lead updates, notifications)
- **Database**: Prisma ORM with PostgreSQL (async-local-storage for tenant context)
- **Background jobs**: BullMQ with Redis for async processing
- **Error handling**: Centralized in `apps/backend/src/lib/errors.ts` + HTTP response helpers
- **Validation**: Zod schemas in `apps/backend/src/validations/`
- **Services**: Business logic isolated in `apps/backend/src/services/`
- **Rust integration**: Calls Rust microservices via gRPC for performance-critical operations

#### ML Services
- **Python stack**: FastAPI (REST API) + Celery (async workers) + scikit-learn/LightGBM
- **Scoring models**: Close probability, approval prediction, deal optimization, counter-offer analysis
- **Integration**: Backend calls ML service via HTTP (`apps/backend/src/services/approvalPredictor.service.ts`, etc.)
- **Token authentication**: `ML_SERVICE_TOKEN` environment variable

### Environment Configuration

**Root `.env` file** is required. Use templates:
- `.env.example` – local development
- `.env.selfhost.example` – Docker Compose
- `.env.digitalocean.example` – production Kubernetes

**Key environment variables** (see `apps/backend/src/config/env.ts`):
- `DATABASE_URL` – PostgreSQL connection string
- `DIRECT_URL` – Direct PostgreSQL URL (for migrations)
- `REDIS_URL` – Redis connection string
- `JWT_SECRET` – JWT signing secret
- `SESSION_SECRET` – Express session secret
- `ML_SERVICE_URL` – Python ML service endpoint
- `ML_SERVICE_TOKEN` – ML service authentication
- `PRICE_ENGINE_URL` – Rust price engine gRPC endpoint (e.g., `http://localhost:50051`)
- `COMM_SERVICE_URL` – Rust communication service gRPC endpoint (e.g., `http://localhost:50052`)

Generate secrets:
```bash
openssl rand -base64 32  # SESSION_SECRET
openssl rand -base64 64  # JWT_SECRET
openssl rand -hex 32     # CREDIT_ENCRYPTION_KEY
```

### Database Workflow

1. **Edit schema**: Modify `packages/db/schema.prisma`
2. **Generate client**: Run `pnpm db:generate` (updates `@prisma/client`)
3. **Create migration**: Run `pnpm db:migrate:dev` (creates SQL migration + applies)
4. **Commit**: Commit both schema and generated migration files
5. **Production**: Deploy with `pnpm db:migrate:deploy` (no interactive prompts)

**Important**: Always run `pnpm db:generate` after pulling schema changes. The `postinstall` hook runs this automatically.

### Testing Strategy

- **Unit tests**: Vitest (each package has `test` script)
- **E2E tests**: Playwright (`pnpm test:e2e`)
- **Backend tests**: `apps/backend/src/**/*.test.ts` with Vitest
- **Deployment tests**: `tests/deployment.test.ts` for infrastructure validation
- **Rust tests**: `cargo test` in `services/rust/`

When adding features:
1. Write or update unit tests in the same package
2. Ensure `pnpm test` passes before committing
3. Add E2E tests for critical user flows
4. Test mobile-first responsiveness on actual mobile devices

## Development Workflow

### Making Changes

1. **Pull latest**: Always run `git pull origin main` before starting work
2. **Understand context**: Read relevant files in `docs/` and service directories
3. **Plan**: Use TodoWrite tool to track multi-step tasks
4. **Implement**: Follow coding standards in `AGENTS.md` §3
5. **Test**: Run targeted tests (`pnpm --filter <package> test`)
6. **Type-check**: Run `pnpm typecheck`
7. **Update changelog**: Run `pnpm changelog:update "Description"`
8. **Commit**: Stage and commit changes

### Adding Dependencies

```bash
# Workspace root
pnpm add <package> -w

# Specific app/package
pnpm add <package> --filter @repo/backend
pnpm add <package> --filter @repo/frontend

# Dev dependencies
pnpm add -D <package> --filter @repo/backend

# Rust dependencies
cd services/rust && cargo add <crate>
```

### Working with Shared Packages

When editing `packages/shared`:
1. Make changes to `packages/shared/src/**`
2. Update exports in `packages/shared/src/index.ts`
3. Run `pnpm --filter @repo/shared build`
4. Dependent apps will pick up changes (watch mode auto-rebuilds)

When editing `packages/tokens`:
1. Make changes to token definitions (maintain mobile-first padding values)
2. Run `pnpm --filter @repo/tokens build`
3. Frontend builds will include updated tokens (prebuild hook handles this)
4. **Verify mobile-first responsive behavior** after token changes

### Mobile-First Development Checklist

When creating or modifying UI components:
- ✅ Start with mobile viewport (320px-640px)
- ✅ Use base styles for mobile, add `md:`, `lg:`, `xl:` breakpoints for larger screens
- ✅ Test touch targets (minimum 44px for interactive elements)
- ✅ Use container padding from design tokens (mobile: 1rem, tablet: 1.5rem, desktop: 2rem)
- ✅ Ensure text is readable without zooming (minimum 16px font size)
- ✅ Test on actual mobile devices, not just browser DevTools
- ✅ Verify sidebars/menus work on mobile (drawer/sheet pattern)
- ✅ Check that tables are responsive (consider horizontal scroll or card layout on mobile)

### Security Checklist

Before committing code that touches auth, data, or external I/O:
- ✅ Routes wrapped with `authenticate` middleware
- ✅ Authorization enforced via `requireRole()` or tenant scoping
- ✅ Input validated with Zod schemas (never trust user input)
- ✅ Sensitive data encrypted/hashed (bcrypt for passwords)
- ✅ Audit logging via `apps/backend/src/services/audit-log.service.ts` where required
- ✅ Frontend uses typed API clients from `src/lib/api/` (preserves headers, CSRF)

### Common Pitfalls

- **Don't skip `pnpm db:generate`**: Always run after pulling schema changes or switching branches
- **Don't use npm/yarn**: This is a pnpm workspace; mixed package managers break lockfile
- **Don't edit generated files**: Prisma client, compiled tokens are auto-generated
- **Don't bypass middleware**: Always chain `authenticate` → `tenantScope` for protected routes
- **Don't access `window` at module scope**: Check `typeof window !== 'undefined'` in React components
- **Don't duplicate Zod schemas**: Extend existing schemas from `apps/backend/src/validations/`
- **Don't forget tokens rebuild**: Frontend design changes require `pnpm --filter @repo/tokens build`
- **Don't design desktop-first**: ALWAYS start with mobile viewport and scale up
- **Don't ignore Rust services**: Use them for performance-critical operations (pricing, heavy calculations)

## Deployment Notes

### Docker Compose (Local)
```bash
./scripts/quick-deploy.sh
# OR
docker compose up --build
```
Services:
- Backend: http://localhost:5000
- Frontend: http://localhost:80
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Rust Price Engine: localhost:50051 (gRPC)
- Rust Comm Service: localhost:50052 (gRPC)

### Kubernetes (Production)
```bash
./scripts/deploy-production.sh
```
- Applies manifests from `infrastructure/k8s/`
- Builds and pushes Docker images (Node.js, Python, Rust)
- Runs migrations via init containers
- Configures ingress, secrets, services

### Skaffold (Dev Loop in K8s)
```bash
skaffold dev  # Auto-rebuilds on file changes
kubectl exec deploy/backend -n autolytiq-dev -- npx prisma migrate deploy --schema prisma/schema.prisma
```

## References

- **`README.md`**: Quick start, installation, deployment overview
- **`AGENTS.md`**: Canonical engineering standards (mandatory reading)
- **`DEPLOYMENT_GUIDE.md`**: Comprehensive deployment instructions
- **`docs/TROUBLESHOOTING.md`**: Debugging guide
- **`scripts/README.md`**: Documentation for all automation scripts
- **`services/rust/README.md`**: Rust microservices architecture and development
- **`services/rust/ARCHITECTURE.md`**: Detailed Rust services design patterns

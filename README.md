# AutolytiQ

AutolytiQ is an end-to-end retail automotive platform that unifies CRM, inventory, desking, F&I, and analytics workflows into a
single operations hub. The monorepo packages a production React front end, multiple Node/TypeScript services, Python machine
learning pipelines, and auxiliary workers so dealerships can price inventory, structure deals, and manage customer journeys with
real-time intelligence.

## Feature Highlights

- **Deal Desk & Desking** – Multi-structure worksheets with automated tax/fee lookup, trade handling, finance & lease options,
  printable jackets, and AI-assisted negotiation flows.
- **Customer & Lead Management** – Tenant-scoped CRM with activity timelines, lead scoring, appointment automation, and
  omnichannel communication tracking.
- **Inventory Intelligence** – Pricing history, competitive market scraping, recon tracking, appraisal workflows, and pipeline
  analytics for each rooftop.
- **Finance & Compliance** – Credit apps, credit bureau pulls, funding/compliance checklists, lender submissions, GL integration,
  and commission accounting.
- **Machine Learning Services** – Python services for pricing predictions, deal optimization, lead prioritization, and inventory
  recommendations backed by automated retraining pipelines.
- **Observability & Tracking** – Pixel tracking service, notification center, audit logging, and report generation for retail
  operations teams.

## Repository Layout

| Path | Purpose |
| --- | --- |
| `client/` | React 18 + Vite front end with shadcn/ui component system and TanStack Query data layer. |
| `src/` | Primary Express API using Prisma, background queues, domain services, and integrations. |
| `server/` | Legacy Drizzle/Express gateway that exposes shared schema driven routes. |
| `backend/` | Additional TypeScript service with its own Prisma schema for modular deployments. |
| `ml_service/` | FastAPI + Celery service that powers realtime ML scoring and async jobs. |
| `ml_backend/` | Offline Python pipelines for scraping, feature engineering, and model retraining. |
| `tracking-service/` | Dedicated event ingestion and analytics service. |
| `infrastructure/` | Docker, Kubernetes, and monitoring manifests for self-hosted deployments. |
| `prisma/` | Canonical Prisma schema, migrations, and data seed scripts for the core service. |
| `docs/` (including `docs/resources/assets/`) and other legacy markdown files were consolidated into this README and `ARCHITECTURE.md`. |

## Prerequisites

- Node.js 20+
- pnpm 9 (npm and yarn work, but pnpm matches the lockfile)
- Python 3.11+ for ML services
- PostgreSQL 14+ (Neon or compatible serverless deployment)
- Redis (for BullMQ queues and Celery broker; locally you can point services at `redis://localhost:6379`)
- Optional: Docker/Compose if using the self-hosted stack described in `ARCHITECTURE.md`

## Getting Started

1. **Bootstrap the local stack**
   ```bash
   pnpm setup:local
   ```
   This installs dependencies, applies migrations, and seeds the baseline GL data so the API can start without 500 errors.

2. **(Alternative) Run each setup command manually**
   ```bash
   pnpm install
   pnpm prisma:generate
   pnpm db:push
   pnpm db:seed   # optional sample data
   ```

3. **Install Python dependencies for the ML services**
   ```bash
   cd ml_service
   pip install -r requirements.txt
   cd ..
   cd ml_backend
   pip install -r requirements.txt
   cd ..
   ```

4. **Set required environment variables** (`.env` at repository root)
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/autolytiq
   SESSION_SECRET=local-development-session-secret-please-change
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   REDIS_URL=redis://localhost:6379
   OPENAI_API_KEY=sk-...
   STRIPE_SECRET_KEY=sk_test_...
   SENDGRID_API_KEY=...
  ```
  `SESSION_SECRET` must be at least 32 characters long to satisfy runtime validation.
  See `ARCHITECTURE.md` for optional credentials (OAuth providers, S3, Twilio, etc.).

## Running Locally

- **API only**
  ```bash
  pnpm dev
  ```

- **Frontend**
  ```bash
  pnpm dev:frontend
  ```

- **Legacy gateway**
  ```bash
  pnpm dev:backend
  ```

- **ML scoring API & workers**
  ```bash
  pnpm dev:ml          # FastAPI service on :8000
  pnpm dev:worker:hp   # High-priority Celery worker
  pnpm dev:worker:ml   # ML job worker
  pnpm dev:beat        # Celery beat scheduler
  ```

- **Full Replit-style stack (backend + frontend + ML services + workers)**
  ```bash
  pnpm dev:replit
  ```

The frontend expects the API on port `5000` and the ML service on `8000`. When running locally, ensure CORS and env variables
match your chosen ports.

## Testing & Quality

```bash
pnpm lint          # ESLint checks
pnpm typecheck     # TypeScript project references
pnpm test          # Vitest unit/integration suite
pnpm test:e2e      # Playwright end-to-end tests
pnpm ml:test       # Python ML unit tests
pnpm ci            # Full CI pipeline (generate client, typecheck, lint, test, build, ML tests)
```

## Database Operations

```bash
pnpm prisma:migrate    # Development migrations
pnpm db:push           # Sync schema without migrations (non-prod)
pnpm db:seed           # Seed baseline data
pnpm db:migrate:ensure # Production-safe deploy (auto baselines & generates client)
```

Set `SKIP_DB_MIGRATIONS=1` in environments where another job is responsible for applying migrations (for example, read-only
application replicas).

## Deployment Summary

- **Production**: Replit Deployments serving the built Express app on port 5000 with automatic SSL, Neon PostgreSQL, and Redis
  for queues. Build command `pnpm run build` (tsup + vite) and start command `pnpm start`.
- **Self-hosted**: Docker Compose stack (`docker-compose.yml`) now provisions Postgres, MinIO, ML scoring service, and automatic
  Prisma migrations during backend startup. `make up` or `docker compose up --build` orchestrates API, client, ML services,
  Redis, and Postgres. Kubernetes manifests are in `infrastructure/k8s` for clustered installs.

Detailed architecture, infrastructure, and operational runbooks now live in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Contributing

1. Fork and clone the repository
2. Create a branch from `main`
3. Follow the canonical component guidelines in `ARCHITECTURE.md`
4. Ensure tests and linters pass before submitting a pull request

## Support

Questions or production issues? Reach the AutolytiQ engineering team at [autolytiq.com](https://autolytiq.com) or the internal
Slack channel.

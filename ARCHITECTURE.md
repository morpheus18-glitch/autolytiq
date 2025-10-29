# AutolytiQ Architecture & Operations Guide

This guide consolidates the current system architecture, code ownership boundaries, deployment topology, and operational
checklists for the AutolytiQ platform. It supersedes the legacy Replit-first documentation and reflects the DigitalOcean
infrastructure that is now the default production target.

## 1. Platform overview

AutolytiQ orchestrates CRM, desking, F&I, service, analytics, and machine-learning driven processes for multi-rooftop dealers.
The platform is composed of:

- **React/Vite SPA** in `apps/client` that delivers the authenticated dealer console.
- **Node.js/Express API** in `apps/server` that exposes REST + Socket.IO endpoints, orchestrates domain services, and manages
  background jobs.
- **Python services** (`ml_service`, `apps/ml_backend`) that provide realtime scoring APIs, Celery workers, and offline
  retraining pipelines.
- **Tracking service** in `tracking-service` for pixel ingestion, behavioural analytics, and webhook fan-out.
- **Shared packages** in `packages/` for Prisma schema (`packages/db`) and cross-cutting TypeScript utilities (`packages/shared`).
- **Infrastructure definitions** in `infrastructure/` covering Docker Compose, Kubernetes manifests, and Terraform modules for
  cloud provisioning.

PostgreSQL is the system of record; Redis powers queueing, caching, and Celery brokers; S3-compatible object storage keeps
exports and ML artefacts.

## 2. Codebase anatomy

### Applications (`apps/`)

| Service | Responsibility | Highlights |
| --- | --- | --- |
| `apps/server` | Primary HTTP API, WebSocket hub, domain orchestration, migrations | Prisma, Zod validation, BullMQ queues, tenant context middleware |
| `apps/client` | Dealer SPA | Vite build, shadcn/ui, TanStack Query, feature flags via `@repo/shared` |
| `ml_service` | FastAPI + Celery scoring endpoints | Async inference, REST contract consumed by server |
| `apps/ml_backend` | Offline ETL + model training | Orchestrates scrapers, feature engineering, training pipelines |

Shared code lives in `packages/`:

- `packages/db` – Prisma schema, migrations (`prisma/migrations`), seeding utilities, and CLI wrappers.
- `packages/shared` – DTOs, validation schemas, feature flags, date/currency helpers, and socket event contracts.

Supporting directories:

- `tracking-service` – Node.js microservice that ingests browser pixels, persists analytics events, and forwards to the core API.
- `scripts` – Automation (droplet provisioning, deploy, cleanup, verification, and health checks). Scripts assume Debian/Ubuntu
  hosts and Node.js 22.
- `docs/` – Supplementary runbooks and diagrams referenced by this guide.

## 3. Domain layering

The backend follows a layered structure inside `apps/server/src`:

```
apps/server/src
├── config/          # env parsing, configuration defaults
├── controllers/     # Express handlers returning `Ok/Created/Error` responses
├── routes/          # Route declarations, middleware composition
├── services/        # Domain services per bounded context (CRM, desking, inventory, analytics)
├── queues/          # BullMQ queue definitions and processors
├── integrations/    # External APIs (OpenAI, Stripe, Twilio, OEM DMS)
├── middleware/      # Auth, tenancy, role guards, error handlers
├── sockets/         # Socket.IO namespaces and event wiring
├── lib/             # Prisma client, async tenant context, error helpers
├── validations/     # Zod schemas for request/response contracts
└── workers/         # Long running background jobs (report exports, nightly rollups)
```

Tenant isolation is enforced via middleware that attaches tenant metadata to AsyncLocalStorage. Services **must never** bypass
this context; when calling Prisma directly ensure `tenantScope()` is active or use helper methods provided in `lib/prisma.ts`.

## 4. Data & integrations

- **Database**: PostgreSQL 16 with Prisma migrations. Connection pooling configured through Prisma engine.
- **Caching/Queueing**: Redis 7; BullMQ handles Node queues, Celery handles Python workers.
- **Storage**: S3-compatible buckets (MinIO locally, AWS/S3/Spaces in production) for deal jackets, exports, and ML models.
- **External services**: OpenAI for AI-assisted flows, SendGrid/Twilio for messaging, Stripe for payments, OEM APIs for DMS
  integrations.

## 5. Deployment topology

### DigitalOcean (primary)

- Droplet (2 vCPU / 4GB recommended) provisioned via `scripts/setup-droplet.sh`.
- Node.js service managed by `systemd` (`/etc/systemd/system/autolytiq.service`).
- PostgreSQL 16 and Redis installed on the droplet; consider managed services for HA.
- Nginx reverse proxy with Certbot-managed TLS.
- CI/CD: `scripts/deploy-to-droplet.sh` pulls the repo, runs `pnpm build:prod`, applies Prisma migrations, and restarts the
  service via `systemctl restart autolytiq`.

### Docker Compose / Kubernetes

- `docker-compose.yml` orchestrates the API container, Postgres, Redis, optional MinIO, and optional ML services.
- The main Dockerfile performs a multi-stage build, running `pnpm build:prod` and exposing port 5000.
- Kubernetes manifests in `infrastructure/k8s` mirror the compose setup (deployment, service, secrets, ingress).

### Legacy Replit

`pnpm dev:replit` remains available for troubleshooting single-port behaviour, but the configuration is no longer maintained.
Replit-specific files were removed to keep the deployment footprint focused on DigitalOcean.

## 6. Operational checklists

### Production readiness

- [ ] Environment variables sourced from `.env.digitalocean.example` template with production secrets.
- [ ] Prisma migrations applied via `pnpm db:migrate:deploy` (handled automatically in deploy script).
- [ ] Redis persistence enabled (`appendonly yes`).
- [ ] Nginx + Certbot configured; HTTP → HTTPS redirect enforced.
- [ ] Systemd service logs monitored through `journalctl -u autolytiq`.
- [ ] Backups scheduled for PostgreSQL (`pg_dump`/managed backups) and object storage.
- [ ] Monitoring/alerting configured (DigitalOcean Uptime, Prometheus stack, or equivalent).

### Troubleshooting references

| Symptom | Location |
| --- | --- |
| Prisma client mismatch | `pnpm db:generate`, see `PRISMA_SETUP.md` |
| Tenant leakage / auth issues | `apps/server/src/middleware/tenantScope.ts`, `apps/server/src/middleware/authenticate.ts` |
| Queue backlogs | `apps/server/src/queues`, Redis `MONITOR`/`INFO` |
| ML inference failures | `ml_service/app/routers`, Celery logs in `ml_service/logs/` |
| Deployment failures | `/var/log/nginx/error.log`, `journalctl -u autolytiq`, `docker-compose logs` |

## 7. Change management

- Follow import ordering, naming conventions, and testing standards defined in `AGENTS.md`.
- Update this document when service boundaries shift or new infrastructure components are introduced.
- Document major architecture decisions in `docs/ADR/` (create new files when necessary).

## 8. Related documentation

- [`README.md`](./README.md) – quickstart, developer workflow, high-level deployment summary.
- [`DIGITAL_OCEAN_MIGRATION.md`](./DIGITAL_OCEAN_MIGRATION.md) – step-by-step migration and operations runbook.
- [`PRISMA_SETUP.md`](./PRISMA_SETUP.md) – database bootstrap instructions.
- [`PRODUCTION_READINESS.md`](./PRODUCTION_READINESS.md) – detailed production checklist.
- `docs/` – metrics, observability, Terraform, CI/CD, and security guides.

Maintain parity between this guide and the running infrastructure to guarantee smooth releases and incident response.

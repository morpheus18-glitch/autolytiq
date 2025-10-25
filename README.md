# AutolytiQ

AutolytiQ is an end-to-end retail automotive platform that unifies CRM, desking, F&I, analytics, and machine-learning driven
operations. The repository is organised as a pnpm workspace that ships a React front end, a TypeScript/Express API, Python
services for predictive scoring, and operational tooling needed for production deployments on DigitalOcean.

## Monorepo layout

| Path | Purpose |
| --- | --- |
| `apps/client` | React 18 + Vite single page application with shadcn/ui components and TanStack Query. |
| `apps/server` | Express API, Socket.IO gateway, Prisma access layer, and background schedulers. Builds with `tsup` to `dist/`. |
| `apps/ml_service` | FastAPI scoring API plus Celery workers for live model inference. |
| `apps/ml_backend` | Offline training pipelines, scraping jobs, and feature engineering utilities. |
| `packages/db` | Prisma schema, migrations, and database utilities shared across services. |
| `packages/shared` | TypeScript utilities, domain types, and client/server shared logic. |
| `tracking-service` | Event ingestion and analytics microservice. |
| `infrastructure` | Docker Compose, Kubernetes manifests, and Terraform modules for self-hosting. |
| `scripts` | Automation for migrations, deployment, health checks, and DigitalOcean provisioning. |

## Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+ (for ML services)
- PostgreSQL 14+
- Redis 7+
- Docker (optional but recommended for production parity)

## Environment configuration

Create a `.env` at the repository root. Start from the template that matches your target platform:

- `.env.example` – minimal local development variables
- `.env.selfhost.example` – Docker Compose/local server parity
- `.env.digitalocean.example` – production-ready configuration for the droplet stack
- `.env.replit.example` – legacy single-port deployment (kept for reference)

Generate strong secrets before first deploy:

```bash
openssl rand -base64 32 # SESSION_SECRET
openssl rand -base64 64 # JWT_SECRET
openssl rand -hex 32    # CREDIT_ENCRYPTION_KEY
```

## Install dependencies

```bash
pnpm install
pnpm db:generate  # Prisma client
```

Python services manage their own dependencies:

```bash
cd apps/ml_service && pip install -r requirements.txt
cd ../ml_backend && pip install -r requirements.txt
```

## Run locally

- Run the API only: `pnpm dev:server`
- Run the frontend: `pnpm dev:client`
- Build shared packages + run the single-port stack (matches Replit/docker image entrypoint): `pnpm dev:replit`
- Launch ML services: `pnpm --filter @repo/ml_service dev` and `pnpm --filter @repo/ml_backend dev`

The API listens on `http://localhost:5000` by default and expects PostgreSQL/Redis according to your `.env`.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

## Database operations

```bash
pnpm db:migrate:dev      # Prisma migrations for development
pnpm db:migrate:deploy   # Safe production migrations
pnpm db:push             # Sync schema without generating a migration (non-production only)
pnpm db:seed             # Seed baseline tenant + sample data
```

## Deployment

DigitalOcean is the supported production target. Two deployment paths are maintained:

1. **Droplet with systemd** – Provisioned via `scripts/setup-droplet.sh`, deployed with `scripts/deploy-to-droplet.sh`. The
   droplet hosts Node.js 22, PostgreSQL 16, Redis, Nginx, and the app managed by `systemd`.
2. **Docker Compose stack** – Uses the root `Dockerfile` and `docker-compose.yml` for a reproducible multi-service deployment.

Key commands:

```bash
pnpm build:prod   # Generate Prisma client + build all workspaces
pnpm start:prod   # Run the compiled server from apps/server/dist/index.js
```

For complete migration steps, SSL guidance, backups, and troubleshooting, see
[`DIGITAL_OCEAN_MIGRATION.md`](./DIGITAL_OCEAN_MIGRATION.md). Architecture, module boundaries, and operational checklists are
covered in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Support & additional documentation

- `AGENTS.md` – canonical engineering standards for AI contributors
- `PRISMA_SETUP.md` / `PRISMA_SETUP_ISSUE.md` – database provisioning notes and historical outage postmortem
- `PRODUCTION_READINESS.md` – production checklists and guardrails
- `docs/` – in-depth deployment, infrastructure, and operations references

Questions or incidents? Reach the AutolytiQ engineering team via the internal Slack channel or https://autolytiq.com.

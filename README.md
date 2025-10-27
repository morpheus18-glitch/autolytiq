# AutolytiQ

AutolytiQ is an end-to-end retail automotive platform that unifies CRM, desking, F&I, analytics, and machine-learning driven
operations. The repository is organised as a pnpm workspace that ships a React front end, a TypeScript/Express API, Python
services for predictive scoring, and operational tooling for production deployments on DigitalOcean Kubernetes.

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
| `infrastructure` | Dockerfiles, Kubernetes manifests, and Terraform modules for self-hosting. |
| `scripts` | Automation for migrations, deployment, health checks, and DigitalOcean provisioning. |

## Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+ (for ML services)
- PostgreSQL 14+
- Redis 7+
- Docker (for local Compose + production parity)

## Environment configuration

Create a `.env` at the repository root. Start from the template that matches your target platform:

- `.env.example` – minimal local development variables
- `.env.selfhost.example` – Docker Compose/local server parity
- `.env.digitalocean.example` – production-ready configuration

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
- Launch the Docker stack: `docker compose up --build`
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

DigitalOcean Kubernetes is the supported production target. Container builds for each service live in
`infrastructure/docker/`:

- `Dockerfile.backend`
- `Dockerfile.frontend`
- `Dockerfile.ml`

Typical workflow:

```bash
# Authenticate to DigitalOcean Container Registry (DOCR)
doctl registry login

# Build images
REGISTRY=registry.digitalocean.com/autolytiq
TAG=$(git rev-parse --short HEAD)

docker build -f infrastructure/docker/Dockerfile.backend -t $REGISTRY/backend:$TAG .
docker build -f infrastructure/docker/Dockerfile.frontend -t $REGISTRY/frontend:$TAG .
docker build -f infrastructure/docker/Dockerfile.ml -t $REGISTRY/ml-service:$TAG .

docker push $REGISTRY/backend:$TAG
docker push $REGISTRY/frontend:$TAG
docker push $REGISTRY/ml-service:$TAG
```

Update the image tags inside `infrastructure/k8s/production` and apply the manifests:

```bash
kubectl apply -f infrastructure/k8s/production/namespace.yaml
kubectl apply -f infrastructure/k8s/production/configmap.yaml
kubectl apply -f infrastructure/k8s/production/secrets.yaml
kubectl apply -f infrastructure/k8s/production/pvc.yaml
kubectl apply -f infrastructure/k8s/production/backend-deployment.yaml
kubectl apply -f infrastructure/k8s/production/frontend-deployment.yaml
kubectl apply -f infrastructure/k8s/production/ml-service-deployment.yaml
kubectl apply -f infrastructure/k8s/production/celery-worker-deployment.yaml
kubectl apply -f infrastructure/k8s/production/hpa.yaml
kubectl apply -f infrastructure/k8s/production/ingress.yaml
```

For full runbooks, scaling guidance, and operational checklists see
[`DIGITAL_OCEAN_MIGRATION.md`](./DIGITAL_OCEAN_MIGRATION.md) and [`ARCHITECTURE.md`](./ARCHITECTURE.md).

Legacy droplet scripts remain available under `scripts/` for disaster recovery but are no longer the primary deployment
mechanism.

## Support & additional documentation

- `AGENTS.md` – canonical engineering standards for AI contributors
- `PRISMA_SETUP.md` / `PRISMA_SETUP_ISSUE.md` – database provisioning notes and historical outage postmortem
- `PRODUCTION_READINESS.md` – production checklists and guardrails
- `docs/` – in-depth deployment, infrastructure, and operations references

Questions or incidents? Reach the AutolytiQ engineering team via the internal Slack channel or https://autolytiq.com.

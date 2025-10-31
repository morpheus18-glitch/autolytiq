# AutolytiQ

AutolytiQ is an end-to-end retail automotive platform that unifies CRM, desking, F&I, analytics, and machine-learning driven
operations. The repository is organised as a pnpm workspace that ships a React front end, a TypeScript/Express API, Python
services for predictive scoring, and operational tooling for production deployments on DigitalOcean Kubernetes.

---

## 🚀 Quick Start

**Want to deploy AutolytiQ right now?**

- 📖 **[Quick Reference](./QUICK_START.md)** - One-page deployment cheat sheet
- 📚 **[Complete Guide](./DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
- 🛠️ **[Scripts Documentation](./scripts/README.md)** - All automation tools explained

```bash
# Get running locally in under 5 minutes
./scripts/quick-deploy.sh
# OR
pnpm deploy:local
```

---

## Monorepo layout

| Path | Purpose |
| --- | --- |
| `apps/client` | React 18 + Vite single page application with shadcn/ui components and TanStack Query. |
| `apps/backend` | Express API, Socket.IO gateway, Prisma access layer, and background schedulers. Builds with `tsup` to `dist/`. |
| `ml_service` | FastAPI scoring API plus Celery workers for live model inference. |
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
cd ml_service && pip install -r requirements.txt
cd ../ml_backend && pip install -r requirements.txt
```

## Run locally

- Run the API only: `pnpm dev:server`
- Run the frontend: `pnpm dev:client`
- Launch the Docker stack: `docker compose up --build`
- Launch ML services: `pnpm --filter @repo/ml_service dev` and `pnpm --filter @repo/ml_backend dev`

The API listens on `http://localhost:5000` by default and expects PostgreSQL/Redis according to your `.env`.

## Run inside Kubernetes (dev loop)

The repository ships with a Skaffold profile (`skaffold.yaml`) and lightweight manifests under
`infrastructure/k8s/dev`. This provisions PostgreSQL, the Express backend, and the Vite/NGINX
frontend directly inside your cluster so that you can iterate against pods instead of local
processes.

```bash
# Ensure your kube-context points at a local cluster (kind, k3d, minikube, etc.)
skaffold dev

# Apply Prisma migrations once the backend pod is ready
kubectl exec deploy/backend -n autolytiq-dev -- npx prisma migrate deploy --schema prisma/schema.prisma
```

Skaffold automatically port-forwards the backend to `http://localhost:5000`, the frontend to
`http://localhost:4173`, and exposes PostgreSQL locally on port `5432` for debugging tools.

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

**📖 See the complete [Deployment Guide](./DEPLOYMENT_GUIDE.md) for all deployment options.**

### Quick Deployment Options

**Local (Docker Compose):**
```bash
./scripts/quick-deploy.sh
```

**Production (Kubernetes):**
```bash
./scripts/deploy-production.sh
```

**VPS/Droplet:**
```bash
./scripts/deploy-to-droplet.sh YOUR_IP
```

### Manual Deployment

DigitalOcean Kubernetes is the supported production target. Container builds for each service live in
`infrastructure/docker/`:

- `Dockerfile.backend`
- `Dockerfile.frontend`
- `Dockerfile.ml`

For detailed manual deployment instructions, see [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) and [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

## Support & additional documentation

- **[`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)** – comprehensive deployment guide with all methods
- **[`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)** – troubleshooting and debugging guide
- `AGENTS.md` – canonical engineering standards for AI contributors
- `docs/DEPLOYMENT.md` – detailed Kubernetes deployment reference
- `docs/` – in-depth infrastructure and operations documentation

Questions or incidents? Reach the AutolytiQ engineering team via the internal Slack channel or https://autolytiq.com.

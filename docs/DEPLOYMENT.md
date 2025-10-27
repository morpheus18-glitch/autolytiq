# AutolytiQ Deployment Guide

This guide consolidates the steps required to run AutolytiQ locally, build container images, and ship the platform to
DigitalOcean Kubernetes (DOKS).

## Table of Contents
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Building Production Images](#building-production-images)
- [DigitalOcean Kubernetes](#digitalocean-kubernetes)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Production Checklist](#production-checklist)

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker 24+
- kubectl 1.30+
- doctl CLI (for DOCR auth)

### Initial setup
```bash
git clone https://github.com/morpheus18-glitch/autolytiq.git
cd autolytiq
pnpm install
pnpm db:generate
cp .env.example .env
```

---

## Local Development

### pnpm scripts
```bash
pnpm dev:server   # API with hot reload
pnpm dev:client   # React SPA on http://localhost:5173
```

### Docker Compose
```bash
docker compose up --build
```
This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`
- ML service on `http://localhost:8000`
- PostgreSQL, Redis, and MinIO with default credentials from `.env.selfhost.example`

---

## Building Production Images

Images for DigitalOcean live in `infrastructure/docker/`.

```bash
REGISTRY=registry.digitalocean.com/autolytiq
TAG=$(git rev-parse --short HEAD)

doctl registry login

docker build -f infrastructure/docker/Dockerfile.backend -t $REGISTRY/backend:$TAG .
docker build -f infrastructure/docker/Dockerfile.frontend -t $REGISTRY/frontend:$TAG .
docker build -f infrastructure/docker/Dockerfile.ml -t $REGISTRY/ml-service:$TAG .

docker push $REGISTRY/backend:$TAG
docker push $REGISTRY/frontend:$TAG
docker push $REGISTRY/ml-service:$TAG
```

Update the image tags in `infrastructure/k8s/production/*.yaml` before applying.

---

## DigitalOcean Kubernetes

### 1. Cluster prerequisites
- DOKS cluster with Kubernetes 1.30+
- Node pools sized for workloads (2 vCPU / 4GB minimum for backend + ML pods)
- Load balancer enabled via Nginx ingress controller
- `cert-manager` configured for TLS (optional but recommended)

### 2. Bootstrap namespace & secrets
```bash
kubectl apply -f infrastructure/k8s/production/namespace.yaml
kubectl apply -f infrastructure/k8s/production/configmap.yaml
kubectl apply -f infrastructure/k8s/production/secrets.yaml
kubectl apply -f infrastructure/k8s/production/pvc.yaml
```
Edit `secrets.yaml` with real credentials before applying. For managed Postgres/Redis, update endpoints in the config map.

### 3. Deploy workloads
```bash
kubectl apply -f infrastructure/k8s/production/backend-deployment.yaml
kubectl apply -f infrastructure/k8s/production/frontend-deployment.yaml
kubectl apply -f infrastructure/k8s/production/ml-service-deployment.yaml
kubectl apply -f infrastructure/k8s/production/celery-worker-deployment.yaml
kubectl apply -f infrastructure/k8s/production/hpa.yaml
kubectl apply -f infrastructure/k8s/production/ingress.yaml
```

### 4. Validate rollout
```bash
kubectl -n dms-production get pods
kubectl -n dms-production get svc
kubectl -n dms-production get ingress
```
Ensure the ingress address is attached to your DNS (`dms.autolytiq.com`, `api.dms.autolytiq.com`).

### 5. Ongoing operations
- Scale replicas via `kubectl scale deployment/backend --replicas=...`
- Rotate secrets by editing `secrets.yaml` and reapplying
- Monitor pod health with `kubectl describe pod` and `kubectl logs`

---

## Environment Variables

Essential values (configure via `.env` locally and `secrets.yaml`/`configmap.yaml` in production):

```bash
NODE_ENV=production
PORT=5000
APP_URL=https://dms.autolytiq.com
API_URL=https://api.dms.autolytiq.com
DATABASE_URL=postgresql://user:password@host:5432/autolytiq?schema=public
DIRECT_URL=postgresql://user:password@host:5432/autolytiq?schema=public
SESSION_SECRET=<32+ chars>
JWT_SECRET=<64+ chars>
CREDIT_ENCRYPTION_KEY=<64 hex chars>
REDIS_URL=redis://:password@host:6379/0
ML_SERVICE_URL=https://ml.dms.autolytiq.com
```

Optional integrations include SendGrid, Twilio, AWS S3, and ClickHouse. Refer to
`infrastructure/k8s/production/secrets.yaml` for the full list.

---

## Database Setup

Local PostgreSQL is provisioned automatically by Docker Compose. For production:
1. Create a managed PostgreSQL cluster (or self-manage on a droplet).
2. Apply migrations from CI or your workstation:
   ```bash
   pnpm db:migrate:deploy
   pnpm db:seed
   ```
3. Grant least-privilege credentials for application, reporting, and analytics.

Redis can be provided by DigitalOcean Managed Redis or an in-cluster deployment such as Redis Cloud. Update
`REDIS_URL` accordingly.

---

## Production Checklist

- [ ] Docker images built and pushed to DOCR with immutable tag
- [ ] Secrets rotated and stored in `dms-secrets`
- [ ] HPA targets adjusted for expected load
- [ ] Ingress DNS and TLS validated
- [ ] Prisma migrations applied to production database
- [ ] Observability wired (DigitalOcean metrics, Logtail/Datadog, etc.)
- [ ] Disaster recovery plan verified (database backups + DO snapshot)

For troubleshooting and escalation paths see `PRODUCTION_READINESS.md` and `DIGITAL_OCEAN_MIGRATION.md`.

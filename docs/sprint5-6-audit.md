# Sprint 5-6 Repository Audit (Phase 0)

## Frontend
- **Location:** `apps/frontend`
- **Framework:** React + Vite SPA
- **Package manager:** npm (lockfile present)
- **Build command:** `npm run build`
- **Entry point:** `src/main.tsx`

## Backend
- **Location:** `apps/backend`
- **Runtime:** Express + TypeScript
- **Primary entry point:** `src/index.ts`
- **Prisma schema:** `packages/db/schema.prisma`
- **Latest migrations:**
  1. `20260315090010_credit_submission_drafts`
  2. `20260215090000_add_desking_domain`
  3. `20260207090000_part6_pipeline_schema`

## Worker
- **Exists:** No dedicated worker application identified.
- **Notes:** Background job processors currently live inside the backend service (e.g., `apps/backend/src/workers`).

## Rust Services
- **Exists:** Yes (under `services/rust`)
- **Notes:** Current layout differs from expected `apps/pricing-rust` microservice. Multiple Rust crates exist for caching, pricing, and rate limiting.

## Infrastructure
- **Kubernetes configs:** Present as raw manifests in `infrastructure/k8s/production/*.yaml`; Helm charts are not yet defined.
- **Dockerfiles:**
  - `services/rust/Dockerfile`
  - `apps/ml_backend/Dockerfile`
  - `tracking-service/backend/Dockerfile`
- **CI/CD:** Existing GitHub workflows (`.github/workflows/backend.yml`, `frontend.yml`, `ci.yml`, `ml.yml`) focus on service-specific build/test automation, but no unified container build/push or production deploy pipeline was found.

## Deviations from Expected Structure
- Frontend located at `apps/frontend` (renamed from `apps/client`), but expected layout requires supporting Helm packaging and Docker assets.
- Backend located at `apps/backend` (renamed from `apps/server`), but no dedicated Dockerfile within app directory.
- No standalone worker app under `apps/worker`.
- Rust services live under `services/rust` instead of `apps/pricing-rust`.
- Kubernetes resources stored as individual manifests instead of Helm charts.
- CI/CD workflows do not yet implement DigitalOcean registry publishing or environment deployment.

## Migration Needed
- **Frontend:** ensure Dockerfile, Helm chart, and CI integration are added under the new `apps/frontend` path. ✅
- **Backend:** add Dockerfile, Helm chart, gRPC client integration, and update CI/CD pipelines. ✅
- **Worker:** extract background processing into `apps/worker` with its own packaging and deployment artifacts. ✅
- **Rust Service:** create `apps/pricing-rust` crate with protobuf contract, tonic service, Dockerfile, and Helm chart. ✅
- **Infrastructure:** replace existing raw Kubernetes manifests with Helm charts under `infrastructure/k8s/production/helm/*`, add Prisma migration hook, smoke/rollback scripts, and comprehensive README. ✅
- **CI/CD:** implement container build-and-push plus production deployment workflows targeting DigitalOcean Kubernetes. ✅

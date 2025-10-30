# Scan Findings

## Environment & Secrets
- `packages/db/.env` contains development Postgres credentials (default user/password). Treat as non-production but avoid using in deployments.
- Multiple example env files exist at repo root (`.env.example`, `.env.production.example`, `.env.digitalocean.example`, `.env.selfhost.example`). Values are placeholders but ensure no production secrets leak.
- Backend requires extensive secret surface (JWT, SendGrid, Twilio, AWS); confirmed schema in `apps/backend/src/config/env.ts`.
- ML service (`ml_service/config/env.py`) expects numerous third-party keys; ensure GitHub/DO secrets cover `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, messaging keys, and `ML_SERVICE_TOKEN`.

## Lockfiles & Package Managers
- Both `pnpm-lock.yaml` and `package-lock.json` present at repo root. Since workspace uses pnpm per AGENTS.md, consider deleting `package-lock.json` to avoid accidental npm installs.

## Docker & Container Configs
- Prior Dockerfiles (backend/frontend/ml) used Node 18/npm and embedded root users without health checks. Replaced with hardened multi-stage builds using pnpm/uvicorn and non-root users.
- No `.dockerignore` was present; added root-level ignore to prevent copying `node_modules` and local artifacts into build contexts.
- Rust Dockerfile now exposes configurable `SERVICE_NAME` build arg and ships `grpc_health_probe` to satisfy Kubernetes probes.

## Duplicate / Legacy Code
- Two ML service codebases detected: `apps/ml_backend/` (legacy scripts + Flask UI) and `ml_service/` (active FastAPI service). Workflows and Docker image currently target `ml_service`; plan consolidation to avoid drift.
- Redundant ML directories `ml-service/` and `ml_backend/` (hyphen vs underscore) also exist; verify which can be archived.

## Routing & Config Files
- Frontend route tree lives under `apps/frontend/src/routes/`; ensure any future additions respect `@/` aliasing defined in `vite.config.ts`.
- Kubernetes manifests under `infrastructure/k8s/production/` expect container ports 5000 (backend), 8080 (frontend after update), 8000 (ml-service), and 50051 (rust-pricing).

## Miscellaneous Observations
- `apps/frontend-dev/` is an experimental sandbox (per AGENTS.md) and excluded from new CI pipelines.
- No `//@ts-ignore` usage detected in workspace scan; continue enforcing strict TypeScript.
- Ensure `.gitignore` updates allow committing `.env.example` while still ignoring real env files/logs.

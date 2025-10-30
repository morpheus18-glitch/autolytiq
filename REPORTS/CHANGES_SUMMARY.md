# Changes Summary

- Hardened backend, frontend, ML, and Rust Dockerfiles with multi-stage builds, non-root users, health checks, and sqlite-friendly defaults.
- Added root `.dockerignore` to trim build contexts and avoid leaking local artifacts.
- Updated frontend Kubernetes deployment to expose port 8080 matching the unprivileged Nginx runtime.
- Created service-specific `.env.example` templates under `apps/backend`, `apps/frontend`, `apps/ml_backend`, and `services/rust`.
- Replaced monolithic deploy workflow with four service-scoped GitHub Actions (`frontend.yml`, `backend.yml`, `ml.yml`, `rust.yml`) featuring DOCR caching, namespace prep, and rollout checks.
- Introduced optional Prisma migration job gated by `RUN_MIGRATIONS` secret within backend workflow.
- Generated REPORTS artifacts (tree snapshot, scan findings, change summary, next steps) and ensured PATCHES directory will capture diff.

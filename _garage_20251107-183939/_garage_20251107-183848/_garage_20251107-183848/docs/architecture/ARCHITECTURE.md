# AutolytiQ Architecture, Codebase Guide & Deployment Runbook

This document centralizes every engineering note that previously lived across individual markdown files. It describes the
monorepo layout, canonical code paths, domain responsibilities, infrastructure topology, and operational checklists required to
run AutolytiQ in production.

## 1. System Overview

AutolytiQ is a multi-service platform that orchestrates retail automotive workflows across CRM, desking, F&I, service, and
analytics. The stack combines:

- **React/Vite frontend** in `client/` with shadcn/ui components and TanStack Query data layer.
- **Primary Express + Prisma API** in `src/` that owns deal, CRM, finance, and automation logic.
- **Legacy Drizzle-based gateway** in `server/` exposing schema-driven routes for backwards compatibility.
- **Modular backend service** in `backend/` (TypeScript + Prisma) for long-running migrations and tenant provisioning.
- **Python ML services** in `ml_service/` (FastAPI + Celery) and `ml_backend/` (scrapers & training pipelines).
- **Tracking and analytics services** (`tracking-service/`) plus worker queues powered by BullMQ and Celery.
- **Shared schema and infrastructure** located in `shared/`, `prisma/`, and `infrastructure/`.

All services are tenant-aware and rely on PostgreSQL as the source of truth. Redis provides queueing, caching, and Celery
brokers. Object storage (AWS S3 compatible) is used for document exports and model artifacts.

## 2. Repository Anatomy & Canonical Paths

| Area | Description |
| --- | --- |
| `client/src/components/ui/` | Canonical shadcn/ui components. Always extend instead of duplicating.
| `client/src/pages/` | Page-level routes for dashboards, inventory, CRM, desking, reporting, and admin settings.
| `client/src/hooks/` | Shared hooks such as `use-auth`, `use-pixel-tracker`, and query helpers.
| `src/routes` & `src/controllers` | Primary HTTP surfaces. All new API routes belong here.
| `src/domain` | Aggregate domain services (CRM, deals, inventory, finance, compliance, reporting).
| `src/queues` & `src/workers` | BullMQ definitions and processors (email, notifications, nightly rollups).
| `src/integrations` | External services (OpenAI, Stripe, SendGrid, Twilio, OEM DMS connectors).
| `backend/src` | Maintenance scripts, tenant provisioning flows, seeders, and batch jobs.
| `ml_service/app` | FastAPI endpoints for price prediction, deal optimization, lead scoring, and inventory advisories.
| `ml_service/workers` | Celery workers for asynchronous scoring and scheduled retraining.
| `ml_backend/scraper` | Selenium/undetected-chromedriver scrapers for CarGurus, AutoTrader, and future sources.
| `ml_backend/pipeline` | Training/retraining orchestration, model metrics, and data validation.
| `tracking-service` | Pixel ingestion, session analytics, and webhook fan-out.
| `infrastructure/docker` | Docker Compose definition for self-hosted deployments (API, client, ML, Redis, Postgres, monitoring).
| `infrastructure/k8s` | Production-ready Kubernetes manifests for clustered deployments.
| `scripts/` | Repository automation (audits, secret scanning, migrations, seeded data).

## 3. Domain Modules & Responsibilities

### CRM & Lead Management
- Multi-tenant contacts, activities, appointments, communications, and lead scoring.
- Assignment, ownership, and SLA tracking via workflow tasks and notifications.
- Pixel tracking integration for session-based attribution.

### Deal Desk & Desking
- Worksheets with cash/finance/lease structures, automated tax & fee lookup by ZIP/state, and trade-in support.
- Integration with vehicles, appraisal data, incentives, and F&I menu configuration.
- PDF generation, version history (`DealVersion`), counter offers, AI negotiation assistant hooks, and approval predictions.

### Inventory & Appraisals
- Vehicle lifecycle: acquisition, recon, pricing history, wholesale listings, market comps, and transport orders.
- Appraisal pipelines with status gates (draft → review → approval) and recon item tracking.
- Automated price recommendations from ML services and dealer-configurable packs.

### Finance & Compliance
- Credit applications, credit bureau imports, credit submission drafts, lender submissions, contracts, and signatures.
- Funding & compliance checklists, GL accounts, journal entries, commission calculations, and reporting exports.
- Menu configuration for F&I products and AI-generated optimization suggestions.

### Reporting & Analytics
- Pipeline aggregates, dashboards, scheduled reports, notifications, audit logs.
- Tracking service pushes session data into warehouse-friendly schemas for BI tools.

## 4. Data & Persistence Strategy

- **PostgreSQL** (Neon in production, configurable for self-hosted) is the authoritative store accessed through Prisma (core API)
  and Drizzle (legacy gateway).
- **Prisma schema** in `prisma/schema.prisma` defines all tenant-aware entities. Relation helpers such as `creditSubmissions`
  exist on Deal, DealWorksheet, DealVersion, and Tenant.
- **Redis** powers BullMQ queues, caching for expensive ML responses, and Celery brokers.
- **Object Storage** (S3-compatible) stores generated PDFs, model artifacts, and nightly exports.
- **SQLite** inside `ml_backend/data` houses scraped vehicle data, feature importances, and retraining history.
- **Search** uses PostgreSQL full-text vectors on customers, leads, and vehicles; Elastic/OpenSearch hooks live under
  `src/integrations/search` if external indexing is enabled.

## 5. Machine Learning Stack

- **Real-time scoring (`ml_service/`)**
  - FastAPI endpoints: `/api/ml/predict-price`, `/api/ml/optimize-deal`, `/api/ml/score-lead`, `/api/ml/optimize-inventory`.
  - Celery queues (`high_priority`, `default`, `ml_jobs`) with workers defined in `npm run dev:worker:*` scripts.
  - Shared Pydantic schemas align with Prisma models for deal, worksheet, and inventory entities.

- **Offline pipeline (`ml_backend/`)**
  - Scrapers for CarGurus and AutoTrader using undetected-chromedriver.
  - Feature engineering (depreciation curves, geographic adjustments, seasonal signals, condition/mileage weighting).
  - XGBoost regression for price prediction with MAE/RMSE monitoring and automated retraining triggers.
  - Streamlit dashboard and Flask API for manual oversight.

- **Model lifecycle**
  - Data ingestion → deduplication → validation → feature engineering → training → evaluation → artifact promotion.
  - Daily health checks with rollback to previous model if degradation occurs.
  - Metrics recommended for Prometheus/Grafana (scrape success rate, prediction latency, model accuracy).

## 6. Integrations & External Services

- **Identity & Auth**: OAuth (Google, GitHub, Apple), local auth, RBAC enforcement, tenant context middleware (`src/lib/prisma.ts`).
- **Payments & F&I**: Stripe for deposits, Twilio for SMS, SendGrid for email templates, S3 for asset storage.
- **AI Assistants**: OpenAI integration powers negotiation scripts, counteroffer guidance, and worksheet recommendations.
- **DMS/Provider APIs**: Connectors housed in `src/integrations` with provider-specific credentials loaded via environment
  variables.
- **Analytics**: Google Analytics (Vite GA measurement ID), first-party tracking service, optional Segment export hooks.

## 7. Workflow Automation

- **BullMQ** queues defined in `src/queues` for notifications, report generation, and nightly sync tasks.
- **Celery** schedules ML retraining, lead scoring refreshes, pricing audits, and high-priority scoring jobs.
- **Node Cron** tasks handle data hygiene, compliance audits, and integration sync intervals.
- **Makefile/CI** orchestrates Docker Compose rebuilds and ensures deterministic deployments.

## 8. Security & Compliance

- Enforce tenant context via `AsyncLocalStorage` guard (see `src/lib/prisma.ts`).
- HTTP security headers and HTTPS redirect middleware mirror the configuration documented previously in `ssl-config.md`.
- Automatic SSL through Replit (production) or Let’s Encrypt (self-hosted). Certificates renew every 90 days.
- Secrets management: `.env` for local dev, environment variables in deployment platform, encrypted secrets in CI/CD.
- Audit logging across CRUD operations, approval workflows, and authentication events.
- Rate limiting, session hardening (httpOnly + secure cookies), CSP, HSTS, and TLS 1.2+ enforced at the edge.

## 9. Frontend Standards & UX Principles

- Responsive layouts with Tailwind breakpoints; mobile-first tables collapse into card views.
- Canonical layout components (`sidebar-manager.tsx`, `collapsible-sidebar.tsx`, `enterprise-header.tsx`,
  `unified-dashboard.tsx`) must not be duplicated—extend via props or composition.
- Use React Hook Form + Zod for forms, React Query for server state, and keep business logic in services/hooks.
- Accessibility: prefer semantic HTML, maintain focus order, ensure color contrast, and leverage shadcn/ui primitives.

## 10. Deployment Guide

### Production (Replit Deployments)

1. Configure environment variables (database, Redis, API keys, OAuth secrets, Twilio, Stripe, SendGrid, OpenAI).
2. Build command: `pnpm run build` (runs `tsup` for API + `vite build` for client).
3. Start command: `pnpm start` (serves Express API and static frontend from `dist/`).
4. Port: `5000`. SSL automatically provisioned (Let’s Encrypt). Ensure custom domain points to Replit deployment.
5. Database: Neon PostgreSQL with automated backups; run `pnpm prisma:migrate deploy` during promotion.
6. Monitoring: Replit logs + Neon dashboard + Google Analytics + optional Prometheus/Grafana stack.

### Self-Hosted / Infrastructure-as-Code

- **Docker Compose**: `make up` runs stack defined in `infrastructure/docker/docker-compose.yml`. Services include API, client,
  ml_service, Redis, Postgres, nginx, and monitoring sidecars.
- **Kubernetes**: Manifests in `infrastructure/k8s` cover deployments, services, ingress, config maps, and secrets templates.
- **SSL & Networking**: Use cert-manager/Let’s Encrypt for ingress TLS; replicate security headers from production configuration.
- **CI/CD**: Recommended pipeline (GitHub Actions) triggers `pnpm ci`, container builds, migration apply, and helm/manifest
  rollout.
- **Backups & Disaster Recovery**: Nightly Postgres dumps, S3 versioning for artifacts, offsite backup for environment configs.

## 11. Operations & Maintenance

- **Database migrations**: Use Prisma migrations for the core API, Drizzle migrations for legacy server. Track production changes
  in `migrations/` and `backend/prisma/migrations/` if applicable.
- **Tenant management**: Admin CLI scripts live in `backend/scripts` and `src/scripts`. Ensure tenant provisioning seeds base
  data and default automations.
- **Scheduled jobs**: Review Celery beat schedule and Node cron tasks whenever adding new workflows to avoid duplication.
- **Incident response**: Audit logs + notification pipelines provide traceability. Coordinate rollbacks via CI/CD artifacts.

## 12. Testing Strategy

- **TypeScript**: `pnpm typecheck`, `pnpm lint`, and `pnpm test` (Vitest) before merge.
- **E2E**: `pnpm test:e2e` (Playwright) covers desking flows, CRM CRUD, and pricing dashboards.
- **Python**: `pnpm ml:test` (Pytest) ensures ML pipelines and API contracts remain stable.
- **Security**: `pnpm scan:secrets` (script) and dependency audits via `pnpm audit` (as needed).
- **Performance**: Load testing scripts live under `scripts/perf` (k6 scenarios) for deal desk and inventory endpoints.

## 13. Mobile & UX Notes

- Desking and deal desk screens collapse into single-column layouts with sticky summaries on mobile.
- Use touch-friendly hit zones (min 44px) and ensure modals/pickers degrade gracefully.
- Keep navigation lean on mobile; rely on collapsible sidebar manager.

## 14. Historical Context & Change Log

- Prior documentation (`README-foundation.md`, `FEATURE_AUDIT.md`, `REPO_CLEANUP_CHANGELOG.md`, etc.) informed this summary.
- Major initiatives captured here:
  - Canonical component enforcement to prevent AI-generated duplicates.
  - ML infrastructure hardening with automated retraining and monitoring.
  - SSL implementation via Let’s Encrypt with hardened security headers.
  - Production database migration processes and rollback safety nets.
  - Deal desk enhancements: negotiation assistant, worksheet versioning, approval predictions, and counteroffer workflows.
  - Mobile UX improvements for lot advisors and showroom staff.

## 15. Environment Reference

Key environment variables (extend as needed per integration):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `SHADOW_DATABASE_URL` | Optional, for Prisma migrations. |
| `REDIS_URL` | Redis broker for BullMQ and Celery. |
| `SESSION_SECRET` | Express session encryption key. |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics measurement ID. |
| `OPENAI_API_KEY` | AI negotiation & recommendation services. |
| `STRIPE_SECRET_KEY` | Payment integrations. |
| `SENDGRID_API_KEY` | Email delivery. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | SMS messaging. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `S3_BUCKET` | Document & artifact storage. |
| `OAUTH_*` variables | Provider-specific OAuth credentials (Google, GitHub, Apple). |
| `SEGMENT_WRITE_KEY` | Optional analytics export. |
| `PRICING_MODEL_PATH` | Location of promoted XGBoost artifacts for ml_service. |

## 16. Development Guidelines

- Always search for an existing component or service before creating a new file.
- Extend canonical files through composition or prop injection; avoid suffixes like `ComponentNew.tsx`.
- Keep business logic out of React components—prefer services and hooks.
- Document new queues, cron jobs, or environment variables directly in this file during PR review.
- Align code changes with deployment architecture: update Docker/K8s manifests and Helm values when introducing new services.

---

AutolytiQ’s engineering team treats this document as the single source of truth. Update it alongside any architectural, domain,
or infrastructure change to prevent future divergence.

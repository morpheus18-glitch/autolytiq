# Autolytiq Agent Guide (v2.1.0)

This repository is an actively evolving pnpm monorepo that powers Autolytiq's production stack. Read this file **before you touch anything** and keep it open while you work. When instructions in this guide conflict with older documents, **this file wins**.

---

## 1. Repository Overview

```
/workspace/autolytiq
├── apps/
│   ├── backend/        # Express + Socket.IO API (TypeScript)
│   ├── frontend/       # Production React/Vite SPA served by Nginx
│   ├── frontend-dev/   # Experimental sandbox UI (do not deploy)
│   ├── ml_backend/     # Python FastAPI services + workers
│   ├── pricing-rust/   # Rust microservice (see RUST_SERVICES_SUMMARY.md)
│   └── worker/         # Node background worker + BullMQ queues
├── packages/
│   ├── db/             # Prisma schema & migration helpers
│   ├── shared/         # Shared TypeScript types/utilities
│   └── tokens/         # Design tokens compiled with tsup
├── scripts/            # Deployment + maintenance tooling (bash + tsx)
├── docs/               # High level architecture & ops references
├── SHORT_CHANGELOG.md  # Mandatory per-iteration log (see §6)
├── pnpm-workspace.yaml # pnpm workspace definition
└── package.json        # Root scripts orchestrating builds/tests
```

Key entrypoints:
- **Backend**: `apps/backend/src/index.ts` → bootstraps Express server, websockets, background jobs.
- **Frontend**: `apps/frontend/src/main.tsx` → React SPA using shadcn UI and Vite aliases (`@/` → `src/`).
- **Shared contracts**: Imported via `@repo/shared` and `@repo/tokens` packages.
- **Database**: Managed through `packages/db` with Prisma CLI (`pnpm db:*` scripts).

---

## 2. Tooling & Commands

- Package manager: **pnpm 9+** (already available). Do **not** use npm or yarn for workspace actions.
- TypeScript everywhere (ESM). Rust services use Cargo; Python uses uv/poetry-compatible requirements.
- Default Node version: **20.x** (see Dockerfiles and `engines`).

Common commands (run from repo root unless noted):

| Task | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Type-check everything | `pnpm typecheck` |
| Backend build | `pnpm --filter @repo/backend build` |
| Frontend build | `pnpm --filter @repo/frontend build` |
| Tokens build | `pnpm --filter @repo/tokens build` |
| Backend tests | `pnpm --filter @repo/backend test` |
| Frontend lint | `pnpm --filter @repo/frontend lint` |
| End-to-end | `pnpm test:e2e` (requires Playwright deps) |

CI runs `pnpm ci` (db generate → typecheck → lint → test → build). Align local verification with that order when possible.

---

## 3. Coding Standards

### TypeScript / Node (apps/backend, packages/*)
- Strict null checks are on—handle nullable types explicitly.
- Prefer async/await; never mix `.then` chains in new code.
- Import order: external libs → internal aliases (`@repo/...`) → relative modules.
- Use Zod schemas for runtime validation (`apps/backend/src/validations`). Extend existing schemas instead of duplicating logic.
- Error handling: throw custom errors from `apps/backend/src/lib/errors.ts` and format responses via `lib/http-response.ts` helpers.
- Database access goes through Prisma clients exposed by `packages/db`. Respect tenant scoping utilities in `apps/backend/src/middleware/tenant-context.ts`.

### React / Vite (apps/frontend)
- Components live under `src/components/**`, pages under `src/routes/**`.
- Follow shadcn UI composition patterns (wrap primitives in `src/components/ui`).
- Hooks must start with `use` and live under `src/hooks/`.
- Keep TanStack Query keys organized in `src/lib/queryKeys.ts`.
- Styling: Tailwind first; colocation of component styles via className strings is encouraged.
- Never access window/document at module scope—check `typeof window !== 'undefined'` inside effects.

### Cross-cutting
- Shared types live in `packages/shared`; update exports in `packages/shared/src/index.ts` when adding new modules.
- Design tokens must be rebuilt (`pnpm --filter @repo/tokens build`) before consuming changes in frontend builds.
- Keep environment variable declarations in `apps/backend/src/config/env.ts` synchronized with `.env.example`.
- When touching Prisma schema, run `pnpm db:generate` and commit generated client changes.

---

## 4. Security & Compliance Checklist

For any feature touching auth, data persistence, or external I/O, verify:
- ✅ Authentication middleware (`authenticateRequest`) wraps the route.
- ✅ Authorization enforced via role/tenant guards (`requireRole`, `tenantScope`).
- ✅ Input validated with Zod before hitting services.
- ✅ Sensitive values encrypted or hashed (bcrypt for passwords, kms helpers for secrets).
- ✅ Audit logging via `apps/backend/src/services/audit-log.service.ts` where applicable.
- ✅ Frontend requests use the typed API clients under `src/lib/api/` to preserve headers and CSRF tokens.

---

## 5. Workflow Expectations

1. **Plan**: Understand related docs in `/docs` and relevant service directories before coding.
2. **Trace dependencies**: When editing a module, inspect its imports and unit tests to keep behaviour consistent.
3. **Update tests**: Modify or add tests alongside production code. New logic without tests is a red flag.
4. **Verify**: Run targeted builds/tests for the areas you touched (see table above) and capture command output for the final report.
5. **Document**: Update README/docs only when behaviour or setup materially changes.

---

## 6. Mandatory Iteration Changelog ("Unbreakable Command")

After staging your changes—but before committing—**run**:

```
pnpm changelog:update "<short summary of what changed>"
```

This invokes `scripts/update-changelog.sh`, which appends a UTC timestamped entry to `SHORT_CHANGELOG.md`. Never skip this step. If you forget, rerun it with an accurate summary before committing.

---

## 7. Differences from Previous Guidance

- The repo is now organized under `apps/*` instead of top-level `backend/` and `client/` directories.
- Frontend builds are Vite-based with design tokens provided by `packages/tokens`; older references to CRA/shadcn scaffolds have been removed.
- Backend middleware, services, and queues live under `apps/backend/src/**` (no longer `backend/src/**`).
- Deployment scripts moved to `scripts/` and Docker builds rely on the refined multi-stage Dockerfiles in `apps/**/Dockerfile`.
- A mandatory iteration changelog command (`pnpm changelog:update`) is now enforced for every agent cycle.

Keep this document updated whenever the architecture shifts. If you discover stale guidance, fix it here first.

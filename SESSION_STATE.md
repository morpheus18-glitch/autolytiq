# AutolytiQ - Current Session State

**Last Updated:** 2025-11-03 14:50 UTC
**Session ID:** 2025-11-03-bcrypt-k8s-fixes
**Status:** ✅ Active Development

---

## 🎯 Current Focus

### Recently Completed (This Session)
1. ✅ **Fixed bcrypt authentication inconsistency**
   - Standardized on `bcryptjs` across entire codebase
   - Updated seed file and package dependencies
   - Location: `packages/db/seed.ts`, `packages/db/package.json`

2. ✅ **Fixed Kubernetes memory issues**
   - Added memory limits to dev PostgreSQL StatefulSet (256Mi → 1Gi)
   - Audited all production deployments (all have proper limits)
   - Location: `infrastructure/k8s/dev/postgres-statefulset.yaml`

3. ✅ **Organized documentation structure**
   - Created organized docs/ structure with subdirectories
   - Moved 25+ MD files into logical categories
   - Created SESSION_STATE.md for session continuity

### Currently In Progress
- Installing dependencies (may need memory optimization)
- Testing authentication flow with bcryptjs

---

## 📊 Project Status Overview

### ✅ Completed & Working
- Multi-tenant architecture with Prisma
- JWT authentication (RS256)
- Role-based access control (RBAC)
- CRM with adaptive lead scoring
- ML services (FastAPI + Celery)
- Rust microservices (price-engine, comm-service)
- Frontend (React + Vite + Tailwind, mobile-first)
- Production Kubernetes deployments with proper resource limits

### ⚠️ Needs Attention
- **Dependency installation** - Hit OOM during `pnpm install --force`
  - Exit code 137 (memory kill)
  - May need to increase system memory or install in chunks

- **Database reseeding** - After bcryptjs fix
  - Run: `pnpm db:seed`
  - Verify login works with new password hashes

### 🔜 Upcoming Tasks
- Add memory-based autoscaling to K8s HPAs
- Monitor ML service memory usage (currently 1Gi → 2Gi)
- Remove unused `bcrypt` dependency from root package.json
- Test authentication end-to-end

---

## 🗂️ Documentation Structure

All documentation has been organized into `/docs/` with the following structure:

```
docs/
├── architecture/          # System architecture & design
│   ├── AGENTS.md         # Engineering standards & workflow (MANDATORY READ)
│   ├── CLAUDE.md         # Claude Code guidance for this repo
│   ├── MULTITENANCY_AI_ARCHITECTURE.md
│   └── CRM-TIMELINE-ARCHITECTURE.md
│
├── deployment/           # Deployment guides & configuration
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DEPLOYMENT_READINESS.md
│   ├── DEPLOYMENT_SOLUTION.md
│   ├── DEPLOYMENT-COMPLETE-SUMMARY.md
│   ├── DEPLOYMENT-VERIFICATION-CHECKLIST.md
│   ├── DEPLOYMENT.md
│   └── DNS-CONFIGURATION.md
│
├── features/            # Feature documentation
│   ├── CRM-ADAPTIVE-LEAD-SCORING.md
│   ├── CRM-CAPABILITIES-ANALYSIS.md
│   ├── ML-DESKING-VERIFICATION-RESULTS.md
│   ├── REVOLUTIONARY-CRM-IMPLEMENTATION-PLAN.md
│   ├── DESIGN_SYSTEM_IMPLEMENTATION.md
│   ├── UI-DESIGN-SYSTEM-COMPLETE.md
│   ├── FRONTEND-COMPONENTS-PLAN.md
│   ├── CUSTOM-PERMISSIONS-IMPLEMENTATION.md
│   └── ENTERPRISE_CRM_EXTENSION.md
│
├── fixes/               # Bug fixes & issue resolutions
│   ├── FIXES_APPLIED.md (LATEST - bcrypt & K8s memory)
│   ├── AUTOLYTIQ_401_ERROR_ANALYSIS.md
│   └── CODE-IMPROVEMENTS-SUMMARY.md
│
├── guides/              # Step-by-step guides
│   ├── TROUBLESHOOTING.md
│   ├── SCHEMA_MIGRATION_GUIDE.md
│   └── provider_setup_walkthrough.md
│
└── operations/          # Operational procedures
    ├── ops.md
    ├── secrets.md
    ├── sprint5-6-audit.md
    └── SECURITY-SUMMARY.md
```

---

## 🔑 Critical Files to Review

### On Every Session Start
1. **`SESSION_STATE.md`** (this file) - Current state and progress
2. **`docs/architecture/AGENTS.md`** - Engineering standards (MANDATORY)
3. **`docs/architecture/CLAUDE.md`** - Repository-specific guidance
4. **`docs/fixes/FIXES_APPLIED.md`** - Latest fixes (bcrypt & K8s)

### Architecture Understanding
- `docs/architecture/MULTITENANCY_AI_ARCHITECTURE.md` - Multi-tenant design
- `services/rust/README.md` - Rust microservices architecture
- `services/rust/ARCHITECTURE.md` - Detailed Rust design patterns

### Deployment
- `docs/deployment/DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `infrastructure/k8s/` - Kubernetes manifests

---

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies (may need memory optimization)
pnpm install

# Run full stack
pnpm dev

# Database operations
pnpm db:generate       # After schema changes
pnpm db:migrate:dev    # Create migration
pnpm db:seed           # Seed database (NEEDED after bcryptjs fix)

# Testing
pnpm typecheck
pnpm test
```

### Deployment
```bash
# Local Docker
./scripts/quick-deploy.sh

# Production K8s
./scripts/deploy-production.sh

# Apply dev K8s changes
kubectl apply -f infrastructure/k8s/dev/postgres-statefulset.yaml
kubectl top pods -n autolytiq-dev
```

---

## 🐛 Known Issues & Workarounds

### 1. OOM During `pnpm install`
**Issue:** Exit code 137 during dependency installation
**Workaround:**
```bash
# Option 1: Install in chunks
pnpm install --filter @repo/db
pnpm install --filter @repo/backend
pnpm install

# Option 2: Increase system memory
# Option 3: Use NODE_OPTIONS
NODE_OPTIONS="--max-old-space-size=4096" pnpm install
```

### 2. Bcrypt Authentication (FIXED)
**Issue:** Seed used `bcrypt`, auth used `bcryptjs`
**Status:** ✅ Fixed - Now standardized on `bcryptjs`
**Next Step:** Run `pnpm db:seed` to regenerate password hashes

---

## 📝 Recent Git Commits

### Latest Commit: `b2b2c8f`
```
Fix bcrypt authentication and K8s memory limits

- Standardize on bcryptjs across codebase for password hashing
- Add memory/CPU limits to dev PostgreSQL StatefulSet
- Document all fixes and recommendations
```

**Changed Files:**
- `packages/db/seed.ts` - bcrypt → bcryptjs
- `packages/db/package.json` - Added bcryptjs dependency
- `infrastructure/k8s/dev/postgres-statefulset.yaml` - Added resource limits
- `FIXES_APPLIED.md` - Documentation (now at `docs/fixes/FIXES_APPLIED.md`)

---

## 🎓 Development Philosophy

From `docs/architecture/AGENTS.md`:
- **Mobile-first design** - All UI starts with mobile viewport
- **Security first** - Input validation, auth checks, audit logging
- **Multi-tenancy always** - Tenant scoping on all routes
- **Type safety** - TypeScript + Zod validation
- **Performance critical → Rust** - Use Rust services for heavy computation

---

## 📞 Next Session Checklist

When starting the next session:
1. [ ] Read this SESSION_STATE.md
2. [ ] Check `git status` and `git log -3`
3. [ ] Review latest `docs/fixes/` for recent changes
4. [ ] Run `pnpm install` (watch for OOM)
5. [ ] Test authentication: `pnpm db:seed` then test login
6. [ ] Check K8s pod status: `kubectl get pods -n autolytiq-dev`

---

## 💡 Remember

- **Always use `pnpm`**, never npm/yarn
- **Run `pnpm db:generate`** after schema changes
- **Test mobile-first** - Start at 320px viewport
- **Chain middleware** - `authenticate` → `tenantScope` → handler
- **Use TodoWrite tool** for multi-step tasks
- **Update this SESSION_STATE.md** when starting/ending sessions

---

**End of Session State - Last Updated: 2025-11-03 14:50 UTC**

# GitHub Workflows & Toast Usage Issues

## Summary
**Generated:** 2025-11-07  
**Status:** 🚨 CRITICAL ISSUES FOUND

---

## Issue #1: Duplicate Toast Implementations (CRITICAL)

### Problem
There are **two conflicting toast implementations** in the codebase:

1. **Local Implementation** (`apps/frontend/src/hooks/use-toast.ts`)
   - 192 lines of code
   - References `@/components/ui/toast` (which doesn't exist)
   - Has imports like: `import type { ToastActionElement, ToastProps } from "@/components/ui/toast"`
   - **75 files** are importing from `@/hooks/use-toast`

2. **UI Package Implementation** (`packages/ui/src/components/Toast.tsx`)
   - 195 lines of code
   - Properly exported from `@repo/ui`
   - Has its own `useToast()` hook and `ToastProvider`
   - Only `main.tsx` uses this (via `ToastProvider`)

### Impact
- **Build failures** due to missing `@/components/ui/toast` module
- **Runtime errors** when toast hook is used
- TypeScript errors in 75+ files
- Inconsistent toast behavior across the app

### Affected Files (Sample)
```
apps/frontend/src/features/fi/pages/DealFunding.tsx
apps/frontend/src/features/fi/pages/MenuPresentation.tsx
apps/frontend/src/features/fi/pages/DealJacket.tsx
apps/frontend/src/features/fi/pages/LenderSubmission.tsx
... (71 more files)
```

### Root Cause
The local `use-toast.ts` hook was created expecting a toast component at:
```
apps/frontend/src/components/ui/toast
```

But that component **does not exist**. The actual toast component is in:
```
packages/ui/src/components/Toast.tsx
```

### Solution Required

**Option 1: Remove Local Hook (RECOMMENDED)**
1. Delete `apps/frontend/src/hooks/use-toast.ts`
2. Replace all imports:
   ```typescript
   // Before
   import { useToast } from '@/hooks/use-toast';
   
   // After
   import { useToast } from '@repo/ui';
   ```
3. Ensure `ToastProvider` is wrapping the app (already done in `main.tsx`)

**Option 2: Create Bridge Component**
1. Keep the local hook
2. Create `apps/frontend/src/components/ui/toast.tsx`:
   ```typescript
   export { Toast, ToastProvider, useToast, type ToastProps } from '@repo/ui';
   export type ToastActionElement = React.ReactNode;
   ```

**RECOMMENDED:** Option 1 - removes duplication and uses the proper design system component.

### Automated Migration Script
```bash
# Find and replace all imports
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec \
  sed -i "s|from '@/hooks/use-toast'|from '@repo/ui'|g" {} \;

# Delete the duplicate hook
rm apps/frontend/src/hooks/use-toast.ts
```

---

## Issue #2: GitHub Workflows - No Access to Repository

### Problem
Unable to access the GitHub repository workflows through the API:

```
GET https://api.github.com/repos/autolytiq/autolytiq/actions/workflows
404 Not Found
```

### Possible Causes
1. **Repository doesn't exist** at `autolytiq/autolytiq`
2. **Repository is private** and token lacks permissions
3. **Different repository name** (org/repo mismatch)

### Workflow Files Found Locally
```
.github/workflows/
├── backend.yml          (Backend Docker build + K8s deploy)
├── ci.yml              (Build, test, lint, security scan)
├── frontend.yml        (Frontend Docker build + K8s deploy)
├── ml.yml              (ML service workflow)
├── redis.yml           (Redis workflow)
├── rust-cache-service.yml
├── rust-comm-service.yml
├── rust-price-engine.yml
├── rust-rate-limiter.yml
├── rust-tax-service.yml
└── worker.yml
```

### Workflow Analysis

#### ✅ CI Workflow (`ci.yml`)
**Triggers:** Push to any branch except `main`, PRs to `main`  
**Jobs:**
1. **build-and-test** (30 min timeout)
   - Node 20, pnpm 10
   - Type check (continues on failure)
   - Lint (continues on failure)
   - Build all packages
   - Run tests (continues on failure)
   - ⚠️ Uses `|| echo "... continuing..."` pattern (masks failures)

2. **security-scan** (10 min timeout)
   - Gitleaks secret scanning
   - Requires `GITLEAKS_LICENSE` secret

#### ✅ Frontend Workflow (`frontend.yml`)
**Triggers:** 
- Push to `main` with changes to frontend/ui/tokens/shared packages
- Manual workflow_dispatch

**Environment:**
- Registry: `registry.digitalocean.com/autolytiq`
- Cluster: `autolytiq-cluster`
- Namespace: `autolytiq-prod`

**Jobs:**
1. **build** - Docker build + push to DigitalOcean Container Registry
2. **deploy** - K8s deployment with image update + rollout wait (180s)

**Build Args:**
```bash
VITE_API_URL=https://api.autolytiq.com
VITE_ML_SERVICE_URL=https://ml.autolytiq.com
```

#### ✅ Backend Workflow (`backend.yml`)
**Similar to frontend** but:
- Uses `infrastructure/docker/Dockerfile.backend`
- Creates K8s secrets with DB, JWT, Redis credentials
- Rollout timeout: 900s (15 min)

**Required Secrets:**
- `DO_TOKEN`
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_PRIVATE_KEY`
- `JWT_PUBLIC_KEY`
- `JWT_SECRET`
- `REDIS_URL`

### Potential Issues in Workflows

#### 1. CI Workflow Masks Failures
Lines 49, 52, 58 use `|| echo "... continuing..."` which causes the workflow to **always pass** even on failures:

```yaml
- name: Type check
  run: pnpm -w typecheck || echo "Type check failed, continuing..."
```

**Fix:**
```yaml
- name: Type check
  run: pnpm -w typecheck
  continue-on-error: false  # Fail the job on error
```

Or if you want warnings but not failures:
```yaml
- name: Type check
  run: pnpm -w typecheck || true  # Don't fail job
  continue-on-error: true
```

#### 2. No Workflow Status Reporting
- No status badges in README
- No notifications on failure
- No Slack/email integration

#### 3. No Environment Validation
The workflows don't validate that required secrets exist before running expensive builds.

**Suggested Addition:**
```yaml
- name: Validate secrets
  run: |
    test -n "${{ secrets.DATABASE_URL }}" || (echo "DATABASE_URL not set" && exit 1)
    test -n "${{ secrets.JWT_PRIVATE_KEY }}" || (echo "JWT_PRIVATE_KEY not set" && exit 1)
```

---

## Issue #3: Toast Hook Implementation Problems

### Code Analysis: `apps/frontend/src/hooks/use-toast.ts`

**Line 6:** References non-existent module
```typescript
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"  // ❌ This file doesn't exist
```

**Line 8-9:** Hardcoded limits
```typescript
const TOAST_LIMIT = 1              // Only 1 toast at a time
const TOAST_REMOVE_DELAY = 1000000  // 1,000 seconds (16.6 minutes!)
```
⚠️ Toast stays for 16+ minutes which is excessive.

**Correct Values (from `packages/ui/src/components/Toast.tsx`):**
```typescript
duration = 5000  // 5 seconds (reasonable)
// Multiple toasts allowed (no hard limit)
```

---

## Immediate Action Items

### Priority 1: Fix Toast Issues (CRITICAL - Blocking Builds)
```bash
# 1. Run automated migration
cd /root/autolytiq
find apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec \
  sed -i "s|from '@/hooks/use-toast'|from '@repo/ui'|g" {} \;

# 2. Delete duplicate hook
rm apps/frontend/src/hooks/use-toast.ts

# 3. Verify builds
pnpm -w build

# 4. Test toast functionality
# (Manual testing in browser)
```

### Priority 2: Fix CI Workflow
```bash
# Edit .github/workflows/ci.yml
# Remove || echo "continuing..." patterns
# Add proper continue-on-error settings
```

### Priority 3: Verify GitHub Repository Access
```bash
# Check actual repository name/URL
git remote -v

# If repository is private, ensure GitHub Actions token has:
# - repo (Full control of private repositories)
# - workflow (Update GitHub Action workflows)
```

---

## Expected Outcomes After Fixes

### ✅ Toast System
- Single source of truth: `@repo/ui/components/Toast`
- All 75 files using correct import
- TypeScript errors resolved
- Consistent toast behavior (5s duration, multiple toasts allowed)

### ✅ CI/CD
- Workflows properly fail on type/lint errors
- Clear visibility into build status
- Proper error reporting

### ✅ Developer Experience
- No more confusing duplicate implementations
- Faster builds (no ignored errors)
- Reliable deployments

---

## Files Requiring Changes

### To Delete
- `apps/frontend/src/hooks/use-toast.ts` (192 lines)

### To Modify (75 files)
All files with:
```typescript
import { useToast } from '@/hooks/use-toast';
```

Change to:
```typescript
import { useToast } from '@repo/ui';
```

**Sample Files:**
- `apps/frontend/src/features/fi/pages/DealFunding.tsx`
- `apps/frontend/src/features/fi/pages/MenuPresentation.tsx`
- `apps/frontend/src/features/fi/pages/DealJacket.tsx`
- `apps/frontend/src/features/fi/pages/LenderSubmission.tsx`
- ... (see full list by running grep command)

### Workflow Files to Review
- `.github/workflows/ci.yml` (lines 49, 52, 58)
- `.github/workflows/frontend.yml` (check build context)
- `.github/workflows/backend.yml` (check secrets)

---

## Questions to Investigate

1. **GitHub Repository:** What is the actual repository URL? (Run: `git remote -v`)
2. **Workflow Failures:** Are workflows actually failing in GitHub Actions UI?
3. **Secret Management:** Are all required secrets configured in GitHub repo settings?
4. **Deployment Status:** Are K8s deployments succeeding despite workflow masking?

---

## Related Documentation
- `/root/autolytiq/LAYOUT_PRESETS.md` - Layout system docs
- `/root/autolytiq/packages/ui/src/index.ts` - Component exports (line 132: Toast exports)
- `/root/autolytiq/apps/frontend/src/main.tsx` - ToastProvider wrapper

---

**Next Steps:**
1. Run toast migration script
2. Test build with `pnpm -w build`
3. Verify GitHub repository access
4. Review workflow execution logs in GitHub UI

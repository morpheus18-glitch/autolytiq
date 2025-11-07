# Design System Migration - Execution Plan

**Status**: ✅ Phase 0-1 Complete | 🔄 Ready for Phase 2-10  
**Branch**: `design-system-migration`  
**Backup**: `backups/frontend-src-20251106-195100.tar.gz`

---

## ✅ Completed Phases

### Phase 0 - Preflight ✅
- Verified all paths exist
- Environment: Node v20.19.5, pnpm 10.20.0
- Created branch: `design-system-migration`
- Backup created: 1.5M

### Phase 1 - Discovery ✅
- Scanned 203 app components, 54 package components
- Identified 15 USE_PACKAGE actions
- Identified 11 PROMOTE_TO_PACKAGE actions
- Identified 8 KEEP_FEATURE actions
- **See**: `OVERLAP_MATRIX.md` for full details

---

## 🔄 Remaining Phases (To Execute)

### Phase 2 - Package Hardening (NEXT)

**Objective**: Ensure packages build production-ready artifacts

#### packages/ui
```json
// Verify package.json exports
{
  "name": "@repo/ui",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "sideEffects": ["*.css"],
  "files": ["dist"]
}
```

#### packages/tokens
```json
{
  "name": "@repo/tokens",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/tokens.css",
    "./tailwind.preset.cjs": "./dist/tailwind.preset.cjs"
  },
  "files": ["dist"]
}
```

**Actions**:
1. Review tsup configs
2. Ensure CSS is copied to dist
3. Verify build outputs
4. Test package consumption

---

### Phase 3 - Promote Components

**Components to Move** (11 total):

1. ✅ **Select.tsx** (already promoted - just export sub-components)
2. **Dialog.tsx** → `packages/ui/src/components/Dialog.tsx`
3. **Toaster.tsx** + toast.tsx → `packages/ui/src/components/Toast.tsx`
4. **ThemeToggle.tsx** → `packages/ui/src/components/ThemeToggle.tsx`
5. **useToast** → `packages/ui/src/hooks/useToast.ts`
6. **ThemeProvider** + useTheme → `packages/ui/src/providers/ThemeProvider.tsx`
7-11. Check for Sheet, Popover, Command, Separator, Textarea

**Process per component**:
```bash
# Example: Dialog
cp apps/frontend/src/components/ui/dialog.tsx packages/ui/src/components/Dialog.tsx
# Update imports to use @repo/ui internally
# Add to packages/ui/src/index.ts exports
```

---

### Phase 4 - Import Codemod

**AST-based rewrite** using jscodeshift or manual sed:

```typescript
// Pattern 1: UI components
- import { Button } from '@/components/ui/button'
+ import { Button } from '@repo/ui'

// Pattern 2: Local components (if promoted)
- import { ErrorBoundary } from '@/components/ErrorBoundary'
+ import { ErrorBoundary } from '@repo/ui'

// Pattern 3: Hooks
- import { useBreakpoint } from '@/hooks/useBreakpoint'
+ import { useBreakpoint } from '@repo/ui'

// Pattern 4: Utils
- import { cn } from '@/lib/utils'
+ import { cn } from '@repo/ui'

// Pattern 5: Styles
- import '@/styles/tokens.css'
+ import '@repo/tokens/styles.css'
```

**Tool**:
```bash
# Create codemod script
pnpm add -D jscodeshift @types/jscodeshift

# Run on all .tsx/.ts files
find apps/frontend/src -name "*.tsx" -o -name "*.ts" | \
  xargs jscodeshift -t scripts/codemod-imports.ts
```

---

### Phase 5 - Compute UX (NEW)

**Add ML/Rust integration primitives**:

#### packages/tokens/src/compute-tokens.ts
```typescript
export const computeTokens = {
  latency: {
    instant: 16,      // ms - feels immediate
    fast: 100,        // ms - feels fast
    acceptable: 300,  // ms - noticeable but OK
    slow: 1000,       // ms - feels slow
  },
  confidence: {
    high: 0.95,
    medium: 0.80,
    low: 0.60,
  },
  colors: {
    confidence: {
      high: 'rgb(var(--success))',
      medium: 'rgb(var(--warning))',
      low: 'rgb(var(--error))',
    },
  },
  debounce: {
    typing: 300,
    slider: 50,
    calculation: 100,
  },
};
```

#### packages/ui/src/hooks/useCompute.ts
```typescript
export interface ComputeOptions {
  endpoint: string;
  method?: 'http' | 'ws' | 'grpc';
  debounce?: number;
  onPartial?: (data: any) => void;
}

export function useCompute<T>(options: ComputeOptions) {
  return {
    data: T | null,
    partial: T | null,
    loading: boolean,
    error: Error | null,
    confidence: number,
    ttfb: number,
    recompute: (params: any) => void,
    explain: () => ExplanationData,
  };
}
```

#### packages/ui/src/components/compute/InstantCalc.tsx
Live calculator with <100ms feedback from Rust engine

#### packages/ui/src/components/compute/ExplainDrawer.tsx
Slide-out panel showing ML model explanation

**See full spec in Phase 5 section below**

---

### Phase 6 - Wire App Entry

**apps/frontend/src/main.tsx**:
```typescript
import '@repo/tokens/styles.css';
import '@repo/ui/styles.css';
import App from './App';
// Remove all other style imports
```

**apps/frontend/src/index.css**:
- Remove token definitions (now in @repo/tokens)
- Keep only app-specific global styles

---

### Phase 7 - Build & Test

```bash
cd /root/autolytiq

# Type check
pnpm -w typecheck

# Build packages first
pnpm --filter @repo/tokens build
pnpm --filter @repo/ui build

# Build app
pnpm --filter @repo/frontend build

# Verify no errors
echo $?  # Should be 0
```

---

### Phase 8 - Delete Duplicates

**Files to delete** (after migration):
```
apps/frontend/src/components/ErrorBoundary.tsx
apps/frontend/src/components/ui/button.tsx
apps/frontend/src/components/ui/input.tsx
apps/frontend/src/components/ui/card.tsx
apps/frontend/src/components/ui/dialog.tsx (if promoted)
apps/frontend/src/components/ui/toaster.tsx (if promoted)
apps/frontend/src/components/theme-toggle.tsx (if promoted)
apps/frontend/src/hooks/use-toast.ts (if promoted)
apps/frontend/src/contexts/theme-context.tsx (if promoted)
```

**Log in MIGRATION_LOG.md**

---

### Phase 9 - Documentation

**Create DESIGN-SYSTEM-ROADMAP.md**:
- Design principles
- Package architecture
- Component inventory (stable/alpha/deprecated)
- Compute UX contracts
- Layout grammar
- Accessibility policy
- Performance budgets
- Versioning strategy
- Contribution guide
- Roadmap (DataGrid, ScenarioStudio, etc.)

---

### Phase 10 - Docker/CI/K8s

#### Dockerfile (Multi-stage)

```dockerfile
# Build stage
FROM node:20-alpine AS build
ENV CI=1
RUN corepack enable
WORKDIR /repo

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/ui/package.json packages/ui/
COPY packages/tokens/package.json packages/tokens/
COPY packages/shared/package.json packages/shared/
COPY apps/frontend/package.json apps/frontend/

# Fetch dependencies
RUN pnpm fetch

# Copy sources
COPY . .

# Build packages (order matters!)
RUN pnpm --filter @repo/tokens build
RUN pnpm --filter @repo/shared build  
RUN pnpm --filter @repo/ui build

# Build frontend
RUN pnpm --filter @repo/frontend build

# Runtime stage
FROM nginx:1.27-alpine AS runtime
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### GitHub Actions Workflow

```yaml
name: Build and Deploy Frontend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Enable pnpm
        run: corepack enable
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm -w typecheck
      
      - name: Lint
        run: pnpm -w lint
      
      - name: Build
        run: pnpm -w build
      
      - name: Build Docker image
        run: |
          docker build -t registry.digitalocean.com/autolytiq/frontend:${{ github.sha }} \
            -f apps/frontend/Dockerfile .
      
      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo "${{ secrets.DO_TOKEN }}" | docker login registry.digitalocean.com -u ${{ secrets.DO_TOKEN }} --password-stdin
          docker push registry.digitalocean.com/autolytiq/frontend:${{ github.sha }}
      
      - name: Deploy to K8s
        if: github.ref == 'refs/heads/main'
        run: |
          doctl kubernetes cluster kubeconfig save autolytiq-cluster
          kubectl set image deployment/frontend \
            frontend=registry.digitalocean.com/autolytiq/frontend:${{ github.sha }} \
            -n autolytiq-prod
```

---

## 📊 Effort Estimate

| Phase | Effort | Risk |
|-------|--------|------|
| Phase 0-1 | ✅ 1h | Low |
| Phase 2 | 1h | Low |
| Phase 3 | 3h | Medium |
| Phase 4 | 2h | Medium |
| Phase 5 | 4h | High (new) |
| Phase 6 | 0.5h | Low |
| Phase 7 | 1h | Medium |
| Phase 8 | 0.5h | Low |
| Phase 9 | 2h | Low |
| Phase 10 | 3h | High |
| **Total** | **18h** | |

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Import rewrites break pages | AST-based codemod + manual review |
| Package builds fail in Docker | Multi-stage with explicit build order |
| CSS not included in dist | Verify sideEffects + tsup copy |
| K8s can't pull workspace deps | Build artifacts in image, not sources |
| Compute UX contracts unclear | Start with simple HTTP, add WS later |

---

## 🎯 Success Criteria

- [ ] `pnpm -w build` passes
- [ ] All pages load without errors
- [ ] Docker image builds successfully  
- [ ] Image contains only built artifacts (no src/)
- [ ] K8s deployment serves working SPA
- [ ] InstantCalc component works with Rust backend
- [ ] Dark mode works across all pages
- [ ] Mobile nav works (bottom bar)
- [ ] No console errors in production

---

## 🚀 Ready to Proceed?

**Current Status**: Phase 0-1 ✅ Complete

**Next Action**: Execute Phase 2 - Package Hardening

**Command to continue**:
```bash
# Review this plan
cat MIGRATION_EXECUTION_PLAN.md

# Proceed to Phase 2
bash scripts/phase2-harden-packages.sh
```

**Estimated time to complete migration**: 16 hours remaining

---

**Questions before proceeding?**
1. Should we include Phase 5 (Compute UX) or defer it?
2. Any specific components to prioritize in Phase 3?
3. Proceed incrementally (phase by phase) or batch execute?

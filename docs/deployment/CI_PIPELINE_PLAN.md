# CI Pipeline Plan

**Generated**: 2025-11-06  
**Current State**: 6 GitHub Actions workflows  
**Objective**: Optimize build order, caching, and deployment

---

## Existing Workflows

| Workflow | File | Status | Gaps |
|----------|------|--------|------|
| Frontend | `.github/workflows/frontend.yml` | ✅ Exists | Missing pnpm cache, build order |
| Backend | `.github/workflows/backend.yml` | ✅ Exists | Missing package builds |
| Rust Services | `.github/workflows/rust.yml` | ✅ Exists | Check multi-service build |
| Rust Comm | `.github/workflows/rust-comm-service.yml` | ✅ Exists | Duplicate? Consolidate |
| ML Service | `.github/workflows/ml.yml` | ✅ Exists | Check Python deps cache |
| Redis | `.github/workflows/redis.yml` | ⚠️  Unclear | What does this deploy? |

---

## Recommended CI Architecture

### Frontend Workflow (Monorepo-Aware)

**File**: `.github/workflows/frontend-deploy.yml`

```yaml
name: Frontend Build & Deploy

on:
  push:
    branches: [main]
    paths:
      - 'apps/frontend/**'
      - 'packages/**'
      - '.github/workflows/frontend-deploy.yml'
  pull_request:
    branches: [main]
    paths:
      - 'apps/frontend/**'
      - 'packages/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'  # ← MISSING in current workflow
      
      - name: Enable pnpm
        run: corepack enable
      
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
      
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm -w typecheck
      
      - name: Lint
        run: pnpm -w lint
      
      # Build packages in correct order (CRITICAL!)
      - name: Build @repo/tokens
        run: pnpm --filter @repo/tokens build
      
      - name: Build @repo/shared
        run: pnpm --filter @repo/shared build
      
      - name: Build @repo/ui
        run: pnpm --filter @repo/ui build
      
      - name: Build @repo/domain (when created)
        run: pnpm --filter @repo/domain build || true
      
      # Build frontend
      - name: Build frontend
        run: pnpm --filter @repo/frontend build
      
      # Build Docker image
      - name: Build Docker image
        run: |
          docker build -t registry.digitalocean.com/autolytiq/frontend:${{ github.sha }} \
            -f apps/frontend/Dockerfile .
      
      # Push to DOCR (production only)
      - name: Push to DigitalOcean Container Registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo "${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}" | docker login registry.digitalocean.com -u _ --password-stdin
          docker push registry.digitalocean.com/autolytiq/frontend:${{ github.sha }}
          docker tag registry.digitalocean.com/autolytiq/frontend:${{ github.sha }} \
            registry.digitalocean.com/autolytiq/frontend:latest
          docker push registry.digitalocean.com/autolytiq/frontend:latest
      
      # Deploy to K8s
      - name: Deploy to Kubernetes
        if: github.ref == 'refs/heads/main'
        env:
          DIGITALOCEAN_ACCESS_TOKEN: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
        run: |
          doctl auth init -t $DIGITALOCEAN_ACCESS_TOKEN
          doctl kubernetes cluster kubeconfig save autolytiq-cluster
          kubectl set image deployment/frontend \
            frontend=registry.digitalocean.com/autolytiq/frontend:${{ github.sha }} \
            -n autolytiq-prod
          kubectl rollout status deployment/frontend -n autolytiq-prod
```

**Key Improvements**:
1. ✅ pnpm cache (speeds up installs)
2. ✅ Build packages in dependency order
3. ✅ Type check + lint before build
4. ✅ SHA-based image tags + latest
5. ✅ Rollout status verification

---

### Backend Workflow

**File**: `.github/workflows/backend-deploy.yml`

```yaml
name: Backend Build & Deploy

on:
  push:
    branches: [main]
    paths:
      - 'apps/backend/**'
      - 'packages/db/**'
      - 'packages/shared/**'
  
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: corepack enable
      
      - run: pnpm install --frozen-lockfile
      
      # Build dependencies
      - run: pnpm --filter @repo/shared build
      - run: pnpm --filter @repo/db generate  # Prisma generate
      
      # Build backend
      - run: pnpm --filter @repo/backend build
      
      # Run Prisma migrations (dry-run in CI)
      - name: Check migrations
        run: |
          cd packages/db
          pnpm prisma migrate diff \
            --from-schema-datamodel schema.prisma \
            --to-schema-datasource env://DATABASE_URL \
            --script || true
      
      # Build Docker
      - run: docker build -t registry.digitalocean.com/autolytiq/backend:${{ github.sha }} \
          -f apps/backend/Dockerfile .
      
      # Push & Deploy (production)
      - if: github.ref == 'refs/heads/main'
        run: |
          echo "${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}" | docker login registry.digitalocean.com -u _ --password-stdin
          docker push registry.digitalocean.com/autolytiq/backend:${{ github.sha }}
          
          doctl auth init -t ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
          doctl kubernetes cluster kubeconfig save autolytiq-cluster
          
          kubectl set image deployment/backend \
            backend=registry.digitalocean.com/autolytiq/backend:${{ github.sha }} \
            -n autolytiq-prod
```

**Key Additions**:
1. ✅ Prisma generate before build
2. ✅ Migration check (dry-run)
3. ✅ Path filters (only build when needed)

---

### Rust Services Workflow (Consolidated)

**File**: `.github/workflows/rust-services.yml`

```yaml
name: Rust Services Build & Deploy

on:
  push:
    branches: [main]
    paths:
      - 'services/rust/**'

jobs:
  build-price-engine:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          override: true
      
      - uses: Swatinem/rust-cache@v2
        with:
          workspaces: services/rust
      
      - name: Build price-engine
        run: |
          cd services/rust/price-engine
          cargo build --release
      
      - name: Build Docker image
        run: |
          cd services/rust
          docker build -t registry.digitalocean.com/autolytiq/price-engine:${{ github.sha }} \
            -f price-engine/Dockerfile .
      
      - if: github.ref == 'refs/heads/main'
        run: |
          echo "${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}" | docker login registry.digitalocean.com -u _ --password-stdin
          docker push registry.digitalocean.com/autolytiq/price-engine:${{ github.sha }}
          
          kubectl set image deployment/price-engine \
            price-engine=registry.digitalocean.com/autolytiq/price-engine:${{ github.sha }} \
            -n autolytiq-prod
  
  # Repeat for comm-service, cache-service, rate-limiter
  # Or use matrix strategy for all services
```

**Matrix Strategy** (Better approach):
```yaml
strategy:
  matrix:
    service: [price-engine, comm-service, cache-service, rate-limiter]
```

---

## Path Triggers (Smart Builds)

**Principle**: Only build what changed

```yaml
# Frontend: Build if frontend or packages change
paths:
  - 'apps/frontend/**'
  - 'packages/ui/**'
  - 'packages/tokens/**'
  - 'packages/shared/**'

# Backend: Build if backend or DB changes
paths:
  - 'apps/backend/**'
  - 'packages/db/**'
  - 'packages/shared/**'

# Rust: Build if Rust code changes
paths:
  - 'services/rust/**'
```

---

## Secrets Required

Add to GitHub repository secrets:

```
DIGITALOCEAN_ACCESS_TOKEN    # For DOCR + doctl + kubectl
DATABASE_URL                 # For Prisma migration checks (optional)
REDIS_URL                    # For integration tests (optional)
SENTRY_DSN                   # For error tracking
```

---

## Build Order Dependencies

**Graph**:
```
@repo/tokens (0 deps)
    ↓
@repo/shared (uses tokens)
    ↓
@repo/ui (uses tokens + shared)
    ↓
@repo/domain (uses ui + shared) [TO CREATE]
    ↓
apps/frontend (uses all)
```

**CI Implementation**:
```yaml
- run: pnpm --filter @repo/tokens build
- run: pnpm --filter @repo/shared build
- run: pnpm --filter @repo/ui build
- run: pnpm --filter @repo/domain build  # When created
- run: pnpm --filter @repo/frontend build
```

---

## Performance Optimizations

### 1. pnpm Cache
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

**Impact**: ~2-3 min saved per build

### 2. Rust Cache
```yaml
- uses: Swatinem/rust-cache@v2
```

**Impact**: ~5-10 min saved per build

### 3. Docker Layer Caching
```yaml
- uses: docker/setup-buildx-action@v2
- uses: docker/build-push-action@v4
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Impact**: ~3-5 min saved per build

---

## Recommended Workflow Structure

```
.github/workflows/
├── frontend-deploy.yml      # Frontend (SPA)
├── backend-deploy.yml       # Backend API
├── rust-services.yml        # All Rust services (matrix)
├── ml-service.yml           # Python ML service
├── database-migrations.yml  # Prisma migrations (manual trigger)
├── pr-checks.yml            # Lint, type check, test (PRs only)
└── nightly-tests.yml        # E2E tests (scheduled)
```

---

## Next Steps

1. ✅ Review existing workflows (`.github/workflows/*.yml`)
2. ⚠️  Add pnpm caching
3. ⚠️  Fix build order (packages before apps)
4. ⚠️  Add path filters
5. ⚠️  Consolidate Rust workflows
6. ⚠️  Add PR checks workflow
7. ⚠️  Add rollout verification

**Priority**: High - Affects all deployments

**See Also**:
- K8S_READINESS.md - Deployment commands
- PROJECT_CONTEXT.md - Build graph


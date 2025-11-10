# AutolytiQ Production Foundation - ESM-First Architecture
**Created**: 2025-11-08 01:04 UTC  
**Branch**: rescue-20251107-180523  
**Philosophy**: True ESM, Contract-First, Mobile-Ready, Zero Compromises

---

## 🎯 CORE PRINCIPLES

### 1. **True ESM Everywhere**
- ❌ No CommonJS (`require`, `module.exports`)
- ✅ Pure ES Modules (`import`, `export`)
- ✅ `"type": "module"` in all package.json files
- ✅ `.js` extensions in imports (ESM requirement)
- ✅ `tsconfig.json` with `"module": "ESNext"`, `"moduleResolution": "bundler"`

### 2. **Contract-First Development**
- ✅ OpenAPI 3.1 for REST APIs (TypeScript codegen)
- ✅ gRPC with Protocol Buffers for high-performance services
- ✅ Contracts define types, implementations follow
- ✅ Client/Server code generated from contracts
- ✅ Version all contracts (semver)

### 3. **Build Quality from Day 1**
- ✅ TypeScript strict mode (`strict: true`, `noUncheckedIndexedAccess: true`)
- ✅ UI package builds `.d.ts` reliably (tsup with proper config)
- ✅ ESLint + Prettier enforced via pre-commit hooks
- ✅ Vitest for unit tests (100% pass before commit)
- ✅ GitHub Actions CI/CD (build, test, type-check on every PR)

### 4. **Mobile-Ready Architecture**
- ✅ Shared business logic (`packages/shared`) - zero Node.js deps
- ✅ API contracts work for React Native
- ✅ UI components use primitives (later: React Native Paper/Tamagui)
- ✅ State management framework-agnostic (Zustand works in RN)
- ✅ Design tokens portable (JSON → CSS/RN StyleSheet)

### 5. **Polyglot Services**
- ✅ **Frontend**: React 18 (Vite + SWC)
- ✅ **Backend**: Node.js + Express (ESM) or Fastify
- ✅ **ML Service**: Python FastAPI with Pydantic contracts
- ✅ **High-Performance**: Rust with tonic (gRPC) + Axum (REST)
- ✅ All services communicate via contracts (OpenAPI/gRPC)

---

## 📁 MONOREPO STRUCTURE (Clean Slate)

```
autolytiq/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Build, test, type-check
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── contracts/                      # Contract-First Development
│   ├── openapi/
│   │   ├── auth.openapi.yaml       # Auth endpoints
│   │   ├── crm.openapi.yaml        # CRM endpoints
│   │   └── inventory.openapi.yaml  # Inventory endpoints
│   ├── grpc/
│   │   ├── pricing.proto           # High-perf pricing
│   │   └── ml.proto                # ML predictions
│   └── generated/                  # Auto-generated clients/servers
│       ├── typescript/
│       ├── python/
│       └── rust/
│
├── packages/                       # Shared Libraries
│   ├── tokens/                     # Design tokens (ESM)
│   │   ├── package.json            # "type": "module"
│   │   ├── src/
│   │   │   ├── tokens.json         # Source of truth
│   │   │   └── index.ts            # ESM exports
│   │   └── tsconfig.json           # moduleResolution: bundler
│   │
│   ├── ui/                         # V2Auto Component Library (ESM)
│   │   ├── package.json            # "type": "module"
│   │   ├── tsup.config.ts          # ESM build with DTS
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Card.tsx
│   │   │   └── index.ts            # Barrel export
│   │   └── dist/
│   │       ├── index.js            # ESM bundle
│   │       └── index.d.ts          # Type definitions
│   │
│   ├── shared/                     # Shared Types & Utils (ESM, Browser-Safe)
│   │   ├── package.json            # NO Node.js deps
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── user.ts
│   │   │   │   ├── customer.ts
│   │   │   │   └── vehicle.ts
│   │   │   ├── schemas/            # Zod schemas
│   │   │   │   ├── user.schema.ts
│   │   │   │   └── customer.schema.ts
│   │   │   ├── utils/
│   │   │   │   ├── formatters.ts
│   │   │   │   └── validators.ts
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   │
│   ├── db/                         # Database Layer (ESM)
│   │   ├── package.json
│   │   ├── prisma/
│   │   │   └── schema.prisma       # Minimal 5 tables
│   │   ├── src/
│   │   │   ├── client.ts           # Prisma client export
│   │   │   └── index.ts
│   │   └── tsconfig.json
│   │
│   └── config/                     # Shared Configs
│       ├── tsconfig.base.json      # Base TS config
│       ├── tsconfig.react.json     # React apps
│       ├── tsconfig.node.json      # Node.js apps
│       ├── eslint.base.js          # Base ESLint
│       └── vitest.config.ts        # Base Vitest
│
├── apps/                           # Applications
│   ├── frontend/                   # React SPA (Vite + ESM)
│   │   ├── package.json            # "type": "module"
│   │   ├── vite.config.ts          # ESM, React, SWC
│   │   ├── tsconfig.json           # extends @repo/config
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes/
│   │       ├── pages/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── stores/
│   │       └── lib/
│   │
│   └── backend/                    # Express API (ESM)
│       ├── package.json            # "type": "module"
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts            # ESM entry
│           ├── app.ts
│           ├── routes/
│           ├── middleware/
│           ├── services/
│           └── lib/
│
├── services/                       # Microservices
│   ├── ml-service/                 # Python FastAPI
│   │   ├── pyproject.toml
│   │   ├── src/
│   │   │   ├── main.py
│   │   │   ├── models/
│   │   │   └── contracts/          # Generated from .proto
│   │   └── tests/
│   │
│   └── rust/                       # Rust Services
│       ├── pricing-engine/         # gRPC service
│       │   ├── Cargo.toml
│       │   ├── build.rs            # Proto codegen
│       │   └── src/
│       │       ├── main.rs
│       │       └── server.rs
│       └── shared/
│           └── proto/              # Shared .proto files
│
├── _backup/                        # Archived old files
│   ├── README.md                   # What's here and why
│   ├── frontend-archive/
│   ├── backend-archive/
│   └── packages-archive/
│
├── scripts/                        # Build & Dev Scripts
│   ├── generate-contracts.sh       # OpenAPI + gRPC codegen
│   ├── setup-dev.sh                # One-command dev setup
│   └── validate-esm.sh             # Check for CJS leaks
│
├── package.json                    # Root package (ESM)
├── pnpm-workspace.yaml
├── .gitignore
├── .nvmrc                          # Node 20.x LTS
└── turbo.json                      # Optional: Turborepo for caching

```

---

## 🔧 ESM CONFIGURATION

### Root `package.json`:
```json
{
  "name": "@autolytiq/root",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r --filter \"!@autolytiq/frontend\" build",
    "build:all": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test",
    "contracts:generate": "bash scripts/generate-contracts.sh",
    "db:generate": "pnpm --filter @autolytiq/db generate",
    "db:migrate": "pnpm --filter @autolytiq/db migrate:dev"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "turbo": "^1.11.0",
    "typescript": "5.6.3",
    "vitest": "^2.1.4"
  }
}
```

### `packages/ui/package.json` (Rock-Solid DTS):
```json
{
  "name": "@autolytiq/ui",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0"
  },
  "peerDependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  }
}
```

### `packages/ui/tsup.config.ts` (No DTS Flake):
```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      moduleResolution: 'bundler',
      module: 'ESNext',
    },
  },
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";', // For Next.js compatibility
    };
  },
});
```

### `packages/ui/tsconfig.json` (ESM-First):
```json
{
  "extends": "../config/tsconfig.react.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": false,
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules"]
}
```

---

## 📝 CONTRACT-FIRST DEVELOPMENT

### OpenAPI Example (`contracts/openapi/auth.openapi.yaml`):
```yaml
openapi: 3.1.0
info:
  title: AutolytiQ Auth API
  version: 1.0.0
  
paths:
  /api/auth/login:
    post:
      operationId: login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  user:
                    $ref: '#/components/schemas/User'
                  token:
                    type: string

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        role:
          type: string
          enum: [SALESPERSON, SALES_MANAGER, FINANCE_MANAGER, GM, ADMIN]
        firstName:
          type: string
        lastName:
          type: string
```

### Generate TypeScript Client:
```bash
# Install openapi-typescript
pnpm add -D openapi-typescript

# Generate
npx openapi-typescript contracts/openapi/auth.openapi.yaml -o contracts/generated/typescript/auth.ts
```

### gRPC Example (`contracts/grpc/pricing.proto`):
```protobuf
syntax = "proto3";

package pricing;

service PricingEngine {
  rpc CalculatePayment (PaymentRequest) returns (PaymentResponse);
}

message PaymentRequest {
  double amount_financed = 1;
  double apr = 2;
  int32 term_months = 3;
}

message PaymentResponse {
  double monthly_payment = 1;
  double total_interest = 2;
  double total_cost = 3;
}
```

---

## 🏗️ BUILD PIPELINE (Quality Gates)

### GitHub Actions CI (`ci.yml`):
```yaml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Validate ESM
        run: bash scripts/validate-esm.sh
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Lint
        run: pnpm lint
      
      - name: Build packages
        run: pnpm build
      
      - name: Run tests
        run: pnpm test
      
      - name: Check DTS files
        run: |
          if [ ! -f packages/ui/dist/index.d.ts ]; then
            echo "ERROR: UI package DTS not generated"
            exit 1
          fi
```

### ESM Validation Script (`scripts/validate-esm.sh`):
```bash
#!/bin/bash
set -e

echo "🔍 Validating ESM-only setup..."

# Check for CJS leaks
if grep -r "module.exports" packages/ apps/ --include="*.ts" --include="*.tsx" --include="*.js"; then
  echo "❌ Found module.exports (CJS) - use export instead"
  exit 1
fi

if grep -r "require(" packages/ apps/ --include="*.ts" --include="*.tsx" --include="*.js"; then
  echo "❌ Found require() (CJS) - use import instead"
  exit 1
fi

# Check package.json files
for pkg in packages/*/package.json apps/*/package.json; do
  if ! grep -q '"type": "module"' "$pkg"; then
    echo "❌ Missing 'type: module' in $pkg"
    exit 1
  fi
done

echo "✅ All packages are ESM-compliant"
```

---

## 📱 MOBILE-READY ARCHITECTURE

### Shared Package Rules:
```typescript
// ✅ ALLOWED in packages/shared/
import { z } from 'zod';
import { formatDistance } from 'date-fns';

// ❌ FORBIDDEN in packages/shared/
import fs from 'fs';              // Node.js only
import { prisma } from '@autolytiq/db';  // Server-only
```

### Future React Native Integration:
```
apps/
├── frontend/           # React web (current)
└── mobile/             # React Native (future)
    ├── package.json
    ├── app/            # Expo Router
    ├── components/     # RN-specific UI
    └── shared/         # Import from @autolytiq/shared
```

**Shared Code:**
- ✅ `@autolytiq/shared` - Types, schemas, formatters
- ✅ API contracts (OpenAPI → fetch)
- ✅ Zustand stores (work in RN)
- ✅ Design tokens (JSON → RN StyleSheet)

**Platform-Specific:**
- ❌ `@autolytiq/ui` - Web only (later: `@autolytiq/ui-native`)
- ❌ `@autolytiq/db` - Server only

---

## 🎯 IMPLEMENTATION PHASES

### Phase 0: Archive & Clean (Today - 1 hour)
- [ ] Move all current files to `_backup/`
- [ ] Create clean ESM structure
- [ ] Setup base configs (tsconfig, eslint)
- [ ] Validate ESM compliance

### Phase 1: Foundation (Days 1-2)
- [ ] `packages/tokens` - ESM build
- [ ] `packages/shared` - Types + schemas (Zod)
- [ ] `packages/ui` - 5 components with rock-solid DTS
- [ ] `packages/db` - Prisma schema (5 tables)
- [ ] Verify: `pnpm build` passes, DTS generated

### Phase 2: Contracts (Days 3-4)
- [ ] OpenAPI specs for auth + CRM
- [ ] gRPC specs for pricing
- [ ] Setup codegen scripts
- [ ] Generate TypeScript clients
- [ ] Generate Python clients (FastAPI)
- [ ] Generate Rust servers (tonic)

### Phase 3: Backend (Days 5-6)
- [ ] Express ESM server
- [ ] Auth endpoints (from OpenAPI)
- [ ] JWT middleware
- [ ] Database integration
- [ ] Health checks

### Phase 4: Frontend (Days 7-8)
- [ ] React Router 6 setup
- [ ] Login page (V2Auto components)
- [ ] Auth store (Zustand)
- [ ] Protected routes
- [ ] Role-based dashboards (5 roles)

### Phase 5: ML Service (Days 9-10)
- [ ] FastAPI server (Python)
- [ ] Pydantic models from contracts
- [ ] gRPC endpoint for pricing
- [ ] Mock ML predictions

### Phase 6: Rust Services (Days 11-14)
- [ ] Pricing engine (tonic gRPC)
- [ ] Payment calculations
- [ ] Connect to backend via gRPC
- [ ] Performance benchmarks

### Phase 7: CI/CD (Days 15-16)
- [ ] GitHub Actions workflows
- [ ] Automated tests
- [ ] Build verification
- [ ] Deploy to staging

---

## ✅ QUALITY GATES (Must Pass)

### Before Every Commit:
- [ ] `pnpm typecheck` - Zero TypeScript errors
- [ ] `pnpm lint` - Zero ESLint warnings
- [ ] `pnpm test` - All tests pass
- [ ] `bash scripts/validate-esm.sh` - No CJS leaks

### Before Every PR Merge:
- [ ] CI passes (build, test, typecheck)
- [ ] DTS files generated (check `packages/ui/dist/index.d.ts`)
- [ ] No `any` types (except explicit escape hatches)
- [ ] Code review approved

### Before Production Deploy:
- [ ] E2E tests pass (Playwright)
- [ ] Performance benchmarks pass
- [ ] Security audit (pnpm audit)
- [ ] Contracts versioned (semver)

---

## 📦 DELIVERABLES

1. **Clean ESM Monorepo** - Zero CJS, pure ES modules
2. **Contract-First APIs** - OpenAPI + gRPC specs
3. **Rock-Solid UI Library** - DTS always generates
4. **Mobile-Ready Foundation** - Shared logic portable to RN
5. **Quality CI/CD** - Automated checks on every commit
6. **Polyglot Services** - Node, Python, Rust working together

---

**NEXT STEP**: Archive existing files and create clean ESM foundation?

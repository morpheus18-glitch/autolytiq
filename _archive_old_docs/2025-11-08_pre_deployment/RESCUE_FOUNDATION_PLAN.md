# AutolytiQ Rescue Foundation Plan
**Created**: 2025-11-08  
**Branch**: rescue-20251107-180523  
**Philosophy**: Clean, tight, constraint-based architecture. Build unbreakable foundations.

---

## 🎯 FOUNDATION PRINCIPLES

### 1. **Monorepo Structure** (Tight Constraints)
```
autolytiq/
├── packages/         # Shared libraries (TypeScript only)
│   ├── tokens/      ✅ Design system tokens
│   ├── ui/          ✅ React component library (Radix + CVA)
│   ├── db/          🔄 Prisma schema + client (strict tenant isolation)
│   ├── shared/      🔄 Types, utilities, validation schemas (Zod)
│   └── config/      🆕 Shared configs (tsconfig, eslint, tailwind base)
├── apps/            # Applications
│   ├── frontend/    ✅ React SPA (Vite + React Router 6)
│   └── backend/     🔄 Express API (TypeScript, REST + GraphQL future)
└── services/        # Microservices (optional, later phase)
    ├── ml-service/  ⏸️  Python FastAPI (AI/ML)
    └── rust/        ⏸️  High-performance services
```

### 2. **No Premature Abstractions**
- ❌ Don't build `insights-engine`, `state-bus`, `policy-engine` until we NEED them
- ❌ Don't create "framework" packages
- ✅ Start with `shared` utils and extract patterns AFTER seeing repetition 3+ times

### 3. **Type Safety First**
- Every package exports TypeScript types
- Zod schemas for runtime validation
- No `any` types allowed (enforce with ESLint)
- Strict mode everywhere

### 4. **Build Constraints**
- Each package builds independently (`pnpm -r build` must work)
- No circular dependencies (enforce with madge or dependency-cruiser)
- Frontend can NEVER import from backend
- Shared packages have ZERO React dependencies

---

## 📦 PACKAGE-BY-PACKAGE PLAN

### ✅ **packages/tokens** (Already Clean)
**Status**: KEEP AS-IS  
**Purpose**: Design system tokens (colors, spacing, typography, shadows)  
**Exports**: 
- TypeScript types
- Tailwind preset
- CSS variables

**Dependencies**: None (pure data)

---

### ✅ **packages/ui** (Foundation Ready)
**Status**: EXPAND INCREMENTALLY  
**Current**: Button, ToastProvider  
**Next 5 Components** (in order):
1. Input (text, email, password, number)
2. Label (form labels with error states)
3. Select (dropdown with search)
4. Checkbox (with indeterminate state)
5. Card (layout primitive with header/content/footer slots)

**Rules**:
- Every component uses CVA for variants
- Every component has Storybook story (when we add it)
- Every component exports TypeScript props interface
- Zero business logic (pure UI)
- Radix primitives where possible

**Dependencies**:
- `@repo/tokens` (design tokens)
- `radix-ui/*` (primitives)
- `class-variance-authority` (variants)
- `tailwind-merge` (className merging)

---

### 🔄 **packages/db** (Needs Cleanup)
**Status**: AUDIT AND SIMPLIFY  
**Current Issues**: Likely has 80+ models from old architecture

**Action Plan**:
1. Start with MINIMAL schema (5 core models):
   - `Tenant` (id, name, domain, settings)
   - `User` (id, tenantId, email, role)
   - `Customer` (id, tenantId, firstName, lastName, email, phone)
   - `Vehicle` (id, tenantId, vin, year, make, model)
   - `Deal` (id, tenantId, customerId, vehicleId, status)

2. Add indexes:
   - `[tenantId, createdAt]` on ALL tables
   - Unique constraints on natural keys

3. Multi-tenant guard:
   - Prisma middleware to auto-inject `tenantId` filter
   - Export `getPrismaClient(tenantId)` factory

**Dependencies**:
- `@prisma/client`
- `prisma` (devDep)

---

### 🔄 **packages/shared** (Needs Creation)
**Status**: CREATE FROM SCRATCH  
**Purpose**: Shared types, utilities, validation schemas

**Structure**:
```typescript
packages/shared/
├── src/
│   ├── types/          # TypeScript types
│   │   ├── user.ts
│   │   ├── customer.ts
│   │   ├── vehicle.ts
│   │   └── deal.ts
│   ├── schemas/        # Zod validation
│   │   ├── user.schema.ts
│   │   ├── customer.schema.ts
│   │   └── ...
│   ├── utils/          # Pure functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── calculations.ts
│   └── constants/      # Enums, config
│       ├── roles.ts
│       ├── statuses.ts
│       └── permissions.ts
└── index.ts            # Barrel export
```

**Rules**:
- NO React dependencies
- NO Node.js dependencies (must run in browser)
- Pure TypeScript + Zod only
- Every type has corresponding Zod schema

**Dependencies**:
- `zod` only

---

### 🆕 **packages/config** (New Package)
**Status**: CREATE  
**Purpose**: Shared configuration files

**Contents**:
```
packages/config/
├── tsconfig.base.json       # Base TypeScript config
├── tsconfig.react.json      # React app config
├── tsconfig.node.json       # Node.js config
├── eslint.base.js           # Base ESLint rules
├── eslint.react.js          # React rules
├── tailwind.base.js         # Base Tailwind config
└── vitest.config.ts         # Base Vitest config
```

**Benefit**: Single source of truth for all configs

---

### ✅ **apps/frontend** (Already Clean)
**Status**: BUILD INCREMENTALLY  
**Current**: Minimal Hello World

**Phase 1 Goals** (Next 2 days):
1. React Router 6 setup with nested routes
2. Authentication layout (login page)
3. Authenticated app shell (header, sidebar, content)
4. First real page: Dashboard (static cards)

**Structure**:
```
apps/frontend/src/
├── main.tsx              ✅ Entry point
├── App.tsx               ✅ Root component
├── routes/               🆕 Route definitions
│   ├── index.tsx         # Route config
│   ├── auth/             # Auth routes
│   └── app/              # Authenticated routes
├── layouts/              🆕 Layout components
│   ├── AuthLayout.tsx
│   └── AppLayout.tsx
├── pages/                🆕 Page components
│   ├── Login.tsx
│   └── Dashboard.tsx
├── components/           🆕 Feature components
├── hooks/                🆕 Custom hooks
└── lib/                  🆕 Utils, API clients
```

**Dependencies**:
- `@repo/ui` (components)
- `@repo/tokens` (tokens)
- `@repo/shared` (types, schemas)
- `react-router-dom` (routing)
- `@tanstack/react-query` (server state)
- `zustand` (client state)

---

### 🔄 **apps/backend** (Needs Cleanup)
**Status**: REBUILD MINIMAL API  
**Current Issues**: Likely has 80+ routes, complex middleware

**Phase 1 Goals** (Next 2 days):
1. Express server with CORS, helmet, error handling
2. JWT authentication middleware
3. 5 core endpoints:
   - `POST /auth/login` - Login
   - `GET /auth/me` - Current user
   - `GET /customers` - List customers (paginated)
   - `GET /vehicles` - List vehicles (paginated)
   - `GET /deals` - List deals (paginated)

**Structure**:
```
apps/backend/src/
├── index.ts              # Server entry
├── app.ts                # Express app
├── routes/               # Route handlers
│   ├── auth.ts
│   ├── customers.ts
│   ├── vehicles.ts
│   └── deals.ts
├── middleware/           # Middleware
│   ├── auth.ts           # JWT verify
│   ├── tenant.ts         # Tenant isolation
│   └── error.ts          # Error handler
├── services/             # Business logic
│   ├── auth.service.ts
│   └── customer.service.ts
└── lib/                  # Utils
    ├── prisma.ts         # Prisma client
    └── jwt.ts            # JWT utils
```

**Dependencies**:
- `@repo/db` (database)
- `@repo/shared` (types, schemas)
- `express`
- `jsonwebtoken`
- `zod` (validation)

---

## 🚫 WHAT TO DELETE

### Delete Immediately:
- `packages/insights-engine` ⏸️ (Build later when needed)
- `packages/state-bus` ⏸️ (Use Zustand in frontend for now)
- `packages/policy-engine` ⏸️ (Build when we have complex rules)
- `packages/layout-recipes` ⏸️ (Build layouts in frontend first)
- `packages/customization` ⏸️ (Theming v2 feature)

### Archive for Reference:
- `apps/frontend/_archive_20251107-173529/` (Keep for 30 days, then delete)

---

## 🎯 PHASE 1: FOUNDATION (Next 3 Days)

### Day 1: Package Setup ✅
- [x] Audit existing packages
- [ ] Create `packages/config` with shared configs
- [ ] Clean up `packages/db` to 5 core models
- [ ] Create `packages/shared` with types + schemas
- [ ] Remove unneeded packages (insights, state-bus, etc.)
- [ ] Verify all packages build: `pnpm -r build`

### Day 2: Backend Core 🔄
- [ ] Minimal Express server
- [ ] JWT authentication
- [ ] 5 core REST endpoints
- [ ] Prisma client with tenant middleware
- [ ] Error handling + validation
- [ ] Test with curl/Postman

### Day 3: Frontend Core 🔄
- [ ] React Router 6 setup
- [ ] Login page (static UI)
- [ ] App shell layout (header, sidebar)
- [ ] Dashboard page (static cards)
- [ ] API client with React Query
- [ ] Auth flow (login → dashboard)

---

## 🎯 PHASE 2: CORE FEATURES (Days 4-7)

### Day 4-5: Customer Management
- [ ] Backend: CRUD endpoints for customers
- [ ] Frontend: Customer list page (table)
- [ ] Frontend: Customer detail page
- [ ] Frontend: Add/Edit customer form
- [ ] UI Components: Table, Form, Modal

### Day 6-7: Vehicle & Deal Management
- [ ] Backend: CRUD endpoints for vehicles + deals
- [ ] Frontend: Vehicle list + detail pages
- [ ] Frontend: Deal list + detail pages
- [ ] UI Components: Status badges, filters

---

## 🎯 PHASE 3: DEAL DESK (Days 8-14)

### Week 2: Minimal Deal Desk
- [ ] Backend: Deal calculation endpoints
- [ ] Frontend: Basic deal entry form
- [ ] Frontend: Payment calculator
- [ ] UI Components: Slider, number input
- [ ] Real-time calculation (debounced)

---

## ✅ SUCCESS CRITERIA

### Foundation Phase Complete When:
1. ✅ `pnpm install` works cleanly
2. ✅ `pnpm -r build` builds all packages
3. ✅ `pnpm typecheck` passes with zero errors
4. ✅ Backend starts and responds to health check
5. ✅ Frontend starts and renders login page
6. ✅ Can login and see dashboard
7. ✅ No circular dependencies
8. ✅ All imports resolve correctly

### Quality Gates:
- Zero TypeScript errors
- Zero ESLint errors
- All API responses validated with Zod
- All forms validated with Zod + React Hook Form
- 100% type coverage (no `any`)

---

## 🔧 TOOLING

### Required:
- `pnpm` (monorepo package manager)
- `tsup` (package bundler)
- `vite` (frontend dev server)
- `tsx` (TypeScript executor)
- `eslint` (linting)
- `vitest` (testing)

### Later:
- `storybook` (UI component docs) - Phase 4
- `playwright` (E2E tests) - Phase 5
- `madge` (dependency analysis) - Phase 2

---

## 📝 NEXT IMMEDIATE ACTIONS

1. **Audit `packages/db`**: Check what models exist, decide what to keep
2. **Create `packages/config`**: Extract shared configs
3. **Create `packages/shared`**: Start with 5 core type files
4. **Delete unused packages**: Move to `_archive/` folder
5. **Commit clean state**: "chore: establish rescue branch foundation"

---

**Ready to proceed?** Let's start with the package audit.

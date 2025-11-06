# AGENTS.md - AI Agent Instructions & Safety Rules

**Purpose**: Ensure all AI agents (GitHub Copilot, Cursor, Claude, etc.) follow consistent patterns and avoid breaking the codebase  
**Last Updated**: 2025-11-06  
**Priority**: CRITICAL - Read this FIRST before making any changes

---

## 🚨 CRITICAL RULES - NEVER VIOLATE

### 1. NO DUPLICATION
```
❌ NEVER create duplicate files, components, or routes
❌ NEVER copy existing logic to a new location
❌ NEVER create new VIN decode implementations
❌ NEVER create new API client instances

✅ ALWAYS check if functionality exists first
✅ ALWAYS import from existing locations
✅ ALWAYS ask before creating new files
```

### 2. NO BREAKING CHANGES
```
❌ NEVER delete files without explicit permission
❌ NEVER modify shared packages without testing all consumers
❌ NEVER change API contracts without version bump
❌ NEVER move files that are imported elsewhere

✅ ALWAYS check imports before moving/deleting
✅ ALWAYS run typecheck after changes
✅ ALWAYS test build before committing
```

### 3. RESPECT THE BUILD ORDER
```
Build Dependency Graph:
@repo/tokens (0 deps) → ALWAYS BUILD FIRST
    ↓
@repo/shared (uses tokens)
    ↓
@repo/ui (uses tokens + shared)
    ↓
@repo/domain (uses ui + shared) [TO BE CREATED]
    ↓
apps/frontend (uses all packages)

❌ NEVER make frontend depend on backend
❌ NEVER create circular dependencies
❌ NEVER skip package builds in CI

✅ ALWAYS respect dependency direction
✅ ALWAYS build packages before apps
```

### 4. FOLLOW ROUTING PATTERNS
```
React Router 6 is THE ONLY router

❌ NEVER use Wouter (deprecated)
❌ NEVER create duplicate routes
❌ NEVER hardcode URLs

✅ ALWAYS use React Router 6 patterns
✅ ALWAYS check apps/frontend/src/routes/index.tsx first
✅ ALWAYS use nested routing
```

---

## 📂 REPOSITORY STRUCTURE - MANDATORY KNOWLEDGE

### Workspace Layout
```
autolytiq/
├── apps/
│   ├── frontend/          ← React SPA (Vite + React Router 6)
│   ├── backend/           ← Express.js API
│   ├── ml_backend/        ← Python ML (FastAPI)
│   └── worker/            ← Background jobs
│
├── packages/
│   ├── ui/                ← Shared components (@repo/ui)
│   ├── tokens/            ← Design tokens (@repo/tokens)
│   ├── db/                ← Prisma schema (@repo/db)
│   ├── shared/            ← Shared utils (@repo/shared)
│   └── domain/            ← Business logic [TO CREATE]
│
├── services/
│   └── rust/              ← 4 Rust microservices (gRPC)
│       ├── price-engine/  ← Port 50051
│       ├── comm-service/  ← Port 50052
│       ├── cache-service/ ← Port 50053
│       └── rate-limiter/  ← Port 50054
│
└── infrastructure/
    └── k8s/               ← Kubernetes manifests
```

### Package Purposes

**@repo/tokens** (packages/tokens):
- Design system tokens (colors, typography, spacing)
- Exports: CSS variables, TypeScript types, Tailwind preset
- NO dependencies
- Build: `pnpm --filter @repo/tokens build`

**@repo/shared** (packages/shared):
- Cross-platform utilities
- Exports: Types, validators, constants, utils
- Depends on: @repo/tokens
- Build: `pnpm --filter @repo/shared build`

**@repo/ui** (packages/ui):
- Shared component library
- 54 components (needs ~30 more)
- Exports: Button, Card, Input, etc. + mobile components
- Depends on: @repo/tokens, @repo/shared
- Build: `pnpm --filter @repo/ui build`

**@repo/domain** (packages/domain) ⚠️ TO CREATE:
- Business logic layer
- API adapters, hooks, validators
- NO UI components (use @repo/ui)
- Will depend on: @repo/ui, @repo/shared

**@repo/db** (packages/db):
- Prisma schema (80+ models)
- Migrations
- NO business logic
- Build: `pnpm --filter @repo/db prisma generate`

---

## 🎯 GOLDEN RULES - MEMORIZE THESE

### Rule 1: Component Placement

```typescript
// ✅ CORRECT - Generic UI component
// Location: packages/ui/src/components/Button.tsx
export function Button({ children, variant }: ButtonProps) {
  return <button className={buttonVariants({ variant })}>{children}</button>;
}

// ✅ CORRECT - Domain entity card
// Location: packages/ui/src/components/VehicleCard.tsx
export function VehicleCard({ vehicle }: VehicleCardProps) {
  return <Card>...</Card>;
}

// ✅ CORRECT - App-specific page
// Location: apps/frontend/src/pages/deals/DealStudioDesktop.tsx
export function DealStudioDesktop() {
  const { data } = useDeals(); // From @repo/domain when created
  return <PageContainer>...</PageContainer>;
}

// ❌ WRONG - UI component in app
// Location: apps/frontend/src/components/Button.tsx
export function Button() { ... } // DUPLICATE! Use @repo/ui

// ❌ WRONG - Page in packages
// Location: packages/ui/src/components/DealStudioDesktop.tsx
export function DealStudioDesktop() { ... } // Too specific for package!
```

**Decision Matrix**:
| Component Type | Location | Example |
|----------------|----------|---------|
| Generic UI primitive | packages/ui | Button, Input, Card |
| Domain entity card | packages/ui | VehicleCard, CustomerCard |
| Layout pattern | packages/ui | ListDetailLayout, PageHeader |
| Mobile component | packages/ui | MobileCard, BottomNav |
| Page composition | apps/frontend/pages | DealStudioDesktop |
| App-specific logic | apps/frontend | AppShell, navigation config |
| Business logic | packages/domain | API adapters, hooks |

### Rule 2: NO Direct API Calls

```typescript
// ❌ WRONG - Direct API call in component
function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  
  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(setVehicles);
  }, []);
  
  return <div>{vehicles.map(v => ...)}</div>;
}

// ✅ CORRECT - Use domain layer (when @repo/domain exists)
// File: packages/domain/src/vehicle/api.ts
export async function getVehicles(filters: VehicleFilters) {
  const response = await api.get('/vehicles', { params: filters });
  return response.data;
}

// File: packages/domain/src/vehicle/hooks.ts
export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: () => getVehicles(filters)
  });
}

// File: apps/frontend/src/pages/inventory/vehicles.tsx
import { useVehicles } from '@repo/domain/vehicle/hooks';

function VehicleList() {
  const { data: vehicles, isLoading } = useVehicles({ status: 'active' });
  return <div>{vehicles?.map(v => ...)}</div>;
}
```

**Action Items**:
- ⚠️ **138 files need migration** - Do NOT add to this list!
- ✅ Create @repo/domain package first
- ✅ Migrate incrementally (20 files/week)

### Rule 3: VIN Decode - SINGLE SOURCE OF TRUTH

```typescript
// ⚠️ CURRENTLY: 20 files have VIN logic (NEEDS CONSOLIDATION)

// ❌ WRONG - Creating new VIN decode
function MyNewVINDecoder(vin: string) {
  const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`);
  return response.json();
}

// ✅ CORRECT - Use existing (after consolidation)
// File: packages/domain/src/vehicle/vin.ts (TO CREATE)
export async function decodeVIN(vin: string): Promise<VehicleData>;
export function validateVIN(vin: string): boolean;
export function useVINDecoder(): { decode, isLoading, error };

// File: apps/frontend/src/pages/inventory/add-vehicle.tsx
import { useVINDecoder } from '@repo/domain/vehicle/vin';

function AddVehicle() {
  const { decode, isLoading } = useVINDecoder();
  
  const handleVINInput = async (vin: string) => {
    const data = await decode(vin);
    // ...
  };
}
```

**VIN Locations** (DO NOT ADD MORE):
```
apps/frontend/src/hooks/useVINDecoder.ts (CANONICAL - promote this)
apps/frontend/src/lib/vin.ts (if exists - merge with above)
apps/frontend/src/pages/inventory/*.tsx (inline - migrate to hook)
apps/backend/src/services/vin.ts (separate backend implementation OK)
```

### Rule 4: Instant Calculations (Rust Integration)

```typescript
// ❌ WRONG - Manual "Calculate" button
function PaymentCalculator() {
  const [params, setParams] = useState(initialParams);
  const [payment, setPayment] = useState(null);
  
  const handleCalculate = async () => {
    const result = await fetch('/api/calculate', { method: 'POST', body: JSON.stringify(params) });
    setPayment(result.payment);
  };
  
  return (
    <>
      <Input onChange={e => setParams({ ...params, amount: e.target.value })} />
      <Button onClick={handleCalculate}>Calculate</Button> {/* ❌ NO! */}
    </>
  );
}

// ✅ CORRECT - Debounced instant calculation
import { useDebouncedValue } from '@repo/ui/hooks';
import { usePaymentCalculation } from '@repo/domain/pricing/hooks';

function PaymentCalculator() {
  const [params, setParams] = useState(initialParams);
  const debouncedParams = useDebouncedValue(params, 300); // 300ms debounce
  
  const { data: payment, isLoading } = usePaymentCalculation(debouncedParams);
  
  return (
    <>
      <Input 
        onChange={e => setParams({ ...params, amount: e.target.value })} 
      />
      {isLoading && <Spinner />}
      {payment && <div>Monthly: ${payment.monthlyPayment}</div>}
    </>
  );
}
```

**Rust Pricing Service**:
- Service: `services/rust/price-engine`
- Port: 50051 (gRPC)
- Target latency: < 100ms
- Backend adapter: `apps/backend/src/services/pricing.ts`

### Rule 5: Design Tokens (NO Hardcoded Colors)

```typescript
// ❌ WRONG - Hardcoded Tailwind classes
<div className="bg-blue-500 text-white border-gray-300">
  {/* ❌ NO! Use design tokens */}
</div>

// ✅ CORRECT - Use token-based Tailwind classes
<div className="bg-primary text-primary-foreground border-border">
  {/* ✅ Uses CSS variables from @repo/tokens */}
</div>

// ✅ ALSO CORRECT - Use CVA variants from components
import { Button } from '@repo/ui';

<Button variant="primary" size="md">
  {/* ✅ Variants defined in packages/ui/src/components/Button.tsx */}
</Button>

// ✅ ALSO CORRECT - CSS variables directly
<div style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}>
  {/* ✅ CSS vars from packages/tokens/dist/tokens.css */}
</div>
```

**Token Categories**:
- Colors: `--primary`, `--surface`, `--text`, `--border`, etc.
- Typography: `--font-sans`, `--font-mono`, `--text-sm`, etc.
- Spacing: `--spacing-1` through `--spacing-12`
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
- Animations: `--transition-fast`, `--transition-normal`

### Rule 6: Mobile-First Development

```typescript
// ❌ WRONG - Desktop-only component
function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="flex gap-4 p-4"> {/* ❌ Doesn't adapt to mobile */}
      <img src={vehicle.image} className="w-64 h-48" />
      <div>
        <h3 className="text-2xl">{vehicle.year} {vehicle.make}</h3>
        <p className="text-gray-600">{vehicle.vin}</p>
      </div>
    </div>
  );
}

// ✅ CORRECT - Mobile-first with responsive classes
import { MobileCard, useBreakpoint } from '@repo/ui';

function VehicleCard({ vehicle }: VehicleCardProps) {
  const { isMobile } = useBreakpoint();
  
  if (isMobile) {
    return (
      <MobileCard
        title={`${vehicle.year} ${vehicle.make}`}
        subtitle={vehicle.model}
        image={vehicle.image}
        meta={vehicle.vin}
      />
    );
  }
  
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <img src={vehicle.image} className="w-full md:w-64 h-48 object-cover rounded" />
      <div>
        <h3 className="text-lg md:text-2xl font-semibold">
          {vehicle.year} {vehicle.make}
        </h3>
        <p className="text-sm text-muted-foreground">{vehicle.vin}</p>
      </div>
    </div>
  );
}
```

**Mobile Utilities** (from @repo/ui):
- `useBreakpoint()` - Detect screen size
- `useMobileBreakpoint()` - Simplified mobile check
- `MobileCard` - Pre-built mobile card layout
- `ResponsiveButton` - Size adapts to screen
- `BottomNav` - Mobile navigation pattern

---

## 🚫 ANTI-PATTERNS - NEVER DO THESE

### 1. Duplicate Routes

```typescript
// ❌ WRONG - Creating duplicate route
// File: apps/frontend/src/routes/index.tsx (ALREADY HAS THIS)
{ path: '/vehicles', element: <VehicleList /> }

// Then in another file:
// File: apps/frontend/src/App.tsx
<Route path="/vehicles" element={<VehicleList />} /> // ❌ DUPLICATE!

// ✅ CORRECT - Check existing routes first
// File: apps/frontend/src/routes/index.tsx
// All routes are centralized here - add new routes to this file ONLY
```

**Current Routing Structure**:
```typescript
// apps/frontend/src/routes/index.tsx (SINGLE SOURCE OF TRUTH)
{
  path: '/',
  element: <RootLayout />,
  children: [
    { path: 'dashboard', element: <Dashboard /> },
    { path: 'crm/*', element: <CRMRoutes /> },
    { path: 'deals/*', element: <DealsRoutes /> },
    { path: 'inventory/*', element: <InventoryRoutes /> },
    { path: 'accounting/*', element: <AccountingRoutes /> },
    // ... 151 pages total
  ]
}
```

**Before Adding Route**:
1. Search codebase: `grep -r "path.*vehicles" apps/frontend/src/`
2. Check `apps/frontend/src/routes/index.tsx`
3. If route exists, use it; if not, add to centralized file

### 2. Duplicate Components

```typescript
// ❌ WRONG - Component already exists in @repo/ui
// File: apps/frontend/src/components/Button.tsx
export function Button({ variant, children }: ButtonProps) {
  return <button className={...}>{children}</button>;
}

// ✅ CORRECT - Import from package
import { Button } from '@repo/ui';

// ✅ ALSO CORRECT - Extend package component
import { Button as BaseButton } from '@repo/ui';

export function AppButton({ specialProp, ...props }: AppButtonProps) {
  return <BaseButton {...props} onClick={handleSpecialCase} />;
}
```

**Before Creating Component**:
1. Check `packages/ui/src/components/`
2. Check `packages/ui/src/index.ts` exports
3. Search: `find packages/ui -name "*Button*"`
4. If exists, import it; if not, consider promoting to package

### 3. Duplicate API Clients

```typescript
// ❌ WRONG - Creating new axios instance
// File: apps/frontend/src/pages/vehicles/list.tsx
import axios from 'axios';

const api = axios.create({ baseURL: '/api' }); // ❌ DUPLICATE!

// ✅ CORRECT - Use shared client (when @repo/domain exists)
// File: packages/domain/src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// File: apps/frontend/src/pages/vehicles/list.tsx
import { apiClient } from '@repo/domain/api/client';
```

### 4. Circular Dependencies

```typescript
// ❌ WRONG - Package imports from app
// File: packages/ui/src/components/VehicleCard.tsx
import { useAuth } from '../../../apps/frontend/src/hooks/useAuth'; // ❌ NEVER!

// ✅ CORRECT - Pass auth as prop
// File: packages/ui/src/components/VehicleCard.tsx
export function VehicleCard({ vehicle, canEdit }: VehicleCardProps) {
  return canEdit ? <EditButton /> : null;
}

// File: apps/frontend/src/pages/vehicles/list.tsx
import { VehicleCard } from '@repo/ui';
import { useAuth } from '@/hooks/useAuth';

function VehicleList() {
  const { hasPermission } = useAuth();
  return <VehicleCard vehicle={v} canEdit={hasPermission('edit_vehicles')} />;
}
```

**Dependency Rules**:
- Packages NEVER import from apps
- Apps CAN import from packages
- Packages CAN import from other packages (respect build order)
- @repo/ui should NOT import domain logic

### 5. Breaking Existing Imports

```typescript
// ❌ WRONG - Moving file without updating imports
// Moving: apps/frontend/src/components/VehicleCard.tsx
//      → packages/ui/src/components/VehicleCard.tsx
// WITHOUT updating all imports!

// ✅ CORRECT - Check all usages first
# Find all imports
grep -r "from.*VehicleCard" apps/frontend/src/

# Update all imports FIRST
# Then move file
# Then verify build: pnpm -w typecheck
```

---

## 🔨 REQUIRED CHECKS BEFORE COMMITTING

### Pre-Commit Checklist

```bash
# 1. Type check (MANDATORY)
pnpm -w typecheck
# ✅ Must pass with 0 errors

# 2. Lint (MANDATORY)
pnpm -w lint
# ✅ Must pass (warnings OK, errors not OK)

# 3. Build packages (if changed)
pnpm --filter @repo/tokens build
pnpm --filter @repo/shared build
pnpm --filter @repo/ui build
# ✅ All must succeed

# 4. Build frontend (if changed)
pnpm --filter @repo/frontend build
# ✅ Must succeed

# 5. Check for duplicates (RECOMMENDED)
find . -name "Button.tsx" | grep -v node_modules
find . -name "VehicleCard.tsx" | grep -v node_modules
# ✅ Should see minimal results (only in packages/ui or app, not both)

# 6. Search for direct API calls (if touched data layer)
grep -r "fetch\|axios\.get\|axios\.post" apps/frontend/src/pages/ | wc -l
# ⚠️ Should not increase from current 138
```

### Build Order Verification

```bash
# Verify build order works
pnpm install --frozen-lockfile
pnpm --filter @repo/tokens build && \
pnpm --filter @repo/shared build && \
pnpm --filter @repo/ui build && \
pnpm --filter @repo/frontend build

# ✅ All should succeed in order
# ❌ If any fails, fix before committing
```

---

## 📋 COMMON TASKS - SAFE PATTERNS

### Task: Add New UI Component

```bash
# 1. Check if already exists
find packages/ui/src -name "*Card*"
grep "export.*Card" packages/ui/src/index.ts

# 2. If doesn't exist, create in package
# File: packages/ui/src/components/MyCard.tsx
import { Card } from './Card';
export function MyCard({ title, children }: MyCardProps) {
  return <Card>{children}</Card>;
}

# 3. Export from package
# File: packages/ui/src/index.ts
export { MyCard } from './components/MyCard';
export type { MyCardProps } from './components/MyCard';

# 4. Build package
pnpm --filter @repo/ui build

# 5. Use in app
# File: apps/frontend/src/pages/example.tsx
import { MyCard } from '@repo/ui';
```

### Task: Add New Page/Route

```bash
# 1. Check if route exists
grep -r "path.*my-page" apps/frontend/src/routes/

# 2. Create page component
# File: apps/frontend/src/pages/my-feature/MyPage.tsx
import { PageContainer, PageHeader } from '@repo/ui';

export function MyPage() {
  return (
    <PageContainer>
      <PageHeader title="My Page" />
      {/* content */}
    </PageContainer>
  );
}

# 3. Add route to centralized file
# File: apps/frontend/src/routes/index.tsx
import { MyPage } from '@/pages/my-feature/MyPage';

// In routes array:
{ path: 'my-feature/my-page', element: <MyPage /> }

# 4. Test navigation
# Visit: http://localhost:5173/my-feature/my-page
```

### Task: Promote Component to Package

```bash
# 1. Verify component is reusable (not app-specific)
# Check: Does it contain business logic? → Keep in app
# Check: Is it a generic UI pattern? → Promote to package

# 2. Copy to package
cp apps/frontend/src/components/MyComponent.tsx \
   packages/ui/src/components/MyComponent.tsx

# 3. Update internal imports in copied file
# Change: import { X } from '@/components/...'
# To:     import { X } from './...'

# 4. Export from package
# File: packages/ui/src/index.ts
export { MyComponent } from './components/MyComponent';

# 5. Build package
pnpm --filter @repo/ui build

# 6. Update app imports
# File: apps/frontend/src/components/MyComponent.tsx
# DELETE or comment: "Moved to @repo/ui"

# Find all usages:
grep -r "from.*MyComponent" apps/frontend/src/

# Update all to:
import { MyComponent } from '@repo/ui';

# 7. Verify build
pnpm -w typecheck
pnpm --filter @repo/frontend build

# 8. Delete original (AFTER verification)
rm apps/frontend/src/components/MyComponent.tsx
```

### Task: Add API Endpoint Consumer

```bash
# ⚠️ CURRENT STATE: @repo/domain doesn't exist yet
# Until created, follow this pattern:

# 1. Create domain hook in app (temporary location)
# File: apps/frontend/src/hooks/useVehicles.ts
import { useQuery } from '@tanstack/react-query';

export function useVehicles(filters: VehicleFilters) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      const response = await fetch('/api/vehicles?' + new URLSearchParams(filters));
      return response.json();
    }
  });
}

# 2. Use hook in page
# File: apps/frontend/src/pages/vehicles/list.tsx
import { useVehicles } from '@/hooks/useVehicles';

function VehicleList() {
  const { data: vehicles, isLoading } = useVehicles({ status: 'active' });
  return <div>...</div>;
}

# 3. TODO: Move to @repo/domain when created
# packages/domain/src/vehicle/hooks.ts
```

---

## 🔍 HOW TO CHECK BEFORE CREATING

### Before Creating a New File

```bash
# 1. Search by filename
find . -name "MyComponent.tsx" | grep -v node_modules

# 2. Search by export name
grep -r "export.*MyComponent" packages/ apps/

# 3. Search by functionality
grep -r "VIN.*decode" apps/frontend/src/ packages/

# 4. Check package exports
grep "MyComponent" packages/ui/src/index.ts
```

### Before Adding a Route

```bash
# 1. Check centralized routes file
cat apps/frontend/src/routes/index.tsx | grep "vehicles"

# 2. Search for path usage
grep -r "path.*vehicles" apps/frontend/src/

# 3. Search for useNavigate usage
grep -r "navigate.*vehicles" apps/frontend/src/
```

### Before Creating API Call

```bash
# 1. Check if endpoint already consumed
grep -r "/api/vehicles" apps/frontend/src/

# 2. Check for existing hooks
find apps/frontend/src/hooks -name "*vehicle*"
find packages/domain/src/vehicle -name "*hooks*" 2>/dev/null

# 3. Check TanStack Query keys
grep -r "queryKey.*vehicles" apps/frontend/src/
```

---

## 📝 COMMIT MESSAGE FORMAT

```bash
# Use Conventional Commits format

# Features
git commit -m "feat(ui): add VehicleCard component"
git commit -m "feat(domain): add useVehicles hook"

# Fixes
git commit -m "fix(frontend): correct vehicle list pagination"
git commit -m "fix(ui): Button variant styling"

# Refactoring
git commit -m "refactor(frontend): migrate API calls to domain layer"
git commit -m "refactor(ui): consolidate card components"

# Documentation
git commit -m "docs: update AGENTS.md with routing patterns"

# Breaking changes
git commit -m "feat(ui)!: change Button API to support new variants

BREAKING CHANGE: Button now requires variant prop"
```

---

## 🎯 DECISION TREES

### Where Should This Component Go?

```
Is it reusable across multiple pages?
├─ NO → apps/frontend/src/components/
└─ YES
    └─ Does it contain domain/business logic?
        ├─ YES → apps/frontend/src/components/ (or extract logic to @repo/domain)
        └─ NO → packages/ui/src/components/
```

### Should I Create a New File or Use Existing?

```
Do I need to implement [functionality]?
├─ Search codebase for similar names/exports
├─ Check packages/ui/src/index.ts exports
├─ Check apps/frontend/src/ structure
└─ Found existing?
    ├─ YES → Import and use it
    └─ NO → Safe to create (but verify via grep first)
```

### Should This Be in @repo/domain or app?

```
Is this an API call or data fetching?
├─ YES
│   └─ Does it use app-specific state (auth, tenant)?
│       ├─ YES → apps/frontend/src/hooks/ (temporary, move to domain later)
│       └─ NO → packages/domain/src/ (when created)
└─ NO
    └─ Is it UI rendering?
        ├─ YES → Use @repo/ui components
        └─ NO → Business logic → packages/domain/src/
```

---

## 🚀 QUICK REFERENCE COMMANDS

```bash
# Check what exists
find packages/ui/src -name "*.tsx" | xargs basename | sort | uniq
grep "^export" packages/ui/src/index.ts

# Find duplicates
find . -name "Button.tsx" | grep -v node_modules
find . -name "*.tsx" -exec basename {} \; | sort | uniq -d

# Check imports of a file before moving
grep -r "from.*MyComponent" apps/frontend/src/

# Verify build order
pnpm -w build

# Type check everything
pnpm -w typecheck

# Find direct API calls (should decrease over time)
grep -r "fetch.*\/api\/" apps/frontend/src/ | wc -l
grep -r "axios\." apps/frontend/src/ | wc -l

# Find VIN implementations (should be 1 after consolidation)
grep -r "nhtsa\|vpic" apps/frontend/src/ -i | wc -l
```

---

## 📚 REFERENCE DOCUMENTATION

**Start with these (in order)**:
1. `PROJECT_CONTEXT.md` - Repository structure & golden rules
2. `COMPONENT_MIGRATION_PLAN.md` - What needs to move where
3. `CI_PIPELINE_PLAN.md` - Build process
4. `AGENTS.md` - This file

**For specific tasks**:
- Adding component: See "Task: Add New UI Component" above
- Adding route: Check `apps/frontend/src/routes/index.tsx` first
- API calls: Wait for @repo/domain or follow temporary pattern
- Database: See `DB_SCHEMA_AUDIT.md`
- Deployment: See `K8S_READINESS.md`

---

## ⚠️ WHEN IN DOUBT

```
STOP ✋

1. Read PROJECT_CONTEXT.md golden rules
2. Search codebase for existing implementations
3. Check this file (AGENTS.md) for the pattern
4. Ask before creating duplicates
5. Run typecheck before committing

Better to ask than to create duplicates or break builds!
```

---

## 🎯 SUCCESS METRICS

Track these to verify you're following patterns:

```bash
# Should DECREASE over time:
grep -r "fetch\|axios" apps/frontend/src/pages/ | wc -l  # Current: 138

# Should be 1 (or 2 with backend):
grep -r "DecodeVin\|NHTSA" apps/frontend/src/ | wc -l    # Target: 1

# Should INCREASE over time:
grep "^export" packages/ui/src/index.ts | wc -l          # Current: 54, Target: 80+

# Should always be 0:
find . -name "Button.tsx" | grep -v node_modules | grep -v packages/ui  # Should be empty
```

---

**Last Updated**: 2025-11-06  
**Next Review**: When @repo/domain is created  
**Maintained By**: Development team  
**Questions?**: Check PROJECT_CONTEXT.md or ask before making changes


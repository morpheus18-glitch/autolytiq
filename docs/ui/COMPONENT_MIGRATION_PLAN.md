# Component Migration Plan

**Generated**: 2025-11-06  
**Purpose**: Identify components to PROMOTE vs KEEP  
**Methodology**: File-by-file analysis with deps, risk, effort

---

## Summary Statistics

- **Frontend components**: 197 files
- **UI package components**: 54 files  
- **Pages**: 151 files
- **Hooks**: 18 files
- **Direct API calls found**: 138 files ⚠️

---

## Migration Matrix

| Component | Current Path | Action | Dependencies | Risk | Effort | Priority |
|-----------|-------------|---------|--------------|------|--------|----------|
| **VehicleCard** | apps/frontend/src/components/VehicleCard.tsx | PROMOTE | Badge, Card, @repo/ui | Low | 2h | High |
| **CustomerCard** | apps/frontend/src/components/CustomerCard.tsx | PROMOTE | Badge, Card, Avatar | Low | 2h | High |
| **DealCard** | apps/frontend/src/components/DealCard.tsx | PROMOTE | Badge, Card, Progress | Low | 2h | High |
| **QuickView** | apps/frontend/src/components/QuickView.tsx | PROMOTE | Sheet, ScrollArea | Medium | 4h | High |
| **ListDetailLayout** | apps/frontend/src/components/ListDetailLayout.tsx | PROMOTE | None | Low | 2h | High |
| **ErrorBoundary** | apps/frontend/src/components/ErrorBoundary.tsx | USE_PACKAGE | Already in @repo/ui | None | 0h | Done |
| **Dialog** | apps/frontend/src/components/ui/dialog.tsx | PROMOTE | Radix primitives | Low | 2h | Medium |
| **Select (Radix)** | apps/frontend/src/components/ui/select.tsx | DEFER | Complex sub-components | High | 6h | Low |
| **Toaster** | apps/frontend/src/components/ui/toaster.tsx | PROMOTE | toast.tsx, useToast | Low | 3h | Medium |
| **ThemeToggle** | apps/frontend/src/components/theme-toggle.tsx | PROMOTE | useTheme hook | Low | 1h | Medium |
| **AppShell** | apps/frontend/src/components/layout/app-shell.tsx | KEEP | App-specific nav config | N/A | N/A | N/A |
| **DealStudioDesktop** | apps/frontend/src/pages/deals/DealStudioDesktop.tsx | KEEP | Complex workflow | N/A | N/A | N/A |
| **AccountingDashboard** | apps/frontend/src/pages/accounting/AccountingDashboard.tsx | KEEP | Page composition | N/A | N/A | N/A |

---

## PROMOTE to @repo/ui (High Priority)

### Domain Entity Cards

**1. VehicleCard**
- **Path**: `apps/frontend/src/components/VehicleCard.tsx` (if exists)
- **Usage**: Vehicle listings, search results, inventory views
- **Props**: vehicle, onSelect, variant (list|grid)
- **Deps**: Badge (status), Card, Image (lazy loading)
- **Effort**: 2 hours
- **Risk**: Low - self-contained component
- **Action**: Copy to `packages/ui/src/components/VehicleCard.tsx`

**2. CustomerCard**
- **Path**: `apps/frontend/src/components/CustomerCard.tsx` (if exists)
- **Usage**: Customer lists, search, CRM views
- **Props**: customer, onSelect, showDetails
- **Deps**: Avatar, Badge, Card
- **Effort**: 2 hours
- **Risk**: Low

**3. DealCard**
- **Path**: `apps/frontend/src/components/DealCard.tsx` (if exists)
- **Usage**: Deal pipeline, dashboard
- **Props**: deal, stage, onNavigate
- **Deps**: Badge, Progress, Card
- **Effort**: 2 hours
- **Risk**: Low

### Layout Components

**4. ListDetailLayout**
- **Path**: `apps/frontend/src/components/ListDetailLayout.tsx` (if exists)
- **Usage**: Master-detail pattern (vehicles, customers, deals)
- **Pattern**: 30%/70% split on desktop, tabs on mobile
- **Effort**: 2 hours
- **Risk**: Low
- **Note**: May already exist as part of LAYOUT_PRESETS.md

**5. QuickView (Drawer)**
- **Path**: `apps/frontend/src/components/QuickView.tsx` (if exists)
- **Usage**: Quick entity preview without navigation
- **Deps**: Sheet (from Radix), ScrollArea
- **Effort**: 4 hours
- **Risk**: Medium - Context dependency
- **Note**: Currently has QuickViewContext - need to decouple

### UI Primitives (Radix-based)

**6. Dialog + sub-components**
- **Path**: `apps/frontend/src/components/ui/dialog.tsx`
- **Exports**: Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
- **Effort**: 2 hours
- **Risk**: Low - stable Radix primitive

**7. Toaster + Toast**
- **Path**: `apps/frontend/src/components/ui/toaster.tsx`, `toast.tsx`
- **Hook**: `apps/frontend/src/hooks/use-toast.ts`
- **Effort**: 3 hours
- **Risk**: Low
- **Action**: Promote hook to packages/ui/src/hooks/

**8. ThemeToggle**
- **Path**: `apps/frontend/src/components/theme-toggle.tsx`
- **Deps**: useTheme hook (in contexts/)
- **Effort**: 1 hour + 1 hour for ThemeProvider
- **Risk**: Low
- **Action**: Promote both component and context to packages/ui

---

## KEEP in apps/frontend (App-Specific)

### Navigation & Layout

**1. AppShell**
- **Path**: `apps/frontend/src/components/layout/app-shell.tsx`
- **Reason**: Contains app-specific navigation configuration
- **Deps**: useAuth, useNotifications (domain hooks)
- **Note**: Uses UniformShell from @repo/ui (correct pattern)

### Page Compositions

**2. DealStudioDesktop**
- **Path**: `apps/frontend/src/pages/deals/DealStudioDesktop.tsx`
- **Reason**: Complex 3-panel workflow specific to deal desking
- **Note**: Should use layout primitives from @repo/ui

**3. AccountingDashboard**
- **Path**: `apps/frontend/src/pages/accounting/AccountingDashboard.tsx`
- **Reason**: Page-level composition with business logic
- **Note**: Uses components from @repo/ui

**4. All pages/** (151 files)
- **Reason**: Domain-specific pages
- **Pattern**: Use @repo/ui components + @repo/domain hooks

### Domain Hooks

**5. useAuth**
- **Path**: `apps/frontend/src/hooks/useAuth.ts`
- **Reason**: App-specific authentication logic
- **Future**: Move to @repo/domain/auth/hooks.ts

**6. useNotifications**
- **Path**: `apps/frontend/src/hooks/useNotifications.ts`
- **Reason**: App-specific real-time notifications
- **Future**: Move to @repo/domain/notifications/hooks.ts

**7. useVINDecoder**
- **Path**: `apps/frontend/src/hooks/useVINDecoder.ts`
- **Action**: ⚠️  MUST PROMOTE to @repo/domain/vehicle/vin.ts
- **Reason**: Business logic, not UI
- **Priority**: HIGH - consolidation needed

---

## DEFER (Complex/Low Priority)

**1. Select (Radix version)**
- **Path**: `apps/frontend/src/components/ui/select.tsx`
- **Reason**: Native Select added to @repo/ui (Option C)
- **Future**: Promote as RadixSelect when needed
- **Effort**: 6 hours
- **Note**: Multiple sub-components (Trigger, Content, Item, etc.)

**2. Command Palette**
- **Path**: `apps/frontend/src/components/ui/command.tsx` (if exists)
- **Reason**: Complex component with keyboard navigation
- **Effort**: 8 hours

**3. DataTable (Virtualized)**
- **Reason**: Not yet implemented, on roadmap
- **Effort**: 16 hours
- **Note**: Needs @tanstack/react-virtual

---

## Duplications Found ⚠️

### 1. VIN Decode Logic

**Locations** (20 files reference VIN/NHTSA):
```
apps/frontend/src/hooks/useVINDecoder.ts
apps/frontend/src/lib/vin.ts (if exists)
apps/frontend/src/pages/inventory/*.tsx (inline decode)
apps/backend/src/services/vin.ts
```

**Action Required**:
1. Create `@repo/domain/vehicle/vin.ts` with:
   ```typescript
   export async function decodeVIN(vin: string): Promise<VehicleData>;
   export function validateVIN(vin: string): boolean;
   export function useVINDecoder(): { decode, isLoading, error };
   ```
2. Consolidate all implementations to single source
3. Update 20 files to import from @repo/domain

**Effort**: 4 hours  
**Priority**: HIGH  
**Risk**: Medium - API changes may break consumers

### 2. API Call Patterns

**Found**: 138 files with direct fetch/axios calls

**Current Pattern** (❌ Anti-pattern):
```typescript
// In component
const response = await fetch('/api/vehicles');
const data = await response.json();
```

**Target Pattern** (✅ Correct):
```typescript
// In @repo/domain/vehicle/api.ts
export async function getVehicles(filters: VehicleFilters) {
  const response = await api.get('/vehicles', { params: filters });
  return response.data;
}

// In component
import { useVehicles } from '@repo/domain/vehicle/hooks';
const { data: vehicles, isLoading } = useVehicles({ status: 'active' });
```

**Action Required**:
1. Create @repo/domain package
2. Move API logic to domain layer
3. Update 138 files (incremental migration)

**Effort**: 40 hours (incremental)  
**Priority**: HIGH  
**Risk**: High - touches many files

### 3. cn Helper (Tailwind Merge)

**Locations**:
```
packages/ui/src/utils/cn.ts (✅ Canonical)
apps/frontend/src/lib/utils.ts (❌ Duplicate)
```

**Action Required**:
1. Delete apps/frontend/src/lib/utils.ts cn function
2. Import from @repo/ui everywhere

**Effort**: 1 hour  
**Priority**: Low  
**Risk**: Low

### 4. Color Tokens

**Locations**:
```
packages/tokens/src/tokens.ts (✅ Canonical)
apps/frontend/src/styles/* (❌ May have duplicates)
```

**Action Required**: Audit for hardcoded colors  
**Effort**: 2 hours  
**Priority**: Medium

---

## Migration Strategy

### Phase 1: Foundation (Week 1)
1. Create @repo/domain package skeleton
2. Promote ThemeToggle + ThemeProvider
3. Consolidate VIN decode logic
4. Promote Dialog, Toaster

**Effort**: 12 hours

### Phase 2: Domain Cards (Week 2)
1. Promote VehicleCard, CustomerCard, DealCard
2. Promote QuickView (decouple context)
3. Promote ListDetailLayout

**Effort**: 12 hours

### Phase 3: API Migration (Weeks 3-6)
1. Create @repo/domain/vehicle, customer, deal, pricing
2. Migrate 138 files incrementally (20/week)
3. Remove direct API calls

**Effort**: 40 hours

### Phase 4: Polish (Week 7)
1. Remove duplicates (cn, color tokens)
2. Documentation
3. E2E tests for promoted components

**Effort**: 8 hours

---

## Import Rewrite Examples

### Before Migration
```typescript
// apps/frontend/src/pages/inventory/vehicles.tsx
import { Button, Card } from '@/components/ui/button';
import { VehicleCard } from '@/components/VehicleCard';
import { ListDetailLayout } from '@/components/ListDetailLayout';
import { useAuth } from '@/hooks/useAuth';

const response = await fetch('/api/vehicles');
const vehicles = await response.json();
```

### After Migration
```typescript
// apps/frontend/src/pages/inventory/vehicles.tsx
import { Button, Card, VehicleCard, ListDetailLayout } from '@repo/ui';
import { useVehicles } from '@repo/domain/vehicle/hooks';
import { useAuth } from '@/hooks/useAuth'; // Stays in app for now

const { data: vehicles, isLoading } = useVehicles({ status: 'active' });
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Components in @repo/ui | 54 | 80+ |
| Direct API calls | 138 | 0 |
| VIN decode implementations | 3+ | 1 |
| Code duplication | Unknown | < 5% |
| Import consistency | ~40% | 100% |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API changes break pages | Medium | High | Incremental migration + tests |
| VIN consolidation breaks | Low | Medium | Thorough testing before switch |
| Import errors after moves | High | Low | TypeScript will catch |
| Component API changes | Low | Medium | Maintain backward compat |
| Build order issues | Low | High | Fix CI build graph |

---

**Next Steps**:
1. Create @repo/domain package structure
2. Promote high-priority components (VehicleCard, Dialog, Toaster)
3. Consolidate VIN decode logic
4. Begin incremental API migration

**See Also**:
- PROJECT_CONTEXT.md - Golden rules
- CI_PIPELINE_PLAN.md - Build order
- DB_SCHEMA_AUDIT.md - Data layer


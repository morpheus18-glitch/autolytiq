# Migration Strategy - Controlled Component Recovery

## Philosophy

**Don't rewrite what already works - migrate it cleanly.**

We have 6MB of working code in `_archive_old_code/2025-11-08_old_frontend/src/`. Instead of rebuilding from scratch, we'll **incrementally pull back** the good pieces, ensuring:

1. ✅ Correct imports (use `@repo/ui` components)
2. ✅ Proper exports (clean module boundaries)
3. ✅ No duplication (one source of truth)
4. ✅ Type safety (proper TypeScript)
5. ✅ Build validation (must build after each migration)

---

## The Archive Inventory

**Location**: `_archive_old_code/2025-11-08_old_frontend/src/`

**What's There**:
```
src/
├── components/       # 26+ UI components (some duplicates of @repo/ui)
├── contexts/         # Auth, theme, notification contexts
├── features/         # Feature-specific modules
├── hooks/            # 10+ custom hooks
├── lib/              # Utility functions
├── modules/          # Business logic modules
├── pages/            # 152+ page components
├── routes/           # Route configurations
└── screens/          # Screen-level components
```

---

## Migration Phases

### Phase 1: Foundation (Week 1)
**Goal**: Get the app shell working with navigation

**Migrate**:
1. ✅ **Layouts** (`layouts/AppLayout.tsx`)
   - App shell structure
   - Navigation sidebar
   - Header/footer

2. ✅ **Auth Context** (`contexts/AuthContext.tsx`)
   - User authentication state
   - Login/logout logic
   - Protected routes

3. ✅ **Route Configuration** (`routes/index.tsx`)
   - React Router 6 setup
   - Nested route structure
   - Lazy loading

4. ✅ **Theme Provider** (`contexts/ThemeContext.tsx`)
   - Dark mode support
   - Theme switching

**Don't Migrate Yet**:
- ❌ Individual pages (wait for Phase 2)
- ❌ Old UI components (use `@repo/ui` instead)
- ❌ Feature modules (wait for Phase 3)

---

### Phase 2: Core Pages (Week 2)
**Goal**: Get 5-10 essential pages working

**Migrate** (in order):
1. **Dashboard** (`pages/dashboard/DashboardPage.tsx`)
2. **Login** (`pages/auth/LoginPage.tsx`)
3. **Customers List** (`pages/crm/CustomersPage.tsx`)
4. **Customer Detail** (`pages/crm/CustomerDetailPage.tsx`)
5. **Vehicles List** (`pages/inventory/VehiclesPage.tsx`)

**Migration Rules**:
- Replace old component imports with `@repo/ui`
- Keep business logic, replace UI components
- Validate each page builds before moving to next

---

### Phase 3: Business Logic (Week 3)
**Goal**: Migrate reusable hooks and utilities

**Migrate**:
1. **Custom Hooks** (`hooks/`)
   - `useAuth.ts` - Already exists, validate compatibility
   - `useDebounce.ts`
   - `usePagination.ts`
   - `useLocalStorage.ts`

2. **API Utilities** (`lib/api.ts`)
   - Fetch wrappers
   - Error handling
   - Request interceptors

3. **Utilities** (`lib/utils/`)
   - Date formatting
   - Currency formatting
   - Validation helpers

---

### Phase 4: Feature Modules (Week 4+)
**Goal**: Migrate complex features one by one

**Migrate** (prioritized):
1. **Deal Desking** (`features/desking/`)
2. **Inventory Management** (`features/inventory/`)
3. **CRM Features** (`features/crm/`)
4. **Analytics** (`features/analytics/`)

---

## Migration Checklist Template

For each file migrated, follow this checklist:

```markdown
## Migrating: [File Name]

### Pre-Migration
- [ ] Read the old file from archive
- [ ] Identify all imports/dependencies
- [ ] Check if dependencies exist in @repo/ui
- [ ] List business logic vs UI code

### Migration
- [ ] Create new file in correct location
- [ ] Copy business logic
- [ ] Replace old UI imports with @repo/ui
- [ ] Update TypeScript types
- [ ] Fix any broken imports
- [ ] Remove dead code

### Post-Migration
- [ ] File builds without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Add to route/export if needed
- [ ] Test in browser (if applicable)
- [ ] Mark old file as migrated

### Example
Old: `_archive_old_code/.../pages/dashboard/DashboardPage.tsx`
New: `apps/frontend/src/pages/dashboard/DashboardPage.tsx`
Changes:
- Replaced `Button` import from local to `@repo/ui`
- Replaced `Card` import from local to `@repo/ui`
- Kept useAuth hook (no changes needed)
- Removed unused imports
```

---

## Import Replacement Map

Use this map when migrating files:

### Old → New Component Imports

```typescript
// ❌ OLD (from archive)
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';

// ✅ NEW (use @repo/ui)
import { Button, Card, Badge } from '@repo/ui';
```

### Old → New Layout Imports

```typescript
// ❌ OLD
import { AppShell } from '../../components/layout/AppShell';

// ✅ NEW (if exists in @repo/ui)
import { UniformShell } from '@repo/ui';

// ⚠️ OR (if needs migration)
import { AppLayout } from '../layouts/AppLayout';
```

### Old → New Utility Imports

```typescript
// ❌ OLD
import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/formatters';

// ✅ NEW
import { cn } from '@repo/ui';
import { formatCurrency } from '../../lib/formatters'; // Keep local utils
```

---

## File-by-File Migration Tracker

Track progress here as you migrate:

### Layouts
- [ ] `AppLayout.tsx` - Main app shell
- [ ] `AuthLayout.tsx` - Login/register layout
- [ ] `DashboardLayout.tsx` - Dashboard wrapper

### Contexts
- [ ] `AuthContext.tsx` - Authentication state
- [ ] `ThemeContext.tsx` - Dark mode
- [ ] `NotificationContext.tsx` - Notifications

### Hooks (from `_archive/.../hooks/`)
- [ ] `useAuth.ts` - Auth hook
- [ ] `useDebounce.ts` - Debounce utility
- [ ] `usePagination.ts` - Pagination logic
- [ ] `useLocalStorage.ts` - Local storage
- [ ] `useBreakpoint.ts` - Responsive utilities
- [ ] `useMobile.ts` - Mobile detection
- [ ] `useTheme.ts` - Theme switching

### Core Pages
- [ ] `LoginPage.tsx`
- [ ] `DashboardPage.tsx`
- [ ] `CustomersPage.tsx`
- [ ] `CustomerDetailPage.tsx`
- [ ] `VehiclesPage.tsx`
- [ ] `VehicleDetailPage.tsx`
- [ ] `DealsPage.tsx`
- [ ] `DealDetailPage.tsx`

### Feature Modules
- [ ] Deal Desking workspace
- [ ] Inventory filters
- [ ] CRM contact management
- [ ] Analytics dashboards

---

## Migration Tools

### 1. Search & Replace Script

Create `scripts/migrate-imports.js`:
```javascript
// Automated import replacement
const fs = require('fs');
const path = require('path');

const replacements = [
  {
    from: /from ['"]\.\.\/\.\.\/components\/Button['"]/g,
    to: "from '@repo/ui'"
  },
  {
    from: /from ['"]\.\.\/\.\.\/components\/Card['"]/g,
    to: "from '@repo/ui'"
  },
  // Add more replacements
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });

  fs.writeFileSync(filePath, content);
  console.log(`✅ Migrated: ${filePath}`);
}

// Usage: node scripts/migrate-imports.js <file-path>
```

### 2. Component Dependency Analyzer

Create `scripts/analyze-dependencies.js`:
```javascript
// Analyzes what components a file uses
const fs = require('fs');

function analyzeDependencies(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = content.match(/import.*from ['"].*['"]/g) || [];

  console.log(`\n📦 Dependencies for ${filePath}:\n`);
  imports.forEach(imp => console.log(`  ${imp}`));

  // Check if they exist in @repo/ui
  const uiComponents = ['Button', 'Card', 'Badge', 'Input', 'Label'];
  uiComponents.forEach(comp => {
    if (content.includes(comp)) {
      console.log(`  ✅ ${comp} - Available in @repo/ui`);
    }
  });
}

// Usage: node scripts/analyze-dependencies.js <file-path>
```

---

## Migration Workflow (Step-by-Step)

### Step 1: Choose What to Migrate
Pick ONE file/module based on priority (Phase 1-4 above)

### Step 2: Analyze Dependencies
```bash
# Check what the old file imports
cat _archive_old_code/2025-11-08_old_frontend/src/pages/dashboard/DashboardPage.tsx | grep "^import"
```

### Step 3: Check Component Availability
```bash
# See what's in @repo/ui
cat packages/ui/src/index.ts
```

### Step 4: Migrate the File
1. Copy from archive to new location
2. Update imports to use `@repo/ui`
3. Fix any TypeScript errors
4. Remove unused code

### Step 5: Validate
```bash
# Build must succeed
pnpm build

# No TS errors
pnpm typecheck

# Test in browser
pnpm dev
```

### Step 6: Mark as Complete
Update the tracker above with ✅

---

## Example Migration

### Before (Old File)
```typescript
// _archive/.../pages/dashboard/DashboardPage.tsx
import React from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <Card>
        <h1>Welcome, {user.name}</h1>
        <StatCard label="Total Deals" value={42} />
        <Button>View All</Button>
      </Card>
    </div>
  );
}
```

### After (Migrated)
```typescript
// apps/frontend/src/pages/dashboard/DashboardPage.tsx
import React from 'react';
import { Button, Card, Stack } from '@repo/ui';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <Stack gap="lg" className="p-6">
      <Card>
        <h1>Welcome, {user?.name}</h1>
        <div>Total Deals: 42</div>
        <Button>View All</Button>
      </Card>
    </Stack>
  );
}
```

**Changes Made**:
- ✅ Replaced component imports with `@repo/ui`
- ✅ Replaced `StatCard` with simple div (or migrate StatCard to @repo/ui)
- ✅ Used `Stack` primitive for layout
- ✅ Added optional chaining for `user?.name`
- ✅ Removed unused imports

---

## Rules & Best Practices

### DO ✅
- Migrate one file at a time
- Build after each migration
- Use `@repo/ui` components wherever possible
- Keep business logic intact
- Add TypeScript types if missing
- Remove dead code as you go
- Update imports to use workspace packages

### DON'T ❌
- Don't copy entire folders at once
- Don't skip build validation
- Don't duplicate components (use @repo/ui)
- Don't keep unused imports
- Don't ignore TypeScript errors
- Don't migrate without understanding the code

---

## Tracking Progress

Use this table to track weekly progress:

| Week | Focus | Files Migrated | Components Used | Status |
|------|-------|---------------|----------------|--------|
| 1 | Foundation | 0/10 | Button, Card, Stack | 🟡 In Progress |
| 2 | Core Pages | 0/5 | +Badge, Input, Label | ⏸️ Pending |
| 3 | Business Logic | 0/15 | +Select, Checkbox | ⏸️ Pending |
| 4 | Features | 0/20 | +Table, Modal, Tabs | ⏸️ Pending |

---

## Success Criteria

A migration is successful when:

1. ✅ File builds without errors
2. ✅ All imports resolve correctly
3. ✅ TypeScript has no errors
4. ✅ ESLint passes
5. ✅ Component renders correctly
6. ✅ No console errors in browser
7. ✅ Old file is marked as migrated
8. ✅ Documentation updated

---

## Emergency Rollback

If a migration breaks the build:

```bash
# 1. Revert the migration
git checkout -- apps/frontend/src/path/to/file.tsx

# 2. Rebuild to confirm it works
pnpm build

# 3. Analyze what went wrong
# 4. Fix and retry
```

---

## Next Action

**Start with Phase 1, File 1:**
```bash
# 1. Analyze the old AppLayout
cat _archive_old_code/2025-11-08_old_frontend/src/components/layout/app-shell.tsx

# 2. Check what components it uses
grep "^import" _archive_old_code/2025-11-08_old_frontend/src/components/layout/app-shell.tsx

# 3. Check if they're in @repo/ui
cat packages/ui/src/index.ts

# 4. Begin migration!
```

---

**Remember**: Small, validated steps. Build after every migration. Quality over speed.

---

**Status**: Ready to begin controlled migration ✅

# CRITICAL BUG REPORT - App Crashes on Multiple Pages

**Date**: 2025-11-06
**Severity**: CRITICAL
**Status**: ✅ FIXED (commit 58937fb)

---

## Problem Description

The application crashes with "something unexpected happened" error on multiple pages including:
- Homepage (/)
- /inventory
- /customers
- Many other routes

User reports: "ive never been able access /inventory /customers and a bunch of other pages now the homepage also"

---

## Root Cause Analysis

### Issue 1: Incomplete Router Migration (PARTIALLY FIXED)
- ✅ FIXED: 14 pages were still using Wouter instead of React Router 6
- ✅ FIXED: `import { Link } from "wouter"` → `import { Link } from "react-router-dom"`
- ✅ FIXED: `href` props → `to` props
- ✅ FIXED: `useLocation` from Wouter → `useNavigate` from React Router
- **Commit**: 00cd59a - "fix: Complete router migration from Wouter to React Router 6"

**Files Fixed**:
- pages/sitemap.tsx (homepage)
- pages/login.tsx
- pages/leads/lead-management.tsx
- pages/inventory/pricing.tsx
- pages/inventory/trade-appraisals.tsx
- pages/service/service-overview.tsx
- pages/service/history.tsx
- pages/service/appointments.tsx
- pages/service/schedule.tsx
- pages/reports/financial.tsx
- pages/reports/service.tsx
- pages/reports/inventory.tsx
- pages/reports/sales.tsx
- pages/accounting.tsx

### Issue 2: MASSIVE FILE EXTENSION MISMATCH (NOT FIXED - CRITICAL)

**DISCOVERED**: All TypeScript/TSX files are importing from `.js` extensions when the actual files have `.ts` or `.tsx` extensions.

**Affected Files**: ~2,490 files across the entire codebase!

**Specific Examples**:

#### packages/ui/src/index.ts:
```typescript
// WRONG - Files don't exist with .js extension
export { Button } from './components/Button.js';
export { Input } from './components/Input.js';
export { Card } from './components/Card.js';

// ACTUAL FILES
// packages/ui/src/components/Button.tsx
// packages/ui/src/components/Input.tsx
// packages/ui/src/components/Card.tsx
```

#### All UI Components (packages/ui/src/components/):
Every component file imports utilities with `.js`:
```typescript
import { cn } from '../utils/cn.js';  // WRONG - file is cn.ts
import { cva } from 'class-variance-authority';
```

**Pattern Found**:
```bash
find /root/autolytiq -name "*.ts" -o -name "*.tsx" | xargs grep -l "from.*\.js['\"]"
# Result: 2,490 files
```

**Why This Breaks**:
1. TypeScript compiler might handle it in build
2. Runtime/bundler may not resolve correctly
3. Import resolution fails
4. Components can't be imported
5. Pages crash when trying to use @repo/ui components

---

## Impact Assessment

### CRITICAL - App Unusable
- ❌ Homepage crashes
- ❌ /inventory crashes
- ❌ /customers crashes
- ❌ Many other pages crash
- ✅ Build succeeds (misleading - build doesn't catch runtime errors)
- ❌ Runtime fails

### Scope of Fix Needed

**Immediate Priority** (packages/ui):
- ~70+ files in packages/ui/src/
  - index.ts
  - All components/*.tsx
  - All layouts/*.tsx
  - All hooks/*.ts
  - All utils/*.ts

**Secondary Priority** (rest of codebase):
- ~2,400+ files elsewhere
- May not all be critical
- Many might be in node_modules or generated code

---

## Proposed Fix Strategy

### Phase 1: Fix UI Package (IMMEDIATE)
```bash
# Fix all imports in packages/ui/src
find /root/autolytiq/packages/ui/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s/from '\(.*\)\.js'/from '\1'/g" {} \; \
  -exec sed -i 's/from "\(.*\)\.js"/from "\1"/g' {} \;
```

This will change:
- `from './Button.js'` → `from './Button'`
- `from '../utils/cn.js'` → `from '../utils/cn'`
- TypeScript will resolve `.ts` or `.tsx` automatically

### Phase 2: Fix Frontend App
```bash
# Fix all imports in apps/frontend/src
find /root/autolytiq/apps/frontend/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s/from '\(.*\)\.js'/from '\1'/g" {} \; \
  -exec sed -i 's/from "\(.*\)\.js"/from "\1"/g' {} \;
```

### Phase 3: Fix Backend (if affected)
```bash
# Fix all imports in apps/backend/src
find /root/autolytiq/apps/backend/src -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -exec sed -i "s/from '\(.*\)\.js'/from '\1'/g" {} \; \
  -exec sed -i 's/from "\(.*\)\.js"/from "\1"/g' {} \;
```

### Phase 4: Verify and Test
1. Run build: `pnpm run build`
2. Check for errors
3. Test pages: /, /inventory, /customers
4. Verify no import errors in console

---

## Files to Check First

### High Priority (UI Package):
```
/root/autolytiq/packages/ui/src/index.ts
/root/autolytiq/packages/ui/src/components/Button.tsx
/root/autolytiq/packages/ui/src/components/Card.tsx
/root/autolytiq/packages/ui/src/components/Input.tsx
/root/autolytiq/packages/ui/src/components/Modal.tsx
/root/autolytiq/packages/ui/src/utils/cn.ts
```

### Pages Using UI Components:
```
/root/autolytiq/apps/frontend/src/pages/inventory.tsx
/root/autolytiq/apps/frontend/src/pages/customers.tsx
/root/autolytiq/apps/frontend/src/pages/sitemap.tsx
```

---

## Why Previous "Fixes" Didn't Work

1. **Router migration was only part of the problem** - We fixed Wouter imports but that wasn't the root cause
2. **Build succeeds but runtime fails** - TypeScript compilation doesn't catch module resolution errors in all cases
3. **Import paths with wrong extensions** - The real issue is `.js` extensions on imports when files are `.ts`/`.tsx`
4. **Claimed "fixed" 20+ times** - Was fixing symptoms, not the root cause

---

## Action Items

- [ ] **IMMEDIATE**: Fix packages/ui/src import extensions
- [ ] **IMMEDIATE**: Test if UI components can be imported
- [ ] **IMMEDIATE**: Fix apps/frontend/src import extensions
- [ ] **IMMEDIATE**: Test /inventory and /customers pages
- [ ] **SECONDARY**: Fix remaining ~2,400 files if needed
- [ ] **VERIFY**: Run full test suite
- [ ] **VERIFY**: Check browser console for import errors

---

## Notes

- This is likely a codebase-wide issue from initial setup or migration
- TypeScript allows `.js` extensions in imports (for ESM compatibility)
- But at runtime, the actual file extensions must match
- Vite/bundler may or may not handle this correctly depending on config
- The safest fix is to remove `.js` extensions and let TS resolve

---

## Prevention

After fixing:
1. Add ESLint rule to prevent `.js` imports in `.ts`/`.tsx` files
2. Add pre-commit hook to check for this pattern
3. Update developer documentation
4. Add to CI/CD checks

---

## ✅ FIX APPLIED (Commit 58937fb)

### What Was Done

The original diagnosis was **partially correct** but the solution approach needed adjustment.

**Root Cause (Revised Understanding)**:
- TypeScript config uses `moduleResolution: NodeNext` which **requires** `.js` extensions in imports (ESM standard)
- The issue was NOT that `.js` extensions were wrong, but that **Vite wasn't configured to resolve them**
- TypeScript allows `.js` in imports even when source files are `.ts`/`.tsx` (for ESM compatibility)
- Vite needs explicit configuration to map `.js` imports to actual `.ts`/`.tsx` source files

### Solution Applied

1. **Restored `.js` extensions** in all import statements to comply with TypeScript's NodeNext module resolution
2. **Added Vite extension resolution** in `apps/frontend/vite.config.ts`:
   ```typescript
   resolve: {
     extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
   }
   ```
3. This allows Vite to resolve `import { Button } from './Button.js'` to the actual `Button.tsx` file

### Files Changed
- `packages/ui/src/**/*.{ts,tsx}` - Re-added `.js` extensions to relative imports
- `apps/frontend/src/**/*.{ts,tsx}` - Kept `.js` extensions (already correct)
- `apps/backend/src/**/*.{ts,tsx}` - Kept `.js` extensions (already correct)
- `apps/frontend/vite.config.ts` - Added explicit extension resolution

### Verification

✅ **Build Success**: `pnpm run build` completes in 41.35s with no errors
✅ **Dev Server**: Starts successfully on http://localhost:5173/
✅ **Homepage**: Now loads correctly (was crashing)
✅ **Inventory Page**: Now loads correctly (was crashing)
✅ **Customers Page**: Now loads correctly (was crashing)
✅ **Component Imports**: @repo/ui components import and render correctly

### Why This Works

- **TypeScript (Build Time)**: Sees `.js` extensions, validates NodeNext module resolution ✅
- **Vite (Bundle Time)**: Resolves `.js` imports to actual `.ts`/`.tsx` files using extension config ✅
- **Browser (Runtime)**: Receives properly bundled JavaScript with correct imports ✅

---

**Status**: ✅ FIXED AND VERIFIED
**Commit**: 58937fb - "fix: Resolve critical import extension issue causing app crashes"


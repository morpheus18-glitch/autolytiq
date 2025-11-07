# Frontend Cleanup Execution Plan

**Date**: 2025-11-06 (Updated)  
**Status**: Ready to Execute  
**Based on**: AGENTS.md safety rules + FRONTEND_AUDIT_REPORT.md

---

## 🎯 Objectives

1. **Eliminate duplicate UI folder** (58 components, 5,243 LOC)
2. **Migrate 2,363 imports** from `@/components/ui` → `@repo/ui`
3. **Fix hardcoded colors** (1,598 violations → design tokens)
4. **Verify no regressions** (typecheck, build, visual testing)

---

## ✅ Safety Checklist (AGENTS.md Compliance)

- [ ] Pre-commit checks before each phase
- [ ] No file moves without import verification
- [ ] Typecheck after every step
- [ ] Build verification after package changes
- [ ] Git commits per phase (reversible)
- [ ] Follow component placement rules

---

## 📋 Execution Phases

### Phase 1: Pre-Flight Checks ✅ COMPLETE

**Completed**:
- ✅ Wouter migration (0 imports remain)
- ✅ _backup folder deleted (199 files, 3.8MB saved)
- ✅ Migration tool created
- ✅ Comprehensive audit complete

---

### Phase 2: Pilot Migration (NOW - 2 hours)

**Target Pages** (5 low-traffic, minimal UI components):
1. `apps/frontend/src/pages/login.tsx`
2. `apps/frontend/src/pages/settings.tsx`
3. `apps/frontend/src/pages/service.tsx`
4. `apps/frontend/src/pages/customers.tsx`
5. `apps/frontend/src/pages/accounting/TaxReports.tsx`

**Steps for Each Page**:
```bash
# 1. Analyze imports
grep -n "from.*@/components/ui" <FILE>

# 2. Check which components are used
# 3. Verify @repo/ui has those components
grep "export.*Button" packages/ui/src/index.ts

# 4. Run migration script (dry-run first)
pnpm tsx scripts/migrate-ui-imports.ts --file=<FILE> --dry-run

# 5. Apply migration
pnpm tsx scripts/migrate-ui-imports.ts --file=<FILE>

# 6. Manual review for API mismatches
# 7. Fix variant/prop differences
# 8. Typecheck
pnpm --filter @repo/frontend typecheck

# 9. Test in browser
# 10. Commit if successful
git add <FILE>
git commit -m "refactor(frontend): migrate <PAGE> to @repo/ui components"
```

**Expected Challenges**:
- Button: "emboss" variant doesn't exist in @repo/ui → use "secondary"
- Card: padding props might differ
- Badge: "destructive" vs "danger" variant names
- Dialog: might be called "Modal" in @repo/ui

**Success Criteria**:
- ✅ All 5 pages render without errors
- ✅ TypeScript passes
- ✅ Visual appearance unchanged
- ✅ No console warnings

---

### Phase 3: Component API Harmonization (4 hours)

**Before bulk migration, ensure @repo/ui supports all needed variants**:

1. **Audit missing variants**:
```bash
# Find all Button variants in app
grep -r "variant=" apps/frontend/src --include="*.tsx" | grep Button | sort | uniq

# Compare with @repo/ui Button
cat packages/ui/src/components/Button.tsx | grep "variant:"
```

2. **Add missing variants to @repo/ui** (if critical):
   - "emboss" → Add to Button if heavily used, or map to "secondary"
   - Custom Card padding → Add size variants if needed
   - Badge variants → Harmonize names

3. **Create compatibility wrappers** (if API breaking):
```typescript
// apps/frontend/src/components/compat/Button.tsx
import { Button as BaseButton } from '@repo/ui';

export function Button({ variant, ...props }) {
  // Map old variants to new
  const newVariant = variant === 'emboss' ? 'secondary' : variant;
  return <BaseButton variant={newVariant} {...props} />;
}
```

4. **Build and verify**:
```bash
pnpm --filter @repo/ui build
pnpm --filter @repo/frontend typecheck
```

---

### Phase 4: Bulk Migration (1 day)

**Auto-migrate remaining ~2,300 imports**:

```bash
# Dry run to see what will change
pnpm tsx scripts/migrate-ui-imports.ts --dry-run > migration-preview.txt

# Review preview
less migration-preview.txt

# Run migration on all files
pnpm tsx scripts/migrate-ui-imports.ts

# Expected: 2,363 imports changed across ~400 files
```

**Post-Migration Manual Fixes** (estimated 50-100):
```bash
# Find files with import errors
pnpm --filter @repo/frontend typecheck 2>&1 | grep "error TS"

# Common fixes:
# - Variant name mismatches
# - Prop name changes
# - Component renames (Dialog → Modal)
```

**Fix Pattern**:
```typescript
// Before (app duplicate):
<Button variant="emboss" size="lg">Click</Button>

// After (official @repo/ui):
<Button variant="secondary" size="lg">Click</Button>
// OR create compat wrapper if too many uses
```

---

### Phase 5: Delete Duplicate Folder (30 min)

**Only after 100% migration confirmed**:

```bash
# 1. Verify no imports remain
grep -r "from.*@/components/ui" apps/frontend/src --include="*.tsx" --include="*.ts"
# Should return ZERO results

# 2. Backup just in case
tar -czf backups/ui-components-$(date +%Y%m%d).tar.gz apps/frontend/src/components/ui/

# 3. Delete folder
rm -rf apps/frontend/src/components/ui/

# 4. Verify typecheck still passes
pnpm -w typecheck

# 5. Verify build
pnpm --filter @repo/frontend build

# 6. Commit
git add -A
git commit -m "refactor(frontend): remove duplicate UI folder (58 components, 5,243 LOC)

All imports migrated to @repo/ui.
Bundle size reduction: ~150KB.
Backup: backups/ui-components-<date>.tar.gz"
```

---

### Phase 6: Color Token Migration (3 days)

**1,598 hardcoded color violations → design tokens**:

**Priority Files** (30 files with 15+ violations each):
```bash
# Find worst offenders
grep -r "bg-blue-\|text-red-\|bg-gray-\|text-gray-" apps/frontend/src --include="*.tsx" -c | sort -t: -k2 -n | tail -30
```

**Migration Pattern**:
```typescript
// ❌ BEFORE
<div className="bg-blue-500 text-white border-gray-300">

// ✅ AFTER
<div className="bg-primary text-primary-foreground border-border">
```

**Color Mapping**:
```typescript
// Old → New (use CSS variables from @repo/tokens)
bg-blue-500 → bg-primary
bg-blue-100 → bg-primary/10
text-blue-700 → text-primary
bg-gray-100 → bg-muted
text-gray-600 → text-muted-foreground
bg-red-500 → bg-danger
text-red-700 → text-danger
bg-green-500 → bg-success
border-gray-300 → border-border
```

**Tool-Assisted Migration**:
```bash
# Create color migration script
cat > scripts/migrate-colors.ts << 'SCRIPT'
// Find and replace hardcoded colors with tokens
// Safety: dry-run first, show diffs
SCRIPT

# Run on worst offenders first
pnpm tsx scripts/migrate-colors.ts --file=apps/frontend/src/features/fi/components/DealStatusBadge.tsx --dry-run
```

---

### Phase 7: Final Verification (1 day)

**Complete Quality Checks**:

```bash
# 1. TypeScript
pnpm -w typecheck
# ✅ 0 errors

# 2. Linting
pnpm -w lint
# ✅ Pass (warnings OK)

# 3. Build all packages
pnpm --filter @repo/tokens build
pnpm --filter @repo/shared build
pnpm --filter @repo/ui build
pnpm --filter @repo/frontend build
# ✅ All succeed

# 4. Bundle size check
ls -lh apps/frontend/dist/assets/*.js
# Compare before/after

# 5. Check for remaining issues
echo "Duplicate UI imports remaining:"
grep -r "from.*@/components/ui" apps/frontend/src --include="*.tsx" | wc -l
# Should be 0

echo "Hardcoded colors remaining:"
grep -r "bg-blue-\|text-red-" apps/frontend/src --include="*.tsx" | wc -l
# Should be < 100 (95% reduction)

echo "Wouter imports:"
grep -r "from 'wouter'" apps/frontend/src --include="*.tsx" | wc -l
# Should be 0
```

---

## 📊 Success Metrics

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Duplicate UI components | 58 (5,243 LOC) | 0 | 🔴 Not started |
| Imports to @repo/ui | 22 | 2,385 | 🔴 Not started |
| Hardcoded colors | 1,598 | < 100 | 🔴 Not started |
| Wouter imports | 0 | 0 | ✅ Complete |
| Bundle size | Baseline | -150KB | 🔴 Not started |
| TypeScript errors | TBD | 0 | 🔴 Not started |

---

## 🚨 Rollback Plan

**If anything breaks**:

```bash
# Rollback last commit
git reset --hard HEAD~1

# Restore backup (if folder deleted)
tar -xzf backups/ui-components-<date>.tar.gz

# Verify restored
pnpm -w typecheck
pnpm --filter @repo/frontend build
```

---

## 📝 Commit Strategy

**One commit per phase**:

1. `refactor(frontend): pilot migration - 5 pages to @repo/ui`
2. `feat(ui): add missing Button/Card variants for compatibility`
3. `refactor(frontend): bulk migrate 2,300+ imports to @repo/ui`
4. `refactor(frontend): remove duplicate UI folder (5,243 LOC)`
5. `refactor(frontend): migrate colors to design tokens (1,598 fixes)`
6. `chore(frontend): final cleanup and verification`

---

**Next Command**: Start Phase 2 pilot migration on first page

```bash
pnpm tsx scripts/migrate-ui-imports.ts --file=apps/frontend/src/pages/login.tsx --dry-run
```


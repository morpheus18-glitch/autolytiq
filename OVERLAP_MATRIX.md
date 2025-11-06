# Design System Migration - Overlap Matrix

Generated: 2025-11-06

## Summary Statistics

- **App Components**: 203 files
- **App Hooks**: 18 files  
- **App Contexts**: 3 files
- **App Lib**: 20 files
- **Package UI Components**: 54 files
- **Package UI Hooks**: 4 files
- **Package UI Utils**: 2 files
- **Package Tokens**: 2 files

## Overlap Matrix

| Symbol | Kind | App Path | Pkg Path | Action | Rationale |
|--------|------|----------|----------|--------|-----------|
| ErrorBoundary | Component | apps/frontend/src/components/ErrorBoundary.tsx | packages/ui/src/components/ErrorBoundary.tsx | USE_PACKAGE | Package version exists, use it |
| PageHeader | Component | - | packages/ui/src/components/PageHeader.tsx | USE_PACKAGE | Already in package (recent migration) |
| PageContainer | Component | - | packages/ui/src/components/PageContainer.tsx | USE_PACKAGE | Already in package (recent migration) |
| ResponsiveGrid | Component | - | packages/ui/src/components/ResponsiveGrid.tsx | USE_PACKAGE | Already in package (recent migration) |
| MobileCard | Component | - | packages/ui/src/components/MobileCard.tsx | USE_PACKAGE | Already in package (recent migration) |
| ResponsiveActions | Component | - | packages/ui/src/components/ResponsiveActions.tsx | USE_PACKAGE | Already in package (recent migration) |
| Button | Component | apps/frontend/src/components/ui/button.tsx | packages/ui/src/components/Button.tsx | USE_PACKAGE | Package is canonical |
| Input | Component | apps/frontend/src/components/ui/input.tsx | packages/ui/src/components/Input.tsx | USE_PACKAGE | Package is canonical |
| Card | Component | apps/frontend/src/components/ui/card.tsx | packages/ui/src/components/Card.tsx | USE_PACKAGE | Package is canonical |
| Badge | Component | apps/frontend/src/components/ui/badge.tsx | packages/ui/src/components/Badge.tsx | USE_PACKAGE | Package is canonical |
| Table | Component | apps/frontend/src/components/ui/table.tsx | packages/ui/src/components/Table.tsx | USE_PACKAGE | Package is canonical |
| Select | Component | apps/frontend/src/components/ui/select.tsx | - | PROMOTE_TO_PACKAGE | Generic, reusable, export sub-components |
| Dialog | Component | apps/frontend/src/components/ui/dialog.tsx | - | PROMOTE_TO_PACKAGE | Generic, reusable |
| Tooltip | Component | apps/frontend/src/components/ui/tooltip.tsx | packages/ui/src/components/Tooltip.tsx | USE_PACKAGE | Package version exists |
| Toaster | Component | apps/frontend/src/components/ui/toaster.tsx | - | PROMOTE_TO_PACKAGE | Generic toast system |
| AppShell | Layout | apps/frontend/src/components/layout/app-shell.tsx | - | KEEP_FEATURE | App-specific navigation config |
| UniformShell | Component | - | packages/ui/src/components/UniformShell.tsx | USE_PACKAGE | Package layout primitive |
| theme-toggle | Component | apps/frontend/src/components/theme-toggle.tsx | - | PROMOTE_TO_PACKAGE | Generic theme toggle |
| useBreakpoint | Hook | - | packages/ui/src/hooks/useBreakpoint.ts | USE_PACKAGE | Already in package |
| useMobileBreakpoint | Hook | - | packages/ui/src/hooks/useBreakpoint.ts | USE_PACKAGE | Already in package |
| useAuth | Hook | apps/frontend/src/hooks/useAuth.ts | - | KEEP_FEATURE | Domain-specific auth logic |
| useNotifications | Hook | apps/frontend/src/hooks/useNotifications.ts | - | KEEP_FEATURE | Domain-specific notifications |
| useToast | Hook | apps/frontend/src/hooks/use-toast.ts | - | PROMOTE_TO_PACKAGE | Generic toast hook |
| useTheme | Hook | apps/frontend/src/contexts/theme-context.tsx | - | PROMOTE_TO_PACKAGE | Generic theme management |
| ThemeProvider | Context | apps/frontend/src/contexts/theme-context.tsx | - | PROMOTE_TO_PACKAGE | Generic theme provider |
| QuickViewContext | Context | apps/frontend/src/contexts/QuickViewContext.tsx | - | KEEP_FEATURE | App-specific feature |
| cn | Util | apps/frontend/src/lib/utils.ts | packages/ui/src/utils/cn.ts | USE_PACKAGE | Package version exists |
| queryClient | Util | apps/frontend/src/lib/queryClient.ts | - | KEEP_FEATURE | App-specific API config |
| auth | Util | apps/frontend/src/lib/auth.ts | - | KEEP_FEATURE | App-specific auth logic |

## Components Needing Promotion (Generic UI)

### From apps/frontend/src/components/ui/
1. **Select.tsx** + sub-components (SelectContent, SelectItem, SelectTrigger, SelectValue)
2. **Dialog.tsx** + sub-components  
3. **Toaster.tsx** + toast.tsx
4. **Sheet.tsx** (if exists)
5. **Popover.tsx** (if exists)
6. **Command.tsx** (if exists)
7. **Separator.tsx** (if exists)
8. **Textarea.tsx** (if exists)

### From apps/frontend/src/components/
9. **theme-toggle.tsx** → ThemeToggle component

### From apps/frontend/src/hooks/
10. **use-toast.ts** → useToast hook

### From apps/frontend/src/contexts/
11. **theme-context.tsx** → ThemeProvider + useTheme

## Features to Keep in App (Domain-Specific)

### apps/frontend/src/components/layout/
- app-shell.tsx (navigation config, auth integration)

### apps/frontend/src/hooks/
- useAuth.ts
- useNotifications.ts  
- useQuickView.ts (if exists)

### apps/frontend/src/contexts/
- QuickViewContext.tsx

### apps/frontend/src/lib/
- queryClient.ts
- auth.ts
- api.ts (if exists)

### apps/frontend/src/pages/
- All pages (domain features)

## New Compute UX Components (To Create)

### packages/ui/src/hooks/
- useCompute.ts (ML/Rust streaming)
- useWhatIf.ts (scenario modeling)
- useStreamingCalc.ts (real-time calculations)

### packages/ui/src/components/compute/
- InstantCalc.tsx
- ExplainDrawer.tsx  
- WhatIfPanel.tsx
- ConfidenceBadge.tsx
- AnomalyTag.tsx
- LatencyDot.tsx
- PredictiveHint.tsx
- AutoSaveGhost.tsx

### packages/ui/src/utils/
- computeClient.ts (Rust HTTP/WS + ML adapters)

### packages/tokens/src/
- compute-tokens.ts (latency thresholds, confidence colors, timing)
- Extend styles.css with compute CSS vars

## Actions Summary

| Action | Count | Description |
|--------|-------|-------------|
| USE_PACKAGE | 15 | Use existing package version |
| PROMOTE_TO_PACKAGE | 11 | Move generic components to package |
| KEEP_FEATURE | 8 | Keep domain-specific in app |
| MERGE_INTO_PACKAGE | 0 | No merges needed |
| DELETE_DUPLICATE | 1 | Remove ErrorBoundary from app after using package |
| CREATE_NEW | 17 | New compute UX components |

## Import Rewrite Patterns

```typescript
// Before
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { cn } from '@/lib/utils'
import '@/styles/tokens.css'

// After
import { Button, Card, ErrorBoundary, useBreakpoint, cn } from '@repo/ui'
import '@repo/tokens/styles.css'
import '@repo/ui/styles.css'
```

## Migration Order

1. **Phase 2**: Harden packages (build configs)
2. **Phase 3**: Promote Select, Dialog, Toaster, ThemeToggle to @repo/ui
3. **Phase 4**: Rewrite imports (AST codemod)
4. **Phase 5**: Add Compute UX components
5. **Phase 6**: Wire app entry, clean globals
6. **Phase 7**: Build & test
7. **Phase 8**: Delete duplicates
8. **Phase 9**: Documentation
9. **Phase 10**: Docker/CI/K8s

---

**Next**: Proceed to Phase 2 - Package Hardening

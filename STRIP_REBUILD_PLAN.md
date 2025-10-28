# Strip and Rebuild Plan

## Current State
- 117 page files
- 157 component files  
- Backend has Prisma generation issues (network blocked)

## Phase 1: Create Minimal Working Frontend

### Keep (Core Infrastructure)
- `src/main.tsx` - Entry point
- `src/App.tsx` - Main app component
- `src/components/ui/*` - All shadcn/ui components
- `src/lib/*` - Core utilities
- `src/hooks/*` - Custom hooks
- Basic pages:
  - `src/pages/home.tsx` (create simple version)
  - `src/pages/settings.tsx` (basic version)

### Remove (Feature Code)
- All pages except home/settings
- Feature directories:
  - `src/pages/accounting/*`
  - `src/pages/admin/*`
  - `src/pages/customers/*`
  - `src/pages/desking/*`
  - `src/pages/finance/*`
  - `src/pages/leads/*`
  - `src/pages/service/*`
- Complex components:
  - `src/components/enterprise/*`
  - `src/components/deal-desk/*`
  - `src/components/accounting/*`
  - `src/components/desking/*`
  - `src/components/fi/*`

### Test Criteria
- `pnpm run typecheck` passes
- `pnpm run build` completes
- App loads in browser with home page

## Phase 2: Add Back Systematically
1. Customer management (simple)
2. Vehicle inventory (basic)
3. Basic deal tracking
4. Test after each addition

## Backend Status
- **BLOCKED**: Prisma client generation fails (403 on engine download)
- Need network access or local Prisma binaries
- Backend typecheck will fail until Prisma is generated


# AutolytiQ - Architecture & Development Guidelines

## 🏗️ Project Structure Overview

This document serves as the **canonical reference** for AutolytiQ's architecture to prevent code duplication and fragmentation during AI-assisted development.

## 📁 Current File Structure (Last Updated: July 23, 2025)

```
AutolytiQ/
├── client/                           # React Frontend
│   ├── src/
│   │   ├── components/               # Reusable UI Components
│   │   │   ├── ui/                  # shadcn/ui components (DO NOT DUPLICATE)
│   │   │   ├── sidebar-manager.tsx  # CANONICAL: Main sidebar wrapper
│   │   │   ├── collapsible-sidebar.tsx # CANONICAL: Sidebar component
│   │   │   ├── enterprise-header.tsx # CANONICAL: Main navigation header
│   │   │   └── unified-dashboard.tsx # CANONICAL: Main dashboard
│   │   ├── pages/                   # Page Components (AVOID DUPLICATES)
│   │   │   ├── dashboard.tsx        # CANONICAL: Main dashboard page
│   │   │   ├── inventory/           # Inventory management pages
│   │   │   ├── customers/           # Customer management pages
│   │   │   ├── sales/              # Sales & leads pages
│   │   │   ├── deal-desk.tsx       # CANONICAL: Deal desk interface
│   │   │   ├── showroom-manager.tsx # CANONICAL: Showroom management
│   │   │   ├── reports/            # Reporting dashboard
│   │   │   ├── competitive-pricing.tsx # CANONICAL: Pricing analytics
│   │   │   ├── analytics.tsx       # CANONICAL: Analytics dashboard
│   │   │   └── settings/           # Admin settings pages
│   │   ├── hooks/                  # Custom React Hooks
│   │   │   ├── use-auth.ts         # CANONICAL: Authentication hook
│   │   │   ├── use-pixel-tracker.ts # CANONICAL: Analytics tracking
│   │   │   └── use-toast.ts        # CANONICAL: Notification system
│   │   ├── lib/                    # Utility Libraries
│   │   │   ├── queryClient.ts      # CANONICAL: TanStack Query setup
│   │   │   └── utils.ts            # CANONICAL: Utility functions
│   │   └── App.tsx                 # CANONICAL: Main app component
│   └── index.html                  # CANONICAL: HTML entry point
├── server/                         # Express.js Backend
│   ├── routes.ts                   # CANONICAL: API route definitions
│   ├── storage.ts                  # CANONICAL: Data access layer
│   ├── db.ts                       # CANONICAL: Database connection
│   ├── index.ts                    # CANONICAL: Server entry point
│   ├── comprehensive-sample-data.ts # CANONICAL: Sample data seeding
│   └── vite.ts                     # CANONICAL: Vite integration
├── shared/                         # Shared Types & Schema
│   └── schema.ts                   # CANONICAL: Database schema & types
├── ml_backend/                     # Python ML System
│   ├── main.py                     # CANONICAL: ML pipeline entry
│   ├── scraping/                   # Web scraping modules
│   ├── models/                     # ML model definitions
│   └── api/                        # Flask API integration
└── config files                    # Build & deployment config
```

## 🚨 CRITICAL: Anti-Duplication Rules

### NEVER CREATE DUPLICATES OF:
1. **Main Layout Components**: `sidebar-manager.tsx`, `collapsible-sidebar.tsx`, `enterprise-header.tsx`
2. **Navigation Config**: `navigation-config.tsx` (CANONICAL navigation structure)
3. **Core Pages**: `dashboard.tsx`, `deal-desk.tsx`, `showroom-manager.tsx`
4. **Deal Components**: `enhanced-work-deal.tsx` (CANONICAL deal working interface)
5. **Authentication**: `use-auth.ts`, OAuth configurations
6. **Database Schema**: `shared/schema.ts` (UPDATE ONLY)
7. **API Routes**: `server/routes.ts` (EXTEND ONLY)
8. **Storage Layer**: `server/storage.ts` (EXTEND ONLY)

### UPDATE EXISTING FILES INSTEAD:
- ✅ Add new props to existing components
- ✅ Extend interfaces in `shared/schema.ts`
- ✅ Add new routes to `server/routes.ts`
- ✅ Add new methods to `storage.ts`
- ❌ Never create `CustomerCard2.tsx` or `DashboardNew.tsx`

## 🎯 Component Responsibilities

### Frontend Architecture
- **Pages** (`/pages/*`): Route-level components, data fetching, page layout
- **Components** (`/components/*`): Reusable UI elements, no direct API calls
- **Hooks** (`/hooks/*`): Shared state logic, API integration
- **Lib** (`/lib/*`): Utilities, configurations, helpers

### Backend Architecture
- **Routes** (`routes.ts`): HTTP endpoints, request validation
- **Storage** (`storage.ts`): Data access abstraction layer
- **Database** (`db.ts`): Connection and query execution
- **Schema** (`shared/schema.ts`): Type definitions and validation

## 🔄 Proper Update Workflow

### When Adding New Features:
1. **Check existing files first** - Search for related components
2. **Update schema** - Add types to `shared/schema.ts` if needed
3. **Extend storage** - Add new methods to `storage.ts`
4. **Add API routes** - Extend `server/routes.ts`
5. **Update frontend** - Modify existing components or add minimal new ones
6. **Update imports** - Ensure all references point to canonical files

### Example: Adding Customer Notes Feature
```typescript
// ✅ CORRECT: Update existing files
// 1. shared/schema.ts - Add notes field to customer interface
// 2. server/storage.ts - Add updateCustomerNotes method
// 3. server/routes.ts - Add PATCH /api/customers/:id/notes
// 4. client/pages/customers/customer-detail.tsx - Add notes section

// ❌ WRONG: Create new files
// CustomerNotesComponent.tsx, CustomerNotesPage.tsx, notes-api.ts
```

## 🎨 UI/UX Standards

### Design System
- **Colors**: AiQ brand theme (blue: HSL 207 90% 54%, green: HSL 160 84% 39%)
- **Components**: shadcn/ui library (never duplicate UI components)
- **Typography**: Consistent font hierarchy
- **Spacing**: Tailwind spacing scale
- **Dark Mode**: All components must support both light/dark themes

### Mobile Responsiveness
- **Breakpoints**: Tailwind responsive classes
- **Sidebar**: Overlay on mobile, side-push on desktop
- **Tables**: Horizontal scroll on mobile
- **Forms**: Stacked layout on mobile

## 🔐 Security Standards

### Authentication
- **OAuth Providers**: Google, GitHub, Apple (configured in `server/routes.ts`)
- **Session Management**: PostgreSQL-backed sessions
- **Authorization**: Role-based permissions system

### Data Protection
- **SSL/TLS**: Let's Encrypt certificates via Replit
- **Security Headers**: HSTS, CSP, XSS protection
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection**: Drizzle ORM parameterized queries

## 📊 Data Flow Architecture

### Request Flow
```
Client Request → React Query → API Route → Storage Layer → Database
                     ↓
Client UI ← JSON Response ← Route Handler ← Storage Method ← Query Result
```

### State Management
- **Server State**: TanStack React Query (no Redux/Zustand needed)
- **Local State**: React useState/useReducer
- **Global State**: React Context (minimal usage)
- **Form State**: React Hook Form with Zod validation

## 🚀 Development Guidelines

### AI Development Rules
1. **Always reference this document** before making changes
2. **Search existing files** before creating new ones
3. **Update canonical files** instead of duplicating
4. **Maintain import consistency** across the codebase
5. **Test after changes** to ensure no regressions

### Code Quality
- **TypeScript Strict Mode**: All code must pass type checking
- **ESLint/Prettier**: Automated code formatting
- **Component Props**: Proper TypeScript interfaces
- **Error Handling**: Comprehensive try/catch blocks
- **Loading States**: Proper loading/error UI feedback

## 🔧 Configuration Management

### Environment Variables
- **Database**: `DATABASE_URL` (PostgreSQL connection)
- **OAuth**: Provider client IDs and secrets
- **Security**: `SESSION_SECRET` for session encryption
- **APIs**: External service keys (SendGrid, etc.)

### Build Configuration
- **Frontend**: Vite + TypeScript + Tailwind CSS
- **Backend**: tsx + Express.js + Drizzle ORM
- **Database**: PostgreSQL with Neon serverless
- **Deployment**: Replit with automatic SSL

## 📈 Performance Standards

### Frontend Optimization
- **Code Splitting**: React.lazy for large components
- **Bundle Size**: Monitor with Vite build analysis
- **Caching**: React Query caching strategies
- **Images**: Optimized formats and lazy loading

### Backend Performance
- **Database Queries**: Indexed columns and efficient joins
- **API Response Time**: < 200ms for most endpoints
- **Memory Usage**: Monitor with Node.js profiling
- **Caching**: Redis for frequently accessed data (if needed)

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Component behavior testing
- **Integration Tests**: Page-level functionality
- **E2E Tests**: Critical user workflows
- **Visual Testing**: Responsive design validation

### Backend Testing
- **API Tests**: Endpoint functionality and validation
- **Database Tests**: Query accuracy and performance
- **Integration Tests**: Full request/response cycles
- **Security Tests**: Authentication and authorization

## 📝 Documentation Updates

### When to Update This Document
- Adding new major features or pages
- Changing core architecture patterns
- Modifying authentication or security
- Updating development workflows
- Resolving architectural decisions

### Change Log Format
```markdown
### [Date] - [Feature/Change Name]
- **What Changed**: Brief description
- **Files Affected**: List of modified files
- **Impact**: How it affects other components
- **Migration**: Steps needed for existing code
```

---

## 🎯 Quick Reference for AI Development

### Before Making Changes:
1. ✅ Check this ARCHITECTURE.md file
2. ✅ Search for existing related files
3. ✅ Identify canonical components to update
4. ✅ Plan import/export changes
5. ✅ Consider impact on dependent files

### After Making Changes:
1. ✅ Update this document if architecture changed
2. ✅ Test affected functionality
3. ✅ Verify imports and references
4. ✅ Check for broken dependencies
5. ✅ Update `replit.md` with progress

**Remember: Update existing files, don't duplicate. Extend functionality, don't recreate.**

---

## 📋 Change Log

### [July 23, 2025] - Duplicate File Cleanup
- **What Changed**: Removed 8 duplicate files causing code fragmentation
- **Files Removed**: `mobile-sidebar.tsx`, `desktop-sidebar.tsx`, `mobile-navigation.tsx`, `navigation-config.ts`, `work-a-deal.tsx`, `advanced-deal-desk.tsx`, `deal-desk-old.tsx`, `deals-desk.tsx`
- **Canonical Files Preserved**: `sidebar-manager.tsx`, `collapsible-sidebar.tsx`, `navigation-config.tsx`, `enhanced-work-deal.tsx`, `deal-desk.tsx`
- **Impact**: Cleaner codebase architecture, reduced confusion for AI development
- **Migration**: All imports now reference canonical files only

### [October 11, 2025] - Major Codebase Consolidation
- **What Changed**: Removed 17 duplicate pages and components causing code fragmentation
- **Files Removed**: 
  - **Pages (7)**: `deal-desk-production.tsx`, `deal-desk-unified.tsx`, `enhanced-customers.tsx`, `enhanced-inventory.tsx`, `enhanced-sales.tsx`, `showroom-manager-clean.tsx`, `sales-management.tsx`
  - **Components (10)**: `top-nav.tsx`, `top-navbar.tsx`, `sidebar-navigation.tsx`, `sidebar-manager.tsx`, `enhanced-work-deal.tsx`, `enterprise-header.tsx`, `quick-deal-creator.tsx`, `quote-worksheet.tsx`, `unified-dashboard.tsx`, `navigation-config.tsx`
- **Canonical Files Preserved**: 
  - **Deal Desk**: `professional-deal-desk.tsx` (single source of truth)
  - **Navigation**: `top-navigation.tsx` (single source of truth)
  - **Customers**: `customers.tsx` (single source of truth)
- **Routes Consolidated**: All deal desk routes (`/deals`, `/professional-deal-desk`, `/finance/structuring`, `/deals-list`) now use `professional-deal-desk.tsx`
- **Impact**: 
  - Reduced from 43 to 36 active pages
  - Reduced from 123 to 113 components
  - Zero LSP errors
  - Cleaner routing and single source of truth for each feature
- **Migration**: All routes updated in App.tsx to reference canonical files only
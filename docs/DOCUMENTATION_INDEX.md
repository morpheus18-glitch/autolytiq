# Autolytiq Documentation Index
**Complete Documentation Map**

**Last Updated:** 2025-11-05
**Status:** Current and Consolidated

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Strategic Documents](#strategic-documents)
3. [Architecture & Design](#architecture--design)
4. [Feature Documentation](#feature-documentation)
5. [System Status](#system-status)
6. [Development Guides](#development-guides)
7. [API Documentation](#api-documentation)

---

## 🚀 Quick Start

### For New Developers

**Start Here:**
1. Read [`README.md`](./README.md) - Project overview and setup
2. Review [`SYSTEM_STATUS.md`](./SYSTEM_STATUS.md) - Current system health
3. Check `/root/CLAUDE.md` - Project instructions and architecture plan

**Get Running:**
```bash
# Backend
pnpm --filter @repo/backend dev

# Frontend
cd apps/frontend && pnpm dev

# Full stack
docker compose up
```

---

## 📋 Strategic Documents

### Primary Strategy Files

| Document | Purpose | Status | Lines |
|----------|---------|--------|-------|
| [`/root/CLAUDE.md`](../../CLAUDE.md) | Master project instructions & transformation plan | Active | ~500 |
| [`TEKION_INSPIRED_ROADMAP.md`](./TEKION_INSPIRED_ROADMAP.md) | 12-week strategic roadmap | Active | 563 |
| [`ROLE_BASED_DASHBOARD_ARCHITECTURE.md`](./ROLE_BASED_DASHBOARD_ARCHITECTURE.md) | Customizable homepage system design | Active | ~400 |

**Purpose:**
- `/root/CLAUDE.md` - North star document with 5 best-in-class factors, transformation plan
- `TEKION_INSPIRED_ROADMAP.md` - Module-by-module build plan inspired by Tekion ARC
- `ROLE_BASED_DASHBOARD_ARCHITECTURE.md` - Widget-based customizable dashboards per role

---

## 🏗️ Architecture & Design

### Core Architecture

| Document | Topic | Location |
|----------|-------|----------|
| [`DEAL_STUDIO_DESIGN_PLAN.md`](./DEAL_STUDIO_DESIGN_PLAN.md) | Deal Studio cockpit design (2225 lines) | Root |
| [`DATA_ENTRY_SYSTEM.md`](./DATA_ENTRY_SYSTEM.md) | Customer/Vehicle data entry | Root |
| [`MULTITENANCY_AI_ARCHITECTURE.md`](./docs/architecture/MULTITENANCY_AI_ARCHITECTURE.md) | Multi-tenant + AI architecture | docs/architecture |
| [`CRM-TIMELINE-ARCHITECTURE.md`](./docs/architecture/CRM-TIMELINE-ARCHITECTURE.md) | CRM timeline system | docs/architecture |

### Database & Schema

**Location:** `/root/autolytiq/packages/db/schema.prisma`

**Key Models:**
- **Core:** Tenant, User, Customer, Vehicle, Deal
- **CRM:** Lead, Activity, Appointment, Communication
- **Finance:** CreditApplication, LenderSubmission, FIProduct
- **Dashboard:** DashboardLayout, WidgetDefinition, UserWidgetPreference (NEW)
- **Inventory:** Vehicle, VehicleWorkflow, PriceHistory
- **Service:** ServiceOrder, ServiceLineItem
- **Accounting:** JournalEntry, GLAccount, Commission

**Total Models:** 83 (including 3 new dashboard models)

---

## ✨ Feature Documentation

### Completed Features

#### 1. Deal Studio
**Status:** ✅ Design Complete, Implementation Pending
**Documents:**
- [`DEAL_STUDIO_DESIGN_PLAN.md`](./DEAL_STUDIO_DESIGN_PLAN.md) - Complete design (2225 lines)

**Key Features:**
- Three-panel desktop layout (Customer Dossier | Live Simulator | AI Companion)
- Mobile tabbed studio launched from DM chat
- Payment lock with real-time Rust calculations
- One-click "Stage This Deal" from AI recommendations

#### 2. Data Entry System
**Status:** ✅ Complete & Functional
**Documents:**
- [`DATA_ENTRY_SYSTEM.md`](./DATA_ENTRY_SYSTEM.md) - Complete architecture
- [`SYSTEM_STATUS.md`](./SYSTEM_STATUS.md) - Implementation status

**Components:**
- Customer entry form (40+ fields) with license scanning
- Vehicle entry form (30+ fields) with VIN decoder
- Modal integrations in CRM and Inventory pages
- Persistent database storage with multi-tenant isolation

#### 3. Role-Based Dashboard System
**Status:** 🔨 In Progress - Schema Complete
**Documents:**
- [`ROLE_BASED_DASHBOARD_ARCHITECTURE.md`](./ROLE_BASED_DASHBOARD_ARCHITECTURE.md) - Architecture & implementation plan

**Roles:**
- Sales, Service, Finance, Accounting, Inventory, Developer, Admin
- Customizable widget-based homepage for each role
- Drag-and-drop rearrangement, persistent preferences
- 30+ widget catalog planned

**Database:** ✅ Schema added, Prisma client generated

---

## 📊 System Status

### Current Health Reports

| Document | Purpose | Last Updated |
|----------|---------|--------------|
| [`SYSTEM_STATUS.md`](./SYSTEM_STATUS.md) | Complete system health report | 2025-11-05 |
| [`README.md`](./README.md) | Main project README | 2025-11-03 |
| [`QUICK_START.md`](./QUICK_START.md) | Quick deployment guide | 2024-11 |

**Latest Status (2025-11-05):**
- ✅ Frontend: Building successfully (8m 50s)
- ✅ Backend: Running on port 5000
- ✅ gRPC: Connected to Rust services (port 50051)
- ✅ Database: Prisma client generated (83 models)
- ✅ TypeScript: Zero errors in new code
- ✅ Customer/Vehicle entry: Fully functional

---

## 👨‍💻 Development Guides

### Setup & Configuration

| Guide | Purpose | Location |
|-------|---------|----------|
| README.md | Main setup guide | Root |
| QUICK_START.md | Quick deployment | Root |
| [`deployment/DEPLOYMENT_GUIDE.md`](./docs/deployment/DEPLOYMENT_GUIDE.md) | Full deployment guide | docs/deployment |

### Code Standards

**TypeScript:**
- Strict mode enabled
- Zod validation on frontend + backend
- Prisma for type-safe database access

**React:**
- React 18 with hooks
- TanStack Query for server state
- React Hook Form + Zod for forms
- Tailwind CSS for styling

**API:**
- Express.js with TypeScript
- REST endpoints (GraphQL planned)
- JWT authentication with RS256
- Multi-tenant middleware (all queries scoped by tenantId)

### Architecture Guides

| Document | Topic | Location |
|----------|-------|----------|
| [`implementation-guide.md`](./docs/architecture/implementation-guide.md) | Implementation patterns | docs/architecture |
| [`menu-structure.md`](./docs/architecture/menu-structure.md) | Navigation structure | docs/architecture |
| [`ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md) | System architecture | docs/architecture |

---

## 📡 API Documentation

### Backend Routes

**Location:** `/root/autolytiq/apps/backend/src/routes/`

**Available Endpoints:**
- **Auth:** `/api/auth` - Login, register, refresh tokens
- **Customers:** `/api/customers` - CRUD, search, license scanning
- **Vehicles:** `/api/vehicles` - CRUD, VIN decoder, inventory
- **Deals:** `/api/deals` - Deal management
- **Leads:** `/api/leads` - Lead management
- **Dashboard:** `/api/dashboard` - Layout management (NEW)
- **Widgets:** `/api/widgets` - Widget definitions & data (NEW)

### GraphQL (Planned)

**Status:** Proposed in `/root/CLAUDE.md`
**Purpose:** Unified API gateway for microservices
**Timeline:** Phase 2 of transformation plan (Weeks 5-8)

---

## 🗂️ Documentation by Category

### By Role

**Sales:**
- Deal Studio Design Plan
- CRM Capabilities Analysis
- Lead Management (in CRM docs)

**Service:**
- Service module (in Tekion Roadmap)

**Finance & Accounting:**
- F&I Suite (in Tekion Roadmap)
- Accounting Dashboard (in Role-Based Dashboard Architecture)

**Developers:**
- System Status
- Architecture guides
- API documentation

**Admins:**
- Deployment guides
- Security summary
- Audit logs

### By Module

**CRM:**
- [`CRM-CAPABILITIES-ANALYSIS.md`](./docs/features/CRM-CAPABILITIES-ANALYSIS.md)
- [`CRM-ADAPTIVE-LEAD-SCORING.md`](./docs/features/CRM-ADAPTIVE-LEAD-SCORING.md)
- [`CRM-TIMELINE-ARCHITECTURE.md`](./docs/architecture/CRM-TIMELINE-ARCHITECTURE.md)

**Deal Desking:**
- [`DEAL_STUDIO_DESIGN_PLAN.md`](./DEAL_STUDIO_DESIGN_PLAN.md)
- ML Desking Verification Results

**Inventory:**
- Data Entry System (vehicles)
- Vehicle workflow (in Tekion Roadmap)

**F&I:**
- F&I Suite (in Tekion Roadmap)

**Accounting:**
- Accounting dashboard (in Role-Based Dashboard Architecture)

**Service:**
- Service module (in Tekion Roadmap)

---

## 📁 Directory Structure

### Root-Level Documentation

```
/root/autolytiq/
├── README.md                                    # Main project README
├── QUICK_START.md                               # Quick deployment guide
├── SYSTEM_STATUS.md                             # Current system health (2025-11-05)
├── TEKION_INSPIRED_ROADMAP.md                   # Strategic 12-week plan
├── DEAL_STUDIO_DESIGN_PLAN.md                   # Deal Studio design (2225 lines)
├── DATA_ENTRY_SYSTEM.md                         # Customer/Vehicle entry system
├── ROLE_BASED_DASHBOARD_ARCHITECTURE.md         # Dashboard system design
└── DOCUMENTATION_INDEX.md (this file)           # You are here
```

### Docs Directory

```
/root/autolytiq/docs/
├── architecture/
│   ├── MULTITENANCY_AI_ARCHITECTURE.md
│   ├── CRM-TIMELINE-ARCHITECTURE.md
│   ├── ARCHITECTURE.md
│   ├── implementation-guide.md
│   └── menu-structure.md
├── features/
│   ├── CRM-CAPABILITIES-ANALYSIS.md
│   ├── CRM-ADAPTIVE-LEAD-SCORING.md
│   ├── ML-DESKING-VERIFICATION-RESULTS.md
│   ├── DESIGN_SYSTEM_IMPLEMENTATION.md
│   └── UI-DESIGN-SYSTEM-COMPLETE.md
├── deployment/
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DEPLOYMENT-VERIFICATION-CHECKLIST.md
│   └── DNS-CONFIGURATION.md
├── operations/
│   ├── ops.md
│   ├── SECURITY-SUMMARY.md
│   └── secrets.md
└── guides/
    ├── SCHEMA_MIGRATION_GUIDE.md
    ├── TROUBLESHOOTING.md
    └── provider_setup_walkthrough.md
```

---

## 🗑️ Deleted Outdated Documentation

**Cleaned Up (2025-11-05):**

The following 17 status files were outdated and have been deleted:

1. SITUATION_RESOLVED.md
2. HOTFIX_STATUS.md
3. DEPLOYMENT_STATUS.md
4. DEPLOYMENT_GUIDE.md (duplicate)
5. DEAL_STUDIO_PROGRESS_REPORT.md
6. TEST_RESULTS.md
7. RUST_SERVICE_DEPLOYMENT.md
8. DEAL_STUDIO_RUST_INTEGRATION.md
9. DESKING_CALCULATOR.md
10. INTERCONNECTED_NAVIGATION.md
11. UNIFIED_NAVIGATION_README.md
12. NAVIGATION_ARCHITECTURE.md
13. MISSING_PAGES_ANALYSIS.md
14. IMPLEMENTATION_PLAN.md
15. SESSION_STATE.md
16. WORK_SUMMARY.md
17. SHORT_CHANGELOG.md

**Reason:** These were temporary status reports that are now superceded by `SYSTEM_STATUS.md` and this documentation index.

---

## 🎯 Next Steps

### Immediate Actions

1. **Complete Dashboard Implementation** (Weeks 1-6)
   - Phase 1: Backend API routes
   - Phase 2: Frontend components
   - Phase 3: Core widgets (8 initial)
   - Phase 4: Customization system
   - Phase 5: Role-specific dashboards
   - Phase 6: Full widget catalog (30+)

2. **F&I Suite** (Weeks 1-4, per Tekion Roadmap)
   - Product catalog
   - Menu builder
   - Lender integration
   - Contract generation
   - E-signature

3. **Service Module** (Weeks 9-12, per Tekion Roadmap)
   - Appointment scheduler
   - RO creation
   - Technician dispatch
   - Parts ordering

### Strategic Priorities

From `/root/CLAUDE.md` transformation plan:

1. **Intuitive Design** - Unified IA with clear module separation
2. **Seamless Cohesion** - GraphQL gateway for unified data fetching
3. **Elite Performance** - <100ms API responses, real-time Rust calculations
4. **Zero Cognitive Load** - Expand component library to 30+ components
5. **Proactive Intelligence** - AI Companion deeply integrated

---

## 🔍 Finding Information

### "Where is X?"

**Customer/Vehicle Entry:** [`DATA_ENTRY_SYSTEM.md`](./DATA_ENTRY_SYSTEM.md)
**Deal Desking:** [`DEAL_STUDIO_DESIGN_PLAN.md`](./DEAL_STUDIO_DESIGN_PLAN.md)
**Dashboards:** [`ROLE_BASED_DASHBOARD_ARCHITECTURE.md`](./ROLE_BASED_DASHBOARD_ARCHITECTURE.md)
**Strategic Roadmap:** [`TEKION_INSPIRED_ROADMAP.md`](./TEKION_INSPIRED_ROADMAP.md)
**System Health:** [`SYSTEM_STATUS.md`](./SYSTEM_STATUS.md)
**Deployment:** [`docs/deployment/DEPLOYMENT_GUIDE.md`](./docs/deployment/DEPLOYMENT_GUIDE.md)
**Architecture:** [`/root/CLAUDE.md`](../../CLAUDE.md) or [`docs/architecture/`](./docs/architecture/)

### Search Commands

```bash
# Find all documentation
find /root/autolytiq -name "*.md" -type f | grep -v node_modules

# Search documentation content
grep -r "keyword" /root/autolytiq/*.md /root/autolytiq/docs/**/*.md

# Count documentation
find . -name "*.md" -not -path "*/node_modules/*" | wc -l
```

---

## 📝 Documentation Standards

### File Naming

- **Strategic:** UPPERCASE_WITH_UNDERSCORES.md
- **Guides:** kebab-case.md
- **Status:** SYSTEM_STATUS.md format

### Structure

All documentation should include:
1. Title and purpose
2. Last updated date
3. Status (Active, Complete, Deprecated)
4. Table of contents (for docs > 100 lines)
5. Next steps or related documents

### Maintenance

- Update `SYSTEM_STATUS.md` after major changes
- Update this index when adding/removing docs
- Delete outdated status reports (keep max 1-2 recent)
- Keep `/root/CLAUDE.md` as the source of truth

---

## 📞 Support

**For Questions:**
- Check this index first
- Review relevant doc from index
- Check `SYSTEM_STATUS.md` for current state
- Review `/root/CLAUDE.md` for strategic direction

**For Issues:**
- Frontend: Check browser console + Network tab
- Backend: Check server logs (`pnpm --filter @repo/backend dev`)
- Database: Check Prisma logs
- Deployment: Check [`docs/deployment/TROUBLESHOOTING.md`](./docs/deployment/TROUBLESHOOTING.md)

---

## 🏆 Documentation Metrics

**Total Documentation Files:** 30+ (excluding node_modules)
**Root-Level Core Docs:** 8
**Strategic Documents:** 3
**Architecture Guides:** 7
**Feature Docs:** 8
**Deployment Guides:** 4
**Operations Docs:** 3

**Last Cleanup:** 2025-11-05 (Removed 17 outdated files)
**Next Review:** 2025-11-12

---

## ✅ Verification Checklist

When adding new documentation:

- [ ] Added to this index under appropriate category
- [ ] Includes last updated date
- [ ] Includes status (Active/Complete/Deprecated)
- [ ] Includes table of contents if > 100 lines
- [ ] Cross-references related documents
- [ ] Follows naming conventions
- [ ] Updated `SYSTEM_STATUS.md` if applicable
- [ ] Deleted any outdated docs it replaces

---

**End of Documentation Index**
**Maintained by:** Development Team
**Last Updated:** 2025-11-05
**Version:** 1.0

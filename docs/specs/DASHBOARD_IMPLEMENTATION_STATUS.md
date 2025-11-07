# Dashboard Implementation Status & Module Organization Plan
**Role-Based Customizable Dashboards**

**Last Updated:** 2025-11-05
**Status:** Backend Complete ✅ | Frontend In Progress 🔨

---

## ✅ Completed Work

### 1. Database Schema ✅
**Status:** Complete - Prisma client generated

**Tables Added:**
- `DashboardLayout` - Stores user's custom widget layouts
- `WidgetDefinition` - Widget catalog with permissions
- `UserWidgetPreference` - Per-user widget config

**Location:** `/root/autolytiq/packages/db/schema.prisma` (lines 2725-2820)

---

### 2. Backend API Routes ✅
**Status:** Complete - Routes registered

**Files Created:**
- `/root/autolytiq/apps/backend/src/routes/dashboard.routes.ts` (API endpoints)
- `/root/autolytiq/apps/backend/src/services/dashboard.service.ts` (Default layouts)

**Endpoints Available:**
```
GET    /api/dashboard/layout?role={role}
PUT    /api/dashboard/layout
DELETE /api/dashboard/layout?role={role}
GET    /api/dashboard/defaults/:role
```

**Registered in:** `/root/autolytiq/apps/backend/src/routes/index.ts` (line 50)

---

### 3. Default Role Layouts ✅
**Status:** Complete - All 7 roles configured

**Roles Configured:**
1. **SALES** - 5 widgets (Active Deals, Appointments, Hot Leads, Tasks, Leaderboard)
2. **SERVICE** - 4 widgets (Appointments, Open ROs, Approvals, Dispatch)
3. **FINANCE** - 5 widgets (Pending F&I, Submissions, Products, PVR, Backend Profit)
4. **ACCOUNTING** - 4 widgets (Unreconciled, Cash Flow, Invoices, Reconciliation)
5. **INVENTORY** - 5 widgets (Aging, Acquisitions, Pricing, Photos, Wholesale)
6. **DEVELOPER** - 4 widgets (System Health, API Perf, Error Logs, Queries)
7. **ADMIN** - 4 widgets (Overview, User Activity, Audit Log, Integrations)

**Location:** `/root/autolytiq/apps/backend/src/services/dashboard.service.ts`

---

## 🔨 Frontend Implementation Plan

### Phase 1: Core Components (Next Step)

#### 1.1 Create Dashboard Directory Structure
```bash
mkdir -p apps/frontend/src/pages/dashboard
mkdir -p apps/frontend/src/components/dashboard
mkdir -p apps/frontend/src/components/widgets
mkdir -p apps/frontend/src/hooks/dashboard
mkdir -p apps/frontend/src/lib/dashboard
```

#### 1.2 Install Required Packages
```bash
cd apps/frontend
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

#### 1.3 Create Core Dashboard Components

**DashboardLayout Component:**
```typescript
// apps/frontend/src/components/dashboard/DashboardLayout.tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { DashboardWidget } from './DashboardWidget';
import { useDashboardLayout } from '@/hooks/dashboard/useDashboardLayout';

export function DashboardLayout({ role }: { role: string }) {
  const { layout, updateLayout, isEditing, setIsEditing } = useDashboardLayout(role);

  return (
    <div className="dashboard-container p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {role.charAt(0) + role.slice(1).toLowerCase()} Dashboard
        </h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {isEditing ? 'Done Editing' : 'Customize'}
        </button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {layout.widgets.map(widget => (
            <DashboardWidget
              key={widget.id}
              widget={widget}
              isEditing={isEditing}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
```

**useDashboardLayout Hook:**
```typescript
// apps/frontend/src/hooks/dashboard/useDashboardLayout.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export function useDashboardLayout(role: string) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-layout', role],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/dashboard/layout?role=${role}`);
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (layout: any) => {
      return apiRequest('PUT', '/api/dashboard/layout', { role, layout });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-layout', role] });
    },
  });

  return {
    layout: data?.layout || { columns: 4, widgets: [] },
    isDefault: data?.isDefault || false,
    isLoading,
    updateLayout: updateMutation.mutate,
    isEditing,
    setIsEditing,
  };
}
```

---

### Phase 2: Widget System

#### 2.1 Create Widget Registry
```typescript
// apps/frontend/src/lib/dashboard/widgetRegistry.ts
import { lazy } from 'react';

export const widgetRegistry = {
  'active-deals': lazy(() => import('@/components/widgets/ActiveDealsWidget')),
  'hot-leads': lazy(() => import('@/components/widgets/HotLeadsWidget')),
  'today-appointments': lazy(() => import('@/components/widgets/TodayAppointmentsWidget')),
  'pending-tasks': lazy(() => import('@/components/widgets/PendingTasksWidget')),
  'sales-leaderboard': lazy(() => import('@/components/widgets/SalesLeaderboardWidget')),
  // ... 25+ more widgets
};

export function getWidgetComponent(key: string) {
  return widgetRegistry[key] || null;
}
```

#### 2.2 Create Sample Widgets

**Active Deals Widget:**
```typescript
// apps/frontend/src/components/widgets/ActiveDealsWidget.tsx
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export default function ActiveDealsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['active-deals'],
    queryFn: () => apiRequest('GET', '/api/deals?status=ACTIVE&limit=5'),
    refetchInterval: 30000, // Refresh every 30s
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="widget-card p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Active Deals</h3>
      <div className="space-y-2">
        {data?.data.map((deal: any) => (
          <div key={deal.id} className="p-2 bg-gray-50 rounded">
            <div className="font-medium">{deal.customer?.name}</div>
            <div className="text-sm text-gray-600">
              {deal.vehicle?.year} {deal.vehicle?.make} {deal.vehicle?.model}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📁 Module Organization Plan

### Current Structure (Flat)
```
apps/frontend/src/pages/
├── customers.tsx
├── inventory.tsx
├── leads.tsx
├── desking.tsx
├── appointments.tsx
├── activities.tsx
├── communications.tsx
└── ... (150+ files)
```

### Proposed Structure (Modular)
```
apps/frontend/src/pages/
├── dashboard/
│   ├── index.tsx              # Role-based router
│   ├── sales.tsx              # Sales dashboard
│   ├── service.tsx            # Service dashboard
│   ├── finance.tsx            # Finance dashboard
│   ├── accounting.tsx         # Accounting dashboard
│   ├── inventory.tsx          # Inventory dashboard
│   ├── developer.tsx          # Developer dashboard
│   └── admin.tsx              # Admin dashboard
│
├── crm/
│   ├── index.tsx              # CRM module home
│   ├── leads/
│   │   ├── index.tsx          # Leads list
│   │   ├── [id].tsx           # Lead detail
│   │   └── new.tsx            # New lead
│   ├── customers/
│   │   ├── index.tsx          # Customers list
│   │   ├── [id].tsx           # Customer detail
│   │   └── new.tsx            # New customer
│   ├── activities/
│   ├── appointments/
│   └── communications/
│
├── deals/
│   ├── index.tsx              # Deals list
│   ├── [id]/
│   │   ├── index.tsx          # Deal detail
│   │   ├── desking.tsx        # Deal Studio
│   │   ├── fi.tsx             # F&I products
│   │   └── contracts.tsx      # Contracts
│   └── new.tsx                # New deal
│
├── inventory/
│   ├── index.tsx              # Vehicle list
│   ├── [id]/
│   │   ├── index.tsx          # Vehicle detail
│   │   ├── pricing.tsx        # Pricing history
│   │   └── workflow.tsx       # Recon workflow
│   ├── acquisitions/
│   ├── appraisals/
│   └── wholesale/
│
├── service/
│   ├── index.tsx              # Service appointments
│   ├── [id].tsx               # Repair order detail
│   ├── calendar.tsx           # Service calendar
│   ├── dispatch.tsx           # Technician dispatch
│   └── parts/
│
├── accounting/
│   ├── index.tsx              # Accounting home
│   ├── reconciliation/
│   ├── reports/
│   ├── gl-accounts/
│   └── commissions/
│
├── analytics/
│   ├── index.tsx              # Analytics home
│   ├── sales/
│   ├── inventory/
│   ├── finance/
│   └── custom-reports/
│
└── admin/
    ├── index.tsx              # Admin home
    ├── users/
    ├── roles/
    ├── settings/
    ├── integrations/
    └── audit/
```

---

## 🗺️ Routing Structure

### Module-Based Routing with Wouter

```typescript
// apps/frontend/src/pages/dashboard/index.tsx
import { Route, Switch, Redirect } from 'wouter';
import { useUser } from '@/hooks/useUser';
import SalesDashboard from './sales';
import ServiceDashboard from './service';
import FinanceDashboard from './finance';
// ... other dashboards

export default function DashboardRouter() {
  const { user } = useUser();

  return (
    <Switch>
      <Route path="/dashboard" component={() => <Redirect to={`/dashboard/${user.role.toLowerCase()}`} />} />
      <Route path="/dashboard/sales" component={SalesDashboard} />
      <Route path="/dashboard/service" component={ServiceDashboard} />
      <Route path="/dashboard/finance" component={FinanceDashboard} />
      <Route path="/dashboard/accounting" component={AccountingDashboard} />
      <Route path="/dashboard/inventory" component={InventoryDashboard} />
      <Route path="/dashboard/developer" component={DeveloperDashboard} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
    </Switch>
  );
}
```

### Main App Router
```typescript
// apps/frontend/src/routes/index.tsx
import { Route, Switch } from 'wouter';
import DashboardRouter from '@/pages/dashboard';
import CRMRouter from '@/pages/crm';
import DealsRouter from '@/pages/deals';
import InventoryRouter from '@/pages/inventory';
// ... other module routers

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/dashboard/*" component={DashboardRouter} />
      <Route path="/crm/*" component={CRMRouter} />
      <Route path="/deals/*" component={DealsRouter} />
      <Route path="/inventory/*" component={InventoryRouter} />
      <Route path="/service/*" component={ServiceRouter} />
      <Route path="/accounting/*" component={AccountingRouter} />
      <Route path="/analytics/*" component={AnalyticsRouter} />
      <Route path="/admin/*" component={AdminRouter} />
    </Switch>
  );
}
```

---

## 📊 Implementation Checklist

### Backend (Complete) ✅
- [x] Database schema for dashboards
- [x] Dashboard API routes
- [x] Default layouts for 7 roles
- [x] Layout CRUD operations
- [x] Route registration

### Frontend (In Progress) 🔨

#### Core Infrastructure
- [ ] Install @dnd-kit packages
- [ ] Create dashboard directory structure
- [ ] Create `DashboardLayout` component
- [ ] Create `DashboardWidget` component
- [ ] Create `useDashboardLayout` hook
- [ ] Create widget registry

#### Dashboard Pages (7 Total)
- [ ] Sales dashboard page
- [ ] Service dashboard page
- [ ] Finance dashboard page
- [ ] Accounting dashboard page
- [ ] Inventory dashboard page
- [ ] Developer dashboard page
- [ ] Admin dashboard page

#### Widgets (Priority: 8)
- [ ] Active Deals Widget
- [ ] Hot Leads Widget
- [ ] Today's Appointments Widget
- [ ] Pending Tasks Widget
- [ ] Sales Leaderboard Widget
- [ ] Dealership Overview Widget
- [ ] System Health Widget
- [ ] Cash Flow Summary Widget

#### Module Organization
- [ ] Create `crm/` module directory
- [ ] Create `deals/` module directory
- [ ] Create `inventory/` module directory
- [ ] Create `service/` module directory
- [ ] Create `accounting/` module directory
- [ ] Create `analytics/` module directory
- [ ] Create `admin/` module directory
- [ ] Move existing pages to modules
- [ ] Update all route references

#### Advanced Features
- [ ] Drag-and-drop widget rearrangement
- [ ] Widget add/remove modal
- [ ] Widget resize handles
- [ ] Save layout persistence
- [ ] Reset to default button
- [ ] Mobile responsive layout
- [ ] Real-time widget updates (WebSocket)

---

## 🚀 Quick Start Commands

### Backend (Already Running)
```bash
cd /root/autolytiq
pnpm --filter @repo/backend dev
```

### Frontend Development
```bash
cd /root/autolytiq/apps/frontend

# Install dashboard dependencies
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Create directory structure
mkdir -p src/pages/dashboard
mkdir -p src/components/dashboard
mkdir -p src/components/widgets
mkdir -p src/hooks/dashboard
mkdir -p src/lib/dashboard

# Start dev server
pnpm dev
```

---

## 📝 Next Steps (Immediate)

### Step 1: Install Dependencies (5 min)
```bash
cd apps/frontend
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Step 2: Create Dashboard Pages (30 min)
1. Create `/apps/frontend/src/pages/dashboard/sales.tsx`
2. Import `DashboardLayout` component
3. Pass role="SALES" prop
4. Test at `/dashboard/sales`

### Step 3: Create First Widget (15 min)
1. Create `/apps/frontend/src/components/widgets/ActiveDealsWidget.tsx`
2. Fetch deals from `/api/deals?status=ACTIVE`
3. Display in card format

### Step 4: Module Organization (2-3 hours)
1. Create module directories (`crm/`, `deals/`, etc.)
2. Move existing pages to appropriate modules
3. Update route definitions
4. Test all navigation

---

## 📚 Related Documentation

- **Architecture:** [`ROLE_BASED_DASHBOARD_ARCHITECTURE.md`](./ROLE_BASED_DASHBOARD_ARCHITECTURE.md)
- **API Routes:** Backend routes registered in `apps/backend/src/routes/index.ts`
- **Database Schema:** `packages/db/schema.prisma` (lines 2725-2820)
- **Default Layouts:** `apps/backend/src/services/dashboard.service.ts`

---

## 🎯 Success Metrics

**Backend:**
- ✅ API responds to all dashboard endpoints
- ✅ Default layouts load correctly
- ✅ Layout save/update works
- ✅ Multi-tenant isolation enforced

**Frontend (Target):**
- [ ] All 7 dashboards render correctly
- [ ] Widgets load data successfully
- [ ] Drag-and-drop works smoothly (60 FPS)
- [ ] Layout persists across sessions
- [ ] Mobile responsive on all devices

---

## 💡 Tips for Implementation

### Performance
- Use `React.lazy()` for widget components (code splitting)
- Implement virtual scrolling for dashboards with 20+ widgets
- Cache widget data in TanStack Query (30s-5min depending on widget)
- Use WebSocket for real-time widgets (not polling)

### User Experience
- Show skeleton loaders while widgets load
- Provide clear "Customize" button
- Allow reset to default layout
- Show widget descriptions in add modal
- Highlight new/unsaved changes

### Testing
- Test each dashboard with different roles
- Test drag-and-drop on different screen sizes
- Test widget data fetching with slow API
- Test permission-based widget filtering

---

**Document Version:** 1.0
**Last Updated:** 2025-11-05
**Status:** Backend Complete ✅ | Frontend Ready to Build 🔨
**Estimated Time to MVP:** 1-2 weeks (with 7 dashboards + 8 widgets)

---

## Database Schema Notes

> From packages/db/DASHBOARD_DEPLOYMENT.md


## Overview

This guide covers deploying the role-based customizable dashboard system to the Autolytiq database. The dashboard system consists of:

- **3 New Database Tables**: `dashboard_layouts`, `widget_definitions`, `user_widget_preferences`
- **3 New Enums**: `WidgetCategory`, `WidgetType`, `WidgetSize`
- **32 Widget Definitions**: Pre-seeded widget catalog for all roles
- **7 Role-Based Dashboards**: SALES, SERVICE, FINANCE, ACCOUNTING, INVENTORY, DEVELOPER, ADMIN

---

## Database Changes

### New Tables

#### 1. `dashboard_layouts`
Stores user-customized dashboard layouts per role.

```sql
CREATE TABLE "dashboard_layouts" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "role" "UserRole",
    "is_default" BOOLEAN DEFAULT false,
    "layout" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "dashboard_layouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "dashboard_layouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
);
```

#### 2. `widget_definitions`
Catalog of all available dashboard widgets.

```sql
CREATE TABLE "widget_definitions" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "WidgetCategory" NOT NULL,
    "type" "WidgetType" NOT NULL,
    "default_size" "WidgetSize" NOT NULL,
    "min_size" "WidgetSize" NOT NULL,
    "max_size" "WidgetSize" NOT NULL,
    "permissions" TEXT[],
    "data_source" TEXT NOT NULL,
    "refresh_interval" INTEGER,
    "config_schema" JSONB,
    "component_path" TEXT NOT NULL,
    "icon" TEXT,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
```

#### 3. `user_widget_preferences`
User-specific preferences for individual widgets.

```sql
CREATE TABLE "user_widget_preferences" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "widget_key" TEXT NOT NULL,
    "config" JSONB,
    "hidden" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_widget_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
```

### New Enums

```sql
CREATE TYPE "WidgetCategory" AS ENUM ('SALES', 'SERVICE', 'FINANCE', 'ACCOUNTING', 'INVENTORY', 'ANALYTICS', 'ADMIN', 'DEVELOPER');
CREATE TYPE "WidgetType" AS ENUM ('METRIC', 'LIST', 'CHART', 'CALENDAR', 'TABLE', 'CUSTOM');
CREATE TYPE "WidgetSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'WIDE', 'FULL');
```

---

## Deployment Instructions

### Step 1: Run Database Migration

The migration file is located at:
```
/root/autolytiq/packages/db/migrations/20251105_add_dashboard_tables/migration.sql
```

#### Option A: Using Prisma (Recommended for Kubernetes)

```bash
cd /root/autolytiq/packages/db

# Apply migration
npx prisma migrate deploy

# Verify tables were created
npx prisma db pull
```

#### Option B: Manual SQL Execution (Alternative)

```bash
# Connect to PostgreSQL
psql -U <username> -d autolytiq

# Run migration
\i migrations/20251105_add_dashboard_tables/migration.sql

# Verify tables
\dt dashboard_*
\dt widget_*
\dT+ Widget*
```

### Step 2: Seed Widget Definitions

After the migration runs successfully, seed the widget definitions:

```bash
cd /root/autolytiq/packages/db

# Run seed script (includes widget definitions)
npx tsx seed.ts

# Or run just widget definitions seeder
npx tsx -e "import { PrismaClient } from '@prisma/client'; import { seedWidgetDefinitions } from './seed/seeders/seedWidgetDefinitions'; const prisma = new PrismaClient(); seedWidgetDefinitions(prisma).then(() => prisma.$disconnect());"
```

**Expected Output:**
```
📊 Seeding widget definitions...
  ✓ Created 32 widget definitions
  Widget breakdown by category:
    - SALES: 5 widgets
    - SERVICE: 4 widgets
    - FINANCE: 5 widgets
    - ACCOUNTING: 4 widgets
    - INVENTORY: 5 widgets
    - ANALYTICS: 3 widgets
    - ADMIN: 4 widgets
    - DEVELOPER: 4 widgets
```

### Step 3: Verify Deployment

```bash
# Check widget definitions
npx prisma studio

# Navigate to widget_definitions table
# Should see 32 records

# Check enums
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'WidgetCategory'::regtype;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'WidgetType'::regtype;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'WidgetSize'::regtype;
```

---

## Kubernetes Deployment

### Environment Variables

Ensure the following environment variables are set in your Kubernetes deployment:

```yaml
# packages/db deployment
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: autolytiq-db-secrets
        key: database-url
  - name: DIRECT_URL
    valueFrom:
      secretKeyRef:
        name: autolytiq-db-secrets
        key: direct-url
```

### Migration Job

Create a Kubernetes Job to run migrations on deployment:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: autolytiq-db-migration-dashboard
  namespace: autolytiq
spec:
  template:
    spec:
      containers:
      - name: prisma-migrate
        image: autolytiq/db:latest
        command:
          - npx
          - prisma
          - migrate
          - deploy
        env:
          - name: DATABASE_URL
            valueFrom:
              secretKeyRef:
                name: autolytiq-db-secrets
                key: database-url
        workingDir: /app/packages/db
      restartPolicy: OnFailure
  backoffLimit: 3
```

### Seed Job (One-Time)

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: autolytiq-db-seed-widgets
  namespace: autolytiq
spec:
  template:
    spec:
      containers:
      - name: prisma-seed
        image: autolytiq/db:latest
        command:
          - npx
          - tsx
          - seed.ts
        env:
          - name: DATABASE_URL
            valueFrom:
              secretKeyRef:
                name: autolytiq-db-secrets
                key: database-url
        workingDir: /app/packages/db
      restartPolicy: Never
```

---

## Rollback Instructions

If you need to rollback the dashboard tables:

```sql
-- Drop tables (cascades to delete all data)
DROP TABLE IF EXISTS "user_widget_preferences" CASCADE;
DROP TABLE IF EXISTS "dashboard_layouts" CASCADE;
DROP TABLE IF EXISTS "widget_definitions" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "WidgetSize";
DROP TYPE IF EXISTS "WidgetType";
DROP TYPE IF EXISTS "WidgetCategory";
```

**⚠️ WARNING:** This will permanently delete all dashboard layouts and widget preferences.

---

## Post-Deployment Verification

### 1. Check Table Counts

```sql
SELECT
  (SELECT COUNT(*) FROM dashboard_layouts) as layouts,
  (SELECT COUNT(*) FROM widget_definitions) as widgets,
  (SELECT COUNT(*) FROM user_widget_preferences) as preferences;
```

Expected initial state:
- `layouts`: 0 (users create their own)
- `widgets`: 32 (pre-seeded)
- `preferences`: 0 (users customize as needed)

### 2. Test Widget Retrieval

```sql
-- Get all available widgets for SALES role
SELECT key, name, category, type, default_size, permissions
FROM widget_definitions
WHERE category = 'SALES' AND active = true;
```

### 3. Test API Endpoints

```bash
# Get default layout for SALES role
curl -X GET http://localhost:3000/api/dashboard/layout?role=SALES \
  -H "Authorization: Bearer <token>"

# Expected response:
{
  "data": {
    "layout": {
      "columns": 4,
      "widgets": [
        {"id": "w1", "key": "active-deals", "position": {"x": 0, "y": 0}, "size": {"w": 2, "h": 2}},
        {"id": "w2", "key": "today-appointments", "position": {"x": 2, "y": 0}, "size": {"w": 2, "h": 1}},
        ...
      ]
    },
    "isDefault": true
  }
}
```

---

## Widget Catalog

### By Category

**SALES (5 widgets):**
- `active-deals` - Current deals in progress
- `hot-leads` - High-priority leads
- `today-appointments` - Today's appointments
- `pending-tasks` - Pending tasks
- `sales-leaderboard` - Sales performance

**SERVICE (4 widgets):**
- `service-appointments` - Service appointments
- `active-service-orders` - Active service orders
- `bay-status` - Service bay status
- `parts-inventory` - Parts inventory

**FINANCE (5 widgets):**
- `fi-pipeline` - F&I pipeline
- `pending-approvals` - Credit approvals
- `fi-products-sold` - F&I products sold
- `profit-per-deal` - Profit metrics
- `lender-performance` - Lender performance

**ACCOUNTING (4 widgets):**
- `daily-revenue` - Daily revenue
- `cash-flow` - Cash flow
- `pending-payments` - Pending payments
- `expense-tracking` - Expense tracking

**INVENTORY (5 widgets):**
- `vehicle-inventory` - Vehicle inventory
- `aging-inventory` - Aging analysis
- `pricing-alerts` - Pricing alerts
- `trade-appraisals` - Trade appraisals
- `inventory-value` - Total inventory value

**ANALYTICS (3 widgets):**
- `sales-pipeline` - Sales pipeline
- `conversion-rate` - Conversion rate
- `customer-satisfaction` - Customer satisfaction

**ADMIN (4 widgets):**
- `dealership-overview` - Dealership KPIs
- `user-activity` - User activity
- `system-health` - System health
- `integration-status` - Integration status

**DEVELOPER (4 widgets):**
- `api-performance` - API performance
- `error-logs` - Recent errors
- `background-jobs` - Background jobs
- `database-stats` - Database statistics

---

## Troubleshooting

### Issue: Migration fails with "enum already exists"

**Solution:**
```sql
-- Check if enums exist
SELECT typname FROM pg_type WHERE typname LIKE 'Widget%';

-- If they exist, skip enum creation or drop and recreate
DROP TYPE IF EXISTS "WidgetSize" CASCADE;
DROP TYPE IF EXISTS "WidgetType" CASCADE;
DROP TYPE IF EXISTS "WidgetCategory" CASCADE;
```

### Issue: Foreign key constraint fails

**Solution:**
Ensure `users` and `tenants` tables exist before running migration:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'tenants');
```

### Issue: Seed fails with "widget definitions already exist"

**Solution:**
The seeder is idempotent and will skip if widgets exist. To re-seed:
```sql
DELETE FROM widget_definitions;
-- Then re-run seed script
```

---

## Support

For issues or questions:
1. Check logs: `kubectl logs -n autolytiq -l app=autolytiq-db`
2. Check Prisma schema: `/root/autolytiq/packages/db/schema.prisma`
3. Review architecture: `/root/autolytiq/ROLE_BASED_DASHBOARD_ARCHITECTURE.md`

---

## Next Steps

After successful deployment:
1. ✅ Dashboard tables created
2. ✅ 32 widgets seeded
3. ⏭️ Frontend dashboard routes active
4. ⏭️ Users can customize their dashboards
5. ⏭️ Build remaining 10+ widgets from roadmap
6. ⏭️ Implement drag-and-drop layout editor (Phase 2)

---

**Last Updated:** 2025-11-05
**Migration Version:** 20251105_add_dashboard_tables
**Database Package:** @repo/db
**Deployment Target:** Kubernetes

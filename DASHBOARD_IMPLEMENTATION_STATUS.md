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

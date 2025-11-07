# Role-Based Dashboard Architecture
**Autolytiq Customizable Homepage System**

**Generated:** 2025-11-05
**Status:** Architecture Design & Implementation Plan

---

## Executive Summary

This document defines the architecture for Autolytiq's **role-based customizable dashboard system** where each user gets a personalized homepage based on their role (Sales, Service, Finance, Accounting, Developer, Admin, Inventory) with drag-and-drop customizable widgets.

**Key Features:**
- 🎯 **Role-Based Defaults:** Each role gets an optimized default layout
- 🎨 **Full Customization:** Users can add/remove/rearrange widgets
- 💾 **Persistent Preferences:** Layout saved per-user in database
- 🔒 **Permission-Based:** Widgets respect RBAC permissions
- 📱 **Responsive:** Works on desktop, tablet, mobile
- ⚡ **Real-Time Data:** Live updates via WebSocket/polling

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Role Definitions](#role-definitions)
3. [Widget System](#widget-system)
4. [Database Schema](#database-schema)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend API](#backend-api)
7. [Widget Catalog](#widget-catalog)
8. [Implementation Plan](#implementation-plan)

---

## Core Concepts

### 1. Role-Based Homepage

Every user sees a different "homepage" based on their primary role:

```
/dashboard → Dynamic route that shows role-specific homepage
/dashboard/sales → Sales team homepage
/dashboard/service → Service team homepage
/dashboard/finance → Finance team homepage
/dashboard/accounting → Accounting team homepage
/dashboard/inventory → Inventory team homepage
/dashboard/developer → Developer tools homepage
/dashboard/admin → Admin control center
```

### 2. Widget System

A **widget** is a self-contained component that displays specific data:

**Examples:**
- Active Deals Widget (shows deals in progress)
- Appointment Calendar Widget
- Sales Leaderboard Widget
- Pending Tasks Widget
- Revenue Chart Widget
- Vehicle Inventory Count Widget

**Widget Properties:**
- **ID:** Unique identifier
- **Type:** Widget category (chart, list, metric, calendar, etc.)
- **Size:** Small (1x1), Medium (2x1), Large (2x2), Wide (3x1)
- **Permissions:** Required role/permission to view
- **Data Source:** API endpoint or GraphQL query
- **Refresh Interval:** How often to update (5s, 30s, 5m, never)

### 3. Layout Grid System

Dashboard uses a **responsive grid layout:**

**Desktop:** 4 columns, flexible rows
**Tablet:** 2 columns, flexible rows
**Mobile:** 1 column, stacked

**Example Layout:**
```
┌─────────────────────────────────────┐
│  [Active Deals - Large 2x2]         │
│                                     │
├──────────────────┬──────────────────┤
│ [Tasks - Med]    │ [Calendar - Med] │
├──────────────────┼──────────────────┤
│ [Revenue Chart - Wide 4x1]          │
└─────────────────────────────────────┘
```

---

## Role Definitions

### 1. Sales Role
**Primary Users:** Salespeople, BDC reps, sales managers
**Focus:** Leads, deals, customers, appointments

**Default Widgets:**
1. **My Active Deals** (Large) - Current deals in progress
2. **Today's Appointments** (Medium) - Calendar view
3. **Hot Leads** (Medium) - Leads with high score
4. **Sales Leaderboard** (Medium) - Team rankings
5. **Pending Tasks** (Small) - Follow-ups and reminders

### 2. Service Role
**Primary Users:** Service advisors, technicians, service managers
**Focus:** Appointments, ROs, labor hours, customer vehicles

**Default Widgets:**
1. **Today's Appointments** (Large) - Service calendar
2. **Open Repair Orders** (Medium) - Active ROs
3. **Pending Approvals** (Medium) - Estimates awaiting approval
4. **Technician Dispatch** (Wide) - Bay assignments
5. **Parts Status** (Small) - Parts on order

### 3. Finance Role (F&I)
**Primary Users:** Finance managers
**Focus:** Deal structuring, lender submissions, contracts

**Default Widgets:**
1. **Pending Deals** (Large) - Deals awaiting F&I
2. **Lender Submissions** (Medium) - Approval status
3. **F&I Products Sold** (Medium) - Warranty, GAP, etc.
4. **Average PVR** (Small) - Per-vehicle revenue
5. **Backend Profit** (Small) - F&I profit metrics

### 4. Accounting Role
**Primary Users:** Controllers, accountants
**Focus:** GL, reconciliation, financial reports

**Default Widgets:**
1. **Unreconciled Deals** (Large) - Deals needing posting
2. **Cash Flow Summary** (Wide) - Revenue/expenses chart
3. **Pending Invoices** (Medium) - Payables
4. **Bank Reconciliation Status** (Medium)
5. **Commission Payouts** (Small)

### 5. Inventory Role
**Primary Users:** Inventory managers, buyers
**Focus:** Vehicle sourcing, aging, pricing

**Default Widgets:**
1. **Aging Inventory** (Large) - Days in stock
2. **Recent Acquisitions** (Medium) - Newly added vehicles
3. **Pricing Alerts** (Medium) - Market vs. list price
4. **Vehicles Needing Photos** (Small)
5. **Wholesale Candidates** (Small) - Aged units

### 6. Developer Role
**Primary Users:** Developers, DevOps
**Focus:** System health, logs, performance

**Default Widgets:**
1. **System Health** (Large) - Service status
2. **API Performance** (Wide) - Response times
3. **Error Logs** (Medium) - Recent errors
4. **Database Queries** (Medium) - Slow queries
5. **User Activity** (Small) - Current sessions

### 7. Admin Role
**Primary Users:** Dealership managers, system admins
**Focus:** Users, settings, audit, high-level metrics

**Default Widgets:**
1. **Dealership Overview** (Large) - Key metrics
2. **User Activity** (Medium) - Login history
3. **System Settings** (Medium) - Quick config
4. **Audit Log** (Wide) - Recent changes
5. **Integration Status** (Small) - DMS, CRM, etc.

---

## Widget System

### Widget Types

#### 1. **Metric Widget** (Single number + trend)
```
┌─────────────┐
│ Active Deals│
│     47      │
│   ↑ 12%    │
└─────────────┘
```

#### 2. **List Widget** (Scrollable items)
```
┌──────────────────┐
│ Hot Leads        │
├──────────────────┤
│ • John Smith     │
│ • Sarah Johnson  │
│ • Mike Williams  │
│ • ...            │
└──────────────────┘
```

#### 3. **Chart Widget** (Line, bar, pie)
```
┌──────────────────┐
│ Revenue (30d)    │
│      ╱╲          │
│     ╱  ╲  ╱╲     │
│   ╱      ╲╱      │
└──────────────────┘
```

#### 4. **Calendar Widget**
```
┌──────────────────┐
│ Nov 5, 2025      │
├──────────────────┤
│ 9:00 - Appt      │
│ 11:30 - Test     │
│ 2:00 - Demo      │
└──────────────────┘
```

#### 5. **Table Widget** (Data grid)
```
┌────────────────────────┐
│ Customer  | Vehicle    │
├────────────────────────┤
│ Smith     | 2024 F-150 │
│ Johnson   | 2023 Civic │
└────────────────────────┘
```

### Widget Lifecycle

```
User adds widget
  ↓
Frontend: Fetch widget definition
  ↓
Frontend: Check permissions
  ↓
Frontend: Render widget container
  ↓
Widget: Fetch data from API
  ↓
Widget: Display data
  ↓
Widget: Setup refresh interval
  ↓
Widget: Listen for real-time updates (WebSocket)
```

---

## Database Schema

### New Tables

```prisma
model DashboardLayout {
  id          String   @id @default(cuid())
  userId      String
  tenantId    String
  role        Role?    // If null, applies to all roles
  isDefault   Boolean  @default(false)
  layout      Json     // Widget positions and sizes
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant      Tenant   @relation(fields: [tenantId], references: [id])

  @@unique([userId, role])
  @@index([tenantId])
  @@index([userId])
}

model WidgetDefinition {
  id                String   @id @default(cuid())
  key               String   @unique  // e.g., "active-deals"
  name              String              // "Active Deals"
  description       String?
  category          WidgetCategory
  type              WidgetType
  defaultSize       WidgetSize
  minSize           WidgetSize
  maxSize           WidgetSize
  permissions       String[]            // Required permissions
  dataSource        String              // API endpoint or GraphQL query
  refreshInterval   Int?                // Seconds (null = no auto-refresh)
  configSchema      Json?               // JSON schema for widget settings
  componentPath     String              // React component path
  icon              String?
  active            Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

enum WidgetCategory {
  SALES
  SERVICE
  FINANCE
  ACCOUNTING
  INVENTORY
  ANALYTICS
  ADMIN
  DEVELOPER
}

enum WidgetType {
  METRIC
  LIST
  CHART
  CALENDAR
  TABLE
  CUSTOM
}

enum WidgetSize {
  SMALL      // 1x1
  MEDIUM     // 2x1
  LARGE      // 2x2
  WIDE       // 4x1
  FULL       // 4x2
}

model UserWidgetPreference {
  id          String   @id @default(cuid())
  userId      String
  widgetKey   String   // References WidgetDefinition.key
  config      Json?    // User-specific widget config
  hidden      Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, widgetKey])
  @@index([userId])
}
```

### Layout JSON Structure

```json
{
  "columns": 4,
  "widgets": [
    {
      "id": "widget-1",
      "key": "active-deals",
      "position": { "x": 0, "y": 0 },
      "size": { "w": 2, "h": 2 }
    },
    {
      "id": "widget-2",
      "key": "today-appointments",
      "position": { "x": 2, "y": 0 },
      "size": { "w": 2, "h": 1 }
    },
    {
      "id": "widget-3",
      "key": "hot-leads",
      "position": { "x": 2, "y": 1 },
      "size": { "w": 2, "h": 1 }
    }
  ]
}
```

---

## Frontend Architecture

### Directory Structure

```
apps/frontend/src/
├── pages/
│   └── dashboard/
│       ├── index.tsx              # Role-based router
│       ├── sales.tsx              # Sales dashboard
│       ├── service.tsx            # Service dashboard
│       ├── finance.tsx            # Finance dashboard
│       ├── accounting.tsx         # Accounting dashboard
│       ├── inventory.tsx          # Inventory dashboard
│       ├── developer.tsx          # Developer dashboard
│       └── admin.tsx              # Admin dashboard
├── components/
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx    # Grid layout container
│   │   ├── DashboardWidget.tsx    # Widget wrapper
│   │   ├── WidgetHeader.tsx       # Title, actions, menu
│   │   ├── WidgetLoading.tsx      # Loading skeleton
│   │   ├── WidgetError.tsx        # Error state
│   │   ├── WidgetCustomizer.tsx   # Add/remove widgets modal
│   │   └── WidgetSettings.tsx     # Per-widget settings
│   └── widgets/
│       ├── ActiveDealsWidget.tsx
│       ├── AppointmentCalendarWidget.tsx
│       ├── HotLeadsWidget.tsx
│       ├── SalesLeaderboardWidget.tsx
│       ├── RevenueChartWidget.tsx
│       ├── TaskListWidget.tsx
│       └── ... (30+ widgets)
├── hooks/
│   ├── useDashboardLayout.ts      # Fetch/save layout
│   ├── useWidgetData.ts           # Fetch widget data
│   └── useWidgetPermissions.ts    # Check permissions
└── lib/
    ├── dashboard/
    │   ├── widgetRegistry.ts      # Widget definitions
    │   ├── defaultLayouts.ts      # Role-based defaults
    │   └── layoutEngine.ts        # Grid calculations
    └── widgets/
        ├── widgetLoader.ts        # Dynamic widget loading
        └── widgetDataFetcher.ts   # Data fetching logic
```

### Key Components

#### 1. DashboardLayout Component

```tsx
// apps/frontend/src/components/dashboard/DashboardLayout.tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { DashboardWidget } from './DashboardWidget';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';

export function DashboardLayout({ role }: { role: Role }) {
  const { layout, updateLayout, isEditing, setIsEditing } = useDashboardLayout(role);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const newLayout = calculateNewLayout(layout, active, over);
    updateLayout(newLayout);
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader
        role={role}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
      />

      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={layout.widgets.map(w => w.id)}>
          <div className="dashboard-grid">
            {layout.widgets.map(widget => (
              <DashboardWidget
                key={widget.id}
                widget={widget}
                isEditing={isEditing}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {isEditing && <WidgetCustomizer role={role} />}
    </div>
  );
}
```

#### 2. DashboardWidget Component

```tsx
// apps/frontend/src/components/dashboard/DashboardWidget.tsx
import { Suspense, lazy } from 'react';
import { useWidgetData } from '@/hooks/useWidgetData';
import { WidgetLoading } from './WidgetLoading';
import { WidgetError } from './WidgetError';

export function DashboardWidget({ widget, isEditing }: DashboardWidgetProps) {
  const { data, isLoading, error } = useWidgetData(widget.key);
  const WidgetComponent = lazy(() => import(`@/components/widgets/${widget.componentPath}`));

  return (
    <div
      className={`widget-container size-${widget.size.w}x${widget.size.h}`}
      style={{
        gridColumn: `span ${widget.size.w}`,
        gridRow: `span ${widget.size.h}`,
      }}
    >
      <div className="widget-card">
        <WidgetHeader
          widget={widget}
          isEditing={isEditing}
        />

        <div className="widget-content">
          {isLoading && <WidgetLoading />}
          {error && <WidgetError error={error} />}
          {data && (
            <Suspense fallback={<WidgetLoading />}>
              <WidgetComponent data={data} config={widget.config} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Widget Data Fetching

```tsx
// apps/frontend/src/hooks/useWidgetData.ts
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export function useWidgetData(widgetKey: string) {
  return useQuery({
    queryKey: ['widget', widgetKey],
    queryFn: async () => {
      const widget = await apiRequest('GET', `/api/widgets/${widgetKey}/definition`);
      const data = await apiRequest('GET', widget.dataSource);
      return data;
    },
    refetchInterval: (data) => {
      const widget = data?.widget;
      return widget?.refreshInterval ? widget.refreshInterval * 1000 : false;
    },
  });
}
```

---

## Backend API

### API Endpoints

#### Dashboard Layouts

```
GET    /api/dashboard/layout?role={role}
  → Returns user's saved layout or role default

PUT    /api/dashboard/layout
  Body: { role, layout: { columns, widgets } }
  → Saves user's custom layout

DELETE /api/dashboard/layout?role={role}
  → Resets to role default

GET    /api/dashboard/defaults/{role}
  → Returns default layout for role
```

#### Widget Definitions

```
GET    /api/widgets
  Query: ?category={category}&role={role}
  → List all available widgets (filtered by permissions)

GET    /api/widgets/{key}
  → Get specific widget definition

GET    /api/widgets/{key}/data
  → Fetch widget data (executes dataSource query)

PUT    /api/widgets/{key}/preferences
  Body: { config, hidden }
  → Save user widget preferences
```

#### Widget Data Endpoints

Each widget defines its own data endpoint:

```
GET    /api/widgets/active-deals/data
GET    /api/widgets/hot-leads/data
GET    /api/widgets/today-appointments/data
GET    /api/widgets/sales-leaderboard/data
GET    /api/widgets/revenue-chart/data?period=30d
```

### Backend Implementation

```typescript
// apps/backend/src/routes/dashboard.routes.ts
import { Router } from 'express';
import { db } from '@repo/db';
import { requireAuth } from '@/middleware/auth';
import { getDefaultLayout } from '@/services/dashboard.service';

export const dashboardRouter = Router();

/**
 * GET /api/dashboard/layout - Get user's dashboard layout
 */
dashboardRouter.get('/layout', requireAuth, async (req, res) => {
  const { role } = req.query;
  const userId = req.userId!;
  const tenantId = req.tenantId!;

  // Fetch user's saved layout
  let layout = await db.dashboardLayout.findUnique({
    where: {
      userId_role: {
        userId,
        role: role as Role || null,
      },
    },
  });

  // If no saved layout, return role default
  if (!layout) {
    layout = getDefaultLayout(role as Role);
  }

  res.json({ data: layout });
});

/**
 * PUT /api/dashboard/layout - Save user's dashboard layout
 */
dashboardRouter.put('/layout', requireAuth, async (req, res) => {
  const { role, layout } = req.body;
  const userId = req.userId!;
  const tenantId = req.tenantId!;

  const savedLayout = await db.dashboardLayout.upsert({
    where: {
      userId_role: {
        userId,
        role: role || null,
      },
    },
    update: {
      layout,
      updatedAt: new Date(),
    },
    create: {
      userId,
      tenantId,
      role: role || null,
      layout,
    },
  });

  res.json({ data: savedLayout });
});
```

---

## Widget Catalog

### Sales Widgets

| Widget Key | Name | Type | Size | Data Source |
|-----------|------|------|------|-------------|
| `active-deals` | Active Deals | List | Large | `/api/deals?status=ACTIVE` |
| `hot-leads` | Hot Leads | List | Medium | `/api/leads?score>80` |
| `today-appointments` | Today's Appointments | Calendar | Medium | `/api/appointments?date=today` |
| `sales-leaderboard` | Sales Leaderboard | Table | Medium | `/api/analytics/leaderboard` |
| `pending-tasks` | Pending Tasks | List | Small | `/api/tasks?status=PENDING` |
| `closed-deals` | Closed Deals (30d) | Metric | Small | `/api/analytics/closed-deals` |

### Service Widgets

| Widget Key | Name | Type | Size | Data Source |
|-----------|------|------|------|-------------|
| `service-appointments` | Today's Appointments | Calendar | Large | `/api/service/appointments` |
| `open-ros` | Open Repair Orders | Table | Medium | `/api/service/repair-orders?status=OPEN` |
| `pending-approvals` | Pending Approvals | List | Medium | `/api/service/approvals` |
| `technician-dispatch` | Technician Dispatch | Custom | Wide | `/api/service/dispatch` |
| `parts-status` | Parts Status | Metric | Small | `/api/service/parts` |

### Finance Widgets

| Widget Key | Name | Type | Size | Data Source |
|-----------|------|------|------|-------------|
| `pending-fi-deals` | Pending F&I Deals | List | Large | `/api/deals?status=PENDING_FI` |
| `lender-submissions` | Lender Submissions | Table | Medium | `/api/fi/submissions` |
| `fi-products-sold` | F&I Products Sold | Chart | Medium | `/api/fi/products` |
| `average-pvr` | Average PVR | Metric | Small | `/api/analytics/pvr` |
| `backend-profit` | Backend Profit (MTD) | Metric | Small | `/api/analytics/backend-profit` |

### Accounting Widgets

| Widget Key | Name | Type | Size | Data Source |
|-----------|------|------|------|-------------|
| `unreconciled-deals` | Unreconciled Deals | List | Large | `/api/accounting/unreconciled` |
| `cash-flow-summary` | Cash Flow Summary | Chart | Wide | `/api/accounting/cash-flow` |
| `pending-invoices` | Pending Invoices | Table | Medium | `/api/accounting/invoices` |
| `bank-reconciliation` | Bank Reconciliation | Custom | Medium | `/api/accounting/reconciliation` |
| `commission-payouts` | Commission Payouts | Metric | Small | `/api/accounting/commissions` |

### Inventory Widgets

| Widget Key | Name | Type | Size | Data Source |
|-----------|------|------|------|-------------|
| `aging-inventory` | Aging Inventory | Chart | Large | `/api/inventory/aging` |
| `recent-acquisitions` | Recent Acquisitions | List | Medium | `/api/vehicles?sort=dateReceived` |
| `pricing-alerts` | Pricing Alerts | List | Medium | `/api/inventory/pricing-alerts` |
| `needs-photos` | Vehicles Needing Photos | Metric | Small | `/api/inventory/needs-photos` |
| `wholesale-candidates` | Wholesale Candidates | Metric | Small | `/api/inventory/wholesale-candidates` |

### Admin Widgets

| Widget Key | Name | Type | Size | Data Source |
|-----------|------|------|------|-------------|
| `dealership-overview` | Dealership Overview | Custom | Large | `/api/analytics/overview` |
| `user-activity` | User Activity | Table | Medium | `/api/admin/user-activity` |
| `system-settings` | System Settings | Custom | Medium | `/api/admin/settings` |
| `audit-log` | Audit Log | Table | Wide | `/api/admin/audit` |
| `integration-status` | Integration Status | List | Small | `/api/admin/integrations` |

### Developer Widgets

| Widget Key | Name | Type | Size | Data Source |
|-----------|------|------|------|-------------|
| `system-health` | System Health | Custom | Large | `/api/dev/health` |
| `api-performance` | API Performance | Chart | Wide | `/api/dev/metrics` |
| `error-logs` | Error Logs | Table | Medium | `/api/dev/errors` |
| `database-queries` | Slow Queries | Table | Medium | `/api/dev/queries` |
| `user-sessions` | Active Sessions | Metric | Small | `/api/dev/sessions` |

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Backend:**
- [ ] Create database schema (DashboardLayout, WidgetDefinition, UserWidgetPreference)
- [ ] Run Prisma migration
- [ ] Seed widget definitions
- [ ] Create dashboard API routes (`/api/dashboard/*`, `/api/widgets/*`)
- [ ] Implement default layout service

**Frontend:**
- [ ] Create `pages/dashboard/` directory structure
- [ ] Build `DashboardLayout` component with grid
- [ ] Build `DashboardWidget` wrapper component
- [ ] Implement `useDashboardLayout` hook
- [ ] Create basic widget registry

**Deliverable:** Static dashboard that loads but doesn't save changes

---

### Phase 2: Core Widgets (Week 2)

**Priority Widgets (8 total):**
- [ ] Active Deals Widget (Sales)
- [ ] Hot Leads Widget (Sales)
- [ ] Today's Appointments Widget (Sales/Service)
- [ ] Pending Tasks Widget (Sales)
- [ ] Revenue Chart Widget (Admin/Finance)
- [ ] Sales Leaderboard Widget (Sales)
- [ ] System Health Widget (Developer)
- [ ] Dealership Overview Widget (Admin)

**Components:**
- [ ] WidgetLoading skeleton
- [ ] WidgetError component
- [ ] WidgetHeader with actions

**Deliverable:** 8 working widgets with real data

---

### Phase 3: Customization (Week 3)

**Features:**
- [ ] Drag-and-drop widget rearrangement (@dnd-kit)
- [ ] Add/remove widgets modal (WidgetCustomizer)
- [ ] Save layout to database (PUT /api/dashboard/layout)
- [ ] Reset to default button
- [ ] Per-widget settings modal
- [ ] Widget size adjustment (resize handles)

**Deliverable:** Fully customizable dashboard with persistence

---

### Phase 4: Role-Based Dashboards (Week 4)

**Pages:**
- [ ] Sales Dashboard (`/dashboard/sales`)
- [ ] Service Dashboard (`/dashboard/service`)
- [ ] Finance Dashboard (`/dashboard/finance`)
- [ ] Accounting Dashboard (`/dashboard/accounting`)
- [ ] Inventory Dashboard (`/dashboard/inventory`)
- [ ] Developer Dashboard (`/dashboard/developer`)
- [ ] Admin Dashboard (`/dashboard/admin`)

**Features:**
- [ ] Role detection and auto-redirect
- [ ] Role-specific default layouts
- [ ] Permission-based widget filtering
- [ ] Role switcher dropdown (for users with multiple roles)

**Deliverable:** 7 role-specific dashboards

---

### Phase 5: Advanced Features (Week 5)

**Features:**
- [ ] Real-time widget updates (WebSocket)
- [ ] Widget refresh intervals
- [ ] Mobile responsive layout (1 column)
- [ ] Export dashboard screenshot
- [ ] Share dashboard layout with team
- [ ] Dark mode support
- [ ] Widget data caching
- [ ] Performance optimization

**Deliverable:** Production-ready dashboard system

---

### Phase 6: Remaining Widgets (Week 6)

**Complete Widget Catalog (30+ widgets):**
- [ ] Service widgets (5 more)
- [ ] Finance widgets (5 more)
- [ ] Accounting widgets (5 more)
- [ ] Inventory widgets (5 more)
- [ ] Admin widgets (5 more)
- [ ] Analytics widgets (5 more)

**Deliverable:** Full widget catalog

---

## Technology Stack

### Frontend
- **Layout:** @dnd-kit/core (drag-and-drop)
- **Grid:** CSS Grid + react-grid-layout (optional)
- **Charts:** recharts or chart.js
- **State:** TanStack Query (data) + Zustand (UI state)
- **Components:** Radix UI + Tailwind CSS

### Backend
- **API:** Express.js routes
- **Database:** Prisma + PostgreSQL
- **Real-Time:** Socket.IO
- **Caching:** Redis (widget data)

### Data Flow
- **REST:** Initial data fetching
- **WebSocket:** Real-time updates
- **Polling:** Fallback for legacy widgets

---

## Widget Development Guide

### Creating a New Widget

**Step 1: Define Widget**

```typescript
// Seed or admin panel
{
  key: 'my-new-widget',
  name: 'My New Widget',
  category: 'SALES',
  type: 'METRIC',
  defaultSize: 'MEDIUM',
  permissions: ['VIEW_DEALS'],
  dataSource: '/api/widgets/my-new-widget/data',
  refreshInterval: 30,
  componentPath: 'MyNewWidget',
}
```

**Step 2: Create Component**

```tsx
// apps/frontend/src/components/widgets/MyNewWidget.tsx
export function MyNewWidget({ data, config }: WidgetProps) {
  return (
    <div className="widget-my-new">
      <div className="metric-value">{data.count}</div>
      <div className="metric-label">{data.label}</div>
    </div>
  );
}
```

**Step 3: Create Data Endpoint**

```typescript
// apps/backend/src/routes/widget-data.routes.ts
widgetDataRouter.get('/my-new-widget/data', async (req, res) => {
  const tenantId = req.tenantId!;
  const count = await db.deal.count({
    where: { tenantId, status: 'ACTIVE' },
  });
  res.json({ data: { count, label: 'Active Deals' } });
});
```

**Step 4: Register Widget**

```typescript
// apps/frontend/src/lib/dashboard/widgetRegistry.ts
export const widgetRegistry = {
  'my-new-widget': lazy(() => import('@/components/widgets/MyNewWidget')),
};
```

---

## Permissions & Security

### Widget Access Control

Widgets respect RBAC permissions:

```typescript
// Backend checks permissions before serving widget data
if (!user.hasPermission('VIEW_DEALS')) {
  return res.status(403).json({ error: 'Permission denied' });
}

// Frontend filters widget catalog by permissions
const availableWidgets = allWidgets.filter(w =>
  w.permissions.every(perm => user.hasPermission(perm))
);
```

### Tenant Isolation

All widget data is tenant-scoped:

```typescript
const data = await db.deal.findMany({
  where: {
    tenantId: req.tenantId, // Enforced by middleware
    status: 'ACTIVE',
  },
});
```

---

## Performance Optimization

### Data Caching

```typescript
// Cache widget data in Redis
const cacheKey = `widget:${tenantId}:${widgetKey}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await fetchWidgetData(widgetKey);
await redis.setex(cacheKey, 60, JSON.stringify(data)); // 1 min TTL
return data;
```

### Lazy Loading

```tsx
// Load widgets on demand
const WidgetComponent = lazy(() =>
  import(`@/components/widgets/${widget.componentPath}`)
);
```

### Virtual Scrolling

For large dashboards with 20+ widgets, use virtualization:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

## Mobile Responsiveness

### Breakpoints

```css
/* Desktop: 4 columns */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Tablet: 2 columns */
@media (min-width: 640px) and (max-width: 1023px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile: 1 column */
@media (max-width: 639px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Testing Strategy

### Unit Tests
- Widget component rendering
- Data fetching hooks
- Layout calculations
- Permission checks

### Integration Tests
- Dashboard layout save/load
- Widget add/remove
- Drag-and-drop
- Role-based routing

### E2E Tests
- User customizes dashboard
- User switches roles
- Widgets refresh data
- Mobile responsive behavior

---

## Success Metrics

**User Engagement:**
- % of users who customize their dashboard
- Average number of widgets per dashboard
- Most popular widgets per role

**Performance:**
- Dashboard load time < 1s
- Widget data fetch < 500ms
- Drag-and-drop latency < 16ms (60 FPS)

**Business Impact:**
- Reduced time to key metrics (vs. navigating menus)
- Increased user satisfaction scores
- Reduced support tickets for "where is X?"

---

## Future Enhancements

**Phase 7+:**
- [ ] Widget marketplace (3rd-party widgets)
- [ ] Widget templates (share layouts)
- [ ] Dashboard themes (color schemes)
- [ ] Widget alerts (push notifications)
- [ ] Multi-dashboard tabs
- [ ] Dashboard versioning (undo/redo)
- [ ] AI-suggested widgets (based on usage)
- [ ] Widget data exports (CSV, PDF)
- [ ] Dashboard embeds (iframe for external tools)

---

## Conclusion

This role-based dashboard system transforms Autolytiq from a menu-driven application into a **personalized command center** where each user sees exactly what they need, exactly how they want it.

**Key Benefits:**
- ⚡ **Faster workflows** - Key metrics at a glance
- 🎯 **Role-optimized** - Defaults that make sense
- 🎨 **Fully customizable** - Users own their workspace
- 📱 **Mobile-ready** - Works everywhere
- 🔐 **Secure** - RBAC and tenant isolation

**Next Step:** Begin Phase 1 implementation (Week 1)

---

**Document Version:** 1.0
**Last Updated:** 2025-11-05
**Status:** Ready for Implementation

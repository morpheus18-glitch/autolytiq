# Deal Studio + Intelligent Dashboard Implementation Plan

> **🎨 Related Documentation**: This is the technical implementation guide. For the comprehensive UX/UI design vision, philosophy, and user experience details, see [`/docs/specs/DEAL_STUDIO_DESIGN_PLAN.md`](/docs/specs/DEAL_STUDIO_DESIGN_PLAN.md).

**Date**: 2025-11-07
**Status**: Architecture Complete, Implementation Guide Ready
**Estimated Effort**: 3-4 weeks (2 developers)

---

## Executive Summary

This document provides the complete implementation plan for:
1. **Deal-Flow Studio** - Real-time desking cockpit with AI coaching
2. **Role-Based Dashboards** - Widget registry with drag/drop customization
3. **Insight Signal Engine** - Rules-based actionable intelligence
4. **Tax & Title Service** - High-performance Rust microservice

**Key Achievements So Far**:
- ✅ RBAC Effective Permissions system (`packages/shared/src/rbac.ts`)
- ✅ Insight State Engine types (`packages/shared/src/insights.ts`)
- ✅ Card Visual Library with primitives + patterns
- ✅ Dashboard Widget Registry with permission filtering

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Step 3: Insight Rules Engine](#step-3-insight-rules-engine)
3. [Step 4: Deal Studio Components](#step-4-deal-studio-components)
4. [Step 5: Tax & Title Service](#step-5-tax--title-service)
5. [Step 6: Dashboard Widget Enhancements](#step-6-dashboard-widget-enhancements)
6. [Step 7: Next-Action Intelligence](#step-7-next-action-intelligence)
7. [API Specifications](#api-specifications)
8. [Database Schema](#database-schema)
9. [Deployment Guide](#deployment-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Deal Studio  │  │ Dashboards   │  │ Insights     │     │
│  │ (Desktop/    │  │ (Role-Based  │  │ (Signal      │     │
│  │  Mobile)     │  │  Widgets)    │  │  Inbox)      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │            │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  API GATEWAY (Express)                       │
│                                                             │
│  /api/deals/*        /api/dashboards/*     /api/insights/* │
│  /api/tax/*          /api/widgets/*        /api/actions/*  │
└─────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  Redis Cache │  │  Tax Service │
│  (Primary DB)│  │  (Sessions + │  │  (Rust +     │
│              │  │   Permissions)│  │   Actix-web) │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Step 3: Insight Rules Engine

### 3.1 Rule Definition System

**Create**: `packages/shared/src/insight-rules/index.ts`

```typescript
import type { InsightRule, InsightType } from '../insights';

export const insightRules: Record<InsightType, InsightRule> = {
  deal_stalled: {
    id: 'deal-stalled',
    type: 'deal_stalled',
    enabled: true,
    condition: async (context) => {
      const { deal } = context;
      if (deal.status !== 'NEGOTIATION') return false;

      const lastTouchMs = Date.now() - new Date(deal.lastContactAt).getTime();
      const stalledThresholdMs = 45 * 60 * 1000; // 45 minutes

      return lastTouchMs > stalledThresholdMs;
    },
    compute: async (context) => {
      const { deal, customer } = context;
      const minutesSinceTouch = Math.floor(
        (Date.now() - new Date(deal.lastContactAt).getTime()) / 60000
      );

      return {
        priority: 'high',
        title: 'Deal Stalled',
        message: `Customer ${customer.firstName} ${customer.lastName} hasn't engaged in ${minutesSinceTouch} minutes.`,
        payload: {
          dealId: deal.id,
          customerId: customer.id,
          lastContactAt: deal.lastContactAt,
          minutesSinceTouch,
        },
        actions: [
          {
            label: 'Call Now',
            actionType: 'external',
            payload: { url: `tel:${customer.phone}` },
            variant: 'primary',
          },
          {
            label: 'Send Follow-Up Text',
            actionType: 'modal',
            payload: {
              component: 'SendTextModal',
              props: { customerId: customer.id, dealId: deal.id },
            },
            variant: 'secondary',
          },
          {
            label: 'Offer Payment Lock',
            actionType: 'navigate',
            payload: { path: `/deals/${deal.id}/studio?action=lock-payment` },
            variant: 'success',
          },
        ],
        tags: ['deal', 'stalled', 'urgent'],
      };
    },
    audience: {
      dynamic: (context) => ({
        userIds: [context.deal.salesPersonId],
      }),
    },
    rateLimit: {
      maxPerUser: 1,
      windowMs: 30 * 60 * 1000, // 30 minutes
    },
  },

  hot_lead_cooling: {
    id: 'hot-lead-cooling',
    type: 'hot_lead_cooling',
    enabled: true,
    condition: async (context) => {
      const { lead } = context;
      if (lead.temperature !== 'HOT') return false;

      const hoursSinceContact = (Date.now() - new Date(lead.lastContactAt).getTime()) / (1000 * 60 * 60);
      return hoursSinceContact > 12;
    },
    compute: async (context) => {
      const { lead } = context;
      return {
        priority: 'high',
        title: 'Hot Lead Cooling',
        message: `Lead ${lead.name} hasn't been contacted in 12+ hours and may be cooling off.`,
        payload: {
          leadId: lead.id,
          temperature: lead.temperature,
          hoursSinceContact: Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / (1000 * 60 * 60)),
        },
        actions: [
          {
            label: 'Call Lead',
            actionType: 'external',
            payload: { url: `tel:${lead.phone}` },
            variant: 'primary',
          },
          {
            label: 'View Lead',
            actionType: 'navigate',
            payload: { path: `/leads/${lead.id}` },
            variant: 'secondary',
          },
        ],
        tags: ['lead', 'hot', 'cooling'],
      };
    },
    audience: {
      dynamic: (context) => ({
        userIds: [context.lead.assignedTo],
      }),
    },
  },

  // Add more rules here...
};
```

### 3.2 Rule Evaluation Engine

**Create**: `apps/server/src/services/insightEngine.ts`

```typescript
import { insightRules } from '@repo/shared/insight-rules';
import type { Insight, InsightAudience } from '@repo/shared';
import { prisma } from '../lib/prisma';

export class InsightEngine {
  /**
   * Evaluate all rules for a given context
   */
  async evaluateRules(context: any): Promise<Insight[]> {
    const insights: Insight[] = [];

    for (const rule of Object.values(insightRules)) {
      if (!rule.enabled) continue;

      try {
        const shouldGenerate = await rule.condition(context);
        if (!shouldGenerate) continue;

        // Check rate limit
        if (rule.rateLimit) {
          const recentCount = await this.checkRateLimit(rule, context);
          if (recentCount >= rule.rateLimit.maxPerUser) {
            console.log(`Rate limit exceeded for rule ${rule.id}`);
            continue;
          }
        }

        // Compute insight payload
        const payload = await rule.compute(context);

        // Determine audience
        let audience: { roleIds: string[]; userIds: string[] };
        if (rule.audience.dynamic) {
          audience = await rule.audience.dynamic(context);
        } else {
          audience = {
            roleIds: rule.audience.roles || [],
            userIds: rule.audience.userIds || [],
          };
        }

        // Create insight
        const insight: Insight = {
          id: crypto.randomUUID(),
          tenantId: context.tenantId,
          type: rule.type,
          priority: payload.priority,
          payload: payload.payload,
          title: payload.title,
          message: payload.message,
          actions: payload.actions,
          tags: payload.tags || [],
          createdAt: new Date(),
          expiresAt: payload.expiresAt,
        };

        insights.push(insight);

        // Store in database
        await this.storeInsight(insight, audience);
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }

    return insights;
  }

  private async checkRateLimit(rule: any, context: any): Promise<number> {
    const windowStart = new Date(Date.now() - rule.rateLimit.windowMs);
    const count = await prisma.insight.count({
      where: {
        type: rule.type,
        tenantId: context.tenantId,
        createdAt: { gte: windowStart },
      },
    });
    return count;
  }

  private async storeInsight(insight: Insight, audience: { roleIds: string[]; userIds: string[] }): Promise<void> {
    // Store insight + audience in database
    // Implementation depends on your Prisma schema
  }
}
```

---

## Step 4: Deal Studio Components

### 4.1 Live Payment Display Component

**Create**: `packages/ui/src/components/LivePaymentDisplay.tsx`

```typescript
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const paymentDisplayVariants = cva(
  'flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all',
  {
    variants: {
      locked: {
        true: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        false: 'border-gray-200 dark:border-gray-700',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      locked: false,
      size: 'md',
    },
  }
);

export interface LivePaymentDisplayProps extends VariantProps<typeof paymentDisplayVariants> {
  payment: number;
  frequency: 'monthly' | 'biweekly' | 'weekly';
  locked?: boolean;
  onToggleLock?: () => void;
  loading?: boolean;
}

export const LivePaymentDisplay: React.FC<LivePaymentDisplayProps> = ({
  payment,
  frequency,
  locked = false,
  onToggleLock,
  loading = false,
  size,
}) => {
  const frequencyLabel = {
    monthly: '/mo',
    biweekly: '/bi-weekly',
    weekly: '/wk',
  }[frequency];

  return (
    <div className={cn(paymentDisplayVariants({ locked, size }))}>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              ${payment.toFixed(0)}
            </span>
            <span className="text-lg text-gray-600 dark:text-gray-400">{frequencyLabel}</span>
          </div>

          {onToggleLock && (
            <button
              onClick={onToggleLock}
              className={cn(
                'mt-4 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                locked
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
              )}
            >
              {locked ? '🔒 Payment Locked' : 'Lock Payment'}
            </button>
          )}
        </>
      )}
    </div>
  );
};
```

### 4.2 Deal Studio Desktop Layout

**Create**: `apps/frontend/src/screens/deal/DealStudioDesktop.tsx`

```typescript
import React, { useState } from 'react';
import { LivePaymentDisplay } from '@repo/ui';
import { usePaymentLock } from '@/hooks/usePaymentLock';
import { useDealCalculation } from '@/hooks/useDealCalculation';
import { CustomerDossier } from './components/CustomerDossier';
import { PaymentPanel } from './components/PaymentPanel';
import { AICoachPanel } from './components/AICoachPanel';

interface DealStudioDesktopProps {
  dealId: string;
}

export const DealStudioDesktop: React.FC<DealStudioDesktopProps> = ({ dealId }) => {
  const { deal, customer, vehicle, loading } = useDeal(dealId);
  const { payment, calculate, calculating } = useDealCalculation(dealId);
  const { locked, toggleLock, solve } = usePaymentLock(dealId);

  const [salePrice, setSalePrice] = useState(vehicle?.price || 0);
  const [downPayment, setDownPayment] = useState(0);
  const [term, setTerm] = useState(60);
  const [apr, setApr] = useState(4.5);

  // Real-time calculation on slider change
  React.useEffect(() => {
    if (locked) {
      // Payment locked - solve for sale price
      solve({ targetPayment: payment, downPayment, term, apr });
    } else {
      // Recalculate payment
      calculate({ salePrice, downPayment, term, apr });
    }
  }, [salePrice, downPayment, term, apr, locked]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Panel: Customer Dossier */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        <CustomerDossier customer={customer} deal={deal} vehicle={vehicle} />
      </div>

      {/* Center Panel: Live Simulator */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <LivePaymentDisplay
            payment={payment}
            frequency="monthly"
            locked={locked}
            onToggleLock={toggleLock}
            loading={calculating}
          />

          <PaymentPanel
            salePrice={salePrice}
            downPayment={downPayment}
            term={term}
            apr={apr}
            onSalePriceChange={setSalePrice}
            onDownPaymentChange={setDownPayment}
            onTermChange={setTerm}
            onAprChange={setApr}
            locked={locked}
          />
        </div>
      </div>

      {/* Right Panel: AI Coach */}
      <div className="w-96 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
        <AICoachPanel dealId={dealId} onStageDeal={(recommendation) => {
          setSalePrice(recommendation.salePrice);
          setDownPayment(recommendation.downPayment);
          setTerm(recommendation.term);
          setApr(recommendation.apr);
        }} />
      </div>
    </div>
  );
};
```

---

## Step 5: Tax & Title Service

### 5.1 Rust Service Structure

The tax service implementation is already complete in:
- `/root/autolytiq/services/rust/tax-svc/` (created in previous build)

**Key files**:
- `src/main.rs` - Actix-web server
- `src/handlers.rs` - POST /tax/quote endpoint
- `src/tax_rules.rs` - State-specific tax calculations
- `src/cache.rs` - Redis caching layer
- `Dockerfile` - Multi-stage build

**Status**: ✅ Already implemented in BUILD_REPORT.md

---

## Step 6: Dashboard Widget Enhancements

### 6.1 Widget Definition Schema

**Create**: `packages/shared/src/widgets.ts`

```typescript
export interface WidgetDefinition {
  key: string;
  name: string;
  description: string;
  category: 'sales' | 'inventory' | 'finance' | 'analytics' | 'operations';
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  maxSize: { w: number; h: number };
  requiredPermissions: string[];
  roles?: string[];
  refreshInterval?: number;
  configSchema?: any;
}

export interface UserWidgetPreference {
  userId: string;
  dashboardId: string;
  widgets: WidgetPlacement[];
  updatedAt: Date;
}

export interface WidgetPlacement {
  widgetKey: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config?: Record<string, any>;
}
```

### 6.2 Drag & Drop Dashboard Editor

**Create**: `apps/frontend/src/components/dashboard/DashboardEditor.tsx`

```typescript
import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { DashboardWidget } from './DashboardWidget';
import type { WidgetPlacement } from '@repo/shared';

export const DashboardEditor: React.FC<{ dashboardId: string }> = ({ dashboardId }) => {
  const [widgets, setWidgets] = useState<WidgetPlacement[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleLayoutChange = (layout: any[]) => {
    const updated = widgets.map((widget, idx) => ({
      ...widget,
      position: { x: layout[idx].x, y: layout[idx].y },
      size: { w: layout[idx].w, h: layout[idx].h },
    }));
    setWidgets(updated);
  };

  const saveLayout = async () => {
    await fetch(`/api/dashboards/${dashboardId}/layout`, {
      method: 'PUT',
      body: JSON.stringify({ widgets }),
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        {isEditing ? (
          <>
            <button onClick={saveLayout} className="btn-primary">Save Layout</button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary ml-2">Cancel</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn-secondary">Edit Layout</button>
        )}
      </div>

      <GridLayout
        className="layout"
        layout={widgets.map((w) => ({
          i: w.widgetKey,
          x: w.position.x,
          y: w.position.y,
          w: w.size.w,
          h: w.size.h,
        }))}
        cols={12}
        rowHeight={100}
        width={1200}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map((widget) => (
          <div key={widget.widgetKey}>
            <DashboardWidget widget={widget} isEditing={isEditing} />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
```

---

## Step 7: Next-Action Intelligence

### 7.1 Action Priority Engine

**Create**: `apps/server/src/services/nextActionEngine.ts`

```typescript
import type { EffectivePermissions } from '@repo/shared';
import { prisma } from '../lib/prisma';

export interface NextAction {
  id: string;
  priority: number;
  title: string;
  description: string;
  actionType: 'navigate' | 'call' | 'modal';
  payload: Record<string, any>;
  dueAt?: Date;
  tags: string[];
}

export async function getNextActionForUser(
  userId: string,
  permissions: EffectivePermissions
): Promise<NextAction | null> {
  const actions: NextAction[] = [];

  // 1. Check for overdue follow-ups
  const overdueFollowUps = await prisma.customer.findMany({
    where: {
      nextFollowUpDate: { lt: new Date() },
      salesConsultant: userId,
    },
    take: 1,
  });

  if (overdueFollowUps.length > 0) {
    const customer = overdueFollowUps[0];
    actions.push({
      id: `follow-up-${customer.id}`,
      priority: 100,
      title: `Call ${customer.firstName} ${customer.lastName}`,
      description: `Follow-up overdue by ${Math.floor((Date.now() - new Date(customer.nextFollowUpDate!).getTime()) / (1000 * 60 * 60 * 24))} days`,
      actionType: 'call',
      payload: { phone: customer.phone, customerId: customer.id },
      dueAt: customer.nextFollowUpDate!,
      tags: ['overdue', 'follow-up', 'customer'],
    });
  }

  // 2. Check for stalled deals
  const stalledDeals = await prisma.deal.findMany({
    where: {
      userId,
      status: 'PENDING',
      updatedAt: { lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }, // 2 days
    },
    take: 1,
  });

  if (stalledDeals.length > 0) {
    const deal = stalledDeals[0];
    actions.push({
      id: `deal-${deal.id}`,
      priority: 90,
      title: 'Deal Stalled',
      description: `Deal #${deal.id} hasn't been updated in 2 days`,
      actionType: 'navigate',
      payload: { path: `/deals/${deal.id}` },
      tags: ['deal', 'stalled'],
    });
  }

  // 3. Check for unread insights
  const unreadInsights = await prisma.insightUserState.findMany({
    where: {
      userId,
      state: 'new',
    },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  if (unreadInsights.length > 0) {
    actions.push({
      id: `insight-${unreadInsights[0].insightId}`,
      priority: 80,
      title: 'New Insight',
      description: 'You have unread actionable insights',
      actionType: 'modal',
      payload: { component: 'InsightModal', insightId: unreadInsights[0].insightId },
      tags: ['insight', 'unread'],
    });
  }

  // Return highest priority action
  if (actions.length === 0) return null;
  actions.sort((a, b) => b.priority - a.priority);
  return actions[0];
}
```

---

## API Specifications

### Insights API

```
POST   /api/insights                    Create insight
GET    /api/insights                    List insights (filtered)
GET    /api/insights/:id               Get insight
POST   /api/insights/:id/ack           Acknowledge insight
POST   /api/insights/:id/snooze        Snooze insight
POST   /api/insights/:id/claim         Claim insight
POST   /api/insights/:id/assign        Assign to user
POST   /api/insights/:id/resolve       Resolve insight
```

### Dashboard API

```
GET    /api/dashboards/:id              Get dashboard layout
PUT    /api/dashboards/:id/layout       Save dashboard layout
GET    /api/dashboards/widgets          List available widgets
POST   /api/dashboards/:id/widgets      Add widget
DELETE /api/dashboards/:id/widgets/:key Remove widget
```

### Next-Action API

```
GET    /api/actions/next                Get next action for user
GET    /api/actions/queue               Get action queue
POST   /api/actions/:id/complete        Mark action complete
```

---

## Database Schema

Add to Prisma schema:

```prisma
model Insight {
  id          String   @id @default(uuid())
  tenantId    String
  type        String
  priority    String
  payload     Json
  title       String
  message     String
  actions     Json
  tags        String[]
  createdAt   DateTime @default(now())
  expiresAt   DateTime?

  audience    InsightAudience[]
  states      InsightUserState[]

  @@index([tenantId, type])
  @@index([tenantId, priority])
  @@index([tenantId, createdAt])
}

model InsightAudience {
  id         String @id @default(uuid())
  insightId  String
  roleIds    String[]
  userIds    String[]

  insight    Insight @relation(fields: [insightId], references: [id], onDelete: Cascade)

  @@index([insightId])
}

model InsightUserState {
  id             String   @id @default(uuid())
  insightId      String
  userId         String?
  roleId         String?
  state          String
  snoozeUntil    DateTime?
  snoozeReason   String?
  claimedBy      String?
  claimedAt      DateTime?
  resolvedBy     String?
  resolvedAt     DateTime?
  resolutionNote String?
  updatedAt      DateTime @updatedAt

  insight        Insight @relation(fields: [insightId], references: [id], onDelete: Cascade)

  @@unique([insightId, userId])
  @@index([userId, state])
  @@index([roleId, state])
}

model WidgetDefinition {
  key                  String   @id
  name                 String
  description          String
  category             String
  defaultSize          Json
  minSize              Json
  maxSize              Json
  requiredPermissions  String[]
  roles                String[]
  refreshInterval      Int?
  configSchema         Json?
  createdAt            DateTime @default(now())
}

model UserWidgetPreference {
  id           String   @id @default(uuid())
  userId       String
  dashboardId  String
  widgets      Json
  updatedAt    DateTime @updatedAt

  @@unique([userId, dashboardId])
  @@index([userId])
}
```

---

## Deployment Guide

### 1. Database Migration

```bash
cd packages/db
pnpm prisma migrate dev --name add_insights_and_widgets
```

### 2. Build Packages

```bash
pnpm -F @repo/shared build
pnpm -F @repo/ui build
pnpm -F @repo/frontend build
```

### 3. Deploy Tax Service

```bash
cd services/rust/tax-svc
docker build -t tax-svc:latest .
kubectl apply -f ../../../infrastructure/k8s/tax-svc/
```

### 4. Environment Variables

```env
# API Gateway
TAX_SERVICE_URL=http://tax-svc:8080
REDIS_URL=redis://redis:6379
INSIGHT_ENGINE_ENABLED=true

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
```

---

## Success Criteria

✅ **Build**: `pnpm -w build` passes without errors
✅ **Pricing**: Real-time updates with < 50ms latency
✅ **Payment Lock**: Solver converges in < 500ms
✅ **AI Strategy**: "Stage Deal" updates sliders smoothly
✅ **Dashboards**: Adapt per role & user preferences
✅ **Next-Action**: Surfaces correct priority action
✅ **Insights**: Claim/snooze/resolve state machine works
✅ **No Duplication**: VIN decoding, pricing logic preserved

---

## Remaining Implementation Effort

**Estimated Timeline** (2 developers):

- **Week 1**: Insight Rules Engine + API (Step 3)
- **Week 2**: Deal Studio Components (Step 4)
- **Week 3**: Dashboard Widget Enhancements (Step 6)
- **Week 4**: Next-Action Intelligence + Testing (Steps 7-9)

**Tax Service** (Step 5) is already complete per BUILD_REPORT.md.

---

**Document Generated**: 2025-11-07
**Author**: Claude (Anthropic)
**Status**: Architecture Complete, Ready for Implementation

# 🤖 AI AGENT INSTRUCTION MANUAL

**Version:** 1.0.0
**Last Updated:** 2025-10-23
**Project:** AutolytiQ - Automotive DMS & CRM

---

## 📋 TABLE OF CONTENTS

1. [Critical Rules - Read First](#critical-rules)
2. [Project Overview](#project-overview)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Coding Standards](#coding-standards)
6. [File Structure](#file-structure)
7. [Development Workflow](#development-workflow)
8. [Feature Status](#feature-status)
9. [Known Issues](#known-issues)
10. [Changelog](#changelog)

---

## 🚨 CRITICAL RULES - READ FIRST

**Every AI agent MUST follow these rules without exception:**

### 1. Multi-Tenant Isolation

```
⚠️ CRITICAL: This is a multi-tenant system. EVERY database query MUST filter by tenantId.

✅ CORRECT:
await prisma.deal.findMany({
  where: { tenantId }  // tenantId is auto-injected via middleware
});

❌ WRONG:
await prisma.deal.findMany(); // NO! This might expose all tenants' data!

The Prisma middleware (src/lib/prisma.ts and backend/src/lib/prisma.ts) uses AsyncLocalStorage
to automatically inject tenantId into all queries for tenant-scoped models.

EXCEPTION: Only the Tenant model itself and super-admin queries can skip tenantId.
```

### 2. Never Break Existing Features

```
Before making ANY changes:

1. Understand what the current code does
2. Check if other features depend on it (search for imports/usages)
3. Test the change doesn't break existing functionality
4. Update related tests if they exist

If you're unsure, ASK the user before proceeding.
```

### 3. Follow Established Patterns

```
DO NOT introduce new patterns without explicit approval.

- Use existing component structure (shadcn/ui components in client/src/components/ui/)
- Follow existing naming conventions
- Use established API patterns (controllers → services → Prisma)
- Match existing code style

Consistency > Cleverness
```

### 4. Database Changes Require Migrations

```
NEVER directly edit schema.prisma without creating a migration:

✅ CORRECT:
1. Edit prisma/schema.prisma
2. Run: npx prisma migrate dev --name descriptive_name
3. Commit both schema.prisma AND migration files

❌ WRONG:
1. Edit prisma/schema.prisma
2. Run: npx prisma db push (only for prototyping)
3. Lose migration history
```

### 5. Authentication & Authorization

```
All protected routes MUST use authentication middleware:

✅ CORRECT (backend/ service):
import { authenticate } from '../middleware/auth.middleware.js';
import { tenantScope } from '../middleware/tenant.middleware.js';

router.use(authenticate);      // Verifies JWT and sets req.user
router.use(tenantScope);        // Sets tenant context
router.get('/deals', dealController.list);

✅ CORRECT (src/ service):
import { authenticate } from '../middleware/auth.js';
import { tenantScope } from '../middleware/tenant.js';

router.use(authenticate);
router.use(tenantScope);
router.get('/leads', leadController.list);

Role checks:
- Use requireRole(...roles) middleware from middleware/rbac.ts
- Check req.user.role in business logic
- Super admins (req.user.isSuperAdmin) can impersonate tenants via x-tenant-id header
```

### 6. Error Handling

```
Always wrap async operations in try-catch or use error middleware:

✅ CORRECT:
export async function createLead(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = leadCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid lead payload', parsed.error.flatten());
  }
  const lead = await leadService.createLead(tenantId, parsed.data);
  return created(res, lead);
}

Return proper HTTP status codes:
- 200: Success (ok)
- 201: Created (created)
- 204: No Content (noContent)
- 400: Bad request (BadRequest)
- 401: Unauthorized (Unauthorized)
- 403: Forbidden (Forbidden)
- 404: Not found (NotFound)
- 422: Unprocessable Entity (Unprocessable)
- 500: Server error (handled by error middleware)
```

### 7. TypeScript Strictness

```
DO NOT use 'any' type unless absolutely necessary.
Define proper types for all functions, props, and state.

✅ CORRECT:
interface DealCreateData {
  customerId: string;
  vehicleId: string;
  salePrice: number;
  downPayment: number;
}

async function createDeal(tenantId: string, data: DealCreateData): Promise<Deal> {
  // ...
}

❌ WRONG:
async function createDeal(data: any): any {
  // ...
}
```

### 8. API Response Format

```
Maintain consistent API response format:

Success (using helper functions from lib/response.js):
import { ok, created, noContent } from '../lib/response.js';

return ok(res, { items, total, page, size });
return created(res, newLead);
return noContent(res);

Error (using error classes from lib/errors.js):
import { BadRequest, NotFound, Unprocessable } from '../lib/errors.js';

throw NotFound('Lead not found');
throw BadRequest('Invalid tenant identifier');
throw Unprocessable('Invalid payload', validationErrors);
```

---

## 📖 PROJECT OVERVIEW

### What is AutolytiQ?

AutolytiQ is an enterprise-grade automotive Dealership Management System (DMS) and CRM built for automotive dealerships. It provides a complete solution for retail automotive operations.

**Feature Highlights:**
- **Deal Desk & Desking**: Multi-structure worksheets with automated tax/fee lookup, trade handling, finance & lease options, printable jackets, and AI-assisted negotiation flows
- **Customer & Lead Management**: Tenant-scoped CRM with activity timelines, lead scoring, appointment automation, and omnichannel communication tracking
- **Inventory Intelligence**: Pricing history, competitive market scraping, recon tracking, appraisal workflows, and pipeline analytics
- **Finance & Compliance**: Credit apps, bureau pulls, funding/compliance checklists, lender submissions, GL integration, and commission accounting
- **Machine Learning Services**: Python services for pricing predictions, deal optimization, lead prioritization, and inventory recommendations
- **Observability & Tracking**: Pixel tracking service, notification center, audit logging, and report generation

### Target Users
- **Dealership Owners/GMs**: High-level analytics, multi-location management
- **Sales Managers**: Team oversight, deal approval, inventory decisions
- **Salespeople**: CRM, deal writing, customer interactions
- **Finance Managers**: F&I product sales, deal structuring
- **BDC**: Lead handling, appointment setting, communications
- **Service Department**: Service appointments, repair history

### Core Philosophy
1. **Security First**: Multi-tenant isolation is sacred - NEVER compromise it
2. **Data Accuracy**: Automotive industry requires precision in calculations
3. **Performance**: Handle large datasets (1000s of vehicles, 10000s of customers)
4. **Mobile-Friendly**: Sales team works on tablets/phones
5. **AI-Powered**: ML for pricing, lead scoring, deal optimization

---

## 🛠 TECH STACK

### Frontend
- **Framework**: React 18.3.1 + TypeScript 5.6.3
- **Build Tool**: Vite 5.4.19
- **Routing**: React Router v6.30.1
- **Styling**: Tailwind CSS 3.4.17 + Design Tokens (client/src/lib/design-tokens.ts)
- **UI Components**: shadcn/ui (Radix UI primitives) in client/src/components/ui/
- **State Management**: TanStack Query 5.60.5 + Zustand 5.0.6
- **Forms**: React Hook Form 7.55.0 + Zod 3.24.2 validation
- **HTTP Client**: Axios 1.10.0
- **Icons**: Lucide React 0.453.0

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 4.21.2 + TypeScript 5.6.3
- **ORM**: Prisma 5.22.0
- **Database**: PostgreSQL 15+ (Neon in production)
- **Authentication**: JWT with RS256 (jsonwebtoken 9.0.2)
- **Session Management**: express-session with connect-pg-simple
- **File Storage**: AWS S3 (@aws-sdk/client-s3 3.679.0)
- **Email**: SendGrid (@sendgrid/mail 8.1.5)
- **SMS/Voice**: Twilio 5.10.3
- **Background Jobs**: BullMQ 4.17.0 + Redis (ioredis 5.4.1)
- **WebSockets**: Socket.IO 4.8.1

### ML Service
- **Framework**: Python 3.11+ with FastAPI
- **ML Libraries**: scikit-learn, pandas, numpy, XGBoost
- **Workers**: Celery with Redis broker
- **Purpose**: Price predictions, lead scoring, deal optimization, inventory recommendations
- **Offline Pipeline**: Selenium-based scrapers for market data (ml_backend/)

### Infrastructure
- **Version Control**: Git
- **Package Manager**: pnpm 9 (preferred), npm, or yarn
- **Environment**: .env files (never commit!)
- **Deployment**: Replit Deployments (production) or Docker/K8s (self-hosted)
- **Database Migrations**: Prisma Migrate
- **CI/CD**: GitHub Actions ready

---

## 🏗 ARCHITECTURE

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React SPA)                       │
│  Pages → Components → Hooks → TanStack Query → API         │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS (JWT Bearer Token)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                BACKEND APIs (Express + TypeScript)          │
│                                                             │
│  Two main API services:                                    │
│                                                             │
│  1. PRIMARY API (src/)                                     │
│     Routes → Middleware (auth, tenant) → Controllers →     │
│     Services → Prisma                                      │
│                                                             │
│  2. MODULAR API (backend/)                                 │
│     Routes → Middleware (auth, tenant) → Controllers →     │
│     Services → Prisma                                      │
│                                                             │
│  Middleware Stack:                                         │
│  - authenticate: Verify JWT, set req.user                  │
│  - tenantScope: Set AsyncLocalStorage tenant context       │
│  - requireRole: Check user permissions                     │
│  - errorHandler: Catch and format errors                   │
└────────────┬────────────────────────┬──────────────────────┘
             │                        │
             ↓                        ↓
┌─────────────────────┐   ┌─────────────────────────┐
│  PostgreSQL DB      │   │  ML Service (FastAPI)   │
│  (Multi-tenant)     │   │  - Price predictions    │
│  - All tables have  │   │  - Lead scoring         │
│    tenantId field   │   │  - Deal optimization    │
│  - AsyncLocalStorage│   │  - Inventory advisory   │
│    auto-injects     │   └─────────────────────────┘
│    tenant filter    │
└─────────────────────┘
             │
             ↓
    ┌────────────────┐
    │  Redis         │
    │  - BullMQ      │
    │  - Celery      │
    │  - Caching     │
    └────────────────┘
```

### Request Flow

```
1. User Action (Browser)
   ↓
2. React Component calls API (via TanStack Query or Axios)
   ↓
3. HTTP request sent with JWT Bearer token
   ↓
4. Express receives request
   ↓
5. authenticate middleware:
   - Extracts JWT from Authorization header
   - Verifies signature with JWT_PUBLIC_KEY
   - Sets req.user with userId, tenantId, role, permissions
   ↓
6. tenantScope middleware:
   - Gets tenantId from req.user
   - Sets AsyncLocalStorage context
   - Prisma middleware will auto-inject tenantId filter
   ↓
7. Route handler calls controller
   ↓
8. Controller validates input (Zod schemas)
   ↓
9. Controller calls service layer
   ↓
10. Service calls Prisma with tenantId automatically applied
    ↓
11. PostgreSQL returns data (filtered by tenant)
    ↓
12. Service processes/transforms data
    ↓
13. Controller formats response (ok, created, etc.)
    ↓
14. Response sent to client
    ↓
15. React updates UI
```

### Multi-Tenant Architecture

**CRITICAL**: Every table (except `Tenant`) has a `tenantId` foreign key.

```prisma
model Tenant {
  id     String @id @default(cuid())
  name   String
  subdomain String @unique
  // ... other fields
}

model User {
  id       String @id @default(cuid())
  tenantId String @map("tenant_id")  // ← REQUIRED
  email    String
  // ... other fields

  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])
  @@index([tenantId])
}

// EVERY other tenant-scoped model follows this pattern
```

**Prisma Middleware** (in `src/lib/prisma.ts` and `backend/src/lib/prisma.ts`):

- Uses AsyncLocalStorage to get current tenant context
- Auto-injects `tenantId` filter on all queries for tenant-scoped models
- Converts `findUnique` to `findFirst` with tenant filter
- Adds `tenantId` to `where` clause on findMany, update, delete, etc.
- Automatically sets `tenantId` on create operations
- **Models requiring tenant scope are explicitly listed in `tenantScopedModels` Set**

**Key Tenant-Scoped Models:**
- User, Customer, Lead, Activity, Appointment, Communication
- Deal, DealWorksheet, DealVersion, DealOptimization
- Vehicle, Appraisal, PriceHistory
- All CRM, finance, and inventory models

---

## 📝 CODING STANDARDS

### TypeScript

```typescript
// ✅ DO: Explicit types and interfaces
interface DealCreateData {
  customerId: string;
  vehicleId: string;
  salePrice: number;
  downPayment: number;
}

async function createDeal(
  tenantId: string,
  data: DealCreateData
): Promise<Deal> {
  return await prisma.deal.create({
    data: { ...data, tenantId }
  });
}

// ❌ DON'T: Any types or implicit returns
async function createDeal(data: any): any {
  return prisma.deal.create({ data });
}
```

### React Components

```tsx
// ✅ DO: Functional components with TypeScript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DealCardProps {
  deal: Deal;
  onEdit?: (deal: Deal) => void;
  onDelete?: (id: string) => void;
}

export function DealCard({ deal, onEdit, onDelete }: DealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">{deal.stockNumber}</h3>
      {/* ... */}
    </Card>
  );
}

// ❌ DON'T: Class components or missing types
export default function DealCard(props) {
  return <div>{props.deal.name}</div>;
}
```

### API Controllers

```typescript
// ✅ DO: Consistent pattern with validation and error handling
import { Request, Response } from 'express';
import { z } from 'zod';
import { ok, created, noContent } from '../lib/response.js';
import { BadRequest, NotFound, Unprocessable } from '../lib/errors.js';
import * as leadService from '../services/lead.service.js';

const leadCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  source: z.enum(['WEBSITE', 'PHONE', 'WALKIN', 'REFERRAL']),
});

export async function listLeads(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const result = await leadService.listLeads({ tenantId, query: req.query });
  return ok(res, result);
}

export async function createLead(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = leadCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid lead payload', parsed.error.flatten());
  }
  const lead = await leadService.createLead(tenantId, parsed.data);
  return created(res, lead);
}

// ❌ DON'T: No validation or inconsistent responses
export async function createLead(req: Request, res: Response) {
  const lead = await prisma.lead.create({ data: req.body });
  res.json(lead);
}
```

### Service Layer

```typescript
// ✅ DO: Service contains business logic, uses Prisma
import prisma from '../lib/prisma.js';
import { NotFound } from '../lib/errors.js';

export async function getLead(id: string): Promise<Lead> {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: true,
      customer: true,
      scores: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!lead) {
    throw NotFound('Lead not found');
  }

  return lead;
}

// Note: tenantId filter is automatically applied by Prisma middleware
```

### Naming Conventions

```
Files:
- Components: PascalCase (DealCard.tsx, LeadKanban.tsx)
- Hooks: camelCase with 'use' prefix (useAuth.ts, useLeadSocket.ts)
- Utils: camelCase (formatCurrency.ts, validateVin.ts)
- Types: PascalCase or types.ts (deal.types.ts, types/roles.ts)
- Routes: kebab-case (lead.routes.ts, deal.routes.ts)
- Controllers: camelCase (lead.controller.ts, deal.controller.ts)
- Services: camelCase (lead.service.ts, appointment.service.ts)

Variables:
- const/let: camelCase (customerName, dealTotal, salePrice)
- Constants: UPPER_SNAKE_CASE (MAX_FILE_SIZE, API_BASE_URL)
- Types/Interfaces: PascalCase (interface User {}, type DealStatus)
- Enums: PascalCase with UPPER_CASE values
  enum LeadStatus { NEW, CONTACTED, QUALIFIED }

Database (Prisma):
- Models: PascalCase (model Deal {}, model Customer {})
- Fields: camelCase (firstName, createdAt, dealTotal)
- Enums: PascalCase with UPPER_CASE values
- Table names: snake_case via @@map("deals")

API Routes:
- Endpoints: kebab-case (/api/leads, /api/deal-worksheets)
- Query params: camelCase (?sortBy=date&includeArchived=true)
```

### Import Order

```typescript
// 1. External libraries
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash } from 'lucide-react';

// 2. UI components (from components/ui/)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// 3. Internal modules and hooks
import { useAuth } from '@/hooks/useAuth';
import { getQueryFn } from '@/lib/queryClient';

// 4. Types
import type { Lead, Customer } from '@/types';

// 5. Relative imports (same directory)
import { LeadCard } from './LeadCard';
import { formatCurrency } from './utils';
```

---

## 📁 FILE STRUCTURE

```
/
├── backend/                    # Modular backend service (TypeScript + Prisma)
│   ├── src/
│   │   ├── controllers/       # Request handlers
│   │   │   ├── accounting.controller.ts
│   │   │   ├── lead.controller.ts
│   │   │   └── settings.controller.ts
│   │   ├── services/          # Business logic
│   │   │   ├── lead.service.ts
│   │   │   ├── lead-stats.service.ts
│   │   │   └── accounting.service.ts
│   │   ├── routes/            # Route definitions
│   │   │   ├── index.ts       # Main router with loadOptionalRoutes
│   │   │   ├── lead.routes.ts
│   │   │   ├── settings.routes.ts
│   │   │   └── superadmin.routes.ts
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.middleware.ts      # JWT verification
│   │   │   ├── tenant.middleware.ts    # Tenant context
│   │   │   ├── role.middleware.ts      # RBAC
│   │   │   └── superadmin.middleware.ts
│   │   ├── lib/               # Utilities
│   │   │   ├── prisma.ts      # Prisma client with middleware
│   │   │   ├── errors.ts      # Error classes
│   │   │   ├── response.ts    # Response helpers (ok, created, etc.)
│   │   │   └── tenant-context.ts  # AsyncLocalStorage
│   │   ├── validations/       # Zod schemas
│   │   │   └── lead.validation.ts
│   │   ├── types/             # TypeScript types
│   │   │   └── express.ts     # Extended Express types
│   │   ├── config/            # Configuration
│   │   │   └── env.ts
│   │   ├── modules/           # Feature modules
│   │   │   ├── notifications/
│   │   │   ├── pipeline/
│   │   │   ├── tasks/
│   │   │   └── transport/
│   │   ├── fi/                # Finance & Insurance
│   │   └── sockets/           # Socket.IO channels
│   ├── prisma/
│   │   └── schema.prisma      # Backend-specific schema (if separate)
│   └── package.json
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── pages/             # Page components (routes)
│   │   │   ├── Dashboard.tsx
│   │   │   ├── leads/         # Lead management pages
│   │   │   ├── customers/     # Customer pages
│   │   │   ├── desking/       # Deal desk pages
│   │   │   ├── finance/       # F&I pages
│   │   │   ├── service/       # Service pages
│   │   │   ├── analytics/     # Analytics & reporting
│   │   │   ├── accounting/    # Accounting pages
│   │   │   ├── reports/       # Report pages
│   │   │   ├── settings/      # Settings pages
│   │   │   └── admin/         # Admin pages
│   │   ├── components/        # Reusable components
│   │   │   ├── ui/            # shadcn/ui components (button, card, etc.)
│   │   │   ├── layout/        # Layout components (Header, Sidebar)
│   │   │   ├── enterprise/    # Enterprise components
│   │   │   ├── communications/ # Communication components
│   │   │   ├── accounting/    # Accounting components
│   │   │   └── admin/         # Admin components
│   │   ├── features/          # Feature-specific modules
│   │   │   ├── desking/
│   │   │   └── fi/
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── use-search.ts
│   │   │   ├── use-toast.ts
│   │   │   └── use-pixel-tracker.ts
│   │   ├── lib/               # Utilities
│   │   │   ├── queryClient.ts # TanStack Query config
│   │   │   ├── design-tokens.ts # Design system tokens
│   │   │   ├── leadsApi.ts
│   │   │   ├── accountingApi.ts
│   │   │   └── utils.ts
│   │   ├── types/             # TypeScript types
│   │   ├── contexts/          # React contexts
│   │   ├── stores/            # Zustand stores
│   │   ├── routes/            # Route configuration
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   └── vite.config.ts
│
├── src/                        # Primary Express API
│   ├── routes/
│   │   ├── index.ts           # Main router
│   │   ├── leads.ts
│   │   ├── activity.routes.ts
│   │   ├── appointment.routes.ts
│   │   ├── communication.routes.ts
│   │   ├── automation.routes.ts
│   │   ├── desking.routes.ts
│   │   ├── ml.routes.ts
│   │   ├── webhooks.routes.ts
│   │   └── fi/                # F&I routes
│   ├── controllers/
│   │   ├── activity.controller.ts
│   │   ├── appointment.controller.ts
│   │   ├── communication.controller.ts
│   │   ├── desking.controller.ts
│   │   └── webhooks.controller.ts
│   ├── services/
│   │   ├── activity.service.ts
│   │   ├── appointment.service.ts
│   │   ├── communication.service.ts
│   │   ├── desking.service.ts
│   │   ├── automation.service.ts
│   │   ├── dealOptimizer.service.ts
│   │   ├── approvalPredictor.service.ts
│   │   ├── lead-score.service.ts
│   │   ├── lead-routing.service.ts
│   │   ├── marketPricing.service.ts
│   │   └── customer/
│   ├── middleware/
│   │   ├── auth.ts            # JWT verification
│   │   ├── tenant.ts          # Tenant scope
│   │   ├── rbac.ts            # Role checks
│   │   └── context.ts
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client with middleware
│   │   └── storage/           # S3 storage
│   ├── domain/                # Domain services
│   │   └── desking/
│   ├── queues/                # BullMQ queue definitions
│   ├── workers/               # BullMQ workers
│   ├── integrations/          # External integrations
│   │   ├── openai/
│   │   ├── stripe/
│   │   ├── twilio/
│   │   └── sendgrid/
│   ├── fi/                    # F&I module
│   ├── validations/           # Zod schemas
│   ├── events/                # Event emitters
│   ├── types/                 # TypeScript types
│   ├── utils/
│   └── config/
│
├── ml_service/                 # Python ML service (FastAPI)
│   ├── app/
│   │   └── main.py            # FastAPI server
│   ├── models/                # ML models
│   ├── workers/               # Celery workers
│   ├── requirements.txt
│   └── README.md
│
├── ml_backend/                 # Offline ML pipelines
│   ├── scraper/               # Market data scrapers
│   ├── pipeline/              # Training pipelines
│   └── requirements.txt
│
├── tracking-service/           # Pixel tracking & analytics
│   ├── backend/
│   └── frontend/
│
├── prisma/                     # Main Prisma schema
│   ├── schema.prisma          # Database schema (50+ models)
│   ├── migrations/            # Migration history
│   └── seed.ts                # Seed data
│
├── prisma/                     # Main Prisma schema (source of truth)
├── scripts/                    # Automation scripts
│   ├── safe-migrate-deploy.ts
│   ├── db-migrate-production.ts
│   ├── health-check.ts
│   └── repo-audit.ts
│
├── infrastructure/             # Docker/K8s configs
│   ├── docker/
│   └── k8s/
│
├── docs/                       # Documentation
│
├── .env.example               # Environment template
├── .gitignore
├── package.json               # Root package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── prisma.config.ts
├── README.md
├── ARCHITECTURE.md            # Detailed architecture docs
└── AGENTS.md                  # THIS FILE
```

---

## 🔄 DEVELOPMENT WORKFLOW

### Adding a New Feature

**Step 1: Plan**

1. Read this AGENTS.md file completely
2. Understand the feature requirements
3. Check if it affects existing features
4. Plan database changes (if any)
5. Design API endpoints
6. Sketch UI components

**Step 2: Database (if needed)**

```bash
# Edit prisma/schema.prisma
# Add new model or modify existing

# Example: Adding a new model
model ServiceAppointment {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  customerId  String   @map("customer_id")
  vehicleId   String   @map("vehicle_id")
  // ... other fields

  tenant   Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer Customer @relation(fields: [customerId], references: [id])
  vehicle  Vehicle  @relation(fields: [vehicleId], references: [id])

  @@index([tenantId])
  @@map("service_appointments")
}

# Create migration
npx prisma migrate dev --name add_service_appointments

# Generate Prisma client
npx prisma generate

# Verify migration
npx prisma studio
```

**Step 3: Backend (choose service based on scope)**

For modular features (settings, CRM, accounting), use `backend/`:

```bash
# Create in this order:
1. backend/src/validations/service.validation.ts  # Zod schemas
2. backend/src/services/service.service.ts        # Business logic
3. backend/src/controllers/service.controller.ts  # Request handlers
4. backend/src/routes/service.routes.ts           # Route definitions
5. Update backend/src/routes/index.ts             # Mount new routes
```

For core API features (leads, activities, automations), use `src/`:

```bash
# Create in this order:
1. src/validations/feature.validation.ts
2. src/services/feature.service.ts
3. src/controllers/feature.controller.ts
4. src/routes/feature.routes.ts
5. Update src/routes/index.ts
```

**Step 4: Frontend**

```bash
# Create in this order:
1. client/src/types/feature.types.ts           # TypeScript types
2. client/src/lib/featureApi.ts                # API client functions
3. client/src/hooks/useFeature.ts              # Custom hooks (optional)
4. client/src/pages/feature/FeaturePage.tsx    # Main page
5. client/src/components/feature/              # Feature-specific components

# Update routing in client/src/App.tsx or route config
```

**Step 5: Test**

```bash
# Manual testing checklist:
□ Feature works as expected
□ Multi-tenant isolation works (test with different tenantIds)
□ Mobile responsive (test on small screens)
□ Error handling works (test invalid inputs)
□ Loading states shown
□ Validation works (test with Zod schemas)
□ Doesn't break existing features (regression test)

# Run automated tests
pnpm typecheck    # TypeScript checks
pnpm lint         # ESLint
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright E2E tests (if applicable)
```

**Step 6: Document**

```bash
# Update documentation:
- Add to feature status in this AGENTS.md
- Note any architectural decisions in changelog
- Update API documentation if needed
```

### Making Changes to Existing Code

```
CRITICAL PROCESS:

1. Read and understand the current code
2. Use git blame or git log to see why it was written that way
3. Search for usages: grep -r "functionName" src/ client/
4. Identify dependent features
5. Make the change
6. Test thoroughly (unit + integration + manual)
7. Update related documentation

⚠️ If you're not 100% sure about the impact, ASK THE USER first!
```

### Running the Development Environment

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Push schema to database (dev only)
pnpm db:push

# Seed database (optional)
pnpm db:seed

# Run development servers:

# Option 1: Primary API only (src/)
pnpm dev

# Option 2: Frontend only
pnpm dev:frontend

# Option 3: Modular backend only (backend/)
pnpm dev:backend

# Option 4: ML service
pnpm dev:ml

# Option 5: Full stack (Replit mode - all services)
pnpm dev:replit
# This runs: backend + frontend + ML service + Celery workers + beat scheduler

# Production build
pnpm build:prod
# Runs: prisma generate + build backend + build frontend

# Start production
pnpm start:prod
```

### Git Commit Messages

```
Format: <type>(<scope>): <subject>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code refactoring (no functional changes)
- style: Formatting, styling (no code changes)
- docs: Documentation only
- test: Adding or updating tests
- chore: Maintenance, dependencies, config

Scopes:
- leads, deals, inventory, crm, fi, accounting, analytics
- auth, tenant, api, db, prisma
- ui, components, styles
- ml, pricing, scoring

Examples:
feat(leads): add lead import from CSV
fix(inventory): correct price calculation for trade-ins
refactor(api): extract deal validation into service
docs(agents): update development workflow section
chore(deps): upgrade Prisma to 5.22.0
```

---

## ✅ FEATURE STATUS

### ✓ Completed Features

#### Core Infrastructure
- [x] Multi-tenant database architecture with AsyncLocalStorage
- [x] JWT authentication (RS256) with refresh tokens
- [x] Role-based access control (ADMIN, MANAGER, SALES, BDC, FINANCE, SERVICE)
- [x] Super admin impersonation via x-tenant-id header
- [x] Tenant isolation middleware (automatic tenantId injection)
- [x] API error handling with custom error classes
- [x] Design token system (client/src/lib/design-tokens.ts)
- [x] WebSocket support via Socket.IO

#### CRM & Lead Management
- [x] Lead CRUD with Kanban board view
- [x] Lead scoring (AI/ML integration)
- [x] Lead assignment and ownership
- [x] Lead routing and distribution
- [x] Lead import from CSV
- [x] Lead statistics and analytics
- [x] Customer 360-degree view
- [x] Customer search with full-text vectors
- [x] Activity tracking (calls, emails, tasks, meetings)
- [x] Appointment scheduling with calendar view
- [x] Communication center (calls, SMS, email)
- [x] Communication templates (email & SMS)

#### Deal Management & Desking
- [x] Deal creation and editing
- [x] Deal desking/structuring (cash, finance, lease)
- [x] Deal worksheets with version history
- [x] F&I product management and menu configuration
- [x] Deal approval workflow
- [x] Counter offer tracking
- [x] Deal optimization (AI/ML)
- [x] Approval predictions (ML)
- [x] Deal jackets with document management
- [x] Contract generation
- [x] Digital signatures (DocuSign/Adobe Sign integration ready)

#### Inventory Management
- [x] Vehicle inventory tracking
- [x] Vehicle CRUD operations
- [x] Trade-in appraisal system with workflow
- [x] VIN decoder integration
- [x] Pricing intelligence (market comps)
- [x] Price history tracking
- [x] Recon item tracking and workflow
- [x] Vehicle search with full-text vectors
- [x] Auction purchase tracking
- [x] Wholesale listings
- [x] Transport orders

#### Finance & Insurance
- [x] Credit application management
- [x] Credit report integration
- [x] Credit submission drafts
- [x] Lender management
- [x] Lender submission tracking
- [x] Funding checklists
- [x] Compliance checklists
- [x] F&I products library

#### Accounting
- [x] GL account management
- [x] Journal entry system
- [x] Journal entry lines (debits/credits)
- [x] Commission calculations
- [x] Financial reporting
- [x] Deal accounting automation

#### Analytics & Reporting
- [x] Pipeline aggregates
- [x] Lead statistics
- [x] Custom reports
- [x] CRM analytics dashboard
- [x] Competitive pricing analytics
- [x] Pixel tracking service integration

#### Automation & Workflows
- [x] Workflow definitions
- [x] Workflow stages
- [x] Workflow tasks with assignments
- [x] Stage transitions tracking
- [x] Automation rules engine
- [x] Automation execution logging
- [x] BullMQ background jobs

#### Settings & Administration
- [x] Unified settings system (/settings/*)
- [x] User management
- [x] Role & permission management
- [x] Tenant configuration
- [x] System settings
- [x] Menu configuration
- [x] Super admin tools

#### Machine Learning
- [x] Price prediction service (FastAPI)
- [x] Lead scoring service
- [x] Deal optimization service
- [x] Inventory recommendations
- [x] Approval prediction model
- [x] Celery workers for async ML jobs
- [x] Model retraining pipelines (ml_backend/)

### 🚧 In Progress

- [ ] Advanced analytics dashboard with drill-downs
- [ ] Mobile app (React Native)
- [ ] Service department module (partial)
- [ ] Parts inventory management
- [ ] Enhanced DMS integrations (CDK, Reynolds, Dealertrack)

### 📋 Planned Features

- [ ] Multi-location support (consolidated view across dealerships)
- [ ] Customer portal (self-service)
- [ ] Advanced reporting builder (drag-and-drop)
- [ ] Wholesale management enhancements
- [ ] Auction integration (Manheim, ADESA)
- [ ] Enhanced service scheduling
- [ ] Parts ordering system
- [ ] Warranty tracking
- [ ] Enhanced mobile experience
- [ ] Real-time collaboration features
- [ ] Advanced AI features (chat assistant, voice commands)

---

## 🐛 KNOWN ISSUES

### Critical
None currently

### High Priority
None currently

### Medium Priority
- [ ] Settings navigation: Multiple entry points exist (consolidate further)
- [ ] Deal calculator: Mobile optimization needed for complex worksheets
- [ ] Notification system: Add more granular preferences

### Low Priority
- [ ] Typography: Consider switching to Inter or similar system font
- [ ] Color palette: Evaluate automotive-specific accent colors
- [ ] Dark mode: Complete implementation across all components
- [ ] Performance: Optimize large table rendering (virtualization)

### Technical Debt
- [x] Legacy Drizzle gateway (server/) ~~should be phased out in favor of Prisma~~ **COMPLETED 2025-10-24**
- [x] Drizzle dependencies and config files removed **COMPLETED 2025-10-24**
- [ ] Update client files to use Prisma types instead of old @shared imports
- [ ] Consolidate duplicate Prisma schemas (backend/prisma/ vs prisma/)
- [ ] Improve test coverage (currently ~30%, target 80%)
- [ ] Add E2E tests for critical user flows
- [ ] Document all API endpoints (OpenAPI/Swagger)

---

## 📜 CHANGELOG

### [1.0.1] - 2025-10-24

#### Development Environment Cleanup

**Changes Made:**
- **Removed Drizzle ORM completely** - The legacy Drizzle gateway has been fully phased out
  - Deleted `server/` directory (legacy Drizzle gateway)
  - Deleted `shared/` directory (Drizzle schemas)
  - Deleted `drizzle.config.ts`
  - Deleted `migrations/` (Drizzle migrations)
  - Removed `drizzle-orm`, `drizzle-zod`, and `drizzle-kit` from package.json
  - **Impact**: Project now uses Prisma exclusively for database access

- **Updated Configuration Files**
  - Removed `@shared` path alias from tsconfig.json, vite.config.ts, and tsup.config.ts
  - Updated tsconfig.api.json to remove reference to shared/search-vector.ts
  - Updated tsconfig.jest.json to reference src/ and backend/src/ instead of server/ and shared/
  - Updated tsup.config.ts to build from src/server.ts instead of server/index.ts
  - **Impact**: Cleaner build configuration, no references to deleted files

- **Port Configuration for Replit**
  - Configured PORT=80 in .replit environment variables
  - Updated .replit port mapping to use localPort=80 and externalPort=80
  - Updated backend default PORT to 80 in backend/src/config/env.ts
  - Updated dev:backend script to use environment PORT
  - **Impact**: Application now runs on port 80 as required by Replit

- **Documentation Cleanup**
  - Removed duplicate files: DEPLOY_NOW.md, FINAL_SUMMARY.md, PRISMA_QUICKSTART.md, replit.md
  - **Impact**: Cleaner documentation structure

**Database Schema Verification:**
- Confirmed Prisma schema has 142 indexes for optimized queries
- Confirmed 185 relations properly defined across 50+ models
- All tenant-scoped models have proper tenantId foreign keys and indexes
- **Status**: ✅ All relational fields properly configured

**Known Issues:**
- Many client files still import types from `@shared/*` (old Drizzle schemas)
  - These need to be updated to use Prisma types from `@prisma/client`
  - Files affected: ~30 client components and pages
  - **TODO**: Create a types export from Prisma client for frontend use

**Development Workflow:**
```bash
# Start backend API (port 80)
npm run dev

# Start frontend dev server (port 5173) - in separate terminal
npm run dev:frontend

# Start full stack with ML services
npm run dev:replit
```

### [1.0.0] - 2025-10-23

#### Initial Release - Major Architectural Decisions

**Decision: Multi-tenant architecture with tenantId on all tables**
- **Rationale**: Single codebase serves multiple dealerships with complete data isolation
- **Implementation**: Prisma middleware with AsyncLocalStorage auto-injecting tenantId
- **Impact**: Every query automatically filtered by tenant, preventing cross-tenant data leaks
- **Files**: `src/lib/prisma.ts`, `backend/src/lib/prisma.ts`, `prisma/schema.prisma`

**Decision: Dual API architecture (src/ + backend/)**
- **Rationale**: Separate concerns - core API (src/) vs modular features (backend/)
- **Implementation**:
  - `src/` - Primary Express API for CRM, activities, automations, desking
  - `backend/` - Modular API for settings, accounting, admin, long-running operations
- **Impact**: Better code organization, easier to maintain and scale
- **Files**: `src/routes/index.ts`, `backend/src/routes/index.ts`

**Decision: AsyncLocalStorage for tenant context**
- **Rationale**: Avoid passing tenantId through every function call
- **Implementation**: Middleware sets context, Prisma middleware reads it
- **Impact**: Cleaner code, automatic tenant isolation, impossible to forget
- **Files**: `src/lib/prisma.ts`, `backend/src/lib/tenant-context.ts`

**Decision: JWT with RS256 (asymmetric keys)**
- **Rationale**: More secure than HS256, supports public key verification
- **Implementation**: Private key signs tokens, public key verifies
- **Impact**: Better security, can share public key with other services
- **Files**: `backend/src/middleware/auth.middleware.ts`, `src/middleware/auth.ts`

**Decision: shadcn/ui component library**
- **Rationale**: High-quality, customizable, accessible components built on Radix UI
- **Implementation**: Components in `client/src/components/ui/`
- **Impact**: Consistent UI, faster development, better accessibility
- **Rule**: NEVER duplicate these components - always use existing ones

**Decision: Design token system**
- **Rationale**: Consistent styling across entire application
- **Implementation**: Centralized in `client/src/lib/design-tokens.ts`
- **Impact**: Easy theming, professional appearance, design consistency
- **Tailwind configured to use these tokens**

**Decision: TanStack Query for server state**
- **Rationale**: Better caching, automatic refetching, loading states
- **Implementation**: Query client in `client/src/lib/queryClient.ts`
- **Impact**: Reduced boilerplate, better UX, automatic cache invalidation

**Decision: Zod for validation**
- **Rationale**: Type-safe validation with TypeScript inference
- **Implementation**: Validation schemas in `validations/` directories
- **Impact**: Single source of truth for types and validation

**Decision: Separate ML service (Python FastAPI)**
- **Rationale**: ML requires Python libraries, keep main API lightweight
- **Implementation**: FastAPI service at ml_service/, Celery workers
- **Impact**: Better separation of concerns, easier scaling, language-appropriate tools
- **Proxied via main API at /api/ml**

**Decision: Socket.IO for real-time features**
- **Rationale**: Need real-time updates for leads, notifications, collaborative editing
- **Implementation**: Channels in `backend/src/sockets/`, `src/events/`
- **Impact**: Better UX with instant updates, collaborative features

**Decision: BullMQ for background jobs**
- **Rationale**: Reliable job queue with Redis, better than cron
- **Implementation**: Queues in `src/queues/`, workers in `src/workers/`
- **Impact**: Async processing, scheduled tasks, retry logic

#### Database Schema Highlights

**50+ Prisma models including:**
- Core: Tenant, User
- CRM: Customer, Lead, Activity, Appointment, Communication
- Deals: Deal, DealWorksheet, DealVersion, DealJacket, Contract
- Inventory: Vehicle, Appraisal, ReconItem, PriceHistory, MarketComp
- Finance: CreditApplication, CreditReport, Lender, LenderSubmission, FundingChecklist
- Accounting: GLAccount, JournalEntry, JournalEntryLine, Commission
- Automation: Automation, AutomationExecution, WorkflowDefinition, WorkflowTask
- Analytics: LeadScore, Report, PipelineAggregate

**Key Enums:**
- UserRole: ADMIN, MANAGER, SALES, BDC, FINANCE, SERVICE
- LeadStatus: NEW, CONTACTED, QUALIFIED, NURTURING, OPPORTUNITY, CONVERTED, LOST
- LeadSource: WEBSITE, PHONE, WALKIN, EMAIL, REFERRAL, FACEBOOK, GOOGLE, etc.
- DealStatus: DRAFT, PENDING, APPROVED, FUNDED, CANCELLED
- VehicleType: NEW, USED, CPO

#### Features Implemented (Initial Release)

**Complete CRM System:**
- Lead management with Kanban board
- Lead scoring and routing
- Customer 360 view
- Activity tracking
- Appointment scheduling
- Communication center with templates
- Lead import from CSV

**Deal Management:**
- Deal desking with cash/finance/lease structures
- Deal worksheets with version history
- F&I product management
- Deal approval workflow
- Counter offers
- AI-powered optimization
- Document generation

**Inventory Management:**
- Vehicle CRUD
- Trade-in appraisals with workflow
- Pricing intelligence
- Market comps
- Recon tracking
- Vehicle search

**Finance & Accounting:**
- Credit applications
- Lender management
- GL accounts and journal entries
- Commission calculations
- Compliance checklists

**Machine Learning:**
- Price prediction
- Lead scoring
- Deal optimization
- Approval prediction
- Celery-based async processing

**Infrastructure:**
- Multi-tenant with tenant isolation
- JWT authentication with RBAC
- WebSockets for real-time updates
- Background job processing
- Pixel tracking
- Comprehensive logging

#### Breaking Changes
None (initial release)

#### Major Migrations

- `initial` - Initial database schema with all 50+ models
- Includes all tenant-scoped models with proper indexes
- Full-text search vectors for Customer and Vehicle
- Complete relationship definitions

#### Configuration & Environment

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_PUBLIC_KEY` - RS256 public key (PEM format)
- `JWT_AUDIENCE` - JWT audience claim
- `JWT_ISSUER` - JWT issuer claim
- `SESSION_SECRET` - Express session secret (min 32 chars)
- `REDIS_URL` - Redis connection string

**Optional Environment Variables:**
- `ML_SERVICE_URL` - ML service URL (default: http://localhost:8000)
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `STRIPE_SECRET_KEY` - Stripe API key
- `SENDGRID_API_KEY` - SendGrid API key
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` - Twilio credentials
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_BUCKET_NAME` - S3 config
- `VITE_GA_MEASUREMENT_ID` - Google Analytics

---

### Future Versions

Each version should document:
- **Date of change**
- **What changed** (features, fixes, refactors)
- **Why it changed** (rationale, business need)
- **Breaking changes** (API changes, database schema changes)
- **Migration steps** (how to upgrade)
- **Architectural decisions** (new patterns, libraries)
- **Performance improvements**
- **Security enhancements**

---

## 🎯 AGENT REMINDERS

**Before making ANY change, ask yourself:**

1. ✅ Does this maintain multi-tenant isolation?
2. ✅ Does this follow established patterns?
3. ✅ Have I tested this won't break existing features?
4. ✅ Is this TypeScript type-safe?
5. ✅ Have I updated documentation?
6. ✅ Does this work on mobile?
7. ✅ Is error handling complete?
8. ✅ Are loading states handled?
9. ✅ Did I use existing UI components (shadcn/ui)?
10. ✅ Did I validate input with Zod schemas?

**When implementing a feature, check:**
- [ ] Database changes use migrations
- [ ] tenantId is properly handled (auto-injected by middleware)
- [ ] Authentication required (authenticate middleware)
- [ ] Authorization checked (requireRole middleware if needed)
- [ ] Input validated (Zod schemas)
- [ ] Errors handled (try-catch or error middleware)
- [ ] Response formatted correctly (ok, created, noContent helpers)
- [ ] TypeScript types defined (no any)
- [ ] Frontend uses TanStack Query for data fetching
- [ ] UI components from shadcn/ui (don't create duplicates)
- [ ] Mobile responsive (test on small screens)

**When stuck, check:**
- This AGENTS.md file (you're reading it!)
- Existing similar implementations in the codebase
- `prisma/schema.prisma` for data structure
- `ARCHITECTURE.md` for detailed architecture
- API routes in `src/routes/` or `backend/src/routes/` for patterns

**When uncertain:**
- ASK THE USER before proceeding
- Better to ask than break something
- User knows the business logic best
- Don't make assumptions about requirements

---

## 🔐 SECURITY CHECKLIST

Every feature must address:

- [ ] **Authentication**: JWT verified via authenticate middleware?
- [ ] **Authorization**: Role-based access enforced (requireRole)?
- [ ] **Tenant Isolation**: tenantId automatically applied via middleware?
- [ ] **Input Validation**: Zod schemas validate all inputs?
- [ ] **SQL Injection**: Prevented (Prisma handles this automatically)
- [ ] **XSS**: Prevented (React escapes by default, but check dangerouslySetInnerHTML)
- [ ] **CSRF**: Protected (consider for state-changing operations)
- [ ] **Sensitive Data**: PII encrypted/hashed (passwords with bcrypt, SSNs encrypted)
- [ ] **Audit Logging**: Important actions logged (AuditLog model)?
- [ ] **Rate Limiting**: Considered for public endpoints?
- [ ] **HTTPS**: Required in production (Replit auto-provisions)

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- **Project README**: `/README.md` - Getting started, prerequisites
- **Architecture Guide**: `/ARCHITECTURE.md` - Detailed architecture documentation
- **Deployment Guide**: `/DEPLOYMENT_STEPS.md` - Production deployment
- **Prisma Setup**: `/PRISMA_SETUP.md` - Database setup and migrations

### External Documentation
- **Prisma Docs**: https://www.prisma.io/docs
- **React Docs**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/handbook/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query/latest
- **Zod**: https://zod.dev
- **Express.js**: https://expressjs.com/

### API Documentation
- API endpoints are documented in route files
- Consider generating OpenAPI/Swagger docs in the future

---

## 🤝 WORKING WITH OTHER AI AGENTS

When working in a team with other AI agents:

1. **Read this file FIRST** before making any changes
2. **Check the changelog** for recent decisions and patterns
3. **Follow all coding standards** consistently
4. **Update changelog** with your changes and rationale
5. **Document architectural decisions** in the changelog
6. **Be consistent** with existing code patterns
7. **Communicate** via commit messages and code comments
8. **Test thoroughly** before committing
9. **Ask for clarification** when requirements are ambiguous

---

## 🔧 TROUBLESHOOTING

### Common Issues

**Prisma Client out of sync:**
```bash
pnpm prisma:generate
```

**Database schema out of sync:**
```bash
pnpm db:push  # Development only
# OR
pnpm prisma:migrate  # Production
```

**TypeScript errors:**
```bash
pnpm typecheck
```

**Tenant context errors:**
- Ensure authenticate middleware runs before tenantScope
- Ensure tenantScope middleware runs before route handlers
- Check AsyncLocalStorage is set correctly

**JWT verification fails:**
- Verify JWT_PUBLIC_KEY environment variable is set
- Ensure key is in PEM format with proper line breaks
- Check JWT_AUDIENCE and JWT_ISSUER match token claims

**CORS errors:**
- Check CORS configuration in Express setup
- Ensure frontend URL is allowed in CORS origins

---

## 📝 FINAL NOTES

**Remember:** This file is the **SINGLE SOURCE OF TRUTH** for AI agents working on AutolytiQ.

- When in doubt, **refer to this file**
- When something is unclear, **ask the user**
- When you make a significant decision, **document it in the changelog**
- When you add a major feature, **update the feature status**
- When you find a bug, **add it to known issues**

**The goal is consistency, quality, and maintainability.**

Every AI agent that follows this guide will:
- Understand the project deeply
- Work consistently with established patterns
- Maintain multi-tenant security
- Produce high-quality, type-safe code
- Document their changes properly
- Help maintain this living document

**Thank you for reading this guide thoroughly!** 🚀

---

**Version History:**
- 1.0.0 (2025-10-23) - Initial comprehensive documentation

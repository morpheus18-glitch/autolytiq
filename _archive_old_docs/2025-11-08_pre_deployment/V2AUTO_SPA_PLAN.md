# V2Auto Design Library - Single Page Application
**Created**: 2025-11-08  
**Branch**: rescue-20251107-180523  
**Goal**: Clean SPA with login + role-based dashboards using V2Auto design system

---

## 🎯 PROJECT SCOPE

### Core Features:
1. **Login Page** - Email/password authentication
2. **Role-Based Dashboards** - Different views per role
3. **V2Auto Design Library** - Complete design system foundation
4. **Type-Safe** - Full TypeScript, no `any` types

### Roles:
- **SALESPERSON** - Deal pipeline, customer list, activities
- **SALES_MANAGER** - Team performance, pipeline oversight, approvals
- **FINANCE_MANAGER** - Deal financing, F&I products, lender management
- **GM** (General Manager) - High-level metrics, all departments
- **ADMIN** - User management, settings, system config

---

## 📦 V2AUTO DESIGN LIBRARY

### Package Structure:
```
packages/
├── tokens/          ✅ Design tokens (colors, spacing, typography)
├── ui/              🔄 Component library (V2Auto components)
└── shared/          🆕 Types, schemas, utilities
```

### V2Auto Component Library Plan:

#### Phase 1: Foundation (Week 1)
**Form Components**:
- [x] Button (already exists)
- [ ] Input (text, email, password, number)
- [ ] Label
- [ ] Select
- [ ] Checkbox
- [ ] Radio
- [ ] Switch

**Layout Components**:
- [ ] Card
- [ ] Container
- [ ] Stack (vertical/horizontal)
- [ ] Grid

**Feedback Components**:
- [x] Toast (already exists)
- [ ] Alert
- [ ] Badge
- [ ] Spinner

#### Phase 2: Dashboard Components (Week 2)
**Data Display**:
- [ ] Table
- [ ] Stat Card (metric display)
- [ ] Chart (recharts wrapper)
- [ ] Empty State

**Navigation**:
- [ ] Sidebar
- [ ] Header
- [ ] Tabs
- [ ] Breadcrumbs

**Overlays**:
- [ ] Modal
- [ ] Dropdown
- [ ] Popover
- [ ] Sheet (slide-over)

---

## 🏗️ APPLICATION ARCHITECTURE

### Directory Structure:
```
apps/frontend/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component with router
│   │
│   ├── routes/                     # Route configuration
│   │   └── index.tsx               # React Router 6 routes
│   │
│   ├── layouts/                    # Layout components
│   │   ├── AuthLayout.tsx          # Login page wrapper
│   │   └── DashboardLayout.tsx     # Authenticated app shell
│   │
│   ├── pages/                      # Page components
│   │   ├── Login.tsx               # Login page
│   │   ├── Dashboard.tsx           # Role-based dashboard router
│   │   │
│   │   └── dashboards/             # Role-specific dashboards
│   │       ├── SalespersonDashboard.tsx
│   │       ├── SalesManagerDashboard.tsx
│   │       ├── FinanceManagerDashboard.tsx
│   │       ├── GMDashboard.tsx
│   │       └── AdminDashboard.tsx
│   │
│   ├── components/                 # Feature components
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   └── dashboard/
│   │       ├── DealPipelineWidget.tsx
│   │       ├── TeamPerformanceWidget.tsx
│   │       └── MetricsGrid.tsx
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useAuth.tsx             # Authentication hook
│   │   └── useRole.tsx             # Role checking hook
│   │
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # API client
│   │   └── auth.ts                 # Auth utilities
│   │
│   └── stores/                     # State management
│       └── auth.store.ts           # Auth state (Zustand)
```

---

## 🔐 AUTHENTICATION FLOW

### 1. Login Page (`/login`)
```tsx
// pages/Login.tsx
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
```

### 2. Auth Store (Zustand)
```tsx
// stores/auth.store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    set({ user: res.user, token: res.token });
    localStorage.setItem('token', res.token);
  },
  
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },
  
  isAuthenticated: () => !!get().token,
}));
```

### 3. Protected Routes
```tsx
// routes/index.tsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export const routes = [
  { path: '/login', element: <Login /> },
  {
    path: '/app',
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Dashboard /> },
      // ... more routes
    ],
  },
];
```

---

## 🎨 ROLE-BASED DASHBOARD RENDERING

### Dashboard Router Component
```tsx
// pages/Dashboard.tsx
import { useAuthStore } from '@/stores/auth.store';
import SalespersonDashboard from './dashboards/SalespersonDashboard';
import SalesManagerDashboard from './dashboards/SalesManagerDashboard';
import FinanceManagerDashboard from './dashboards/FinanceManagerDashboard';
import GMDashboard from './dashboards/GMDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const DASHBOARD_MAP = {
  SALESPERSON: SalespersonDashboard,
  SALES_MANAGER: SalesManagerDashboard,
  FINANCE_MANAGER: FinanceManagerDashboard,
  GM: GMDashboard,
  ADMIN: AdminDashboard,
} as const;

export default function Dashboard() {
  const user = useAuthStore(s => s.user);
  
  if (!user) return <Navigate to="/login" />;
  
  const DashboardComponent = DASHBOARD_MAP[user.role] ?? SalespersonDashboard;
  
  return (
    <div className="p-6">
      {/* Role indicator for testing */}
      <div className="mb-4 rounded-lg bg-accent-primary-subtle p-3">
        <p className="text-sm text-text-secondary">
          Logged in as: <strong>{user.firstName} {user.lastName}</strong>
          {' · '}Role: <strong>{user.role}</strong>
        </p>
      </div>
      
      <DashboardComponent user={user} />
    </div>
  );
}
```

### Example: Salesperson Dashboard
```tsx
// pages/dashboards/SalespersonDashboard.tsx
import { Card, Stack, Grid } from '@repo/ui';
import { DealPipelineWidget, ActiveCustomersWidget } from '@/components/dashboard';

export default function SalespersonDashboard({ user }: { user: User }) {
  return (
    <Stack spacing="6">
      <h1 className="text-2xl font-semibold text-text-primary">
        Welcome back, {user.firstName}!
      </h1>
      
      <Grid cols={3} gap={4}>
        <Card>
          <Card.Header>
            <h3>Today's Deals</h3>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold text-accent-primary">12</div>
            <p className="text-sm text-text-secondary">3 pending approval</p>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <h3>Hot Leads</h3>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold text-status-warning">8</div>
            <p className="text-sm text-text-secondary">Follow up needed</p>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <h3>Commission (MTD)</h3>
          </Card.Header>
          <Card.Content>
            <div className="text-3xl font-bold text-status-success">$4,230</div>
            <p className="text-sm text-text-secondary">+12% vs last month</p>
          </Card.Content>
        </Card>
      </Grid>
      
      <DealPipelineWidget userId={user.id} />
      <ActiveCustomersWidget userId={user.id} />
    </Stack>
  );
}
```

---

## 🗄️ DATABASE SCHEMA (Minimal)

```prisma
// packages/db/prisma/schema.prisma

model Tenant {
  id        String   @id @default(cuid())
  name      String
  domain    String   @unique
  createdAt DateTime @default(now())
  
  users     User[]
  customers Customer[]
  vehicles  Vehicle[]
  deals     Deal[]
}

model User {
  id        String   @id @default(cuid())
  tenantId  String
  email     String
  password  String   // bcrypt hashed
  firstName String
  lastName  String
  role      UserRole @default(SALESPERSON)
  createdAt DateTime @default(now())
  
  tenant Tenant @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, email])
  @@index([tenantId])
}

enum UserRole {
  SALESPERSON
  SALES_MANAGER
  FINANCE_MANAGER
  GM
  ADMIN
}

model Customer {
  id        String   @id @default(cuid())
  tenantId  String
  firstName String
  lastName  String
  email     String?
  phone     String?
  createdAt DateTime @default(now())
  
  tenant Tenant @relation(fields: [tenantId], references: [id])
  deals  Deal[]
  
  @@index([tenantId, createdAt])
}

model Vehicle {
  id        String   @id @default(cuid())
  tenantId  String
  vin       String
  year      Int
  make      String
  model     String
  price     Decimal? @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  
  tenant Tenant @relation(fields: [tenantId], references: [id])
  deals  Deal[]
  
  @@unique([tenantId, vin])
}

model Deal {
  id         String     @id @default(cuid())
  tenantId   String
  customerId String
  vehicleId  String
  status     DealStatus @default(PENDING)
  salePrice  Decimal?   @db.Decimal(10, 2)
  profit     Decimal?   @db.Decimal(10, 2)
  createdAt  DateTime   @default(now())
  
  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  customer Customer @relation(fields: [customerId], references: [id])
  vehicle  Vehicle  @relation(fields: [vehicleId], references: [id])
  
  @@index([tenantId, status])
}

enum DealStatus {
  PENDING
  APPROVED
  CLOSED
  CANCELLED
}
```

---

## 🔧 BACKEND API ENDPOINTS

### Authentication
```
POST /api/auth/login
  Body: { email, password }
  Returns: { user, token }

GET /api/auth/me
  Headers: { Authorization: Bearer <token> }
  Returns: { user }

POST /api/auth/logout
  Clears session
```

### Dashboard Data
```
GET /api/dashboard/stats
  Headers: { Authorization: Bearer <token> }
  Returns: Role-specific stats

GET /api/deals
  Query: { status?, userId? }
  Returns: Deal list (filtered by role)

GET /api/customers
  Query: { assignedTo? }
  Returns: Customer list (filtered by role)
```

---

## 🎨 V2AUTO DESIGN TOKENS (Current)

**Already Defined in `packages/tokens`**:
- ✅ Colors (primitives + semantic)
- ✅ Spacing (0-96, plus xxs-xxxl)
- ✅ Typography (sans, mono fonts + sizes)
- ✅ Shadows (sm, md, lg, dark variants)
- ✅ Border radius
- ✅ Motion (durations, easing)

**Usage**:
```tsx
// Via Tailwind classes
<div className="bg-surface-base text-text-primary p-4 rounded-lg shadow-md">

// Via CSS variables
<div style={{ background: 'var(--semantic-surface-base)' }}>
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation Setup (Today)
- [ ] Create database schema with 5 models + UserRole enum
- [ ] Create shared types package
- [ ] Build backend auth endpoints (login, me, logout)
- [ ] Create auth store (Zustand)
- [ ] Test login flow with Postman/curl

### Phase 2: V2Auto Components (Tomorrow)
- [ ] Build Input component
- [ ] Build Label component
- [ ] Build Card component (with Header/Content/Footer)
- [ ] Build Stack component (flex layout)
- [ ] Build Grid component
- [ ] Build Badge component
- [ ] Build Spinner component

### Phase 3: Authentication UI (Day 2)
- [ ] Create AuthLayout component
- [ ] Create LoginForm component
- [ ] Setup React Router 6 with protected routes
- [ ] Wire up login → token storage → redirect

### Phase 4: Dashboard Shell (Day 3)
- [ ] Create DashboardLayout (header + sidebar)
- [ ] Create role-based dashboard router
- [ ] Build 5 dashboard skeletons (one per role)
- [ ] Add role indicator UI

### Phase 5: Dashboard Content (Day 4-5)
- [ ] Salesperson: Deal pipeline, hot leads, commission
- [ ] Sales Manager: Team performance, pipeline overview
- [ ] Finance Manager: Pending financing, F&I metrics
- [ ] GM: High-level metrics across all departments
- [ ] Admin: User management, system settings

---

## 🧪 TESTING ROLE-BASED RENDERING

### Seed Data Script:
```typescript
// packages/db/seed/users.ts
const testUsers = [
  {
    email: 'john@dealership.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'John',
    lastName: 'Sales',
    role: 'SALESPERSON',
    tenantId: tenant.id,
  },
  {
    email: 'sarah@dealership.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Sarah',
    lastName: 'Manager',
    role: 'SALES_MANAGER',
    tenantId: tenant.id,
  },
  {
    email: 'mike@dealership.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Mike',
    lastName: 'Finance',
    role: 'FINANCE_MANAGER',
    tenantId: tenant.id,
  },
  {
    email: 'lisa@dealership.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Lisa',
    lastName: 'General',
    role: 'GM',
    tenantId: tenant.id,
  },
  {
    email: 'admin@dealership.com',
    password: await bcrypt.hash('password123', 10),
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    tenantId: tenant.id,
  },
];
```

### Manual Testing:
1. Login as `john@dealership.com` → See Salesperson Dashboard
2. Logout → Login as `sarah@dealership.com` → See Sales Manager Dashboard
3. Logout → Login as `admin@dealership.com` → See Admin Dashboard

**Visual Indicator**: Role badge at top of dashboard shows current role

---

## 🎯 SUCCESS CRITERIA

### Foundation Complete When:
- [x] Frontend builds without errors
- [ ] Login page renders and looks good (V2Auto styling)
- [ ] Can login with test credentials
- [ ] Token stored in localStorage
- [ ] Redirect to dashboard after login
- [ ] Correct dashboard renders based on role
- [ ] Role indicator shows current user + role
- [ ] Logout button works and clears state

### V2Auto Library Complete When:
- [ ] 10+ components built and documented
- [ ] All components use design tokens
- [ ] All components are TypeScript strict
- [ ] All components use CVA for variants
- [ ] Consistent API across all components

---

## 📦 DELIVERABLES

1. **V2Auto Component Library** (`packages/ui`)
   - 10+ production-ready components
   - Full TypeScript support
   - CVA variants for all components
   - Consistent prop interfaces

2. **SPA Application** (`apps/frontend`)
   - Login page with form validation
   - 5 role-based dashboards
   - Protected routes
   - Role-based rendering working

3. **Backend API** (`apps/backend`)
   - JWT authentication
   - Role-based authorization
   - Dashboard data endpoints

4. **Database** (`packages/db`)
   - 5-table schema with UserRole enum
   - Seed data for testing
   - Tenant isolation

---

**NEXT STEP**: Start with database schema creation?

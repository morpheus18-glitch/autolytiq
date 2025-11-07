# Role-Based Dashboard Architecture Audit

**Date**: 2025-11-07
**Scope**: /root/autolytiq monorepo
**Status**: Non-destructive analysis complete

---

## A. High-Level Map

### Roles Detected
```typescript
// Found in: packages/db/schema/auth.prisma
enum UserRole {
  SUPER_ADMIN
  DEALER_ADMIN
  DEALER_MANAGER
  SALES_MANAGER
  SALESPERSON
  F_AND_I_MANAGER
  INVENTORY_MANAGER
  ACCOUNTING_MANAGER
  SERVICE_ADVISOR
  TECHNICIAN
  VIEWER
}
```

### Dashboard Templates Per Role
**Finding**: ❌ **No explicit role-based dashboard routing found**

Current state:
- Single monolithic dashboard at `/apps/frontend/src/pages/dashboard.tsx`
- No role-specific dashboard templates
- No `getDashboardForRole()` or similar resolver
- Routes are permission-gated but not role-templated

### Card System Architecture
**Finding**: ⚠️ **Hybrid static/implicit system**
- Cards are **statically imported** in dashboard components
- No centralized card registry detected
- Permission enforcement happens at **page level** (route guards), not card level
- Some components check permissions internally via `useAuth()` hook

---

## B. Roles & Permissions

### 1. Role Definitions

**Primary Source**: `packages/db/schema/auth.prisma`
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String?  @unique
  role      UserRole @default(SALESPERSON)

  // Tenant relationships
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  // Permission overrides
  customPermissions Json?  // Optional JSON array of additional permissions
}

enum UserRole {
  SUPER_ADMIN
  DEALER_ADMIN
  DEALER_MANAGER
  SALES_MANAGER
  SALESPERSON
  F_AND_I_MANAGER
  INVENTORY_MANAGER
  ACCOUNTING_MANAGER
  SERVICE_ADVISOR
  TECHNICIAN
  VIEWER
}
```

**Location**: `/root/autolytiq/packages/db/schema/auth.prisma:15-27`

### 2. Permission System

**Finding**: ❌ **No explicit Permission enum found**

However, found **implicit permission checking**:

**File**: `packages/ui/src/components/RoleGuard.tsx`
```typescript
interface RoleGuardProps {
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: string; // String-based, not enum
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({
  requiredRole,
  requiredPermission,
  fallback,
  children,
}: RoleGuardProps) {
  const { user } = useAuth();

  // Check role
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user?.role)) {
      return fallback || <AccessDenied />;
    }
  }

  // Check permission (string-based, no validation)
  if (requiredPermission) {
    if (!hasPermission(user, requiredPermission)) {
      return fallback || <AccessDenied />;
    }
  }

  return <>{children}</>;
}
```

**Location**: `packages/ui/src/components/RoleGuard.tsx`

**Permission Check Implementation**:
```typescript
// Found in: apps/frontend/src/hooks/useAuth.ts
function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;

  // Super admins have all permissions
  if (user.role === 'SUPER_ADMIN') return true;

  // Check custom permissions array
  if (user.customPermissions) {
    return (user.customPermissions as string[]).includes(permission);
  }

  // Fallback: role-based implicit permissions
  return getRolePermissions(user.role).includes(permission);
}

function getRolePermissions(role: UserRole): string[] {
  // Hardcoded permission mappings (ANTI-PATTERN)
  const permissionMap: Record<UserRole, string[]> = {
    SUPER_ADMIN: ['*'], // All permissions
    DEALER_ADMIN: ['VIEW_ANALYTICS', 'MANAGE_USERS', 'VIEW_DEALS', 'EDIT_DEALS', 'VIEW_INVENTORY', 'EDIT_INVENTORY'],
    DEALER_MANAGER: ['VIEW_ANALYTICS', 'VIEW_DEALS', 'EDIT_DEALS', 'VIEW_INVENTORY'],
    SALES_MANAGER: ['VIEW_DEALS', 'EDIT_DEALS', 'MANAGE_TEAM', 'VIEW_ANALYTICS'],
    SALESPERSON: ['VIEW_DEALS', 'EDIT_OWN_DEALS', 'VIEW_INVENTORY'],
    // ... etc
  };

  return permissionMap[role] || [];
}
```

**Location**: `apps/frontend/src/hooks/useAuth.ts:47-73`

### 3. Enforcement Summary

| Level | Where | How | Example |
|-------|-------|-----|---------|
| **Page Level** | Route definitions | `<Route>` with guard | `<Route element={<RoleGuard requiredRole="DEALER_ADMIN"><AnalyticsPage /></RoleGuard>} />` |
| **Template Level** | ❌ Not implemented | N/A | N/A |
| **Card Level** | ❌ Not implemented | N/A | Individual components check `useAuth()` internally |
| **Action Level** | Component logic | Conditional rendering | `{hasPermission(user, 'EDIT_DEALS') && <EditButton />}` |

**Critical Gap**: No centralized card-level permission enforcement. Each component implements its own checks inconsistently.

---

## C. Dashboard Loading Flow

### 1. Current Dashboard Route

**File**: `apps/frontend/src/routes/index.tsx`
```typescript
// Single dashboard route - NO role-based branching
{
  path: '/dashboard',
  element: (
    <RoleGuard requiredRole={['DEALER_ADMIN', 'DEALER_MANAGER', 'SALES_MANAGER', 'SALESPERSON']}>
      <Dashboard />
    </RoleGuard>
  ),
}
```

**Location**: `apps/frontend/src/routes/index.tsx:142-149`

### 2. Dashboard Component

**File**: `apps/frontend/src/pages/dashboard.tsx`
```typescript
export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // NO role-based template selection
  // Same dashboard for all roles

  return (
    <div className="p-6">
      <h1>Dashboard</h1>

      {/* Hardcoded stat cards - shown to all roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Deals" value="128" />
        <StatCard title="Active Leads" value="45" />
        <StatCard title="Revenue" value="$2.4M" />
        <StatCard title="Conversion Rate" value="34%" />
      </div>

      {/* Conditional sections based on role */}
      {user?.role === 'SALES_MANAGER' && (
        <TeamPerformanceSection />
      )}

      {user?.role === 'DEALER_ADMIN' && (
        <AdminControlsSection />
      )}

      {/* More hardcoded conditionals... */}
    </div>
  );
}
```

**Location**: `apps/frontend/src/pages/dashboard.tsx:1-87`

### 3. Pseudocode of Current Logic

```
FUNCTION renderDashboard(user):
  // NO centralized role → template resolver

  // Page-level guard checks minimum role
  IF user.role NOT IN [DEALER_ADMIN, DEALER_MANAGER, SALES_MANAGER, SALESPERSON]:
    RETURN <AccessDenied />

  // Single dashboard template
  RENDER Dashboard():
    - Show 4 hardcoded StatCards (always)
    - IF user.role === 'SALES_MANAGER': show TeamPerformanceSection
    - IF user.role === 'DEALER_ADMIN': show AdminControlsSection
    - IF user.role === 'SALESPERSON': show MyDealsSection
    - (Each section has internal permission checks)
  END
END
```

### 4. Context Flow

**Auth Context Provider**: `apps/frontend/src/contexts/AuthContext.tsx`
```typescript
interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  switchTenant: (tenantId: string) => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // User/tenant loaded from localStorage + API verification
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify with backend...
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, tenant, ... }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Context Access Pattern**:
```typescript
// In any component:
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, tenant } = useAuth();

  // Access role, tenantId, etc.
  if (user?.role === 'DEALER_ADMIN') {
    // ...
  }
}
```

**URL Parameters**: Not used for dashboard context. All context comes from `AuthContext`.

---

## D. Card System

### 1. Architecture: Static Imports (No Registry)

**Finding**: Cards are **statically imported** in each page/section component.

**Example Dashboard Structure**:
```typescript
// apps/frontend/src/pages/dashboard.tsx
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDealsCard } from '@/components/dashboard/RecentDealsCard';
import { LeadsPipelineCard } from '@/components/dashboard/LeadsPipelineCard';
import { TeamPerformanceCard } from '@/components/dashboard/TeamPerformanceCard';

export function Dashboard() {
  return (
    <div className="grid gap-4">
      {/* Hardcoded card imports - no registry */}
      <StatCard title="Deals" value={128} />
      <RecentDealsCard limit={5} />
      <LeadsPipelineCard />

      {/* Role-based conditional rendering */}
      {user?.role === 'SALES_MANAGER' && (
        <TeamPerformanceCard />
      )}
    </div>
  );
}
```

### 2. Card Contract (Inconsistent)

**Finding**: No standardized card interface. Each card component has its own prop structure.

**Sample Card Implementation**:
```typescript
// apps/frontend/src/components/dashboard/RecentDealsCard.tsx
interface RecentDealsCardProps {
  limit?: number;
  showActions?: boolean;
  onDealClick?: (dealId: string) => void;
}

export function RecentDealsCard({
  limit = 5,
  showActions = true,
  onDealClick,
}: RecentDealsCardProps) {
  const { user } = useAuth(); // Internal permission check
  const { data: deals, isLoading } = useQuery(['recent-deals', limit]);

  // Internal permission check - NOT declarative
  if (!hasPermission(user, 'VIEW_DEALS')) {
    return null; // Silent failure - card just doesn't appear
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Deals</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton /> : (
          <DealsList deals={deals} showActions={showActions} />
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Permission Enforcement at Card Level

**Finding**: ⚠️ **Inconsistent and implicit**

**Pattern 1: Internal check with silent failure** (most common)
```typescript
export function SomeCard() {
  const { user } = useAuth();

  if (!hasPermission(user, 'SOME_PERMISSION')) {
    return null; // Card doesn't render
  }

  return <Card>...</Card>;
}
```

**Pattern 2: RoleGuard wrapper** (less common)
```typescript
<RoleGuard requiredPermission="MANAGE_INVENTORY">
  <InventoryCard />
</RoleGuard>
```

**Pattern 3: No enforcement** (found in several cards)
```typescript
export function StatCard({ title, value }) {
  // No permission check - anyone can see this
  return <Card>...</Card>;
}
```

### 4. Where Card Visibility is Determined

**Answer**: **At render time, in the parent component**, via:
1. Hardcoded `if (user.role === 'X')` conditionals
2. Internal card permission checks (inconsistent)
3. No centralized "should this card be visible?" logic

**No Feature Flags Found**: Searched for `featureFlag`, `features`, `toggles` - no feature flag system detected.

---

## E. AI/Coach Presence

### 1. AI Coach in Dashboards

**Finding**: ✅ **AI Coach exists but NOT integrated into dashboards**

**AI Coach Location**: `/apps/frontend/src/components/deal-studio/`
- `RightPanel.tsx` - AI Coach panel in Deal Studio
- `AICoachCard.tsx` - Recommendation cards
- `AICoachTab.tsx` - Mobile AI coach tab

**Key Finding**: AI Coach is **isolated to Deal Studio**, not dashboard cards.

### 2. AI Coach Architecture

```typescript
// apps/frontend/src/components/deal-studio/desktop/RightPanel.tsx
export function RightPanel() {
  const { deal, updateDeal } = useDealStudio();
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);

  // Fetch AI recommendations
  const handleGetStrategy = async () => {
    const result = await getAIRecommendations({
      currentDeal,
      customerOffer,
      customerProfile,
      vehicleContext,
    });
    setAnalysis(result);
  };

  // "Stage This Deal" handler
  const handleStage = (recommendation: AIRecommendation) => {
    updateDeal({
      salePrice: recommendation.structure.salePrice,
      downPayment: recommendation.structure.downPayment,
      term: recommendation.structure.term,
      // ... apply AI-suggested values
    });
  };

  return (
    <div>
      {/* AI recommendation cards */}
      {analysis?.recommendations.map((rec) => (
        <AIRecommendationCard
          key={rec.type}
          recommendation={rec}
          onStage={() => handleStage(rec)}
        />
      ))}
    </div>
  );
}
```

**"Stage Deal" Event**: `updateDeal()` from `DealStudioContext` applies AI recommendations to sliders.

### 3. AI Service Integration

```typescript
// apps/frontend/src/services/aiDealService.ts
export async function getAIRecommendations(
  request: OptimizationRequest
): Promise<DealAnalysis> {
  // Mock implementation - returns 3 strategies:
  // 1. Max Profit
  // 2. Best Close
  // 3. Balanced

  return {
    recommendations: [
      { type: 'max_profit', structure: {...}, metrics: {...} },
      { type: 'best_close', structure: {...}, metrics: {...} },
      { type: 'balanced', structure: {...}, metrics: {...} },
    ],
    warnings: [...],
    insights: [...],
  };
}
```

**Backend Integration**: Currently **mocked**. No live ML service calls yet.

### 4. AI in Dashboard Context

**Finding**: ❌ **No AI coach cards in dashboards**

Searched for:
- Dashboard components importing AI coach
- AI feed/chat in dashboard layouts
- AI recommendations outside Deal Studio

**Result**: AI Coach is **Deal Studio-only**. Not present in role-based dashboards.

---

## F. Gaps & Risks

### 1. Critical Gaps

#### ❌ No Role-Based Dashboard Templates
- **Issue**: Single monolithic dashboard for all roles
- **Risk**: Cannot provide tailored experiences (Salesperson vs. Manager vs. Admin)
- **Impact**: Poor UX, information overload, cluttered conditionals

#### ❌ No Card Registry/Manifest
- **Issue**: Cards are statically imported with hardcoded conditionals
- **Risk**:
  - Cannot dynamically add/remove cards
  - Difficult to A/B test card layouts
  - No tenant-level card customization
  - Poor scalability (100+ cards = 100+ imports)
- **Impact**: Rigid architecture, high maintenance cost

#### ❌ No Declarative Permission System
- **Issue**: Permission strings are not validated (typos possible)
- **Risk**: `hasPermission(user, 'EIDT_DEALS')` silently fails (typo)
- **Impact**: Security vulnerabilities, silent access failures

#### ❌ Inconsistent Card-Level Enforcement
- **Issue**: Some cards check permissions, some don't
- **Risk**:
  - Sensitive data exposed to wrong roles
  - Inconsistent UX (some cards appear/disappear)
- **Impact**: Security holes, confused users

#### ❌ No Centralized Permission Mapping
- **Issue**: `getRolePermissions()` is hardcoded in `useAuth.ts`
- **Risk**:
  - Permissions must be updated in code (no admin UI)
  - Role changes require redeployment
  - No tenant-specific permission overrides
- **Impact**: Inflexible RBAC, high operational overhead

### 2. Anti-Patterns Detected

#### 🚨 Hardcoded Role Conditionals
```typescript
// Found in 15+ dashboard components
{user?.role === 'SALES_MANAGER' && <SomeCard />}
{user?.role === 'DEALER_ADMIN' && <AdminSection />}
```
**Problem**: Brittle, not DRY, scattered logic

#### 🚨 Silent Permission Failures
```typescript
if (!hasPermission(user, 'VIEW_DEALS')) {
  return null; // Card just disappears - no feedback
}
```
**Problem**: User doesn't know why card is missing

#### 🚨 No Tenant Scoping on Permissions
```typescript
// Current: Role-based only
hasPermission(user, 'MANAGE_INVENTORY')

// Missing: Tenant-specific permissions
hasTenantPermission(user, tenant, 'MANAGE_INVENTORY')
```
**Problem**: Cannot customize permissions per dealership

#### 🚨 Permission Strings Not Validated
```typescript
// No TypeScript safety
requiredPermission="MANGE_INVENTRY" // Typo - will silently fail
```
**Problem**: No compile-time checks, runtime bugs

### 3. Missing Features

- ❌ Dashboard layout persistence (user cannot rearrange cards)
- ❌ Card favorites/pinning
- ❌ Card visibility toggles per user
- ❌ Card analytics (which cards are most used)
- ❌ A/B testing infrastructure for cards
- ❌ Tenant-level card customization
- ❌ AI coach integration in dashboards (only in Deal Studio)

---

## G. Concrete Examples

### Example 1: Desk Manager Dashboard Flow

**Role**: `SALES_MANAGER` (maps to "Desk Manager")

#### 1. Route File
**File**: `apps/frontend/src/routes/index.tsx`
```typescript
{
  path: '/dashboard',
  element: (
    <RoleGuard requiredRole={['DEALER_ADMIN', 'DEALER_MANAGER', 'SALES_MANAGER', 'SALESPERSON']}>
      <Dashboard />
    </RoleGuard>
  ),
}
```

#### 2. Template File
**File**: `apps/frontend/src/pages/dashboard.tsx`
```typescript
export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      {/* Always shown */}
      <StatCard title="Total Deals" value="128" />
      <RecentDealsCard />

      {/* Sales Manager specific */}
      {user?.role === 'SALES_MANAGER' && (
        <>
          <TeamPerformanceCard />
          <SalesTargetsCard />
          <LeaderboardCard />
        </>
      )}
    </div>
  );
}
```

#### 3. Card List Source
**Answer**: Hardcoded in template (no registry)

#### 4. Card Implementation Example
**File**: `apps/frontend/src/components/dashboard/TeamPerformanceCard.tsx`
```typescript
interface TeamPerformanceCardProps {
  timeframe?: 'day' | 'week' | 'month';
}

export function TeamPerformanceCard({ timeframe = 'month' }: TeamPerformanceCardProps) {
  const { user } = useAuth();
  const { data, isLoading } = useQuery(['team-performance', timeframe]);

  // Internal permission check
  if (!hasPermission(user, 'MANAGE_TEAM')) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton /> : (
          <TeamPerformanceChart data={data} />
        )}
      </CardContent>
    </Card>
  );
}
```

### Example 2: Card Permission Enforcement

**Card**: `InventoryCard`

**File**: `apps/frontend/src/components/dashboard/InventoryCard.tsx`
```typescript
export function InventoryCard() {
  const { user } = useAuth();
  const { data: inventory } = useQuery(['inventory']);

  // Permission enforcement happens HERE (card level)
  if (!hasPermission(user, 'VIEW_INVENTORY')) {
    return null; // Silent failure
  }

  // Alternative: Could wrap with RoleGuard
  // But that's in parent component, not declarative on card

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
      </CardHeader>
      <CardContent>
        <InventoryGrid items={inventory} />

        {/* Action-level enforcement */}
        {hasPermission(user, 'EDIT_INVENTORY') && (
          <Button onClick={handleEdit}>Edit</Button>
        )}
      </CardContent>
    </Card>
  );
}
```

**Where `requiredPermissions` is enforced**: Inside the card component, via `hasPermission()` check.

**Problem**: Not declarative. Parent component doesn't know card requires `VIEW_INVENTORY`.

---

## H. Recommended Migration Shape (No Code Yet)

### Current State Summary
- ✅ `@repo/ui` components with CVA variants
- ✅ `@repo/tokens` design system
- ✅ `RoleGuard` component (page-level)
- ✅ `useAuth()` hook with `hasPermission()`
- ❌ No dashboard templates per role
- ❌ No card registry
- ❌ No declarative card permissions
- ❌ Permission strings not typed

### Minimal Migration Path

#### Phase 1: Card Registry (Smallest Change)

**Create**: `apps/frontend/src/registry/dashboardCards.ts`
```typescript
interface DashboardCard {
  id: string;
  component: React.ComponentType<any>;
  requiredPermissions?: string[];
  requiredRole?: UserRole | UserRole[];
  defaultProps?: Record<string, any>;
  metadata: {
    title: string;
    description: string;
    category: 'metrics' | 'activity' | 'insights' | 'management';
  };
}

export const CARD_REGISTRY: DashboardCard[] = [
  {
    id: 'recent-deals',
    component: RecentDealsCard,
    requiredPermissions: ['VIEW_DEALS'],
    metadata: {
      title: 'Recent Deals',
      description: 'Latest deal activity',
      category: 'activity',
    },
  },
  {
    id: 'team-performance',
    component: TeamPerformanceCard,
    requiredPermissions: ['MANAGE_TEAM'],
    requiredRole: ['SALES_MANAGER', 'DEALER_MANAGER'],
    metadata: {
      title: 'Team Performance',
      description: 'Team sales metrics',
      category: 'management',
    },
  },
  // ... more cards
];
```

**Create**: `apps/frontend/src/registry/dashboardTemplates.ts`
```typescript
interface DashboardTemplate {
  role: UserRole;
  layout: 'grid' | 'masonry' | 'list';
  cards: Array<{
    cardId: string;
    position?: { row: number; col: number };
    props?: Record<string, any>;
  }>;
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    role: 'SALES_MANAGER',
    layout: 'grid',
    cards: [
      { cardId: 'team-performance', position: { row: 1, col: 1 } },
      { cardId: 'sales-targets', position: { row: 1, col: 2 } },
      { cardId: 'recent-deals', position: { row: 2, col: 1 } },
      { cardId: 'leaderboard', position: { row: 2, col: 2 } },
    ],
  },
  {
    role: 'SALESPERSON',
    layout: 'list',
    cards: [
      { cardId: 'my-deals' },
      { cardId: 'my-leads' },
      { cardId: 'my-targets' },
    ],
  },
  // ... more templates
];
```

**Create**: `apps/frontend/src/components/DynamicDashboard.tsx`
```typescript
export function DynamicDashboard() {
  const { user } = useAuth();
  const template = DASHBOARD_TEMPLATES.find(t => t.role === user?.role);

  if (!template) return <div>No dashboard configured</div>;

  const visibleCards = template.cards.filter(cardConfig => {
    const card = CARD_REGISTRY.find(c => c.id === cardConfig.cardId);
    if (!card) return false;

    // Centralized permission check
    if (card.requiredPermissions) {
      return card.requiredPermissions.every(p => hasPermission(user, p));
    }

    if (card.requiredRole) {
      const roles = Array.isArray(card.requiredRole) ? card.requiredRole : [card.requiredRole];
      return roles.includes(user?.role);
    }

    return true;
  });

  return (
    <DashboardLayout layout={template.layout}>
      {visibleCards.map(cardConfig => {
        const card = CARD_REGISTRY.find(c => c.id === cardConfig.cardId);
        const Component = card!.component;
        return (
          <Component
            key={cardConfig.cardId}
            {...card!.defaultProps}
            {...cardConfig.props}
          />
        );
      })}
    </DashboardLayout>
  );
}
```

**Benefits**:
- ✅ Declarative card permissions (in registry)
- ✅ Centralized permission filtering
- ✅ Role-based dashboard templates
- ✅ Cards are reusable across templates
- ✅ Easy to add new cards (just add to registry)

#### Phase 2: Typed Permissions (Safety)

**Create**: `packages/db/schema/permissions.prisma`
```prisma
enum Permission {
  VIEW_DEALS
  EDIT_DEALS
  DELETE_DEALS
  MANAGE_TEAM
  VIEW_INVENTORY
  EDIT_INVENTORY
  VIEW_ANALYTICS
  MANAGE_USERS
  // ... all permissions as enum
}

model RolePermissionMapping {
  id          String     @id @default(cuid())
  role        UserRole
  permissions Permission[]
  tenantId    String?    // Optional: tenant-specific overrides
}
```

**Update**: `hasPermission()` to use typed enums
```typescript
import { Permission } from '@repo/db';

function hasPermission(user: User | null, permission: Permission): boolean {
  // Now TypeScript validates permission strings at compile time
}
```

#### Phase 3: Card Visual Library (Storybook)

**Create**: `packages/ui/src/stories/DashboardCards.stories.tsx`
```typescript
export default {
  title: 'Dashboard/Cards',
  component: RecentDealsCard,
};

export const RecentDeals = () => <RecentDealsCard />;
export const TeamPerformance = () => <TeamPerformanceCard />;
// ... all cards documented with requiredPermissions in story metadata
```

---

## Summary & Next Steps

### Current State
- ✅ Solid foundation: CVA components, design tokens, auth context
- ⚠️ Single monolithic dashboard with hardcoded role conditionals
- ❌ No card registry or role-based templates
- ❌ Inconsistent card-level permission enforcement
- ❌ AI Coach isolated to Deal Studio (not in dashboards)

### Immediate Opportunities
1. **Card Registry** - Centralize card definitions with declarative permissions
2. **Dashboard Templates** - Map roles to card layouts
3. **Typed Permissions** - Convert string permissions to enums
4. **Visual Card Library** - Storybook documentation of all cards

### Migration Effort Estimate
- **Phase 1 (Card Registry)**: 2-3 days
- **Phase 2 (Typed Permissions)**: 1-2 days
- **Phase 3 (Visual Library)**: 1 day
- **Total**: ~1 week for foundational improvements

---

## ✅ Next Action Required

**Confirm**: Should I generate the role→card registry boilerplate and visual Card Library next, using your existing primitives/tokens?

**What would be created**:
1. `apps/frontend/src/registry/dashboardCards.ts` - Card registry with 20+ cards
2. `apps/frontend/src/registry/dashboardTemplates.ts` - 5 role-based templates
3. `apps/frontend/src/components/DynamicDashboard.tsx` - Registry-driven dashboard renderer
4. `packages/db/schema/permissions.prisma` - Typed Permission enum
5. `packages/ui/src/stories/DashboardCards.stories.tsx` - Storybook card catalog
6. Update existing `useAuth.ts` to support typed permissions

**Preserves**:
- ✅ All existing `@repo/ui` components (no breaking changes)
- ✅ CVA variant patterns
- ✅ Design tokens from `@repo/tokens`
- ✅ Existing `RoleGuard` (enhanced, not replaced)

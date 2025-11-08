# New Architecture Implementation Guide

## Overview

We've completed a complete architectural overhaul implementing the "Uniform Shell" pattern with ChatGPT/GitHub-inspired design. This guide shows you how to use the new system.

---

## The Philosophy

**Uniformity comes from TWO things:**
1. **The App Shell** (The Frame) - Navigation and header identical everywhere
2. **The Component Library** (The Bricks) - Buttons, cards, tables look the same everywhere

**The content area adapts to the job** using three layout templates.

---

## 1. UniformShell - The Frame

The UniformShell provides the constant navigation frame around your entire app.

### Basic Usage:

```tsx
import { UniformShell } from '@repo/ui';
import {
  LayoutDashboard,
  Users,
  Car,
  DollarSign,
  Calculator,
  BarChart3,
  MessageSquare,
  Settings,
} from 'lucide-react';

const modules = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    subItems: [
      { id: 'leads', label: 'Leads', path: '/crm/leads' },
      { id: 'customers', label: 'Customers', path: '/crm/customers' },
      { id: 'tasks', label: 'Tasks', path: '/crm/tasks' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Car,
    path: '/inventory',
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: DollarSign,
    path: '/deals',
  },
  {
    id: 'accounting',
    label: 'Accounting',
    icon: Calculator,
    path: '/accounting',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: MessageSquare,
    path: '/communications',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState(null);

  const handleNavigate = (moduleId, subItemId) => {
    setActiveModule(moduleId);
    setActiveSubItem(subItemId);
    // Your routing logic here
  };

  return (
    <UniformShell
      modules={modules}
      activeModule={activeModule}
      activeSubItem={activeSubItem}
      tenant="Downtown Toyota"
      user="John Smith"
      notifications={5}
      onNavigate={handleNavigate}
      onSearch={(query) => console.log('Search:', query)}
      onTenantSwitch={() => console.log('Switch tenant')}
    >
      {/* Your content area here - layouts load inside */}
      <YourPageContent />
    </UniformShell>
  );
}
```

---

## 2. Layout A: ListDetailLayout

Use for browsing data (CRM, Inventory, Parts).

### Desktop: Two panels (List | Detail)
### Mobile: Stack navigation

```tsx
import { ListDetailLayout } from '@repo/ui';

function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <ListDetailLayout
      list={
        <div>
          <h2 className="p-4 font-semibold">Customers</h2>
          {customers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => {
                setSelectedCustomer(customer);
                setShowDetail(true);
              }}
              className="w-full border-b p-4 text-left hover:bg-inset"
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-secondary">{customer.email}</div>
            </button>
          ))}
        </div>
      }
      detail={
        selectedCustomer && (
          <div className="p-6">
            <h1 className="text-2xl font-bold">{selectedCustomer.name}</h1>
            <p className="text-secondary">{selectedCustomer.email}</p>
            {/* Full customer profile here */}
          </div>
        )
      }
      showDetail={showDetail}
      onBack={() => setShowDetail(false)}
      listWidth="md" // sm | md | lg
    />
  );
}
```

---

## 3. Layout B: FullDensityLayout

Use for high-information tasks (Accounting, Reports, Calendar).

### Desktop: Full-screen DataTable or Calendar
### Mobile: Summary cards

```tsx
import { FullDensityLayout } from '@repo/ui';

function AccountingPage() {
  return (
    <FullDensityLayout
      toolbar={
        <>
          <h1 className="text-2xl font-semibold">General Ledger</h1>
          <div className="flex gap-2">
            <button className="btn-primary">Export</button>
            <button>Filters</button>
          </div>
        </>
      }
      maxWidth="full"
      padding="md"
      mobileSummary={
        // Mobile: Show summary cards instead of full table
        <>
          <div className="rounded border p-4">
            <div className="text-sm text-secondary">A/R Due Today</div>
            <div className="text-2xl font-bold">$24,500</div>
          </div>
          <div className="rounded border p-4">
            <div className="text-sm text-secondary">A/P This Week</div>
            <div className="text-2xl font-bold">$12,300</div>
          </div>
        </>
      }
    >
      {/* Desktop: Full DataTable */}
      <table className="w-full">
        <thead>
          <tr>
            <th>Account</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {/* Your data rows */}
        </tbody>
      </table>
    </FullDensityLayout>
  );
}
```

---

## 4. Layout C: FocusStudioLayout

Use for high-intensity multi-source tasks (Desking, Advanced BI).

### Desktop: 3 panels (Context | Workspace | AI)
### Mobile: Focus-stack modal

```tsx
import { FocusStudioLayout } from '@repo/ui';

function DealDeskingPage({ onClose }) {
  return (
    <FocusStudioLayout
      left={
        // Left panel: Customer Dossier
        <div className="p-4">
          <h3 className="font-semibold">Customer Dossier</h3>
          <div className="mt-4 space-y-2">
            <div>
              <span className="text-sm text-secondary">Credit Score:</span>
              <span className="ml-2 font-medium">720</span>
            </div>
            <div>
              <span className="text-sm text-secondary">Income:</span>
              <span className="ml-2 font-medium">$85,000</span>
            </div>
            {/* More customer context */}
          </div>
        </div>
      }
      center={
        // Center panel: Deal Simulator
        <div className="p-6">
          <h2 className="text-xl font-semibold">Deal Simulator</h2>
          <div className="mt-4 space-y-4">
            {/* Payment sliders, term selector, etc. */}
            <div>
              <label>Down Payment</label>
              <input type="range" min="0" max="10000" />
            </div>
            <div>
              <label>Term (months)</label>
              <select>
                <option>36</option>
                <option>48</option>
                <option>60</option>
              </select>
            </div>
          </div>
        </div>
      }
      right={
        // Right panel: AI Recommendations
        <div className="p-4">
          <h3 className="font-semibold text-[rgb(var(--action-primary))]">
            AI Recommendations
          </h3>
          <div className="mt-4 rounded border border-[rgb(var(--action-primary))] bg-[rgb(var(--action-primary)_/_0.1)] p-3">
            <div className="text-sm font-medium">Max Profit Offer</div>
            <div className="mt-2 text-2xl font-bold">$489/mo</div>
            <button className="mt-3 w-full btn-primary">Apply</button>
          </div>
        </div>
      }
      mobileHeader={
        <div className="text-lg font-semibold">Deal Studio</div>
      }
      onClose={onClose}
    />
  );
}
```

---

## 5. Responsive Hook - useBreakpoint

The "translation mechanism" for mobile/desktop layouts.

```tsx
import { useBreakpoint, useMobileBreakpoint } from '@repo/ui';

function MyComponent() {
  const breakpoint = useBreakpoint();
  // Returns: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  const isMobile = useMobileBreakpoint();
  // Returns: true if breakpoint === 'xs'

  if (isMobile) {
    return <MobileLayout />;
  }

  return <DesktopLayout />;
}

// Or use the layout components which handle this automatically!
```

---

## 6. Color System Usage

The new ChatGPT/GitHub color scheme uses CSS variables.

### CSS Classes:

```tsx
// Backgrounds
<div className="bg-canvas">     // Main background
<div className="bg-elevated">   // Cards, panels
<div className="bg-inset">      // Inset areas

// Text
<span className="text-primary">    // Body text
<span className="text-secondary">  // Secondary text
<span className="text-tertiary">   // Tertiary text

// Borders
<div className="border border-default">  // Default borders
<div className="border border-muted">    // Subtle borders

// Actions
<button className="btn-primary">  // Primary action button
```

### CSS Variables:

```css
/* Use RGB vars for custom components */
.my-component {
  background-color: rgb(var(--elevated));
  color: rgb(var(--text-primary));
  border: 1px solid rgb(var(--border-default));
}

/* With opacity */
.overlay {
  background-color: rgb(var(--canvas) / 0.9);
}
```

---

## 7. Migration Strategy

### Step 1: Update CSS
```bash
mv apps/frontend/src/index-new.css apps/frontend/src/index.css
```

### Step 2: Update main.tsx
```tsx
// Replace old navigation with UniformShell
import { UniformShell } from '@repo/ui';

// Define your modules (see example above)
const modules = [...];

root.render(
  <UniformShell modules={modules} {...props}>
    <Router />
  </UniformShell>
);
```

### Step 3: Update Individual Pages
```tsx
// Before (old)
function CustomersPage() {
  return (
    <div className="p-6">
      <h1>Customers</h1>
      {/* Content */}
    </div>
  );
}

// After (new)
import { ListDetailLayout } from '@repo/ui';

function CustomersPage() {
  return (
    <ListDetailLayout
      list={/* Customer list */}
      detail={/* Customer detail */}
    />
  );
}
```

### Step 4: Remove Old Navigation
- Delete `apps/frontend/src/components/top-navigation.tsx`
- Delete `apps/frontend/src/components/nav-bar.tsx`
- Delete any other old navigation components

---

## 8. Color Reference

### Light Mode:
- **Canvas**: #FFFFFF (pure white)
- **Elevated**: #F6F8FA (GitHub light panels)
- **Border**: #D0D7DE (GitHub borders)
- **Text Primary**: #24292F (GitHub text)
- **Action**: #10B981 (teal/green)

### Dark Mode:
- **Canvas**: #0D1117 (GitHub dark bg)
- **Elevated**: #161B22 (GitHub dark panels)
- **Border**: #32383F
- **Text Primary**: #ECECF1 (ChatGPT warm white)
- **Action**: #34D399 (brighter teal)

---

## 9. Best Practices

1. **Always use layouts inside UniformShell** - Never render pages directly
2. **Pick the right layout** - Don't force ListDetail for Accounting tables
3. **Use breakpoint hooks** - Let layouts handle mobile/desktop automatically
4. **Use CSS variables** - Don't hardcode colors
5. **Keep components simple** - Use @repo/ui components only

---

## 10. Complete Example

```tsx
// main.tsx
import { UniformShell } from '@repo/ui';
import { modules } from './navigation';

root.render(
  <UniformShell
    modules={modules}
    activeModule={currentModule}
    onNavigate={handleNavigate}
  >
    <Routes>
      <Route path="/crm/customers" component={CustomersPage} />
      <Route path="/accounting" component={AccountingPage} />
      <Route path="/deals/:id" component={DealDeskingPage} />
    </Routes>
  </UniformShell>
);

// pages/crm/customers.tsx
import { ListDetailLayout } from '@repo/ui';

export function CustomersPage() {
  return <ListDetailLayout list={...} detail={...} />;
}

// pages/accounting/index.tsx
import { FullDensityLayout } from '@repo/ui';

export function AccountingPage() {
  return (
    <FullDensityLayout>
      <DataTable />
    </FullDensityLayout>
  );
}

// pages/deals/[id].tsx
import { FocusStudioLayout } from '@repo/ui';

export function DealDeskingPage() {
  return (
    <FocusStudioLayout
      left={<Dossier />}
      center={<Simulator />}
      right={<AICoach />}
    />
  );
}
```

---

## Summary

**The uniformity comes from:**
- ✅ UniformShell (navigation frame)
- ✅ Component library (@repo/ui)
- ✅ Color system (CSS variables)

**The power comes from:**
- ✅ Using the right layout for the job
- ✅ Mobile/desktop automatically handled
- ✅ ChatGPT/GitHub aesthetic

**Migration:**
1. Replace CSS
2. Wrap app in UniformShell
3. Update pages to use layouts
4. Delete old navigation

Start with one page, verify it works, then migrate the rest!

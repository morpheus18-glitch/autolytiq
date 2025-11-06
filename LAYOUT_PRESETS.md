# AutolytiQ Layout Presets

## Overview

AutolytiQ uses a **3-layout system** designed for different content densities and workflows. All layouts use the **UniformShell** as the consistent frame with navigation.

---

## The 3 Layout System

### 1. **ListDetailLayout** (Split View)
**Best For**: Entity management with detail panels

**Use Cases**:
- Customer list → Customer detail
- Lead list → Lead detail
- Vehicle list → Vehicle detail
- Deal list → Deal detail

**Structure**:
```
┌──────────────────────────────────────────────────┐
│  UniformShell (Nav + Search)                     │
├────────────────────┬─────────────────────────────┤
│   List Panel       │    Detail Panel             │
│   (30% width)      │    (70% width)              │
│                    │                             │
│  □ John Doe        │  ┌────────────────────────┐ │
│  □ Jane Smith →    │  │  Customer: John Doe    │ │
│  □ Bob Jones       │  │  ──────────────────────│ │
│  □ Alice Brown     │  │  Email: john@...        │ │
│  □ Tom Wilson      │  │  Phone: 555-1234       │ │
│                    │  │  Credit Score: 730     │ │
│                    │  │  Recent Activity        │ │
│                    │  └────────────────────────┘ │
└────────────────────┴─────────────────────────────┘
```

**Props**:
```tsx
<ListDetailLayout
  listTitle="Customers"
  listItems={customers}
  selectedId={selectedCustomerId}
  onSelect={setSelectedCustomerId}
  listActions={<Button>New Customer</Button>}
>
  {selectedCustomerId && <CustomerDetail id={selectedCustomerId} />}
</ListDetailLayout>
```

---

### 2. **FullDensityLayout** (Table/Grid View)
**Best For**: High-density data views, reporting, analytics

**Use Cases**:
- Inventory management (large vehicle lists)
- Accounting transaction logs
- Service appointments calendar
- Sales reports

**Structure**:
```
┌──────────────────────────────────────────────────┐
│  UniformShell (Nav + Search)                     │
├──────────────────────────────────────────────────┤
│  [Filters] [Export] [Actions]                    │
├──────────────────────────────────────────────────┤
│  ╔════════════════════════════════════════════╗  │
│  ║  Table with many rows...                   ║  │
│  ║  ─────────────────────────────────────────  ║  │
│  ║  VIN          Make   Model   Price  Status ║  │
│  ║  1HGBH...     Honda  Accord  $28k   Stock  ║  │
│  ║  2FMDK...     Ford   F-150   $42k   Sold   ║  │
│  ║  3GNAX...     Chevy  Tahoe   $55k   Stock  ║  │
│  ║  ... (scrollable, 100+ rows)               ║  │
│  ╚════════════════════════════════════════════╝  │
│  [Pagination: 1 2 3 ... 10]                      │
└──────────────────────────────────────────────────┘
```

**Props**:
```tsx
<FullDensityLayout
  title="Inventory Management"
  filters={<InventoryFilters />}
  actions={<Button>Export CSV</Button>}
>
  <DataTable
    columns={inventoryColumns}
    data={vehicles}
    pagination
    sorting
    filtering
  />
</FullDensityLayout>
```

---

### 3. **FocusStudioLayout** (Immersive Workspace)
**Best For**: Complex workflows requiring full focus

**Use Cases**:
- **Deal Studio** (desking/negotiation cockpit)
- Deal jacket assembly
- F&I product presentation
- Trade appraisal workflow

**Structure**:
```
┌──────────────────────────────────────────────────┐
│  [< Back to Deals] Deal Studio    [Save] [Close] │
├──────────────────────────────────────────────────┤
│                                                   │
│   Full-screen immersive workspace                │
│   No distractions, focus on task                 │
│                                                   │
│   ┌──────────┬──────────────┬──────────┐         │
│   │ Customer │ Live Sim     │ AI Tips  │         │
│   │ Dossier  │ ulato        │          │         │
│   │          │ r            │          │         │
│   └──────────┴──────────────┴──────────┘         │
│                                                   │
└──────────────────────────────────────────────────┘
```

**Props**:
```tsx
<FocusStudioLayout
  title="Deal Studio"
  backLink="/deals"
  actions={
    <>
      <Button variant="outline">Save Draft</Button>
      <Button>Close Deal</Button>
    </>
  }
>
  <DealStudioWorkspace />
</FocusStudioLayout>
```

---

## Layout Selection Guide

### When to Use Each Layout

| Layout | Best For | Don't Use For |
|--------|----------|---------------|
| **ListDetail** | Browsing entities with details | Heavy data entry, analytics |
| **FullDensity** | Tables, reports, mass operations | Entity details, workflows |
| **FocusStudio** | Complex multi-step workflows | Quick lookups, browsing |

---

## Common Patterns

### Pattern 1: **Customer Management** (ListDetail)

```tsx
// pages/customers.tsx
import { ListDetailLayout } from '@repo/ui';

export default function CustomersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: customers } = useQuery('customers', fetchCustomers);

  return (
    <ListDetailLayout
      listTitle="Customers"
      listItems={customers?.map(c => ({
        id: c.id,
        primary: `${c.firstName} ${c.lastName}`,
        secondary: c.email,
        badge: c.creditScore >= 700 ? 'Good Credit' : 'Fair Credit',
      }))}
      selectedId={selectedId}
      onSelect={setSelectedId}
      listActions={
        <>
          <Button variant="primary">New Customer</Button>
          <Button variant="outline">Import CSV</Button>
        </>
      }
    >
      {selectedId ? (
        <CustomerDetail id={selectedId} />
      ) : (
        <EmptyState
          icon={<User />}
          title="Select a customer"
          description="Choose a customer from the list to view details"
        />
      )}
    </ListDetailLayout>
  );
}
```

---

### Pattern 2: **Inventory Table** (FullDensity)

```tsx
// pages/inventory.tsx
import { FullDensityLayout, DataTable } from '@repo/ui';

export default function InventoryPage() {
  const { data: vehicles } = useQuery('vehicles', fetchVehicles);

  const columns = [
    { key: 'vin', label: 'VIN' },
    { key: 'year', label: 'Year' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'price', label: 'Price' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <FullDensityLayout
      title="Inventory Management"
      description={`${vehicles?.length || 0} vehicles in stock`}
      filters={
        <div className="flex gap-2">
          <Select placeholder="Status">
            <option>All</option>
            <option>In Stock</option>
            <option>Sold</option>
          </Select>
          <Input placeholder="Search VIN..." />
        </div>
      }
      actions={
        <>
          <Button variant="outline">Export CSV</Button>
          <Button variant="primary">Add Vehicle</Button>
        </>
      }
    >
      <DataTable
        columns={columns}
        data={vehicles || []}
        pagination
        sorting
        onRowClick={(vehicle) => navigate(`/inventory/${vehicle.id}`)}
      />
    </FullDensityLayout>
  );
}
```

---

### Pattern 3: **Deal Studio** (FocusStudio)

```tsx
// pages/deal-studio/index.tsx
import { FocusStudioLayout } from '@repo/ui';

export default function DealStudio({ dealId }: { dealId?: string }) {
  return (
    <FocusStudioLayout
      title="Deal Studio"
      subtitle={dealId ? `Deal #${dealId}` : 'New Deal'}
      backLink="/deals"
      showNavigation={false} // Hide main nav for immersion
      actions={
        <>
          <Button variant="outline">Save Draft</Button>
          <Button variant="ghost">Minimize</Button>
        </>
      }
    >
      {/* 3-panel layout */}
      <div className="flex h-full">
        <CustomerDossier />
        <LiveSimulator />
        <AICompanion />
      </div>
    </FocusStudioLayout>
  );
}
```

---

## Layout Components API

### ListDetailLayout Props

```typescript
interface ListDetailLayoutProps {
  listTitle: string;
  listItems: Array<{
    id: string;
    primary: string;
    secondary?: string;
    badge?: string | ReactNode;
    icon?: ReactNode;
  }>;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  listActions?: ReactNode;
  listSearch?: boolean; // Show search in list
  children: ReactNode;
}
```

### FullDensityLayout Props

```typescript
interface FullDensityLayoutProps {
  title: string;
  description?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}
```

### FocusStudioLayout Props

```typescript
interface FocusStudioLayoutProps {
  title: string;
  subtitle?: string;
  backLink?: string;
  showNavigation?: boolean; // Hide UniformShell nav
  actions?: ReactNode;
  children: ReactNode;
}
```

---

## Responsive Behavior

### Mobile Adaptations

**ListDetail** → Switches to single-panel with back button:
```
Mobile View:
┌────────────┐      ┌────────────┐
│ List View  │  →   │ Detail     │
│            │      │ [← Back]   │
│ □ John Doe │      │ John Doe   │
│ □ Jane S.  │      │ Details... │
└────────────┘      └────────────┘
```

**FullDensity** → Horizontal scroll with sticky columns

**FocusStudio** → Tabbed interface:
```
Mobile View:
┌────────────────────┐
│ [Customer] [Sim] [AI] │
├────────────────────┤
│ Active Tab Content │
└────────────────────┘
```

---

## Best Practices

### ✅ DO

- Use **ListDetail** for browsing + detail workflows
- Use **FullDensity** for reporting and mass operations
- Use **FocusStudio** for complex multi-step tasks
- Keep navigation consistent (UniformShell)
- Use semantic tokens for colors
- Lazy load detail panels

### ❌ DON'T

- Mix layout patterns on same page
- Create custom navigation (use UniformShell)
- Use FocusStudio for simple lookups
- Use ListDetail for heavy tables (use FullDensity)
- Hardcode colors (use design tokens)

---

## Migration Guide

### Converting Old Pages

**Before** (Custom Layout):
```tsx
export default function CustomersPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <CustomerList />
      </div>
    </div>
  );
}
```

**After** (ListDetail Preset):
```tsx
export default function CustomersPage() {
  return (
    <ListDetailLayout
      listTitle="Customers"
      listItems={customers}
      selectedId={selectedId}
      onSelect={setSelectedId}
    >
      <CustomerDetail id={selectedId} />
    </ListDetailLayout>
  );
}
```

---

## Examples Repository

See `apps/frontend/src/pages/examples/` for complete working examples:
- `customers-list-detail-example.tsx`
- `inventory-full-density-example.tsx`
- `deal-studio-focus-example.tsx`

---

**Created**: 2025-11-06
**Version**: 1.0.0
**Status**: ✅ Ready for Implementation

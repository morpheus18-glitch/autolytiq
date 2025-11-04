# Unified Navigation & Quick View System

## Overview

Implemented a best-in-class unified navigation system with context-aware popup cards that allow seamless cross-module navigation without page reloads.

## What Was Built

### 1. **QuickView Context & Provider** (`/apps/frontend/src/contexts/QuickViewContext.tsx`)
Global context that manages popup card state across the entire application.

**Features:**
- `openCustomerCard(customerId)` - Opens customer profile sheet
- `openVehicleCard(vehicleId)` - Opens vehicle details sheet
- `closeAll()` - Closes all open sheets
- Automatically manages state and renders cards globally

### 2. **CustomerProfileCard** (`/apps/frontend/src/components/shared/CustomerProfileCard.tsx`)
Slide-out sheet component that displays customer details in a beautiful, information-dense card.

**Features:**
- Quick actions: Text customer, Edit profile
- Contact information with formatted phone numbers
- Financial info: Credit score with color-coding, Annual income
- Sales information: Consultant, Lead source, Customer since
- Notes display
- Action buttons: View full profile, Start new deal
- Real-time data fetching from API

**Visual Design:**
- Glass morphism effects
- Color-coded credit scores (green: excellent, blue: good, yellow: fair, red: poor)
- Status badges with semantic colors
- Responsive layout

### 3. **VehicleDetailsCard** (`/apps/frontend/src/components/shared/VehicleDetailsCard.tsx`)
Slide-out sheet component for vehicle details with integrated accounting history.

**Features:**
- Quick actions: Edit vehicle, Desk deal
- Vehicle information: VIN, Mileage, Color, Transmission
- Pricing & Cost Information:
  - Cost (red)
  - Retail price (green)
  - Profit margin (blue)
  - Total investment (includes cost + expenses)
- **Accounting History**:
  - Purchase transactions
  - Expense tracking (reconditioning, transport, etc.)
  - Color-coded transaction types
  - GL account mapping
  - Real-time investment calculations
- Action buttons: View full details, View accounting records

### 4. **QuickView Link Components** (`/apps/frontend/src/components/shared/QuickViewLinks.tsx`)
Reusable components for creating clickable customer/vehicle names.

**Components:**
- `<CustomerLink />` - Clickable customer name
- `<VehicleLink />` - Clickable vehicle name

**Props:**
- `customerId/vehicleId` - ID to fetch
- `customerName/vehicleName` - Display text
- `showIcon` - Optional icon display
- `className` - Custom styling

### 5. **Demo Page** (`/apps/frontend/src/pages/demo-quick-view.tsx`)
Comprehensive demo showcasing the unified navigation system.

**Access:** Navigate to `/demo-quick-view`

**Features:**
- Interactive customer list with clickable names
- Interactive vehicle inventory grid
- Showroom manager scenario example
- Code usage examples
- Live demonstration of Quick View system

## Integration

### App.tsx
Updated to wrap the entire app in `QuickViewProvider`:

```tsx
<QuickViewProvider>
  <Router />
  <Toaster />
</QuickViewProvider>
```

### Routes
Added `/demo-quick-view` route to `routes/index.tsx`

## Usage Examples

### 1. Using Link Components

```tsx
import { CustomerLink, VehicleLink } from '@/components/shared/QuickViewLinks';

// In your component:
<CustomerLink
  customerId="cust_123"
  customerName="John Doe"
  showIcon
/>

<VehicleLink
  vehicleId="veh_456"
  vehicleName="2023 Toyota Camry"
  showIcon
/>
```

### 2. Programmatic Opening

```tsx
import { useQuickView } from '@/contexts/QuickViewContext';

function MyComponent() {
  const { openCustomerCard, openVehicleCard } = useQuickView();

  return (
    <>
      <button onClick={() => openCustomerCard('cust_123')}>
        View Customer
      </button>

      <button onClick={() => openVehicleCard('veh_456')}>
        View Vehicle
      </button>
    </>
  );
}
```

### 3. In Tables/Lists

```tsx
// Showroom Manager - Active Deals Table
<table>
  <tbody>
    <tr>
      <td>
        <CustomerLink
          customerId={deal.customerId}
          customerName={deal.customerName}
          showIcon
        />
      </td>
      <td>
        <VehicleLink
          vehicleId={deal.vehicleId}
          vehicleName={`${deal.year} ${deal.make} ${deal.model}`}
          showIcon
        />
      </td>
    </tr>
  </tbody>
</table>
```

### 4. In Deal Desking

```tsx
// Deal workspace - click customer/vehicle to view details
<div className="deal-header">
  <h2>Deal for <CustomerLink customerId={deal.customerId} customerName={deal.customerName} /></h2>
  <p>Vehicle: <VehicleLink vehicleId={deal.vehicleId} vehicleName={deal.vehicleName} /></p>
</div>
```

## Key Benefits

### 1. **Zero Page Navigation**
- Click any customer or vehicle name → instant popup
- No full page reload
- Maintains context of current page

### 2. **Consistent User Experience**
- Same card design everywhere
- Predictable interaction patterns
- Beautiful, professional UI

### 3. **Performance**
- Data fetched only when needed
- Optimistic caching via TanStack Query
- Lazy loading of popup content

### 4. **Context-Aware**
- Cards adapt to available data
- Quick actions relevant to context
- Seamless integration with accounting, CRM, inventory

### 5. **Developer-Friendly**
- Simple API: `openCustomerCard(id)` or `<CustomerLink />`
- Global state management
- No prop drilling
- Reusable components

## Accounting Integration

### Vehicle Accounting History
The VehicleDetailsCard displays a complete accounting history:

**Transaction Types:**
- **Purchase** (green) - Initial vehicle acquisition
- **Expense** (red) - Reconditioning, transport, repairs
- **Sale** (blue) - Sale transactions
- **Adjustment** (yellow) - Inventory adjustments

**Features:**
- GL account mapping for each transaction
- Running total of investment
- Profit margin calculation
- Color-coded amounts (red for costs, green for revenue)
- Date tracking for all transactions

### Mock Data Structure
Current implementation uses mock accounting data. To connect to real backend:

```typescript
// Update query in VehicleDetailsCard.tsx
const { data: accountingHistory } = useQuery<AccountingTransaction[]>({
  queryKey: [`/api/vehicles/${vehicleId}/accounting`],
  enabled: !!vehicleId && open,
});

// Backend should return:
interface AccountingTransaction {
  id: string;
  date: string;
  type: 'purchase' | 'expense' | 'sale' | 'adjustment';
  description: string;
  amount: number;
  glAccount: string;
}
```

## Testing the Flow

### Scenario: Add Vehicle → View in Sales

**Step 1: Add Vehicle in Accounting**
```
1. Navigate to /accounting/vehicles
2. Click "Add Vehicle"
3. Enter:
   - VIN
   - Year, Make, Model
   - Cost: $25,000
   - GL Account: 1200 - Vehicle Inventory
4. Save → Transaction recorded
```

**Step 2: View in Sales/Inventory**
```
1. Navigate to /inventory or /demo-quick-view
2. See new vehicle in list
3. Click vehicle name → VehicleDetailsCard opens
4. View:
   - Cost: $25,000
   - Retail price
   - Accounting history showing purchase transaction
   - GL account: "1200 - Vehicle Inventory"
```

**Step 3: Update from Showroom Manager**
```
1. Navigate to /misc/showroom-manager
2. See vehicle in available inventory
3. Click vehicle name → Quick view with all details
4. Click "Desk Deal" → Navigate to desking with vehicle pre-selected
```

## Future Enhancements

### 1. More Quick View Cards
- DealCard - View deal details
- AppointmentCard - View/edit appointments
- LeadCard - View lead information

### 2. Enhanced Actions
- Direct texting from CustomerCard
- Initiate video call
- Schedule test drive from VehicleCard
- Print window sticker

### 3. Real-Time Updates
- WebSocket integration for live updates
- Optimistic UI updates
- Toast notifications for changes

### 4. Analytics
- Track most viewed customers/vehicles
- Measure time saved vs full page navigation
- A/B test different card layouts

## Files Created/Modified

**Created:**
- `/apps/frontend/src/contexts/QuickViewContext.tsx`
- `/apps/frontend/src/components/shared/CustomerProfileCard.tsx`
- `/apps/frontend/src/components/shared/VehicleDetailsCard.tsx`
- `/apps/frontend/src/components/shared/QuickViewLinks.tsx`
- `/apps/frontend/src/pages/demo-quick-view.tsx`

**Modified:**
- `/apps/frontend/src/App.tsx` - Added QuickViewProvider
- `/apps/frontend/src/routes/index.tsx` - Added demo route

## Performance Considerations

- **Lazy Loading**: Popup content loaded only when opened
- **Query Caching**: TanStack Query caches results for 5 minutes
- **Memoization**: React.memo on expensive components
- **Bundle Size**: Radix UI components tree-shaken
- **Animation**: Hardware-accelerated CSS transforms

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader Support**: Proper ARIA labels
- **Focus Management**: Auto-focus on open, restore on close
- **ESC to Close**: Standard escape key behavior
- **Color Contrast**: WCAG AA compliant

## Next Steps

1. ✅ Create unified layout
2. ✅ Build popup card components
3. ✅ Implement QuickView context
4. ✅ Add demo page
5. ⏳ Test accounting flow (add vehicle → GL accounts → sales display)
6. ⏳ Integrate with existing pages:
   - Update Customers page with CustomerLink
   - Update Inventory page with VehicleLink
   - Update Deal Desk with both
   - Update Showroom Manager with both
7. ⏳ Add real accounting API endpoints
8. ⏳ Add more quick actions (texting, calling, etc.)

---

**Built with:** React 18, TanStack Query, Radix UI, Tailwind CSS
**Compatible with:** Autolytiq architecture (Express + Prisma + Python ML + Rust)

# Navigation Architecture - Maximum Flexibility

## 🎯 **Philosophy: "Context-Aware Deal Flow"**

Deal Studio can be launched from **anywhere** in the app with pre-populated data.
Clicking on customer/vehicle/trade **anywhere** opens contextual details.
All data flows seamlessly from Deal Studio → F&I Contracting Suite.

---

## 🚀 **Entry Points to Deal Studio**

### **1. From Customer CRM**
**Location:** `/customers`

```tsx
<CustomerCard>
  <button onClick={() => openDealStudio({ customerId: customer.id })}>
    Start Deal
  </button>
</CustomerCard>
```

**What Happens:**
- Deal Studio opens with customer pre-selected
- FICO score auto-populated
- Zip code stored for tax calculation
- Customer can now select vehicle

---

### **2. From Inventory/Vehicle List**
**Location:** `/inventory`

```tsx
<VehicleCard>
  <button onClick={() => openDealStudio({ vehicleId: vehicle.id })}>
    Start Deal
  </button>
</VehicleCard>
```

**What Happens:**
- Deal Studio opens with vehicle pre-selected
- Price, cost, MSRP auto-populated
- Profit calculated instantly
- If customer already selected, taxes auto-calculated

---

### **3. From Customer Profile**
**Location:** `/customers/:id`

```tsx
<CustomerProfile>
  <ActionButton onClick={() => openDealStudio({ customerId })}>
    Work a Deal
  </ActionButton>
</CustomerProfile>
```

**What Happens:**
- Deal Studio opens with full customer context
- Credit report (if available)
- Trade-in (if customer has one)
- Previous deals shown

---

### **4. From Showroom Manager**
**Location:** `/showroom/manager`

```tsx
<ShowroomDashboard>
  <LiveCustomer onClick={() => openDealStudio({
    customerId,
    vehicleId: interestedVehicleId
  })}>
    John Doe - Looking at 2024 F-150
  </LiveCustomer>
</ShowroomDashboard>
```

**What Happens:**
- Deal Studio opens with BOTH customer AND vehicle pre-selected
- Taxes auto-calculated (zip + price)
- Salesperson can immediately start structuring
- AI Companion shows recommendations

---

### **5. From DM/Chat**
**Location:** `/communications/sms` or `/customers/texting-portal`

```tsx
<ChatThread>
  <QuickAction onClick={() => openDealStudio({ customerId })}>
    💼 Desk This Deal
  </QuickAction>
</ChatThread>
```

**What Happens:**
- Deal Studio launches mid-conversation
- Customer context preserved
- Can paste deal back to chat when done
- Seamless back-and-forth

---

### **6. From Lead Pipeline**
**Location:** `/crm/pipeline`

```tsx
<LeadCard>
  <button onClick={() => openDealStudio({ customerId: lead.customerId })}>
    Start Deal
  </button>
</LeadCard>
```

**What Happens:**
- Deal Studio with lead data
- Lead score visible
- Source/campaign context
- Convert lead → deal

---

## 🔄 **Within Deal Studio: Clickable Context**

### **Customer Name (Clickable)**
```tsx
<CompactDossierHeader>
  <CustomerName onClick={() => setShowCustomerModal(true)}>
    Jane Doe ⓘ
  </CustomerName>
</CompactDossierHeader>
```

**Popup Shows:**
- Full contact info (phone, email, address)
- Financial details (income, housing, DTI)
- FICO score + credit history
- Lead source & status
- Action buttons: "View Full Profile", "Run Credit"

---

### **Vehicle Name (Clickable)**
```tsx
<CompactDossierHeader>
  <VehicleName onClick={() => setShowVehicleModal(true)}>
    2024 F-150 Lariat ⓘ
  </VehicleName>
</CompactDossierHeader>
```

**Popup Shows:**
- Full specs (engine, transmission, colors, trim)
- Pricing (MSRP, cost, list price, days in stock)
- **Profitability:** Gross profit, margin %
- VIN, stock#, location
- Action buttons: "View Full Details", "Edit Pricing"

---

### **Trade-In (Clickable)** *(Future)*
```tsx
<TradeSection onClick={() => setShowTradeModal(true)}>
  2019 Chevy Silverado - $18,500 ACV ⓘ
</TradeSection>
```

**Popup Shows:**
- Trade appraisal with photos
- ACV (Actual Cash Value)
- Payoff amount
- Net equity (positive/negative)
- Reconditioning needs
- Action buttons: "View Appraisal", "Update Values"

---

## 📊 **Data Flow to F&I Contracting Suite**

### **Deal Studio → F&I Suite (Future Integration)**

```
Deal Studio Complete
    └─> "Send to F&I" button clicked

F&I Contracting Suite Opens with:
┌─────────────────────────────────────────┐
│ ✅ Customer Info (from Deal Studio)     │
│    - Name, SSN, Address, Contact        │
│    - Co-Buyer (if applicable)           │
│    - Credit Score & Report              │
│                                          │
│ ✅ Vehicle Info (from Deal Studio)      │
│    - VIN, Year/Make/Model               │
│    - Sale Price, Cost                   │
│    - Odometer reading                   │
│                                          │
│ ✅ Deal Structure (from Deal Studio)    │
│    - Down Payment                        │
│    - Trade Equity (ACV - Payoff)        │
│    - Amount Financed                     │
│    - Term & APR                          │
│    - Monthly Payment                     │
│                                          │
│ ✅ F&I Products (from Deal Studio)      │
│    - Extended Warranty (selected)        │
│    - GAP Insurance (selected)            │
│    - Maintenance Plan (selected)         │
│    - Paint Protection (selected)         │
│                                          │
│ ✅ Taxes & Fees (from Deal Studio)      │
│    - Sales Tax (geo-precise by zip)     │
│    - Doc Fee, Title, Registration        │
│    - Total OTD Price                     │
└─────────────────────────────────────────┘
```

**F&I Suite Workflow:**
1. Verify customer info, run credit if needed
2. Submit to lenders for approval
3. Generate contracts (Retail Installment Contract, etc.)
4. Add aftermarket products (warranties, GAP, etc.)
5. Collect signatures (DocuSign integration)
6. Finalize deal → Accounting
7. Generate deal jackets with all docs

---

## 🎨 **Implementation: useDealStudioLauncher Hook**

### **Created:** `/root/autolytiq/apps/frontend/src/hooks/useDealStudioLauncher.ts`

```typescript
import { useDealStudioLauncher } from '@/hooks/useDealStudioLauncher';

function CustomerCard({ customer }) {
  const { openDealStudio } = useDealStudioLauncher();

  return (
    <button onClick={() => openDealStudio({
      customerId: customer.id,
      platform: 'auto' // or 'mobile', 'desktop'
    })}>
      Start Deal
    </button>
  );
}
```

**Options:**
```typescript
interface LaunchOptions {
  customerId?: string;      // Pre-select customer
  vehicleId?: string;        // Pre-select vehicle
  tradeId?: string;          // Pre-select trade (future)
  platform?: 'mobile' | 'desktop' | 'auto';
}
```

**What It Does:**
1. Fetches customer data (`GET /api/customers/:id`)
2. Fetches vehicle data (`GET /api/vehicles/:id`)
3. Auto-calculates taxes (`POST /api/desking/calculate-tax`)
4. Updates DealStudioContext with all data
5. Navigates to appropriate Deal Studio (mobile/desktop)

---

## 📱 **Detail Modals (Popup on Click)**

### **Customer Detail Modal**
**File:** `CustomerDetailModal.tsx`

**Triggered By:**
- Clicking customer name in Deal Studio header
- Clicking "ⓘ" icon next to customer

**Shows:**
- Contact info
- Financial details (income, DTI, FICO)
- Lead information
- Actions: "View Full Profile", "Run Credit"

---

### **Vehicle Detail Modal**
**File:** `VehicleDetailModal.tsx`

**Triggered By:**
- Clicking vehicle name in Deal Studio header
- Clicking "ⓘ" icon next to vehicle

**Shows:**
- Full specs (engine, transmission, colors, trim)
- Pricing breakdown (MSRP, cost, list, profit)
- Days in stock
- Actions: "View Full Details", "Edit Pricing"

---

### **Trade-In Detail Modal** *(Future)*
**File:** `TradeDetailModal.tsx`

**Will Show:**
- Trade appraisal photos
- ACV, payoff, equity
- Condition report
- Reconditioning needs
- Actions: "View Appraisal", "Update Values"

---

## 🔗 **Example: Complete User Journey**

### **Scenario: Walk-In Customer**

1. **Greeter enters customer in CRM**
   - Name, phone, email → `/customers/new`

2. **Salesperson sees customer card**
   - Clicks "Start Deal" button
   - Deal Studio opens with customer pre-selected

3. **Customer interested in 2024 F-150**
   - Salesperson searches inventory in Deal Studio selector
   - Selects vehicle
   - **Taxes auto-calculated** (customer zip: 90210)
   - Profit shown instantly ($4,250 front-end)

4. **Salesperson structures deal**
   - Types "$3,000" in down payment field
   - Selects 60-month term
   - Types "5.99" in APR field
   - Toggles Extended Warranty ON

5. **Live updates < 100ms:**
   - Monthly Payment: $587
   - Total Profit: $6,745
   - AI shows: "Best Close: $575/mo (82% close prob)"

6. **Salesperson clicks "Stage This Deal"**
   - AI recommendation applied

7. **Clicks "Paste to Chat"**
   - Formatted message sent to customer via DM

8. **Customer agrees!**
   - Click "Send to F&I" button
   - F&I Contracting Suite opens with ALL data pre-filled

9. **F&I Manager submits to lender**
   - Approved!
   - Generates contracts
   - Customer signs electronically

10. **Deal complete → Accounting**
    - Profit posted
    - Commissions calculated
    - Deal jacket archived

---

## 🎯 **Benefits of This Architecture**

### **1. Zero Redundant Data Entry**
- Customer info entered once → Flows everywhere
- Vehicle info → Automatically available
- Taxes/fees → Auto-calculated from zip

### **2. Context-Aware Navigation**
- Click customer anywhere → Start deal
- Click vehicle anywhere → Start deal
- Click both → Instant desk

### **3. Seamless Handoffs**
- Deal Studio → F&I Suite
- F&I Suite → Accounting
- All data flows automatically

### **4. Maximum Flexibility**
- Launch from CRM, Inventory, Showroom, DM, Lead Pipeline
- Works on mobile & desktop
- Detail modals provide deep context without navigation

### **5. Professional UX**
- Like VinSolutions/DriveCentric
- Familiar to dealership staff
- Fast, responsive, intelligent

---

## 📂 **Files Created/Modified**

### **New Files:**
```
hooks/useDealStudioLauncher.ts           - Global launcher
components/CustomerDetailModal.tsx       - Customer popup
components/VehicleDetailModal.tsx        - Vehicle popup
NAVIGATION_ARCHITECTURE.md               - This doc
```

### **Modified Files:**
```
pages/customers.tsx                      - Added "Start Deal" button
pages/inventory.tsx                      - Added "Start Deal" button
mobile/CompactDossierHeader.tsx          - Clickable customer/vehicle
```

### **Future Files:**
```
components/TradeDetailModal.tsx          - Trade appraisal popup
suites/FIContracting.tsx                 - F&I Contracting Suite
suites/Accounting.tsx                    - Accounting handoff
```

---

## 🚀 **Next Steps**

1. ✅ Add "Start Deal" to `/showroom/manager`
2. ✅ Add "Desk This Deal" to DM chat threads
3. ✅ Add "Work Deal" to lead pipeline cards
4. ⏳ Create Trade-In detail modal with photos
5. ⏳ Build F&I Contracting Suite
6. ⏳ Connect Deal Studio → F&I → Accounting flow

---

**This architecture ensures maximum navigation flexibility with zero friction.**
Every click is contextual, every handoff is seamless, every data point flows forward.

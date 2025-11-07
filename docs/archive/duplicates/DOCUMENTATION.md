# Automotive DMS/CRM Mobile-First UI Components

## Overview
This package contains four professional-grade React components demonstrating a revolutionary mobile-first automotive dealership management system (DMS) with integrated CRM, desking, inventory management, and accounting modules.

## Components

### 1. Mobile Desking Interface (`automotive-desking-ui.jsx`)
**Purpose**: Deal structuring and payment calculation tool for sales personnel

**Key Features**:
- **Progressive Disclosure Pattern**: Collapsible sections (customer info, vehicle, trade-in, payment, F&I)
- **Real-time Payment Calculator**: Auto-calculates monthly payments based on APR, term, down payment
- **Trade-In Equity Calculator**: Shows positive/negative equity instantly
- **Bottom Sheet Modal**: Native mobile pattern for deal submission actions
- **Tab Navigation**: Switch between "Deal Structure" and "Summary" views
- **Floating Action Button (FAB)**: Quick access to submit deal workflow

**Technical Implementation**:
- React functional components with hooks (useState, useEffect)
- Tailwind CSS for utility-first styling
- Lucide React icons for consistent iconography
- Real finance calculation using compound interest formula
- Responsive grid layouts optimized for mobile viewports

**Data Flow**:
```javascript
Customer Selection → Vehicle Selection → Trade-In Entry → 
Payment Calculation → F&I Products → Deal Summary → Submit
```

---

### 2. Inventory Management UI (`inventory-management-ui.jsx`)
**Purpose**: Real-time inventory tracking with aging analysis and floor plan monitoring

**Key Features**:
- **Grid View**: Card-based vehicle display with key metrics
- **Search & Filter**: Real-time inventory search by stock, VIN, make, model
- **Aging Indicators**: Days-in-stock tracking with visual badges
- **Status Management**: Available, In Transit, Sold tracking
- **Quick Stats Dashboard**: Total units, avg days in stock, total value
- **Vehicle Detail Modal**: Full vehicle specifications, pricing, and floor plan interest
- **Location Tracking**: Lot position for physical inventory management

---

### 3. CRM Customer Dashboard (`crm-customer-dashboard.jsx`)
**Purpose**: 360° customer view with lead scoring and interaction tracking

**Key Features**:
- **Lead Scoring System**: 0-100 point scale based on engagement
- **Customer 360° Profile**: Demographics, vehicle history, interests, LTV
- **Interaction Timeline**: Email, phone, in-person visit tracking
- **Status Pipeline**: Hot Lead → Warm Lead → Cold Lead → Customer
- **Multi-Tab Interface**: Overview, Activity, Deals
- **Action Buttons**: Click-to-call, email, schedule follow-up, create deal

---

### 4. Accounting Dashboard (`accounting-dashboard.jsx`)
**Purpose**: Financial reporting and GL transaction posting visualization

**Key Features**:
- **P&L Summary**: Revenue, COGS, Gross Profit, Net Income
- **Deal-Level GL Posting Detail**: Complete journal entry breakdown
- **Real-time Balance Validation**: Debits = Credits verification
- **Multi-Section Posting**: Vehicle Sale, Trade-In, F&I, Commission
- **Period Selectors**: Day, Week, Month, Custom views
- **GL Account Browser**: Chart of accounts with balances

---

## System Architecture

### Data Flow Diagram
```
┌─────────────┐
│   CRM       │ ──[Customer Selected]──┐
└─────────────┘                        │
                                       ▼
┌─────────────┐              ┌─────────────────┐
│  Inventory  │ ──[Vehicle]─►│  Desking Tool   │
└─────────────┘              └─────────────────┘
                                       │
                             [Deal Submitted]
                                       │
                                       ▼
                             ┌─────────────────┐
                             │   Accounting    │
                             │   GL Posting    │
                             └─────────────────┘
```

---

## Installation & Usage

### Prerequisites
```bash
npm install react react-dom lucide-react
```

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: { extend: {} }
}
```

### Basic Implementation
```javascript
import MobileDeskingInterface from './automotive-desking-ui';
import InventoryManagementUI from './inventory-management-ui';
import CRMCustomerDashboard from './crm-customer-dashboard';
import AccountingDashboard from './accounting-dashboard';

function App() {
  const [activeModule, setActiveModule] = useState('desking');

  return (
    <div>
      {activeModule === 'crm' && <CRMCustomerDashboard />}
      {activeModule === 'desking' && <MobileDeskingInterface />}
      {activeModule === 'inventory' && <InventoryManagementUI />}
      {activeModule === 'accounting' && <AccountingDashboard />}
    </div>
  );
}
```

---

## Mobile-First Design Principles

1. **Touch Optimization**: Minimum 44x44px touch targets
2. **Progressive Disclosure**: Show critical info first, hide complexity
3. **Offline-First**: Service workers + IndexedDB for local persistence
4. **Performance**: Lazy loading, code splitting, virtual scrolling
5. **Responsive**: Mobile → Tablet → Desktop breakpoints

---

## API Integration Points

### Customer API
```javascript
// GET /api/customers
// POST /api/customers
// PUT /api/customers/:id

const fetchCustomers = async (filters) => {
  return await fetch('/api/customers', {
    method: 'POST',
    body: JSON.stringify(filters)
  });
};
```

### Inventory API
```javascript
// GET /api/inventory
// POST /api/inventory/search

const searchInventory = async (query) => {
  return await fetch('/api/inventory/search', {
    method: 'POST',
    body: JSON.stringify({ query })
  });
};
```

### Deal/Desking API
```javascript
// POST /api/deals
// PUT /api/deals/:id
// POST /api/deals/:id/submit

const submitDeal = async (dealData) => {
  return await fetch('/api/deals', {
    method: 'POST',
    body: JSON.stringify(dealData)
  });
};
```

### Accounting API
```javascript
// GET /api/accounting/transactions
// GET /api/accounting/gl-accounts
// POST /api/accounting/journal-entries

const getJournalEntries = async (dealId) => {
  return await fetch(`/api/accounting/journal-entries/${dealId}`);
};
```

---

## Professional Terminology Reference

| Term | Definition |
|------|------------|
| **ACV** | Actual Cash Value - True market value of trade-in |
| **APR** | Annual Percentage Rate - Interest rate on financing |
| **COGS** | Cost of Goods Sold - Dealer cost of vehicle |
| **DIS** | Days in Stock - Age of vehicle in inventory |
| **F&I** | Finance & Insurance - Back-end products |
| **Four-Square** | Traditional deal presentation worksheet |
| **LTV** | Lifetime Value - Total revenue from customer |
| **VSC** | Vehicle Service Contract - Extended warranty |
| **GAP** | Guaranteed Asset Protection insurance |
| **Floor Plan** | Financing for dealer inventory |
| **Pack** | Non-negotiable dealership fee |
| **Holdback** | Manufacturer incentive paid after sale |

---

## License & Support

**Version**: 1.0.0  
**Last Updated**: October 2024

For technical support, contact the development team.

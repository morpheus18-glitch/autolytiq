# Deal Management & Role-Based Dashboard Components

**Status**: ✅ **PRODUCTION READY**
**Added**: 2025-11-08
**Bundle Impact**: +62.65 KB (140.29 KB → 202.94 KB)

---

## 📦 New Components (3)

### 1. **DealJacket** - Digital Deal Jacket with Document Management
### 2. **DealWorkspace** - Complete Deal Management Workspace
### 3. **RoleDashboard** - Role-Based Intuitive State Dashboard

---

## 🎯 DealJacket Component

### Purpose
Complete digital deal folder containing all documents, forms, signatures, and state tracking for an automotive deal. Replaces physical deal jackets with a digital workflow.

### Features
- ✅ Document upload/download/preview
- ✅ E-signature integration
- ✅ State machine workflow (draft → submitted → approved → funded)
- ✅ Required document checklist
- ✅ Compliance verification
- ✅ Audit trail
- ✅ Print-ready packet generation
- ✅ Document versioning
- ✅ Rejection handling with reasons

### Usage

```typescript
import { DealJacket, type DealJacketData } from '@repo/ui';

const dealJacketData: DealJacketData = {
  dealId: 'deal_123',
  dealNumber: 'D-2024-001',
  customerName: 'John Smith',
  vehicleDescription: '2024 Toyota Camry LE',
  status: 'draft',
  createdAt: new Date(),
  updatedAt: new Date(),
  documents: [
    {
      id: 'doc_1',
      type: 'buyers_order',
      label: "Buyer's Order",
      required: true,
      status: 'pending',
    },
    {
      id: 'doc_2',
      type: 'credit_app',
      label: 'Credit Application',
      required: true,
      status: 'uploaded',
      fileUrl: '/uploads/credit_app.pdf',
      fileName: 'credit_app.pdf',
      fileSize: 125000,
      uploadedBy: 'John Salesperson',
      uploadedAt: new Date(),
    },
  ],
  signatures: {
    customer: false,
    salesPerson: true,
    manager: false,
  },
  complianceChecks: [
    {
      id: 'check_1',
      label: 'Truth in Lending Disclosure',
      status: 'pending',
    },
    {
      id: 'check_2',
      label: 'State Registration Requirements',
      status: 'passed',
      message: 'All required documents present',
    },
  ],
  auditTrail: [
    {
      id: 'audit_1',
      timestamp: new Date(),
      user: 'John Salesperson',
      action: 'Created deal jacket',
    },
  ],
};

<DealJacket
  data={dealJacketData}
  onDocumentUpload={async (docType, file) => {
    // Upload file to server
    await uploadDocument(dealJacketData.dealId, docType, file);
  }}
  onDocumentPreview={(document) => {
    // Open document in modal or new tab
    window.open(document.fileUrl, '_blank');
  }}
  onDocumentDownload={(document) => {
    // Download document
    downloadFile(document.fileUrl, document.fileName);
  }}
  onSignatureRequest={(signers) => {
    // Send e-signature requests
    sendSignatureRequests(dealJacketData.dealId, signers);
  }}
  onStatusChange={(newStatus) => {
    // Update deal jacket status
    updateDealJacketStatus(dealJacketData.dealId, newStatus);
  }}
  onPrintPacket={() => {
    // Generate and print complete deal packet
    printDealPacket(dealJacketData.dealId);
  }}
/>
```

### Document Types

```typescript
type DocumentType =
  | 'buyers_order'          // Buyer's Order / Purchase Agreement
  | 'credit_app'            // Credit Application
  | 'drivers_license'       // Driver's License (copy)
  | 'insurance_card'        // Proof of Insurance
  | 'trade_title'           // Trade-In Title
  | 'trade_payoff'          // Trade-In Payoff Statement
  | 'finance_contract'      // Finance Contract (Retail Installment)
  | 'warranty_contract'     // Extended Warranty Contract
  | 'aftermarket_contract'  // Aftermarket Products Contract
  | 'odometer_disclosure'   // Odometer Disclosure Statement
  | 'title_application'     // Title Application
  | 'registration_docs'     // Registration Documents
  | 'other';                // Other documents
```

### Deal Jacket States

```typescript
type DealJacketStatus =
  | 'draft'               // Initial creation, documents being gathered
  | 'pending_signatures'  // All docs uploaded, awaiting signatures
  | 'submitted'           // Submitted for review
  | 'in_review'           // Under management/F&I review
  | 'approved'            // Approved for funding
  | 'funded'              // Deal funded, complete
  | 'rejected'            // Rejected, needs changes
  | 'cancelled';          // Deal cancelled
```

### Utility Functions

```typescript
// Get required documents based on deal type
const requiredDocs = getRequiredDocumentsForDealType('finance');
// Returns: ['buyers_order', 'drivers_license', 'insurance_card',
//           'odometer_disclosure', 'credit_app', 'finance_contract']

// Calculate completion score
const score = calculateDocumentCompletionScore(documents);
// Returns: 0-100 based on required document completion
```

---

## 🎯 DealWorkspace Component

### Purpose
Complete deal management workspace combining deal jacket, state machine, activity timeline, and contextual actions. The command center for managing a deal from lead to delivery.

### Features
- ✅ State-aware interface (adapts to current deal stage)
- ✅ Contextual actions based on state
- ✅ Integrated document management
- ✅ Activity timeline
- ✅ Real-time collaboration
- ✅ Quick actions sidebar
- ✅ State machine workflow with validations
- ✅ Profitability metrics
- ✅ Progress tracking
- ✅ Role-based permissions

### Usage

```typescript
import { DealWorkspace, type DealWorkspaceData } from '@repo/ui';

const dealData: DealWorkspaceData = {
  dealId: 'deal_123',
  dealNumber: 'D-2024-001',
  stage: 'negotiation',
  status: 'active',

  customer: {
    id: 'cust_456',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-0100',
    creditScore: 720,
  },

  vehicle: {
    id: 'veh_789',
    vin: '1HGCM82633A123456',
    year: 2024,
    make: 'Toyota',
    model: 'Camry',
    trim: 'LE',
    stock: 'T-1234',
    cost: 28000,
    price: 32000,
  },

  structure: {
    salePrice: 32000,
    downPayment: 5000,
    amountFinanced: 27000,
    term: 72,
    rate: 5.9,
    monthlyPayment: 445,
  },

  metrics: {
    grossProfit: 4000,
    frontEndProfit: 4000,
    backEndProfit: 1200,
    totalProfit: 5200,
    closeProbability: 0.75,
  },

  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
  stageEnteredAt: new Date(Date.now() - 1800000), // 30 min ago
  timeInStage: 30,

  assignedTo: {
    salesperson: 'John Salesperson',
    manager: 'Mike Manager',
  },

  activities: [
    {
      id: 'act_1',
      timestamp: new Date(),
      user: 'John Salesperson',
      userRole: 'Salesperson',
      type: 'status_change',
      title: 'Deal moved to Negotiation',
      description: 'Customer returned from test drive',
    },
  ],

  stats: {
    documentsComplete: 2,
    documentsTotal: 6,
    signaturesComplete: 1,
    signaturesTotal: 4,
    tasksComplete: 3,
    tasksTotal: 5,
  },
};

<DealWorkspace
  data={dealData}
  onStageChange={async (newStage) => {
    // Transition deal to new stage
    await transitionDealStage(dealData.dealId, newStage);
  }}
  onStatusChange={(newStatus) => {
    // Update deal status (active/paused/cancelled)
    updateDealStatus(dealData.dealId, newStatus);
  }}
  onActivityAdd={(activity) => {
    // Add new activity to timeline
    addDealActivity(dealData.dealId, activity);
  }}
  onDocumentAction={(action) => {
    // Handle document actions
    if (action === 'upload') {
      openDocumentUploadModal();
    }
  }}
/>
```

### Deal Stages

```typescript
type DealStage =
  | 'lead'              // Initial lead, not yet qualified
  | 'qualified'         // Qualified lead, ready for appointment
  | 'appointment'       // Appointment scheduled
  | 'showroom'          // Customer in showroom
  | 'test_drive'        // Customer on test drive
  | 'negotiation'       // Price negotiation
  | 'pending_approval'  // Awaiting manager approval
  | 'approved'          // Manager approved
  | 'finance'           // In F&I
  | 'contracted'        // Finance contract signed
  | 'delivered'         // Vehicle delivered
  | 'lost';             // Deal lost
```

### State Machine Transitions

The component enforces a state machine with validations:

```typescript
const DEAL_TRANSITIONS: DealStateTransition[] = [
  {
    from: 'negotiation',
    to: 'pending_approval',
    action: 'Request Manager Approval',
    validations: [
      {
        field: 'structure',
        message: 'Deal structure must be complete',
        validator: (deal) => !!deal.structure,
      },
    ],
  },
  {
    from: 'pending_approval',
    to: 'approved',
    action: 'Approve Deal',
    requiredPermission: 'APPROVE_DEAL',
  },
];
```

### Utility Functions

```typescript
// Check if user can perform transition
const canMove = canTransition('negotiation', 'pending_approval', ['APPROVE_DEAL']);

// Get progress percentage through deal stages
const progress = getStageProgress('negotiation'); // Returns 54%
```

---

## 🎯 RoleDashboard Component

### Purpose
Role-based intuitive state dashboard that adapts to user role and current context. Shows the right information at the right time based on role, deal state, and active priorities.

### Features
- ✅ Role-specific layouts and widgets (7 role presets)
- ✅ State-aware content (what you need NOW)
- ✅ Priority-based action lists
- ✅ Real-time updates
- ✅ Customizable widget grid
- ✅ Saved dashboard presets
- ✅ Urgency scoring
- ✅ AI insights integration
- ✅ Drag-and-drop customization (optional)

### Usage

```typescript
import { RoleDashboard, type StateAwareContext } from '@repo/ui';

const context: StateAwareContext = {
  activeDeals: [
    {
      id: 'deal_1',
      status: 'negotiation',
      customerName: 'John Smith',
      vehicleDescription: '2024 Toyota Camry',
      priority: 'high',
      urgencyScore: 75,
      nextAction: 'Request manager approval',
      timeInState: 45,
      assignedTo: 'Current User',
    },
  ],

  urgentActions: [
    {
      id: 'action_1',
      type: 'approval',
      description: 'Deal #D-2024-001 needs your approval',
      deadline: new Date(Date.now() + 3600000), // 1 hour from now
      priority: 'critical',
      onClick: () => openDealApproval('deal_1'),
    },
  ],

  metrics: {
    revenue: { today: 125000, month: 850000, goal: 1000000 },
    deals: { active: 12, closed: 8, goal: 15 },
    leads: { hot: 5, total: 23 },
  },
};

<RoleDashboard
  role="sales_manager"
  context={context}
  onWidgetAction={(widgetId, action) => {
    // Handle widget-specific actions
    if (action === 'view_approvals') {
      navigate('/deals/approvals');
    }
  }}
  onCustomize={() => {
    // Open dashboard customization modal
    openCustomizationModal();
  }}
  editable={true}
/>
```

### User Roles

```typescript
type UserRole =
  | 'salesperson'        // Individual contributor
  | 'sales_manager'      // Sales team manager
  | 'fi_manager'         // F&I manager
  | 'gm'                 // General manager
  | 'admin'              // System admin
  | 'inventory_manager'  // Inventory manager
  | 'bdc_agent';         // BDC agent
```

### Widget Types (18)

```typescript
type WidgetType =
  | 'active_deals'        // Active deals list
  | 'hot_leads'           // Hot leads requiring attention
  | 'appointments_today'  // Today's appointments
  | 'pending_approvals'   // Deals awaiting approval
  | 'revenue_today'       // Today's revenue
  | 'revenue_month'       // Month-to-date revenue
  | 'conversion_rate'     // Lead-to-close conversion
  | 'inventory_alerts'    // Inventory issues
  | 'aged_inventory'      // Aging inventory report
  | 'pending_deliveries'  // Vehicles awaiting delivery
  | 'finance_pending'     // Deals in F&I
  | 'credit_approvals'    // Credit approval status
  | 'profitability'       // Profitability metrics
  | 'team_performance'    // Team performance scoreboard
  | 'ai_insights'         // AI-generated insights
  | 'tasks'               // Task list
  | 'recent_activity'     // Recent activity feed
  | 'sales_funnel';       // Sales funnel visualization
```

### Dashboard Presets

Each role gets a default dashboard preset:

#### Salesperson Dashboard
- **Focus**: Personal deals, leads, appointments
- **Widgets**: active_deals (lg), hot_leads (md), appointments_today (md), ai_insights (md), revenue_month (sm), conversion_rate (sm)

#### Sales Manager Dashboard
- **Focus**: Team oversight, approvals, performance
- **Widgets**: team_performance (xl), pending_approvals (md), sales_funnel (lg), revenue_month (md), ai_insights (md), inventory_alerts (md)

#### F&I Manager Dashboard
- **Focus**: Finance deals, credit, profitability
- **Widgets**: finance_pending (lg), credit_approvals (md), profitability (md), pending_deliveries (md), revenue_month (sm), ai_insights (md)

#### GM Dashboard
- **Focus**: High-level metrics, profitability, performance
- **Widgets**: revenue_month (xl), profitability (lg), team_performance (lg), aged_inventory (md), sales_funnel (md), ai_insights (md)

### Widget Sizes

```typescript
type WidgetSize = 'sm' | 'md' | 'lg' | 'xl';

// Grid system: 4 columns on desktop
// sm: 1 col × 1 row
// md: 2 cols × 1 row
// lg: 2 cols × 2 rows
// xl: 4 cols × 2 rows
```

### Utility Functions

```typescript
// Calculate urgency score (0-100) for deals
const urgency = calculateUrgencyScore(dealState);
// Factors: time in state, priority, deal stage

// Get recommended widgets for a role
const widgets = getRecommendedWidgetsForRole('salesperson');
// Returns: ['active_deals', 'hot_leads', 'appointments_today', ...]
```

---

## 🔄 Component Integration

### Typical Workflow

1. **Dashboard View** (`RoleDashboard`)
   - User sees role-specific dashboard on login
   - Urgent actions highlighted
   - Quick access to key metrics

2. **Deal Selection**
   - Click on deal from `active_deals` widget
   - Navigate to deal workspace

3. **Deal Management** (`DealWorkspace`)
   - View deal overview, structure, metrics
   - See activity timeline
   - Access contextual actions
   - Transition between stages

4. **Document Management** (`DealJacket`)
   - Upload required documents
   - Track signatures
   - Monitor compliance
   - Generate print packet

### State Flow Example

```typescript
// User logs in → RoleDashboard
<RoleDashboard role="salesperson" context={context} />

// Clicks on deal → DealWorkspace
<DealWorkspace
  data={dealData}
  onDocumentAction={() => setShowDealJacket(true)}
/>

// Clicks "Upload Documents" → DealJacket
<DealJacket
  data={dealJacketData}
  onDocumentUpload={uploadHandler}
/>
```

---

## 📊 Bundle Impact

### Before
- **Total Components**: 97
- **Bundle Size**: 140.29 KB ESM
- **Type Definitions**: 40.05 KB

### After
- **Total Components**: 100
- **Bundle Size**: 202.94 KB ESM (+62.65 KB)
- **Type Definitions**: 50.51 KB (+10.46 KB)

### Component Sizes (Estimated)
- **DealJacket**: ~25 KB (560 lines)
- **DealWorkspace**: ~30 KB (680 lines)
- **RoleDashboard**: ~18 KB (420 lines)

---

## 🎨 Design Integration

### Design Tokens Used
- ✅ Semantic colors (surface, text, accent, status)
- ✅ 8px spacing grid
- ✅ Typography scale
- ✅ Border radius system
- ✅ Shadow system
- ✅ Animation timings

### Theme Support
- ✅ Light mode
- ✅ Dark mode
- ✅ Automatic theme switching via CSS custom properties

---

## 🔒 Security Considerations

### DealJacket
- Document URLs should be signed/temporary
- File uploads should be validated (type, size)
- Audit trail for all document actions
- Signature requests should use secure e-signature provider

### DealWorkspace
- Stage transitions require permission checks
- Sensitive data (credit score, SSN) should be redacted based on role
- Activity logging for compliance

### RoleDashboard
- Widget visibility based on role
- Data filtering per user permissions
- No PII in dashboard widgets without explicit permission

---

## 🧪 Testing Recommendations

### Unit Tests
```typescript
describe('DealJacket', () => {
  it('should display correct document count', () => {
    // Test document counting logic
  });

  it('should prevent upload when readonly', () => {
    // Test readonly mode
  });

  it('should calculate completion percentage', () => {
    const score = calculateDocumentCompletionScore(mockDocs);
    expect(score).toBe(66.67);
  });
});

describe('DealWorkspace', () => {
  it('should show available transitions based on stage', () => {
    // Test state machine logic
  });

  it('should validate transition requirements', () => {
    const canMove = canTransition('negotiation', 'pending_approval', []);
    expect(canMove).toBe(false); // Missing APPROVE_DEAL permission
  });
});

describe('RoleDashboard', () => {
  it('should load correct preset for role', () => {
    const preset = DASHBOARD_PRESETS['salesperson'];
    expect(preset.widgets).toHaveLength(6);
  });

  it('should calculate urgency score correctly', () => {
    const score = calculateUrgencyScore(mockDealState);
    expect(score).toBeGreaterThan(50);
  });
});
```

### Integration Tests
- Test deal progression through all stages
- Test document upload → signature → verification flow
- Test dashboard widget data loading
- Test role-based access control

---

## 📚 Related Documentation

- **LAYOUT_PRESETS.md** - Layout system documentation
- **COMPONENT_LIBRARY_STATUS.md** - Complete component inventory
- **CLAUDE.md** - Project overview and architecture
- **EXTENDED_COMPONENTS_COMPLETE.md** - Advanced data components

---

## 🎯 Future Enhancements

### DealJacket
- [ ] Drag-and-drop document upload
- [ ] Real-time collaboration (multiple users viewing/editing)
- [ ] OCR for auto-filling data from documents
- [ ] Document templates library
- [ ] Batch operations (download all, print all)

### DealWorkspace
- [ ] Split-screen view (deal + documents side-by-side)
- [ ] AI-powered next action suggestions
- [ ] Deal comparison tool
- [ ] Export deal summary as PDF
- [ ] Timeline filtering and search

### RoleDashboard
- [ ] Custom widget creation
- [ ] Dashboard sharing/exporting
- [ ] Goal tracking and alerts
- [ ] Historical trend visualization
- [ ] Mobile-optimized widget layouts

---

**Documentation Generated**: 2025-11-08
**Status**: ✅ **PRODUCTION READY** 🚀
**Integration**: Ready for immediate use in Autolytiq platform

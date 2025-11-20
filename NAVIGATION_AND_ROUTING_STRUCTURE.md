# AutolytiQ Frontend Navigation and Routing Structure

## Project Overview
- **Location**: `/root/autolytiq/apps/frontend/`
- **Router Library**: Wouter (lightweight router)
- **State Management**: React Query, Custom hooks
- **Styling**: Tailwind CSS

---

## 1. MAIN APPLICATION ENTRY POINT

### main.tsx
**File**: `/root/autolytiq/apps/frontend/src/main.tsx`
```
- Entry point: createRoot(document.getElementById("root")!).render(<App />)
- Renders the App component
```

### App.tsx
**File**: `/root/autolytiq/apps/frontend/src/App.tsx`

**Structure**:
- Provides root-level providers:
  - ErrorBoundary
  - QueryClientProvider (React Query)
  - ThemeProvider
  - TooltipProvider
  
- Contains Router component that:
  - Checks authentication status with `useAuth()` hook
  - Filters routes based on user's allowed routes
  - Shows Landing/Login pages if not authenticated
  - Shows AppShell with routed content if authenticated
  - Uses Wouter's `<Switch>` and `<Route>` components

---

## 2. ROUTING CONFIGURATION

### routes/index.tsx
**File**: `/root/autolytiq/apps/frontend/src/routes/index.tsx`

**Key Features**:
- Lazy-loads all route components for optimized bundle size
- Defines 150+ routes across the application
- Exports `appRoutes` array used in App.tsx Router

**Route Categories** (165+ total routes):

#### Root Level Routes:
- `/` - Sitemap
- `/sitemap` - Sitemap
- `/dashboard` - Main dashboard
- `/settings/:tab?` - Settings with optional tab parameter
- `/customers` - Customers page
- `/inventory` - Inventory page
- `/deals` - Deals page

#### Admin Routes (`/admin/`):
- `/admin/users` - Users management
- `/admin/user-profile` - User profile
- `/admin/user-management` - User management
- `/admin/user-permissions` - User permissions
- `/admin/training-center` - Training center
- `/admin/system-settings` - System settings
- `/admin/system-configuration` - System configuration
- `/admin/security-center` - Security center
- `/admin/roles` - Roles management
- `/admin/role-management` - Role management
- `/admin/role-presets` - Role presets
- `/admin/performance-tracking` - Performance tracking
- `/admin/lead-distribution` - Lead distribution
- `/admin/integration-setup` - Integration setup
- `/admin/departments` - Departments
- `/admin/dealer-configuration` - Dealer configuration
- `/admin/comprehensive-settings` - Comprehensive settings
- `/admin/communication-settings` - Communication settings
- `/admin/ml-developer` - ML developer
- `/admin/ml-model-comparison` - ML model comparison
- `/admin/system-health` - System health
- `/admin/multi-store` - Multi-store management

#### Accounting Routes (`/accounting/`):
- `/accounting/vehicle-profit` - Vehicle profit
- `/accounting/transactions` - Transactions
- `/accounting/reports` - Reports
- `/accounting/monthly-close` - Monthly close
- `/accounting/finance-reserves` - Finance reserves
- `/accounting/deal-finalization` - Deal finalization
- `/accounting/chart-of-accounts` - Chart of accounts
- `/accounting/dashboard` - Accounting dashboard
- `/accounting/tax-reports` - Tax reports
- `/accounting/payroll` - Payroll
- `/accounting/payroll-calculation` - Payroll calculation
- `/accounting/pl-statement` - P&L statement
- `/accounting/journal-entries` - Journal entries
- `/accounting/journal-entry-form` - Journal entry form
- `/accounting/gl-accounts` - GL accounts
- `/accounting/gl-account-form` - GL account form
- `/accounting/cash-flow-statement` - Cash flow statement
- `/accounting/balance-sheet` - Balance sheet

#### Analytics Routes (`/analytics/`):
- `/analytics/customer-lifecycle` - Customer lifecycle
- `/analytics/crm` - CRM analytics

#### Auth Routes (`/auth/`):
- `/auth/forgot-password` - Forgot password
- `/auth/reset-password` - Reset password

#### Communications Routes (`/communications/`):
- `/communications/center` - Communication center
- `/communications/call-center` - Call center
- `/communications/email` - Email composer
- `/communications/sms` - SMS inbox
- `/communications/demo` - Communications demo

#### Customer Routes (`/customers/`):
- `/customers/texting-portal` - Texting portal
- `/customers/phone-calls` - Phone calls
- `/customers/detail/:id` - Customer detail (dynamic)
- `/customers/profile/:id` - Customer profile (dynamic)

#### Desking Routes (`/desking/`):
- `/desking/initial-pencil` - Initial pencil
- `/desking/workspace` - Desking workspace
- `/desking/deal-comparison` - Deal comparison
- `/desking/customer-counter` - Customer counter
- `/desking/approval-analysis` - Approval analysis

#### Deals Routes (`/deals/`):
- `/deals` - Deals page
- `/deals/deal-desk` - Deal desk

#### Inventory Routes (`/inventory/`):
- `/inventory/detail/:id` - Inventory detail (dynamic)
- `/inventory/pricing` - Pricing
- `/inventory/vehicle/:id` - Vehicle detail (dynamic)
- `/inventory/trade-appraisals` - Trade appraisals
- `/inventory/competitive-pricing` - Competitive pricing
- `/inventory/lot-management` - Lot management

#### Finance Routes (`/finance/`):
- `/finance/rates` - Rate sheets
- `/finance/lenders` - Lenders
- `/finance/reports` - Finance reports
- `/finance/compliance-manager` - Compliance manager

#### Leads Routes (`/leads/`):
- `/leads/dashboard` - Lead dashboard
- `/leads/:id` - Lead detail (dynamic)
- `/leads/management` - Lead management
- `/leads/market` - Market leads

#### Reports Routes (`/reports/`):
- `/reports/financial` - Financial reports
- `/reports/inventory` - Inventory reports
- `/reports/sales` - Sales reports
- `/reports/service` - Service reports

#### Service Routes (`/service/`):
- `/service/appointments` - Appointments
- `/service/history` - Service history
- `/service/parts` - Parts inventory
- `/service/reports` - Service reports
- `/service/schedule` - Technician schedule
- `/service/orders` - Service orders
- `/service/overview` - Service overview

#### Settings Routes (`/settings/`):
- `/settings/analytics` - Analytics settings
- `/settings/branding` - Branding settings
- `/settings/data` - Data settings
- `/settings/dealership` - Dealership settings
- `/settings/developer` - Developer settings
- `/settings/forms` - Forms settings
- `/settings/integrations` - Integrations settings
- `/settings/notifications` - Notifications settings
- `/settings/pricing-rules` - Pricing rules settings
- `/settings/security` - Security settings
- `/settings/users` - Users settings

#### Misc Routes (`/misc/`):
- Multiple testing and demonstration routes (50+ routes)

---

## 3. NAVIGATION COMPONENTS

### Top Navigation Component
**File**: `/root/autolytiq/apps/frontend/src/components/top-navigation.tsx`

**Features**:
- Desktop navigation bar with workflow section dropdowns
- Mobile responsive hamburger menu
- Search functionality
- Quick actions dropdown menu
- User profile dropdown with settings and logout
- Real-time navigation active state tracking
- Role-based route filtering
- Status indicators (notifications, connection status)

**Key Sections in Dropdown**:
- Inventory Pipeline
- CRM & Leads
- Sales Process
- Finance & Insurance
- Service
- Intelligence (Analytics)
- Reports
- Accounting

### Sidebar Component
**File**: `/root/autolytiq/apps/frontend/src/components/sidebar.tsx`

**Features**:
- Full-page navigation sidebar
- Organized by department sections:
  - Sales Department (13 items)
  - Service Department (3 items)
  - Accounting Department (4 items)
  - Administration (5 items)
- Mobile responsive (hidden on desktop, toggleable on mobile)
- Active route highlighting with gradient backgrounds
- Icons from lucide-react
- Smooth transitions and animations

### Collapsible Sidebar Component
**File**: `/root/autolytiq/apps/frontend/src/components/collapsible-sidebar.tsx`

**Features**:
- Desktop-optimized collapsible sidebar
- Expanded state: shows full navigation with sections and labels
- Collapsed state: shows icons only (on desktop)
- Mobile state: full-screen modal overlay
- Keyboard navigation support (Escape key)
- Max 8 items visible in collapsed state
- Accessibility features (aria labels, roles)
- Scroll lock on mobile when open
- Smooth animations and transitions

### Mobile Footer Menu Component
**File**: `/root/autolytiq/apps/frontend/src/components/mobile-footer-menu.tsx`

**Features**:
- Sticky bottom navigation bar (mobile only, hidden on md and up)
- 4-column grid layout on mobile
- Primary navigation items:
  - Dashboard
  - Customers
  - Inventory
  - More (menu trigger)
- Full navigation overlay menu (modal):
  - 2-column grid layout
  - All navigation sections
  - Quick actions
  - User profile section
- Role-based route filtering
- Dynamic active state styling
- Touch-optimized sizing

### Mobile Navigation Component
**File**: `/root/autolytiq/apps/frontend/src/components/layout/mobile-nav.tsx`

**Features**:
- Mobile-optimized navigation drawer
- Uses Sheet component for slide-in menu
- Basic navigation items (6 items):
  - Dashboard
  - Sales & Leads
  - Inventory
  - Deal Desk
  - Analytics
  - Settings
- Active state styling
- Responsive sizing

---

## 4. LAYOUT COMPONENTS

### App Shell Component
**File**: `/root/autolytiq/apps/frontend/src/components/layout/app-shell.tsx`

**Structure**:
```tsx
<MobileLayout
  header={<TopNavigation />}
  bottomNav={<MobileFooterMenu />}
  className="app-surface text-foreground"
  contentClassName="..."
>
  {children}
</MobileLayout>
```

### Mobile Layout Component
**File**: `/root/autolytiq/apps/frontend/src/components/layouts/MobileLayout.tsx`

**Features**:
- Responsive container for header, content, and footer navigation
- Handles viewport height calculations (mobile 100vh issue fix)
- Supports both bottom navigation and traditional navigation
- Content area with max-width constraint (max-w-7xl)
- Safe area inset handling for notched devices
- Overflow handling with webkit-overflow-scrolling for smooth scrolling
- Responsive padding adjustments

---

## 5. NAVIGATION CONFIGURATION

### Navigation Configuration File
**File**: `/root/autolytiq/apps/frontend/src/config/navigation.ts`

**Exports**:

#### WORKFLOW_SECTIONS (8 main sections):
1. **Inventory**
   - Vehicle Inventory
   - Lot Management
   - Pricing Insights
   - Trade Appraisals
   - Competitive Pricing

2. **CRM & Leads**
   - Lead Management
   - Lead Dashboard
   - Market Leads
   - Customer Records
   - Customer Detail

3. **Sales Process**
   - Active Deals (with badge: '3')
   - Deal Desk
   - Leads Pipeline
   - Customer Management

4. **Finance & Insurance**
   - F&I Command Center
   - Lender Network
   - Rate Sheets
   - Compliance Engine
   - Finance Reports
   - F&I Configuration

5. **Service**
   - Today's Appointments (with badge: '7')
   - Service History
   - Parts Inventory
   - Technician Schedule

6. **Intelligence**
   - Performance Dashboard
   - CRM Analytics
   - Market Intelligence
   - ML Model Comparison

7. **Reports**
   - Sales Reports
   - Inventory Reports
   - Service Reports
   - Financial Reports

8. **Accounting**
   - Accounting Dashboard
   - Transactions
   - Financial Reports
   - Payroll

#### MOBILE_PRIMARY_NAV_ITEMS (4 items):
- Dashboard
- Customers
- Inventory
- More (menu trigger)

#### MOBILE_ALL_NAV_ITEMS (13 items):
- Dashboard
- Leads
- Customers
- Inventory
- Finance & Insurance
- Accounting
- Deals
- Deal Desk
- Communications
- Analytics
- Reports
- Settings
- Admin

#### QUICK_ACTIONS (3 items):
- Start New Deal
- Add Vehicle
- Schedule Service

---

## 6. AUTHENTICATION AND ROUTE PROTECTION

### Authentication Flow:
1. App checks `useAuth()` hook for authentication status
2. Shows Landing page or Login page if not authenticated
3. User logs in via `/api/login` endpoint
4. App retrieves user data with:
   - `allowedRoutes`: Array of routes user can access
   - `navigationSections`: Array of section IDs user can see
5. Routes are filtered based on user permissions
6. Navigation components filter menu items based on:
   - `user?.access?.allowedRoutes`
   - `user?.access?.navigationSections`

### Route Filtering Logic:
- If `allowedRoutes` contains `'*'`, user has access to all routes
- Otherwise, each route is checked against the allowed set
- Mobile navigation filters items using `matchPaths` array for partial matches

---

## 7. ROUTING PATTERNS

### Dynamic Routes:
- `/customers/detail/:id` - Customer detail page
- `/customers/profile/:id` - Customer profile
- `/inventory/detail/:id` - Inventory detail
- `/inventory/vehicle/:id` - Vehicle detail
- `/leads/:id` - Lead detail
- `/settings/:tab?` - Settings with optional tab

### Path Matching:
- Exact matches: `/dashboard`
- Prefix matches: `/inventory/`, `/accounting/`
- Wildcard patterns in navigation config: `matchPaths` array

---

## 8. MOBILE-SPECIFIC NAVIGATION

### Responsive Breakpoints:
- **Mobile** (< md): Bottom tab bar with overlay menu
- **Tablet** (md-lg): Combination layouts
- **Desktop** (>= lg): Top navigation with dropdown menus

### Mobile-Specific Components:
1. Bottom Tab Bar (4 items)
2. Modal Navigation Overlay (expandable menu)
3. Sheet drawer (MobileNav)
4. Collapsible sidebar (alternative)

### Safe Area Support:
- Handles notches and safe areas with `safe-area-pb` class
- Viewport height calculations for 100vh issues
- Landscape orientation handling

---

## 9. ACTIVE ROUTE DETECTION

### Methods Used:
1. **Wouter's `useLocation()` hook**: Returns current pathname
2. **Path comparison**: Direct string comparison for exact matches
3. **Path prefix matching**: Using `startsWith()` for nested routes
4. **Custom helpers**: `isHomePath()` utility for dashboard fallback
5. **Match paths array**: Additional path patterns for flexibility

### Implementation in Components:
```tsx
const [location] = useLocation();
const isActive = location === itemPath;
// or
const isActive = location.startsWith(itemPath);
```

---

## 10. QUICK ACTIONS & SEARCH

### Quick Actions Menu:
- Located in top navigation (desktop) and mobile overlay
- Provides fast access to common tasks:
  - Start New Deal → `/deals`
  - Add Vehicle → `/inventory?view=add-vehicle`
  - Schedule Service → `/service/appointments`

### Search Functionality:
- Top navigation search bar (desktop and mobile)
- Placeholder: "Search the AutolytiQ fabric"
- Mobile variant: "Search vehicles, customers, deals..."
- Connects to smart search feature (route: `/ai-smart-search`)

---

## 11. NAVIGATION STATE MANAGEMENT

### Sidebar State:
- Uses local component state (`useState`)
- `isOpen`: Whether sidebar is visible
- `onToggle()`: Toggle open/close
- Mobile closes sidebar on navigation
- Desktop toggles collapsed/expanded state

### Mobile Menu State:
- `isMenuOpen`: Whether overlay menu is visible
- Closes automatically on route change (via `useEffect`)
- Closes when clicking menu items
- Closes when clicking overlay backdrop

### Active Tab State:
- Resolved based on current location
- Updates when route changes
- Falls back to default section (Inventory)

---

## 12. COMPONENT HIERARCHY

```
App.tsx
├── ErrorBoundary
├── QueryClientProvider
├── ThemeProvider
├── TooltipProvider
└── Router
    ├── Landing/Login (unauthenticated)
    └── AppShell (authenticated)
        ├── MobileLayout
        │   ├── TopNavigation
        │   │   ├── Logo/Brand
        │   │   ├── Navigation Sections (lg+)
        │   │   ├── Search
        │   │   ├── Quick Actions
        │   │   ├── Notifications
        │   │   ├── Theme Toggle
        │   │   ├── User Profile Dropdown
        │   │   └── Mobile Menu Button
        │   ├── [Page Content]
        │   └── MobileFooterMenu
        │       ├── Primary Nav Items
        │       └── Full Navigation Modal
        └── [Routed Page Component]
```

---

## 13. KEY CUSTOM HOOKS

### useAuth()
- Returns: `user`, `isAuthenticated`, `isLoading`
- Handles authentication state and user data
- Provides access to user's allowed routes and sections

### useLocation()
- From Wouter library
- Returns: `[location, setLocation]`
- Current URL pathname and navigation function

### useIsMobile()
- Custom hook for mobile detection
- Used in collapsible sidebar and other responsive components

### useScrollLock()
- Custom hook for locking body scroll
- Used when mobile menu is open

---

## 14. FILE STRUCTURE SUMMARY

```
src/
├── App.tsx (Main app with routing logic)
├── main.tsx (Entry point)
├── routes/
│   └── index.tsx (Route definitions)
├── config/
│   ├── navigation.ts (Navigation structure)
│   └── api.ts
├── components/
│   ├── top-navigation.tsx
│   ├── sidebar.tsx
│   ├── collapsible-sidebar.tsx
│   ├── mobile-footer-menu.tsx
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── mobile-nav.tsx
│   │   └── ...
│   ├── layouts/
│   │   └── MobileLayout.tsx
│   └── ui/ (UI component library)
├── pages/
│   ├── dashboard.tsx
│   ├── login.tsx
│   ├── landing.tsx
│   ├── customers.tsx
│   ├── inventory.tsx
│   ├── deals.tsx
│   ├── admin/ (20+ pages)
│   ├── accounting/ (18+ pages)
│   ├── analytics/ (2 pages)
│   ├── auth/ (2 pages)
│   ├── communications/ (5 pages)
│   ├── desking/ (5 pages)
│   ├── finance/ (4 pages)
│   ├── leads/ (4 pages)
│   ├── reports/ (4 pages)
│   ├── service/ (7 pages)
│   ├── settings/ (12 pages)
│   └── misc/ (50+ pages)
├── hooks/
│   ├── useAuth.tsx
│   ├── useIsMobile.tsx
│   └── ...
├── lib/
│   ├── utils.ts
│   ├── userHomePath.ts
│   └── ...
└── features/
    └── fi/ (Finance & Insurance feature)
```

---

## 15. STYLING & THEMING

### CSS Classes Used:
- `sidebar`: Sidebar container
- `glass-panel`: Glassmorphism effect for navigation
- `glass-card`: Card with glass effect
- `mobile-glass-nav`: Mobile-optimized glass effect
- `gradient-divider`: Gradient divider line
- `shadow-card-xl`: Large card shadow
- `brand-gradient`: Brand gradient effect
- `grid-overlay`: Subtle background grid

### Theme Variables:
- Sidebar theme variables: `--sidebar-*`
- Top nav height: `--top-nav-height`
- Viewport height: `--vh`
- Surface colors: `surface-base`, `surface-dark`, `surface-glass`

### Tailwind Classes:
- Responsive breakpoints: `md`, `lg`, `xl`
- Dark mode support: `dark:`
- Custom spacing and sizing

---

## 16. ERROR HANDLING & LOADING STATES

### Loading States:
- Initial auth check shows spinner
- Route lazy loading shows `RouteLoadingFallback` component
- Bottom navigation and menu smoothly close on navigation

### 404 Handling:
- Catch-all route renders `NotFound` component
- Last route in Switch component

### Error Boundaries:
- Top-level ErrorBoundary catches React errors
- Prevents entire app crash

---

## SUMMARY OF KEY POINTS

1. **Router**: Wouter (lightweight client-side router)
2. **Main Navigation**: Top dropdown (desktop) + Mobile bottom bar + Mobile overlay menu
3. **Routes**: 165+ routes organized into functional areas
4. **Mobile Support**: Fully responsive with touch-optimized components
5. **Authentication**: Role-based route filtering at runtime
6. **Configuration**: Centralized navigation config in `/config/navigation.ts`
7. **Active States**: Dynamic detection based on current pathname
8. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
9. **Performance**: Lazy-loaded route components, memoized navigation items
10. **Theming**: Supports dark/light mode with CSS variables


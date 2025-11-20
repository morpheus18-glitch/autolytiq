# AutolytiQ Frontend Navigation - Visual Architecture Guide

## Application Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         index.html                              │
│                    + React Root (#root)                         │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      main.tsx (Entry)                           │
│                  createRoot().render(<App />)                   │
└────────────────────────────┬──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ ErrorBoundary                                           │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ QueryClientProvider (React Query)               │  │  │
│  │  │  ┌────────────────────────────────────────────┐ │  │  │
│  │  │  │ ThemeProvider                              │ │  │  │
│  │  │  │  ┌──────────────────────────────────────┐ │ │  │  │
│  │  │  │  │ TooltipProvider                      │ │ │  │  │
│  │  │  │  │  ┌────────────────────────────────┐ │ │ │  │  │
│  │  │  │  │  │ Router (Wouter)                │ │ │ │  │  │
│  │  │  │  │  │  ├─ Landing (if not authed)   │ │ │ │  │  │
│  │  │  │  │  │  └─ AppShell (if authed)      │ │ │ │  │  │
│  │  │  │  │  └────────────────────────────────┘ │ │ │  │  │
│  │  │  │  └──────────────────────────────────────┘ │ │  │  │
│  │  │  └────────────────────────────────────────────┘ │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Authenticated User Layout (AppShell)

```
┌─────────────────────────────────────────────────────────────────┐
│                      AppShell                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MobileLayout                                            │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ TopNavigation (Header)                             │ │  │
│  │  │ ┌──────────────────────────────────────────────┐   │ │  │
│  │  │ │ Logo | Navigation Sections | Search | Menu  │   │ │  │
│  │  │ └──────────────────────────────────────────────┘   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ [Main Content Area - Routed Page]                 │ │  │
│  │  │  ▲ Route from routes/index.tsx                     │ │  │
│  │  │  │ Based on current location + auth permissions   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ MobileFooterMenu (Bottom Nav - mobile only)        │ │  │
│  │  │ ┌──────────────────────────────────────────────┐   │ │  │
│  │  │ │ Dashboard | Customers | Inventory | More...  │   │ │  │
│  │  │ └──────────────────────────────────────────────┘   │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Top Navigation Structure (Desktop/Tablet)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TopNavigation (lg breakpoint)                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ [Logo] | [Workflow Dropdowns] | [Search] [Quick] [Bell] [Theme] [User]
│  │                                                                     │ │
│  │ Dropdowns:                                                         │ │
│  │  ┌─────────────────────────────────────────────────────────────┐  │ │
│  │  │ Inventory (icon) ▼                                          │  │ │
│  │  │  • Vehicle Inventory        CRM & Leads (icon) ▼            │  │ │
│  │  │  • Lot Management            • Lead Management              │  │ │
│  │  │  • Pricing Insights          • Lead Dashboard               │  │ │
│  │  │  • Trade Appraisals          • Market Leads                 │  │ │
│  │  │  • Competitive Pricing       • Customer Records             │  │ │
│  │  │                              • Customer Detail              │  │ │
│  │  │ Sales Process (icon) ▼      Finance & Insurance (icon) ▼   │  │ │
│  │  │  • Active Deals (3)           • F&I Command Center          │  │ │
│  │  │  • Deal Desk                 • Lender Network              │  │ │
│  │  │  • Leads Pipeline            • Rate Sheets                  │  │ │
│  │  │  • Customer Management       • Compliance Engine            │  │ │
│  │  │                              • Finance Reports              │  │ │
│  │  │ Service (icon) ▼             • F&I Configuration            │  │ │
│  │  │  • Appointments (7)          Intelligence (icon) ▼          │  │ │
│  │  │  • Service History            • Performance Dashboard       │  │ │
│  │  │  • Parts Inventory            • CRM Analytics               │  │ │
│  │  │  • Technician Schedule        • Market Intelligence         │  │ │
│  │  │                              • ML Model Comparison          │  │ │
│  │  │ Reports (icon) ▼             Accounting (icon) ▼            │  │ │
│  │  │  • Sales Reports              • Accounting Dashboard        │  │ │
│  │  │  • Inventory Reports          • Transactions                │  │ │
│  │  │  • Service Reports            • Financial Reports           │  │ │
│  │  │  • Financial Reports          • Payroll                     │  │ │
│  │  │                                                              │  │ │
│  │  └─────────────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

## Mobile Navigation (< lg breakpoint)

### Bottom Tab Bar (md and below)
```
┌─────────────────────────────────┐
│ [Dashboard] [Customers] [Inventory] [More...]
└─────────────────────────────────┘
     (sticky footer)

When "More..." clicked:
┌──────────────────────────────────────┐
│ X AutolytiQ Navigation               │
├──────────────────────────────────────┤
│ [Quick Search Bar]                   │
├──────────────────────────────────────┤
│  Inventory       CRM & Leads         │
│  • Vehicle...    • Lead Mgmt         │
│  • Lot Mgmt      • Lead Dashboard    │
│  • Pricing...    • Market Leads      │
│  • Trade...      • Customers         │
│  • Competitive...• Customer Detail   │
│                                      │
│  Finance & Insurance   Service      │
│  • F&I Command    • Appointments    │
│  • Lender Net...  • Service Hist    │
│  • Rate Sheets    • Parts Inv       │
│  • Compliance     • Schedule        │
│  • Reports        • Orders          │
│  • F&I Config                       │
│                                      │
│  [More sections...]                  │
├──────────────────────────────────────┤
│ QUICK ACTIONS                        │
│ [Add Customer] [Add Vehicle]         │
│ [New Deal] [F&I Dashboard]           │
├──────────────────────────────────────┤
│ [User Profile] [John Smith]          │
│ [Settings] [Security] [Sign Out]     │
└──────────────────────────────────────┘
```

## Route Filtering Flow

```
User Login
    │
    ▼
useAuth() hook retrieves:
├─ isAuthenticated: boolean
├─ user: {
│   firstName: string
│   lastName: string
│   email: string
│   access: {
│     allowedRoutes: string[]  // e.g., ['/dashboard', '/inventory', ...]
│     navigationSections: string[] // e.g., ['inventory', 'crm', ...]
│   }
│ }
└─ isLoading: boolean

    │
    ▼
Router component:
├─ If !isAuthenticated → Show Landing/Login
├─ If isLoading → Show Loading Spinner
└─ If isAuthenticated → {
     allowedRouteSet = new Set(user.access.allowedRoutes)
     
     appRoutes.filter(route => {
       if allowedRouteSet.has('*')  → Allow all routes
       else if allowedRouteSet.has(route.path) → Allow specific route
       else → Block route
     })
     
     Render AppShell with filtered routes
   }

    │
    ▼
Navigation Components (TopNav, MobileFooterMenu):
├─ Filter WORKFLOW_SECTIONS based on allowedSectionSet
├─ Filter subItems based on allowedRouteSet + matchPaths
└─ Display only accessible menu items
```

## Responsive Breakpoints

```
Mobile                  Tablet              Desktop             Wide
< md (768px)           md-lg                lg-2xl              > 2xl
                       (768-1024px)         (1024-1536px)

┌─────────────────┬──────────────────┬─────────────────┬────────────────┐
│ Top Nav (full)  │ Top Nav (full)    │ Top Nav (full)  │ Top Nav (full) │
├─────────────────┼──────────────────┼─────────────────┼────────────────┤
│                 │                  │                 │                │
│    Content      │     Content      │    Content      │   Content      │
│                 │                  │                 │                │
├─────────────────┼──────────────────┼─────────────────┼────────────────┤
│ [4-Tab Bar]     │ Bottom Bar        │ (No Bottom)     │ (No Bottom)    │
└─────────────────┴──────────────────┴─────────────────┴────────────────┘

Top Navigation Visibility:
- Mobile: Hamburger menu + logo
- Tablet/Desktop: Full dropdown menus

Bottom Navigation Visibility:
- Mobile: Always visible (sticky)
- Tablet+: Hidden
```

## Active Route Detection

```
Current URL: /inventory/pricing

┌─────────────────────────────────────┐
│ TopNavigation                       │
├─────────────────────────────────────┤
│ Check activeTab matching:           │
│ 1. startsWith('/inventory') ✓       │
│ 2. Match to WORKFLOW_SECTIONS       │
│     → Inventory section             │
│ 3. Mark as active                   │
│                                     │
│ Display: [Inventory ▼] highlighted  │
│ Show dropdown with Pricing active   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ MobileFooterMenu                    │
├─────────────────────────────────────┤
│ Check item.matchPaths + item.path:  │
│ Dashboard: /dashboard != location   │
│ Customers: /customers != location   │
│ Inventory: /inventory/ ✓ (matches)  │
│ More: always available              │
│                                     │
│ Style Inventory with active colors  │
└─────────────────────────────────────┘
```

## Page Component Loading

```
Router (App.tsx)
    │
    ▼
Wouter <Switch> component
    │
    ▼
Match current location to appRoutes
    │
    ▼
appRoutes = [
  { path: '/inventory', component: Inventory },
  { path: '/inventory/pricing', component: InventoryPricing },
  ...
]
    │
    ▼
Lazy load matched component:
lazy(() => import('@/pages/inventory/pricing'))
    │
    ▼
<Suspense fallback={<RouteLoadingFallback />}>
  <Component />
</Suspense>
    │
    ▼
Render wrapped in AppShell:
┌─────────────────────────────────────┐
│ TopNavigation (sticky)              │
├─────────────────────────────────────┤
│ [Page Content Component]            │
├─────────────────────────────────────┤
│ MobileFooterMenu (sticky)           │
└─────────────────────────────────────┘
```

## Navigation State Management

```
Component: TopNavigation
├─ State:
│  ├─ activeTab: string (resolved from location)
│  ├─ searchQuery: string
│  ├─ isMobileMenuOpen: boolean
│  └─ navigationSections: filtered array
│
├─ Effects:
│  ├─ useEffect: Update activeTab on location change
│  ├─ useEffect: Close mobile menu on location change
│  └─ useEffect: Measure nav height for CSS variable
│
└─ Event Handlers:
   ├─ handleQuickAction(target: string)
   ├─ resolveActiveTab(pathname: string)
   └─ Click handlers for tabs, menus, buttons

Component: MobileFooterMenu
├─ State:
│  ├─ isMenuOpen: boolean (overlay menu)
│  ├─ primaryNavItems: filtered items
│  └─ allNavItems: filtered items
│
├─ Effects:
│  └─ useEffect: Close menu on location change
│
└─ Event Handlers:
   ├─ handleNavClick(item: MobileNavItem)
   ├─ isPathActive(item: MobileNavItem)
   └─ normalizePath(path: string)
```

## Authentication Guard Pattern

```
┌──────────────────────────────────────┐
│ App.tsx Router Component             │
└──────────┬───────────────────────────┘
           │
           ▼
  ┌─────────────────────┐
  │ useAuth()           │
  │ ├─ isLoading        │
  │ ├─ isAuthenticated  │
  │ └─ user             │
  └─────────┬───────────┘
            │
     ┌──────┴──────────────────────┐
     │                             │
     ▼                             ▼
┌──────────────┐           ┌──────────────────┐
│ isLoading    │           │ !authenticated   │
│ Show         │           │ Show Landing/    │
│ Spinner      │           │ Login            │
└──────────────┘           └──────────────────┘
     
                    ▼
              ┌────────────────────┐
              │ isAuthenticated    │
              │ Show AppShell      │
              │ + Filtered Routes  │
              └────────────────────┘
```

## Deep Linking Examples

```
URL: http://localhost:5173/

Step 1: Router matches "/" → Sitemap component
Step 2: Load page
Step 3: Top navigation highlights default section

URL: http://localhost:5173/inventory/lot-management

Step 1: Router matches "/inventory/lot-management" → InventoryLotManagement
Step 2: Load page
Step 3: Top navigation:
   - Detects path starts with "/inventory"
   - Sets activeTab = 'inventory'
   - Shows Inventory dropdown
   - Highlights "Lot Management" in dropdown
Step 4: Mobile footer:
   - Detects /inventory prefix
   - Highlights Inventory tab

URL: http://localhost:5173/customers/detail/abc123

Step 1: Router matches "/customers/detail/:id" → CustomersDetail
Step 2: Load page with id="abc123"
Step 3: Top navigation:
   - Detects path starts with "/customers" 
   - Sets activeTab = 'crm'
   - Shows CRM & Leads dropdown
   - Highlights "Customer Detail" in dropdown
```

## Component Lifecycle Sequence

```
1. User clicks: Inventory section in TopNav dropdown

    TopNav onClick handler
         │
         ▼
    Link href="/inventory"
         │
         ▼
    Wouter updates location
         │
         ▼
    App.tsx Router re-renders
         │
         ▼
    Route matches /inventory
         │
         ▼
    lazy(() => import('/pages/inventory'))
         │
         ▼
    <Suspense> shows fallback
         │
         ▼
    Component loads
         │
         ▼
    MobileFooterMenu closes (useEffect)
         │
         ▼
    TopNav resolveActiveTab updates activeTab
         │
         ▼
    Inventory section highlighted
         │
         ▼
    Page displayed in AppShell

2. User scrolls content

    MobileLayout scrolls main element
         │
         ▼
    Sticky TopNav stays at top
         │
         ▼
    Sticky MobileFooterMenu stays at bottom
         │
         ▼
    Content scrolls in middle

3. User resizes window (desktop)

    Window resize event
         │
         ▼
    TopNav resizeObserver triggers
         │
         ▼
    Update CSS variable --top-nav-height
         │
         ▼
    Main content adjusts padding
```

## Summary of Navigation Architecture

```
┌─────────────────────────────────────────────────────┐
│ ENTRY POINT: main.tsx → App.tsx                     │
├─────────────────────────────────────────────────────┤
│ ROUTING ENGINE: Wouter                              │
│ Routes defined in: routes/index.tsx (165+ routes)  │
├─────────────────────────────────────────────────────┤
│ NAVIGATION CONFIGURATION: config/navigation.ts      │
│ ├─ WORKFLOW_SECTIONS: 8 main sections               │
│ ├─ MOBILE_PRIMARY_NAV_ITEMS: 4 items                │
│ ├─ MOBILE_ALL_NAV_ITEMS: 13 items                   │
│ └─ QUICK_ACTIONS: 3 items                           │
├─────────────────────────────────────────────────────┤
│ NAVIGATION COMPONENTS:                              │
│ ├─ TopNavigation (desktop/mobile combo)             │
│ ├─ Sidebar/CollapsibleSidebar (alternative)         │
│ ├─ MobileFooterMenu (mobile 4-tab bar)              │
│ └─ MobileNav (sheet drawer)                         │
├─────────────────────────────────────────────────────┤
│ LAYOUT WRAPPER: AppShell → MobileLayout             │
│ ├─ Header (TopNavigation)                           │
│ ├─ Main content (routed pages)                      │
│ └─ Footer nav (MobileFooterMenu)                    │
├─────────────────────────────────────────────────────┤
│ AUTH GUARD: useAuth() hook                          │
│ ├─ Filters routes by allowedRoutes                  │
│ ├─ Filters sections by navigationSections           │
│ └─ Shows Landing/Login if unauthorized              │
├─────────────────────────────────────────────────────┤
│ RESPONSIVE: Mobile-first design                     │
│ ├─ Mobile (< md): Bottom bar + overlay menu         │
│ ├─ Tablet (md-lg): Combination                      │
│ └─ Desktop (lg+): Top dropdown menus                │
└─────────────────────────────────────────────────────┘
```


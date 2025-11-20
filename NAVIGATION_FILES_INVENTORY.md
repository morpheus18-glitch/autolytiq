# AutolytiQ Navigation & Routing - Complete File Inventory

## Core Application Files

### Entry Point
- `/root/autolytiq/apps/frontend/src/main.tsx` - React app entry point

### Main App Component
- `/root/autolytiq/apps/frontend/src/App.tsx` - Root component with providers and router

---

## Routing Files

### Route Configuration
- `/root/autolytiq/apps/frontend/src/routes/index.tsx` - All route definitions (165+ routes)

---

## Navigation Components

### Top Navigation
- `/root/autolytiq/apps/frontend/src/components/top-navigation.tsx` (26KB, 540 lines)
  - Desktop dropdown navigation menu
  - Mobile hamburger menu integration
  - Search functionality
  - Quick actions menu
  - User profile dropdown
  - Real-time active state tracking
  - Role-based filtering

### Sidebar Navigation
- `/root/autolytiq/apps/frontend/src/components/sidebar.tsx` (8KB, 235 lines)
  - Full-page navigation sidebar
  - Organized by department sections
  - Mobile-responsive
  - Active route highlighting

### Collapsible Sidebar
- `/root/autolytiq/apps/frontend/src/components/collapsible-sidebar.tsx` (7KB, 212 lines)
  - Desktop-optimized collapsible navigation
  - Expanded/collapsed states
  - Mobile modal overlay
  - Keyboard navigation support
  - Accessibility features

### Mobile Footer Menu
- `/root/autolytiq/apps/frontend/src/components/mobile-footer-menu.tsx` (9KB, 234 lines)
  - Sticky bottom navigation bar (mobile)
  - 4-column grid layout
  - Full navigation overlay menu
  - Quick actions
  - User profile section

### Mobile Navigation Drawer
- `/root/autolytiq/apps/frontend/src/components/layout/mobile-nav.tsx` (2KB, 87 lines)
  - Mobile navigation sheet drawer
  - Basic navigation items (6 items)
  - Uses Sheet component

---

## Layout Components

### App Shell
- `/root/autolytiq/apps/frontend/src/components/layout/app-shell.tsx` (1KB, 24 lines)
  - Main shell component for authenticated users
  - Wraps all pages
  - Combines TopNavigation + MobileFooterMenu + content

### Mobile Layout
- `/root/autolytiq/apps/frontend/src/components/layouts/MobileLayout.tsx` (2KB, 101 lines)
  - Responsive container layout
  - Handles viewport height calculations
  - Supports header and footer navigation
  - Safe area handling

---

## Configuration Files

### Navigation Configuration
- `/root/autolytiq/apps/frontend/src/config/navigation.ts` (6KB, 241 lines)
  - WORKFLOW_SECTIONS: 8 main navigation sections
  - MOBILE_PRIMARY_NAV_ITEMS: 4 primary items
  - MOBILE_ALL_NAV_ITEMS: 13 total items
  - QUICK_ACTIONS: 3 quick action items
  - Navigation interfaces and types

### API Configuration
- `/root/autolytiq/apps/frontend/src/config/api.ts`
  - API endpoint configuration

---

## Pages Directory Structure

### Root Pages
- `/root/autolytiq/apps/frontend/src/pages/dashboard.tsx` - Main dashboard
- `/root/autolytiq/apps/frontend/src/pages/login.tsx` - Login page
- `/root/autolytiq/apps/frontend/src/pages/landing.tsx` - Landing page
- `/root/autolytiq/apps/frontend/src/pages/customers.tsx` - Customers
- `/root/autolytiq/apps/frontend/src/pages/inventory.tsx` - Inventory
- `/root/autolytiq/apps/frontend/src/pages/deals.tsx` - Deals
- `/root/autolytiq/apps/frontend/src/pages/settings.tsx` - Settings
- `/root/autolytiq/apps/frontend/src/pages/sitemap.tsx` - Sitemap
- `/root/autolytiq/apps/frontend/src/pages/not-found.tsx` - 404 page

### Admin Pages (20+ files)
- `/root/autolytiq/apps/frontend/src/pages/admin/users.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/user-profile.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/user-management.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/user-permissions.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/training-center.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/system-settings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/system-configuration.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/security-center.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/roles.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/role-management.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/role-presets.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/performance-tracking.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/lead-distribution.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/integration-setup.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/departments.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/dealer-configuration.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/comprehensive-settings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/communication-settings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/ml-developer.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/ml-model-comparison.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/system-health.tsx`
- `/root/autolytiq/apps/frontend/src/pages/admin/multi-store.tsx`

### Accounting Pages (18+ files)
- `/root/autolytiq/apps/frontend/src/pages/accounting/accounting-dashboard.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/vehicle-profit.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/transactions.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/reports.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/monthly-close.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/finance-reserves.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/deal-finalization.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/chart-of-accounts.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/TaxReports.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/PayrollCalculation.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/Payroll.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/PLStatement.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/JournalEntryForm.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/JournalEntries.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/GLAccounts.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/GLAccountForm.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/CashFlowStatement.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/BalanceSheet.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/AccountingLayout.tsx`
- `/root/autolytiq/apps/frontend/src/pages/accounting/AccountingDashboard.tsx`

### Analytics Pages (2 files)
- `/root/autolytiq/apps/frontend/src/pages/analytics/crm-analytics.tsx`
- `/root/autolytiq/apps/frontend/src/pages/analytics/customer-lifecycle.tsx`

### Auth Pages (2 files)
- `/root/autolytiq/apps/frontend/src/pages/auth/forgot-password.tsx`
- `/root/autolytiq/apps/frontend/src/pages/auth/reset-password.tsx`

### Communications Pages (5 files)
- `/root/autolytiq/apps/frontend/src/pages/communications/communication-center.tsx`
- `/root/autolytiq/apps/frontend/src/pages/communications/call-center.tsx`
- `/root/autolytiq/apps/frontend/src/pages/communications/email-composer.tsx`
- `/root/autolytiq/apps/frontend/src/pages/communications/sms-inbox.tsx`
- `/root/autolytiq/apps/frontend/src/pages/communications/demo.tsx`

### Customer Pages (4 files)
- `/root/autolytiq/apps/frontend/src/pages/customers/detail.tsx`
- `/root/autolytiq/apps/frontend/src/pages/customers/profile.tsx`
- `/root/autolytiq/apps/frontend/src/pages/customers/phone-calls.tsx`
- `/root/autolytiq/apps/frontend/src/pages/customers/texting-portal.tsx`

### Desking Pages (5 files)
- `/root/autolytiq/apps/frontend/src/pages/desking/InitialPencil.tsx`
- `/root/autolytiq/apps/frontend/src/pages/desking/DeskingWorkspace.tsx`
- `/root/autolytiq/apps/frontend/src/pages/desking/DealComparison.tsx`
- `/root/autolytiq/apps/frontend/src/pages/desking/CustomerCounter.tsx`
- `/root/autolytiq/apps/frontend/src/pages/desking/ApprovalAnalysis.tsx`

### Deal Pages (1 file)
- `/root/autolytiq/apps/frontend/src/pages/deals/deal-desk.tsx`

### Inventory Pages (6 files)
- `/root/autolytiq/apps/frontend/src/pages/inventory/detail.tsx`
- `/root/autolytiq/apps/frontend/src/pages/inventory/pricing.tsx`
- `/root/autolytiq/apps/frontend/src/pages/inventory/vehicle-detail.tsx`
- `/root/autolytiq/apps/frontend/src/pages/inventory/trade-appraisals.tsx`
- `/root/autolytiq/apps/frontend/src/pages/inventory/competitive-pricing.tsx`
- `/root/autolytiq/apps/frontend/src/pages/inventory/lot-management.tsx`

### Finance Pages (4 files)
- `/root/autolytiq/apps/frontend/src/pages/finance/rates.tsx`
- `/root/autolytiq/apps/frontend/src/pages/finance/lenders.tsx`
- `/root/autolytiq/apps/frontend/src/pages/finance/finance-reports.tsx`
- `/root/autolytiq/apps/frontend/src/pages/finance/compliance-manager.tsx`

### Leads Pages (4 files)
- `/root/autolytiq/apps/frontend/src/pages/leads/LeadsDashboard.tsx`
- `/root/autolytiq/apps/frontend/src/pages/leads/LeadDetail.tsx`
- `/root/autolytiq/apps/frontend/src/pages/leads/lead-management.tsx`
- `/root/autolytiq/apps/frontend/src/pages/leads/market-leads.tsx`

### Reports Pages (4 files)
- `/root/autolytiq/apps/frontend/src/pages/reports/financial.tsx`
- `/root/autolytiq/apps/frontend/src/pages/reports/inventory.tsx`
- `/root/autolytiq/apps/frontend/src/pages/reports/sales.tsx`
- `/root/autolytiq/apps/frontend/src/pages/reports/service.tsx`

### Service Pages (7 files)
- `/root/autolytiq/apps/frontend/src/pages/service/appointments.tsx`
- `/root/autolytiq/apps/frontend/src/pages/service/history.tsx`
- `/root/autolytiq/apps/frontend/src/pages/service/parts.tsx`
- `/root/autolytiq/apps/frontend/src/pages/service/reports.tsx`
- `/root/autolytiq/apps/frontend/src/pages/service/schedule.tsx`
- `/root/autolytiq/apps/frontend/src/pages/service/service-orders.tsx`
- `/root/autolytiq/apps/frontend/src/pages/service/service-overview.tsx`

### Settings Pages (12 files)
- `/root/autolytiq/apps/frontend/src/pages/settings/AnalyticsSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/BrandingSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/DataSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/DealershipSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/DeveloperSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/FormsSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/IntegrationsSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/NotificationsSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/PricingRulesSettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/SecuritySettings.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/SettingsLayout.tsx`
- `/root/autolytiq/apps/frontend/src/pages/settings/UsersSettings.tsx`

### Misc Pages (50+ files)
- Multiple demonstration and testing pages in `/root/autolytiq/apps/frontend/src/pages/misc/`

### Backup Pages (Deprecated)
- Multiple backup pages in `/root/autolytiq/apps/frontend/src/_backup/pages/`

---

## Feature-Specific Navigation

### Finance & Insurance Feature
- `/root/autolytiq/apps/frontend/src/features/fi/pages/ComplianceEngine.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/CreditApplication.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/CreditBureau.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/DealFunding.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/DealJacket.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/DocumentSigning.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/FIManagerDashboard.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/LenderSubmission.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/MenuPresentation.tsx`
- `/root/autolytiq/apps/frontend/src/features/fi/pages/ProductContracts.tsx`

---

## Component Library

### UI Components (in `/root/autolytiq/apps/frontend/src/components/ui/`)
- `alert-dialog.tsx`
- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `checkbox.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `form.tsx`
- `input.tsx`
- `label.tsx`
- `menubar.tsx`
- `module-header.tsx`
- `navigation-menu.tsx`
- `popover.tsx`
- `progress.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `skeleton.tsx`
- `slider.tsx`
- `switch.tsx`
- `tab-navigation.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toast.tsx`
- `toaster.tsx`
- `tooltip.tsx`

---

## Custom Components by Domain

### Accounting Components
- `/root/autolytiq/apps/frontend/src/components/accounting/`

### Admin Components
- `/root/autolytiq/apps/frontend/src/components/admin/`

### Communications Components
- `/root/autolytiq/apps/frontend/src/components/communications/`

### Deal Desk Components
- `/root/autolytiq/apps/frontend/src/components/deal-desk/`

### Desking Components
- `/root/autolytiq/apps/frontend/src/components/desking/`

### Inventory Components
- `/root/autolytiq/apps/frontend/src/components/inventory/`

### Leads Components
- `/root/autolytiq/apps/frontend/src/components/leads/`

### Search Components
- `/root/autolytiq/apps/frontend/src/components/search/`

### Settings Components
- `/root/autolytiq/apps/frontend/src/components/settings/`

### Enterprise Components
- `/root/autolytiq/apps/frontend/src/components/enterprise/`

### Loose Components
- `/root/autolytiq/apps/frontend/src/components/loose/`

### Workspace Components
- `/root/autolytiq/apps/frontend/src/components/workspace/`

---

## Hooks

### Custom Hooks (in `/root/autolytiq/apps/frontend/src/hooks/`)
- `useAuth.tsx` - Authentication state management
- `useIsMobile.tsx` - Mobile device detection
- `use-scroll-lock.tsx` - Body scroll locking
- Other utility hooks for state management

---

## Utilities & Libraries

### Library Functions (in `/root/autolytiq/apps/frontend/src/lib/`)
- `utils.ts` - Common utility functions
- `userHomePath.ts` - Dashboard path resolution
- `queryClient.ts` - React Query configuration
- Other utility modules

---

## Context Providers

### Context Files (in `/root/autolytiq/apps/frontend/src/contexts/`)
- `theme-context.tsx` - Theme provider (light/dark mode)

---

## Store Management

### Zustand Stores (in `/root/autolytiq/apps/frontend/src/stores/`)
- Various state management stores

---

## Styling

### Global Styles
- `/root/autolytiq/apps/frontend/src/index.css` - Global CSS (12KB)
- `/root/autolytiq/apps/frontend/src/styles/` - Additional style files

### Tailwind Configuration
- `/root/autolytiq/tailwind.config.ts` - Tailwind CSS configuration

---

## Total File Count Summary

- **Navigation Components**: 5 main files
- **Layout Components**: 2 main files
- **Configuration Files**: 2 main files
- **Route Definitions**: 1 main file
- **Core App Files**: 2 main files (main.tsx, App.tsx)
- **Page Components**: 150+ files across all departments
- **UI Component Library**: 30+ components
- **Domain-Specific Components**: 40+ component files
- **Custom Hooks**: 3+ files
- **Utilities**: 4+ files
- **Context/Store**: 3+ files
- **Feature Pages**: 10+ files (Finance & Insurance)

**Grand Total: 250+ navigation and routing related files**

---

## Key File Relationships

```
main.tsx
  ↓
App.tsx
  ├─ Router (uses routes/index.tsx)
  └─ AppShell (uses MobileLayout)
      ├─ TopNavigation (uses config/navigation.ts)
      ├─ [Page Component] (from routes)
      └─ MobileFooterMenu (uses config/navigation.ts)

Routes flow:
routes/index.tsx
  ├─ Lazy imports 150+ page components
  └─ Used by App.tsx Router

Navigation config:
config/navigation.ts
  ├─ WORKFLOW_SECTIONS (used by TopNavigation, CollapsibleSidebar)
  ├─ MOBILE_PRIMARY_NAV_ITEMS (used by MobileFooterMenu)
  ├─ MOBILE_ALL_NAV_ITEMS (used by MobileFooterMenu overlay)
  └─ QUICK_ACTIONS (used by TopNavigation, MobileFooterMenu)
```

---

## Documentation Files Created

- `/root/NAVIGATION_AND_ROUTING_STRUCTURE.md` - Comprehensive documentation
- `/root/NAVIGATION_VISUAL_GUIDE.md` - Visual architecture diagrams
- `/root/NAVIGATION_FILES_INVENTORY.md` - This file (complete file listing)


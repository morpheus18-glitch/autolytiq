# AutolytiQ - Dealership Management System

## Overview

AutolytiQ is an enterprise-grade dealership management system providing a complete solution for managing vehicle inventory, sales, customer relationships, analytics, and competitive pricing intelligence for automotive dealerships. Key capabilities include web scraping, machine learning-powered pricing analysis, automated merchandising strategies, pixel tracking for customer insights, and a mobile-optimized deal desk. The system is built with a cloud-native microservices architecture approach, aimed at providing a professional dealership software experience.

## User Preferences

Preferred communication style: Simple, everyday language.

### Standard Format
When referring to layout, format, or styling, use the term **"Standard"** which means:
- **Layout**: UniformPage wrapper component for consistent page structure
- **Styling**: Tailwind CSS utility classes (inline, no separate CSS files)
- **UI Components**: shadcn/ui library (Card, Table, Dialog, Button, etc.)
- **Icons**: Lucide React
- **Mobile-First**: Responsive breakpoints (mobile → sm: → md: → lg:)
- **Spacing**: Mobile padding `px-4 py-4`, desktop `lg:px-8 lg:py-8`
- **Colors**: Gray neutrals, blue primary, green success, amber/orange warnings, with dark mode variants
- **Locked Pages**: Home = `/` (Dashboard with tabs), Inventory = `/inventory` (vehicle list with ML pricing)

## Recent Changes

### Multi-Tenant Dealer Configuration (October 2025)
- **Dealer Configuration System**: Added comprehensive dealer management at `/admin/dealer-config` with 8 operational tabs:
  - General Settings: Store info, business hours, messaging templates
  - Lead Management: Lead sources, assignment rules, scoring, follow-up automation
  - Finance & Products: Lenders (credit tiers A+ to D with rates/terms), backend products (warranty/GAP/maintenance with cost/retail/profit), finance defaults (APR, terms, fees)
  - Tax Configuration: Jurisdiction-based tax rules, fee structures, trade credit rules
  - User Management: Roles, permissions, performance tracking
  - Inventory Settings: Stock number formats, pricing rules, photo requirements
  - Service Settings: Labor rates, job codes, service packages
  - Parts Settings: Parts catalog, pricing matrices, vendor management
- **Database Schema**: Extended multi-tenant architecture with 4 new tables in deal-jacket-schema.ts:
  - `store_lenders`: Credit tiers (A+ through D) with rates, LTV limits, max terms per tier
  - `store_product_presets`: Backend products (warranty, GAP, maintenance, tire/wheel) with default retail/cost/terms
  - `store_finance_settings`: Default APR (6.99%), available terms (36-84mo), fees (doc/title/registration/filing), tax calculation rules
  - `store_page_settings`: Page-specific UI/UX preferences and field configurations
- **API Implementation**: Backend routes with proper Zod validation and PostgreSQL persistence:
  - GET/POST `/api/dealer-config/lenders/:storeId` - Fetch and create lender configurations
  - GET/POST `/api/dealer-config/products/:storeId` - Fetch and create product presets
  - GET/POST `/api/dealer-config/finance/:storeId` - Fetch and create finance settings  
  - GET/POST `/api/dealer-config/page-settings/:storeId/:pageName` - Fetch and create page-specific settings
- **Integration Ready**: System designed to provide dealer-specific defaults to professional deal desk, inventory pricing, lead management, and all operational pages
- **Deal Desk Integration**: Professional deal desk loads dealer product presets (warranty/GAP/maintenance with retail/cost), finance settings (default APR/terms), and dynamically populates backend products with dealer-specific defaults
- **⚠️ Multi-Tenant Incomplete**: Currently uses first available store from database as temporary solution. **Requires proper implementation**:
  1. Add `storeId` field to users table in shared/schema.ts
  2. Update auth system to include user's store in session (server/auth.ts)
  3. Expose storeId via `/api/auth/user` endpoint  
  4. Update deal desk to use authenticated user's storeId instead of fetching from /api/stores
  5. Block all dealer config queries until legitimate storeId is available
  - **Security Risk**: Current implementation allows potential cross-dealership data exposure

### Dashboard & Component Cleanup (October 2025)
- **Consolidated Dashboards**: Removed 7 duplicate ML/enterprise dashboard pages, keeping only the main production dashboard at `/` with tabbed interface (Production, Overview, Intelligence, Lifecycle, Workflows, Reports, Health)
- **Cleaned Routes**: Removed duplicate routes for ml-dashboard, ml-control, ml-enterprise, mlops-dashboard, causal-mlops
- **User Navigation**: Fixed dropdown menu - Profile, Security, and Preferences are now clickable links to `/admin/user-profile`, `/admin/security-center`, and `/admin/system-settings`
- **FI Dashboard**: Consolidated FI dashboard to use component wrapper pattern
- **Removed Components**: Deleted unused widgets and duplicate dashboard components (production-dashboard.tsx, enterprise-dashboard-integration.tsx, advanced-analytics-dashboard.tsx, ml-dashboard-widget.tsx)
- **Canonical Audit Cleanup**: Ran canonical audit script to identify and remove 6 duplicate files:
  - Removed client/src/components/advanced-search.tsx (kept search/advanced-search.tsx)
  - Removed client/src/components/mobile-responsive-layout.tsx (kept layout/mobile-responsive-layout.tsx)
  - Removed client/src/components/ui/sidebar.tsx (kept components/sidebar.tsx)
  - Removed client/src/components/enterprise/system-health.tsx (kept pages/system-health.tsx)
  - Removed unused inventory-table.tsx duplicates (both component and inventory versions)
  - Updated imports and defined SearchFilters interface in use-advanced-search.ts hook
- **Showroom Manager Rebuild**: Completely rebuilt `/showroom-manager` with Standard format:
  - Live floor manager for active customers on the lot (replacing old mock-data version)
  - Real-time session tracking with active/completed/sold/conversion metrics
  - Quick action buttons: Work Deal, Add Vehicle, Add Notes, Trade-In, Call, Text, View Profile
  - Clickable customer names navigate to customer detail pages
  - Trade-in display section with vehicle and value tracking
  - Mobile-optimized card layout with all functionality accessible on phone/tablet
  - Integration with professional deal desk, CRM, and texting portal

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **UI/UX Decisions**: Professional top navbar with dropdowns, mobile-optimized interfaces, responsive design system, and a brand-consistent color scheme (blue, green, dark charcoal).

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (using Neon Database)
- **API Pattern**: RESTful API with JSON responses
- **Session Management**: PostgreSQL-backed sessions
- **ML Backend**: Python-based modular ML system with autonomous scraping and XGBoost models, integrated via a TypeScript layer.
- **Architectural Principles**: Cloud-native, microservices-ready, event-driven patterns, and scalable technology stack.

### Key Features & Design Choices
- **Dashboard**: Centralized overview with metrics, inventory, competitive insights, and activity feed. Quick action cards use client-side navigation with Button asChild pattern for proper accessibility.
- **Inventory Management**: CRUD operations with search, filtering, ML-powered pricing insights, and VIN→Stock auto-generation. Table rows are clickable and navigate using client-side routing (setLocation) to preserve SPA state and React Query cache.
- **Sales & Leads**: Tracking and management with status progression. All sales entries clickable from customer detail pages.
- **Customer Management**: CRM functionalities including lifecycle tracking and behavioral analytics. Table rows clickable with client-side navigation, detail pages include "Create Deal" action buttons.
- **Analytics**: Performance metrics, data visualization, and comprehensive reporting.
- **Competitive Pricing**: ML-powered analysis, market trends, and automated merchandising.
- **Pixel Tracking**: Customer behavior and visitor insights for online journey mapping across all customer touchpoints.
- **Professional Deal Desk** (single unified page at /professional-deal-desk): Production-ready desking with:
  - **Professional Deal Desk**: Full-featured desking tool (not calculator-only) with:
    - Vehicle/customer selection from inventory/CRM with auto-populate
    - Clickable vehicle/customer info panels that navigate to detail pages for complete workflow loops
    - Monthly payment calculator with APR (6.99%) and term selection (36-84 months)  
    - Backend products (warranty, GAP, maintenance, tire/wheel) with retail/cost/profit tracking
    - Accurate tax/payment calculations including all products (no double-counting)
    - Deal persistence to database with product save via /api/deals/{id}/products
    - Professional tabbed UI: Structure, Backend, Summary, Profit Analysis
    - Mobile-optimized interface for showroom use
    - Debounced autosave (2 seconds after editing stops) to prevent data loss
  - Trade-in tax credit support (tax on net-of-trade or full price by jurisdiction)
  - Negative equity handling (rolls into amount financed)
  - Jurisdiction-based tax and fee calculations
  - Comprehensive audit trail for all deal changes
  - Reciprocal navigation: Deal desk → Customer detail, Customer detail → Deal desk, Inventory detail → Deal desk
- **VIN Services**: Auto-generates stock numbers from VIN (last 8 chars, uppercase) with manual override capability and audit logging.
- **Tax & Fee Engine**: Production database architecture for:
  - ZIP→State/County/City jurisdiction resolution
  - State-specific tax rules (trade credit, compound taxes, different bases)
  - DMV fee catalogs (title, registration, doc fees)
  - Calculation versioning and audit trails
  - Lease program residuals and money factors
- **AI Negotiation Assistant**: OpenAI-powered deal analysis providing deal scoring, close probability, strategic recommendations, counter-offer generation (conservative/moderate/aggressive), objection handlers, and talking points for sales teams. Includes smart defaults when AI is unavailable.
- **Security**: SSL certificates, HTTPS redirection, security headers (HSTS, CSP), and authentication middleware.
- **Navigation Pattern**: All navigation uses client-side routing (wouter's setLocation or Link component) to preserve SPA state and React Query cache. Button/Link combinations use asChild pattern to avoid nested interactive elements and maintain accessibility compliance.
- **Data Flow**: Client (React Query) -> API (Express) -> Business Logic -> Data Layer (Drizzle ORM) -> PostgreSQL.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **drizzle-zod**: Schema validation integration
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### ML Backend Dependencies
- **pandas**: Data manipulation
- **numpy**: Numerical computing
- **scikit-learn**: Machine learning library
- **xgboost**: Gradient boosting framework
- **selenium**: Web browser automation
- **undetected-chromedriver**: Stealth browser automation
- **flask**: Web framework for ML API
- **NHTSA vPIC**: Free VIN decoder API
- **VinCheck.info**: Free market pricing API
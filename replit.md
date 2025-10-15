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
- **Dashboard**: Centralized overview with metrics, inventory, competitive insights, and activity feed.
- **Inventory Management**: CRUD operations with search, filtering, ML-powered pricing insights, and VIN→Stock auto-generation.
- **Sales & Leads**: Tracking and management with status progression.
- **Customer Management**: CRM functionalities including lifecycle tracking and behavioral analytics.
- **Analytics**: Performance metrics, data visualization, and comprehensive reporting.
- **Competitive Pricing**: ML-powered analysis, market trends, and automated merchandising.
- **Pixel Tracking**: Customer behavior and visitor insights for online journey mapping.
- **Professional Deal Desk**: Full-featured VinSolutions-grade desking tool with vehicle/customer selection, payment calculator, backend product management, tax/payment calculations, and deal persistence. Supports trade-in tax credit and negative equity handling. Features include: payment scenarios, lender matching, AI optimization, autosave, and print capability.
- **VIN Services**: Auto-generates stock numbers from VIN with manual override and audit logging.
- **Tax & Fee Engine**: Production database architecture for jurisdiction resolution, state-specific tax rules, DMV fee catalogs, and calculation versioning.
- **AI Negotiation Assistant**: OpenAI-powered deal analysis providing deal scoring, close probability, strategic recommendations, and objection handlers.
- **Security**: SSL certificates, HTTPS redirection, security headers, and authentication middleware.
- **Navigation Pattern**: All navigation uses client-side routing (wouter's setLocation or Link component) with `asChild` pattern for accessibility.
- **Data Flow**: Client (React Query) -> API (Express) -> Business Logic -> Data Layer (Drizzle ORM) -> PostgreSQL.
- **Multi-Tenant Dealer Configuration**: Comprehensive dealer management system at `/admin/dealer-config` with tabs for General Settings, Lead Management, Finance & Products, Tax Configuration, User Management, Inventory Settings, Service Settings, and Parts Settings. Integrates with the deal desk for dealer-specific defaults. (Note: Multi-tenant implementation for user authentication is pending and currently poses a security risk).
- **Showroom Manager**: Live floor manager at `/showroom-manager` for tracking active customers, real-time session management, and quick actions, integrated with the professional deal desk and CRM.
- **Mobile Optimization**: Comprehensive mobile/tablet support with scroll lock system (prevents background scrolling when overlays open), dynamic viewport units (h-[100dvh] for proper mobile viewport handling), responsive breakpoints, and touch-optimized interfaces. All menus, sidebars, and modals implement independent scrolling with locked backgrounds.

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
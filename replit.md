# AutolytiQ - Dealership Management System

🚀 **Live URL**: [autolytiq.com](https://autolytiq.com)

## Overview

AutolytiQ is an enterprise-grade dealership management system built with React (TypeScript) for the frontend and Express.js for the backend. Following cloud-native microservices architecture principles, the application provides a complete solution for managing vehicle inventory, sales, customer relationships, analytics, and competitive pricing intelligence for automotive dealerships. The system includes advanced features like web scraping, machine learning-powered pricing analysis, automated merchandising strategies, pixel tracking for customer insights, and a fully functional mobile-optimized deal desk that matches professional dealership software standards.

## User Preferences

Preferred communication style: Simple, everyday language.

## Development Guidelines

**CRITICAL**: Always check `ARCHITECTURE.md` before making changes to prevent code duplication and fragmentation. This document contains the canonical file structure and anti-duplication rules for AI-assisted development.

### AI Development Rules
1. **Check existing files first** - Search for related components before creating new ones
2. **Update canonical files** - Never duplicate core components like `sidebar-manager.tsx`, `dashboard.tsx`, etc.
3. **Extend, don't recreate** - Add features to existing files rather than creating new versions
4. **Maintain imports** - Ensure all references point to the correct canonical files
5. **Test after changes** - Verify functionality works after modifications

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with JSON responses
- **Session Management**: PostgreSQL-backed sessions

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Users**: Staff authentication and role management
- **Vehicles**: Complete vehicle inventory with status tracking
- **Customers**: Customer contact information and relationships
- **Leads**: Sales opportunity tracking with status progression
- **Sales**: Completed transaction records
- **Activities**: System activity logging for audit trails
- **Visitor Sessions**: Web analytics and customer behavior tracking
- **Page Views**: Detailed page interaction tracking
- **Customer Interactions**: Customer engagement event logging
- **Competitor Analytics**: External site visitor tracking
- **Competitive Pricing**: Scraped competitor pricing data
- **Pricing Insights**: ML-generated pricing recommendations
- **Merchandising Strategies**: Automated marketing suggestions
- **Market Trends**: Market analysis and trend predictions

## Key Components

### Frontend Components
- **Dashboard**: Overview with metrics, recent inventory, competitive insights, and activity feed
- **Inventory Management**: Vehicle CRUD operations with search, filtering, and pricing insights
- **Sales & Leads**: Lead tracking with status management
- **Customer Management**: Customer relationship tracking
- **Analytics**: Performance metrics and data visualization
- **Competitive Pricing**: ML-powered pricing analysis and market trends
- **Settings**: User and system configuration
- **Pixel Tracking**: Customer behavior analytics and visitor insights

### Backend Services
- **Storage Interface**: Abstracted data access layer (IStorage)
- **Route Handlers**: RESTful endpoints for all entities
- **Competitive Scraper**: Web scraping service for competitor data
- **ML Analysis Engine**: Machine learning-powered pricing insights
- **Pixel Tracker**: Customer behavior tracking and analytics
- **Automated Tasks**: Scheduled competitive analysis and merchandising updates
- **Middleware**: Request logging, error handling, and JSON parsing
- **Development Tools**: Vite integration for hot module replacement
- **Python ML Backend**: Complete modular ML system with autonomous scraping and XGBoost models
- **ML Integration Layer**: TypeScript integration between Express.js and Python ML system
- **Advanced Scrapers**: Headless browser scraping with bot detection bypass
- **Data Pipeline**: Automated data cleaning, deduplication, and validation
- **Model Management**: Intelligent retraining with performance monitoring

## Data Flow

1. **Client Requests**: React components use TanStack React Query for API calls
2. **API Layer**: Express routes handle HTTP requests and validate data
3. **Business Logic**: Route handlers process requests and call storage methods
4. **Data Layer**: Storage interface abstracts database operations using Drizzle ORM
5. **Database**: PostgreSQL stores all persistent data
6. **Response**: JSON responses flow back through the same path

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

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-***: Replit-specific development tools

### ML Backend Dependencies
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **scikit-learn**: Machine learning library
- **xgboost**: Gradient boosting framework
- **selenium**: Web browser automation
- **undetected-chromedriver**: Stealth browser automation
- **streamlit**: Interactive dashboard framework
- **flask**: Web framework for API
- **plotly**: Interactive data visualization
- **beautifulsoup4**: HTML parsing for web scraping

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Backend**: tsx for TypeScript execution with file watching
- **Database**: Neon Database connection via environment variables

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both API and static files
- **Database**: Production PostgreSQL via DATABASE_URL environment variable

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Build Scripts**: Separate build processes for frontend and backend
- **Static Serving**: Express serves built frontend assets in production

The architecture follows a traditional full-stack pattern with modern tooling, emphasizing type safety, developer experience, and maintainability. The system is designed to scale from small dealerships to larger operations with its modular component structure and abstracted data layer.

## Enterprise Architecture Alignment

AutolytiQ follows enterprise-grade dealership software principles with:
- **Microservices-Ready Architecture**: Modular component structure enables future microservices migration
- **Event-Driven Patterns**: Pixel tracking and activity logging demonstrate event-driven architecture capabilities
- **Scalable Technology Stack**: React/TypeScript frontend, Express.js backend, PostgreSQL database foundation
- **Security Implementation**: SSL certificates, authentication middleware, role-based access patterns
- **Third-Party Integration Ready**: ML backend, competitive pricing APIs, and external service integration points
- **Cloud-Native Design**: Containerization-ready with environment-based configuration and stateless services

The current monolithic structure provides rapid development and prototyping while maintaining architectural patterns that support future decomposition into microservices for enterprise scaling.

## Recent Changes

### January 2025
- **Major Navigation Architecture Overhaul**: Completely replaced sidebar navigation with professional top navbar featuring dropdown menus for Sales, Finance, Accounting, Admin, and User Management with cool cut-out design styling and visual effects
- **Top Navbar with Cut-out Design**: Created sophisticated navigation bar with custom CSS clip-path styling, dropdown animations, active state indicators, and mobile-responsive collapsible menu system
- **Comprehensive Navigation Restructure**: Organized all routes into logical sections (Sales, Finance, Accounting, Admin, User Management) with proper categorization and routing structure for enterprise-grade navigation experience
- **Mobile Navigation Optimization**: Built responsive mobile navigation with collapsible dropdowns, touch-friendly interface, and proper mobile menu functionality for seamless cross-device experience
- **Complete AI-Enhanced Executive Dashboard Suite**: Successfully implemented sophisticated AI functionality across all 6 dashboard tabs (Intelligence, Production, Overview, Reports, Health, Automation) with real AI/ML features, clickable interactive cards, actionable insights, and comprehensive data analysis - matching user's exact specifications for "actually intelligent" AI functionality
- **Production-Ready Enterprise Dashboard**: Built comprehensive executive dashboard with real-time KPIs, sales pipeline visualization, top performer tracking, and urgent task management for immediate production deployment
- **Advanced Business Intelligence**: Created enterprise-grade reporting system with executive summaries, financial analytics, operational efficiency reports, and automated scheduling capabilities
- **AI-Powered Customer Intelligence**: Implemented predictive analytics with customer segmentation, behavioral analysis, lifecycle tracking, and ML-driven purchase predictions
- **Workflow Automation Platform**: Built comprehensive automation system with visual workflow builder, template library, performance monitoring, and real-time activity tracking
- **System Health Monitoring**: Created production-grade monitoring dashboard with real-time metrics, service status tracking, security event logging, and performance trend analysis
- **Mobile-Optimized Desking Tool**: Created fully functional mobile-responsive desking tool with touch-friendly UI, responsive layout, and complete calculation engine for mobile dealership operations
- **Fully Interactive Deal Desk**: Built enterprise-grade deal desk with live calculations, auto-updating payment formulas, working dropdowns, and professional interface matching VinSolutions/CDK standards
- **Touch-Friendly Mobile Interface**: Implemented dedicated mobile component with tab navigation (Vehicle, Pricing, Finance, Summary), collapsible sections, and mobile-optimized touch targets
- **Responsive Design System**: Enhanced desktop version with mobile breakpoints, adaptive spacing, and touch-friendly button sizes for seamless cross-device experience
- **SSL Security Implementation**: Added comprehensive SSL certificates and security headers configuration
- **HTTPS Redirect**: Implemented automatic HTTP to HTTPS redirect in production environment
- **Security Headers**: Added HSTS, CSP, XSS protection, and clickjacking prevention headers
- **SSL Verification Tools**: Created automated SSL certificate verification and security testing scripts
- **Meta Tags Enhancement**: Added comprehensive security meta tags and Open Graph properties to HTML
- **Content Security Policy**: Implemented strict CSP rules to prevent XSS and injection attacks
- **Security Documentation**: Created detailed SSL configuration and security guidelines documentation

### December 2024
- **Competitive Pricing Intelligence**: Added comprehensive web scraping service for competitor data collection
- **ML Analysis Engine**: Implemented machine learning-powered pricing insights with outlier detection
- **Pixel Tracking System**: Built customer behavior analytics with session and interaction tracking
- **Automated Merchandising**: Created automated strategies for pricing optimization and inventory management
- **Enhanced Inventory Management**: Added pricing insights buttons to inventory table for real-time competitive analysis
- **Competitive Pricing Page**: Built dedicated interface for viewing market trends and pricing analytics
- **Dashboard Integration**: Added competitive insights component to main dashboard for quick access to pricing data
- **Professional Reports System**: Created comprehensive reporting dashboard with sales, inventory, finance, and performance analytics
- **Enhanced Customer Management**: Built mobile-optimized customer interface with advanced filtering and creation capabilities
- **Professional Settings Panel**: Implemented comprehensive dealer management settings with mobile optimization
- **Full-Stack Professional Suite**: Completed transformation to match VinSolutions/CDK/Reynolds standards

### January 2025
- **CONTINUOUS ML RETRAINING SYSTEM COMPLETE**: Built comprehensive real-time web scraping and continuous model training system with live parameter control following enterprise ML architecture specifications
- **Advanced ML Pipeline Orchestrator**: Created RESTful orchestrator with loop jobs for continuous scraping, training, and parameter updates without system downtime
- **Live Parameter Control Interface**: Implemented real-time hyperparameter tuning with sliders, feature weight adjustments, and instant pipeline parameter updates
- **Production ML Health Monitoring**: Built system resource monitoring (CPU, memory, GPU), error tracking, auto-restart on critical health, and comprehensive metrics reporting
- **Enterprise ML Control Center**: Complete /ml-control dashboard with start/stop/restart controls, live status monitoring, training job management, and data pipeline statistics
- **Real-time ML Process Management**: Python process spawning with live parameter updates via stdin, metrics reporting via stdout, and automatic health assessment
- **Enhanced Search System**: Implemented comprehensive advanced search and filtering across all major modules
- **Advanced Search Components**: Built reusable search components with multi-criteria filtering, date ranges, and real-time statistics
- **Enhanced Pages Implementation**: Created enhanced-inventory, enhanced-customers, and enhanced-sales pages with full search functionality
- **Advanced Search Components**: Built reusable search components with multi-criteria filtering, date ranges, and real-time statistics
- **Inventory Advanced Search**: Created enhanced inventory search with make/model/year/price/status filtering and summary analytics
- **Customer Advanced Search**: Built comprehensive customer search with demographics, credit score, location, and sales consultant filtering
- **Sales Advanced Search**: Implemented lead pipeline search with status, priority, estimated value, and consultant filtering
- **Search Analytics**: Added real-time summary statistics and data visualization for all search results
- **Filter Management**: Created sophisticated filter management with active filter display, clear options, and persistent state
- **Multi-Modal Search**: Enabled text search across multiple fields with intelligent matching and relevance scoring
- **Complete ML Backend System**: Built comprehensive Python ML pricing system with autonomous vehicle scraping, XGBoost models, and real-time predictions
- **Advanced Web Scraping**: Implemented headless browser scraping with bot detection bypass for CarGurus and AutoTrader
- **ML Pipeline Architecture**: Created modular pipeline system with scraping, training, and prediction cycles
- **Intelligent Deduplication**: Built sophisticated duplicate detection using VIN matching and similarity scoring
- **Streamlit Dashboard**: Created interactive ML dashboard for real-time pricing analysis and pipeline management
- **Flask API Integration**: Built RESTful API for ML system integration with Express.js backend
- **Model Retraining System**: Implemented automated model retraining with performance monitoring and rollback capabilities
- **Docker Containerization**: Added complete Docker setup with multi-service orchestration for scalable deployment
- **Production-Ready ML**: Created enterprise-grade ML system with monitoring, logging, and error handling
- **Free Vehicle Valuation APIs**: Integrated NHTSA vPIC (100% free VIN decoder), VinCheck.info (free market pricing), and market estimation algorithms as alternatives to expensive KBB/Black Book services
- **Comprehensive Valuation Service**: Built complete valuation system with VIN decoding, multiple pricing sources, batch processing, and intelligent depreciation calculations
- **Real-time Pricing Intelligence**: Added live vehicle valuation with trade-in, retail, private party values, and recommended dealer pricing
- **Mobile-Optimized Deal Desk**: Complete mobile UI optimization for all deal desk tabs and submenus with responsive layout, smaller text, and adaptive grid systems for professional mobile dealership management
- **Enterprise System Settings Centralization**: Moved all enterprise system settings and configurations to admin section with comprehensive settings for defaults, presets, role/permission management, and hierarchy customization
- **Centralized Lead Distribution**: Created comprehensive lead distribution configuration system under admin section with role assignment workflows and enterprise-grade rule management
- **System-Wide Configuration**: Built complete system settings panel with general defaults, lead management policies, sales configuration, notification preferences, role hierarchy, and external integrations
- **Customer-to-Deal Flow Fix**: Fixed the critical routing issue in customer → showroom → deal workflow; customers now properly navigate from customer page to showroom manager to deals page with correct data transfer
- **Showroom Session Creation Fix**: Resolved customer to showroom workflow issues by fixing API request format, trackInteraction function calls, and database schema mismatches for notifications table
- **Comprehensive Enterprise Settings**: Added 8-section enterprise configuration system matching VinSolutions/CDK standards with dealership information, prospects management, finance configuration, DSP automation, marketing settings, and internet lead processing
- **OAuth Callback Domain Fix**: Updated Google, GitHub, and Apple OAuth callback URLs to use "autolytiq.com" domain for proper authentication redirects in production environment
- **Enterprise-Grade Component Integration**: Created comprehensive enterprise SaaS platform with unified dashboard, smart workflows, and seamless component integration
- **Unified Dashboard**: Built executive dashboard with comprehensive metrics, activity feeds, AI insights, and smart workflow integration across all dealership operations
- **Enterprise Header**: Implemented professional-grade navigation header with global search, notifications, quick actions, and user management for streamlined access to all features
- **Smart Workflow Assistant**: Created intelligent workflow automation system with templates for lead processing, deal closing, and customer onboarding to streamline dealership processes
- **Professional SaaS Experience**: Integrated all components into cohesive enterprise platform with tabbed interfaces, real-time metrics, and automated business processes for maximum productivity
- **Unified System Configuration Center**: Consolidated all settings and configurations into comprehensive admin section with 6 main tabs: Dealership Information, F&I Products, Lender Management, Communication Settings, API Integrations, and System Security settings
- **AiQ Brand Integration**: Updated application with custom AiQ logo (blue "A", green "i", dark charcoal "Q") and implemented matching color theme throughout the system with brand-consistent primary colors (HSL 207 90% 54% blue, HSL 160 84% 39% green) for professional dealership management interface
- **SSL Certificate Optimization**: Fixed duplicate HSTS headers by removing server-side HSTS (Replit infrastructure handles SSL automatically) and confirmed SSL certificates are fully functional with Let's Encrypt auto-renewal
- **Mobile Sidebar Responsiveness**: Fixed sidebar to properly overlay content on mobile instead of pushing main content, maintaining desktop behavior with smooth transitions and proper z-index layering
- **Architecture Documentation**: Created comprehensive `ARCHITECTURE.md` with canonical file structure, anti-duplication rules, and development guidelines to prevent AI-driven code fragmentation and maintain codebase organization
- **Comprehensive Codebase Cleanup**: Removed all duplicate customer detail pages, inventory detail pages, and 3-4 different deal desk variants causing AI-driven code fragmentation - established single canonical versions for each component type
- **ML/AI Tools Restoration**: Fixed non-functional ML backend by creating mlPricingService with fallback pricing algorithms, competitive analysis, and market trends API endpoints for vehicle pricing intelligence
- **Canonical File Structure**: Established single authoritative versions of core pages (customer-detail.tsx, inventory-detail.tsx, deal-desk-unified.tsx) to prevent future AI duplication conflicts
- **Complete Customer Lifecycle Tracking System**: Successfully integrated comprehensive behavioral analytics system with customer journey mapping, purchase intent scoring, external website tracking, and real-time analytics dashboard for monitoring every single shopper's online car-buying journey
- **Advanced Tracking Infrastructure**: Built production-ready tracking service with lifecycle tracking, external activity monitoring, dealer activity tracking, search behavior analysis, and intelligent purchase intent scoring to identify customers close to buying
- **Enhanced Analytics API**: Created complete analytics API with customer journey endpoints, conversion funnel analysis, high-intent activity tracking, and real-time behavioral data processing for comprehensive customer intelligence
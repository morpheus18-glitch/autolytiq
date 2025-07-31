# AutolytiQ - Dealership Management System

## Overview

AutolytiQ is an enterprise-grade dealership management system providing a complete solution for managing vehicle inventory, sales, customer relationships, analytics, and competitive pricing intelligence for automotive dealerships. Key capabilities include web scraping, machine learning-powered pricing analysis, automated merchandising strategies, pixel tracking for customer insights, and a mobile-optimized deal desk. The system is built with a cloud-native microservices architecture approach, aimed at providing a professional dealership software experience.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Inventory Management**: CRUD operations with search, filtering, and ML-powered pricing insights.
- **Sales & Leads**: Tracking and management with status progression.
- **Customer Management**: CRM functionalities including lifecycle tracking and behavioral analytics.
- **Analytics**: Performance metrics, data visualization, and comprehensive reporting.
- **Competitive Pricing**: ML-powered analysis, market trends, and automated merchandising.
- **Pixel Tracking**: Customer behavior and visitor insights for online journey mapping.
- **Deal Desk**: Fully functional, mobile-optimized, interactive deal calculation engine.
- **Security**: SSL certificates, HTTPS redirection, security headers (HSTS, CSP), and authentication middleware.
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
# Dealership Management Dashboard (DMD)

## Overview

This is a full-stack dealership management system built with React (TypeScript) for the frontend and Express.js for the backend. The application provides a comprehensive solution for managing vehicle inventory, sales, customer relationships, analytics, and competitive pricing intelligence for automotive dealerships. The system includes advanced features like web scraping, machine learning-powered pricing analysis, and automated merchandising strategies with pixel tracking for customer insights.

## User Preferences

Preferred communication style: Simple, everyday language.

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

## Recent Changes

### December 2024
- **Competitive Pricing Intelligence**: Added comprehensive web scraping service for competitor data collection
- **ML Analysis Engine**: Implemented machine learning-powered pricing insights with outlier detection
- **Pixel Tracking System**: Built customer behavior analytics with session and interaction tracking
- **Automated Merchandising**: Created automated strategies for pricing optimization and inventory management
- **Enhanced Inventory Management**: Added pricing insights buttons to inventory table for real-time competitive analysis
- **Competitive Pricing Page**: Built dedicated interface for viewing market trends and pricing analytics
- **Dashboard Integration**: Added competitive insights component to main dashboard for quick access to pricing data
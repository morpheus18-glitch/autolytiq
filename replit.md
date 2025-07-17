# Dealership Management Dashboard (DMD)

## Overview

This is a full-stack dealership management system built with React (TypeScript) for the frontend and Express.js for the backend. The application provides a comprehensive solution for managing vehicle inventory, sales, customer relationships, and analytics for automotive dealerships.

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

## Key Components

### Frontend Components
- **Dashboard**: Overview with metrics, recent inventory, and activity feed
- **Inventory Management**: Vehicle CRUD operations with search and filtering
- **Sales & Leads**: Lead tracking with status management
- **Customer Management**: Customer relationship tracking
- **Analytics**: Performance metrics and data visualization
- **Settings**: User and system configuration

### Backend Services
- **Storage Interface**: Abstracted data access layer (IStorage)
- **Route Handlers**: RESTful endpoints for all entities
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
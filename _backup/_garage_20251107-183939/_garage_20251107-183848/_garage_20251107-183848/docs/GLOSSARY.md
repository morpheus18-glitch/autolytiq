# Autolytiq Glossary

## Domain Terms

### Business Operations
- **DMS**: Dealer Management System - Core platform for dealership operations
- **CRM**: Customer Relationship Management - Lead and customer tracking
- **F&I**: Finance & Insurance - Deal financing and product sales
- **Desking**: Deal structuring and pricing analysis
- **Deal Studio**: Autolytiq's 3-panel deal desking cockpit interface

### Platform Architecture
- **Monorepo**: Single repository containing all services and packages
- **Multitenancy**: Architecture supporting multiple dealerships in one deployment
- **RLS**: Row-Level Security - Database-level tenant isolation
- **UniformShell**: Standardized navigation wrapper for all pages

### UI & Components
- **CVA**: Class Variance Authority - Component variant management system
- **@repo/ui**: Shared component library package
- **Layout Presets**: 3 standard layouts (ListDetail, FullDensity, FocusStudio)
- **Mobile-First**: Design approach prioritizing mobile experience

### Services & Infrastructure
- **gRPC**: High-performance RPC framework used by Rust services
- **Prisma**: TypeScript ORM for database access
- **K8s**: Kubernetes - Container orchestration platform
- **BullMQ**: Redis-based job queue system

### AI & ML
- **Deal Optimizer**: ML model for deal structure recommendations
- **Adaptive Scoring**: ML-based lead scoring that improves over time
- **Approval Predictor**: ML model predicting finance approval probability
- **Close Predictor**: ML model predicting deal close probability

### Development
- **Rust Microservices**: 4 high-performance services (pricing, cache, comms, rate limiter)
- **React Router**: Client-side routing library
- **TanStack Query**: Server state management
- **Zustand**: Client state management

## Package Naming

- **@repo/ui**: UI component library
- **@repo/tokens**: Design tokens (colors, spacing, typography)
- **@repo/db**: Database package with Prisma schema
- **@repo/frontend**: Main React application

## Acronyms

- **API**: Application Programming Interface
- **AWS**: Amazon Web Services
- **CI/CD**: Continuous Integration/Continuous Deployment
- **CSP**: Content Security Policy
- **DNS**: Domain Name System
- **ENV**: Environment (variables)
- **FE**: Frontend
- **BE**: Backend
- **JWT**: JSON Web Token
- **NHTSA**: National Highway Traffic Safety Administration (VIN decoder source)
- **RBAC**: Role-Based Access Control
- **REST**: Representational State Transfer
- **SPA**: Single Page Application
- **SQL**: Structured Query Language
- **SSL/TLS**: Secure Sockets Layer/Transport Layer Security
- **UI/UX**: User Interface/User Experience
- **VIN**: Vehicle Identification Number
- **WCAG**: Web Content Accessibility Guidelines
- **WS**: WebSocket

## Common Patterns

- **3-Panel Layout**: Customer Dossier | Live Simulator | AI Companion
- **Payment Lock**: Lock target payment, adjust other deal levers
- **Tenant Scoping**: All queries filtered by tenantId
- **Optimistic UI**: Show changes immediately, revert if failed
- **Error Boundaries**: React components that catch JS errors

## File Naming Conventions

- **UPPERCASE.md**: Major reference documents (README, AGENTS, CLAUDE)
- **kebab-case.md**: Standard documentation files
- **PascalCase.tsx**: React components
- **camelCase.ts**: TypeScript modules

# AutolytiQ

## Overview

AutolytiQ is an enterprise-grade retail automotive platform that consolidates CRM, inventory management, deal desking, F&I operations, and analytics into a unified dealership operations hub. The system combines React/TypeScript frontends with Node.js/Express APIs, Python-based ML services, and PostgreSQL as the source of truth. It serves multi-tenant dealerships with tenant-aware data isolation, role-based access control, and real-time workflow orchestration.

The platform replaces fragmented workflows found in traditional DMS systems (CDK, Reynolds & Reynolds, DealerSocket) with modern cloud-native architecture, ML-driven intelligence, and integrated third-party services for credit bureaus, lenders, OEM data sources, and market intelligence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure

**Client Layer** (`client/`)
- React 18 + Vite SPA with shadcn/ui design system built on Radix UI primitives
- TanStack Query for server state synchronization and caching
- TypeScript throughout with strict type safety
- Responsive layouts using Tailwind CSS with custom automotive design tokens
- Component library follows canonical single-source-of-truth pattern—extensions over duplicates

**Primary API Service** (`src/`)
- Express.js REST API with Prisma ORM for PostgreSQL
- Domain-driven service layer organizing CRM, deals, inventory, finance, and compliance logic
- BullMQ-powered job queues for background tasks (email, notifications, batch processing)
- Authentication/authorization with JWT and role-based permissions
- Integration adapters for OpenAI, Stripe, SendGrid, Twilio, and DMS connectors

**Legacy Gateway** (`server/`)
- Drizzle-based Express service maintaining backward compatibility
- Schema-driven routes exposing shared data structures
- Bridges legacy integrations while core services migrate to Prisma

**Modular Backend Service** (`backend/`)
- Separate TypeScript + Prisma service for tenant provisioning and maintenance operations
- Long-running migrations, data seeders, and batch jobs
- Isolated from main API to prevent resource contention

**ML Services**
- `ml_service/`: FastAPI application exposing real-time ML endpoints (price prediction, deal optimization, lead scoring, inventory recommendations)
- `ml_backend/`: Offline Python pipelines for web scraping (CarGurus, AutoTrader), feature engineering, and model retraining
- Celery workers with Redis broker for async ML tasks and scheduled model updates
- Supports continuous retraining with live scraped market data

**Tracking & Analytics** (`tracking-service/`)
- Dedicated pixel tracking ingestion service for session analytics and attribution
- WebSocket-based real-time event streaming
- Webhook fan-out for integrating analytics across modules

### Data Architecture

**Primary Database: PostgreSQL**
- Multi-tenant schema with organization/dealer hierarchy
- Comprehensive domain models: customers, vehicles, deals, finance contracts, service records, inventory, users/roles
- Audit logging with JSONB columns for change tracking (who/when/before/after)
- Full-text search capabilities and JSONB indexing for flexible querying
- Supports both Prisma (primary) and Drizzle (legacy) ORMs

**Caching & Queuing: Redis**
- BullMQ job queues for email, notifications, and nightly rollups
- Celery broker for Python ML workers
- Session storage and frequently-accessed data caching

**Object Storage: S3-Compatible**
- Document exports, vehicle photos, contract PDFs
- ML model artifacts and training datasets

### Key Architectural Decisions

**Multi-Tenancy**
- Organization-scoped data isolation enforced at database and API layers
- Hierarchical tenant structure supporting dealer groups with multiple rooftops
- Row-level security and query-level tenant filtering

**Domain Service Pattern**
- Business logic centralized in domain services (CRM, deals, inventory, finance, compliance)
- Controllers remain thin, delegating to services
- Clear separation of concerns enables testing and reuse

**Event-Driven Workflows**
- Background jobs handle async operations (credit pulls, lender submissions, notifications)
- Queue-based architecture prevents blocking on long-running tasks
- Supports distributed processing and horizontal scaling

**API-First Integration Layer**
- Third-party integrations abstracted behind adapters
- Supports RouteOne, DealerTrack, credit bureaus, OEM APIs
- Webhook handlers for real-time external events

**ML Pipeline Separation**
- Python ML services isolated from Node.js transactional APIs
- FastAPI for low-latency inference endpoints
- Celery for compute-intensive training jobs
- Enables independent scaling and technology choices

**Mobile-First UX**
- Responsive design with touch-optimized controls
- Progressive Web App capabilities for offline tolerance
- Sticky context panels and single-screen workflows mirror native apps

### Infrastructure Patterns

**Containerization**
- Docker Compose for local/self-hosted deployments (`infrastructure/docker/`)
- Kubernetes manifests for production clusters (`infrastructure/k8s/`)
- Each service packaged independently with health checks

**Observability**
- Comprehensive audit logging for compliance
- Application monitoring with structured logging (Pino)
- Performance metrics via prom-client
- Error tracking and reporting

**Security**
- JWT-based authentication with role-based access control (RBAC)
- Field-level security for sensitive data (SSN, deal gross, commissions)
- Audit trails on all critical operations
- Encryption at rest and in transit

## External Dependencies

### Third-Party Services

**Communication**
- SendGrid: Transactional email delivery
- Twilio: SMS notifications and voice calls

**Payments & Billing**
- Stripe: Subscription management and payment processing

**AI/ML**
- OpenAI: LLM-powered features (deal advisor, compliance checking, semantic search)
- Vector databases (pgvector or Pinecone): Semantic search and recommendations

**Automotive Data**
- KBB, Black Book, MMR, J.D. Power: Vehicle valuations and market data
- OEM DMS connectors: Inventory syndication and service integration
- CarGurus, AutoTrader scrapers: Competitive pricing intelligence

**Credit & Lending**
- RouteOne, DealerTrack: Credit bureau pulls and lender submissions
- Direct integrations: Experian, Equifax, TransUnion
- 700Credit: Credit report gateway

**Cloud Infrastructure**
- AWS S3 (or compatible): Object storage for documents and media
- Neon or PostgreSQL-compatible serverless: Database hosting
- Redis Cloud or compatible: Caching and job queues

### Development Dependencies

**Build & Tooling**
- Vite: Frontend build tool and dev server
- TypeScript: Type safety across Node.js and React codebases
- tsup: API service bundler
- Playwright: End-to-end testing
- Vitest: Unit and integration testing

**Frontend Libraries**
- React 18 with React Router (wouter)
- TanStack Query (React Query): Server state management
- Radix UI: Accessible component primitives
- Tailwind CSS: Utility-first styling
- dnd-kit: Drag-and-drop interactions
- Zod + React Hook Form: Form validation

**Backend Libraries**
- Prisma: ORM with type-safe database access
- Drizzle: Legacy ORM for migration compatibility
- BullMQ: Redis-based job queues
- Express: HTTP server framework
- Helmet, CORS: Security middleware

**Python Stack**
- FastAPI: ML inference API framework
- Celery: Distributed task queue for ML workers
- Selenium/undetected-chromedriver: Web scraping
- scikit-learn, pandas, numpy: ML/data processing

**Database**
- PostgreSQL 14+: Primary relational database
- Redis 6+: Cache and message broker
# Autolytiq Project Structure & Architecture Overview

## Project Summary
Autolytiq is an **end-to-end automotive retail platform** (CRM, desking, F&I, analytics, ML operations) built as a **pnpm monorepo** with TypeScript, React, Express, Python ML services, Rust microservices, and Kubernetes deployment.

**Key URLs:**
- Frontend: http://localhost:3000 (in development)
- Backend API: http://localhost:5000
- Database: PostgreSQL with Prisma ORM

---

## 1. OVERALL PROJECT ARCHITECTURE

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AUTOLYTIQ MONOREPO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  FRONTEND (React 18 + Vite)                                       │
│  └─ Port: 3000 (dev), served via backend in production           │
│  └─ State: TanStack Query + Zustand                              │
│  └─ UI: shadcn/ui (Radix + Tailwind)                             │
│                                                                   │
│  BACKEND (Express.js + Node.js)                                  │
│  └─ Port: 5000                                                   │
│  └─ Framework: Express with TypeScript                           │
│  └─ Real-time: Socket.IO for WebSocket communication            │
│  └─ Jobs: BullMQ + Redis for background processing              │
│                                                                   │
│  DATABASE & CACHING                                              │
│  └─ PostgreSQL (primary data store)                              │
│  └─ Redis (sessions, caching, job queue)                         │
│                                                                   │
│  RUST MICROSERVICES (High-Performance)                           │
│  ├─ Price Engine (Port 50051): 25-35x faster than Node.js        │
│  ├─ Communication Service (Port 50052)                           │
│  ├─ Cache Service (Port 50053)                                   │
│  └─ Rate Limiter (Port 50054)                                    │
│                                                                   │
│  PYTHON ML SERVICES (FastAPI + Celery)                           │
│  └─ Port: 8000                                                   │
│  └─ Models: Close predictor, approval predictor, deal optimizer  │
│  └─ Integration: HTTP-based endpoint calls from backend          │
│                                                                   │
│  SHARED PACKAGES                                                 │
│  ├─ @repo/db: Prisma schema + migrations                         │
│  ├─ @repo/shared: Shared types/utilities                         │
│  ├─ @repo/tokens: Design tokens (mobile-first)                   │
│  ├─ @repo/ui: Reusable UI components                             │
│  └─ @repo/design-system: Component library                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React 18, Vite, Tailwind CSS | Latest |
| **Backend** | Express.js, TypeScript | ESM modules |
| **Database** | PostgreSQL + Prisma ORM | 5.22.0 |
| **Auth** | JWT (RS256) | jsonwebtoken 9.0.2 |
| **Real-time** | Socket.IO | 4.8.1 |
| **Job Queue** | BullMQ | 5.32.2 |
| **Cache** | Redis | ioredis 5.4.2 |
| **API Calls** | Rust gRPC for performance-critical ops | - |
| **ML** | FastAPI + Celery + scikit-learn | Python 3.9+ |

---

## 2. DIRECTORY STRUCTURE

```
autolytiq/
├── apps/
│   ├── backend/              # Express.js API server (TypeScript)
│   │   ├── src/
│   │   │   ├── index.ts      # Entry point
│   │   │   ├── server.ts     # Express app factory
│   │   │   ├── routes/       # API route handlers
│   │   │   ├── middleware/   # Auth, RBAC, tenant scoping
│   │   │   ├── services/     # Business logic
│   │   │   ├── lib/          # Utilities (logger, errors, Prisma)
│   │   │   ├── config/       # Environment, scoring config
│   │   │   ├── validations/  # Zod schemas
│   │   │   ├── controllers/  # Route controllers
│   │   │   ├── domain/       # Domain models
│   │   │   ├── integrations/ # External API integrations
│   │   │   ├── queues/       # BullMQ background jobs
│   │   │   ├── workers/      # Worker processes
│   │   │   ├── sockets/      # Socket.IO handlers
│   │   │   ├── types/        # TypeScript types
│   │   │   └── proto/        # gRPC protocol definitions
│   │   ├── package.json
│   │   └── dist/             # Compiled output (tsup)
│   │
│   ├── frontend/             # React 18 + Vite SPA
│   │   ├── src/
│   │   │   ├── main.tsx      # React root
│   │   │   ├── App.tsx       # App component
│   │   │   ├── pages/        # Page-level components
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── routes/       # Routing configuration
│   │   │   ├── lib/          # Utilities (API client, query)
│   │   │   ├── stores/       # Zustand state
│   │   │   ├── contexts/     # React contexts
│   │   │   ├── features/     # Feature modules
│   │   │   ├── config/       # Configuration
│   │   │   └── types/        # TypeScript types
│   │   ├── package.json
│   │   └── dist/             # Built static files
│   │
│   ├── frontend-dev/         # Experimental sandbox (DO NOT DEPLOY)
│   │
│   ├── ml_backend/           # Python ML training pipelines
│   │
│   ├── pricing-rust/         # Rust pricing microservice
│   │
│   └── worker/               # Node.js background workers
│
├── packages/
│   ├── db/                   # Prisma schema + migrations
│   │   ├── schema.prisma     # Database schema (multi-tenant)
│   │   ├── migrations/       # SQL migrations
│   │   └── seed.ts           # Seed scripts
│   │
│   ├── shared/               # Shared types/utilities
│   │   ├── src/
│   │   │   ├── index.ts      # Centralized exports
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── constants/
│   │   └── package.json
│   │
│   ├── tokens/               # Design tokens (mobile-first)
│   │   ├── src/
│   │   │   └── index.ts      # Token definitions
│   │   └── package.json
│   │
│   ├── ui/                   # UI component library
│   │   └── src/
│   │       └── components/
│   │
│   └── design-system/        # Design system docs
│
├── services/
│   └── rust/                 # High-performance Rust services
│       ├── price-engine/     # Market pricing (Port 50051)
│       ├── comm-service/     # Communication layer (Port 50052)
│       ├── cache-service/    # Multi-level caching (Port 50053)
│       ├── rate-limiter/     # Token bucket limiter (Port 50054)
│       └── shared/           # Shared Rust utilities
│
├── ml_service/               # FastAPI + Celery
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── services/        # ML models
│   │   └── routers/         # API routes
│   └── workers/             # Celery workers
│
├── infrastructure/           # Docker, Kubernetes, Terraform
│   ├── docker/
│   │   ├── Dockerfile.backend
│   │   ├── Dockerfile.frontend
│   │   └── Dockerfile.ml
│   └── k8s/                 # Kubernetes manifests
│
├── scripts/                  # Deployment & automation
│   ├── quick-deploy.sh
│   ├── deploy-production.sh
│   ├── deploy-to-droplet.sh
│   └── ...
│
├── tracking-service/         # Event tracking
│
├── docs/                     # Documentation
│
├── tests/                    # E2E tests (Playwright)
│
├── .env                      # Environment variables (local)
├── .env.example              # Template for development
├── .env.selfhost.example     # Docker Compose template
├── .env.digitalocean.example # Production template
│
├── docker-compose.yml        # Local development setup
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # pnpm monorepo config
├── tsconfig.json             # TypeScript config
├── package-lock.json / pnpm-lock.yaml
│
└── README.md, CLAUDE.md, AGENTS.md, etc.
```

---

## 3. AUTHENTICATION & LOGIN IMPLEMENTATION

### 3.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. FRONTEND (React)                                             │
│     └─ /pages/login.tsx calls POST /api/auth/login              │
│     └─ Body: { storeId, username, password }                    │
│     └─ No auth header required for login endpoint                │
│                                                                   │
│  2. BACKEND LOGIN ENDPOINT                                       │
│     └─ POST /api/auth/login                                     │
│     └─ (apps/backend/src/routes/auth.routes.ts)                 │
│     └─ NO AUTHENTICATION REQUIRED (public route)                │
│                                                                   │
│  3. SERVER-SIDE VALIDATION                                       │
│     ├─ Find User by email (username field)                      │
│     ├─ Verify password with bcrypt                              │
│     ├─ Check user status (ACTIVE)                               │
│     ├─ Check tenant status (ACTIVE)                             │
│     └─ Update lastLoginAt timestamp                             │
│                                                                   │
│  4. JWT TOKEN GENERATION                                         │
│     ├─ Sign JWT with RS256 algorithm                            │
│     ├─ Payload: userId, tenantId, email, role, isSuperAdmin    │
│     ├─ Expiry: 7 days                                           │
│     ├─ Issuer: autolytiq.local                                  │
│     └─ Audience: autolytiq.clients                              │
│                                                                   │
│  5. RESPONSE                                                     │
│     └─ Return: { id, tenantId, email, token, permissions, ... } │
│     └─ Frontend stores token in memory/localStorage             │
│                                                                   │
│  6. SUBSEQUENT API CALLS (Protected Routes)                      │
│     ├─ Header: Authorization: Bearer <JWT_TOKEN>               │
│     ├─ Middleware: authenticate (verify JWT)                    │
│     ├─ Middleware: tenantScope (extract tenantId)               │
│     ├─ Middleware: requireRole (RBAC check)                     │
│     └─ Route handler executes with context.user                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Key Authentication Files

#### Backend - Authentication Middleware
**File:** `/root/autolytiq/apps/backend/src/middleware/auth.ts`

**Purpose:** Validates JWT tokens on protected routes
- Expects header: `Authorization: Bearer <JWT_TOKEN>`
- Verifies token signature using `JWT_PUBLIC_KEY` (RS256)
- Extracts user ID, email, tenantId, roles
- Returns 401 if token missing, invalid, or expired

**Key Logic:**
```typescript
export const authenticate: RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;
  
  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
  
  const token = authorization.slice(7);
  
  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: env.JWT_AUDIENCE,
      issuer: env.JWT_ISSUER,
    });
    
    // Extract tenantId from payload (supports multiple field names)
    const tenantId = extractTenantId(payload);
    const roles = normalizeRoles(payload.roles);
    
    req.context = {
      user: { id: payload.sub, email, name, tenantId },
      roles,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

#### Backend - Login Endpoint
**File:** `/root/autolytiq/apps/backend/src/routes/auth.routes.ts`

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "storeId": "MAIN",
  "username": "sarah.johnson",
  "password": "SecurePassword123"
}
```

**Response (Success):**
```json
{
  "id": "user-id-123",
  "tenantId": "tenant-id-456",
  "email": "sarah.johnson@autolytiq.com",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "role": "SALES",
  "isSuperAdmin": false,
  "permissions": [...],
  "customPermissions": [...],
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": {
    "homePath": "/dashboard",
    "allowedRoutes": ["*"],
    "navigationSections": ["inventory", "crm", "sales", "finance", "reports"],
    "quickActions": ["/customers", "/inventory", "/deals"]
  }
}
```

**Key Logic:**
1. Find User by email (username field) with status = ACTIVE
2. Verify password with bcrypt
3. Verify tenant status is ACTIVE
4. Update lastLoginAt
5. Create JWT token
6. Return user data + token

#### Backend - Get Current User Endpoint
**File:** `/root/autolytiq/apps/backend/src/routes/auth.routes.ts`

**Endpoint:** `GET /api/auth/user`

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "id": "user-id-123",
  "tenantId": "tenant-id-456",
  "email": "sarah.johnson@autolytiq.com",
  "firstName": "Sarah",
  "lastName": "Johnson",
  "role": "SALES",
  "isSuperAdmin": false,
  "permissions": [...],
  "customPermissions": [...]
}
```

**Purpose:** Verify token validity and fetch current user info

#### Frontend - Login Page
**File:** `/root/autolytiq/apps/frontend/src/pages/login.tsx`

**Features:**
- Store selector dropdown (currently: MAIN)
- Username input (email format)
- Password input
- Dark/light theme toggle
- Mobile-first responsive design

**Key Logic:**
1. User submits form with storeId, username, password
2. Call `apiRequest("POST", "/api/auth/login", ...)`
3. Receive JWT token from response
4. Invalidate auth query cache to refresh user data
5. Navigate to user's homePath
6. Token stored in memory (TanStack Query handles it)

#### Frontend - Auth Hook
**File:** `/root/autolytiq/apps/frontend/src/hooks/useAuth.ts`

**Purpose:** Provide authenticated user state across app

```typescript
export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn<AuthUser | null>({ on401: "returnNull" }),
    retry: false,
  });
  
  return {
    user: data ?? undefined,
    isLoading,
    isAuthenticated: Boolean(data),
    error,
  };
}
```

**Returns:**
- `user`: Current authenticated user or undefined
- `isAuthenticated`: Boolean flag
- `isLoading`: Loading state
- `error`: Any error from fetch

#### Frontend - API Request Helper
**File:** `/root/autolytiq/apps/frontend/src/lib/queryClient.ts`

**Purpose:** Make authenticated API calls with JWT token

```typescript
export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | { method?: string; body?: unknown },
  data?: unknown,
): Promise<Response> {
  // ... handle both patterns
  const res = await fetch(resolveUrl(url), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',  // Include cookies for session management
  });
  
  await throwIfResNotOk(res);
  return res;
}
```

**Note:** Does NOT automatically include JWT token in header. Token is sent via TanStack Query's default query function.

### 3.3 Tenant Scoping Middleware
**File:** `/root/autolytiq/apps/backend/src/middleware/tenant.ts`

**Purpose:** Enforce tenant isolation on protected routes

**Order:** Must run AFTER `authenticate` middleware

```typescript
export const tenantScope: RequestHandler = (req, res, next) => {
  // Extract tenantId from:
  // 1. x-tenant-id header
  // 2. req.context.user.tenantId (from JWT)
  const tenantId = req.headers['x-tenant-id'] || req.context?.user?.tenantId;
  
  // Store in async-local-storage for Prisma queries
  tenantContext.run({ tenantId }, next);
};
```

### 3.4 RBAC Middleware
**File:** `/root/autolytiq/apps/backend/src/middleware/rbac.ts`

**Purpose:** Enforce role-based access control

```typescript
export const requireRole = (...allowedRoles: Role[]) => {
  return (req, res, next) => {
    const userRoles = req.context?.roles ?? [];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

**Usage in routes:**
```typescript
apiRouter.post(
  '/lead-routing/test',
  requireRole('ADMIN', 'BDC', 'SALES'),
  (req, res, next) => { /* handler */ }
);
```

### 3.5 User Model (Database)
**File:** `/root/autolytiq/packages/db/schema.prisma`

**Key Fields:**
- `id`: User ID (CUID)
- `tenantId`: Foreign key to Tenant
- `email`: Unique email
- `password`: bcrypt hash
- `firstName`, `lastName`
- `role`: UserRole enum (SALES, ADMIN, etc.)
- `rolePresetId`: Custom role preset
- `permissions`: JSON array
- `customPermissions`: JSON array
- `status`: UserStatus (ACTIVE, INACTIVE, DELETED)
- `isSuperAdmin`: Boolean flag
- `lastLoginAt`: Timestamp of last login

### 3.6 Auth Configuration (Environment)
**File:** `/root/autolytiq/apps/backend/src/config/env.ts`

**Critical Variables:**
```env
# JWT Configuration
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."  # RS256 public key
JWT_ISSUER=autolytiq.local                        # Token issuer
JWT_AUDIENCE=autolytiq.clients                    # Token audience

# Security
SESSION_SECRET=local-development-session-secret-please-change

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db   # For migrations

# Server
PORT=5000
NODE_ENV=development
```

**Note:** JWT uses RS256 (RSA public/private keys), not HMAC. Backend has public key for verification.

### 3.7 Route Configuration
**File:** `/root/autolytiq/apps/backend/src/routes/index.ts`

**Key Points:**
1. Health routes (no auth required): `/health`, `/ready`, `/livez`
2. Auth routes (no auth required): `/api/auth/login`, `/api/auth/logout`, `/api/auth/user`
3. Protected routes: All require `authenticate` → `tenantScope` middleware chain

```typescript
export function registerRoutes(app: Express) {
  // Public routes
  app.use('/', healthRouter);
  app.use('/api/auth', authRouter);
  
  // Protected routes
  const apiRouter = Router();
  apiRouter.use(authenticate);    // Verify JWT
  apiRouter.use(tenantScope);     // Extract tenantId
  
  apiRouter.use('/leads', leadRouter);
  apiRouter.use('/activities', activityRouter);
  // ... more routes
  
  app.use('/api', apiRouter);
}
```

---

## 4. ROLES AND PERMISSIONS

### 4.1 Available Roles
**File:** `/root/autolytiq/apps/backend/src/types/roles.ts`

```typescript
export const Roles = [
  'ADMIN',           // Full system access
  'MANAGER',         // Department manager
  'SALES_MANAGER',   # Sales department manager
  'FINANCE',         # Finance department
  'FI_MANAGER',      # Finance & Insurance manager
  'SALES',           # Sales person
  'BDC',             # Business Development Center
  'SERVICE',         # Service department
] as const;
```

### 4.2 Permission Structure
- **Roles:** Predefined role-based permissions
- **Custom Permissions:** User can have custom permission JSON
- **Route-Level:** Use `requireRole()` middleware to enforce

**Example:**
```typescript
// Only ADMIN, BDC, SALES can access this endpoint
apiRouter.post(
  '/lead-routing/test',
  requireRole('ADMIN', 'BDC', 'SALES'),
  handler
);
```

---

## 5. DEBUGGING THE 401 ERROR

### 5.1 Common 401 Causes

| Symptom | Cause | Solution |
|---------|-------|----------|
| "Authorization token missing" | No Bearer header sent | Frontend must send `Authorization: Bearer <token>` |
| "Invalid or expired token" | Token signature invalid | Check `JWT_PUBLIC_KEY` environment variable |
| "Token subject missing" | JWT payload missing `sub` field | Backend must sign token with `sub` claim |
| "Invalid audience" | JWT audience mismatch | Verify `JWT_AUDIENCE` env variable matches token |
| "Invalid issuer" | JWT issuer mismatch | Verify `JWT_ISSUER` env variable matches token |
| 401 after login redirect | Token not being sent in subsequent calls | Check TanStack Query's query function |
| 401 on `/api/auth/user` | Token not stored client-side | Verify login response token is returned |

### 5.2 Debugging Checklist

**Frontend:**
1. Open DevTools Network tab
2. Check login request response contains `token` field
3. Check subsequent API calls include header: `Authorization: Bearer <token>`
4. Verify `useAuth()` hook successfully queries `/api/auth/user`
5. Check if token is being cleared by route changes

**Backend:**
1. Check `.env` file has `JWT_PUBLIC_KEY` set
2. Verify `JWT_ISSUER` and `JWT_AUDIENCE` match login endpoint
3. Check auth.routes.ts `POST /api/auth/login` is registered BEFORE protected routes
4. Ensure `authenticate` middleware is applied to protected routes
5. Check server logs for token verification errors

**Environment:**
1. Run `pnpm db:generate` to regenerate Prisma client
2. Verify database connection: `pnpm db:migrate:deploy`
3. Check if test user exists in database
4. Verify password was hashed with bcrypt

### 5.3 Test Login Manually
```bash
# 1. Login and get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "MAIN",
    "username": "test@example.com",
    "password": "testpassword"
  }'

# Expected response:
# { "id": "...", "tenantId": "...", "token": "eyJhbGc..." }

# 2. Use token in protected endpoint
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer eyJhbGc..."

# Expected: 200 OK with leads data
# If 401: Token is invalid or not being verified correctly
```

---

## 6. KEY CONFIGURATION FILES

### 6.1 Environment Files

**Location:** Root directory (`/root/autolytiq/`)

| File | Purpose | When to Use |
|------|---------|-----------|
| `.env` | Local development variables | Local development |
| `.env.example` | Template for development setup | Reference |
| `.env.selfhost.example` | Docker Compose setup | Self-hosted deployments |
| `.env.digitalocean.example` | Production Kubernetes setup | DigitalOcean production |
| `.env.production.example` | Generic production template | Production reference |

**Example `.env` (Development):**
```env
NODE_ENV=development
DATABASE_URL=postgresql://autolytiq:autolytiq@db:5432/autolytiq?schema=public
DIRECT_URL=postgresql://autolytiq:autolytiq@db:5432/autolytiq?schema=public
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..." (multiline)
JWT_ISSUER=autolytiq.local
JWT_AUDIENCE=autolytiq.clients
SESSION_SECRET=local-dev-secret
PORT=5000
REDIS_URL=redis://redis:6379
ML_SERVICE_URL=http://ml:8000
API_URL=http://localhost:5000
APP_URL=http://localhost:3000
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

### 6.2 Backend Configuration
**File:** `/root/autolytiq/apps/backend/src/config/env.ts`

- Validates environment variables with Zod
- Warns about missing optional variables
- Transforms JWT_PUBLIC_KEY (replaces `\n` escape sequences)
- Exports single `env` object used throughout app

### 6.3 Frontend Configuration
**File:** `/root/autolytiq/apps/frontend/src/config/api.ts`

```typescript
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL ?? 
  (typeof window !== 'undefined' ? '' : 'http://localhost:5000');
```

- Uses Vite environment variable `VITE_API_URL`
- Falls back to relative URL in browser (empty string)
- Falls back to `http://localhost:5000` on server

### 6.4 Database Configuration
**File:** `/root/autolytiq/packages/db/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // For migrations
}
```

- `DATABASE_URL`: Connection string (may be pooled)
- `DIRECT_URL`: Direct PostgreSQL connection (no pooling)

### 6.5 Docker Compose Configuration
**File:** `/root/autolytiq/docker-compose.yml`

**Services:**
- `backend`: Node.js API server (Port 5000)
- `frontend`: NGINX serving React SPA (Port 3000)
- `ml-service`: Python FastAPI ML service (Port 8000)
- `postgres`: PostgreSQL database (Port 5432)
- `redis`: Redis cache/session store (Port 6379)

---

## 7. FRONTEND & BACKEND INTEGRATION

### 7.1 API Base URL Resolution

**Frontend (Vite):**
```typescript
// src/config/api.ts
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL ?? '' ?? 'http://localhost:5000';
```

**Development:**
- `VITE_API_URL` not set → uses empty string (relative URL)
- API calls go to `/api/...` which proxies to backend

**Production:**
- `VITE_API_URL` set in environment → uses that URL
- Backend serves static frontend files

### 7.2 Frontend → Backend Communication

**Pattern 1: Simple API Request (No Auth)**
```typescript
const response = await apiRequest('POST', '/api/auth/login', {
  storeId, username, password
});
const data = await response.json();
```

**Pattern 2: Protected Route (With Auth)**
```typescript
// Uses TanStack Query with default query function
useQuery({
  queryKey: ['/api/leads'],
  queryFn: getQueryFn({ on401: 'throw' })  // Auto adds auth header
});
```

**Pattern 3: Manual Token Sending**
```typescript
const response = await fetch(`${API_BASE_URL}/api/protected-route`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include'
});
```

### 7.3 CORS Configuration

**Backend (Socket.IO CORS):**
```typescript
// apps/backend/src/index.ts
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(',').map(s => s.trim()) || '*',
    credentials: true
  }
});
```

**Environment:**
```env
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

---

## 8. DEVELOPMENT WORKFLOW

### 8.1 Local Development Setup

```bash
# 1. Install dependencies
pnpm install  # Runs postinstall hook to generate Prisma client

# 2. Set up environment
cp .env.example .env  # Or use existing .env

# 3. Start services (full stack)
pnpm dev  # Starts backend + frontend concurrently

# Individual services:
pnpm dev:server      # Backend only (Port 5000)
pnpm dev:client      # Frontend only (Port 3000)

# 4. Database setup
pnpm db:generate     # Generate Prisma client
pnpm db:migrate:dev  # Create and apply migrations
pnpm db:seed         # Seed baseline tenant + sample data
```

### 8.2 Building for Production

```bash
# Build all packages
pnpm build:prod

# Or step-by-step:
pnpm db:generate
pnpm build:shared
pnpm build:client
pnpm build:server

# For single-server deployment (backend serves static frontend):
pnpm build:client:static
```

### 8.3 Testing

```bash
pnpm typecheck      # Type-check entire monorepo
pnpm lint           # Lint all packages except frontend
pnpm test           # Run unit tests
pnpm test:e2e       # Run E2E tests (Playwright)
pnpm ci             # Full CI pipeline
```

### 8.4 Database Workflow

```bash
# Edit schema.prisma
pnpm db:generate        # Generate Prisma client
pnpm db:migrate:dev     # Create migration + apply
# Commit both schema.prisma and migration files

# Production:
pnpm db:migrate:deploy  # Apply migrations (safe, no prompts)
```

---

## 9. QUICK START GUIDE

### 9.1 Login to Autolytiq (Development)

1. **Start Services:**
   ```bash
   cd /root/autolytiq
   pnpm install
   pnpm dev
   ```

2. **Open Browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Login Page: http://localhost:3000/login

3. **Test Credentials:**
   - Store ID: `MAIN`
   - Username: (check database or seed script)
   - Password: (check database or seed script)

4. **Expected Flow:**
   - Login page loads with form
   - Submit credentials
   - Receive JWT token
   - Redirected to `/dashboard`
   - `useAuth()` hook returns authenticated user

### 9.2 Docker Compose Deployment

```bash
# 1. Prepare environment
cp .env.selfhost.example .env

# 2. Build and start
docker-compose up --build

# 3. Access
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
# Redis: localhost:6379
```

---

## 10. IMPORTANT NOTES FOR DEBUGGING

### 10.1 Common Issues & Solutions

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| "Unauthorized token missing" on login | Auth routes registered after protected middleware | Check route registration order in `routes/index.ts` |
| 401 error after successful login | Token not being sent in subsequent requests | Verify TanStack Query's query function includes auth header |
| Login works but no user data | JWT payload missing required claims | Ensure login endpoint signs token with `sub`, `tenantId`, `email` |
| CORS error when calling API | CORS not configured on backend | Check `SOCKET_IO_CORS_ORIGIN` env variable |
| Database connection fails | DATABASE_URL or DIRECT_URL invalid | Verify PostgreSQL is running and connection string is correct |
| Prisma client out of sync | Schema changed but client not regenerated | Run `pnpm db:generate` after schema changes |

### 10.2 Key Files to Check When Debugging

**Authentication Issues:**
- `/root/autolytiq/apps/backend/src/middleware/auth.ts` — Token verification
- `/root/autolytiq/apps/backend/src/routes/auth.routes.ts` — Login/user endpoints
- `/root/autolytiq/apps/frontend/src/pages/login.tsx` — Login UI
- `/root/autolytiq/apps/frontend/src/hooks/useAuth.ts` — Auth state

**Configuration Issues:**
- `/root/autolytiq/apps/backend/src/config/env.ts` — Environment validation
- `/root/autolytiq/.env` — Local environment variables
- `/root/autolytiq/apps/frontend/src/config/api.ts` — API endpoint config

**Routing Issues:**
- `/root/autolytiq/apps/backend/src/routes/index.ts` — Route registration order
- `/root/autolytiq/apps/backend/src/server.ts` — Express app setup

**Database Issues:**
- `/root/autolytiq/packages/db/schema.prisma` — Data schema
- `/root/autolytiq/packages/db/migrations/` — Migration files

---

## 11. PROJECT STATISTICS

| Metric | Value |
|--------|-------|
| **Monorepo Type** | pnpm workspace |
| **Apps** | 6 (backend, frontend, frontend-dev, ml_backend, pricing-rust, worker) |
| **Packages** | 7 (db, shared, tokens, ui, design-system, ml_service, services/rust) |
| **Languages** | TypeScript, Python, Rust, JavaScript |
| **Database** | PostgreSQL with Prisma ORM |
| **Cache** | Redis |
| **Frontend Framework** | React 18 + Vite |
| **Backend Framework** | Express.js |
| **Real-time** | Socket.IO |
| **Job Queue** | BullMQ |
| **ML Framework** | FastAPI + Celery |
| **Rust Microservices** | 4 (Price Engine, Comm Service, Cache Service, Rate Limiter) |
| **Design System** | shadcn/ui + Tailwind CSS |
| **Package Manager** | pnpm |
| **Build Tool** | Vite (frontend), tsup (backend) |
| **Deployment** | Docker, Kubernetes, Bash scripts |

---

## Summary

Autolytiq is a comprehensive automotive retail platform with:

1. **Frontend:** React 18 + Vite with Tailwind CSS and shadcn/ui components
2. **Backend:** Express.js API with TypeScript, JWT auth, multi-tenancy
3. **Database:** PostgreSQL with Prisma ORM and tenant isolation
4. **Real-time:** Socket.IO for WebSocket communication
5. **Background Jobs:** BullMQ with Redis
6. **ML Services:** FastAPI + Celery for ML inference
7. **Rust Microservices:** High-performance services for pricing and communication
8. **Authentication:** JWT (RS256) with role-based access control
9. **Deployment:** Docker Compose for local, Kubernetes for production

**For debugging the 401 error:**
- Check JWT token is being sent in `Authorization: Bearer <token>` header
- Verify `JWT_PUBLIC_KEY` environment variable is set
- Ensure auth routes are registered before protected middleware
- Confirm login endpoint successfully generates and returns JWT token
- Test token verification with manual curl commands


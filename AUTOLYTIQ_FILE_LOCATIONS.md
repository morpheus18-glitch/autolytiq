# Autolytiq - Critical File Locations Quick Reference

## Authentication & Login - File Map

```
FRONTEND (React/TypeScript)
├── /root/autolytiq/apps/frontend/src/
│   ├── pages/
│   │   └── login.tsx                    # Login form UI
│   ├── hooks/
│   │   └── useAuth.ts                   # useAuth() hook for auth state
│   ├── lib/
│   │   ├── queryClient.ts               # API request helper + query config
│   │   ├── authUtils.ts                 # Auth utility functions
│   │   └── userHomePath.ts              # Post-login redirect logic
│   ├── config/
│   │   └── api.ts                       # API_BASE_URL configuration
│   ├── stores/                          # Zustand state management
│   └── contexts/                        # React contexts

BACKEND (Express/TypeScript)
├── /root/autolytiq/apps/backend/src/
│   ├── middleware/
│   │   ├── auth.ts                      # JWT verification middleware
│   │   ├── tenant.ts                    # Tenant scoping
│   │   └── rbac.ts                      # Role-based access control
│   ├── routes/
│   │   ├── auth.routes.ts               # Login, logout, get user endpoints
│   │   └── index.ts                     # Route registration (ORDER CRITICAL!)
│   ├── config/
│   │   └── env.ts                       # Environment validation (Zod)
│   ├── lib/
│   │   ├── errors.ts                    # Error handling
│   │   ├── logger.ts                    # Logging
│   │   └── prisma.ts                    # Prisma client
│   ├── types/
│   │   └── roles.ts                     # Role definitions
│   ├── services/                        # Business logic
│   └── index.ts                         # Express app entry point

DATABASE
├── /root/autolytiq/packages/db/
│   ├── schema.prisma                    # User, Tenant models
│   ├── migrations/                      # SQL migration files
│   └── seed.ts                          # Test data seeding

ENVIRONMENT & CONFIG
├── /root/autolytiq/
│   ├── .env                             # Local development config (actual values)
│   ├── .env.example                     # Development template
│   ├── .env.selfhost.example            # Docker Compose template
│   └── .env.digitalocean.example        # Production template

INFRASTRUCTURE
├── /root/autolytiq/
│   ├── docker-compose.yml               # Local development services
│   ├── server.ts                        # Express app factory
│   └── index.ts                         # HTTP server setup with Socket.IO
```

## Critical Authentication Files

### 1. Login Flow (Frontend → Backend)

**Step 1: User submits login form**
```
File: /root/autolytiq/apps/frontend/src/pages/login.tsx
Action: handleSubmit() → apiRequest('POST', '/api/auth/login', {...})
```

**Step 2: Backend receives login request**
```
File: /root/autolytiq/apps/backend/src/routes/auth.routes.ts
Action: POST /api/auth/login
- Find user by email
- Verify password with bcrypt
- Generate JWT token
- Return token in response
```

**Step 3: Frontend stores token and makes authenticated requests**
```
File: /root/autolytiq/apps/frontend/src/hooks/useAuth.ts
Action: useQuery(['/api/auth/user']) with token in header
File: /root/autolytiq/apps/frontend/src/lib/queryClient.ts
Action: getQueryFn() adds 'Authorization: Bearer <token>' header
```

**Step 4: Backend verifies token on protected routes**
```
File: /root/autolytiq/apps/backend/src/middleware/auth.ts
Action: authenticate middleware checks Authorization header
Action: Verifies JWT signature with JWT_PUBLIC_KEY
Action: Extracts tenantId, roles, user info
```

### 2. Environment Configuration

```
File: /root/autolytiq/.env
Content:
  JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
  JWT_ISSUER=autolytiq.local
  JWT_AUDIENCE=autolytiq.clients
  DATABASE_URL=postgresql://...
  PORT=5000
  NODE_ENV=production

File: /root/autolytiq/apps/backend/src/config/env.ts
Content:
  - Validates JWT_PUBLIC_KEY is set
  - Validates DATABASE_URL is valid
  - Exports single 'env' object
  - Warns about missing optional variables
```

### 3. Route Registration Order (CRITICAL!)

```
File: /root/autolytiq/apps/backend/src/routes/index.ts
Correct Order:
  1. app.use('/', healthRouter)           // No auth
  2. app.use('/api/auth', authRouter)     // Login route - NO auth
  3. const apiRouter = Router()
  4. apiRouter.use(authenticate)          // From this point on - auth required
  5. apiRouter.use(tenantScope)           // Tenant scoping
  6. app.use('/api', apiRouter)           // Protected routes

File: /root/autolytiq/apps/backend/src/server.ts
Content:
  - Creates Express app
  - Registers routes via registerRoutes(app)
  - Sets up error handling
```

### 4. Token Payload & Verification

```
File: /root/autolytiq/apps/backend/src/routes/auth.routes.ts
Location: POST /api/auth/login handler
Token Payload:
  {
    userId: user.id,      // ISSUE: Should be 'sub'
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
    isSuperAdmin: user.isSuperAdmin
  }

File: /root/autolytiq/apps/backend/src/middleware/auth.ts
Location: authenticate middleware
Verification:
  1. Extract Authorization header
  2. jwt.verify(token, JWT_PUBLIC_KEY)
  3. Check payload.sub exists (CRITICAL!)
  4. Extract tenantId from payload
  5. Normalize roles
  6. Set req.context
```

### 5. Database Models

```
File: /root/autolytiq/packages/db/schema.prisma
User Model Fields:
  id                  String @id @default(cuid())
  tenantId            String
  email               String
  password            String (bcrypt hash)
  firstName           String
  lastName            String
  role                UserRole
  rolePresetId        String?
  permissions         Json
  customPermissions   Json?
  status              UserStatus (ACTIVE/INACTIVE/DELETED)
  isSuperAdmin        Boolean @default(false)
  lastLoginAt         DateTime?
  
Tenant Model:
  id                  String @id @default(cuid())
  name                String
  subdomain           String @unique
  plan                TenantPlan
  status              TenantStatus (ACTIVE/INACTIVE)
  users               User[]  (relationship)
```

## Common Debugging Locations

| Issue | File to Check |
|-------|---|
| "Authorization token missing" | /root/autolytiq/apps/backend/src/routes/index.ts (route order) |
| "Invalid or expired token" | /root/autolytiq/apps/backend/src/middleware/auth.ts |
| "Token subject missing" | /root/autolytiq/apps/backend/src/routes/auth.routes.ts (jwt.sign) |
| Token not being sent | /root/autolytiq/apps/frontend/src/lib/queryClient.ts |
| Login endpoint 401 | /root/autolytiq/apps/backend/src/routes/index.ts (route registration) |
| User not found | /root/autolytiq/packages/db/schema.prisma (User model) |
| JWT_PUBLIC_KEY error | /root/autolytiq/.env |

## File Size & Line Count Reference

```
Backend Auth Files:
  middleware/auth.ts          92 lines  - Token verification
  routes/auth.routes.ts       166 lines - Login endpoint logic
  routes/index.ts             60 lines  - Route registration
  config/env.ts               86 lines  - Environment config

Frontend Auth Files:
  pages/login.tsx             176 lines - Login form UI
  hooks/useAuth.ts            55 lines  - Auth state hook
  lib/queryClient.ts          106 lines - Query config

Database:
  packages/db/schema.prisma   ~1500 lines total (User model is lines 94-150)
```

## Environment Variable Reference

```
CRITICAL (must be set):
  DATABASE_URL              postgresql://user:pass@host/db
  JWT_PUBLIC_KEY           "-----BEGIN PUBLIC KEY-----\n..."

IMPORTANT (defaults provided but should configure):
  JWT_ISSUER              autolytiq.local
  JWT_AUDIENCE            autolytiq.clients
  PORT                    5000
  NODE_ENV                development

OPTIONAL (for features):
  SENDGRID_API_KEY
  TWILIO_ACCOUNT_SID
  REDIS_URL
  ML_SERVICE_URL
  ML_SERVICE_TOKEN
  S3_BUCKET / AWS credentials
```

## Quick Command Reference

```bash
# Navigate to project
cd /root/autolytiq

# Check JWT configuration
grep JWT .env

# View auth middleware
cat apps/backend/src/middleware/auth.ts

# View login endpoint
cat apps/backend/src/routes/auth.routes.ts

# View route registration
cat apps/backend/src/routes/index.ts

# View environment config
cat apps/backend/src/config/env.ts

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"MAIN","username":"test@example.com","password":"test"}' | jq .

# Decode JWT token
echo "eyJhbGc..." | cut -d. -f2 | base64 -d | jq .

# Check if server is running
curl http://localhost:5000/health

# View Prisma schema
cat packages/db/schema.prisma | grep -A 60 "model User"
```

## File Paths Summary

**Absolute paths to key authentication files:**

1. `/root/autolytiq/apps/backend/src/middleware/auth.ts` - JWT verification
2. `/root/autolytiq/apps/backend/src/routes/auth.routes.ts` - Login/logout/user endpoints
3. `/root/autolytiq/apps/backend/src/routes/index.ts` - Route registration (ORDER CRITICAL)
4. `/root/autolytiq/apps/backend/src/config/env.ts` - Environment validation
5. `/root/autolytiq/apps/frontend/src/pages/login.tsx` - Login form UI
6. `/root/autolytiq/apps/frontend/src/hooks/useAuth.ts` - useAuth() hook
7. `/root/autolytiq/apps/frontend/src/lib/queryClient.ts` - API request + query config
8. `/root/autolytiq/.env` - Environment variables
9. `/root/autolytiq/packages/db/schema.prisma` - Database schema


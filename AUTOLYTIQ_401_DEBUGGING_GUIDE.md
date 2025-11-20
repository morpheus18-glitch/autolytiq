# Autolytiq 401 Error Debugging Guide

## Quick Diagnostic Flowchart

```
401 ERROR RECEIVED
     |
     v
Where does 401 occur?
     |
     +-- On /api/auth/login endpoint
     |   └-- This should NOT require auth (public endpoint)
     |   └-- Check: Is auth middleware applied globally?
     |   └-- Fix: Ensure login route is registered BEFORE apiRouter middleware
     |
     +-- After login on protected endpoints
     |   └-- Check: Is token being sent in requests?
     |   └-- Check: Is JWT_PUBLIC_KEY set correctly?
     |   └-- Check: Is token malformed or expired?
     |
     +-- On /api/auth/user endpoint
         └-- Check: User is not authenticated yet
         └-- Check: Token was not stored from login response
         └-- Fix: Verify login response includes "token" field
```

---

## The 401 Error Scenarios

### Scenario 1: 401 on POST /api/auth/login (Should NOT require auth)

**Symptoms:**
- Trying to login but getting 401: "Authorization token missing"
- No token provided yet, so shouldn't need auth header

**Root Causes:**
1. Auth middleware is applied GLOBALLY before routes are registered
2. Login route not registered before protected apiRouter
3. Middleware stack order is wrong

**Files to Check:**
- `/root/autolytiq/apps/backend/src/routes/index.ts` - Route registration order
- `/root/autolytiq/apps/backend/src/server.ts` - Express app setup

**Solution:**
Ensure routes registered in correct order:
```typescript
// CORRECT ORDER:
export function registerRoutes(app: Express) {
  // 1. Public routes FIRST
  app.use('/', healthRouter);
  app.use('/api/auth', authRouter);  // Login is here - NO auth required
  
  // 2. Protected routes SECOND
  const apiRouter = Router();
  apiRouter.use(authenticate);    // Only applies to routes below
  apiRouter.use(tenantScope);
  
  apiRouter.use('/leads', leadRouter);
  // ... other protected routes
  
  app.use('/api', apiRouter);
}
```

**Test:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"MAIN","username":"test@example.com","password":"test"}'

# Expected: 200 OK or 401 Unauthorized with clear message
# NOT Expected: 401 "Authorization token missing"
```

---

### Scenario 2: 401 After Successful Login (Token not sent in subsequent calls)

**Symptoms:**
- Login works, get token in response
- Immediately after, GET /api/auth/user returns 401
- Or any protected endpoint returns 401

**Root Causes:**
1. Frontend doesn't store or send the token
2. Frontend stores token but doesn't send it in headers
3. TanStack Query not configured to include auth header
4. API request helper doesn't include Bearer header

**Files to Check:**
- `/root/autolytiq/apps/frontend/src/hooks/useAuth.ts` - Auth state
- `/root/autolytiq/apps/frontend/src/lib/queryClient.ts` - Query function
- `/root/autolytiq/apps/frontend/src/pages/login.tsx` - Login form

**Solution - How Token Should Flow:**

1. **Login Response Contains Token:**
   ```typescript
   // POST /api/auth/login returns:
   {
     "id": "user-123",
     "token": "eyJhbGciOiJSUzI1NiI...",  // <-- This must be included
     "tenantId": "tenant-456",
     ...
   }
   ```

2. **Frontend Stores Token:**
   ```typescript
   // In login.tsx - after successful login
   const data = await response.json();
   // Token is in data.token - store it (localStorage or memory)
   localStorage.setItem('authToken', data.token);
   ```

3. **Frontend Sends Token in Requests:**
   ```typescript
   // When fetching protected routes
   const token = localStorage.getItem('authToken');
   
   const res = await fetch('/api/auth/user', {
     headers: {
       'Authorization': `Bearer ${token}`  // <-- CRITICAL
     }
   });
   ```

4. **TanStack Query Configuration:**
   ```typescript
   // queryClient.ts - default query function
   async ({ queryKey }) => {
     const token = getStoredToken();
     const res = await fetch(url, {
       headers: {
         'Authorization': `Bearer ${token}`  // <-- Query function must add this
       }
     });
   }
   ```

**Test:**
```bash
# Step 1: Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"MAIN","username":"test@example.com","password":"test"}' \
  -s | jq '.token' > token.txt

# Step 2: Use token in request
TOKEN=$(cat token.txt | tr -d '"')
curl -X GET http://localhost:5000/api/auth/user \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK with user data
```

---

### Scenario 3: 401 - "Invalid or expired token"

**Symptoms:**
- Token is being sent: `Authorization: Bearer eyJhbGc...`
- Backend returns 401: "Invalid or expired token"
- Token signature verification failed

**Root Causes:**
1. JWT_PUBLIC_KEY not set or incorrect
2. Token was signed with different key than verification key
3. Token expired (7 day expiry)
4. Token issuer/audience mismatch

**Files to Check:**
- `/root/autolytiq/apps/backend/src/middleware/auth.ts` - Token verification
- `/root/autolytiq/apps/backend/src/config/env.ts` - Environment config
- `/root/autolytiq/.env` - JWT_PUBLIC_KEY value

**Solution:**

1. **Verify JWT_PUBLIC_KEY is Set:**
   ```bash
   grep "JWT_PUBLIC_KEY" /root/autolytiq/.env
   
   # Should output:
   # JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
   ```

2. **Check JWT_ISSUER and JWT_AUDIENCE:**
   ```bash
   grep "JWT_ISSUER\|JWT_AUDIENCE" /root/autolytiq/.env
   
   # Should output:
   # JWT_ISSUER=autolytiq.local
   # JWT_AUDIENCE=autolytiq.clients
   ```

3. **Verify Backend Configuration:**
   In `/root/autolytiq/apps/backend/src/middleware/auth.ts`:
   ```typescript
   const payload = jwt.verify(token, publicKey, {
     algorithms: ['RS256'],
     audience: env.JWT_AUDIENCE,      // Must match
     issuer: env.JWT_ISSUER,          // Must match
   });
   ```

4. **Verify Token Was Signed Correctly:**
   In `/root/autolytiq/apps/backend/src/routes/auth.routes.ts`:
   ```typescript
   const token = jwt.sign(
     {
       userId: user.id,
       tenantId: user.tenantId,
       email: user.email,
       role: user.role,
       // Note: Missing 'sub' claim! (See Scenario 4)
     },
     process.env.JWT_SECRET || 'dev-secret',
     {
       expiresIn: '7d',
       issuer: process.env.JWT_ISSUER || 'autolytiq.local',
       audience: process.env.JWT_AUDIENCE || 'autolytiq.clients',
     }
   );
   ```

5. **Test Token Manually:**
   ```bash
   # Decode token to inspect payload
   TOKEN="eyJhbGciOiJSUzI1NiI..."
   echo $TOKEN | cut -d. -f2 | base64 -d | jq .
   
   # Should show:
   # {
   #   "sub": "user-id",
   #   "tenantId": "tenant-id",
   #   "email": "user@example.com",
   #   "iss": "autolytiq.local",
   #   "aud": "autolytiq.clients",
   #   "exp": <timestamp>
   # }
   ```

---

### Scenario 4: 401 - "Token subject missing"

**Symptoms:**
- Token signature verification passes
- But then 401 error: "Token subject missing"
- Issue is with token payload, not signature

**Root Cause:**
- JWT payload missing `sub` claim (subject/user ID)

**File to Check:**
- `/root/autolytiq/apps/backend/src/routes/auth.routes.ts` - Login endpoint

**The Issue:**
```typescript
// WRONG - Missing 'sub' claim:
const token = jwt.sign(
  {
    userId: user.id,      // <-- Should be 'sub', not 'userId'
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  },
  JWT_SECRET
);

// CORRECT - Has 'sub' claim:
const token = jwt.sign(
  {
    sub: user.id,         // <-- Correct claim name
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  },
  JWT_SECRET
);
```

**Verification in Middleware:**
```typescript
// apps/backend/src/middleware/auth.ts
const payload = jwt.verify(token, publicKey, {...});

if (!payload.sub) {  // <-- Checking for 'sub' claim
  return res.status(401).json({ message: 'Token subject missing' });
}
```

**Fix:**
Update login endpoint to sign token with `sub` instead of `userId`.

---

### Scenario 5: 401 - "Invalid audience" or "Invalid issuer"

**Symptoms:**
- Token is valid and has proper signature
- Error: "Invalid audience" or "Invalid issuer"
- Mismatch between token and configuration

**Root Cause:**
- Token issued with one issuer/audience
- Backend configured with different issuer/audience

**Files to Check:**
- `/root/autolytiq/apps/backend/src/routes/auth.routes.ts` - Token signing
- `/root/autolytiq/apps/backend/src/middleware/auth.ts` - Token verification
- `/root/autolytiq/.env` - JWT configuration

**Debugging:**

1. **Check Token Claims:**
   ```bash
   TOKEN="eyJhbGciOiJSUzI1NiI..."
   echo $TOKEN | cut -d. -f2 | base64 -d | jq '.iss, .aud'
   
   # Shows what's IN the token
   ```

2. **Check Configuration:**
   ```bash
   echo "Issuer: $(grep JWT_ISSUER /root/autolytiq/.env)"
   echo "Audience: $(grep JWT_AUDIENCE /root/autolytiq/.env)"
   
   # Shows what backend expects
   ```

3. **They Must Match:**
   ```
   Token:
     iss: "autolytiq.local"      <-- From jwt.sign(payload, ...)
     aud: "autolytiq.clients"
   
   Config:
     JWT_ISSUER: autolytiq.local        <-- From .env
     JWT_AUDIENCE: autolytiq.clients
   ```

**Fix:**
Ensure they match:
- Login endpoint signs token with correct issuer/audience
- Backend env variables match token claims

---

## Step-by-Step Debugging Checklist

### 1. Verify Backend Environment
```bash
cd /root/autolytiq

# Check critical variables are set
grep -E "JWT_PUBLIC_KEY|JWT_ISSUER|JWT_AUDIENCE|DATABASE_URL" .env

# Verify .env exists
ls -la .env
```

### 2. Verify Database Connection
```bash
# Check database is accessible
pnpm db:generate

# Check users exist in database
pnpm db:seed  # If needed

# Query users (using psql or Prisma Studio)
```

### 3. Test Login Endpoint
```bash
# Restart backend to ensure env vars loaded
pkill node || true
pnpm dev:server &

# Wait for server to start
sleep 5

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "MAIN",
    "username": "test@example.com",
    "password": "testpassword"
  }' -s | jq .

# Check response:
# 1. Status code should be 200
# 2. Response should include "token" field
# 3. Token should be non-empty string
```

### 4. Test Protected Endpoint with Token
```bash
# Get token from login response
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"MAIN","username":"test@example.com","password":"testpassword"}' \
  -s | jq -r '.token')

# Use token to access protected endpoint
curl -X GET http://localhost:5000/api/auth/user \
  -H "Authorization: Bearer $TOKEN" -s | jq .

# Expected: 200 OK with user data
```

### 5. Check Frontend Configuration
```bash
# Verify frontend API config
grep -r "API_BASE_URL\|VITE_API_URL" /root/autolytiq/apps/frontend/src/config/

# Verify login page exists and is correct
ls -la /root/autolytiq/apps/frontend/src/pages/login.tsx

# Verify useAuth hook exists
ls -la /root/autolytiq/apps/frontend/src/hooks/useAuth.ts
```

### 6. Test Frontend Login Flow
```bash
# In browser DevTools Network tab:
# 1. Submit login form
# 2. Verify POST /api/auth/login returns 200
# 3. Verify response includes "token" field
# 4. Verify subsequent requests include "Authorization: Bearer <token>" header

# Console checks:
# localStorage.getItem('authToken')  # If using localStorage
# Should return token string or null (depending on implementation)
```

---

## Key Files Summary

| File | Purpose | When 401 Error |
|------|---------|---|
| `/root/autolytiq/apps/backend/src/middleware/auth.ts` | JWT verification | Check token validation logic |
| `/root/autolytiq/apps/backend/src/routes/auth.routes.ts` | Login endpoint | Check token generation, missing 'sub' claim |
| `/root/autolytiq/apps/backend/src/routes/index.ts` | Route registration | Check order: public routes before protected |
| `/root/autolytiq/apps/backend/src/config/env.ts` | Environment config | Check JWT_PUBLIC_KEY, ISSUER, AUDIENCE |
| `/root/autolytiq/apps/frontend/src/pages/login.tsx` | Login UI | Check if token is being stored |
| `/root/autolytiq/apps/frontend/src/hooks/useAuth.ts` | Auth state | Check if token is being sent in requests |
| `/root/autolytiq/apps/frontend/src/lib/queryClient.ts` | API requests | Check if Bearer header is included |
| `/root/autolytiq/.env` | Environment variables | Check JWT configuration values |

---

## Common Error Messages & Solutions

| Error Message | Cause | Solution |
|---|---|---|
| "Authorization token missing" | No Bearer header in request | Add `Authorization: Bearer <token>` header |
| "Invalid or expired token" | Token signature invalid or expired | Verify JWT_PUBLIC_KEY, token not expired (7 day limit) |
| "Token subject missing" | JWT payload missing `sub` claim | Change `userId` to `sub` in login endpoint |
| "Invalid audience" | JWT audience mismatch | Ensure JWT_AUDIENCE env matches token aud claim |
| "Invalid issuer" | JWT issuer mismatch | Ensure JWT_ISSUER env matches token iss claim |
| "User not found" | User doesn't exist in database | Check username/email, seed database |
| "Invalid credentials" | Password mismatch | Verify password is correct |
| "Account is not active" | User or tenant status is not ACTIVE | Check user.status and tenant.status in database |

---

## Essential Commands

```bash
# Navigate to project
cd /root/autolytiq

# Install dependencies
pnpm install

# Generate Prisma client (after schema changes)
pnpm db:generate

# Seed test data
pnpm db:seed

# Start backend server
pnpm dev:server

# Start frontend
pnpm dev:client

# Start both
pnpm dev

# Type check
pnpm typecheck

# Restart everything (full clean slate)
pkill node || true
pnpm db:generate
pnpm dev

# View environment variables
cat .env | grep JWT
```

---

## Quick Verification Script

```bash
#!/bin/bash
cd /root/autolytiq

echo "=== Checking JWT Configuration ==="
grep JWT .env
echo ""

echo "=== Checking Authentication Middleware ==="
head -20 apps/backend/src/middleware/auth.ts
echo ""

echo "=== Checking Route Registration ==="
grep -A 5 "registerRoutes" apps/backend/src/routes/index.ts | head -15
echo ""

echo "=== Testing Login Endpoint ==="
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"MAIN","username":"test@example.com","password":"test"}' \
  -s | jq . || echo "Backend not running"
```


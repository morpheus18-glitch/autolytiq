# AutolytiQ 401 Authentication Error - Root Cause Analysis

**Date**: 2025-11-02
**Status**: IDENTIFIED - NOT YET FIXED
**Severity**: CRITICAL - Blocks all authenticated API calls after login

---

## Executive Summary

The application's login endpoint successfully authenticates users and returns a JWT token, but the frontend never stores or sends this token in subsequent API requests, causing all protected endpoints to return 401 errors.

---

## The Problem Flow

```
1. User submits login form
   ↓
2. POST /api/auth/login → Backend validates credentials ✓
   ↓
3. Backend generates JWT token with correct 'sub' claim ✓
   ↓
4. Backend returns token in response: { id, email, token, ... } ✓
   ↓
5. Frontend receives response ✓
   ↓
6. ❌ Frontend DOES NOT store token anywhere
   ↓
7. Frontend navigates to /dashboard
   ↓
8. Protected components try to fetch data (e.g., GET /api/auth/user)
   ↓
9. ❌ Frontend DOES NOT include Authorization header
   ↓
10. Backend middleware checks for Authorization header
   ↓
11. ❌ Backend returns 401: "Authorization token missing"
```

---

## Affected Files

### 1. `/root/autolytiq/apps/frontend/src/pages/login.tsx`

**Lines 37-50**: Login handler receives token but doesn't store it

```typescript
const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  setIsSubmitting(true);
  try {
    const response = await apiRequest("POST", "/api/auth/login", {
      storeId: storeId.trim(),
      username: username.trim(),
      password,
    });

    const data = (await response.json()) as LoginResponse;
    // ❌ PROBLEM: 'data.token' exists in response but is never stored!

    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

    toast({
      title: "Welcome back",
      description: `Signed in as ${data.firstName} ${data.lastName}`,
    });

    const target = data.access?.homePath ?? "/";
    navigate(target, { replace: true });
    // ❌ User is redirected but has no token for subsequent API calls
  }
  // ...
}
```

**What should happen**:
```typescript
const data = (await response.json()) as LoginResponse;

// Store token in localStorage or memory
localStorage.setItem('authToken', data.token);

// OR use a proper auth context/store
setAuthToken(data.token);
```

---

### 2. `/root/autolytiq/apps/frontend/src/lib/queryClient.ts`

**Lines 59-64**: `apiRequest` function missing Authorization header

```typescript
const res = await fetch(resolveUrl(url), {
  method,
  headers: body ? { 'Content-Type': 'application/json' } : {},
  // ❌ PROBLEM: No Authorization header!
  body: body ? JSON.stringify(body) : undefined,
  credentials: 'include',
});
```

**Lines 80-82**: `getQueryFn` also missing Authorization header

```typescript
const res = await fetch(requestUrl, {
  credentials: 'include',
  // ❌ PROBLEM: No Authorization header!
});
```

**What should happen**:
```typescript
const token = getStoredToken(); // From localStorage or auth context

const res = await fetch(resolveUrl(url), {
  method,
  headers: {
    ...(body && { 'Content-Type': 'application/json' }),
    ...(token && { 'Authorization': `Bearer ${token}` }),
  },
  body: body ? JSON.stringify(body) : undefined,
  credentials: 'include',
});
```

---

## Backend Behavior (Working Correctly)

### Token Generation: `/root/autolytiq/apps/backend/src/routes/auth.routes.ts:67-96`

✓ Token is correctly generated with required claims:
```typescript
const token = jwt.sign(
  {
    sub: user.id,           // ✓ Required 'sub' claim present
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
    roles: [user.role],
    isSuperAdmin: user.isSuperAdmin,
  },
  privateKey,
  {
    algorithm: 'RS256',
    expiresIn: '7d',
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  }
);

// ✓ Token is returned in response
res.json({
  id: user.id,
  // ... other user fields
  token,  // ✓ Token is included
});
```

### Token Verification: `/root/autolytiq/apps/backend/src/middleware/auth.ts:54-91`

✓ Middleware correctly checks for Authorization header:
```typescript
export const authenticate: RequestHandler = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.toLowerCase().startsWith('bearer ')) {
    // ❌ This is where 401 errors occur - no header sent from frontend
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: env.JWT_AUDIENCE,
      issuer: env.JWT_ISSUER,
    }) as TokenPayload;

    if (!payload.sub) {
      return res.status(401).json({ message: 'Token subject missing' });
    }

    // ✓ If token was sent, this would work correctly
    req.context = {
      user: { id: payload.sub, /* ... */ },
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
```

---

## Evidence of the Bug

### Manual Testing Confirms the Issue

```bash
# Step 1: Login works and returns token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"MAIN","username":"test@example.com","password":"test"}' \
  -s | jq .

# Response includes token:
# {
#   "id": "...",
#   "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
#   ...
# }

# Step 2: Using the token works
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X GET http://localhost:5000/api/auth/user \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq .

# Response: 200 OK with user data

# Step 3: Without token fails (what frontend is doing)
curl -X GET http://localhost:5000/api/auth/user -s | jq .

# Response: 401 {"message":"Authorization token missing"}
```

---

## Impact

**All protected API endpoints fail after login**, including:
- GET `/api/auth/user` - User profile
- GET `/api/leads` - Leads list
- GET `/api/inventory` - Inventory list
- GET `/api/deals` - Deals list
- All other protected resources

**User Experience**:
1. User logs in successfully
2. Sees "Welcome back" toast message
3. Gets redirected to dashboard
4. Dashboard shows loading state forever
5. All data fetching fails with 401 errors
6. User appears "logged in" but can't access any data

---

## Solution Requirements

### Required Changes

1. **Store token after login** (`login.tsx`)
   - Save token to localStorage or auth context
   - Token must be accessible to all API requests

2. **Include token in all API requests** (`queryClient.ts`)
   - Add `Authorization: Bearer ${token}` header to `apiRequest`
   - Add `Authorization: Bearer ${token}` header to `getQueryFn`
   - Retrieve token from storage before each request

3. **Handle token expiration**
   - Clear token on 401 errors (expired/invalid token)
   - Redirect to login page when token is invalid

---

## Recommended Implementation

### Option 1: localStorage (Simple)

**Pros**: Simple, works across tabs, persists on refresh
**Cons**: Vulnerable to XSS attacks (requires CSP headers)

```typescript
// After login
localStorage.setItem('authToken', data.token);

// In API requests
const token = localStorage.getItem('authToken');
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

// On logout or 401
localStorage.removeItem('authToken');
```

### Option 2: Auth Context (Better)

**Pros**: Centralized, easier to test, can add refresh logic
**Cons**: Doesn't persist on page refresh (needs localStorage too)

```typescript
// Create AuthContext
const AuthContext = createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
}>({ token: null, setToken: () => {} });

// After login
const { setToken } = useAuth();
setToken(data.token);

// In API requests
const { token } = useAuth();
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Option 3: Hybrid (Best)

Combine both: store in localStorage for persistence, manage via context for reactivity.

---

## Next Steps

1. ✅ Document error (this file)
2. ⏳ Commit documentation
3. ⏳ Implement token storage in login.tsx
4. ⏳ Implement Authorization header in queryClient.ts
5. ⏳ Test login flow end-to-end
6. ⏳ Test protected API calls after login

---

## References

- Existing debugging guide: `/root/AUTOLYTIQ_401_DEBUGGING_GUIDE.md` - Scenario 2
- Backend auth middleware: `/root/autolytiq/apps/backend/src/middleware/auth.ts`
- Backend login endpoint: `/root/autolytiq/apps/backend/src/routes/auth.routes.ts`
- Frontend login page: `/root/autolytiq/apps/frontend/src/pages/login.tsx`
- Frontend API client: `/root/autolytiq/apps/frontend/src/lib/queryClient.ts`

---

**Analysis completed**: 2025-11-02
**Ready for fix implementation**

# 🚀 Autolytiq - Complete Auth with Real JWT Tokens

## ✅ What's Ready

✅ **Backend with JWT Authentication**
- Express.js server on port 3000
- Real JWT token generation with `jsonwebtoken`
- Bcrypt password hashing
- CORS enabled for frontend
- Auth routes: `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout`
- Protected route middleware
- Role-based access control middleware

✅ **Frontend with Real API Integration**
- Login page connected to backend
- JWT token storage in localStorage
- Role-based dashboard routing
- Protected routes

## 🚀 Quick Start

### 1. Start Backend (Terminal 1)

```bash
cd /root/autolytiq
pnpm --filter @repo/backend dev
```

You should see:
```
🚀 Backend server running!

   Port:        3000
   Environment: development
   Auth:        http://localhost:3000/api/auth/login
   Health:      http://localhost:3000/health

Ready to accept requests...
```

### 2. Start Frontend (Terminal 2)

```bash
cd /root/autolytiq
pnpm --filter @repo/frontend dev
```

Frontend will start at **http://localhost:5173**

## 🔐 Test Credentials

All passwords are: `demo123`

| Role | Store ID | Username | Dashboard |
|------|----------|----------|-----------|
| Admin | demo | admin | /dashboard/admin |
| Sales Manager | demo | manager | /dashboard/manager |
| Salesperson | demo | sales | /dashboard/sales |

## 🎯 How It Works

### 1. Login Flow

```
User submits form
    ↓
POST http://localhost:3000/api/auth/login
{
  "storeId": "demo",
  "username": "admin",
  "password": "demo123"
}
    ↓
Backend validates credentials
    ↓
Backend generates JWT token
    ↓
Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-001",
    "username": "admin",
    "email": "admin@demo.com",
    "role": "admin",
    "firstName": "Admin",
    "lastName": "User"
  },
  "tenant": {
    "id": "tenant-demo",
    "name": "Demo Motors",
    "slug": "demo"
  }
}
    ↓
Frontend stores token in localStorage
    ↓
Frontend redirects to /dashboard/{role}
```

### 2. JWT Token Structure

The JWT token contains:
```json
{
  "userId": "user-001",
  "username": "admin",
  "role": "admin",
  "tenantId": "tenant-demo",
  "iat": 1234567890,
  "exp": 1234654290
}
```

Token expires in **24 hours**.

### 3. Protected API Calls

For protected endpoints, include the token:

```javascript
fetch('http://localhost:3000/api/some-protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

Backend middleware will:
1. Extract and verify the token
2. Decode user info
3. Add `req.user` to the request
4. Ensure tenant isolation

## 📁 Backend File Structure

```
apps/backend/src/
├── index.ts                 # Main server with Express setup
├── routes/
│   └── auth.ts             # Auth endpoints (login, verify, logout)
└── middleware/
    └── auth.ts             # JWT verification middleware
```

### Key Files:

**`src/routes/auth.ts`** - Auth endpoints:
- `POST /api/auth/login` - Login with store ID + username + password
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout (client removes token)

**`src/middleware/auth.ts`** - Middleware functions:
- `authenticateToken()` - Verify JWT and add user to request
- `requireRole(...)` - Check if user has required role
- `ensureTenantIsolation()` - Ensure multi-tenant data isolation

## 🔧 Environment Variables

### Backend (`.env`)
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=autolytiq-super-secret-jwt-key-change-this-in-production-2024
FRONTEND_URL=http://localhost:5173
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000
```

## 🧪 Testing the API

### 1. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "demo",
    "username": "admin",
    "password": "demo123"
  }'
```

### 2. Test Token Verification
```bash
# First, copy the token from login response
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Health Check
```bash
curl http://localhost:3000/health
```

## 🔐 Security Features

✅ **JWT Tokens** - Industry-standard authentication
✅ **Bcrypt Password Hashing** - Passwords never stored in plain text
✅ **CORS Protection** - Only your frontend can make requests
✅ **Token Expiration** - Tokens expire after 24 hours
✅ **Tenant Isolation** - Multi-tenant data separation
✅ **Role-Based Access** - Different permissions per role

## 📝 Adding Protected Routes

To protect a new backend route:

```typescript
import { authenticateToken, requireRole } from './middleware/auth';

// Require authentication
router.get('/api/deals', authenticateToken, (req, res) => {
  const user = req.user; // Available after auth middleware
  // ... your logic
});

// Require specific role
router.post('/api/deals/approve',
  authenticateToken,
  requireRole('sales_manager', 'admin'),
  (req, res) => {
    // Only sales_manager or admin can access
  }
);
```

## 🎨 Mock Users

The backend currently uses mock users. To add more:

Edit `apps/backend/src/routes/auth.ts`:

```typescript
const mockUsers: User[] = [
  {
    id: 'user-004',
    username: 'newuser',
    email: 'newuser@demo.com',
    password: DEMO_PASSWORD_HASH, // 'demo123'
    role: 'salesperson',
    firstName: 'New',
    lastName: 'User',
    tenantId: 'tenant-demo',
  },
];
```

## 🔄 Next Steps

### Replace Mock Users with Database

1. Set up Prisma:
```bash
cd packages/db
pnpm prisma generate
```

2. Replace mock users in `auth.ts` with Prisma queries:
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Find user
const user = await prisma.user.findFirst({
  where: {
    username: username.toLowerCase(),
    tenant: { slug: storeId.toLowerCase() }
  },
  include: { tenant: true }
});
```

### Add More Auth Features

- [ ] Password reset flow
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Session management
- [ ] Token refresh
- [ ] Login history/audit log

---

## ✨ Summary

You now have:
- ✅ Real JWT-based authentication
- ✅ Secure password hashing with bcrypt
- ✅ Multi-tenant support
- ✅ Role-based access control
- ✅ Frontend ↔ Backend integration
- ✅ Protected routes
- ✅ Clean TypeScript throughout

**Start both servers and test the login flow!** 🎉

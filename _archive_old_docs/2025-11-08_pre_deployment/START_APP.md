# 🚀 Autolytiq - Minimal Auth Flow Ready!

## ✅ Build Successful!

The frontend has been stripped down to a minimal, working login → role-based dashboard flow.

## 📝 How to Start

### 1. Start the Development Server

```bash
cd /root/autolytiq
pnpm --filter @repo/frontend dev
```

The app will start at **http://localhost:5173**

### 2. Test Login Credentials

Use these demo credentials to test different roles:

**Admin Dashboard:**
- Store ID: `demo`
- Username: `admin`
- Password: `demo123`

**Sales Dashboard:**
- Store ID: `demo`
- Username: `sales`
- Password: `demo123`

**Manager Dashboard:**
- Store ID: `demo`
- Username: `manager`
- Password: `demo123`

## 🎯 What's Included

### Login Page (`/login`)
- Store/Tenant ID field
- Username field
- Password field
- Form validation
- Error handling
- Mock authentication

### Role-Based Dashboards

**Sales Dashboard** (`/dashboard/salesperson` or `/dashboard/sales`)
- Active leads count
- Deals in progress
- Closed deals this month
- Monthly revenue
- Quick actions (New Lead, Start Deal, View Inventory)
- Recent activity feed

**Manager Dashboard** (`/dashboard/manager` or `/dashboard/sales_manager`)
- Team performance metrics
- Pending approvals
- Monthly profit
- Team overview with member status
- Pending actions requiring approval

**Admin Dashboard** (`/dashboard/admin` or `/dashboard/gm`)
- Total users count
- System health status
- Active sessions
- Storage usage
- Recent activity log
- Quick settings toggles
- Management cards (Users, Roles, Settings)

## 🔐 Auth Flow

1. User enters store ID + username + password
2. Mock auth validates credentials
3. JWT token + user data stored in localStorage
4. User redirected to role-based dashboard
5. Protected routes check authentication
6. Sign out clears localStorage and redirects to login

## 📂 File Structure

```
apps/frontend/src/
├── App.tsx                          # Main app with routing
├── main.tsx                         # Entry point
├── index.css                        # Global styles
├── pages/
│   ├── Login.tsx                    # Login page
│   └── dashboard/
│       ├── SalesDashboard.tsx       # Sales role dashboard
│       ├── ManagerDashboard.tsx     # Manager role dashboard
│       └── AdminDashboard.tsx       # Admin role dashboard
├── contexts/
│   └── AuthContext.tsx              # Auth state management
└── mocks/
    └── mockAuth.ts                  # Mock login API (replace with real backend)
```

## 🔄 Next Steps

### To Connect Real Backend:

1. **Replace Mock Auth** in `src/pages/Login.tsx`:

```typescript
// Current (mock):
const data = await mockLogin(formData);

// Replace with:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
const data = await response.json();
```

2. **Backend API should return**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "username": "john.doe",
    "email": "john@example.com",
    "role": "salesperson",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tenant": {
    "id": "tenant-456",
    "name": "Acme Motors",
    "slug": "acme-motors"
  }
}
```

3. **Supported Roles**:
   - `salesperson` or `sales` → SalesDashboard
   - `sales_manager` or `manager` → ManagerDashboard
   - `admin` or `gm` → AdminDashboard

## ✨ Features

- ✅ Clean TypeScript throughout
- ✅ No hardcoded values
- ✅ No bad imports
- ✅ No route conflicts
- ✅ Role-based routing
- ✅ Protected routes
- ✅ Auth state management
- ✅ localStorage persistence
- ✅ Responsive design
- ✅ Tailwind CSS styling
- ✅ Mock auth for testing

## 🎨 Styling

Uses Tailwind CSS with custom color tokens:
- `accent-*` - Primary brand colors (teal/green)
- `neutral-*` - Grays for text and backgrounds
- `success-*` - Green for positive states
- `error-*` - Red for errors
- `warning-*` - Yellow/orange for warnings
- `blue-*` - Blue for info

All dashboards follow consistent design patterns with stat cards, action buttons, and activity feeds.

---

**Ready to launch!** 🚀

Run `pnpm --filter @repo/frontend dev` and visit http://localhost:5173

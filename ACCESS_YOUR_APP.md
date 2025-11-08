# 🌐 Access Your Autolytiq App

## ✅ Everything is Ready!

Your application is now accessible from anywhere on the internet!

---

## 🚀 Quick Start

```bash
cd /root/autolytiq
./QUICK_START.sh
```

---

## 🌍 Access URLs

### **Main Application**
```
http://134.122.7.75:5173
```

### **Backend API**
```
http://134.122.7.75:3000
```

### **Health Check**
```
http://134.122.7.75:3000/health
```

---

## 🔐 Login

Visit: **http://134.122.7.75:5173**

Enter:
- **Store ID**: `demo`
- **Username**: `admin` (or `manager` or `sales`)
- **Password**: `demo123`

---

## 📱 Works On

✅ Desktop (Chrome, Firefox, Safari, Edge)
✅ Mobile (iOS, Android)
✅ Tablets
✅ Any device with internet

---

## 🎯 What You Get

After login, you'll see different dashboards based on role:

### Admin Dashboard
- Total users, system health, active sessions
- Activity log, settings, management tools

### Manager Dashboard  
- Team performance, pending approvals
- Team overview, action items

### Sales Dashboard
- Active leads, deals in progress
- Monthly revenue, recent activity

---

## 🛠️ Starting the Servers

### Option 1: Quick Start Script
```bash
./QUICK_START.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
pnpm --filter @repo/backend dev
```

**Terminal 2 - Frontend:**
```bash
pnpm --filter @repo/frontend dev
```

---

## 📋 Configuration

| Setting | Value |
|---------|-------|
| Server IP | 134.122.7.75 |
| Frontend Port | 5173 |
| Backend Port | 3000 |
| CORS | Enabled (all origins) |
| Firewall | Inactive (all ports open) |
| JWT Tokens | Enabled (24h expiration) |

---

## 🧪 Test It

### 1. Check Backend Health
```bash
curl http://134.122.7.75:3000/health
```

### 2. Test Login API
```bash
curl -X POST http://134.122.7.75:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"demo","username":"admin","password":"demo123"}'
```

### 3. Open in Browser
```
http://134.122.7.75:5173
```

---

## 📚 Documentation

- **EXTERNAL_ACCESS.md** - Full network configuration guide
- **README_JWT_AUTH.md** - JWT authentication details
- **START_WITH_JWT.md** - Complete API documentation
- **QUICK_START.sh** - One-command startup script

---

## ✨ Summary

You have:
1. ✅ Backend with JWT auth on port 3000
2. ✅ Frontend React app on port 5173
3. ✅ External access configured (0.0.0.0)
4. ✅ CORS enabled for all origins
5. ✅ Three role-based dashboards
6. ✅ Real JWT tokens (24h expiration)
7. ✅ Clean TypeScript code
8. ✅ No hardcoding, no bad imports

---

## 🚀 Ready to Go!

**Just run:**
```bash
./QUICK_START.sh
```

**Then visit:**
```
http://134.122.7.75:5173
```

**Login with:**
- Store: `demo`
- User: `admin`
- Pass: `demo123`

---

🎉 **Enjoy your application!**

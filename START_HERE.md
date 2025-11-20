# Autolytiq Project Exploration - START HERE

## Complete Exploration Delivered

I have completed a **comprehensive exploration** of the Autolytiq project structure, architecture, and authentication/login implementation. This documentation will help you understand the project and debug the 401 error issue.

---

## Documentation Files (Read in This Order)

### 1. THIS FILE - Quick Navigation
**File:** `/root/START_HERE.md` (This file)
**Purpose:** Navigation and quick reference
**Read Time:** 5 minutes

---

### 2. High-Level Summary (Start Here)
**File:** `/root/AUTOLYTIQ_EXPLORATION_SUMMARY.txt` (14 KB)
**Purpose:** Quick overview of the entire project
**Contains:**
- Project architecture at a glance
- Directory structure summary
- Authentication flow overview
- Roles and permissions
- Tech stack summary
- Development workflow

**Read Time:** 5-10 minutes

---

### 3. File Locations Reference
**File:** `/root/AUTOLYTIQ_FILE_LOCATIONS.md` (9.6 KB)
**Purpose:** Find critical authentication files
**Contains:**
- Absolute paths to all key files
- Visual file tree
- Login flow file locations
- Debugging locations table
- Quick commands

**Read Time:** 5 minutes
**Best for:** When you need to find a specific file

---

### 4. 401 Error Debugging Guide
**File:** `/root/AUTOLYTIQ_401_DEBUGGING_GUIDE.md` (15 KB)
**Purpose:** Debug 401 authentication errors
**Contains:**
- 5 detailed 401 error scenarios
- Root causes and solutions
- Step-by-step debugging checklist
- Common error messages
- Testing procedures with curl
- Manual verification script

**Read Time:** 10-15 minutes
**Best for:** Fixing 401 errors in development

---

### 5. Comprehensive Architecture Overview
**File:** `/root/autolytiq_comprehensive_overview.md` (34 KB)
**Purpose:** Deep dive into all systems
**Contains:**
- Complete architecture overview
- Detailed directory structure
- Full authentication implementation
- Middleware chains explained
- Frontend-backend integration
- Configuration details
- Development workflows
- Troubleshooting guide

**Read Time:** 30-45 minutes
**Best for:** Understanding the entire system

---

### 6. Overview of All Documentation
**File:** `/root/README_EXPLORATION_DOCS.md` (9.9 KB)
**Purpose:** Summary of what was explored
**Contains:**
- Overview of all 4 documents
- Key findings summary
- How to use the documentation
- Critical file paths
- Potential issues found
- Next steps for debugging

**Read Time:** 5 minutes

---

## Quick Reference

### Files by Topic

**For Architecture Understanding:**
- Start: AUTOLYTIQ_EXPLORATION_SUMMARY.txt
- Deep dive: autolytiq_comprehensive_overview.md
- Reference: AUTOLYTIQ_FILE_LOCATIONS.md

**For 401 Error Debugging:**
- Read: AUTOLYTIQ_401_DEBUGGING_GUIDE.md
- Find files: AUTOLYTIQ_FILE_LOCATIONS.md
- Understand flow: autolytiq_comprehensive_overview.md

**For File Navigation:**
- Read: AUTOLYTIQ_FILE_LOCATIONS.md
- Commands: AUTOLYTIQ_EXPLORATION_SUMMARY.txt

---

## Critical Findings

### 1. Project Type
- **Monorepo:** pnpm workspace
- **Frontend:** React 18 + Vite (Port 3000)
- **Backend:** Express.js (Port 5000)
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis
- **Microservices:** Rust (gRPC) + Python (FastAPI)

### 2. Authentication System
- **Type:** JWT (RS256 - RSA keys)
- **Endpoint:** POST /api/auth/login (public)
- **Token Storage:** Frontend memory/localStorage
- **Verification:** Authorization: Bearer <token>
- **Expiry:** 7 days
- **Chain:** authenticate → tenantScope → requireRole

### 3. Critical Files
1. `/root/autolytiq/apps/backend/src/middleware/auth.ts` - Token verification
2. `/root/autolytiq/apps/backend/src/routes/auth.routes.ts` - Login endpoint
3. `/root/autolytiq/apps/backend/src/routes/index.ts` - Route registration
4. `/root/autolytiq/apps/frontend/src/pages/login.tsx` - Login form
5. `/root/autolytiq/apps/frontend/src/hooks/useAuth.ts` - Auth state
6. `/root/autolytiq/.env` - Configuration

### 4. Key Issues to Watch For
1. **JWT Token Payload:** Uses `userId` instead of `sub` (may cause "Token subject missing")
2. **Route Registration:** Auth routes MUST be before protected middleware
3. **Token Sending:** Frontend must include Authorization header in requests
4. **Environment Setup:** JWT_PUBLIC_KEY must be set correctly

---

## How to Use This Documentation

### Scenario 1: "I need to understand Autolytiq quickly"
1. Read: AUTOLYTIQ_EXPLORATION_SUMMARY.txt (10 min)
2. Skim: AUTOLYTIQ_FILE_LOCATIONS.md (3 min)
3. Reference: autolytiq_comprehensive_overview.md as needed

**Total time: 15 minutes**

### Scenario 2: "I'm getting a 401 error and need to fix it"
1. Read: AUTOLYTIQ_401_DEBUGGING_GUIDE.md (15 min)
2. Identify your scenario (1-5)
3. Follow the debugging steps
4. Use AUTOLYTIQ_FILE_LOCATIONS.md to find files
5. Reference autolytiq_comprehensive_overview.md for code details

**Total time: 20-30 minutes**

### Scenario 3: "I need to find a specific file"
1. Read: AUTOLYTIQ_FILE_LOCATIONS.md (5 min)
2. Find the file path
3. Open it and review

**Total time: 5 minutes**

### Scenario 4: "I want a complete understanding"
1. Read: AUTOLYTIQ_EXPLORATION_SUMMARY.txt (10 min)
2. Read: AUTOLYTIQ_FILE_LOCATIONS.md (5 min)
3. Read: AUTOLYTIQ_401_DEBUGGING_GUIDE.md (15 min)
4. Read: autolytiq_comprehensive_overview.md (45 min)

**Total time: 75 minutes**

---

## Quick Testing Commands

```bash
# Navigate to project
cd /root/autolytiq

# Check JWT is configured
grep JWT .env

# Start development server
pnpm dev:server

# In another terminal, test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"MAIN","username":"test@example.com","password":"test"}' | jq .

# Decode the token
TOKEN="your-token-here"
echo $TOKEN | cut -d. -f2 | base64 -d | jq .

# Test protected endpoint
curl -X GET http://localhost:5000/api/auth/user \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Documentation Statistics

| Document | Size | Lines | Read Time |
|----------|------|-------|-----------|
| AUTOLYTIQ_EXPLORATION_SUMMARY.txt | 14 KB | 380 | 5-10 min |
| AUTOLYTIQ_FILE_LOCATIONS.md | 9.6 KB | 250 | 5 min |
| AUTOLYTIQ_401_DEBUGGING_GUIDE.md | 15 KB | 400 | 10-15 min |
| autolytiq_comprehensive_overview.md | 34 KB | 984 | 30-45 min |
| README_EXPLORATION_DOCS.md | 9.9 KB | 280 | 5 min |
| **TOTAL** | **82.5 KB** | **2294** | **55-80 min** |

---

## Common Questions Answered

### "How does login work?"
See: **autolytiq_comprehensive_overview.md** → Section 3 (Authentication & Login Implementation)

### "What causes 401 errors?"
See: **AUTOLYTIQ_401_DEBUGGING_GUIDE.md** → The 401 Error Scenarios (5 detailed scenarios)

### "Where is the authentication code?"
See: **AUTOLYTIQ_FILE_LOCATIONS.md** → Critical Authentication Files

### "How do I set up the environment?"
See: **autolytiq_comprehensive_overview.md** → Section 6 (Configuration Files)

### "What's the tech stack?"
See: **AUTOLYTIQ_EXPLORATION_SUMMARY.txt** → Section 9 (Tech Stack Summary)

### "How do I test authentication?"
See: **AUTOLYTIQ_401_DEBUGGING_GUIDE.md** → Step-by-Step Debugging Checklist

### "What are the roles and permissions?"
See: **autolytiq_comprehensive_overview.md** → Section 4 (Roles and Permissions)

---

## Next Steps

1. **Read the Overview**
   ```bash
   cat /root/AUTOLYTIQ_EXPLORATION_SUMMARY.txt
   ```

2. **Get File Locations**
   ```bash
   cat /root/AUTOLYTIQ_FILE_LOCATIONS.md
   ```

3. **Debug 401 Errors (if needed)**
   ```bash
   cat /root/AUTOLYTIQ_401_DEBUGGING_GUIDE.md
   ```

4. **Deep Dive into Architecture**
   ```bash
   cat /root/autolytiq_comprehensive_overview.md
   ```

---

## Support Information

All documentation is based on:
- Direct code inspection from `/root/autolytiq`
- Actual file paths (verified)
- Current configuration values
- Implementation details from source code

The documentation is:
- Complete and comprehensive
- Up-to-date with current codebase
- Fully indexed with file paths
- Cross-referenced for easy navigation

---

## File Locations Summary

```
/root/
├── START_HERE.md                              ← You are here
├── AUTOLYTIQ_EXPLORATION_SUMMARY.txt          ← Quick overview (START HERE)
├── AUTOLYTIQ_FILE_LOCATIONS.md                ← File path reference
├── AUTOLYTIQ_401_DEBUGGING_GUIDE.md           ← Error debugging
├── autolytiq_comprehensive_overview.md        ← Complete reference
└── README_EXPLORATION_DOCS.md                 ← Document overview
```

---

## Ready to Begin?

**Start with:** `/root/AUTOLYTIQ_EXPLORATION_SUMMARY.txt` (5-10 min read)

This will give you a complete overview of the Autolytiq project, and from there you can jump to any specific topic using the cross-references.

---

**Exploration completed:** November 2, 2025
**Total documentation:** 2,294 lines across 5 files
**Project:** Autolytiq (pnpm monorepo)
**Focus:** Authentication, Login, and 401 Error Debugging


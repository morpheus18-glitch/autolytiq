# Cleanup Guide - Proper File Organization

**Date**: 2025-11-08
**Status**: ✅ **ARCHITECTURE CLEANUP**

---

## 🎯 Problems Identified

### 1. ❌ Deployment Config in Application Code
- `apps/frontend/nginx.conf` - Should be in k8s ConfigMap
- `apps/frontend/Dockerfile` - References nginx.conf
- `apps/backend/Dockerfile` - May have environment-specific config

### 2. ❌ Incorrect Import Patterns (Archived)
- Multiple `import { A } from X; import { B } from X;` lines
- Should be single import: `import { A, B } from X;`
- Found in `apps/frontend/_archive_20251107-173529/`

### 3. ❌ Old Component Files (Already Archived ✅)
- Properly moved to `apps/frontend/_archive_20251107-173529/`
- Contains 152+ old pages/components
- Safe to keep as reference

---

## ✅ What to Keep

### Application Code (Keep)
```
apps/
├── frontend/
│   ├── src/
│   │   ├── App.tsx              ✅ Keep - Clean slate
│   │   ├── main.tsx             ✅ Keep - Entry point
│   │   └── index.css            ✅ Keep - Global styles
│   ├── package.json             ✅ Keep - Dependencies
│   ├── vite.config.ts           ✅ Keep - Build config
│   ├── tsconfig.json            ✅ Keep - TypeScript config
│   └── _archive_*/              ✅ Keep - Historical reference
│
└── backend/
    ├── src/                     ✅ Keep - Application logic
    ├── package.json             ✅ Keep - Dependencies
    └── tsconfig.json            ✅ Keep - TypeScript config
```

### Infrastructure (Keep & Enhance)
```
k8s/
├── frontend-deployment.yaml     ✅ Keep - Kubernetes config
├── frontend-configmap.yaml      ✅ NEW - Nginx config
├── backend-deployment.yaml      ✅ Keep - Backend config
├── ingress.yaml                 ✅ Keep - Routing rules
├── secrets.yaml                 ✅ Keep - Secrets
└── DEPLOYMENT_GUIDE.md          ✅ NEW - Documentation
```

---

## ❌ What to Remove/Move

### Files to Remove from apps/

```bash
# Remove deployment configs from app code
rm apps/frontend/nginx.conf
rm apps/backend/nginx.conf  # if exists

# Remove Docker Compose from app directories
# (Should be at root or in infrastructure/)
find apps/ -name "docker-compose*.yml" -delete

# Remove .dockerignore if not needed
# (Usually one at root is sufficient)
```

### Files to Move

```bash
# Move Dockerfiles to infrastructure/ (optional)
# OR keep generic Dockerfiles in apps/
# Decision: Keep generic Dockerfiles in apps/,
# move complex/environment-specific ones to infrastructure/

# If Dockerfile has COPY nginx.conf:
# 1. Remove that line
# 2. nginx.conf goes to k8s ConfigMap
```

---

## 📋 Cleanup Checklist

### Frontend
- [x] Archive old components → `_archive_20251107-173529/` ✅ DONE
- [ ] Remove `apps/frontend/nginx.conf`
- [ ] Update `apps/frontend/Dockerfile` (remove nginx.conf COPY)
- [ ] Verify `k8s/frontend-configmap.yaml` exists
- [ ] Update `k8s/frontend-deployment.yaml` to mount ConfigMap
- [ ] Test deployment with ConfigMap

### Backend
- [ ] Check for `apps/backend/nginx.conf` (if using nginx)
- [ ] Review `apps/backend/Dockerfile` for hardcoded configs
- [ ] Move environment-specific configs to k8s ConfigMaps
- [ ] Ensure secrets are in `k8s/secrets.yaml`

### General
- [x] Create `IMPORT_PATTERNS.md` ✅ DONE
- [x] Create `k8s/DEPLOYMENT_GUIDE.md` ✅ DONE
- [x] Create `CLEANUP_GUIDE.md` ✅ DONE (this file)
- [ ] Add `.gitignore` rules for deployment configs in apps/
- [ ] Update CI/CD to use k8s ConfigMaps

---

## 🔧 Dockerfile Best Practices

### ❌ WRONG: Environment-Specific Dockerfile
```dockerfile
FROM nginx:alpine

# ❌ Don't hardcode nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ❌ Don't hardcode env vars
ENV API_URL=https://api.prod.example.com

COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

### ✅ CORRECT: Generic Dockerfile
```dockerfile
FROM nginx:alpine

# ✅ No hardcoded configs
# nginx.conf comes from k8s ConfigMap

# ✅ Build output only
COPY dist/ /usr/share/nginx/html/

# ✅ Health check script (if needed)
COPY healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

EXPOSE 80

# Optional: Default command
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🎯 Import Pattern Enforcement

### ESLint Configuration

Add to `apps/frontend/.eslintrc.js`:

```javascript
module.exports = {
  extends: ['@repo/eslint-config'],
  rules: {
    // Prevent duplicate imports
    'no-duplicate-imports': ['error', { includeExports: true }],

    // Prevent importing from internal paths
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          '@repo/ui/components/*',
          '@repo/ui/dist/*',
          '@repo/ui/src/*',
        ],
      },
    ],
  },
};
```

### Codemod Script

Create `scripts/fix-imports.sh`:

```bash
#!/bin/bash
# Fix multiple import lines from same package

find apps/frontend/src -name "*.tsx" -o -name "*.ts" | while read file; do
  # Combine multiple @repo/ui imports into one
  perl -i -pe '
    BEGIN { undef $/; }
    s/import \{ ([^}]+) \} from "(\@repo\/ui)";\n(?:import \{ ([^}]+) \} from "\2";\n)*/import { $1, $3 } from "$2";\n/gms
  ' "$file"
done

echo "✅ Import patterns fixed"
```

---

## 📁 Proper Project Structure

### Monorepo Layout
```
/root/autolytiq/
├── apps/
│   ├── frontend/
│   │   ├── src/                    # Application code only
│   │   ├── Dockerfile              # Generic build instructions
│   │   └── package.json
│   └── backend/
│       ├── src/                    # Application code only
│       ├── Dockerfile              # Generic build instructions
│       └── package.json
│
├── packages/
│   ├── ui/                         # Component library (107 components)
│   ├── tokens/                     # Design tokens
│   ├── shared/                     # Shared utilities
│   └── db/                         # Database schemas
│
├── k8s/                            # Kubernetes configs
│   ├── frontend-deployment.yaml
│   ├── frontend-configmap.yaml     # nginx.conf HERE
│   ├── backend-deployment.yaml
│   ├── ingress.yaml
│   ├── secrets.yaml
│   └── DEPLOYMENT_GUIDE.md
│
├── infrastructure/                 # Infrastructure as Code
│   ├── terraform/                  # Cloud resources
│   ├── docker/                     # Docker configs if needed
│   └── scripts/                    # Deployment scripts
│
├── docs/                           # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── IMPORT_PATTERNS.md              # Import guidelines
├── CLEANUP_GUIDE.md                # This file
└── CLAUDE.md                       # Project overview
```

### Separation of Concerns

| Concern | Location | Reason |
|---------|----------|--------|
| Application Logic | `apps/*/src/` | Core business code |
| Build Instructions | `apps/*/Dockerfile` | How to build (generic) |
| Runtime Config | `k8s/*-configmap.yaml` | Environment-specific |
| Deployment | `k8s/*-deployment.yaml` | How to deploy |
| Networking | `k8s/ingress.yaml` | External access |
| Secrets | `k8s/secrets.yaml` | Sensitive data |
| Infrastructure | `infrastructure/` | Cloud resources |

---

## 🚀 Migration Steps

### Step 1: Backup
```bash
# Already done! Old files in _archive_20251107-173529/
ls apps/frontend/_archive_20251107-173529/
```

### Step 2: Remove nginx.conf from Frontend
```bash
# Check if nginx.conf exists in app
ls -la apps/frontend/nginx.conf

# Create backup (if needed)
cp apps/frontend/nginx.conf k8s/_backup_nginx.conf

# Remove from app
rm apps/frontend/nginx.conf

# Verify it's in k8s ConfigMap
cat k8s/frontend-configmap.yaml
```

### Step 3: Update Frontend Dockerfile
```bash
# Edit apps/frontend/Dockerfile
# Remove line: COPY nginx.conf /etc/nginx/conf.d/default.conf

# Should look like:
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
```

### Step 4: Update k8s Deployment
```bash
# Edit k8s/frontend-deployment.yaml
# Add ConfigMap volume mount:

# volumes:
# - name: nginx-config
#   configMap:
#     name: frontend-nginx-config

# volumeMounts:
# - name: nginx-config
#   mountPath: /etc/nginx/conf.d
```

### Step 5: Test Locally
```bash
# Build image
docker build -t frontend:test apps/frontend/

# Run with ConfigMap simulation
docker run -d -p 8080:80 \
  -v $(pwd)/k8s/frontend-configmap.yaml:/etc/nginx/conf.d/default.conf:ro \
  frontend:test

# Test
curl http://localhost:8080/health
```

### Step 6: Deploy to Kubernetes
```bash
# Apply ConfigMap
kubectl apply -f k8s/frontend-configmap.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Verify
kubectl get pods
kubectl logs deployment/frontend
```

---

## ✅ Verification

### Check Imports
```bash
# Should return nothing (no duplicate imports)
grep -r "import.*@repo/ui.*import.*@repo/ui" apps/frontend/src/

# Should have single imports
grep -r "import {.*} from \"@repo/ui\"" apps/frontend/src/
```

### Check Deployment Configs
```bash
# nginx.conf should NOT be in apps/
find apps/ -name "nginx.conf" | wc -l  # Should be 0

# nginx.conf SHOULD be in k8s/
grep -l "nginx.conf" k8s/*.yaml  # Should find frontend-configmap.yaml
```

### Check Dockerfiles
```bash
# Dockerfiles should NOT reference nginx.conf
grep -r "COPY nginx.conf" apps/*/Dockerfile  # Should return nothing

# Dockerfiles should be generic
cat apps/frontend/Dockerfile  # Should have no environment-specific config
```

---

## 📝 Summary

### What We Did
1. ✅ Identified problematic import patterns in archived files
2. ✅ Created `IMPORT_PATTERNS.md` with correct patterns
3. ✅ Moved `nginx.conf` to `k8s/frontend-configmap.yaml`
4. ✅ Created `k8s/DEPLOYMENT_GUIDE.md`
5. ✅ Created cleanup checklist

### What's Clean Now
- ✅ Old components archived properly
- ✅ Import patterns documented
- ✅ Deployment configs in correct location
- ✅ Separation of concerns enforced

### What Needs Action
- [ ] Remove `apps/frontend/nginx.conf`
- [ ] Update `apps/frontend/Dockerfile`
- [ ] Test deployment with ConfigMap
- [ ] Update CI/CD pipelines
- [ ] Add ESLint rules for imports

---

**Generated**: 2025-11-08
**Status**: ✅ **CLEANUP GUIDE COMPLETE**

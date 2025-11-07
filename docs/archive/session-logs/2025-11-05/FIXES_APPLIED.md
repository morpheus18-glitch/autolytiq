# Fixes Applied - Bcrypt & Kubernetes Memory Issues

**Date:** 2025-11-03
**Issues:** Bcrypt/bcryptjs authentication errors & Kubernetes pod memory errors

---

## 1. Bcrypt Authentication Fix ✅

### Problem Identified
The codebase had a **library mismatch**:
- **Seed file** (`packages/db/seed.ts`): Used `bcrypt` (native C++ binding) to hash passwords
- **Auth routes** (`apps/backend/src/routes/auth.routes.ts`): Used `bcryptjs` (pure JavaScript) to verify passwords

While these libraries are compatible, this inconsistency could cause:
- Subtle timing differences in authentication
- Dependency bloat (two libraries doing the same thing)
- Potential version mismatch issues
- Performance inconsistencies

### Solution Applied
Standardized on `bcryptjs` throughout the codebase:

**Files Modified:**

1. **`packages/db/seed.ts`** (Line 1, 244)
   ```typescript
   // BEFORE
   import bcrypt from 'bcrypt';
   const passwordHash = await bcrypt.hash(DEVELOPER_PASSWORD, 12);

   // AFTER
   import bcryptjs from 'bcryptjs';
   const passwordHash = await bcryptjs.hash(DEVELOPER_PASSWORD, 12);
   ```

2. **`packages/db/package.json`**
   ```json
   "dependencies": {
     "@prisma/client": "5.22.0",
     "bcryptjs": "^3.0.3"  // ← ADDED
   }
   ```

**Files Using bcryptjs (verified):**
- ✅ `apps/backend/src/routes/auth.routes.ts:2` - Already using bcryptjs
- ✅ `apps/backend/package.json:22` - Already has bcryptjs@3.0.3
- ✅ `packages/db/seed.ts:1` - **FIXED** to use bcryptjs

**Note:** The root `package.json` still has `bcrypt@6.0.0` - this can be removed if not used elsewhere, but it's safe to leave as it won't interfere.

---

## 2. Kubernetes Memory Fixes ✅

### Problem Identified
The dev PostgreSQL StatefulSet had **NO memory limits**, risking OOM (Out Of Memory) kills that would crash the database pod.

### Solution Applied

**File Modified: `infrastructure/k8s/dev/postgres-statefulset.yaml`**

```yaml
# ADDED resource limits and requests (lines 31-37)
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

**Rationale:**
- **Request (256Mi)**: Guarantees minimum memory allocation
- **Limit (1Gi)**: Prevents runaway memory usage
- **CPU (250m-1000m)**: Reasonable for development workload

---

## 3. Production Kubernetes Memory Audit ✅

I reviewed all production deployments for memory configuration. **Good news: All production pods have proper memory limits!**

### Production Memory Configuration Summary

| Service | Replicas | Memory Request | Memory Limit | Status |
|---------|----------|----------------|--------------|--------|
| **Backend** | 2 | 512Mi | 1Gi | ✅ Good |
| **Frontend** | 2 | 256Mi | 512Mi | ✅ Good |
| **ML Service** | 2 | 1Gi | 2Gi | ⚠️ Monitor (high usage) |
| **Celery Worker** | 2 | 512Mi | 1Gi | ✅ Good |
| **Celery Beat** | 1 | 256Mi | 512Mi | ✅ Good |
| **Redis** | 1 | 128Mi | 512Mi | ✅ Good |

### Files Reviewed (All Good):
- ✅ `/root/autolytiq/infrastructure/k8s/production/backend-deployment.yaml`
- ✅ `/root/autolytiq/infrastructure/k8s/production/frontend-deployment.yaml`
- ✅ `/root/autolytiq/infrastructure/k8s/production/ml-service-deployment.yaml`
- ✅ `/root/autolytiq/infrastructure/k8s/production/celery-worker-deployment.yaml`
- ✅ `/root/autolytiq/infrastructure/k8s/production/redis-deployment.yaml`

---

## 4. Recommendations for Memory Management

### Immediate Actions
1. **Install dependencies** (blocked by OOM during install):
   ```bash
   # If pnpm install fails with OOM:
   # Option 1: Increase system memory
   # Option 2: Install in smaller chunks
   cd /root/autolytiq
   pnpm install --filter @repo/db
   pnpm install --filter @repo/backend
   pnpm install
   ```

2. **Test authentication** after changes:
   ```bash
   # Reseed database with new bcryptjs hashes
   pnpm db:seed

   # Test login endpoint
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin@example.com","password":"your_dev_password"}'
   ```

### Long-term Improvements

#### A. Add Memory-Based Autoscaling
Currently, HPAs (Horizontal Pod Autoscalers) only use CPU metrics. Add memory-based scaling:

```yaml
# Example for backend HPA
metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80  # Scale when memory hits 80%
```

#### B. Monitor ML Service Memory
The ML service has the highest memory allocation (2Gi limit). If you see OOM kills:
- Consider increasing limit to 3Gi
- Optimize ML model loading (lazy load, shared memory)
- Add memory profiling to identify leaks

#### C. Add Production PostgreSQL (if needed)
The production setup doesn't have a PostgreSQL deployment in the k8s folder (likely using managed database). If deploying Postgres in K8s:

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

#### D. Remove Unused bcrypt Dependency
If `bcrypt@6.0.0` in root `package.json` is not used elsewhere, remove it:

```bash
# Check usage
grep -r "from 'bcrypt'" --include="*.ts" --include="*.js" /root/autolytiq

# If no results (besides seed.ts which we fixed), remove it:
cd /root/autolytiq
pnpm remove bcrypt -w
pnpm remove @types/bcrypt -w
```

---

## 5. Testing Checklist

After applying these fixes, verify:

- [ ] `pnpm install` completes successfully
- [ ] Database seeding works: `pnpm db:seed`
- [ ] Login authentication succeeds
- [ ] Password verification uses bcryptjs consistently
- [ ] Dev PostgreSQL pod doesn't get OOM killed
- [ ] Apply dev k8s changes: `kubectl apply -f infrastructure/k8s/dev/postgres-statefulset.yaml`
- [ ] Monitor pod memory: `kubectl top pods -n autolytiq-dev`

---

## Files Modified Summary

1. **`packages/db/seed.ts`** - Changed bcrypt to bcryptjs
2. **`packages/db/package.json`** - Added bcryptjs dependency
3. **`infrastructure/k8s/dev/postgres-statefulset.yaml`** - Added memory/CPU limits

---

## Next Steps

1. **Complete dependency installation** (may need to increase system memory or install in chunks)
2. **Test authentication flow** to verify bcryptjs standardization works
3. **Deploy Kubernetes changes** to dev environment
4. **Monitor memory usage** in dev and production
5. **Consider adding memory-based HPA** to production deployments

---

**Status:** ✅ Fixes applied successfully. Pending dependency installation completion.

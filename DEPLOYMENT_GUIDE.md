# Autolytiq Deployment Guide

**This VM is Command Center Only** - All builds and deployments run via GitHub Actions → Kubernetes

---

## Quick Reference

### Deployment Command Center
```bash
# Check cluster status
./deploy-command-center.sh status

# View all pods
./deploy-command-center.sh pods

# Tail logs for a service
./deploy-command-center.sh logs backend

# Restart a deployment
./deploy-command-center.sh restart backend

# Show everything
./deploy-command-center.sh all
```

---

## Current Cluster Status

**Cluster:** `autolytiq-cluster` (DigitalOcean Kubernetes)
**Namespace:** `autolytiq-prod`

### Running Services
- ✅ **Backend** - 2/2 pods (Node.js/Express)
- ✅ **Frontend** - 2/2 pods (React/Vite)
- ✅ **ML Service** - 2/2 pods (Python/FastAPI)
- ✅ **Rust Pricing** - 1/1 pod (Rust gRPC service)

### Service Endpoints
- Backend: `backend.autolytiq-prod.svc.cluster.local:80` (internal)
- Rust Pricing: `rust-pricing.autolytiq-prod.svc.cluster.local:50051` (gRPC)
- ML Service: `ml-service.autolytiq-prod.svc.cluster.local:80` (internal)

---

## Deployment Workflow

### How Code Gets Deployed

```
1. Push to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Docker image built
   ↓
4. Image pushed to DigitalOcean Container Registry
   ↓
5. Kubernetes deployment updated
   ↓
6. Rolling update applied (zero downtime)
   ↓
7. Health checks verify new pods
   ↓
8. Old pods terminated
```

### GitHub Actions Workflows

Located in `.github/workflows/`:

- `backend.yml` - Backend service deployment
- `frontend.yml` - Frontend application deployment
- `ml.yml` - ML service deployment
- `rust.yml` - Rust pricing service deployment

---

## Deploying Changes

### Method 1: Automatic (Recommended)
Push code to main branch:
```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

GitHub Actions will automatically:
- Build Docker image
- Run tests
- Deploy to K8s cluster
- Verify health checks

### Method 2: Manual Trigger
Using GitHub CLI:
```bash
# Trigger backend deployment
gh workflow run backend.yml

# Trigger frontend deployment
gh workflow run frontend.yml

# Check run status
gh run list
```

### Method 3: Via Command Center
```bash
./deploy-command-center.sh deploy backend
./deploy-command-center.sh deploy frontend
```

---

## Recent Changes Ready for Deployment

### Backend (ES Module Fix)
**File:** `apps/backend/src/lib/grpc/priceEngineClient.ts`
**Change:** Fixed `__dirname` error for ES modules
**Status:** ✅ Fixed in code, pending deployment
**Impact:** Backend will start successfully

**To Deploy:**
```bash
cd /root/autolytiq
git add apps/backend/src/lib/grpc/priceEngineClient.ts
git commit -m "fix: resolve ES module __dirname error in gRPC client"
git push origin main
```

### Frontend (Deal Studio Components)
**Files Added:**
- `AICoachCard.tsx` - AI recommendation cards
- `DealStructureSummary.tsx` - Deal breakdown component
- `FIProductSelector.tsx` - F&I products selector
- `shared/index.ts` - Component exports

**Status:** ✅ Ready for deployment
**Impact:** Deal Studio will have complete UI components

**To Deploy:**
```bash
cd /root/autolytiq
git add apps/frontend/src/components/deal-studio/shared/
git commit -m "feat: add Deal Studio shared components (AICoachCard, DealStructureSummary, FIProductSelector)"
git push origin main
```

---

## Monitoring Deployments

### Watch Rollout Progress
```bash
# Backend
kubectl rollout status deployment/backend -n autolytiq-prod

# Frontend
kubectl rollout status deployment/frontend -n autolytiq-prod

# Check if rollout completed successfully
kubectl get deployments -n autolytiq-prod
```

### View Logs
```bash
# Real-time logs
./deploy-command-center.sh logs backend

# Or with kubectl
kubectl logs -f -n autolytiq-prod -l app.kubernetes.io/name=backend --tail=100

# Check for errors
kubectl logs -n autolytiq-prod -l app.kubernetes.io/name=backend | grep -i error
```

### Health Checks
```bash
# Run health checks
./deploy-command-center.sh health

# Or manually
kubectl exec -n autolytiq-prod deployment/backend -- wget -qO- http://localhost:5000/health
```

---

## Troubleshooting Deployments

### Deployment Stuck
```bash
# Check pod status
kubectl get pods -n autolytiq-prod

# Describe problematic pod
kubectl describe pod <pod-name> -n autolytiq-prod

# Check events
kubectl get events -n autolytiq-prod --sort-by='.lastTimestamp' | tail -20
```

### Rollback Deployment
```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n autolytiq-prod

# Check rollout history
kubectl rollout history deployment/backend -n autolytiq-prod
```

### Restart Deployment
```bash
# Force restart (picks up new config/secrets)
./deploy-command-center.sh restart backend

# Or with kubectl
kubectl rollout restart deployment/backend -n autolytiq-prod
```

---

## Database Migrations

### Run Prisma Migration
```bash
# Check if migration job exists
kubectl get jobs -n autolytiq-prod | grep prisma-migrate

# Run migration manually
kubectl apply -f infrastructure/k8s/production/prisma-migrate-job.yaml

# Watch migration progress
kubectl logs -f -n autolytiq-prod job/prisma-migrate
```

---

## Environment Variables & Secrets

### Update Secrets
Secrets are managed via GitHub Actions, not locally.

To update a secret:
1. Go to GitHub repository settings
2. Secrets and variables → Actions
3. Update the secret value
4. Re-run the deployment workflow

**Important Secrets:**
- `DATABASE_URL` - PostgreSQL connection
- `DIRECT_URL` - Direct PostgreSQL connection
- `JWT_PRIVATE_KEY` - JWT signing key
- `JWT_PUBLIC_KEY` - JWT verification key
- `REDIS_URL` - Redis connection
- `DO_TOKEN` - DigitalOcean API token

---

## Scaling Services

### Manual Scaling
```bash
# Scale backend to 3 replicas
kubectl scale deployment backend -n autolytiq-prod --replicas=3

# Scale down
kubectl scale deployment backend -n autolytiq-prod --replicas=1
```

### Horizontal Pod Autoscaler (HPA)
```bash
# Check HPA status
kubectl get hpa -n autolytiq-prod

# Apply HPA configuration
kubectl apply -f infrastructure/k8s/production/hpa.yaml
```

---

## Deal Studio Deployment Checklist

### Pre-Deployment
- [x] ES module fix applied
- [x] Shared components created
- [x] K8s cluster verified healthy
- [ ] Backend changes committed
- [ ] Frontend changes committed
- [ ] Changes pushed to main

### Post-Deployment
- [ ] Verify backend pods healthy
- [ ] Verify frontend pods healthy
- [ ] Test pricing API endpoint
- [ ] Test Deal Studio UI
- [ ] Monitor for errors in logs
- [ ] Check application performance

---

## Quick Commands Reference

```bash
# Status
./deploy-command-center.sh status

# Logs
./deploy-command-center.sh logs backend
./deploy-command-center.sh logs frontend
./deploy-command-center.sh logs ml-service
./deploy-command-center.sh logs rust-pricing

# Restart
./deploy-command-center.sh restart backend
./deploy-command-center.sh restart frontend

# Deploy
./deploy-command-center.sh deploy backend
./deploy-command-center.sh deploy frontend

# Health
./deploy-command-center.sh health

# Resources
./deploy-command-center.sh resources

# Events
./deploy-command-center.sh events
```

---

## Next Steps for Deal Studio Rollout

### Immediate (Today)
1. ✅ Fix ES module error - DONE
2. ✅ Create deployment scripts - DONE
3. ⏳ Commit and push changes
4. ⏳ Deploy backend to K8s
5. ⏳ Deploy frontend to K8s

### Short-term (This Week)
6. Integrate real ML service API
7. Test end-to-end Deal Studio workflow
8. Add "Stage This Deal" animations
9. Monitor production performance

### Medium-term (Next Week)
10. Complete CustomerDossier component
11. Build "Paste to Chat" feature
12. Performance optimization
13. E2E testing

---

## Support & Documentation

- **Cluster Dashboard:** DigitalOcean Kubernetes Dashboard
- **GitHub Actions:** https://github.com/autolytiq/autolytiq/actions
- **Progress Report:** `/root/autolytiq/DEAL_STUDIO_PROGRESS_REPORT.md`
- **Design Plan:** `/root/autolytiq/DEAL_STUDIO_DESIGN_PLAN.md`

---

**Last Updated:** 2025-11-04
**Status:** Production cluster healthy, ready for Deal Studio deployment

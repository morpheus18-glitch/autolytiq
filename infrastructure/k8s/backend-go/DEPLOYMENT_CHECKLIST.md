# Backend-Go Deployment Checklist

## Your DigitalOcean Setup

**Database:**
- Host (VPC): `private-pg-autolytiq-do-user-17045839-0.m.db.ondigitalocean.com`
- Host (Public): `pg-autolytiq-do-user-17045839-0.m.db.ondigitalocean.com`
- Port: `25060`
- Database: `db-autolytiq`
- User: `db-autolytiq`
- SSL: Required

**Kubernetes:**
- Namespace: `autolytiq-prod`
- Node Pool: `autolytiq-pool`
- Registry: `registry.digitalocean.com/autolytiq`

---

## Pre-Deployment Checklist

### ☐ 1. Database Setup

```bash
# Connect to your database (VPC)
PGPASSWORD=AVNS_r6HQxLXjLSfiUWhkh-y psql \
  -U db-autolytiq \
  -h private-pg-autolytiq-do-user-17045839-0.m.db.ondigitalocean.com \
  -p 25060 \
  -d db-autolytiq \
  --set=sslmode=require

# Verify connection
\conninfo

# Check current tables (should be empty before first deploy)
\dt

# Exit
\q
```

**Expected:** Connection successful with SSL

---

### ☐ 2. Build Docker Image

```bash
cd /root/autolytiq/apps/backend-go

# Login to DigitalOcean Container Registry
doctl registry login

# Build for AMD64 (DO uses Intel/AMD)
docker build --platform linux/amd64 \
  -t registry.digitalocean.com/autolytiq/backend-go:v1.0.0 \
  -t registry.digitalocean.com/autolytiq/backend-go:latest \
  .

# Push to registry
docker push registry.digitalocean.com/autolytiq/backend-go:v1.0.0
docker push registry.digitalocean.com/autolytiq/backend-go:latest
```

**Expected:** Images pushed successfully to DO registry

---

### ☐ 3. Verify JWT Keys Exist

```bash
# Check if JWT keys exist
ls -la /root/autolytiq/apps/backend/keys/

# Should see:
# jwt-private.pem
# jwt-public.pem
```

**If missing:** Generate new keys or copy from existing backend

---

### ☐ 4. Configure kubectl Context

```bash
# Get your DO K8s cluster name
doctl kubernetes cluster list

# Download kubeconfig
doctl kubernetes cluster kubeconfig save <your-cluster-id>

# Verify connection
kubectl cluster-info

# Check namespace exists
kubectl get namespace autolytiq-prod || kubectl create namespace autolytiq-prod
```

**Expected:** Connected to DigitalOcean Kubernetes cluster

---

### ☐ 5. Create Kubernetes Secrets

```bash
cd /root/autolytiq/infrastructure/k8s/backend-go

# Run the secret creation script
./create-secrets.sh
```

**Expected Output:**
```
Creating database-secret (VPC connection)...
✓ database-secret created
Creating jwt-keys secret...
✓ jwt-keys created
Verifying secrets...
✓ database-secret verified
✓ jwt-keys verified
========================================
All secrets created successfully!
========================================
```

**Verify secrets:**
```bash
kubectl get secrets -n autolytiq-prod
```

Should see:
- `database-secret`
- `jwt-keys`

---

## Deployment Steps

### ☐ 6. Deploy Backend-Go

```bash
# Deploy all resources
kubectl apply -k /root/autolytiq/infrastructure/k8s/backend-go/

# Or deploy individually
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

**Expected Output:**
```
deployment.apps/backend-go created
service/backend-go created
ingress.networking.k8s.io/backend-go created
horizontalpodautoscaler.autoscaling/backend-go created
```

---

### ☐ 7. Verify Deployment

```bash
# Check pods are running
kubectl get pods -n autolytiq-prod -l app=backend-go

# Expected:
# NAME                          READY   STATUS    RESTARTS   AGE
# backend-go-5d6c9f8b7d-abc12   1/1     Running   0          30s
# backend-go-5d6c9f8b7d-def34   1/1     Running   0          30s
# backend-go-5d6c9f8b7d-ghi56   1/1     Running   0          30s
```

**If pods not running:**
```bash
# Describe pod to see errors
kubectl describe pod -n autolytiq-prod -l app=backend-go

# Check logs
kubectl logs -n autolytiq-prod -l app=backend-go --tail=100
```

---

### ☐ 8. Verify Database Migration

```bash
# Check logs for migration success
kubectl logs -n autolytiq-prod -l app=backend-go | grep -i "migrat"

# Should see:
# ✅ Database schema migrated successfully
```

**Verify tables created:**
```bash
PGPASSWORD=AVNS_r6HQxLXjLSfiUWhkh-y psql \
  -U db-autolytiq \
  -h private-pg-autolytiq-do-user-17045839-0.m.db.ondigitalocean.com \
  -p 25060 \
  -d db-autolytiq \
  --set=sslmode=require \
  -c "\dt"
```

**Expected tables:**
- `customers`
- `leads`
- `users`
- `tenants`
- `vehicles`
- `deals`
- `trade_ins`
- `notifications`
- `notes`

---

### ☐ 9. Test Endpoints

```bash
# Test from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -n autolytiq-prod -- \
  sh -c "apk add curl && curl -v http://backend-go:3001/health"

# Should return:
# {"status":"ok","service":"autolytiq-backend-go","version":"1.0.0"}
```

---

### ☐ 10. Configure Ingress/DNS

**Option A: Update Existing Load Balancer**

If you already have a load balancer routing to Node.js:

```bash
# Get ingress IP
kubectl get ingress -n autolytiq-prod backend-go

# Update DNS:
# api.autolytiq.com/v2 → Go backend
# api.autolytiq.com/v1 → Node.js backend (existing)
```

**Option B: Test with Port Forward First**

```bash
# Forward port 3001 to local machine
kubectl port-forward -n autolytiq-prod svc/backend-go 3001:3001

# Test from your machine
curl http://localhost:3001/health
curl http://localhost:3001/api/version
```

---

### ☐ 11. Test Auth Flow

```bash
# Login endpoint (should return 401 without credentials)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}'

# Expected: {"error":"Invalid credentials"}
```

---

## Post-Deployment Verification

### ☐ 12. Monitor Logs

```bash
# Stream logs from all pods
kubectl logs -n autolytiq-prod -l app=backend-go -f --tail=100

# Watch for errors
kubectl logs -n autolytiq-prod -l app=backend-go | grep -i error
```

---

### ☐ 13. Check Resource Usage

```bash
# CPU/Memory usage
kubectl top pods -n autolytiq-prod -l app=backend-go

# Expected (per pod):
# CPU: 20-50m (under load)
# Memory: 40-80Mi
```

---

### ☐ 14. Verify HPA

```bash
# Check horizontal pod autoscaler
kubectl get hpa -n autolytiq-prod backend-go

# Expected:
# NAME         REFERENCE               TARGETS   MINPODS   MAXPODS   REPLICAS
# backend-go   Deployment/backend-go   20%/70%   3         10        3
```

---

### ☐ 15. Load Test (Optional)

```bash
# Install hey (HTTP load tester)
# brew install hey  # macOS
# apt install hey   # Ubuntu

# Test with 1000 requests, 50 concurrent
hey -n 1000 -c 50 http://localhost:3001/health

# Expected:
# Total: <1s
# Requests/sec: >1000
# Average: <10ms
```

---

## Rollback Plan

If something goes wrong:

```bash
# Scale down to zero
kubectl scale deployment backend-go -n autolytiq-prod --replicas=0

# Or delete deployment
kubectl delete deployment backend-go -n autolytiq-prod

# Database will remain intact
# Secrets will remain intact
# Can redeploy anytime
```

---

## Success Criteria

✅ **All 3 pods running**
✅ **Database schema migrated (9 tables)**
✅ **Health endpoint returns 200 OK**
✅ **No errors in logs**
✅ **Auth endpoints return proper errors**
✅ **HPA configured and working**
✅ **Ingress routing configured**

---

## Next Steps After Deployment

1. **Week 1: Monitor & Stabilize**
   - Watch logs for errors
   - Check database performance
   - Monitor pod restarts

2. **Week 2: Canary Traffic**
   - Route 10% of /v1 traffic to Go backend
   - Compare performance vs Node.js
   - Gradually increase to 100%

3. **Week 3: Full Cutover**
   - Route all traffic to Go backend
   - Scale down Node.js backend
   - Monitor for 1 week

4. **Week 4: Deprecate Node.js**
   - Remove Node.js deployment
   - Celebrate! 🎉

---

## Quick Command Reference

```bash
# View all resources
kubectl get all -n autolytiq-prod -l app=backend-go

# Restart deployment (rolling restart)
kubectl rollout restart deployment backend-go -n autolytiq-prod

# View recent events
kubectl get events -n autolytiq-prod --sort-by='.lastTimestamp' | head -20

# Execute command in pod
kubectl exec -it -n autolytiq-prod <pod-name> -- /bin/sh

# Delete everything (careful!)
kubectl delete -k /root/autolytiq/infrastructure/k8s/backend-go/
```

---

**Your deployment is ready!** Just follow the checklist step by step. 🚀

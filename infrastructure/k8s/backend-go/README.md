# Backend Go - DigitalOcean Kubernetes Deployment

## DigitalOcean Infrastructure

**Clusters:**
- `autolytiq-pool` - Main application workloads (backend-go runs here)
- `ml-pool` - ML service workloads (Python FastAPI)

**Container Registry:**
- `registry.digitalocean.com/autolytiq`

**Load Balancer:**
- DigitalOcean Load Balancer (managed)
- Name: `autolytiq-lb`
- Algorithm: Round Robin
- Health checks enabled

**Namespace:**
- `autolytiq-prod` (production environment)

---

## Deployment Steps

### 1. Build & Push Docker Image to DO Registry

```bash
cd /root/autolytiq/apps/backend-go

# Authenticate with DO Registry
doctl registry login

# Build for AMD64 (DigitalOcean uses Intel/AMD)
docker build --platform linux/amd64 -t registry.digitalocean.com/autolytiq/backend-go:latest .

# Tag with version
docker tag registry.digitalocean.com/autolytiq/backend-go:latest \
  registry.digitalocean.com/autolytiq/backend-go:v1.0.0

# Push to DO Registry
docker push registry.digitalocean.com/autolytiq/backend-go:latest
docker push registry.digitalocean.com/autolytiq/backend-go:v1.0.0
```

### 2. Create Kubernetes Secrets

```bash
# Set context to autolytiq cluster
doctl kubernetes cluster kubeconfig save autolytiq-cluster

# Verify namespace exists
kubectl get namespace autolytiq-prod || kubectl create namespace autolytiq-prod

# Create JWT Keys Secret
kubectl create secret generic jwt-keys \
  --from-file=public.pem=../backend/keys/jwt-public.pem \
  --from-file=private.pem=../backend/keys/jwt-private.pem \
  -n autolytiq-prod \
  --dry-run=client -o yaml | kubectl apply -f -

# Create Database Secret (update with your actual connection string)
kubectl create secret generic database-secret \
  --from-literal=url="postgresql://user:pass@db-postgresql-nyc3-12345.b.db.ondigitalocean.com:25060/autolytiq?sslmode=require" \
  -n autolytiq-prod \
  --dry-run=client -o yaml | kubectl apply -f -
```

### 3. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -k infrastructure/k8s/backend-go/

# Or apply individually
kubectl apply -f infrastructure/k8s/backend-go/deployment.yaml
kubectl apply -f infrastructure/k8s/backend-go/service.yaml
kubectl apply -f infrastructure/k8s/backend-go/ingress.yaml
kubectl apply -f infrastructure/k8s/backend-go/hpa.yaml
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n autolytiq-prod -l app=backend-go

# Expected output:
# NAME                          READY   STATUS    RESTARTS   AGE
# backend-go-5d6c9f8b7d-abc12   1/1     Running   0          30s
# backend-go-5d6c9f8b7d-def34   1/1     Running   0          30s
# backend-go-5d6c9f8b7d-ghi56   1/1     Running   0          30s

# Check service
kubectl get svc -n autolytiq-prod backend-go

# Check ingress
kubectl get ingress -n autolytiq-prod backend-go

# Check HPA
kubectl get hpa -n autolytiq-prod backend-go

# View logs
kubectl logs -n autolytiq-prod -l app=backend-go --tail=100 -f

# Describe pod (for troubleshooting)
kubectl describe pod -n autolytiq-prod -l app=backend-go
```

### 5. Test Endpoints

```bash
# Test from within cluster
kubectl run -it --rm debug --image=alpine --restart=Never -n autolytiq-prod -- \
  sh -c "apk add curl && curl -v http://backend-go:3001/health"

# Test from external (after DNS is configured)
curl https://api.autolytiq.com/v2/health
curl https://api.autolytiq.com/v2/api/version
```

---

## Node Pool Configuration

**Backend-Go runs on `autolytiq-pool`:**
- Node selector enforced via Kustomization
- Ensures separation from ML workloads
- Resource requests: 100m CPU, 64Mi memory
- Resource limits: 500m CPU, 256Mi memory

**Scaling:**
- Min replicas: 3
- Max replicas: 10
- Scale up when CPU > 70% or Memory > 80%
- Scale down stabilization: 5 minutes

---

## Load Balancer Configuration

**DigitalOcean Load Balancer:**
- Automatically created by Kubernetes Ingress
- Name: `autolytiq-lb`
- Algorithm: Round Robin
- Health check: `GET /health` every 10s
- Timeout: 5s
- Unhealthy threshold: 3 failures

**Ingress Routing:**
```
https://api.autolytiq.com/v2/*  →  backend-go:3001  (Go backend)
https://api.autolytiq.com/v1/*  →  backend-nodejs:3000  (Old Node.js - deprecated)
```

---

## Migration Strategy

### Week 1: Parallel Deployment
```bash
# Both backends running
# Node.js: api.autolytiq.com/v1/*
# Go:      api.autolytiq.com/v2/*

# Frontend uses /v1 (Node.js)
# Monitor Go backend health
```

### Week 2: Traffic Splitting (Canary)
```bash
# Create canary ingress
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backend-go-canary
  namespace: autolytiq-prod
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"  # 10% to Go
spec:
  rules:
  - host: api.autolytiq.com
    http:
      paths:
      - path: /v1
        pathType: Prefix
        backend:
          service:
            name: backend-go
            port:
              number: 3001
EOF

# Gradually increase weight: 10% → 25% → 50% → 100%
```

### Week 3: Full Cutover
```bash
# Update main ingress to route all /v1 traffic to Go
kubectl patch ingress backend-go -n autolytiq-prod --type='json' -p='[
  {"op": "replace", "path": "/spec/rules/0/http/paths/0/path", "value": "/v1"}
]'

# Scale down Node.js backend
kubectl scale deployment backend-nodejs -n autolytiq-prod --replicas=1

# Monitor for 1 week, then remove Node.js completely
```

---

## Monitoring & Logs

### View Logs
```bash
# All pods
kubectl logs -n autolytiq-prod -l app=backend-go --tail=100 -f

# Specific pod
kubectl logs -n autolytiq-prod backend-go-5d6c9f8b7d-abc12 -f

# Previous crashed pod
kubectl logs -n autolytiq-prod backend-go-5d6c9f8b7d-abc12 --previous
```

### Metrics
```bash
# CPU/Memory usage
kubectl top pods -n autolytiq-prod -l app=backend-go

# Node usage
kubectl top nodes
```

### Events
```bash
# Recent events
kubectl get events -n autolytiq-prod --sort-by='.lastTimestamp'

# Pod events
kubectl describe pod -n autolytiq-prod -l app=backend-go
```

---

## Rollback

### Immediate Rollback
```bash
# Rollback deployment to previous version
kubectl rollout undo deployment backend-go -n autolytiq-prod

# Or scale to zero
kubectl scale deployment backend-go -n autolytiq-prod --replicas=0

# Route traffic back to Node.js via ingress
kubectl patch ingress backend-go -n autolytiq-prod --type='json' -p='[
  {"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/name", "value": "backend-nodejs"},
  {"op": "replace", "path": "/spec/rules/0/http/paths/0/backend/service/port/number", "value": 3000}
]'
```

### View Rollout History
```bash
kubectl rollout history deployment backend-go -n autolytiq-prod

# Rollback to specific revision
kubectl rollout undo deployment backend-go -n autolytiq-prod --to-revision=2
```

---

## Troubleshooting

### Pods not starting
```bash
# Check pod status
kubectl get pods -n autolytiq-prod -l app=backend-go

# Describe pod
kubectl describe pod -n autolytiq-prod <pod-name>

# Common issues:
# - ImagePullBackOff: Check registry authentication
# - CrashLoopBackOff: Check application logs
# - Pending: Check resource availability on nodes
```

### Database connection issues
```bash
# Verify database secret exists
kubectl get secret database-secret -n autolytiq-prod -o yaml

# Test connection from pod
kubectl exec -it -n autolytiq-prod <pod-name> -- /bin/sh
# Then inside pod: (won't work with read-only filesystem)
# Use a debug container instead:
kubectl debug -it <pod-name> -n autolytiq-prod --image=postgres:15-alpine -- \
  psql "postgresql://user:pass@host:port/db?sslmode=require"
```

### JWT key issues
```bash
# Verify JWT secret exists
kubectl get secret jwt-keys -n autolytiq-prod -o yaml

# Check if keys are mounted
kubectl exec -it -n autolytiq-prod <pod-name> -- ls -la /etc/jwt/
```

---

## Cost Optimization

**Current Resources per Pod:**
- Request: 100m CPU, 64Mi RAM
- Limit: 500m CPU, 256Mi RAM

**3 Replicas Total:**
- CPU: 300m request, 1.5 cores limit
- Memory: 192Mi request, 768Mi limit

**DigitalOcean Pricing (estimated):**
- 3 pods on autolytiq-pool: ~$15/month
- Load balancer: $12/month
- Container registry: Included
- **Total: ~$27/month for Go backend**

**vs Node.js Backend:**
- 10 pods required for same load
- ~$50/month + $12 LB = $62/month
- **Savings: $35/month (56% reduction)**

---

## Next Steps

1. ✅ K8s manifests created for DO
2. 🔄 Build & push Docker image to DO registry
3. 🔄 Create secrets in autolytiq-prod namespace
4. 🔄 Deploy to autolytiq-pool
5. 🔄 Configure DNS for api.autolytiq.com/v2
6. 🔄 Test endpoints from external
7. 🔄 Implement canary deployment
8. 🔄 Monitor for 1 week
9. 🔄 Full cutover to /v1
10. 🔄 Deprecate Node.js backend

**Timeline**: Ready to deploy to DO in Week 3 (after API completion)

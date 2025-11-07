# Kubernetes Readiness Audit

**Generated**: 2025-11-06  
**Environment**: DigitalOcean Kubernetes (DOKS)  
**Objective**: Document deployment commands and readiness checks

---

## Cluster Info

**Cluster Name**: `autolytiq-cluster` (assumed)  
**Namespaces**:
- `autolytiq-prod` (production)
- `autolytiq-dev` (development) 

**Registry**: `registry.digitalocean.com/autolytiq/*`

---

## K8s Manifest Locations

```
infrastructure/k8s/
├── dev/               # Development manifests
└── production/        # Production manifests
    ├── deployments/   # (check subdirectories)
    ├── services/
    ├── ingress/
    └── secrets/
```

---

## Deployment Commands (Post-Image Push)

### Frontend Deployment

```bash
# Authenticate
doctl auth init -t $DIGITALOCEAN_ACCESS_TOKEN
doctl kubernetes cluster kubeconfig save autolytiq-cluster

# Deploy with new image
kubectl set image deployment/frontend \
  frontend=registry.digitalocean.com/autolytiq/frontend:${GIT_SHA} \
  -n autolytiq-prod

# Verify rollout
kubectl rollout status deployment/frontend -n autolytiq-prod --timeout=5m

# Check pods
kubectl get pods -n autolytiq-prod -l app=frontend

# View logs
kubectl logs -n autolytiq-prod -l app=frontend --tail=100 -f
```

### Backend Deployment

```bash
kubectl set image deployment/backend \
  backend=registry.digitalocean.com/autolytiq/backend:${GIT_SHA} \
  -n autolytiq-prod

kubectl rollout status deployment/backend -n autolytiq-prod
```

### Rust Services

```bash
# Price Engine
kubectl set image deployment/price-engine \
  price-engine=registry.digitalocean.com/autolytiq/price-engine:${GIT_SHA} \
  -n autolytiq-prod

# Comm Service
kubectl set image deployment/comm-service \
  comm-service=registry.digitalocean.com/autolytiq/comm-service:${GIT_SHA} \
  -n autolytiq-prod

# Repeat for cache-service, rate-limiter
```

---

## Pre-Deployment Checks

### 1. Image Verification
```bash
# List images in registry
doctl registry repository list-tags autolytiq/frontend

# Verify image exists
docker pull registry.digitalocean.com/autolytiq/frontend:${GIT_SHA}
```

### 2. Resource Quotas
```bash
kubectl describe quota -n autolytiq-prod
kubectl top nodes
kubectl top pods -n autolytiq-prod
```

### 3. Health Check Endpoints
```bash
# Frontend (nginx)
curl https://autolytiq.com/health

# Backend API
curl https://api.autolytiq.com/health

# Rust services (internal)
kubectl port-forward svc/price-engine 50051:50051 -n autolytiq-prod
grpcurl -plaintext localhost:50051 health.Health/Check
```

---

## Database Migrations

### Strategy: Kubernetes Job

**File**: `infrastructure/k8s/production/jobs/migrate-db.yaml`

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: prisma-migrate-${GIT_SHA}
  namespace: autolytiq-prod
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: migrate
        image: registry.digitalocean.com/autolytiq/backend:${GIT_SHA}
        command: ["pnpm", "prisma", "migrate", "deploy"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: connection-string
```

**Run Migration**:
```bash
# Apply job
kubectl apply -f infrastructure/k8s/production/jobs/migrate-db.yaml

# Watch job
kubectl get jobs -n autolytiq-prod -w

# Check logs
kubectl logs job/prisma-migrate-${GIT_SHA} -n autolytiq-prod
```

---

## Environment Configuration

### ConfigMaps

```bash
# View current config
kubectl get configmap -n autolytiq-prod
kubectl describe configmap app-config -n autolytiq-prod

# Update config
kubectl create configmap app-config \
  --from-literal=API_BASE_URL=https://api.autolytiq.com \
  --from-literal=ENVIRONMENT=production \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Secrets

```bash
# View secrets (not values)
kubectl get secrets -n autolytiq-prod

# Create database secret
kubectl create secret generic database-secret \
  --from-literal=connection-string="postgresql://..." \
  -n autolytiq-prod

# Create DO registry pull secret
kubectl create secret docker-registry docr-secret \
  --docker-server=registry.digitalocean.com \
  --docker-username=$DO_TOKEN \
  --docker-password=$DO_TOKEN \
  -n autolytiq-prod
```

---

## Rollback Procedures

### Rollback Deployment
```bash
# Undo last rollout
kubectl rollout undo deployment/frontend -n autolytiq-prod

# Rollback to specific revision
kubectl rollout history deployment/frontend -n autolytiq-prod
kubectl rollout undo deployment/frontend --to-revision=5 -n autolytiq-prod
```

### Rollback Database Migration
```bash
# Prisma doesn't support automatic rollback
# Manual: Run down migration SQL scripts
# OR: Restore from backup

# List migrations
kubectl exec -it deployment/backend -n autolytiq-prod -- \
  pnpm prisma migrate status
```

---

## Monitoring & Logs

### Pod Logs
```bash
# Tail logs
kubectl logs -f deployment/frontend -n autolytiq-prod

# Logs from all pods with label
kubectl logs -l app=backend -n autolytiq-prod --tail=100

# Previous container logs (after crash)
kubectl logs deployment/backend -n autolytiq-prod --previous
```

### Events
```bash
# Recent events
kubectl get events -n autolytiq-prod --sort-by='.lastTimestamp'

# Watch events
kubectl get events -n autolytiq-prod --watch
```

### Resource Usage
```bash
kubectl top pods -n autolytiq-prod
kubectl top nodes
```

---

## Scaling

### Horizontal Scaling
```bash
# Scale frontend pods
kubectl scale deployment/frontend --replicas=5 -n autolytiq-prod

# Auto-scaling (HPA)
kubectl autoscale deployment/frontend \
  --min=2 --max=10 --cpu-percent=80 \
  -n autolytiq-prod
```

---

## Ingress & DNS

### Check Ingress
```bash
kubectl get ingress -n autolytiq-prod
kubectl describe ingress autolytiq-ingress -n autolytiq-prod
```

### TLS Certificates
```bash
# Cert-manager certificates
kubectl get certificate -n autolytiq-prod
kubectl describe certificate autolytiq-tls -n autolytiq-prod
```

---

## Recommended Deployment Flow

```bash
#!/bin/bash
# deploy.sh

set -e

GIT_SHA=${1:-$(git rev-parse --short HEAD)}
NAMESPACE="autolytiq-prod"
SERVICE=$2  # frontend, backend, price-engine, etc.

echo "Deploying $SERVICE:$GIT_SHA to $NAMESPACE..."

# 1. Verify image exists
doctl registry repository list-tags autolytiq/$SERVICE | grep $GIT_SHA || {
  echo "❌ Image not found in registry"
  exit 1
}

# 2. Run migrations (backend only)
if [ "$SERVICE" == "backend" ]; then
  kubectl apply -f infrastructure/k8s/production/jobs/migrate-db.yaml
  kubectl wait --for=condition=complete job/prisma-migrate-$GIT_SHA -n $NAMESPACE --timeout=5m
fi

# 3. Update deployment
kubectl set image deployment/$SERVICE \
  $SERVICE=registry.digitalocean.com/autolytiq/$SERVICE:$GIT_SHA \
  -n $NAMESPACE

# 4. Wait for rollout
kubectl rollout status deployment/$SERVICE -n $NAMESPACE --timeout=5m

# 5. Verify health
kubectl get pods -n $NAMESPACE -l app=$SERVICE

echo "✅ Deployment complete!"
```

---

## Health Checks (Probes)

### Liveness Probe (Example)
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
```

### Readiness Probe
```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Next Actions

1. ✅ Verify manifests in `infrastructure/k8s/production/`
2. ⚠️  Ensure all deployments have health probes
3. ⚠️  Create migration job template
4. ⚠️  Set up HPA for frontend/backend
5. ⚠️  Configure cert-manager for TLS
6. ⚠️  Add monitoring (Prometheus/Grafana)

**See Also**:
- CI_PIPELINE_PLAN.md - CI integration
- DB_SCHEMA_AUDIT.md - Migration details
- ENV_MATRIX.md - Environment variables


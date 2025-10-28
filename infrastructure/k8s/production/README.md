# AutolytiQ Production Kubernetes Deployment

Complete production deployment guide for AutolytiQ on DigitalOcean Kubernetes with Rust pricing microservice.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Services](#services)
- [Deployment Process](#deployment-process)
- [Monitoring & Operations](#monitoring--operations)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Internet Traffic                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │  DigitalOcean LB    │
                 └──────────┬──────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼─────┐      ┌─────▼──────┐     ┌─────▼──────┐
   │ Frontend │      │  Backend   │     │  Backend   │
   │  (×2)    │      │    (×3)    │     │    (×3)    │
   │  Nginx   │      │   Node.js  │     │   Node.js  │
   └──────────┘      └─────┬──────┘     └─────┬──────┘
                           │                   │
                           │ gRPC              │
                      ┌────▼────────────┐      │
                      │ Pricing Rust    │      │
                      │     (×2)        │      │
                      │   50051/grpc    │      │
                      └─────────────────┘      │
                                              │
                      ┌────────────────────────▼──┐
                      │  PostgreSQL (Managed)     │
                      │  + Redis (Optional)       │
                      └───────────────────────────┘
```

## ✅ Prerequisites

### Required Tools

1. **kubectl** (v1.28+)
```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

2. **Helm** (v3.13+)
```bash
# macOS
brew install helm

# Linux
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

3. **doctl** (DigitalOcean CLI)
```bash
# macOS
brew install doctl

# Linux
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.98.0/doctl-1.98.0-linux-amd64.tar.gz
tar xf doctl-1.98.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

4. **Docker** (for building images)
```bash
# Visit: https://docs.docker.com/get-docker/
```

### DigitalOcean Resources

1. **Kubernetes Cluster**
   - Minimum: 3 nodes (4GB RAM, 2 vCPUs each)
   - Recommended: 5 nodes (8GB RAM, 4 vCPUs each)
   - Version: 1.28+

2. **Container Registry**
   - Name: `autolytiq`
   - Region: Same as K8s cluster

3. **Managed Database**
   - PostgreSQL 16
   - Plan: Basic or higher
   - 2GB RAM minimum

4. **Secrets Required**
   ```bash
   # In DigitalOcean Dashboard > API > Tokens
   - DIGITALOCEAN_ACCESS_TOKEN
   - DO_CLUSTER_NAME
   ```

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Clone repository
git clone https://github.com/morpheus18-glitch/autolytiq.git
cd autolytiq

# Authenticate with DigitalOcean
doctl auth init

# Connect to K8s cluster
doctl kubernetes cluster kubeconfig save <your-cluster-name>

# Verify connection
kubectl cluster-info
```

### 2. Create Kubernetes Secrets

```bash
# Create production namespace
kubectl create namespace production

# Create backend secrets
kubectl create secret generic backend-secrets \
  --from-literal=database-url='postgresql://user:pass@host:5432/autolytiq' \
  --from-literal=jwt-secret='your-super-secret-jwt-key-change-this' \
  --from-literal=redis-url='redis://redis:6379' \
  -n production

# Verify secrets
kubectl get secrets -n production
```

### 3. Build and Push Images

```bash
# Login to DigitalOcean Container Registry
doctl registry login

# Build all images
./scripts/build-all.sh latest

# Push to registry
docker push registry.digitalocean.com/autolytiq/frontend:latest
docker push registry.digitalocean.com/autolytiq/backend:latest
docker push registry.digitalocean.com/autolytiq/pricing-rust:latest
```

### 4. Deploy All Services

```bash
# Deploy everything (migrations + all services)
./scripts/deploy-production.sh latest production

# Or use CI/CD (recommended)
# Push to main branch and GitHub Actions will handle deployment
```

## 📦 Services

### Frontend (Nginx + React)
- **Replicas:** 2 (scales 2-5)
- **Port:** 80 → 8080
- **Resources:** 50m CPU, 64Mi RAM
- **Health:** `/health`

### Backend (Node.js + Express)
- **Replicas:** 3 (scales 3-10)
- **Port:** 5000
- **Resources:** 200m-1000m CPU, 512Mi-1Gi RAM
- **Health:** `/health`
- **Features:**
  - gRPC client to Rust pricing service
  - Prisma ORM with PostgreSQL
  - JWT authentication
  - Socket.io for real-time

### Pricing Rust (High-performance gRPC)
- **Replicas:** 2 (scales 2-8)
- **Port:** 50051 (gRPC)
- **Resources:** 100m-500m CPU, 128Mi-256Mi RAM
- **Features:**
  - Market data calculations
  - Gross profit calculations
  - Payment amortization
  - 25-35x faster than Node.js

## 🔄 Deployment Process

### Manual Deployment

```bash
# Step 1: Build images
./scripts/build-all.sh v1.0.0

# Step 2: Push to registry
docker images | grep 'registry.digitalocean.com/autolytiq.*v1.0.0' | \
  awk '{print $1":"$2}' | xargs -L1 docker push

# Step 3: Deploy
./scripts/deploy-production.sh v1.0.0 production

# Step 4: Run smoke tests
./scripts/smoke.sh production
```

### CI/CD Deployment (Recommended)

1. **Push to main branch:**
```bash
git checkout main
git pull origin main
git merge your-feature-branch
git push origin main
```

2. **GitHub Actions will:**
   - Build all Docker images
   - Push to DigitalOcean Container Registry
   - Run security scans (Trivy)
   - Deploy to production
   - Run smoke tests
   - Rollback on failure

### Individual Service Deployment

```bash
# Deploy only pricing service
helm upgrade --install pricing-rust \
  ./helm/pricing-rust \
  --namespace production \
  --set image.tag=v1.0.0

# Deploy only backend
helm upgrade --install backend \
  ./helm/backend \
  --namespace production \
  --set image.tag=v1.0.0

# Deploy only frontend
helm upgrade --install frontend \
  ./helm/frontend \
  --namespace production \
  --set image.tag=v1.0.0
```

## 📊 Monitoring & Operations

### Check Deployment Status

```bash
# All resources
kubectl get all -n production

# Pod status with details
kubectl get pods -n production -o wide

# Service endpoints
kubectl get services -n production

# Helm releases
helm list -n production

# Resource usage
kubectl top pods -n production
kubectl top nodes
```

### View Logs

```bash
# Backend logs (live tail)
kubectl logs -n production -l app.kubernetes.io/name=backend -f

# Frontend logs
kubectl logs -n production -l app.kubernetes.io/name=frontend -f

# Pricing Rust logs
kubectl logs -n production -l app.kubernetes.io/name=pricing-rust -f

# Specific pod
kubectl logs -n production <pod-name> -f

# Previous container logs (if crashed)
kubectl logs -n production <pod-name> --previous
```

### Port Forwarding (for testing)

```bash
# Access backend locally
kubectl port-forward -n production svc/backend 5000:5000

# Access frontend locally
kubectl port-forward -n production svc/frontend 8080:80

# Access pricing service (gRPC)
kubectl port-forward -n production svc/pricing-rust 50051:50051
```

### Execute Commands in Pods

```bash
# Shell into backend pod
kubectl exec -it -n production <backend-pod-name> -- /bin/sh

# Run Prisma migration manually
kubectl exec -it -n production <backend-pod-name> -- \
  npx prisma migrate deploy

# Check Prisma Studio (locally)
kubectl port-forward -n production svc/backend 5555:5555
kubectl exec -it -n production <backend-pod-name> -- \
  npx prisma studio
```

## 🔧 Troubleshooting

### Pods Not Starting

```bash
# Describe pod to see events
kubectl describe pod -n production <pod-name>

# Check pod logs
kubectl logs -n production <pod-name>

# Check resource limits
kubectl top pods -n production

# Check node resources
kubectl top nodes
```

### Image Pull Errors

```bash
# Verify registry access
doctl registry login

# Check image exists
doctl registry repository list-tags autolytiq/backend

# Recreate image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.digitalocean.com \
  --docker-username=your-username \
  --docker-password=your-token \
  -n production
```

### Database Connection Issues

```bash
# Test database connectivity from pod
kubectl exec -it -n production <backend-pod-name> -- \
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.\$connect()
      .then(() => console.log('✅ Connected'))
      .catch(e => console.error('❌ Failed:', e));
  "

# Check DATABASE_URL secret
kubectl get secret backend-secrets -n production -o yaml

# Decode secret
kubectl get secret backend-secrets -n production \
  -o jsonpath='{.data.database-url}' | base64 -d
```

### gRPC Service Issues

```bash
# Check if pricing service is running
kubectl get pods -n production -l app.kubernetes.io/name=pricing-rust

# Test gRPC port
kubectl port-forward -n production svc/pricing-rust 50051:50051 &
nc -zv localhost 50051

# Check gRPC health from backend
kubectl exec -it -n production <backend-pod-name> -- \
  curl -X POST http://localhost:5000/api/pricing/health
```

### Service Not Responding

```bash
# Check service endpoints
kubectl get endpoints -n production

# Check service selector matches pods
kubectl get svc backend -n production -o yaml
kubectl get pods -n production --show-labels

# Test service DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n production -- \
  nslookup backend
```

## ⏪ Rollback Procedures

### Quick Rollback (Previous Version)

```bash
# Rollback backend
./scripts/rollback.sh backend 0 production

# Rollback frontend
./scripts/rollback.sh frontend 0 production

# Rollback pricing-rust
./scripts/rollback.sh pricing-rust 0 production
```

### Rollback to Specific Revision

```bash
# View revision history
helm history backend -n production

# Rollback to specific revision
./scripts/rollback.sh backend 3 production
```

### Emergency Rollback (All Services)

```bash
# Rollback everything
for service in backend frontend pricing-rust; do
  ./scripts/rollback.sh $service 0 production
done

# Verify
kubectl get pods -n production
./scripts/smoke.sh production
```

### Manual Helm Rollback

```bash
# Rollback with helm directly
helm rollback backend 0 --namespace production --wait

# Force rollback (cleanup failed resources)
helm rollback backend 0 --namespace production --wait --force --cleanup-on-fail
```

## 🔐 Security Best Practices

1. **Use TLS for gRPC** in production (currently using insecure for simplicity)
2. **Rotate secrets regularly:**
   ```bash
   kubectl create secret generic backend-secrets \
     --from-literal=jwt-secret='new-secret' \
     --dry-run=client -o yaml | kubectl apply -f - -n production
   kubectl rollout restart deployment/backend -n production
   ```
3. **Enable Pod Security Standards:**
   ```bash
   kubectl label namespace production \
     pod-security.kubernetes.io/enforce=restricted
   ```
4. **Use NetworkPolicies** to restrict pod-to-pod communication
5. **Enable audit logging** on the cluster

## 📈 Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n production

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n production

# Scale pricing-rust
kubectl scale deployment pricing-rust --replicas=4 -n production
```

### Auto-scaling (HPA)

HPA is enabled by default in Helm charts:
- **Backend:** 3-10 replicas (70% CPU target)
- **Frontend:** 2-5 replicas (75% CPU target)
- **Pricing Rust:** 2-8 replicas (70% CPU target)

```bash
# Check HPA status
kubectl get hpa -n production

# Modify HPA
helm upgrade backend ./helm/backend \
  --namespace production \
  --set autoscaling.maxReplicas=15 \
  --set autoscaling.targetCPUUtilizationPercentage=60
```

## 🎯 Performance Tuning

### Backend Node.js

```yaml
# In values.yaml
resources:
  requests:
    cpu: 300m
    memory: 768Mi
  limits:
    cpu: 2000m
    memory: 2Gi

env:
  - name: NODE_OPTIONS
    value: "--max-old-space-size=1536"
```

### Pricing Rust Service

```yaml
# Already optimized for performance
# Compiled with LTO and optimization level 3
# Typical response time: <5ms
```

### Database Connection Pooling

```typescript
// In Prisma schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20
}
```

## 📝 Maintenance Tasks

### Update Images

```bash
# Build new version
./scripts/build-all.sh v1.1.0

# Push to registry
# ... push commands ...

# Deploy
./scripts/deploy-production.sh v1.1.0 production
```

### Database Migrations

```bash
# Migrations run automatically via Kubernetes Job during deployment
# Or run manually:
kubectl apply -f manifests/prisma-migrate-job.yaml -n production
kubectl logs -f -n production -l app=prisma-migrate
```

### Cleanup Old Resources

```bash
# Delete failed jobs
kubectl delete jobs -n production --field-selector status.successful=0

# Delete completed migration jobs (older than 1 hour)
kubectl delete jobs -n production -l app=prisma-migrate \
  --field-selector status.completionTime<$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)
```

## 🆘 Support & Contact

- **Documentation:** `/docs`
- **Issues:** GitHub Issues
- **Slack:** #autolytiq-ops

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [DigitalOcean Kubernetes Guide](https://docs.digitalocean.com/products/kubernetes/)
- [Rust gRPC Service Architecture](../../services/rust/README.md)

---

**Last Updated:** 2025-01-28
**Version:** 1.0.0

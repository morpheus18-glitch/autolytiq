# Kubernetes Cluster Restoration Guide

## Snapshot Information
- **Date**: 2025-11-03
- **Cluster**: DigitalOcean Kubernetes (NYC3)
- **Current nodes**: 8 total (2x ML 4GB, 6x Standard 2GB)
- **Load Balancer IP**: 45.55.98.200

## Recommended New Node Configuration

### Option 1: Balanced (Recommended)
```
- 4x s-4vcpu-8gb (8GB RAM) - Standard pool
- 2x s-4vcpu-8gb (8GB RAM) - ML pool
Total: 48GB RAM (3x current capacity)
Cost: ~$240/month
```

### Option 2: Cost-Optimized
```
- 5x s-2vcpu-4gb (4GB RAM) - Standard pool
- 2x s-4vcpu-8gb (8GB RAM) - ML pool
Total: 36GB RAM (2.4x current capacity)
Cost: ~$180/month
```

## Restoration Steps

### 1. Create New DigitalOcean Kubernetes Cluster
```bash
doctl kubernetes cluster create autolytiq-prod-v2 \
  --region nyc3 \
  --version 1.33.1-do.5 \
  --node-pool "name=standard-pool;size=s-4vcpu-8gb;count=4" \
  --node-pool "name=ml-pool;size=s-4vcpu-8gb;count=2;taint=workload-type=ml-heavy:NoSchedule;label=workload-type=ml-heavy"
```

### 2. Configure kubectl
```bash
doctl kubernetes cluster kubeconfig save autolytiq-prod-v2
```

### 3. Install Prerequisites

#### Install cert-manager
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.19.1/cert-manager.yaml
kubectl wait --namespace cert-manager --for=condition=ready pod --selector=app.kubernetes.io/instance=cert-manager --timeout=300s
```

#### Install ingress-nginx
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.1/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=300s
```

### 4. Create Namespaces
```bash
kubectl create namespace autolytiq-prod
kubectl create namespace monitoring
```

### 5. Create Docker Registry Secret
```bash
kubectl create secret docker-registry do-regcred \
  --docker-server=registry.digitalocean.com \
  --docker-username=YOUR_DO_TOKEN \
  --docker-password=YOUR_DO_TOKEN \
  -n autolytiq-prod
```

### 6. Apply Application Manifests
```bash
cd /root/autolytiq/k8s-snapshot-XXXXXXXX/original-manifests

# Apply in order
kubectl apply -f namespace.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ml-service-deployment.yaml
kubectl apply -f rust-pricing-deployment.yaml
kubectl apply -f prometheus-stack.yaml
kubectl apply -f grafana-stack.yaml
kubectl apply -f ingress.yaml
```

### 7. Get New Load Balancer IP
```bash
kubectl get svc ingress-nginx-controller -n ingress-nginx
```

### 8. Update DNS Records
Update A records for all domains to point to new Load Balancer IP:
- autolytiq.com
- www.autolytiq.com
- app.autolytiq.com
- api.autolytiq.com
- ml.autolytiq.com
- grafana.autolytiq.com

### 9. Verify Deployment
```bash
kubectl get pods --all-namespaces
kubectl get svc --all-namespaces
kubectl get ingress --all-namespaces
```

### 10. Test Application
```bash
curl https://api.autolytiq.com/health
curl https://autolytiq.com
```

### 11. Run Database Migrations
```bash
# From your VM or a migration pod
cd /root/autolytiq
export DATABASE_URL="your-database-url"
pnpm prisma migrate deploy
```

### 12. Destroy Old Cluster
```bash
# ONLY after verifying new cluster works!
doctl kubernetes cluster delete autolytiq-prod
```

## Important Notes

- **Database**: Using external DO Managed PostgreSQL - no migration needed
- **Redis**: New PVC will be created - data will be empty
- **Prometheus**: New PVC will be created - metrics history will be lost
- **Secrets**: Review and update all secrets with current values
- **SSL Certificates**: Let's Encrypt will auto-provision new certificates

## Rollback Plan

If issues occur:
1. Keep old cluster running
2. Update DNS back to old Load Balancer IP (45.55.98.200)
3. Debug new cluster
4. Retry migration

## Files in Snapshot

- `autolytiq-prod-all.yaml` - All production resources
- `monitoring-all.yaml` - Monitoring stack
- `original-manifests/` - Clean manifest files
- `secrets/` - Encoded secrets (review before applying)
- `cluster-state.txt` - Current cluster state for reference

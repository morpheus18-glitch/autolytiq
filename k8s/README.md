# Kubernetes Manifests - Production Deployment

## Overview
These manifests deploy the Autolytiq platform to the `autolytiq-prod` namespace on DigitalOcean Kubernetes.

## Current Deployment Status
- **Namespace**: `autolytiq-prod`
- **Backend**: 2 replicas running
- **Frontend**: 2 replicas running
- **Domain**: autolytiq.com, www.autolytiq.com
- **TLS**: Managed by cert-manager with Let's Encrypt

## Files

### Active Manifests
- `backend-deployment.yaml` - Backend Express.js API deployment and service
- `frontend-deployment.yaml` - Frontend React SPA deployment and service
- `ingress.yaml` - NGINX Ingress with TLS termination
- `secrets.yaml` - **DO NOT USE** - Template only, use existing `app-env` secret

## Deployment Instructions

### Prerequisites
1. DigitalOcean Kubernetes cluster with `autolytiq-prod` namespace
2. Docker images pushed to `registry.digitalocean.com/autolytiq/`
3. Secrets already configured in `app-env` secret

### Deploy/Update
```bash
# Apply all manifests
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Verify deployment
kubectl get all -n autolytiq-prod -l app=autolytiq
kubectl get ingress -n autolytiq-prod

# Check logs
kubectl logs -n autolytiq-prod -l component=backend --tail=50
kubectl logs -n autolytiq-prod -l component=frontend --tail=50
```

### Secrets Management
**IMPORTANT**: The `secrets.yaml` file is a template only. The actual secrets are managed in the `app-env` secret in the `autolytiq-prod` namespace.

The backend deployment references:
- `app-env` secret with `JWT_SECRET` key

Do NOT create the `autolytiq-secrets` secret - it's not used.

## Resource Allocation

### Backend
- Requests: 96Mi memory, 75m CPU
- Limits: 192Mi memory, 150m CPU
- Replicas: 2

### Frontend
- Requests: 64Mi memory, 50m CPU
- Limits: 128Mi memory, 100m CPU
- Replicas: 2

These values are optimized for s-2vcpu-2gb nodes with ~1.4GB allocatable memory.

## Node Pool Configuration
- Pool: `pool-autolytiq`
- Instance Type: s-2vcpu-2gb (2 vCPU, 2GB RAM)
- Nodes: 6
- Allocatable Memory: ~1.4GB per node

## Ingress Configuration
The Ingress routes traffic as follows:
- `/api/*` → Backend (port 3000)
- `/health` → Backend (port 3000)
- `/*` → Frontend (port 80)

TLS certificates are automatically managed by cert-manager using Let's Encrypt.

## Health Checks
- **Backend**: `https://autolytiq.com/health` (should return 200 OK)
- **Frontend**: `https://autolytiq.com/` (should return 200 OK)

## Troubleshooting

### Pods not scheduling
Check node capacity:
```bash
kubectl describe nodes -l doks.digitalocean.com/node-pool=pool-autolytiq | grep -A 15 "Allocated resources:"
```

### Backend failing to start
Check if secrets exist:
```bash
kubectl get secret app-env -n autolytiq-prod
```

### Ingress not working
Check ingress status:
```bash
kubectl describe ingress autolytiq-ingress -n autolytiq-prod
```

## CI/CD Integration
These manifests can be applied via GitHub Actions on push to main:
```yaml
- name: Deploy to Kubernetes
  run: |
    kubectl apply -f k8s/backend-deployment.yaml
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/ingress.yaml
```

## Migration Notes
- Previous deployment in `default` namespace has been removed (2025-11-08)
- All resources now consolidated in `autolytiq-prod` namespace
- Resource requests reduced to fit on s-2vcpu-2gb nodes

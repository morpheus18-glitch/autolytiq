# AutolytiQ Kubernetes Production Deployment

## Prerequisites

1. DigitalOcean Account with:
   - Kubernetes cluster created
   - Container Registry enabled
   - Managed PostgreSQL database

2. Local tools:
   ```bash
   brew install doctl kubectl helm
   ```

Authenticate:

```bash
doctl auth init
doctl kubernetes cluster kubeconfig save <cluster-name>
```

## Quick Start

1. Build and Push Images

```bash
# Login to registry
doctl registry login

# Build all services
docker build -t registry.digitalocean.com/autolytiq/frontend:latest ./apps/frontend
docker build -t registry.digitalocean.com/autolytiq/backend:latest ./apps/backend
docker build -t registry.digitalocean.com/autolytiq/worker:latest ./apps/worker
docker build -t registry.digitalocean.com/autolytiq/pricing-rust:latest ./apps/pricing-rust

# Push all
docker push registry.digitalocean.com/autolytiq/frontend:latest
docker push registry.digitalocean.com/autolytiq/backend:latest
docker push registry.digitalocean.com/autolytiq/worker:latest
docker push registry.digitalocean.com/autolytiq/pricing-rust:latest
```

2. Create Secrets

```bash
kubectl create namespace production

kubectl create secret generic backend-secrets \
  --from-literal=database-url='postgresql://user:pass@host:5432/db' \
  --from-literal=jwt-secret='your-jwt-secret' \
  -n production
```

3. Deploy Services

```bash
# Deploy in order
helm install pricing-rust ./infrastructure/k8s/production/helm/pricing-rust -n production
helm install backend ./infrastructure/k8s/production/helm/backend -n production
helm install worker ./infrastructure/k8s/production/helm/worker -n production
helm install frontend ./infrastructure/k8s/production/helm/frontend -n production
```

4. Run Smoke Tests

```bash
./scripts/smoke.sh
```

## Architecture

```
Internet
    ↓
[Load Balancer]
    ↓
[Ingress/Gateway]
    ├─→ [Frontend Pods × 2]
    └─→ [Backend Pods × 3]
            ├─→ [Pricing Rust Pods × 2] (gRPC)
            ├─→ [PostgreSQL]
            └─→ [Kafka/Redpanda]
[Worker Pods × 2]
    └─→ [Kafka/Redpanda]
```

## Troubleshooting

Check pod status

```bash
kubectl get pods -n production
kubectl logs <pod-name> -n production
```

Check service health

```bash
kubectl get svc -n production
kubectl port-forward svc/backend 5000:5000 -n production
curl http://localhost:5000/health
```

Rollback deployment

```bash
./scripts/rollback.sh backend 1
```

View Helm releases

```bash
helm list -n production
helm history backend -n production
```

## Monitoring

View logs:

```bash
kubectl logs -l app.kubernetes.io/name=autolytiq-backend -n production --tail=100 -f
```

Scale deployment:

```bash
kubectl scale deployment backend --replicas=5 -n production
```

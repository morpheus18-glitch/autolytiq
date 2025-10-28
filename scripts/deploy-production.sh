#!/bin/bash
#
# Deploy All Services to Production
# Usage: ./deploy-production.sh [image-tag] [namespace]
#

set -e

IMAGE_TAG=${1:-latest}
NAMESPACE=${2:-production}

echo "========================================="
echo "🚀 Deploying to Production"
echo "========================================="
echo "Image Tag: $IMAGE_TAG"
echo "Namespace: $NAMESPACE"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl is required"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "❌ helm is required"; exit 1; }
echo "✅ Prerequisites met"
echo ""

# Check cluster connection
echo "Checking cluster connection..."
if ! kubectl cluster-info &>/dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "Please configure kubectl first:"
    echo "  doctl kubernetes cluster kubeconfig save <cluster-name>"
    exit 1
fi
echo "✅ Connected to cluster"
echo ""

# Create namespace if it doesn't exist
echo "Ensuring namespace exists..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
echo "✅ Namespace ready"
echo ""

# Confirm deployment
read -p "Deploy to $NAMESPACE with tag $IMAGE_TAG? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "========================================="
echo "Step 1: Database Migrations"
echo "========================================="
echo "Running Prisma migrations..."

kubectl apply -f infrastructure/k8s/production/manifests/prisma-migrate-job.yaml -n $NAMESPACE

# Wait for migration
echo "Waiting for migration to complete..."
kubectl wait --for=condition=complete --timeout=300s job -l app=prisma-migrate -n $NAMESPACE || {
    echo "❌ Migration failed"
    kubectl logs -l app=prisma-migrate -n $NAMESPACE --tail=50
    exit 1
}

echo "✅ Database migrations completed"

echo ""
echo "========================================="
echo "Step 2: Deploy Pricing Rust Service"
echo "========================================="

helm upgrade --install pricing-rust \
    ./infrastructure/k8s/production/helm/pricing-rust \
    --namespace $NAMESPACE \
    --set image.tag=$IMAGE_TAG \
    --wait \
    --timeout 5m

echo "✅ Pricing Rust service deployed"

echo ""
echo "========================================="
echo "Step 3: Deploy Backend Service"
echo "========================================="

helm upgrade --install backend \
    ./infrastructure/k8s/production/helm/backend \
    --namespace $NAMESPACE \
    --set image.tag=$IMAGE_TAG \
    --wait \
    --timeout 5m

echo "✅ Backend service deployed"

echo ""
echo "========================================="
echo "Step 4: Deploy Frontend Service"
echo "========================================="

helm upgrade --install frontend \
    ./infrastructure/k8s/production/helm/frontend \
    --namespace $NAMESPACE \
    --set image.tag=$IMAGE_TAG \
    --wait \
    --timeout 5m

echo "✅ Frontend service deployed"

echo ""
echo "========================================="
echo "Step 5: Verify Deployment"
echo "========================================="

echo ""
echo "Pod status:"
kubectl get pods -n $NAMESPACE

echo ""
echo "Service status:"
kubectl get services -n $NAMESPACE

echo ""
echo "========================================="
echo "Step 6: Smoke Tests"
echo "========================================="

chmod +x ./scripts/smoke.sh
./scripts/smoke.sh $NAMESPACE

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Services deployed:"
echo "  - Pricing Rust (gRPC)"
echo "  - Backend API"
echo "  - Frontend SPA"
echo ""
echo "To check status:"
echo "  kubectl get all -n $NAMESPACE"
echo ""
echo "To view logs:"
echo "  kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=backend -f"
echo "  kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=frontend -f"
echo "  kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=pricing-rust -f"
echo ""
echo "To rollback:"
echo "  ./scripts/rollback.sh <service> 0 $NAMESPACE"

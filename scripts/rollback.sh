#!/bin/bash
#
# Rollback Script for AutolytiQ Helm Deployments
# Usage: ./rollback.sh <service> [revision] [namespace]
#

set -e

SERVICE=$1
REVISION=${2:-0}  # 0 means rollback to previous revision
NAMESPACE=${3:-production}

if [ -z "$SERVICE" ]; then
    echo "Usage: ./rollback.sh <service> [revision] [namespace]"
    echo ""
    echo "Examples:"
    echo "  ./rollback.sh backend              # Rollback backend to previous revision"
    echo "  ./rollback.sh backend 1            # Rollback backend to revision 1"
    echo "  ./rollback.sh frontend 0 staging   # Rollback frontend in staging"
    echo ""
    echo "Available services: backend, frontend, pricing-rust"
    exit 1
fi

echo "========================================="
echo "⏪ Rolling Back Deployment"
echo "========================================="
echo "Service: $SERVICE"
echo "Namespace: $NAMESPACE"
echo "Target Revision: $REVISION (0 = previous)"
echo ""

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "❌ Helm is not installed"
    exit 1
fi

# Check if service exists
if ! helm list -n $NAMESPACE | grep -q $SERVICE; then
    echo "❌ Service $SERVICE not found in namespace $NAMESPACE"
    echo ""
    echo "Available services:"
    helm list -n $NAMESPACE
    exit 1
fi

# Show current status
echo "Current status:"
helm status $SERVICE -n $NAMESPACE

echo ""
echo "Deployment history:"
helm history $SERVICE -n $NAMESPACE

echo ""
read -p "Are you sure you want to rollback $SERVICE? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

echo ""
echo "Initiating rollback..."

# Perform rollback
if helm rollback $SERVICE $REVISION --namespace $NAMESPACE --wait --timeout 5m; then
    echo ""
    echo "✅ Rollback completed successfully"
else
    echo ""
    echo "❌ Rollback failed"
    exit 1
fi

# Show new status
echo ""
echo "New deployment status:"
helm status $SERVICE -n $NAMESPACE

echo ""
echo "Pod status:"
kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=$SERVICE

echo ""
echo "========================================="
echo "Rollback Summary"
echo "========================================="
helm history $SERVICE -n $NAMESPACE | tail -5

echo ""
echo "To monitor logs:"
echo "  kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=$SERVICE -f"
echo ""
echo "To check service health:"
echo "  kubectl get pods -n $NAMESPACE -l app.kubernetes.io/name=$SERVICE"

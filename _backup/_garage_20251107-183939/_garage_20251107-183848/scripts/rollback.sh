#!/bin/bash

SERVICE=$1
REVISION=${2:-0}

if [ -z "$SERVICE" ]; then
  echo "Usage: ./rollback.sh <service> [revision]"
  echo "Example: ./rollback.sh backend 1"
  exit 1
fi

echo "Rolling back $SERVICE to revision $REVISION..."

helm rollback $SERVICE $REVISION --namespace production

echo "Rollback initiated. Check status with:"
echo "  helm status $SERVICE -n production"
echo "  kubectl get pods -n production"

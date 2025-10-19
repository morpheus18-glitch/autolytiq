#!/usr/bin/env bash

set -euo pipefail

ENVIRONMENT="${1:-}"
if [[ -z "${ENVIRONMENT}" ]]; then
  echo "Usage: $0 [staging|production]" >&2
  exit 1
fi

if [[ "${ENVIRONMENT}" != "staging" && "${ENVIRONMENT}" != "production" ]]; then
  echo "Environment must be staging or production" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="${SCRIPT_DIR}/../k8s/${ENVIRONMENT}"
NAMESPACE="dms-${ENVIRONMENT}"

kubectl config use-context "dms-${ENVIRONMENT}"

echo "[Deploy] Applying Kubernetes manifests for ${ENVIRONMENT}"

kubectl apply -f "${K8S_DIR}/namespace.yaml"
kubectl apply -f "${K8S_DIR}/configmap.yaml"
kubectl apply -f "${K8S_DIR}/secrets.yaml"
kubectl apply -f "${K8S_DIR}/pvc.yaml"
kubectl apply -f "${K8S_DIR}/backend-deployment.yaml"
kubectl apply -f "${K8S_DIR}/frontend-deployment.yaml"
kubectl apply -f "${K8S_DIR}/ml-service-deployment.yaml"
kubectl apply -f "${K8S_DIR}/celery-worker-deployment.yaml"
kubectl apply -f "${K8S_DIR}/ingress.yaml"
kubectl apply -f "${K8S_DIR}/hpa.yaml"

echo "[Deploy] Waiting for workloads to become ready"

kubectl rollout status deployment/backend -n "${NAMESPACE}"
kubectl rollout status deployment/frontend -n "${NAMESPACE}"
kubectl rollout status deployment/ml-service -n "${NAMESPACE}"
kubectl rollout status deployment/celery-worker -n "${NAMESPACE}"

echo "[Deploy] Running Prisma migrations"

kubectl exec deployment/backend -n "${NAMESPACE}" -- npx prisma migrate deploy

echo "[Deploy] Deployment complete"

kubectl get pods -n "${NAMESPACE}"
kubectl get services -n "${NAMESPACE}"
kubectl get ingress -n "${NAMESPACE}"

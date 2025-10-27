#!/bin/bash
set -euo pipefail

NAMESPACE=${NAMESPACE:-production}
TAG=${TAG:-latest}
RELEASE_PREFIX=${RELEASE_PREFIX:-}
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

helm upgrade --install pricing-rust "${RELEASE_PREFIX}pricing-rust" \
  "${ROOT_DIR}/infrastructure/k8s/production/helm/pricing-rust" \
  --namespace "${NAMESPACE}" \
  --create-namespace \
  --set image.tag="${TAG}" \
  --wait

helm upgrade --install backend "${RELEASE_PREFIX}backend" \
  "${ROOT_DIR}/infrastructure/k8s/production/helm/backend" \
  --namespace "${NAMESPACE}" \
  --set image.tag="${TAG}" \
  --wait

helm upgrade --install worker "${RELEASE_PREFIX}worker" \
  "${ROOT_DIR}/infrastructure/k8s/production/helm/worker" \
  --namespace "${NAMESPACE}" \
  --set image.tag="${TAG}" \
  --wait

helm upgrade --install frontend "${RELEASE_PREFIX}frontend" \
  "${ROOT_DIR}/infrastructure/k8s/production/helm/frontend" \
  --namespace "${NAMESPACE}" \
  --set image.tag="${TAG}" \
  --wait

"${ROOT_DIR}/scripts/smoke.sh"

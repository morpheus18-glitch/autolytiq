#!/bin/bash
set -euo pipefail

REGISTRY="${REGISTRY:-registry.digitalocean.com/autolytiq}"
TAG="${TAG:-latest}"

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

build() {
  local service=$1
  local context=$2
  echo "📦 Building ${service}..."
  docker build -t "${REGISTRY}/${service}:${TAG}" "${ROOT_DIR}/${context}"
}

build frontend apps/frontend
build backend apps/backend
build worker apps/worker
build pricing-rust apps/pricing-rust

cat <<MSG
✅ Images built successfully.
Push using:
  docker push ${REGISTRY}/frontend:${TAG}
  docker push ${REGISTRY}/backend:${TAG}
  docker push ${REGISTRY}/worker:${TAG}
  docker push ${REGISTRY}/pricing-rust:${TAG}
MSG

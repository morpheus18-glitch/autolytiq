#!/usr/bin/env bash
set -euo pipefail

# Dispatcher script for consolidated Rust services image
# Reads SERVICE_NAME env var and launches the correct binary

svc="${SERVICE_NAME:-price-engine}"

case "$svc" in
  price-engine)
    echo "Starting Price Engine on port ${PORT:-50051}..."
    exec /app/bin/price-engine
    ;;
  cache-service)
    echo "Starting Cache Service on port ${PORT:-50053}..."
    exec /app/bin/cache-service
    ;;
  comm-service)
    echo "Starting Communication Service on port ${PORT:-50052}..."
    exec /app/bin/comm-service
    ;;
  rate-limiter)
    echo "Starting Rate Limiter on port ${PORT:-50054}..."
    exec /app/bin/rate-limiter
    ;;
  tax-svc)
    echo "Starting Tax Service on port ${PORT:-8080}..."
    exec /app/bin/tax-svc
    ;;
  *)
    echo "ERROR: Unknown SERVICE_NAME: $svc" >&2
    echo "Must be one of: price-engine, cache-service, comm-service, rate-limiter, tax-svc" >&2
    exit 1
    ;;
esac

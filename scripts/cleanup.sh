#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[Cleanup] Removing deprecated directories..."

if [ -d "${ROOT_DIR}/lib" ]; then
  rm -rf "${ROOT_DIR}/lib"
fi

if [ -d "${ROOT_DIR}/prisma" ]; then
  rm -rf "${ROOT_DIR}/prisma"
fi

if [ -d "${ROOT_DIR}/migrations" ]; then
  rm -rf "${ROOT_DIR}/migrations"
fi

if [ -d "${ROOT_DIR}/ml_backend" ]; then
  echo "[Cleanup] Renaming ml_backend -> ml-service"
  mv "${ROOT_DIR}/ml_backend" "${ROOT_DIR}/ml-service"
fi

echo "[Cleanup] Complete."

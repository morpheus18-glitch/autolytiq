#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${1:-}" ]]; then
  echo "Usage: $0 <backup_file|s3://bucket/path>" >&2
  exit 1
fi

BACKUP_SOURCE="$1"

if [[ ! -f .env ]]; then
  echo "Missing .env file. Copy infrastructure/.env.example to .env and configure credentials." >&2
  exit 1
fi

source .env

WORKDIR="$(mktemp -d)"
trap 'rm -rf "${WORKDIR}"' EXIT

if [[ "${BACKUP_SOURCE}" == s3://* ]]; then
  echo "[Restore] Downloading ${BACKUP_SOURCE}"
  aws s3 cp "${BACKUP_SOURCE}" "${WORKDIR}/backup.sql.gz"
  BACKUP_SOURCE="${WORKDIR}/backup.sql.gz"
fi

if [[ "${BACKUP_SOURCE}" == *.gz ]]; then
  gunzip -c "${BACKUP_SOURCE}" > "${WORKDIR}/backup.sql"
  BACKUP_SOURCE="${WORKDIR}/backup.sql"
fi

echo "[Restore] Restoring database ${DB_NAME}"

PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -c "DROP DATABASE IF EXISTS \"${DB_NAME}\";"
PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -U "${DB_USER}" -c "CREATE DATABASE \"${DB_NAME}\";"

PGPASSWORD="${DB_PASSWORD}" pg_restore \
  -h "${DB_HOST}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --verbose \
  "${BACKUP_SOURCE}"

echo "[Restore] Completed successfully."

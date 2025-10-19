#!/usr/bin/env bash

set -euo pipefail

if [[ ! -f .env ]]; then
  echo "Missing .env file. Copy infrastructure/.env.example to .env and configure credentials." >&2
  exit 1
fi

source .env

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo "[Backup] Starting PostgreSQL backup..."

PGPASSWORD="${DB_PASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -F c \
  -f "${BACKUP_FILE}"

gzip "${BACKUP_FILE}"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "[Backup] Archive created at ${BACKUP_FILE}"

if [[ -n "${S3_BUCKET:-}" ]]; then
  echo "[Backup] Uploading to s3://${S3_BUCKET}/backups/database/"
  aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/backups/database/"
fi

find "${BACKUP_DIR}" -name 'backup_*.sql.gz' -mtime +30 -delete

echo "[Backup] Completed successfully."

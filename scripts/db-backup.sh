#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

BACKUP_DIR=${BACKUP_DIR:-"./backups"}
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="$BACKUP_DIR/automotive_dms_$TIMESTAMP.sql"

echo "Creating database backup at $OUTPUT_FILE"
pg_dump --file="$OUTPUT_FILE" --no-owner --clean "$DATABASE_URL"

echo "Backup completed: $OUTPUT_FILE"

if [[ -n "${S3_BUCKET:-}" ]]; then
  echo "Uploading backup to s3://$S3_BUCKET"
  aws s3 cp "$OUTPUT_FILE" "s3://$S3_BUCKET/"
fi

#!/usr/bin/env bash
# ==============================================================================
# AutolytiQ production startup script
# ==============================================================================
# This script launches the production application and runs safe Prisma migrations.
# It leverages the db:migrate:deploy:safe helper which can baseline existing
# schemas (avoiding P3005) and always exits successfully so the app can boot.
# Set SKIP_DB_MIGRATIONS=1 to bypass the migration step.
# ==============================================================================

set -o errexit
set -o nounset
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "🚀 AutolytiQ production startup"

if [[ "${SKIP_DB_MIGRATIONS:-0}" == "1" ]]; then
  echo "⚠️  SKIP_DB_MIGRATIONS is set; skipping Prisma migrations"
else
  echo "🛠  Running safe Prisma migrations"
  set +e
  npm run db:migrate:deploy:safe
  migrate_exit=$?
  set -e

  if [[ $migrate_exit -ne 0 ]]; then
    echo "⚠️  Migration step reported issues (exit code $migrate_exit)"
    echo "    Continuing startup; check logs for details"
  fi
fi

echo "✅ Launching application server"
exec npm run start

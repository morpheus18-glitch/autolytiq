#!/usr/bin/env bash
# ==============================================================================
# AutolytiQ production startup script
# ==============================================================================
# This script wraps the production startup so we can run migrations safely
# before launching the application. It uses the safe Prisma deployment helper
# that baselines an existing database and never blocks the server from booting.
# ==============================================================================

set -o errexit
set -o nounset
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "🚀 AutolytiQ production startup"
echo "🔄 Ensuring Prisma client and migrations are up to date..."

if ! npm run db:migrate:deploy:safe; then
  echo "⚠️  Safe migration deploy reported issues. Continuing with startup." >&2
fi

echo "✅ Launching application"
exec npm run start

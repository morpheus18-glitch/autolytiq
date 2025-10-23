#!/usr/bin/env bash
# ==============================================================================
# AutolytiQ production startup script
# ==============================================================================
# This script launches the production application without running migrations.
# Migrations should be run separately using: npm run db:migrate:deploy
# ==============================================================================

set -o errexit
set -o nounset
set -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR"

echo "🚀 AutolytiQ production startup"
echo "✅ Launching application (migrations should be run separately)"
exec npm run start

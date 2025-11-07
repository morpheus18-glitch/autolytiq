#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$ROOT_DIR/SHORT_CHANGELOG.md"
MESSAGE="${*:-}"

if [[ -z "$MESSAGE" ]]; then
  if git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    MESSAGE="$(git -C "$ROOT_DIR" status --short)"
  fi
fi

if [[ -z "$MESSAGE" ]]; then
  echo "Usage: pnpm changelog:update \"<short summary>\"" >&2
  exit 1
fi

if [[ ! -f "$LOG_FILE" ]]; then
  cat <<'LOGHEADER' > "$LOG_FILE"
# Iteration Changelog

Each entry is appended automatically via `pnpm changelog:update` to track agent activity.
LOGHEADER
fi

UTC_STAMP="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
BRANCH="unknown"
if git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD >/dev/null 2>&1; then
  BRANCH="$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD)"
fi

{
  printf '## %s (%s)\n\n' "$UTC_STAMP" "$BRANCH"
  printf '%s\n\n' "$MESSAGE"
} >> "$LOG_FILE"

echo "Logged iteration summary to $LOG_FILE"

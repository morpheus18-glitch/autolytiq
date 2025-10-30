#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/autolytiq}"
INTERVAL="${INTERVAL:-10}"  # seconds between syncs
LOCKFILE="${REPO_DIR}/.sync.lock"

cd "$REPO_DIR"

# single-run guard (prevents overlapping instances)
exec 9>"$LOCKFILE"
flock -n 9 || { echo "Sync already running."; exit 0; }

while true; do
  # stage + conditional commit
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "auto: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  fi

  # pull (rebase) and bail out if conflicts
  if ! git pull --rebase --autostash --no-edit; then
    echo "✗ Conflict detected. Resolve manually, then rerun."
    git status
    exit 1
  fi

  # push (ignore transient network errors; they’ll retry next loop)
  git push || true

  sleep "$INTERVAL"
done

#!/usr/bin/env bash
set -euo pipefail

CACHE_DIR="var/bin"
BIN="$CACHE_DIR/gitleaks"
VERSION="8.18.4"
ARCHIVE_URL="https://github.com/gitleaks/gitleaks/releases/download/v${VERSION}/gitleaks_${VERSION}_linux_x64.tar.gz"

if [ ! -x "$BIN" ]; then
  echo "[gitleaks] downloading ${VERSION}..." >&2
  mkdir -p "$CACHE_DIR"
  tmpdir=$(mktemp -d)
  curl -sSL "$ARCHIVE_URL" -o "$tmpdir/gitleaks.tar.gz"
  tar -xzf "$tmpdir/gitleaks.tar.gz" -C "$tmpdir"
  mv "$tmpdir/gitleaks" "$BIN"
  chmod +x "$BIN"
  rm -rf "$tmpdir"
fi

exec "$BIN" detect --no-banner --redact "$@"

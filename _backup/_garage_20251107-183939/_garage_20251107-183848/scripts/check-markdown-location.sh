#!/usr/bin/env bash
# Pre-commit check: Validate markdown files are in docs/ directory
# Enforces documentation organization rule from AGENTS.md and CLAUDE.md

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Checking markdown file locations..."

# Find all .md files at root level (excluding README.md and node_modules)
root_md_files=$(find /root/autolytiq -maxdepth 1 -name "*.md" -type f ! -name "README.md" 2>/dev/null || true)

# Find .md files in apps/ and packages/ (excluding specific READMEs)
misplaced_md_files=$(find /root/autolytiq/apps /root/autolytiq/packages \
  -name "*.md" -type f \
  ! -path "*/README.md" \
  ! -path "*/node_modules/*" \
  2>/dev/null || true)

violations=0

if [ -n "$root_md_files" ]; then
  echo -e "${RED}❌ ERROR: Markdown files found at root level (only README.md allowed):${NC}"
  echo "$root_md_files" | while read -r file; do
    basename_file=$(basename "$file")
    echo -e "  ${RED}✗${NC} $basename_file"
    echo -e "    ${YELLOW}→${NC} Should be in docs/specs/, docs/ui/, docs/architecture/, etc."
  done
  violations=$((violations + 1))
fi

if [ -n "$misplaced_md_files" ]; then
  echo -e "${RED}❌ ERROR: Markdown files found outside docs/ (except package READMEs):${NC}"
  echo "$misplaced_md_files" | while read -r file; do
    rel_path="${file#/root/autolytiq/}"
    echo -e "  ${RED}✗${NC} $rel_path"
    echo -e "    ${YELLOW}→${NC} Should be in docs/ directory"
  done
  violations=$((violations + 1))
fi

if [ $violations -eq 0 ]; then
  echo -e "${GREEN}✅ All markdown files are correctly located${NC}"
  echo ""
  echo "Documentation structure:"
  echo "  • Root: README.md only"
  echo "  • All docs: docs/ subdirectories"
  echo "  • Package docs: packages/*/README.md"
  echo "  • App docs: apps/*/README.md"
  exit 0
else
  echo ""
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}DOCUMENTATION LOCATION RULE VIOLATION${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "Rule: ALL .md files MUST be in docs/ directory structure"
  echo ""
  echo "Allowed locations:"
  echo "  ✅ README.md (root only)"
  echo "  ✅ docs/specs/*.md"
  echo "  ✅ docs/ui/*.md"
  echo "  ✅ docs/architecture/*.md"
  echo "  ✅ docs/deployment/*.md"
  echo "  ✅ docs/guides/*.md"
  echo "  ✅ docs/features/*.md"
  echo "  ✅ docs/operations/*.md"
  echo "  ✅ packages/*/README.md"
  echo "  ✅ apps/*/README.md"
  echo ""
  echo "Fix: Move violating files to appropriate docs/ subdirectory"
  echo ""
  echo "See: AGENTS.md §5 and docs/architecture/CLAUDE.md"
  echo ""
  exit 1
fi

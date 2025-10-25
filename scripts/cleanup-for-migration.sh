#!/bin/bash
#
# AutolytiQ - Cleanup Script for Migration
# Removes unnecessary files before deploying to Digital Ocean
#
# Usage: ./scripts/cleanup-for-migration.sh [--dry-run]
#

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
echo_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
echo_error() { echo -e "${RED}[ERROR]${NC} $1"; }

DRY_RUN=false
if [ "${1:-}" = "--dry-run" ]; then
    DRY_RUN=true
    echo_info "Running in DRY RUN mode (no files will be deleted)"
fi

cd "$(dirname "$0")/.."

echo_info "=== AutolytiQ Cleanup for Migration ==="
echo ""

# Function to remove files/dirs
remove_item() {
    local item="$1"
    local reason="$2"

    if [ -e "$item" ] || [ -L "$item" ]; then
        if [ "$DRY_RUN" = true ]; then
            echo_warn "[DRY RUN] Would remove: $item ($reason)"
        else
            rm -rf "$item"
            echo_info "Removed: $item ($reason)"
        fi
    fi
}

# Remove Replit-specific files
echo_info "Removing Replit-specific files..."
remove_item ".replit" "Replit configuration"
remove_item "replit.nix" "Replit Nix configuration"
remove_item ".config/replit" "Replit config directory"

# Remove redundant documentation
echo_info "Consolidating documentation..."
remove_item "DEPLOY_TO_REPLIT.md" "Superseded by DIGITAL_OCEAN_MIGRATION.md"
remove_item "DEPLOYMENT_STEPS.md" "Consolidated into docs/DEPLOYMENT.md"
remove_item "DEPLOYMENT_INSTRUCTIONS.md" "Consolidated into docs/DEPLOYMENT.md"
remove_item "docs/replit-dev.md" "Replit-specific"
remove_item "docs/REPLIT_DEPLOYMENT.md" "Replit-specific"

# Remove design assets (keep them in git but exclude from deployment)
echo_info "Marking design assets for exclusion..."
if [ -d "docs/resources/assets" ]; then
    asset_count=$(find docs/resources/assets -type f | wc -l)
    asset_size=$(du -sh docs/resources/assets | cut -f1)
    echo_warn "Found $asset_count files ($asset_size) in docs/resources/assets"
    echo_info "These will be excluded via .dockerignore (not deleted from git)"
fi

# Remove old Docker files if they exist
echo_info "Checking for old Docker configurations..."
remove_item "Dockerfile.backend" "Replaced by unified Dockerfile"
remove_item "Dockerfile.frontend" "Replaced by unified Dockerfile"
remove_item "infrastructure/docker" "Old Docker configs"

# Remove temporary and log files
echo_info "Removing temporary files..."
find . -type f -name "*.log" -not -path "*/node_modules/*" -exec rm -f {} \; 2>/dev/null || true
find . -type f -name "*.tmp" -not -path "*/node_modules/*" -exec rm -f {} \; 2>/dev/null || true
find . -type f -name ".DS_Store" -exec rm -f {} \; 2>/dev/null || true

# Remove old migration artifacts
echo_info "Checking for backup files..."
find . -type f \( -name "*.backup" -o -name "*.bak" -o -name "*.old" \) -not -path "*/node_modules/*" | while read -r file; do
    remove_item "$file" "Backup file"
done

# Clean npm/pnpm caches
echo_info "Cleaning package manager caches..."
if [ "$DRY_RUN" = false ]; then
    pnpm store prune || true
fi

# Check for large node_modules
echo_info "Checking node_modules size..."
if [ -d "node_modules" ]; then
    size=$(du -sh node_modules | cut -f1)
    echo_warn "node_modules: $size (will be rebuilt on deployment)"
fi

# Summary
echo ""
echo_info "=== Cleanup Summary ==="
if [ "$DRY_RUN" = true ]; then
    echo_warn "This was a DRY RUN. Run without --dry-run to actually remove files."
else
    echo_info "Cleanup complete!"
fi

echo ""
echo_info "Next steps:"
echo "1. Review changes: git status"
echo "2. Test build: pnpm build:prod"
echo "3. Test Docker: docker-compose up --build"
echo "4. Commit changes: git add . && git commit -m 'chore: Cleanup for Digital Ocean migration'"
echo "5. Push to GitHub: git push origin main"
echo "6. Deploy: ./scripts/deploy-to-droplet.sh YOUR_DROPLET_IP"

#!/bin/bash

# Smart UI Import Migration Script
# Migrates @/components/ui to @repo/ui while preserving frontend-specific components

set -e

# Frontend-specific components that should NOT be migrated
KEEP_LOCAL=(
  "module-header"
  "tab-navigation"
  "pagination"
  "toast"
  "toaster"
)

# Find all TypeScript/TSX files with @/components/ui imports
files=$(grep -rl "from ['\"]@/components/ui" apps/frontend/src --include="*.tsx" --include="*.ts" || true)

if [ -z "$files" ]; then
  echo "No files found with @/components/ui imports"
  exit 0
fi

migrated=0
skipped=0

for file in $files; do
  # Skip files in apps/frontend/src/components/ui/ (the source components themselves)
  if [[ "$file" == apps/frontend/src/components/ui/* ]]; then
    echo "⏭️  Skipping source component: $file"
    skipped=$((skipped + 1))
    continue
  fi

  # Check if file imports any frontend-specific components
  has_local_component=false
  for component in "${KEEP_LOCAL[@]}"; do
    if grep -q "from ['\"]@/components/ui/$component" "$file"; then
      has_local_component=true
      break
    fi
  done

  if [ "$has_local_component" = true ]; then
    echo "⚠️  Skipping (has frontend-specific components): $file"
    skipped=$((skipped + 1))
    continue
  fi

  # Migrate the file
  echo "✅ Migrating: $file"

  # Replace all @/components/ui imports with @repo/ui
  sed -i "s|from '@/components/ui/\([^']*\)'|from '@repo/ui'|g" "$file"
  sed -i "s|from \"@/components/ui/\([^\"]*\)\"|from '@repo/ui'|g" "$file"
  sed -i "s|from '@/components/ui'|from '@repo/ui'|g" "$file"
  sed -i "s|from \"@/components/ui\"|from '@repo/ui'|g" "$file"

  migrated=$((migrated + 1))
done

echo ""
echo "📊 Migration Summary:"
echo "   ✅ Migrated: $migrated files"
echo "   ⏭️  Skipped: $skipped files"
echo ""
echo "Files with frontend-specific components were preserved."

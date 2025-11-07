#!/bin/bash

# Migration script to replace @/components/ui imports with @repo/ui imports
# This ensures all components come from the shared packages/ui library

set -e

echo "🔄 Migrating imports from @/components/ui to @repo/ui..."

# Find all TypeScript/TSX files in the frontend
FILES=$(find apps/frontend/src -type f \( -name "*.tsx" -o -name "*.ts" \))

COUNT=0

for file in $FILES; do
  # Check if file contains @/components/ui imports
  if grep -q "from '@/components/ui" "$file"; then
    # Replace the imports
    sed -i "s|from '@/components/ui/\([^']*\)'|from '@repo/ui'|g" "$file"
    sed -i "s|from '@/components/ui'|from '@repo/ui'|g" "$file"

    COUNT=$((COUNT + 1))
    echo "  ✓ Updated: $file"
  fi
done

echo ""
echo "✅ Migration complete!"
echo "   Updated $COUNT files"
echo ""
echo "⚠️  IMPORTANT: Please review the changes and ensure:"
echo "   1. All component names match exports from @repo/ui"
echo "   2. Run 'pnpm build' to verify everything compiles"
echo "   3. Delete apps/frontend/src/components/ui/ folder after verification"

#!/bin/bash

# Script to fix invalid component props in frontend pages

set -e

echo "🔧 Fixing invalid component props..."

# Fix Card padding prop - convert to className
FILES=$(grep -rl 'padding=' apps/frontend/src --include="*.tsx")

for file in $FILES; do
  # Replace padding="md" with className that includes padding
  sed -i 's/<Card padding="none"/<Card className="p-0"/g' "$file"
  sed -i 's/<Card padding="sm"/<Card className="p-2"/g' "$file"
  sed -i 's/<Card padding="md"/<Card className="p-4"/g' "$file"
  sed -i 's/<Card padding="lg"/<Card className="p-6"/g' "$file"

  # Handle cases where Card already has className
  sed -i 's/<Card padding="none" className="/<Card className="p-0 /g' "$file"
  sed -i 's/<Card padding="sm" className="/<Card className="p-2 /g' "$file"
  sed -i 's/<Card padding="md" className="/<Card className="p-4 /g' "$file"
  sed -i 's/<Card padding="lg" className="/<Card className="p-6 /g' "$file"

  # Handle reverse order (className before padding)
  sed -i 's/className="\([^"]*\)" padding="none"/className="p-0 \1"/g' "$file"
  sed -i 's/className="\([^"]*\)" padding="sm"/className="p-2 \1"/g' "$file"
  sed -i 's/className="\([^"]*\)" padding="md"/className="p-4 \1"/g' "$file"
  sed -i 's/className="\([^"]*\)" padding="lg"/className="p-6 \1"/g' "$file"

  echo "  ✓ Fixed: $file"
done

echo ""
echo "✅ All component props fixed!"
echo "   Fixed padding prop usage in Card components"

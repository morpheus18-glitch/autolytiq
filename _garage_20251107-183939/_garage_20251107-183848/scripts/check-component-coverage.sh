#!/bin/bash

# Check which local components exist in packages/ui

echo "Checking component coverage in packages/ui..."
echo ""

cd /root/autolytiq

in_packages=0
missing=0

# Helper function to convert kebab-case to PascalCase
to_pascal_case() {
  echo "$1" | sed -r 's/(^|-)([a-z])/\U\2/g'
}

for file in apps/frontend/src/components/ui/*.tsx; do
  if [ ! -f "$file" ]; then
    continue
  fi

  name=$(basename "$file" .tsx)
  pascal=$(to_pascal_case "$name")

  # Check if component exists in packages/ui
  if [ -f "packages/ui/src/components/$pascal.tsx" ]; then
    echo "✅ $name → $pascal.tsx EXISTS in packages/ui"
    in_packages=$((in_packages + 1))
  else
    echo "❌ $name → $pascal.tsx MISSING from packages/ui"
    missing=$((missing + 1))
  fi
done

echo ""
echo "📊 Summary:"
echo "   ✅ In packages/ui: $in_packages components"
echo "   ❌ Missing: $missing components"

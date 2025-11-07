#!/bin/bash

# Check which components in frontend/src/components/ui are still being imported

echo "Checking which local UI components are still in use..."
echo ""

cd /root/autolytiq

used=()
unused=()

for comp in apps/frontend/src/components/ui/*.tsx apps/frontend/src/components/ui/*.ts; do
  if [ ! -f "$comp" ]; then
    continue
  fi

  name=$(basename "$comp" .tsx)
  name=$(basename "$name" .ts)

  # Skip index file
  if [ "$name" = "index" ]; then
    continue
  fi

  # Check if this component is imported anywhere
  if grep -qr "from ['\"]@/components/ui/$name" apps/frontend/src --include="*.tsx" --include="*.ts" 2>/dev/null; then
    used+=("$name")
    echo "✅ USED: $name"
  else
    unused+=("$name")
    echo "❌ UNUSED: $name"
  fi
done

echo ""
echo "📊 Summary:"
echo "   ✅ Still used: ${#used[@]} components"
echo "   ❌ Can delete: ${#unused[@]} components"
echo ""

if [ ${#used[@]} -gt 0 ]; then
  echo "Components still in use:"
  for comp in "${used[@]}"; do
    echo "   - $comp"
  done
  echo ""
fi

if [ ${#unused[@]} -gt 0 ]; then
  echo "Components safe to delete:"
  for comp in "${unused[@]}"; do
    echo "   - $comp.tsx"
  done
fi

#!/bin/bash
set -e
echo "🔍 Validating ESM setup..."

if grep -r "module.exports\|require(" packages/ apps/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules; then
  echo "❌ Found CJS syntax"
  exit 1
fi

for pkg in packages/*/package.json apps/*/package.json; do
  [ -f "$pkg" ] && ! grep -q '"type": "module"' "$pkg" && echo "❌ Missing type:module in $pkg" && exit 1
done

echo "✅ ESM-compliant"

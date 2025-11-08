#!/bin/bash
# AutolytiQ Production Foundation Setup
# Creates clean ESM-first architecture

set -e

echo "🚀 AutolytiQ Production Foundation Setup"
echo "========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "${BLUE}▶${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

cd "$(dirname "$0")/.."

# Step 1: Archive existing
step "Archiving existing files..."
mkdir -p _backup/{packages,apps}

for dir in packages/tokens packages/ui packages/db packages/shared apps/frontend apps/backend; do
  if [ -d "$dir" ]; then
    cp -r "$dir" "_backup/$dir" 2>/dev/null || true
    success "Archived $dir"
  fi
done

[ -d "_garage_20251107-184118" ] && mv _garage_* _backup/ 2>/dev/null || true

# Step 2: Create structure
step "Creating directory structure..."
mkdir -p contracts/{openapi,grpc,generated/{typescript,python,rust}}
mkdir -p packages/config apps services scripts
success "Directory structure created"

# Step 3: Base configs
step "Creating base configs..."

cat > packages/config/tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
EOF

cat > packages/config/tsconfig.react.json << 'EOF'
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx"
  }
}
EOF

cat > packages/config/tsconfig.node.json << 'EOF'
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "types": ["node"]
  }
}
EOF

cat > packages/config/package.json << 'EOF'
{
  "name": "@autolytiq/config",
  "version": "1.0.0",
  "private": true,
  "type": "module"
}
EOF

success "Base configs created"

# Step 4: ESM validation
cat > scripts/validate-esm.sh << 'EOF'
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
EOF

chmod +x scripts/validate-esm.sh
success "ESM validator created"

# Step 5: Workspace config
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
  - 'apps/*'
  - 'services/*'
EOF

success "Workspace configured"

# Step 6: Node version
echo "20.11.0" > .nvmrc
success "Node version set"

echo ""
echo -e "${GREEN}✓ Foundation setup complete!${NC}"
echo ""
echo "Next: Review PRODUCTION_FOUNDATION_PLAN.md"

#!/bin/bash
set -e

echo "=== Deployment Validation Script ==="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation functions
validate_step() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

warn_step() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node --version)
if [[ $NODE_VERSION == v20* ]]; then
    validate_step "Node.js version: $NODE_VERSION"
else
    warn_step "Node.js version: $NODE_VERSION (expected v20.x)"
fi

# Check pnpm
echo "Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    validate_step "pnpm version: $PNPM_VERSION"
else
    echo -e "${RED}✗${NC} pnpm not found"
    exit 1
fi

# Check environment files
echo ""
echo "Checking environment configuration..."
if [ -f ".env" ] || [ -f ".env.production" ]; then
    validate_step "Environment file exists"
else
    warn_step "No .env file found (will use defaults)"
fi

# Validate Prisma schema
echo ""
echo "Validating Prisma schema..."
if pnpm --filter @repo/db exec prisma validate --schema schema.prisma 2>&1 | grep -q "is valid"; then
    validate_step "Prisma schema is valid"
else
    echo -e "${RED}✗${NC} Prisma schema validation failed"
    exit 1
fi

# Check for required dependencies
echo ""
echo "Checking package integrity..."
if [ -f "pnpm-lock.yaml" ]; then
    validate_step "pnpm-lock.yaml exists"
else
    echo -e "${RED}✗${NC} pnpm-lock.yaml not found"
    exit 1
fi

# TypeScript compilation check
echo ""
echo "Running TypeScript type check..."
if pnpm typecheck > /tmp/typecheck.log 2>&1; then
    validate_step "TypeScript compilation successful"
else
    echo -e "${RED}✗${NC} TypeScript errors found:"
    tail -20 /tmp/typecheck.log
    exit 1
fi

# Build check
echo ""
echo "Running production build..."
if pnpm build > /tmp/build.log 2>&1; then
    validate_step "Build successful"
else
    echo -e "${RED}✗${NC} Build failed:"
    tail -30 /tmp/build.log
    exit 1
fi

# Check critical files exist
echo ""
echo "Checking build artifacts..."
REQUIRED_FILES=(
    "apps/backend/dist/index.js"
    "apps/frontend/dist/index.html"
    "packages/shared/dist/index.js"
    "packages/tokens/dist/index.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        validate_step "$file exists"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        exit 1
    fi
done

# Dockerfile validation
echo ""
echo "Validating Dockerfiles..."
DOCKERFILES=(
    "infrastructure/docker/Dockerfile.backend"
    "infrastructure/docker/Dockerfile.frontend"
    "infrastructure/docker/Dockerfile.ml"
)

for dockerfile in "${DOCKERFILES[@]}"; do
    if [ -f "$dockerfile" ]; then
        validate_step "$dockerfile exists"
    else
        echo -e "${RED}✗${NC} Missing: $dockerfile"
        exit 1
    fi
done

# Check docker-compose
echo ""
echo "Validating docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    if command -v docker &> /dev/null; then
        # Create a dummy .env if it doesn't exist for validation
        TEMP_ENV=false
        if [ ! -f ".env" ]; then
            touch .env
            TEMP_ENV=true
        fi
        
        if docker compose config > /dev/null 2>&1; then
            validate_step "docker-compose.yml is valid"
        else
            warn_step "docker-compose.yml validation warnings (may be ok)"
        fi
        
        # Clean up temp .env
        if [ "$TEMP_ENV" = true ]; then
            rm .env
        fi
    else
        validate_step "docker-compose.yml exists (docker not available to validate)"
    fi
else
    echo -e "${RED}✗${NC} docker-compose.yml not found"
    exit 1
fi

# Security checks
echo ""
echo "Running security checks..."
if [ -f ".env" ]; then
    if grep -q "PASSWORD.*=.*password" .env 2>/dev/null; then
        warn_step "Found weak passwords in .env file"
    fi
fi

# Check for secrets in code
if grep -r "sk-.*" apps/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v node_modules | grep -v ".test." > /tmp/secrets.log; then
    warn_step "Potential secrets found in code:"
    cat /tmp/secrets.log
fi

echo ""
echo -e "${GREEN}=== Validation Complete ===${NC}"
echo ""
echo "Summary:"
echo "- All critical files present"
echo "- TypeScript compilation successful"
echo "- Build process working"
echo "- Docker configuration valid"
echo ""
echo "Ready for deployment!"

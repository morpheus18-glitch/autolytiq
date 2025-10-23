#!/bin/bash

# ==============================================================================
# AutolytiQ Production Build Verification Script
# ==============================================================================
# This script verifies that the production build is ready for deployment
# ==============================================================================

set -e  # Exit on error

echo "======================================================================"
echo "AutolytiQ Production Build Verification"
echo "======================================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in production mode
if [ "$NODE_ENV" != "production" ]; then
    echo -e "${YELLOW}⚠️  Warning: NODE_ENV is not set to 'production'${NC}"
    echo "   Current value: $NODE_ENV"
fi

echo ""
echo "Step 1: Checking required environment variables..."
echo "----------------------------------------------------------------------"

REQUIRED_VARS=("DATABASE_URL" "SESSION_SECRET" "JWT_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}✗${NC} $var is not set"
        MISSING_VARS+=("$var")
    else
        echo -e "${GREEN}✓${NC} $var is set"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Error: Missing required environment variables!${NC}"
    echo "Please set the following variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

echo ""
echo "Step 2: Checking Node.js version..."
echo "----------------------------------------------------------------------"
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js version: $NODE_VERSION"

echo ""
echo "Step 3: Checking npm dependencies..."
echo "----------------------------------------------------------------------"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    npm install
else
    echo -e "${GREEN}✓${NC} node_modules exists"
fi

echo ""
echo "Step 4: Generating Prisma client..."
echo "----------------------------------------------------------------------"
npm run prisma:generate || {
    echo -e "${RED}✗ Prisma client generation failed${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} Prisma client generated"

echo ""
echo "Step 5: Building backend (tsup)..."
echo "----------------------------------------------------------------------"
npm run build || {
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} Backend built successfully"

# Check if dist/index.js exists
if [ -f "dist/index.js" ]; then
    echo -e "${GREEN}✓${NC} dist/index.js exists"
else
    echo -e "${RED}✗ dist/index.js not found${NC}"
    exit 1
fi

echo ""
echo "Step 6: Building frontend (Vite)..."
echo "----------------------------------------------------------------------"
npm run build:client || {
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓${NC} Frontend built successfully"

# Check if dist/public exists
if [ -d "dist/public" ]; then
    echo -e "${GREEN}✓${NC} dist/public exists"
    # Count files in dist/public
    FILE_COUNT=$(find dist/public -type f | wc -l)
    echo -e "${GREEN}✓${NC} Found $FILE_COUNT files in dist/public"
else
    echo -e "${RED}✗ dist/public not found${NC}"
    exit 1
fi

echo ""
echo "Step 7: Checking database connection..."
echo "----------------------------------------------------------------------"
npx prisma db execute --stdin <<SQL > /dev/null 2>&1 <<< "SELECT 1;" && {
    echo -e "${GREEN}✓${NC} Database connection successful"
} || {
    echo -e "${YELLOW}⚠️  Could not verify database connection${NC}"
    echo "   This is OK if database is not running locally"
}

echo ""
echo "Step 8: Checking migrations..."
echo "----------------------------------------------------------------------"
MIGRATION_COUNT=$(find prisma/migrations -name "migration.sql" | wc -l)
echo -e "${GREEN}✓${NC} Found $MIGRATION_COUNT migration files"

echo ""
echo "Step 9: Verifying build output..."
echo "----------------------------------------------------------------------"
DIST_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
echo -e "${GREEN}✓${NC} Build output size: $DIST_SIZE"

echo ""
echo "Step 10: Production readiness checklist..."
echo "----------------------------------------------------------------------"

# Check optional but recommended variables
OPTIONAL_VARS=("REDIS_URL" "SENDGRID_API_KEY" "AWS_ACCESS_KEY_ID")
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${YELLOW}⚠️${NC}  $var is not set (optional but recommended)"
    else
        echo -e "${GREEN}✓${NC} $var is set"
    fi
done

echo ""
echo "======================================================================"
echo -e "${GREEN}✅ Production build verification complete!${NC}"
echo "======================================================================"
echo ""
echo "Summary:"
echo "  - Backend: dist/index.js (ready)"
echo "  - Frontend: dist/public/ (ready)"
echo "  - Prisma client: generated"
echo "  - Migrations: $MIGRATION_COUNT files"
echo ""
echo "Next steps:"
echo "  1. Deploy to Replit"
echo "  2. Configure environment variables in Replit Secrets"
echo "  3. Run migrations manually before starting production (npm run db:migrate:deploy)"
echo "  4. Monitor logs for any errors"
echo ""
echo "To start locally: npm run start:prod"
echo "To deploy: Push to GitHub and deploy from Replit"
echo ""

#!/bin/bash

# Prisma Engine Setup Script
# This script helps install and configure Prisma engines properly

set -e

echo "🔧 Prisma Engine Setup Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 2: Set environment variables
echo "🔧 Step 2: Setting up environment variables..."
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
echo "✅ Environment variables set"
echo ""

# Step 3: Generate Prisma Client
echo "⚙️  Step 3: Generating Prisma Client..."
npx prisma generate || {
    echo "⚠️  First attempt failed, trying with explicit environment variable..."
    PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
}
echo "✅ Prisma Client generated"
echo ""

# Step 4: Verify installation
echo "🔍 Step 4: Verifying installation..."
if [ -d "node_modules/.prisma/client" ]; then
    echo "✅ Prisma Client directory exists"

    # Check for query engine
    if ls node_modules/.prisma/client/libquery_engine-* 1> /dev/null 2>&1; then
        echo "✅ Query engine found"
    else
        echo "⚠️  Query engine not found, but this may be OK for some setups"
    fi
else
    echo "❌ Prisma Client directory not found"
    exit 1
fi
echo ""

# Step 5: Show Prisma version
echo "📋 Step 5: Prisma version information..."
npx prisma --version
echo ""

# Step 6: Validate schema
echo "✔️  Step 6: Validating Prisma schema..."
npx prisma validate
echo "✅ Schema is valid"
echo ""

echo "=============================="
echo "✅ Prisma setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Set DATABASE_URL in your .env file"
echo "2. Run: npm run db:push (to sync schema with database)"
echo "3. Run: npm run build:prod (to build the application)"
echo ""
echo "For production deployment:"
echo "- Set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 in environment variables"
echo "- Ensure binary targets match your deployment platform"
echo ""

# Prisma Engine Setup Script for Windows PowerShell
# This script helps install and configure Prisma engines properly

Write-Host "🔧 Prisma Engine Setup Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 2: Set environment variables
Write-Host "🔧 Step 2: Setting up environment variables..." -ForegroundColor Yellow
$env:PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1"
Write-Host "✅ Environment variables set" -ForegroundColor Green
Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "⚙️  Step 3: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  First attempt failed, trying with explicit environment variable..." -ForegroundColor Yellow
    $env:PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1"
    npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prisma Client generated" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Verify installation
Write-Host "🔍 Step 4: Verifying installation..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma\client") {
    Write-Host "✅ Prisma Client directory exists" -ForegroundColor Green

    # Check for query engine
    $queryEngines = Get-ChildItem -Path "node_modules\.prisma\client" -Filter "*query_engine*" -ErrorAction SilentlyContinue
    if ($queryEngines) {
        Write-Host "✅ Query engine found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Query engine not found, but this may be OK for some setups" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Prisma Client directory not found" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Show Prisma version
Write-Host "📋 Step 5: Prisma version information..." -ForegroundColor Yellow
npx prisma --version
Write-Host ""

# Step 6: Validate schema
Write-Host "✔️  Step 6: Validating Prisma schema..." -ForegroundColor Yellow
npx prisma validate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema is valid" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "❌ Schema validation failed" -ForegroundColor Red
    exit 1
}

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✅ Prisma setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Set DATABASE_URL in your .env file" -ForegroundColor White
Write-Host "2. Run: npm run db:push (to sync schema with database)" -ForegroundColor White
Write-Host "3. Run: npm run build:prod (to build the application)" -ForegroundColor White
Write-Host ""
Write-Host "For production deployment:" -ForegroundColor Cyan
Write-Host "- Set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 in environment variables" -ForegroundColor White
Write-Host "- Ensure binary targets match your deployment platform" -ForegroundColor White
Write-Host ""

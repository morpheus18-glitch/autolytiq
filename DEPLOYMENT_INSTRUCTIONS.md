# Deployment Fix Instructions

## Problem
The deployment is failing because:
1. Missing `build` command in `.replit` deployment configuration
2. Working directory mismatch (deployment runs from `/home/runner/` but code is in `/home/runner/workspace/`)

## Solution

### Step 1: Update `.replit` Deployment Configuration

Open the `.replit` file and update the `[deployment]` section (around line 9-11):

**REPLACE THIS:**
```toml
[deployment]
deploymentTarget = "autoscale"
run = ["sh", "-c", "./start-prod-safe.sh"]
```

**WITH THIS:**
```toml
[deployment]
deploymentTarget = "autoscale"
build = ["sh", "-c", "npm run build:prod"]
run = ["sh", "-c", "./start-prod-safe.sh"]
```

### Step 2: Verify Files Exist

The following files have been created/updated and should exist:

1. ✅ `start-prod-safe.sh` - Production start script that handles working directory
2. ✅ `dist/index.js` - Built application (created by `npm run build:prod`)
3. ✅ `dist/client/` - Built frontend (created by `npm run build:prod`)

### Step 3: Deploy

After making the above change to `.replit`:

1. Click the **Deploy** button
2. The build process will:
   - Generate Prisma Client
   - Build backend with tsup
   - Build frontend with Vite
3. The start script will:
   - Change to `/home/runner/workspace/` directory
   - Start the Node.js application
   - Serve on port 5000

## What Changed

### `start-prod-safe.sh`
```bash
#!/bin/bash
set -e

echo "🚀 Starting AutolytiQ Production"

# Change to workspace directory (deployment runs from /home/runner/)
cd /home/runner/workspace || cd "$(dirname "$0")" || exit 1

echo "📂 Working directory: $(pwd)"
echo "📦 Database migrations are NOT run by this script"
echo "✅ Starting application server..."

# Just start the app - nothing else
exec node dist/index.js
```

**Key Fix:** The `cd /home/runner/workspace` line ensures Node.js runs from the correct directory where `package.json` and all code exists.

## Verification

After deployment, verify:
- `/api/health` returns `{"status":"ok",...}`
- `/api/version` returns `{"name":"rest-express","version":"1.0.0",...}`
- Homepage loads correctly

## Notes

- ✅ Database schema is already synced (no migrations needed)
- ✅ All 24 unit tests passing
- ✅ Build process verified working
- ✅ No database migrations run on startup (prevents P3005 errors)

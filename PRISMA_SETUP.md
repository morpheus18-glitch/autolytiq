# Prisma Engine Installation Guide

## Problem
Prisma tries to download query engines from its CDN during `prisma generate`, which can fail with 403 Forbidden errors in restricted environments.

## Solutions

### Solution 1: Use Local/Cached Engines (Recommended for Production)

1. **Install Prisma with engines bundled:**
```bash
npm install @prisma/client prisma --save-exact
```

2. **Generate Prisma Client with local engines:**
```bash
# Set environment variable to skip checksum verification
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Generate client
npx prisma generate
```

3. **For production builds, update package.json:**
```json
{
  "scripts": {
    "prisma:generate": "PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 prisma generate",
    "build:prod": "npm run prisma:generate && npm run build && npm run build:client"
  }
}
```

### Solution 2: Configure Engine Binary Targets

Update your `prisma/schema.prisma` to specify binary targets:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
}
```

Then regenerate:
```bash
npx prisma generate
```

### Solution 3: Use Pre-Generated Engines (Best for CI/CD)

1. **Generate Prisma Client locally:**
```bash
npx prisma generate
```

2. **Commit the generated client to git:**
```bash
git add node_modules/.prisma
git add node_modules/@prisma/client
```

**Note:** This is generally not recommended but works in restricted environments.

### Solution 4: Download Engines Manually

1. **Identify your Prisma version:**
```bash
npm list @prisma/client
```

2. **Download engines from Prisma's GitHub releases:**
   - Visit: https://github.com/prisma/prisma-engines/releases
   - Download the appropriate binaries for your platform

3. **Place engines in the correct location:**
```bash
mkdir -p node_modules/.prisma/client
# Copy downloaded engines to this directory
```

### Solution 5: Use Environment Variables (For Replit/Cloud Platforms)

Add these environment variables to your deployment:

```bash
# Skip checksum verification
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Skip engine download (uses bundled engines)
PRISMA_SKIP_POSTINSTALL_GENERATE=1

# Or specify custom engine location
PRISMA_QUERY_ENGINE_BINARY=/path/to/query-engine
PRISMA_MIGRATION_ENGINE_BINARY=/path/to/migration-engine
PRISMA_INTROSPECTION_ENGINE_BINARY=/path/to/introspection-engine
PRISMA_FMT_BINARY=/path/to/prisma-fmt
```

## For Replit Deployment

### Option A: Update .replit configuration

Create/update `.replit` file:
```toml
[env]
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = "1"

[deployment]
build = ["sh", "-c", "PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run build:prod"]
run = ["node", "dist/index.js"]
```

### Option B: Update package.json scripts

```json
{
  "scripts": {
    "prisma:generate": "PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 prisma generate",
    "build:prod": "npm run prisma:generate && npm run build && npm run build:client",
    "postinstall": "PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 prisma generate"
  }
}
```

### Option C: Pre-build with Docker

If Replit supports Docker, use multi-stage build:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

## Verify Installation

After setup, verify Prisma is working:

```bash
# Check Prisma version
npx prisma --version

# Test database connection
npx prisma db pull --preview-feature

# Validate schema
npx prisma validate

# Generate client
npx prisma generate
```

## Troubleshooting

### Error: Failed to fetch engine file - 403 Forbidden

**Solution:** Use `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1` environment variable

### Error: Query engine library not found

**Solution:**
1. Check binary targets in schema.prisma
2. Regenerate with correct platform: `npx prisma generate`

### Error: Engine not executable

**Solution:** Set execute permissions:
```bash
chmod +x node_modules/.prisma/client/query-engine-*
```

## Best Practices

1. **Lock Prisma versions** - Use exact versions in package.json:
   ```json
   "@prisma/client": "5.20.1",
   "prisma": "5.20.1"
   ```

2. **Use postinstall hook** for automatic generation:
   ```json
   "postinstall": "prisma generate"
   ```

3. **Cache node_modules** in CI/CD to avoid re-downloading engines

4. **Test locally** before deploying to ensure engines work on your platform

## Platform-Specific Notes

### Replit
- Uses Debian-based containers
- Binary target: `debian-openssl-3.0.x`
- Set environment variables in Secrets/Environment

### Vercel/Netlify
- Serverless functions
- Binary target: `rhel-openssl-3.0.x`
- Use postinstall hook

### Docker
- Specify binary target matching your base image
- Alpine: `linux-musl-openssl-3.0.x`
- Debian: `debian-openssl-3.0.x`

### Windows
- Binary target: `windows`
- Use Git Bash or WSL for Unix commands

## Additional Resources

- [Prisma Platform Documentation](https://www.prisma.io/docs/guides/deployment)
- [Binary Targets Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#binarytargets-options)
- [Prisma Engines Repository](https://github.com/prisma/prisma-engines)

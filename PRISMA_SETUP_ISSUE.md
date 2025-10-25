# Prisma Setup Issue

## Current Status

The project is using **Prisma 5.22.0**, which is the latest stable 5.x version.

## Known Issue: Binary Download Blocked

The environment is currently **blocked from accessing `binaries.prisma.sh`**, which prevents Prisma from downloading required engine binaries during installation.

### Error Message
```
Error: Failed to fetch the engine file at https://binaries.prisma.sh/... - 403 Forbidden
```

### Root Cause
The Prisma CDN (binaries.prisma.sh) returns HTTP 403 Forbidden, indicating:
- Firewall/proxy blocking
- Geographic restrictions
- IP-based access control
- Network security policies

## Configuration Changes Made

### 1. Simplified Prisma Schema Generator
**File**: `packages/db/schema.prisma`

Changed from:
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x", "linux-musl-openssl-3.0.x"]
  engineType    = "library"
}
```

To:
```prisma
generator client {
  provider = "prisma-client-js"
}
```

This uses the default configuration which auto-detects the platform.

### 2. Added `.npmrc`
**File**: `.npmrc`

```
enable-pre-post-scripts=true
```

This allows Prisma's install scripts to run (though they still fail due to the binary download issue).

## Recommended Solutions

### Option 1: Network Configuration (Preferred)
Work with your infrastructure team to allowlist:
- `binaries.prisma.sh`
- `prisma-builds.s3-eu-west-1.amazonaws.com`

### Option 2: Use Prisma Accelerate
Prisma Accelerate is a hosted service that doesn't require local binaries:
1. Sign up at https://www.prisma.io/data-platform/accelerate
2. Update your `DATABASE_URL` to use the Accelerate connection string
3. No local binaries needed

### Option 3: Manual Binary Installation
1. On a machine with unrestricted access:
   ```bash
   npm install prisma@5.22.0
   ```
2. Copy binaries from `node_modules/@prisma/engines/` to the same location on the target machine
3. Run `pnpm db:generate`

### Option 4: Use VPN/Proxy
Configure a VPN or HTTP proxy that can access the Prisma CDN:
```bash
HTTP_PROXY=http://your-proxy:port pnpm install
```

### Option 5: Upgrade to Prisma 6.x (When Network Access is Available)
Prisma 6.x is the actively maintained version with latest features and improvements.

**Note**: Prisma 6 requires:
- Node.js 18.18.0+, 20.9.0+, or 22.11.0+ (✓ Currently running v22.20.0)
- TypeScript 5.1.0+ (✓ Currently using 5.6.3)

**Breaking Changes**: Minor (Buffer → Uint8Array, some API changes)

## Next Steps

1. **Resolve network access** to Prisma binaries CDN
2. Run `pnpm install` to install dependencies
3. Run `pnpm db:generate` to generate Prisma Client
4. Proceed with `pnpm build` and `pnpm dev:replit`

## Current Environment

- **Platform**: Ubuntu 24.04.3 LTS
- **Node.js**: v22.20.0
- **Package Manager**: pnpm v10.18.3
- **Prisma Version**: 5.22.0 (latest stable 5.x)
- **Database**: PostgreSQL (local)

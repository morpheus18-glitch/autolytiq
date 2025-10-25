# Repository Structure

This repository has been refactored into a **clean monorepo** with pnpm workspaces, ESM module mode, and Replit-optimized configuration.

## Directory Layout

```
/
├── apps/                      # Application packages
│   ├── client/               # React frontend (Vite)
│   ├── server/               # Node.js API + WebSockets
│   ├── ml_backend/           # Python ML service
│   └── ml_service/           # Additional ML service
├── packages/                  # Shared libraries
│   ├── db/                   # Prisma schema + migrations
│   └── shared/               # Shared TypeScript utilities
├── infrastructure/           # Kubernetes/Helm/Terraform
├── scripts/                  # Repository scripts
└── tracking-service/         # Standalone tracking service
```

## Module System

- **Mode**: ESM (ECMAScript Modules)
- **TypeScript**: NodeNext module resolution
- **Imports**: All local imports use `.js` extensions (ESM requirement)

## Package Overview

### `apps/server`
Express + Socket.IO server with:
- **Entry**: `src/index.ts`
- **Build**: `tsup` → `dist/`
- **Dev**: `nodemon` with polling (Replit-safe)
- **Static serving**: Serves built client in production/Replit mode

### `apps/client`
React SPA with:
- **Bundler**: Vite
- **Build**: `dist/` (copied to `apps/server/public` for single-port mode)
- **Dev**: Vite dev server (disabled in Replit; use built static files)

### `packages/db`
Prisma database layer:
- **Schema**: `schema.prisma`
- **Migrations**: `migrations/`
- **Generation**: `@prisma/client` → `node_modules/.prisma`

### `packages/shared`
Shared utilities and types:
- **Build**: `tsup` → `dist/`
- **Exports**: ESM bundle with TypeScript declarations
- **Usage**: Import from `@repo/shared`

## Development Commands

### Local Development (Multi-port)
```bash
pnpm dev:server      # Run server only (port 5000)
pnpm dev:client      # Run client only (Vite, port 5173)
```

### Replit Development (Single-port)
```bash
pnpm dev:replit      # Builds shared + client, serves via server on PORT
```
- Builds `packages/shared` → `dist/`
- Builds `apps/client` → `dist/` → copies to `apps/server/public/`
- Runs server with static file serving enabled

### Build
```bash
pnpm build           # Build all packages
pnpm build:server    # Build server only
pnpm build:client    # Build client only
pnpm build:shared    # Build shared package
```

### Database
```bash
pnpm db:generate         # Generate Prisma client
pnpm db:migrate:dev      # Run migrations (dev)
pnpm db:migrate:deploy   # Run migrations (production)
pnpm db:push             # Push schema changes without migration
```

### Quality Checks
```bash
pnpm typecheck       # TypeCheck all packages
pnpm lint            # Lint all packages
pnpm test            # Run tests
```

## Replit Configuration

### Single-Port Mode
- **Port**: `80` (env `PORT`)
- **Server**: Express serves both API and static client
- **No Vite dev server**: Client is pre-built and served statically

### Environment Variables
```bash
PORT=80                                    # Server port
CHOKIDAR_USEPOLLING=1                     # Enable polling (low inotify)
WATCHPACK_POLLING=true                    # Webpack/Vite polling
NODE_ENV=development                      # Environment
SERVE_STATIC=true                         # Enable static file serving
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1  # Skip Prisma checksum validation
```

### Native Dependencies
The `replit.nix` includes:
- Node.js 20
- pnpm
- Python 3.11
- GCC/Make (for native modules)
- OpenSSL, SQLite headers (for Prisma, better-sqlite3)

## Import Rules (ESM)

### ✅ Correct
```typescript
// Local imports MUST use .js extension
import { foo } from './utils/bar.js';
import type { Baz } from '../types/baz.js';

// Package imports NO extension
import express from 'express';
import { z } from 'zod';
```

### ❌ Incorrect
```typescript
// Missing .js for local file
import { foo } from './utils/bar';  // ERROR

// .ts extension (wrong)
import { foo } from './utils/bar.ts';  // ERROR
```

## Deployment

### Production Build
```bash
pnpm build:prod      # Generate Prisma + build all packages
```

### Start
```bash
pnpm start           # Run built server (apps/server/dist/index.js)
```

### Replit Deployment
The deployment uses `start-prod-safe.sh` which:
1. Runs migrations
2. Builds the application
3. Starts the server

## Troubleshooting

### Prisma Errors (403/Network)
If Prisma engine downloads fail:
```bash
# Set environment variable
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Regenerate client
pnpm db:generate
```

### Watch Not Triggering
- Check `nodemon.json` uses `legacyWatch: true`
- Verify env vars `CHOKIDAR_USEPOLLING=1`
- Narrow watch scope (only `apps/server/src`)

### TypeScript Errors
- Ensure `.js` extensions on all local imports
- Check `tsconfig.json` uses `NodeNext`
- Verify workspace package references

## Scripts

All repository scripts are in `/scripts`:
- `safe-migrate-deploy.ts` - Safe database migration
- `db-migrate-production.ts` - Production migration runner
- `health-check.ts` - Server health check

## Further Reading

- **ESM in Node.js**: https://nodejs.org/api/esm.html
- **pnpm Workspaces**: https://pnpm.io/workspaces
- **Prisma**: https://www.prisma.io/docs
- **Replit Nix**: https://docs.replit.com/programming-ide/nix-on-replit

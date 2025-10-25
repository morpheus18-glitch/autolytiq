# Multi-stage Dockerfile for AutolytiQ Production Deployment
# Optimized for Digital Ocean and general cloud deployment

# Stage 1: Base dependencies
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate
WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod=false

# Stage 3: Build application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN pnpm db:generate

# Build all packages
ENV NODE_ENV=production
RUN pnpm build

# Build static client for production
RUN pnpm build:client:static

# Stage 4: Production dependencies only
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc* ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# Stage 5: Production runner
FROM base AS runner

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy necessary files
COPY --from=prod-deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/apps/server/dist ./apps/server/dist
COPY --from=builder --chown=appuser:nodejs /app/apps/server/public ./apps/server/public
COPY --from=builder --chown=appuser:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=appuser:nodejs /app/packages/db/node_modules/.prisma ./packages/db/node_modules/.prisma
COPY --from=builder --chown=appuser:nodejs /app/packages/db/schema.prisma ./packages/db/schema.prisma

# Copy package.json files for proper module resolution
COPY --chown=appuser:nodejs package.json pnpm-workspace.yaml ./
COPY --chown=appuser:nodejs apps/server/package.json ./apps/server/
COPY --chown=appuser:nodejs packages/db/package.json ./packages/db/
COPY --chown=appuser:nodejs packages/shared/package.json ./packages/shared/

USER appuser

# Environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode === 200) process.exit(0); process.exit(1);})"

# Start application
CMD ["node", "apps/server/dist/index.js"]

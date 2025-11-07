# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl openssl-dev

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml ./
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY apps/worker/package.json apps/worker/

# Copy Prisma schema BEFORE install (so postinstall can find it)
COPY packages/db/schema.prisma ./packages/db/schema.prisma

# Install dependencies (postinstall will now find schema)
# Note: No lockfile exists in repo, so we can't use --frozen-lockfile
RUN pnpm install --filter @repo/worker...

# Copy source
COPY packages ./packages
COPY apps/worker ./apps/worker

WORKDIR /app/apps/worker

# Prisma already generated during postinstall, just copy schema for runtime
RUN mkdir -p prisma \
  && cp ../../packages/db/schema.prisma prisma/schema.prisma

FROM node:20-alpine

# Install OpenSSL for Prisma runtime
RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production
WORKDIR /app

# Copy built artifacts and node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/package.json ./

COPY --from=builder /app/apps/worker/index.js ./index.js
COPY --from=builder /app/apps/worker/prisma ./prisma
COPY --from=builder /app/apps/worker/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/worker/node_modules/@prisma ./node_modules/@prisma

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

CMD ["node", "index.js"]

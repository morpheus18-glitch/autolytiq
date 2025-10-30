# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl \
    && corepack enable \
    && corepack prepare pnpm@10.5.2 --activate
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /workspace

FROM base AS builder
WORKDIR /workspace

# Prepare workspace manifests for targeted installs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json ./packages/db/
COPY apps/backend/package.json ./apps/backend/

# Install workspace dependencies including dev dependencies for build
RUN pnpm install \
    --filter @repo/db... \
    --filter @repo/backend... \
    --frozen-lockfile \
    --prod=false

# Copy full workspace
COPY . .

# Copy Prisma schema and generate client
RUN mkdir -p apps/backend/prisma
COPY packages/db/schema.prisma apps/backend/prisma/schema.prisma

WORKDIR /workspace/apps/backend
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/localdb?sslmode=disable"
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm exec prisma generate --schema prisma/schema.prisma

# Build the backend
RUN pnpm run build

# Prune to production dependencies only
WORKDIR /workspace
RUN pnpm --filter @repo/backend --prod deploy /workspace/pruned/backend

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy production dependencies and build artifacts
COPY --from=builder /workspace/pruned/backend/node_modules ./node_modules
COPY --from=builder /workspace/apps/backend/package.json ./package.json
COPY --from=builder /workspace/apps/backend/dist ./dist
COPY --from=builder /workspace/apps/backend/prisma ./prisma

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000
CMD ["node", "dist/index.js"]

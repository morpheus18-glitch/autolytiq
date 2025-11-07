# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json packages/db/
COPY packages/shared/package.json packages/shared/
COPY apps/worker/package.json apps/worker/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @repo/worker...

# Copy source
COPY packages ./packages
COPY apps/worker ./apps/worker

WORKDIR /app/apps/worker

RUN mkdir -p prisma \
  && cp ../../packages/db/schema.prisma prisma/schema.prisma

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autolytiq"
RUN npx prisma generate --schema prisma/schema.prisma

FROM node:20-alpine

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

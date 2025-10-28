# syntax=docker/dockerfile:1.6

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy shared project configuration required for the backend build
COPY tsconfig.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Install dependencies (including devDependencies for Prisma CLI and TypeScript)
RUN npm ci

# Prepare Prisma schema for code generation
RUN mkdir -p prisma \
  && cp ../../packages/db/schema.prisma prisma/schema.prisma

# Prisma requires a DATABASE_URL even when generating the client
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autolytiq"

# Generate Prisma client and build the TypeScript project
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run build

# Production stage
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/apps/backend/package*.json ./
RUN npm ci --omit=dev

# Copy built application and Prisma assets
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/backend/node_modules/@prisma ./node_modules/@prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

CMD ["node", "dist/index.js"]

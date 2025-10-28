# ==================================
# Backend Dockerfile (Multi-stage)
# ==================================

# Stage 1: Dependencies and Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace and package files
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY packages/shared/package*.json ./packages/shared/
COPY apps/server/package*.json ./apps/server/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY packages/ ./packages/
COPY apps/server/ ./apps/server/
COPY tsconfig.json ./

# Generate Prisma Client
RUN cd packages/db && npx prisma generate

# Build TypeScript
RUN cd apps/server && npm run build

# Stage 2: Production Runtime
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY packages/db/package*.json ./packages/db/
COPY packages/shared/package*.json ./packages/shared/
COPY apps/server/package*.json ./apps/server/

RUN npm ci --production --ignore-scripts

# Copy Prisma schema and generate client (production)
COPY packages/db/schema.prisma ./packages/db/
RUN cd packages/db && npx prisma generate

# Copy built application from builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy proto files for gRPC client
COPY services/rust/proto ./services/rust/proto

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 5000

CMD ["node", "apps/server/dist/index.js"]

# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app/apps/backend

# Copy package.json
COPY apps/backend/package.json ./

# Install pnpm
RUN npm install -g pnpm@10.20.0

# Install dependencies (no lockfile in Docker build)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY apps/backend/src ./src
COPY apps/backend/tsconfig.json ./
COPY apps/backend/tsup.config.ts ./

# Build
RUN pnpm build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.20.0

# Copy package.json
COPY apps/backend/package.json ./

# Install production dependencies only
RUN pnpm install --prod

# Copy built files
COPY --from=builder /app/apps/backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]

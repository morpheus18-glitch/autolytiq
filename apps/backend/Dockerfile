# ---------- Build stage ----------
FROM node:20-alpine AS builder

# Prisma needs these on Alpine to generate correctly
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy monorepo bits that backend depends on
COPY tsconfig.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Install deps (expects package-lock.json in apps/backend)
RUN npm ci

# Prisma schema lives in packages/db/schema.prisma -> put it where Prisma expects
RUN mkdir -p prisma \
 && cp ../../packages/db/schema.prisma prisma/schema.prisma

# Provide DATABASE_URL for prisma generate.
# NOTE: This is *build-time only*. Use a dummy default; CI can override via --build-arg.
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/postgres?schema=public"
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma client for Alpine (musl) and build the app
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Only production deps
COPY --from=builder /app/apps/backend/package*.json ./
RUN npm ci --omit=dev

# Ship compiled code + Prisma assets
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/backend/node_modules/@prisma ./node_modules/@prisma

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 \
 && chown -R nodejs:nodejs /app
USER nodejs

# Your server should listen on 5000
EXPOSE 5000

# At runtime your real DATABASE_URL comes from Kubernetes secret envs
CMD ["node", "dist/index.js"]

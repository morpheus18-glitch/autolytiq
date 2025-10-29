# ---------- Build ----------
FROM node:20-alpine AS builder
# Prisma on Alpine needs these
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy only what we need first (better layer caching)
COPY tsconfig.json ./
COPY packages ./packages
COPY apps/backend/package*.json ./apps/backend/
# If you have a prisma schema in packages, we’ll copy the whole backend later anyway.

WORKDIR /app/apps/backend

# Clean install if lockfile exists, else install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Bring in the rest of the source now
WORKDIR /app
COPY apps/backend ./apps/backend

# Put schema where Prisma expects it (adjust if yours already lives in apps/backend/prisma/)
# If your schema is already at apps/backend/prisma/schema.prisma, delete this block.
RUN mkdir -p /app/apps/backend/prisma \
 && if [ -f /app/packages/db/schema.prisma ]; then cp /app/packages/db/schema.prisma /app/apps/backend/prisma/schema.prisma; fi

# Build-time DATABASE_URL is only for prisma generate
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/postgres?schema=public"
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app/apps/backend
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Only production deps
COPY --from=builder /app/apps/backend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Ship compiled code + Prisma assets
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/backend/node_modules/@prisma ./node_modules/@prisma

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 \
 && chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000
CMD ["node", "dist/index.js"]
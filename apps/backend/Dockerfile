# ---------- Build ----------
FROM node:20-alpine AS builder

# Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# 1) Copy only what we need for dependency install (better cache)
COPY apps/backend/package*.json ./apps/backend/
COPY tsconfig.json ./
COPY packages ./packages

WORKDIR /app/apps/backend

# 2) Clean install if lockfile exists, else fallback (monorepo safety)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 3) Put Prisma schema where backend expects it
RUN mkdir -p prisma
COPY packages/db/schema.prisma /app/apps/backend/prisma/schema.prisma

# 4) Generate Prisma client (needs a DATABASE_URL even for codegen)
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/localdb?sslmode=disable"
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate --schema prisma/schema.prisma

# 5) Copy the rest of backend source and build TS
WORKDIR /app
COPY apps/backend ./apps/backend
WORKDIR /app/apps/backend
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Only prod deps in final image
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
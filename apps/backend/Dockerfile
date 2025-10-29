# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

FROM base AS deps
COPY apps/backend/package*.json apps/backend/
WORKDIR /app/apps/backend
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS builder
WORKDIR /app
COPY tsconfig.json ./tsconfig.json
COPY apps/backend/tsconfig.json apps/backend/tsconfig.json
COPY apps/backend/tsup.config.ts apps/backend/tsup.config.ts
COPY apps/backend/scripts apps/backend/scripts
COPY apps/backend/src apps/backend/src
RUN mkdir -p apps/backend/prisma
COPY packages/db/schema.prisma apps/backend/prisma/schema.prisma

WORKDIR /app/apps/backend
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/localdb?sslmode=disable"
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/apps/backend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/backend/node_modules/@prisma ./node_modules/@prisma

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000
CMD ["node", "dist/index.js"]

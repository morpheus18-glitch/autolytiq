# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS builder

WORKDIR /app

COPY packages ./packages
COPY apps/worker ./apps/worker

WORKDIR /app/apps/worker

RUN npm ci

RUN mkdir -p prisma \
  && cp ../../packages/db/schema.prisma prisma/schema.prisma

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autolytiq"
RUN npx prisma generate --schema prisma/schema.prisma

FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/apps/worker/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/apps/worker/index.js ./index.js
COPY --from=builder /app/apps/worker/prisma ./prisma
COPY --from=builder /app/apps/worker/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/worker/node_modules/@prisma ./node_modules/@prisma

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

CMD ["node", "index.js"]

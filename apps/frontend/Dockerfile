# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@10.5.2 --activate
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /workspace

FROM base AS builder
WORKDIR /workspace

# Prepare workspace manifests for targeted installs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/tokens/package.json ./packages/tokens/
COPY apps/frontend/package.json ./apps/frontend/

# Install workspace dependencies with dev tooling for builds
RUN pnpm install \
    --filter @repo/tokens... \
    --filter @repo/frontend... \
    --frozen-lockfile \
    --prod=false

# Copy full workspace
COPY . .

# Build shared tokens before the frontend
RUN pnpm --filter @repo/tokens build

WORKDIR /workspace/apps/frontend
ENV NODE_ENV=production
RUN pnpm run build

FROM nginx:1.27-alpine AS runner
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /workspace/apps/frontend/dist /usr/share/nginx/html

RUN addgroup -g 101 -S nginx-user && \
    adduser -S nginx-user -G nginx-user -u 101 && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html /var/cache/nginx /var/log/nginx && \
    touch /var/run/nginx.pid && chown nginx-user:nginx-user /var/run/nginx.pid

USER nginx-user
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

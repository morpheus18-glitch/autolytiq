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
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY apps/frontend/package.json ./apps/frontend/

# Install workspace dependencies with dev tooling for builds
RUN pnpm install \
    --filter @repo/tokens... \
    --filter @repo/shared... \
    --filter @repo/ui... \
    --filter @repo/frontend... \
    --frozen-lockfile \
    --prod=false

# Copy full workspace
COPY . .

# Build workspace packages in dependency order before the frontend
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/tokens build
RUN pnpm --filter @repo/ui build

WORKDIR /workspace/apps/frontend
ENV NODE_ENV=production
RUN pnpm run build

FROM nginx:1.27-alpine AS runner
COPY apps/frontend/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /workspace/apps/frontend/dist /usr/share/nginx/html

# Use the existing nginx user (UID 101) that comes with the nginx:alpine image
# Ensure proper permissions for nginx directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

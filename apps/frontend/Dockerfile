# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /workspace

FROM base AS builder
WORKDIR /workspace

# Install shared package dependencies
COPY packages/tokens/package*.json ./packages/tokens/
RUN cd packages/tokens && if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Install frontend dependencies
COPY apps/frontend/package*.json ./apps/frontend/
RUN cd apps/frontend && if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy full workspace
COPY . .

# Build shared tokens before the frontend
RUN cd packages/tokens && npm run build

WORKDIR /workspace/apps/frontend
ENV NODE_ENV=production
RUN npm run build

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

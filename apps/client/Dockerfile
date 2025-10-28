# ==================================
# Frontend Dockerfile (Multi-stage)
# ==================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/client/package*.json ./apps/client/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci

# Copy source
COPY apps/client/ ./apps/client/
COPY packages/shared/ ./packages/shared/
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Build production bundle
RUN cd apps/client && npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY apps/client/nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid && \
    # Create necessary directories for nginx
    mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R nginx-user:nginx-user /var/cache/nginx

USER nginx-user

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

# ============================================================
# FILE REVIEW STATUS: ✅ APPROVED - KEEP (with modification)
# Reviewed: 2025-11-08 13:50
# Action: Keep in apps/frontend/ - Updated to remove nginx.conf line
# Reason: Generic build Dockerfile, nginx.conf now comes from k8s ConfigMap
# Reference: See k8s/DEPLOYMENT_GUIDE.md
# ============================================================

# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/tokens/package.json ./packages/tokens/
COPY packages/ui/package.json ./packages/ui/

# Install pnpm
RUN npm install -g pnpm@10.20.0

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY apps/frontend ./apps/frontend
COPY packages/tokens ./packages/tokens
COPY packages/ui ./packages/ui
COPY tailwind.config.ts ./

# Build frontend
WORKDIR /app/apps/frontend
RUN pnpm build

# Production image with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# NOTE: nginx.conf is now provided by k8s ConfigMap at runtime
# See k8s/frontend-configmap.yaml and k8s/DEPLOYMENT_GUIDE.md
# REMOVED LINE: COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

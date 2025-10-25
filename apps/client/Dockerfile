# ---- build ----
FROM node:22-bullseye AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/client/package.json ./apps/client/package.json
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @repo/client build

# ---- serve ----
FROM nginx:alpine
COPY --from=build /app/apps/client/dist /usr/share/nginx/html
# SPA fallback
RUN printf "try_files \$uri /index.html;\n" > /etc/nginx/conf.d/spa.conf
EXPOSE 8080
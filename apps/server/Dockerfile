# ---- build ----
FROM node:22-bullseye AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9 --activate
# copy workspace metadata first (pnpm will hoist/install correctly)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
# copy only packages with manifests to warm cache
COPY packages ./packages
COPY apps/server/package.json ./apps/server/package.json
RUN pnpm install --frozen-lockfile
# now copy full repo and build
COPY . .
RUN pnpm db:generate && pnpm --filter @repo/server build:prod

# ---- runtime ----
FROM node:22-bullseye AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9 --activate
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
COPY --from=build /app/apps/server/dist ./apps/server/dist
# prisma client lives in packages/db/.prisma after generate
COPY --from=build /app/packages ./packages
# only prod deps (optional—kept slim; server has no dev-time deps at runtime)
RUN pnpm install --frozen-lockfile --prod
EXPOSE 8080
CMD ["node", "apps/server/dist/index.js"]
set -euo pipefail

echo "== 1) Prisma: lock schema path & skip postinstall in Docker =="
if [ -f packages/db/package.json ]; then
  jq '. + {prisma:{schema:"prisma/schema.prisma"}} | .scripts.generate="prisma generate --schema prisma/schema.prisma"' \
    packages/db/package.json > packages/db/package.json.tmp && mv packages/db/package.json.tmp packages/db/package.json
fi

# Root postinstall becomes no-op (we’ll revert later)
if [ -f package.json ]; then
  jq '.scripts.postinstall="node -e \"process.exit(0)\"" | .scripts["db:generate"]="pnpm --filter @repo/db generate"' \
    package.json > package.json.tmp && mv package.json.tmp package.json
fi

echo "== 2) Toast: use a single provider from @repo/ui (safe rewrite) =="
# only rewrites imports that reference local toast modules
rg -l "ToastProvider|useToast|Toaster" apps/frontend | \
  xargs -r sed -i "s#from '\\(@repo/ui\\|.*toast.*\\)'#from '@repo/ui'#"

echo "== 3) Rust: bump builder to 1.82 (only if file exists) =="
if [ -f services/rust/Dockerfile.consolidated ]; then
  sed -i 's#^FROM rust:.*-alpine AS builder#FROM rust:1.82-alpine AS builder#' services/rust/Dockerfile.consolidated
fi

echo "== 4) Quick install + generate + build (workspace) =="
pnpm -w install
pnpm --filter @repo/db generate
pnpm -w build

echo "✔ Stabilize patch applied successfully."

#!/bin/bash
# Safe database push wrapper that bypasses bad Prisma env vars
unset PRISMA_MIGRATION_ENGINE_BINARY
unset PRISMA_INTROSPECTION_ENGINE_BINARY  
unset PRISMA_QUERY_ENGINE_BINARY
unset PRISMA_FMT_BINARY

exec npx prisma db push "$@"

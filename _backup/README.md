# Backup Archive - AutolytiQ Rescue Branch
**Archived**: 2025-11-08 01:05 UTC  
**From Branch**: rescue-20251107-180523  
**Reason**: Clean ESM rebuild, contract-first, mobile-ready foundation

## What's Here

This folder contains all files from the rescue branch before the production foundation rebuild.

### Structure:
- `packages/` - Old package implementations
- `apps/` - Previous frontend/backend attempts  
- `docs/` - Historical documentation
- `_garage_*/` - Previous cleanup attempts

## Why Archived

We're rebuilding from scratch with:
1. **True ESM** - No CommonJS gotchas
2. **Contract-First** - OpenAPI + gRPC driving development
3. **Rock-Solid Builds** - UI package DTS generation 100% reliable
4. **Mobile-Ready** - Architecture supports future React Native app
5. **Quality CI/CD** - Automated checks on every commit

## Integration Plan

Files will be slowly integrated back as needed:
- ✅ Design tokens - Migrate to ESM
- ✅ UI components - Rebuild with proper DTS
- ⏸️ Database schemas - Extract minimal 5 tables
- ⏸️ Frontend pages - Rebuild with React Router 6
- ⏸️ Backend routes - Rebuild from OpenAPI contracts

## Retention

- **30 days** - Keep for reference
- **After 30 days** - Archive to tarball or delete

**Do NOT modify files in this folder.** Read-only reference.

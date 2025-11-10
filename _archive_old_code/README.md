# Archived Old Code

This directory contains old code that has been replaced or rewritten from scratch.

## 2025-11-08: Old Frontend Code Archive

**Location**: `2025-11-08_old_frontend/src/`

**Why Archived:**
The entire frontend was archived and restarted from scratch to:
- Remove accumulated technical debt and old patterns
- Build a clean, modern architecture from the ground up
- Implement the new design system properly from the start
- Follow the Factor 1-5 transformation plan outlined in CLAUDE.md

**What Was Archived:**
- 152+ old pages
- 400+ Wouter routes
- All old components, hooks, contexts, features, modules, screens
- Old design tokens and styles
- Mock data and old route configurations

**New Frontend:**
The new frontend starts fresh with:
- Minimal React 18 + Vite setup
- React Router 6 for routing
- Tailwind CSS for styling
- Clean slate to build the proper SPA architecture

**Reference:**
If you need to reference old component logic or patterns:
```bash
# View old code
ls -la _archive_old_code/2025-11-08_old_frontend/src/

# Copy specific files if needed (not recommended)
cp _archive_old_code/2025-11-08_old_frontend/src/path/to/file.tsx apps/frontend/src/
```

## Historical Size
- Old frontend src: ~9,562 LOC across 152+ files
- Archive size: Will be compressed for long-term storage

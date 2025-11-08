# Frontend Files - Complete Individual Review

**Date**: 2025-11-08 13:45
**Location**: apps/frontend/
**Criteria**: All files modified before 01:30 AM (12+ hours ago)
**Status**: ⚠️ **REQUIRES INDIVIDUAL APPROVAL FOR EACH FILE**

---

## ROOT DIRECTORY FILES (11 files)

### ❌ DELETE - File 1: nginx.conf

```
File: apps/frontend/nginx.conf
Modified: 01:48 AM (12 hours ago)
Size: 1.2 KB
```

**Status**: ❌ **DELETE IMMEDIATELY**

**Reason**: Already exists in k8s/frontend-configmap.yaml (see DEPLOYMENT_GUIDE.md)

**Action**:
```bash
rm apps/frontend/nginx.conf
```

**Additional Work Required**: Update Dockerfile (see File 2 below)

---

### ⚠️ UPDATE REQUIRED - File 2: Dockerfile

```dockerfile
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

# Copy nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf  # ❌ THIS LINE NEEDS TO BE REMOVED

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Status**: ⚠️ **UPDATE REQUIRED**

**Problem**: Line 35 references `apps/frontend/nginx.conf` which will be deleted

**Required Changes**:
1. Remove line 35: `COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf`
2. nginx.conf will be provided by Kubernetes ConfigMap at runtime (see k8s/DEPLOYMENT_GUIDE.md)

**Updated Dockerfile Should Be**:
```dockerfile
# Production image with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# nginx.conf will be mounted from k8s ConfigMap at runtime
# No need to copy it here

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**User Decision Needed**:
- [ ] Approve deletion of line 35 from Dockerfile?
- [ ] Keep Dockerfile in apps/frontend/ (generic build)?

---

### ✅ KEEP - File 3: package.json

```json
{
  "name": "@repo/frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "prebuild": "pnpm run build:tokens",
    "build:tokens": "pnpm --filter @repo/tokens build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ignore-pattern 'src/_backup/**'"
  },
  "dependencies": {
    "@repo/tokens": "file:../../packages/tokens",
    "@repo/ui": "workspace:*",
    "@tanstack/react-query": "^5.62.13",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    // ... 30+ dependencies
  }
}
```

**Status**: ✅ **ESSENTIAL - KEEP**

**Reason**: Required for frontend build and dependencies

**User Decision**:
- [x] KEEP (assumed essential)

---

### ✅ KEEP - File 4: vite.config.ts

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "../../docs/resources/assets"),
      "@shared/schema": path.resolve(import.meta.dirname, "../../packages/shared/dist/schema"),
      "@shared/settings-schema": path.resolve(import.meta.dirname, "../../packages/shared/dist/settings-schema"),
      "@repo/tokens": path.resolve(import.meta.dirname, "../../packages/tokens/dist"),
      "@repo/ui": path.resolve(import.meta.dirname, "../../packages/ui/dist"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      maxParallelFileOps: 2,
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('@radix-ui')) return 'radix-vendor';
            if (id.includes('lucide-react') || id.includes('recharts')) return 'viz-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

**Status**: ✅ **ESSENTIAL - KEEP**

**Reason**: Core build configuration for Vite bundler

**User Decision**:
- [x] KEEP (assumed essential)

---

### ✅ KEEP - File 5: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": false,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@repo/tokens": ["../../packages/tokens/src/index.ts"],
      "@repo/ui": ["../../packages/ui/src/index.ts"]
    },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules", "dist", "src/_backup"]
}
```

**Status**: ✅ **ESSENTIAL - KEEP**

**Reason**: TypeScript configuration required for type checking

**User Decision**:
- [x] KEEP (assumed essential)

---

### ✅ KEEP - File 6: tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
const formsPlugin = require('@tailwindcss/forms');
const typographyPlugin = require('@tailwindcss/typography');
const tailwindcssAnimate = require('tailwindcss-animate');

// Import colors from the built tokens package
const { colors } = require('../../packages/tokens/dist/index.js');

module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ...colors,
        primary: colors.accent,
        secondary: colors.blue,
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        // ... semantic color system
      },
      keyframes: {
        'accordion-down': { /* ... */ },
        'fade-in': { /* ... */ },
        // ... custom animations
      },
    },
  },
  plugins: [tailwindcssAnimate, formsPlugin, typographyPlugin],
};
```

**Status**: ✅ **ESSENTIAL - KEEP**

**Reason**: Tailwind CSS configuration integrating @repo/tokens design system

**User Decision**:
- [x] KEEP (assumed essential)

---

### ✅ KEEP - File 7: index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>AutolytiQ - Dealership Management System</title>
    <meta name="description" content="AutolytiQ - Comprehensive dealership management system with AI-powered analytics..." />

    <!-- Security & SSL Meta Tags -->
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'..." />
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="AutolytiQ - Dealership Management System" />
    <meta property="og:url" content="https://autolytiq.com" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Status**: ✅ **ESSENTIAL - KEEP**

**Reason**: SPA entry point with SEO meta tags and security headers

**User Decision**:
- [x] KEEP (assumed essential)

---

### ⚠️ REVIEW - File 8: .env

```env
# Frontend Environment Variables
# Backend API URL - Use server IP for external access
VITE_API_URL=http://134.122.7.75:3000
```

**Status**: ⚠️ **REVIEW REQUIRED**

**Concerns**:
1. Contains hardcoded IP address (134.122.7.75)
2. Using HTTP instead of HTTPS
3. Port 3000 exposed publicly?

**User Decisions Needed**:
- [ ] Is this IP address correct for production?
- [ ] Should this be HTTPS?
- [ ] Should this file exist in git or be .gitignored?
- [ ] Should values come from k8s ConfigMap instead?

**Recommendation**: Consider moving to k8s ConfigMap with environment-specific values

---

### ✅ KEEP - File 9: .env.example

```env
VITE_API_URL=https://api.example.com
VITE_ML_SERVICE_URL=https://ml.example.com
```

**Status**: ✅ **KEEP**

**Reason**: Template for environment variables, safe to commit to git

**User Decision**:
- [x] KEEP

---

### ✅ KEEP - File 10: .eslintignore

```
# Ignore backup directory created during code stripping
src/_backup/

# Standard ignores
dist/
node_modules/
*.config.js
*.config.ts
```

**Status**: ✅ **KEEP**

**Reason**: ESLint ignore configuration, references src/_backup/ archive

**User Decision**:
- [x] KEEP

---

### ✅ KEEP - File 11: eslint.config.js

```javascript
/**
 * ESLint Configuration for AutolytiQ Frontend
 * Enforces component library usage and bans inline Tailwind
 */

export default [
  {
    ignores: ['src/_backup/**', 'dist/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Ban inline className with bg-, text-, border-, rounded-, px-, py-, etc.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXAttribute[name.name="className"] Literal[value=/bg-|text-(?!balance)|border-(?!0)|rounded-|px-|py-|p-|m-|w-(?!full|screen)|h-(?!full|screen)|flex|grid|items-|justify-|gap-/]',
          message: 'Use components from @repo/ui instead of inline Tailwind classes. Import from "@repo/ui".',
        },
      ],

      // Ban direct Radix UI imports
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@radix-ui/*'],
              message: 'Import Radix components from @repo/ui instead of directly from @radix-ui.',
            },
          ],
        },
      ],
    },
  },
];
```

**Status**: ✅ **KEEP**

**Reason**: Enforces design system usage, critical for component library consistency

**User Decision**:
- [x] KEEP

---

## PUBLIC DIRECTORY (1 file)

### ⚠️ REVIEW - File 12: public/aiq-logo.png

```
File: apps/frontend/public/aiq-logo.png
Modified: 00:11 AM
Size: 1.1 MB (1,146,880 bytes)
Format: PNG image
```

**Status**: ⚠️ **REVIEW REQUIRED**

**Concerns**:
1. Very large file size (1.1 MB) for a logo
2. Should be optimized/compressed
3. PNG format - consider WebP for better compression

**User Decisions Needed**:
- [ ] Is this the current logo?
- [ ] Should it be optimized/compressed?
- [ ] Should we create multiple sizes (favicon, mobile, desktop)?
- [ ] Keep or replace?

**Recommendation**: Optimize to < 100 KB or convert to SVG if possible

---

## SRC DIRECTORY

### ✅ ALL CURRENT - Recently Modified (Last 12 hours)

```
src/
├── App.tsx (09:11 AM) - 828 bytes
├── index.css (09:11 AM) - 479 bytes
├── main.tsx (09:11 AM) - 225 bytes
└── vite-env.d.ts (09:11 AM) - 38 bytes
```

**Status**: ✅ **ALL FILES RECENTLY MODIFIED**

**Reason**: All src files were modified within past 12 hours (after 01:30 AM cutoff)

**User Decision**:
- [x] ALL KEEP (all current)

---

## ARCHIVED DIRECTORY

### ✅ KEEP - Archive Directory

```
apps/frontend/_archive_20251107-173529/
```

**Status**: ✅ **KEEP**

**Reason**: Historical reference, properly archived old components (152+ pages)

**User Decision**:
- [x] KEEP (already properly archived)

---

## SUMMARY

| Category | Count | Action |
|----------|-------|--------|
| ❌ Delete | 1 | nginx.conf |
| ⚠️ Update Required | 1 | Dockerfile (remove nginx.conf line) |
| ⚠️ Review Required | 2 | .env, public/aiq-logo.png |
| ✅ Keep (Essential) | 8 | package.json, vite.config.ts, tsconfig.json, tailwind.config.js, index.html, .env.example, .eslintignore, eslint.config.js |
| ✅ Keep (Current) | 4 | All src/*.tsx, src/*.css files |
| ✅ Keep (Archive) | 1 | _archive_20251107-173529/ |

**Total Files Reviewed**: 17

---

## IMMEDIATE ACTIONS REQUIRED

### 1. Delete nginx.conf
```bash
rm apps/frontend/nginx.conf
```
**Reason**: Already in k8s/frontend-configmap.yaml

### 2. Update Dockerfile
Remove line 35:
```dockerfile
# REMOVE THIS LINE:
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
```

### 3. Review .env File
**Decision Needed**:
- Approve hardcoded IP `134.122.7.75:3000`?
- Switch to HTTPS?
- Move to k8s ConfigMap?

### 4. Review Logo File
**Decision Needed**:
- Optimize/compress 1.1 MB → < 100 KB?
- Keep current file?
- Replace with optimized version?

---

## USER APPROVAL CHECKLIST

### Files to DELETE (1)
- [ ] `apps/frontend/nginx.conf` - Already in k8s ConfigMap

### Files to UPDATE (1)
- [ ] `apps/frontend/Dockerfile` - Remove line 35 (nginx.conf copy)

### Files to REVIEW (2)
- [ ] `apps/frontend/.env` - Approve hardcoded IP? Move to k8s?
- [ ] `apps/frontend/public/aiq-logo.png` - Optimize 1.1 MB file?

### Files to KEEP (13)
- [x] All config files (package.json, vite.config.ts, tsconfig.json, tailwind.config.js, index.html, .eslintignore, eslint.config.js, .env.example)
- [x] All src files (App.tsx, index.css, main.tsx, vite-env.d.ts)
- [x] Archive directory (_archive_20251107-173529/)

---

**Generated**: 2025-11-08 13:45
**Status**: ⚠️ **AWAITING USER APPROVAL**
**Next Step**: Review each file individually and provide approval/rejection for each action

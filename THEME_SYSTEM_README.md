# Autolytiq Theme & UI Schema (v1)

**Intent:** Mobile-first, settings-based theme for the Autolytiq platform with *Rebel Luxury* identity—Infrared energy, Cognac prestige, 4px engineered radii, asymmetric signature corner.

---

## Files

### Theme Configuration (`packages/tokens/`)
- **`autolytiq-theme.schema.json`** — Complete JSON Schema 2020-12 for full theme validation and IDE hints
- **`autolytiq-theme.example.json`** — Ready-to-use settings matching the approved Rebel Elite look
- **`tokens.schema.json`** — Strict minimal schema for design tokens only (no layout/components)
- **`tokens.example.json`** — Design tokens example

### Component Configuration (`packages/ui/`)
- **`components.schema.json`** — Component-specific configuration schema
- **`components.example.json`** — Component settings example

**Version**: 1.0.0

---

## Integration (Web React/TS)

### Current Project Structure
Your existing Autolytiq setup already has:
- **`packages/tokens/`** - Design token system (`@repo/tokens`)
- **`packages/ui/`** - Component library with 107+ components (`@repo/ui`)
- **`apps/frontend/`** - React SPA with CSS variables in `index.css`

### Quick Start: Applying the Theme

1. **Theme files are now located at**:
   - `packages/tokens/autolytiq-theme.example.json`
   - `packages/tokens/tokens.example.json`

2. **Transform to CSS variables** at app start (in `apps/frontend/src/main.tsx` or equivalent):
   ```ts
   import settings from '@repo/tokens/autolytiq-theme.example.json';
   import { applyTheme } from '@repo/tokens';

   applyTheme(settings);
   ```

3. **Components consume CSS vars** (already implemented in `apps/frontend/src/index.css`):
   ```css
   :root {
     --background: 0 0% 100%;
     --foreground: 222.2 84% 4.9%;
     --primary: 221.2 83.2% 53.3%;
     /* ... existing CSS variables */
   }
   ```

### Implementation Details

#### `applyTheme()` Function (Create in `packages/tokens/src/index.ts`)
```typescript
export function applyTheme(settings: ThemeSettings) {
  const root = document.documentElement;

  // Flatten palette.* roles to --color-* vars
  Object.entries(settings.palette.surface).forEach(([key, value]) => {
    root.style.setProperty(`--surface-${key}`, value);
  });

  Object.entries(settings.palette.brand).forEach(([key, value]) => {
    root.style.setProperty(`--brand-${key}`, value);
  });

  // Emit motion tokens to --motion-* vars
  root.style.setProperty('--motion-fast', `${settings.motion.duration.fast}ms`);
  root.style.setProperty('--motion-base', `${settings.motion.duration.base}ms`);
  root.style.setProperty('--motion-slow', `${settings.motion.duration.slow}ms`);

  // Expose radius/space as --radius-*, --space-*
  root.style.setProperty('--radius-sm', `${settings.radius.sm}px`);
  root.style.setProperty('--radius-md', `${settings.radius.md}px`);
  root.style.setProperty('--radius-lg', `${settings.radius.lg}px`);

  Object.entries(settings.space).forEach(([key, value]) => {
    root.style.setProperty(`--space-${key}`, `${value}px`);
  });
}
```

---

## Integration (React Native)
- Load JSON and map to a `ThemeContext` (JS constants)
- Use `Pressable` feedback per `motion.ripple` and `components.tile.pressed`
- Reference: React Native won't use CSS vars, but can consume the same JSON

---

## Mapping to Your Existing System

### Current CSS Variables → New Theme Schema

**Your existing `index.css`**:
```css
:root {
  --background: 0 0% 100%;        → palette.surface.canvas
  --foreground: 222.2 84% 4.9%;   → palette.text.primary
  --card: 0 0% 100%;              → palette.surface.layer1
  --primary: 221.2 83.2% 53.3%;   → palette.brand.600
  --muted: 210 40% 96.1%;         → palette.surface.layer2
  --radius: 0.5rem;               → radius.md (4px)
}
```

**New theme provides**:
- `palette.brand.600` → Infrared `#FF4A1C` (your primary action color)
- `palette.accent.500` → Cognac `#C87C4A` (prestige/highlight)
- `palette.surface.canvas` → `#0B0C10` (dark charcoal background)
- `palette.surface.tile` → `#171A20` (card/tile surface)

---

## Versioning
- Bump `$version` in the JSON files for outward-facing changes
- Keep schema `$id` stable for v1; publish v2 on breaking structure changes
- Example: `1.0.0` → `1.1.0` (new colors) vs `2.0.0` (restructured palette)

---

## A11y Requirements
- **AA contrast minimum** (as defined in `a11y.contrast`)
- **Hit target >= 44dp** (mobile-first touch targets)
- **Respect `reduceMotion`** (check `prefers-reduced-motion` media query)

---

## Signature Design Rules (Rebel Luxury Identity)
1. **4px corner radius baseline** (`radius.md: 4`)
2. **One signature corner per tile** (cut/flare) for jailbreak motif
   - See `components.tile.signatureCorner: "bottom-right"`
   - Cut: 6px, Flare: 10px
3. **Infrared → energy, Cognac → prestige**
   - Use Infrared (`#FF4A1C`) for primary actions, alerts, energy
   - Use Cognac (`#C87C4A`) for highlights, prestige, success states
4. **Avoid neon gradients** - Keep contrast high, avoid overly bright/saturated mixes

---

## File Locations Summary

```
/root/autolytiq/
├── THEME_SYSTEM_README.md                     ← This file
├── packages/
│   ├── tokens/
│   │   ├── autolytiq-theme.schema.json        ← Full theme schema
│   │   ├── autolytiq-theme.example.json       ← Complete theme config
│   │   ├── tokens.schema.json                 ← Minimal tokens schema
│   │   ├── tokens.example.json                ← Tokens-only example
│   │   └── src/
│   │       └── index.ts                       ← Add applyTheme() here
│   └── ui/
│       ├── components.schema.json             ← Component settings schema
│       ├── components.example.json            ← Component config example
│       └── src/
│           └── components/                    ← Your 107+ components
└── apps/
    └── frontend/
        └── src/
            ├── main.tsx                       ← Call applyTheme() on startup
            └── index.css                      ← Existing CSS variables
```

---

## Next Steps

1. **Review the theme files** in `packages/tokens/` to see the Rebel Elite color palette
2. **Implement `applyTheme()`** in `packages/tokens/src/index.ts`
3. **Call `applyTheme()`** in `apps/frontend/src/main.tsx` on app startup
4. **Gradually migrate** existing CSS variables to the new theme schema
5. **Use the schemas** for IDE autocomplete and validation

---

**Schema IDs**:
- Theme: `https://autolytiq.dev/schemas/theme/v1/aur-ux.schema.json`
- Tokens: `https://autolytiq.dev/schemas/tokens/v1/schema.json`

**Generated**: 2025-11-08
**Status**: Ready for integration into existing Autolytiq platform

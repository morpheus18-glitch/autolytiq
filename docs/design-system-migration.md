# AutolytiQ Design System Transformation

## Current Design Tokens Analysis

1. **COLOR PALETTE**  
   Primary: `hsl(222, 73%, 52%)`  
   Secondary: `hsl(203, 64%, 46%)`  
   Neutrals: `#F8FAFC` → `#0F172A` with duplicate mid-tones (`150`, `250`, `300` combining blue + gray).  
   Status colors: Success `hsl(145, 52%, 45%)`, Warning `hsl(37, 92%, 50%)`, Danger `hsl(350, 72%, 50%)`, Info `hsl(205, 100%, 45%)`.  
   **Issues found:** Highly saturated accent stack leads to neon gradients, inconsistent gray naming (mixed neutral and grayscale ramps), overlapping sidebar palette with brand colors, and status foreground choices break contrast on dark backgrounds.

2. **TYPOGRAPHY**  
   Font families: Inter + Space Grotesk pairing, JetBrains Mono for code.  
   Font sizes: Responsive object with combined size/line-height pairs (xs–6xl).  
   Font weights: 400/500/600/700/800.  
   Line heights baked into size tokens only.  
   **Issues found:** Dual-heading stack adds visual inconsistency, line-height locked to size prevents modular scale reuse, and weight 800 rarely used but complicates interface rhythm.

3. **SPACING**  
   Scale includes fractional steps (1.5, 2.5, 3.5) plus extended range to `96`.  
   **Issues found:** Large tail extends beyond layout needs, fractional increments not aligned to 4px baseline, and duplicate spacing entries (`0rem` vs `px`).

4. **SHADOWS**  
   Shadows escalate quickly from subtle to dramatic (e.g., modal/64px blur).  
   **Issues found:** High alpha values create heavy overlays, inconsistent naming (mixing size + semantic), and glass effects rely on manual CSS overrides.

5. **BORDERS & RADIUS**  
   Border widths: 0–? (implicitly 1).  
   Radius: 0 → 3xl + full with tight increments.  
   **Issues found:** Overuse of extra-large radii produces soft, mobile-first look; inconsistent default radius (0.75rem) conflicts with component ergonomics.

---

## New System Snapshot
- Tokens centralized at **`/lib/design-tokens.ts`** with enterprise-ready palette, typography, spacing, shadows, borders, layout, animation, and z-index primitives.  
- Tailwind extends from tokens via **`tailwind.config.ts`** ensuring class parity (`bg-background`, `bg-surface-base`, `text-muted-foreground`, etc.) while aligning to the new palette.  
- Global CSS refreshed in **`client/src/index.css`** with professional base styles, reusable `.btn`, `.input`, `.card`, `.badge-*`, and utility helpers.  
- Showcase reference added at **`client/src/pages/DesignShowcase.tsx`** to visualize tokens in context.

---

## Implementation Checklist
1. **Backup & Audit**
   - [ ] Snapshot prior tokens (`client/src/config/design-tokens.ts`) and UI screens.
   - [ ] Note custom color usages (`bg-surface-*`, `text-muted-foreground`, gradients).
2. **Dependencies & Fonts**
   - [x] Tailwind plugins: `@tailwindcss/forms`, `@tailwindcss/typography`, `tailwindcss-animate`.
   - [x] Embed Inter via Google Fonts import.
3. **Token Replacement**
   - [x] Replace tokens with `/lib/design-tokens.ts` and helpers.
   - [x] Point Tailwind at the new source (`tailwind.config.ts`).
   - [x] Refresh global CSS (`client/src/index.css`).
4. **Component Alignment**
   - [ ] Update shared primitives (buttons, inputs, cards, tables, badges, modals) to use `.btn-*`, `.input`, `.card`, `.badge-*` utilities.
   - [ ] Normalize spacing using new scale (prefer multiples of `4`).
   - [ ] Replace ad-hoc gradients with tokenized colors.
5. **Showcase & Documentation**
   - [x] Add `DesignShowcase` gallery page.
   - [x] Distribute this migration guide.
6. **Responsive & Accessibility Validation**
   - [ ] Verify screens: 375px, 768px, 1024px, 1440px, 1920px.
   - [ ] Confirm focus states, keyboard flows, and color contrast (WCAG AA minimum).
   - [ ] Test assistive tech (screen readers) for component semantics.
7. **Performance & Regression Checks**
   - [ ] Ensure font loading does not trigger layout shift (use `display=swap`).
   - [ ] Inspect heavy shadows/modals for GPU overdraw.
   - [ ] Run visual regression or screenshot diff after rollout.

---

## Component Migration Examples (Before ➜ After)

> Use these patterns when refactoring modules. All examples assume `tailwind.config.ts` has been rebuilt with the new tokens.

1. **Primary Button**
```tsx
// Before
<button className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>

// After
<button className="btn-primary">Save</button>
```

2. **Secondary Button**
```tsx
// Before
<button className="border border-gray-300 bg-white text-slate-700 px-4 py-2 rounded-md">Cancel</button>

// After
<button className="btn-secondary">Cancel</button>
```

3. **Ghost Button**
```tsx
// Before
<button className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded">More</button>

// After
<button className="btn-ghost">More</button>
```

4. **Destructive Button**
```tsx
// Before
<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Delete</button>

// After
<button className="btn-danger">Delete</button>
```

5. **Form Input**
```tsx
// Before
<input className="w-full border border-slate-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

// After
<input className="input" />
```

6. **Textarea**
```tsx
// Before
<textarea className="w-full rounded-md border border-gray-300 p-3 shadow-sm" rows={4}></textarea>

// After
<textarea className="input" rows={4}></textarea>
```

7. **Card**
```tsx
// Before
<div className="bg-white p-4 rounded shadow">
  ...
</div>

// After
<div className="card p-6">
  ...
</div>
```

8. **Badge**
```tsx
// Before
<span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
  Active
</span>

// After
<span className="badge-primary">Active</span>
```

9. **Table Header Cell**
```tsx
// Before
<th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">Name</th>

// After
<th className="px-6 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
  Name
</th>
```

10. **Modal Shell**
```tsx
// Before
<div className="fixed inset-0 z-50 bg-black/60">
  <div className="mx-auto mt-24 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
    ...
  </div>
</div>

// After
<div className="fixed inset-0 z-backdrop bg-overlay-backdrop">
  <div className="mx-auto mt-24 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
    ...
  </div>
</div>
```

11. **Toast Notification**
```tsx
// Before
<div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow">
  ...
</div>

// After
<div className="card flex items-center gap-3 px-4 py-3 shadow-base">
  ...
</div>
```

12. **Navigation Sidebar Item**
```tsx
// Before
<button className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
  Dashboard
</button>

// After
<button className="flex items-center gap-3 rounded-lg px-3 py-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
  Dashboard
</button>
```

13. **Data Metric Tile**
```tsx
// Before
<div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
  ...
</div>

// After
<div className="card p-6">
  ...
</div>
```

---

## Migration Playbook

1. **Token Adoption**
   - Replace imports of legacy tokens with `designTokens` helpers where configuration code is required (e.g., theming utilities, design documentation pages).
   - Use `responsiveSpacing()` helper for layout primitives that need breakpoint-aware padding.

2. **Tailwind Alignment**
   - Run `npx tailwindcss -i ./client/src/index.css -o ./dist/output.css --watch` locally to confirm classes compile against new tokens.
   - Audit for deprecated classes (`bg-muted/90`, `bg-surface-dark/70`) and remap to neutral/secondary palettes.

3. **Component Refactors**
   - Convert UI kit components to rely on `.btn-*`, `.input`, `.card`, `.badge-*` classes or direct `text-neutral-*` / `bg-primary-*` tokens.
   - Standardize spacing to `px-4/py-3`, `gap-4`, `p-6` patterns for consistency.
   - Replace gradient overlays with flat neutrals + subtle shadows from the `designTokens.shadows` stack.

4. **Experience QA**
   - Validate interactive states: hover/active/focus for all button variants with keyboard-only navigation.
   - Confirm forms use `@tailwindcss/forms` styles and adjust placeholder contrast if necessary.
   - Run accessibility tooling (axe, Lighthouse) to ensure color contrast meets AA standards.

5. **Documentation & Education**
   - Link the Design Showcase page in internal tooling or route registry for design/QA review.
   - Share this guide and encourage teams to follow the migration examples for future components.

---

## Testing Checklist
- [ ] `pnpm lint` (or workspace equivalent)  
- [ ] `pnpm test` (unit/integration)  
- [ ] `pnpm run typecheck`  
- [ ] Visual smoke test in staging environment  
- [ ] Capture updated design snapshots for product/design review

---

### Need Help?
- Slack: `#design-system` channel for questions.  
- Figma library: update typography styles to Inter/Cal Sans pairing.  
- Accessibility contact: `a11y@autolytiq.com`.

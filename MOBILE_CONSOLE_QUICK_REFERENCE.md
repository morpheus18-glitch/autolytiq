# MOBILE CONSOLE IMPLEMENTATION - QUICK REFERENCE

**Prepared**: 2025-11-09
**Status**: Ready to implement
**Readiness Score**: 85/100

---

## KEY FINDINGS AT A GLANCE

### What Works Out of the Box
- ✅ Tailwind mobile-first breakpoints (`sm: 640px`, `md: 768px`, `lg: 1024px`)
- ✅ 65+ production UI components with CVA variants
- ✅ Mobile detection hooks (`useMobile`, `useBreakpoint`, `useTouchDevice`)
- ✅ Sheet component for bottom overlays
- ✅ Tabs component for navigation
- ✅ Design tokens system (semantic colors, spacing, typography)
- ✅ ESLint enforcement (no inline Tailwind bypass possible)
- ✅ React Router 6 foundation

### What Needs Building
- ⚠️ Mobile route structure (`/home/*` routes)
- ⚠️ Mobile layout wrapper (bottom tab navigation)
- ⚠️ Mobile page components (CustomersMobile, VehiclesMobile, DealsMobile, TasksMobile, ProfileMobile)
- ⚠️ Gesture handlers (optional: swipe, pull-to-refresh)

### What's Optional
- Explicit mobile breakpoint alias (`mobile: 0px` in tailwind config)
- Gesture libraries (if swipe interactions needed)
- Pull-to-refresh component
- Safe area utilities (iOS notch handling)

---

## FILE REFERENCE GUIDE

### Configuration (Don't Touch - Just Reference)
```
/root/autolytiq/tailwind.config.ts          ← Primary Tailwind config
/root/autolytiq/postcss.config.cjs          ← PostCSS plugins
/root/autolytiq/apps/frontend/vite.config.ts ← Vite build config
/root/autolytiq/apps/frontend/tsconfig.json  ← TypeScript paths (@repo/ui, @repo/tokens)
/root/autolytiq/apps/frontend/eslint.config.js ← ESLint rules (enforces @repo/ui usage)
```

### Component Library (Import From Here)
```
/root/autolytiq/packages/ui/src/index.ts           ← Main export barrel (65+ components)
/root/autolytiq/packages/ui/src/components/        ← Individual components
/root/autolytiq/packages/ui/src/hooks/useMobile.ts ← Mobile detection hooks
```

### Frontend App (Build In Here)
```
/root/autolytiq/apps/frontend/src/App.tsx                    ← Add routes here
/root/autolytiq/apps/frontend/src/pages/                     ← Add mobile pages here
/root/autolytiq/apps/frontend/src/contexts/AuthContext.tsx   ← Auth already available
/root/autolytiq/apps/frontend/src/contexts/ThemeContext.tsx  ← Theme already available
```

### Design System (Reference Only)
```
/root/autolytiq/packages/tokens/src/index.ts         ← Color/spacing exports
/root/autolytiq/packages/tokens/src/colors-new.ts    ← Color definitions
/root/autolytiq/packages/tokens/src/tailwind.preset.cjs ← Tailwind preset
```

---

## IMPORT EXAMPLE

```typescript
// BAD - Won't compile (ESLint + enforcement)
<button className="bg-blue-500 px-4 py-2 rounded">Click</button>
import { Button as RadixButton } from '@radix-ui/react-button';

// GOOD - Always do this
import { Button, Input, Select } from '@repo/ui';
import { cn } from '@repo/ui';
import { useMobile } from '@repo/ui';

<Button variant="primary" size="md">Click</Button>
```

---

## QUICK IMPLEMENTATION CHECKLIST

### Phase 1: Route Structure (2-3 days)
- [ ] Add `/home` nested route in App.tsx
- [ ] Create MobileShell layout component
- [ ] Add tab routes: customers, vehicles, deals, tasks, profile
- [ ] Create MobileBottomTabNav component

### Phase 2: Mobile Page Components (5-7 days)
- [ ] CustomersMobile page
- [ ] VehiclesMobile page
- [ ] DealsMobile page
- [ ] TasksMobile page
- [ ] ProfileMobile page

### Phase 3: Mobile Features (5-7 days)
- [ ] Mobile top bar/header component
- [ ] Mobile list items (MobileListItem pattern)
- [ ] Mobile detail view (bottom sheet overlay)
- [ ] Gesture handlers (optional)

### Phase 4: Polish & Testing (2-3 days)
- [ ] Responsive breakpoint testing (< 640px)
- [ ] Touch target sizing (44px minimum)
- [ ] Safe area handling (iOS notch)
- [ ] Dark mode testing
- [ ] Performance optimization

**Total Estimated Time**: 2-3 weeks (80-120 hours)

---

## MOBILE HOOKS QUICK REFERENCE

```typescript
import { 
  useMobile,              // < 768px by default
  useBreakpoint,          // 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide'
  useMobileBreakpoint,    // < 768px (boolean)
  useDesktopBreakpoint,   // >= 1024px (boolean)
  useTouchDevice          // Touch capability (boolean)
} from '@repo/ui';

// Usage examples:
const isMobile = useMobile();
const breakpoint = useBreakpoint();
const showMobileLayout = useMobileBreakpoint();

if (isMobile) {
  return <MobileLayout />;
} else {
  return <DesktopLayout />;
}
```

---

## TAILWIND BREAKPOINTS IN USE

```
Mobile:  0px - 639px   (< sm)
Tablet:  640px - 1023px (sm - lg)
Desktop: 1024px+       (lg+)
```

**Usage in JSX**:
```jsx
{/* Hidden on mobile, visible on sm+ */}
<div className="hidden sm:block">Desktop content</div>

{/* Visible on mobile, hidden on sm+ */}
<div className="sm:hidden">Mobile content</div>

{/* Responsive padding */}
<div className="p-4 sm:p-6 lg:p-8">Content</div>
```

---

## COMPONENT EXAMPLES FOR MOBILE

### Bottom Sheet (Mobile Overlay)
```typescript
import { Sheet } from '@repo/ui';

<Sheet
  open={isOpen}
  onOpenChange={setIsOpen}
  side="bottom"
  title="Customer Details"
>
  {/* Content */}
</Sheet>
```

### Tab Navigation
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui';

<Tabs defaultValue="customers" className="w-full">
  <TabsList className="grid w-full grid-cols-5">
    <TabsTrigger value="customers">Customers</TabsTrigger>
    <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
    <TabsTrigger value="deals">Deals</TabsTrigger>
    <TabsTrigger value="tasks">Tasks</TabsTrigger>
    <TabsTrigger value="profile">Profile</TabsTrigger>
  </TabsList>
  
  <TabsContent value="customers">
    <CustomersMobile />
  </TabsContent>
  {/* ... other tabs ... */}
</Tabs>
```

### Responsive Grid
```typescript
import { ResponsiveGrid } from '@repo/ui';

<ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</ResponsiveGrid>
```

---

## STYLING CHECKLIST FOR MOBILE

### Spacing
- Touch targets: minimum 44px (use `h-11`, `w-11`, or `p-3` equivalent)
- Container padding: `p-4` (16px) on mobile, `p-6` (24px) on desktop
- Use `gap-*` for spacing between elements

### Typography
- Body text: `text-base` (16px) on mobile
- Headings: Use semantic sizes (`text-lg`, `text-xl`, `text-2xl`)
- Avoid text smaller than 12px on mobile

### Colors
- Use semantic colors: `text-text-primary`, `bg-surface-base`, etc.
- Never hardcode hex colors - violates design system

### Layout
- Mobile-first: base styles apply to mobile
- Use `sm:`, `md:`, `lg:` modifiers for larger screens
- Use `flex`, `grid` with `gap-*` for layouts

---

## CRITICAL DO's AND DON'Ts

### DO
- ✅ Use components from `@repo/ui`
- ✅ Use semantic color classes: `text-text-primary`, `bg-accent-primary`
- ✅ Use `cn()` utility to merge classes: `cn('base', condition && 'extra')`
- ✅ Use mobile hooks for responsive logic
- ✅ Test on actual mobile devices (< 640px viewport)

### DON'T
- ❌ Write inline Tailwind classes (ESLint will catch it)
- ❌ Import from `@radix-ui/*` directly (must use `@repo/ui`)
- ❌ Use hardcoded colors instead of semantic tokens
- ❌ Hardcode breakpoint values (use hooks instead)
- ❌ Forget touch target sizing (44px minimum)

---

## TESTING MOBILE LAYOUT

```bash
# Test responsive breakpoints in browser DevTools
# Set viewport to:
# - Mobile: 375px width (iPhone SE)
# - Mobile: 390px width (iPhone 14)
# - Tablet: 768px width (iPad)
# - Desktop: 1024px+ width

# Or use these browser sizes:
# sm breakpoint: 640px
# md breakpoint: 768px
# lg breakpoint: 1024px
```

---

## SUCCESS METRICS

- Readiness: 85/100 (foundation is strong)
- Time: 2-3 weeks
- Effort: 80-120 developer hours
- Components available: 65+
- Mobile hooks: 10+
- Breaking changes: 0 (backward compatible)

---

## NEXT STEPS

1. Read the full reconnaissance report: `/root/autolytiq/MOBILE_CONSOLE_RECONNAISSANCE.md`
2. Review route structure recommendations (Section 4 of report)
3. Review mobile page component patterns (Section 5 of report)
4. Start with Phase 1: Route Structure
5. Daily commits to keep work visible

---

**Questions?** See `/root/autolytiq/MOBILE_CONSOLE_RECONNAISSANCE.md` for detailed analysis.


# Router Comparison & Recommendation for AutolytiQ

## Current Situation
- **Router:** Wouter 3.3.5
- **Routes:** 135+ lazy-loaded routes (393 lines)
- **Architecture:** SPA with role-based access control (RBAC)
- **Needs:** Professional-level routing that works with @repo/ui component library and design tokens

---

## Router Options Comparison

### Option 1: Wouter (Current)
**Size:** 1.8 KB (minified + gzipped)

**Pros:**
- ✅ Extremely lightweight (smallest option)
- ✅ Hook-based API (`useRoute`, `useLocation`, `useParams`)
- ✅ Zero config - works out of the box
- ✅ Already integrated and working
- ✅ Good performance
- ✅ Simple API, easy to learn

**Cons:**
- ❌ No nested routing support (critical for UniformShell with sub-nav)
- ❌ No data loading/loaders (must handle separately)
- ❌ No TypeScript route typesafety
- ❌ No automatic code splitting per route
- ❌ No layout routes or route composition
- ❌ Limited features for complex enterprise apps
- ❌ No route prefetching
- ❌ No search param management utilities

**Rating for Enterprise SaaS:** ⭐⭐⭐☆☆ (3/5)
**Best For:** Simple SPAs, prototypes, small applications

---

### Option 2: React Router 6
**Size:** ~12 KB (minified + gzipped)

**Pros:**
- ✅ Industry standard (used by millions)
- ✅ **Nested routing with layout routes** (perfect for UniformShell)
- ✅ **Data loaders** per route (fetch before render)
- ✅ **Error boundaries** per route
- ✅ **Deferred data** for streaming
- ✅ **Outlet system** for nested components
- ✅ Mature, battle-tested (10+ years)
- ✅ Excellent documentation
- ✅ Large community support
- ✅ **Form handling** built-in
- ✅ **Path params** type inference
- ✅ **Search params** utilities
- ✅ **Automatic scroll restoration**
- ✅ Works seamlessly with any component library

**Cons:**
- ⚠️ Larger bundle size than Wouter (but still small)
- ⚠️ TypeScript route type safety requires manual work
- ⚠️ No automatic code splitting (must use React.lazy)
- ⚠️ Loaders use callbacks, not modern promises

**Rating for Enterprise SaaS:** ⭐⭐⭐⭐⭐ (5/5)
**Best For:** Production enterprise SPAs, complex routing needs, proven reliability

---

### Option 3: TanStack Router
**Size:** ~15 KB (minified + gzipped)

**Pros:**
- ✅ **100% TypeScript-first** with full route type safety
- ✅ **Nested routing with layouts**
- ✅ **Data loaders** with modern async/await
- ✅ **Search param validation** with Zod
- ✅ **Route prefetching** for instant navigation
- ✅ **Code splitting** built-in
- ✅ **Suspense-based** loading
- ✅ **Caching** with TanStack Query integration
- ✅ **Path/search param type inference**
- ✅ Modern API design
- ✅ Built by TanStack team (same as React Query)
- ✅ Developer experience is exceptional

**Cons:**
- ⚠️ Newest option (less battle-tested than RR6)
- ⚠️ Smaller community than React Router
- ⚠️ Slightly larger bundle size
- ⚠️ Requires build-time code generation for types
- ⚠️ More opinionated API
- ⚠️ Learning curve for TypeScript features

**Rating for Enterprise SaaS:** ⭐⭐⭐⭐⭐ (5/5)
**Best For:** TypeScript-heavy apps, maximum type safety, modern architecture

---

## Feature Comparison Table

| Feature | Wouter | React Router 6 | TanStack Router |
|---------|--------|----------------|-----------------|
| **Bundle Size** | 1.8 KB ✅ | 12 KB ⚠️ | 15 KB ⚠️ |
| **Nested Routes** | ❌ | ✅ | ✅ |
| **Layout Routes** | ❌ | ✅ | ✅ |
| **Data Loaders** | ❌ | ✅ | ✅ |
| **TypeScript Safety** | ⚠️ Basic | ⚠️ Manual | ✅ Full |
| **Search Params** | ⚠️ Basic | ✅ Good | ✅ Excellent |
| **Code Splitting** | Manual | Manual | ✅ Built-in |
| **Error Boundaries** | Manual | ✅ Per-route | ✅ Per-route |
| **Route Prefetching** | ❌ | ⚠️ Limited | ✅ Built-in |
| **Suspense Support** | ⚠️ Manual | ✅ | ✅ |
| **Form Handling** | ❌ | ✅ | ✅ |
| **Path Params Types** | ❌ | ⚠️ Manual | ✅ Inferred |
| **Developer Experience** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Community** | Small | Huge | Growing |
| **Maturity** | Stable | Proven | New |
| **Works with @repo/ui** | ✅ | ✅ | ✅ |
| **Works with Design Tokens** | ✅ | ✅ | ✅ |

---

## Recommendation: React Router 6

### ✅ **Winner: React Router 6**

**Why React Router 6?**

1. **Perfect Balance of Features & Reliability**
   - Battle-tested by millions of production apps
   - Has all enterprise features needed (nested routes, loaders, error boundaries)
   - Proven track record (10+ years)

2. **Nested Routing for UniformShell**
   - Your CLAUDE.md explicitly calls for nested routing for the UniformShell
   - RR6's `<Outlet>` pattern is perfect for:
     ```tsx
     <UniformShell>
       <Outlet /> {/* Loads: ListDetailLayout, FullDensityLayout, or FocusStudioLayout */}
     </UniformShell>
     ```

3. **Data Loaders for Professional UX**
   - Load data BEFORE rendering the page (no loading spinners)
   - Example:
     ```tsx
     {
       path: '/customers/:id',
       loader: async ({ params }) => {
         return fetch(`/api/customers/${params.id}`);
       },
       element: <CustomerDetail />,
     }
     ```

4. **Quick Migration from Wouter**
   - Similar API to Wouter (both use `<Route>` and `<Switch>`/`<Routes>`)
   - Migration can be done incrementally
   - Minimal code changes needed

5. **Works Perfectly with @repo/ui**
   - No conflicts with component library
   - Design tokens work transparently
   - `<Link>` component can be styled with your Button component

6. **Industry Standard = Easy Hiring**
   - Every React developer knows React Router
   - No learning curve for new team members
   - Abundant documentation and examples

7. **Performance**
   - 12 KB is negligible in modern apps
   - Built-in optimizations
   - Tree-shaking friendly

---

## Why NOT TanStack Router?

While TanStack Router is excellent, it's **overkill** for your current needs:

- ❌ **Learning Curve:** Requires understanding advanced TypeScript features
- ❌ **Build Complexity:** Needs code generation step for types
- ❌ **Newer:** Less proven in production (released 2023)
- ❌ **Migration:** Bigger rewrite from Wouter
- ❌ **You Already Use TanStack Query:** Adding another TanStack tool increases vendor lock-in

**Verdict:** TanStack Router is amazing for TypeScript-first greenfield projects, but RR6 is the pragmatic choice for migrating your existing app.

---

## Why NOT Stay with Wouter?

Wouter is great for simple apps, but you need:

- ❌ **Nested routes** for your 3-layout system (UniformShell → Content Layouts)
- ❌ **Data loaders** for professional UX (no loading spinners)
- ❌ **Layout routes** for the UniformShell to wrap authenticated pages
- ❌ **Error boundaries** per route for resilience

**Verdict:** Wouter served you well during prototyping, but it's time to graduate to an enterprise router.

---

## Migration Plan: Wouter → React Router 6

### Phase 1: Install & Setup (1-2 hours)
```bash
pnpm add react-router-dom
pnpm remove wouter
```

### Phase 2: Update App.tsx (2-3 hours)
Replace Wouter's `<Switch>`/`<Route>` with RR6's `<Routes>`/`<Route>`

### Phase 3: Convert Routes (3-4 hours)
Convert `routes/index.tsx` to use RR6's nested route structure

### Phase 4: Add Loaders (Optional, 4-6 hours)
Add data loaders to key routes for better UX

### Phase 5: Test & Deploy (2-3 hours)
Test all 135+ routes, verify navigation works

**Total Time:** 12-18 hours (1.5-2 days)

---

## Decision Matrix

| Criteria | Wouter | React Router 6 | TanStack Router |
|----------|--------|----------------|-----------------|
| **Quick Implementation** | ✅ Already done | ✅ 1-2 days | ⚠️ 3-4 days |
| **High Quality** | ⚠️ Limited | ✅ Proven | ✅ Excellent |
| **Professional-Level** | ⚠️ Basic | ✅ Enterprise | ✅ Modern |
| **Works with @repo/ui** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Works with Tokens** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Nested Routing** | ❌ No | ✅ Yes | ✅ Yes |
| **Data Loaders** | ❌ No | ✅ Yes | ✅ Yes |
| **Migration Effort** | - | ⚠️ Medium | ❌ High |
| **Risk** | - | ✅ Low | ⚠️ Medium |

---

## Final Recommendation

### 🏆 **Migrate to React Router 6**

**Rationale:**
1. ✅ **Quick:** 1-2 day migration (your requirement: "quick")
2. ✅ **High Quality:** Battle-tested, enterprise-grade (your requirement: "high quality")
3. ✅ **Professional:** Industry standard, proven reliability (your requirement: "professional-level")
4. ✅ **Works with @repo/ui:** Zero conflicts, seamless integration
5. ✅ **Works with Design Tokens:** No impact on styling system
6. ✅ **Nested Routing:** Required for your 3-layout system (UniformShell + content layouts)
7. ✅ **Low Risk:** Used by millions, well-documented, stable API

**This is the pragmatic, professional choice for AutolytiQ.**

---

## Next Steps

1. **Approve Decision:** Confirm React Router 6 is the choice
2. **Start Migration:** Install RR6, update App.tsx
3. **Convert Routes:** Migrate route definitions to RR6 format
4. **Add Nested Routes:** Implement UniformShell with Outlet
5. **Test:** Verify all 135+ routes work
6. **Deploy:** Push to K8s via GitHub Actions

**Estimated Timeline:** 1.5-2 days of focused work

---

**Prepared by:** Claude Code
**Date:** 2025-11-06
**Status:** Ready for Implementation

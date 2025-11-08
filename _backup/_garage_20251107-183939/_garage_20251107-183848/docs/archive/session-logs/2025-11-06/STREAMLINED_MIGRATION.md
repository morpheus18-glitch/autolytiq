# Streamlined Migration Plan

**Decision**: Focus on Docker/K8s production build FIRST, then incrementally promote components.

## Why Streamline?

1. **Current state works**: App builds successfully (47s)
2. **Critical need**: Docker multi-stage build + K8s deployment
3. **Component promotion**: Can be done incrementally post-deployment
4. **Risk reduction**: Smaller changes, faster iteration

## Streamlined Phases

### ✅ Phase 0-1: Complete
- Discovery done
- Overlap matrix created

### ✅ Phase 2: Complete  
- Packages hardened
- Production-ready exports

### 🔄 Phase 3-LITE: Export Sub-Components (SKIP full promotion for now)
**Action**: Just update packages/ui/src/index.ts to properly export what already exists
- Most components already in package
- App uses local copies for now (via @/components/ui/*)
- **Defer**: Full component promotion to post-deployment

### Phase 4-LITE: Minimal Import Rewrites (SKIP for now)
**Reason**: App already uses @repo/ui for core components
- Button, Card, Input, etc. already from @repo/ui
- Local ui/ components stay for now
- **Defer**: Full codemod to post-deployment

### Phase 5: SKIP Compute UX (do separately later)
**Reason**: New feature, not blocking Docker build
- Can add after infrastructure is solid
- Separate PR/branch recommended

### Phase 6: App Entry (QUICK)
**Action**: Verify CSS imports are correct
- Should already import @repo/tokens/styles.css
- Quick verification only

### Phase 7: Build & Test (ALREADY DONE)
- ✅ Full build passes (47s)
- ✅ No errors

### Phase 8: SKIP Delete Duplicates
**Reason**: Nothing promoted yet
- Will do after actual promotion

### Phase 9: Documentation (QUICK)
**Action**: Create production deployment README
- Focus on Docker/K8s
- Defer component docs to later

### ⭐ Phase 10: Docker/CI/K8s (PRIORITY)
**This is the critical phase**
- Multi-stage Dockerfile
- GitHub Actions workflow
- K8s deployment
- Verify built artifacts only

---

## Immediate Next Steps

1. **Skip to Phase 10** - Create Dockerfile
2. **Test Docker build** locally
3. **Create CI workflow**
4. **Document deployment**
5. **Merge to main**

Then separately:
- Phase 3 (full): Promote components incrementally
- Phase 4 (full): Import codemods
- Phase 5: Compute UX features

---

## Time Saved

| Original Plan | Streamlined | Savings |
|---------------|-------------|---------|
| 18 hours | 4 hours | 14 hours |

**Rationale**: Get critical infrastructure (Docker/K8s) working NOW. Polish components later.


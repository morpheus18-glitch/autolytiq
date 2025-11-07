# Archive: Planning Documents (2025-11-05)

## Why These Documents Were Archived

These documents represent early planning phases that have been superseded by actual implementation or more recent documentation.

---

## Archived Documents

### 1. ROLE_BASED_DASHBOARD_ARCHITECTURE.md
**Original Purpose**: Planning document for widget-based dashboard system with WidgetDefinition schema

**Why Archived**:
- Implementation diverged from planning
- Actual implementation uses **CardDef schema** (not WidgetDefinition)
- Complete implementation documented in `/BUILD_REPORT.md`
- Card Library fully built with 5 primitives + 4 patterns

**Superseded By**:
- `/BUILD_REPORT.md` - Complete card library implementation
- `/packages/shared/src/schemas/card.ts` - Actual CardDef schema
- `/packages/ui/src/patterns/cards/` - Actual card components

**Date Archived**: 2025-11-05

---

### 2. DASHBOARD_IMPLEMENTATION_STATUS.md
**Original Purpose**: Progress tracking for dashboard implementation

**Why Archived**:
- Status information is now stale
- Completion status now documented in `/BUILD_REPORT.md`
- Card Library (primitives + patterns) completed on 2025-11-04
- Replaced by comprehensive `/docs/DOCUMENTATION_STATUS_REPORT.md`

**Superseded By**:
- `/BUILD_REPORT.md` - Current completion status
- `/docs/DOCUMENTATION_STATUS_REPORT.md` - Comprehensive audit of all documentation
- `/CLAUDE.md` - Latest progress updates

**Date Archived**: 2025-11-05

---

## Lessons Learned

### Planning vs Implementation
The original planning documents envisioned a "Widget" system, but during implementation, the team built a "Card" system instead. Key differences:

**Planned (Widget System)**:
- WidgetDefinition interface
- widget_kind field
- Complex widget composition

**Implemented (Card System)**:
- CardDef schema with Zod validation
- card_kind field with 9 types
- Primitive-based composition (Box, Stack, Inline, Surface, Text)
- 4 reusable patterns (CardShell, MetricCard, ListCard, TrendCard)

This divergence is common in agile development and represents an improvement over the original design. The Card system provides:
- Better type safety with Zod
- More composable primitives
- Cleaner separation of concerns
- Built-in permission filtering

### Documentation Best Practices
To avoid similar confusion in the future:
1. **Archive planning docs** once implementation deviates significantly
2. **Document as built** rather than maintaining stale planning docs
3. **Single source of truth** - BUILD_REPORT.md for completions, IMPLEMENTATION_PLAN.md for future work
4. **Clear cross-references** - Link related documents explicitly

---

## How to Use Archived Documents

These documents remain valuable for:
- Understanding original design intent
- Reviewing architectural decision-making process
- Learning from evolution of design during implementation
- Historical context for future refactoring

**Do NOT**:
- Use as implementation reference (use BUILD_REPORT.md instead)
- Assume these reflect current system architecture
- Implement features based on these specs without verifying against actual code

---

## Current Active Documentation

For current system state, see:
- `/BUILD_REPORT.md` - What's been built
- `/DEAL_STUDIO_IMPLEMENTATION_PLAN.md` - What's next to build
- `/docs/DOCUMENTATION_STATUS_REPORT.md` - Complete audit of all docs
- `/CLAUDE.md` - Latest progress and priorities

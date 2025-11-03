# Seed Modules

**Status:** 🚧 In Progress - Refactoring from monolithic seed.ts

This directory contains modular, maintainable seed functions for database initialization.

---

## Structure

```
seed/
├── config.ts              # Seed configuration constants
├── index.ts               # Central exports
├── data/                  # Static data definitions
│   ├── glAccounts.ts     # Chart of accounts
│   └── workflowStages.ts # Default CRM workflow stages
├── seeders/               # Modular seed functions
│   └── seedTenant.ts     # Tenant & store seeding (✅ COMPLETE)
└── utils/                 # Helper functions
```

---

## Usage

### Current (Monolithic)
```typescript
// packages/db/seed.ts - 2510 lines, hard to maintain
await main();
```

### Target (Modular)
```typescript
import * as seeders from './seed';

const { tenant, store } = await seeders.seedTenant(prisma);
const users = await seeders.seedUsers(prisma, tenant.id, store.id);
const lenders = await seeders.seedLenders(prisma, tenant.id);
// ... etc
```

---

## Progress

### ✅ Completed Modules

| Module | Lines | Status | Description |
|--------|-------|--------|-------------|
| `config.ts` | 39 | ✅ | Configuration constants |
| `data/glAccounts.ts` | 46 | ✅ | Chart of accounts |
| `data/workflowStages.ts` | 44 | ✅ | CRM workflow stages |
| `seeders/seedTenant.ts` | 160 | ✅ | Tenant & store creation |

**Total:** 289 lines in modular structure

### 🚧 In Progress

- Extracting user seeding logic
- Creating lender seeder
- Extracting customer generation

### 📋 To Do

- [ ] `seeders/seedUsers.ts` - User creation (~400 lines expected)
- [ ] `seeders/seedLenders.ts` - Lender setup (~200 lines expected)
- [ ] `seeders/seedWorkflows.ts` - Workflow definitions (~200 lines expected)
- [ ] `seeders/seedCustomers.ts` - Customer generation (~300 lines expected)
- [ ] `seeders/seedLeads.ts` - Lead generation (~200 lines expected)
- [ ] `seeders/seedVehicles.ts` - Vehicle inventory (~300 lines expected)
- [ ] `seeders/seedDeals.ts` - Deal/Worksheet creation (~300 lines expected)
- [ ] `seeders/seedActivities.ts` - Activities, appointments, communications (~300 lines expected)
- [ ] `seeders/seedFinancials.ts` - Financial records (~200 lines expected)
- [ ] Update main `seed.ts` to use modules (~100 lines expected)

**Target:** ~2,900 lines in organized modules vs 2,510 lines monolithic
(Slightly more lines, but infinitely more maintainable!)

---

## Benefits of Modular Structure

✅ **Maintainability** - Each seeder is 100-300 lines max
✅ **Testability** - Can test each seeder independently
✅ **Reusability** - Can seed specific entities for testing
✅ **Clear Dependencies** - Explicit parameter passing
✅ **Better Performance** - Can parallelize independent seeders
✅ **Easier Debugging** - Errors point to specific module
✅ **Team Friendly** - Multiple developers can work simultaneously

---

## Development Guidelines

### Creating a New Seeder

1. **File naming:** Use `seed<Entity>.ts` (e.g., `seedUsers.ts`)
2. **Export name:** Match filename (e.g., `export async function seedUsers()`)
3. **First parameter:** Always `prisma: PrismaClient`
4. **Dependencies:** Pass as explicit parameters
5. **Return value:** Return created entities for downstream seeders
6. **Console logging:** Use emoji prefix (e.g., `👥 Seeding users...`)
7. **Error handling:** Let errors bubble up to main()

### Example Seeder Template

```typescript
/**
 * <Entity> Seeder
 * <Brief description>
 */

import { PrismaClient } from '@prisma/client';

export async function seedEntity(
  prisma: PrismaClient,
  tenantId: string,
  // ... other dependencies
) {
  console.log('\n<emoji> Seeding <entity>...');

  // Seeding logic here

  console.log(`  ✓ Created X <entities>`);
  return entities;
}
```

---

## Testing

```bash
# Test individual seeder (future)
pnpm test seed/seeders/seedTenant.test.ts

# Run full seed
pnpm db:seed
```

---

## References

- [Original seed.ts](../seed.ts) - Monolithic version (2510 lines)
- [Analysis Document](../../docs/fixes/PRISMA_ENGINE_AND_SEED_ANALYSIS.md)
- [Prisma Seeding Guide](https://www.prisma.io/docs/guides/database/seed-database)

---

**Last Updated:** 2025-11-03
**Refactoring Progress:** 12% complete (1 of 10+ seeders)

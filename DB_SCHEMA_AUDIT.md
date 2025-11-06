# Database Schema Audit

**Generated**: 2025-11-06  
**ORM**: Prisma 5.22.0  
**Database**: PostgreSQL (DigitalOcean Managed)

---

## Schema Location

**File**: `packages/db/schema.prisma`  
**Models**: 80+ (Customer, Vehicle, Deal, Lead, User, Tenant, etc.)  
**Migrations**: `packages/db/migrations/` (20 migrations found)

---

## Prisma Commands

```bash
# Generate Prisma Client
pnpm --filter @repo/db prisma generate

# Create migration
pnpm --filter @repo/db prisma migrate dev --name <migration_name>

# Deploy migrations (production)
pnpm --filter @repo/db prisma migrate deploy

# Check migration status
pnpm --filter @repo/db prisma migrate status

# Reset database (DEV ONLY!)
pnpm --filter @repo/db prisma migrate reset

# Prisma Studio (GUI)
pnpm --filter @repo/db prisma studio
```

---

## Migration Status

**Pending Migrations**: Check with `prisma migrate status`

**Recommended Approach**:
1. Run migrations via Kubernetes Job (see K8S_READINESS.md)
2. Or use init container in backend deployment
3. Never run migrations from local machine in production

---

## Connection Strings

### Development
```
DATABASE_URL="postgresql://user:password@localhost:5432/autolytiq_dev?schema=public"
```

### Production (DigitalOcean)
```
DATABASE_URL="postgresql://<user>:<password>@<host>:25060/autolytiq?sslmode=require"
```

Stored in Kubernetes secret: `database-secret`

---

## Multitenancy

**Strategy**: Tenant ID on every model

```prisma
model Vehicle {
  id        String   @id @default(cuid())
  tenantId  String   @map("tenant_id")
  vin       String
  // ...
  
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  
  @@index([tenantId, vin])
  @@map("vehicles")
}
```

**Enforcement**: Middleware in `apps/backend/src/middleware/tenant.ts`

---

## Seed Data

**Location**: `packages/db/seed/`

```bash
pnpm --filter @repo/db prisma db seed
```

---

## Backup Strategy

**DO Managed Postgres**: Automatic daily backups  
**Retention**: 7 days  
**Point-in-time recovery**: Available

**Manual Backup**:
```bash
pg_dump $DATABASE_URL > backup.sql
```

---

## Indexes

**Critical Indexes** (verify in schema):
- `[tenantId, status]` on most models
- `[tenantId, createdAt]` for time-series queries
- `[vin]` unique on Vehicle
- `[email]` unique on Customer per tenant

**Action**: Audit schema.prisma for missing indexes


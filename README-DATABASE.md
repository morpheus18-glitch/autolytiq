# Automotive CRM/DMS Database Guide

This document describes the multi-tenant PostgreSQL database that powers the automotive CRM/DMS platform. The stack uses Prisma ORM with row-level security to guarantee tenant isolation.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+ for caching/session storage
- `psql` client for manual operations

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` – primary Prisma connection string
- `DIRECT_URL` – direct connection for migrations
- `SHADOW_DATABASE_URL` – used by Prisma for schema diffing
- `REDIS_URL` – Redis connection string
- `SESSION_SECRET`, `JWT_SECRET` – security secrets

## Installation

```bash
npm install
```

## Prisma Tooling

The project ships with helper scripts:

```bash
npm run prisma:generate   # Generate Prisma client
npm run prisma:migrate    # Create and apply migrations
npm run prisma:seed       # Seed database with demo data
```

The `package.json` contains a Prisma seed configuration that runs `tsx prisma/seed.ts`.

## Migrations

1. Ensure your PostgreSQL server is running and accessible via `DATABASE_URL`.
2. Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Apply the row-level security policies:

```bash
psql "$DATABASE_URL" -f prisma/migrations/add-rls.sql
```

The initial schema definition is stored in `prisma/migrations/00000000000000_init/migration.sql` for reference.

### Row-Level Security

RLS is enabled on every tenant-scoped table. Before executing tenant-specific queries you must set the custom PostgreSQL GUC:

```sql
SET app.current_tenant = '<tenant-id>';
```

The Prisma middleware also injects `tenantId` filters into queries to ensure isolation at the application layer.

## Seeding

Populate the database with realistic demo data:

```bash
npm run prisma:seed
```

The seed script creates:

- 3 demo dealerships (tenants)
- 10 users per tenant covering admin, management, sales, finance, and service roles
- 50 customers per tenant with 100+ interactions and realistic lead states
- 30 inventory vehicles with aging data and vehicle history
- 20 deals per tenant covering pending, delivered, cancelled, and F&I heavy scenarios
- Balanced journal entries, commissions, notifications, reports, audit logs, and system settings

## Common Queries

Below are examples that exercise the database design. Replace `:tenantId` and other parameters with real values.

```sql
-- 1. Hot leads for a salesperson
SELECT *
FROM "Customer"
WHERE "tenantId" = :tenantId
  AND "leadStatus" = 'HOT'
  AND "assignedToUserId" = :userId
ORDER BY "leadScore" DESC;

-- 2. Available vehicles aged more than 30 days
SELECT "id", "make", "model", "year", "daysInStock"
FROM "Vehicle"
WHERE "tenantId" = :tenantId
  AND "status" = 'AVAILABLE'
  AND "daysInStock" > 30
ORDER BY "daysInStock" DESC;

-- 3. Deals pending approval with profit greater than $5,000
SELECT "dealNumber", "totalGross"
FROM "Deal"
WHERE "tenantId" = :tenantId
  AND "status" = 'PENDING'
  AND "totalGross" > 5000;

-- 4. Total gross profit by salesperson for the current month
SELECT u."id", u."firstName", u."lastName", SUM(d."totalGross") AS "gross"
FROM "Deal" d
JOIN "User" u ON u."id" = d."salesPersonId"
WHERE d."tenantId" = :tenantId
  AND date_trunc('month', d."dealDate") = date_trunc('month', NOW())
GROUP BY u."id", u."firstName", u."lastName";

-- 5. Customer lifetime value with deal history
SELECT c."id", c."firstName", c."lastName", c."lifetimeValue", json_agg(d.*) AS deals
FROM "Customer" c
LEFT JOIN "Deal" d ON d."customerId" = c."id"
WHERE c."tenantId" = :tenantId
GROUP BY c."id";

-- 6. Aged inventory grouped by make/model
SELECT "make", "model", COUNT(*) AS count, AVG("daysInStock") AS avg_days
FROM "Vehicle"
WHERE "tenantId" = :tenantId
  AND "status" = 'AVAILABLE'
  AND "daysInStock" > 30
GROUP BY "make", "model";

-- 7. Commission report for salespeople
SELECT u."firstName", u."lastName", c."amount", c."status"
FROM "Commission" c
JOIN "User" u ON u."id" = c."userId"
WHERE c."tenantId" = :tenantId;

-- 8. Verify journal entries balance
SELECT je."id"
FROM "JournalEntry" je
JOIN "JournalEntryLine" jel ON jel."journalEntryId" = je."id"
WHERE je."tenantId" = :tenantId
GROUP BY je."id"
HAVING ABS(SUM(CASE WHEN jel."type" = 'DEBIT' THEN jel."amount" ELSE -jel."amount" END)) < 0.01;

-- 9. Interactions with upcoming follow-ups
SELECT *
FROM "CustomerInteraction"
WHERE "tenantId" = :tenantId
  AND "scheduledAt" > NOW()
  AND "completedAt" IS NULL
ORDER BY "scheduledAt" ASC;

-- 10. Full-text search customers
SELECT "id", "firstName", "lastName", "email"
FROM "Customer"
WHERE "tenantId" = :tenantId
  AND "search_vector" @@ plainto_tsquery('english', :term);
```

## Backup Procedure

Use the provided script to generate logical backups:

```bash
chmod +x scripts/db-backup.sh
DATABASE_URL="postgres://..." BACKUP_DIR=./backups ./scripts/db-backup.sh
```

If `S3_BUCKET` is provided the script uploads the backup using the AWS CLI.

## Maintenance Tasks

`scripts/db-maintenance.ts` recalculates key metrics and archives old data.

```bash
npx tsx scripts/db-maintenance.ts
```

Tasks performed:

- Recalculate `daysInStock` for inventory
- Refresh customer lifetime value
- Soft-delete interactions older than two years
- Run `VACUUM ANALYZE` (best effort)

Schedule this script via cron or a workflow engine to keep derived data consistent.

## Performance Tips

- Keep `app.current_tenant` set for all connections to allow RLS to short-circuit queries.
- Monitor query plans for full-text searches and adjust the search vectors if new attributes become important.
- Use Redis to cache heavy reports (inventory aging, sales dashboards) per tenant.
- Review indexes periodically; the Prisma schema includes composite indexes for the most common filters but workload-specific adjustments may be necessary.

## Alternative Multi-Tenancy Approaches

Two other approaches are documented for consideration:

1. **Schema-per-tenant** – Each dealership uses a dedicated PostgreSQL schema. This increases isolation but complicates migrations and pooling. You would provision schemas on tenant signup and run migrations across all schemas.
2. **Database-per-tenant** – Maximum isolation and easiest per-tenant backups. Suitable for enterprise clients with strict compliance requirements, but incurs higher infrastructure costs and operational overhead.

These alternatives are not implemented in code but can be adopted if business requirements evolve.

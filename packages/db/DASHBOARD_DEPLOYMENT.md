# Dashboard System - Database Deployment Guide

## Overview

This guide covers deploying the role-based customizable dashboard system to the Autolytiq database. The dashboard system consists of:

- **3 New Database Tables**: `dashboard_layouts`, `widget_definitions`, `user_widget_preferences`
- **3 New Enums**: `WidgetCategory`, `WidgetType`, `WidgetSize`
- **32 Widget Definitions**: Pre-seeded widget catalog for all roles
- **7 Role-Based Dashboards**: SALES, SERVICE, FINANCE, ACCOUNTING, INVENTORY, DEVELOPER, ADMIN

---

## Database Changes

### New Tables

#### 1. `dashboard_layouts`
Stores user-customized dashboard layouts per role.

```sql
CREATE TABLE "dashboard_layouts" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "role" "UserRole",
    "is_default" BOOLEAN DEFAULT false,
    "layout" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "dashboard_layouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "dashboard_layouts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
);
```

#### 2. `widget_definitions`
Catalog of all available dashboard widgets.

```sql
CREATE TABLE "widget_definitions" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "WidgetCategory" NOT NULL,
    "type" "WidgetType" NOT NULL,
    "default_size" "WidgetSize" NOT NULL,
    "min_size" "WidgetSize" NOT NULL,
    "max_size" "WidgetSize" NOT NULL,
    "permissions" TEXT[],
    "data_source" TEXT NOT NULL,
    "refresh_interval" INTEGER,
    "config_schema" JSONB,
    "component_path" TEXT NOT NULL,
    "icon" TEXT,
    "active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
```

#### 3. `user_widget_preferences`
User-specific preferences for individual widgets.

```sql
CREATE TABLE "user_widget_preferences" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "widget_key" TEXT NOT NULL,
    "config" JSONB,
    "hidden" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_widget_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
```

### New Enums

```sql
CREATE TYPE "WidgetCategory" AS ENUM ('SALES', 'SERVICE', 'FINANCE', 'ACCOUNTING', 'INVENTORY', 'ANALYTICS', 'ADMIN', 'DEVELOPER');
CREATE TYPE "WidgetType" AS ENUM ('METRIC', 'LIST', 'CHART', 'CALENDAR', 'TABLE', 'CUSTOM');
CREATE TYPE "WidgetSize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'WIDE', 'FULL');
```

---

## Deployment Instructions

### Step 1: Run Database Migration

The migration file is located at:
```
/root/autolytiq/packages/db/migrations/20251105_add_dashboard_tables/migration.sql
```

#### Option A: Using Prisma (Recommended for Kubernetes)

```bash
cd /root/autolytiq/packages/db

# Apply migration
npx prisma migrate deploy

# Verify tables were created
npx prisma db pull
```

#### Option B: Manual SQL Execution (Alternative)

```bash
# Connect to PostgreSQL
psql -U <username> -d autolytiq

# Run migration
\i migrations/20251105_add_dashboard_tables/migration.sql

# Verify tables
\dt dashboard_*
\dt widget_*
\dT+ Widget*
```

### Step 2: Seed Widget Definitions

After the migration runs successfully, seed the widget definitions:

```bash
cd /root/autolytiq/packages/db

# Run seed script (includes widget definitions)
npx tsx seed.ts

# Or run just widget definitions seeder
npx tsx -e "import { PrismaClient } from '@prisma/client'; import { seedWidgetDefinitions } from './seed/seeders/seedWidgetDefinitions'; const prisma = new PrismaClient(); seedWidgetDefinitions(prisma).then(() => prisma.$disconnect());"
```

**Expected Output:**
```
📊 Seeding widget definitions...
  ✓ Created 32 widget definitions
  Widget breakdown by category:
    - SALES: 5 widgets
    - SERVICE: 4 widgets
    - FINANCE: 5 widgets
    - ACCOUNTING: 4 widgets
    - INVENTORY: 5 widgets
    - ANALYTICS: 3 widgets
    - ADMIN: 4 widgets
    - DEVELOPER: 4 widgets
```

### Step 3: Verify Deployment

```bash
# Check widget definitions
npx prisma studio

# Navigate to widget_definitions table
# Should see 32 records

# Check enums
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'WidgetCategory'::regtype;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'WidgetType'::regtype;
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'WidgetSize'::regtype;
```

---

## Kubernetes Deployment

### Environment Variables

Ensure the following environment variables are set in your Kubernetes deployment:

```yaml
# packages/db deployment
env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: autolytiq-db-secrets
        key: database-url
  - name: DIRECT_URL
    valueFrom:
      secretKeyRef:
        name: autolytiq-db-secrets
        key: direct-url
```

### Migration Job

Create a Kubernetes Job to run migrations on deployment:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: autolytiq-db-migration-dashboard
  namespace: autolytiq
spec:
  template:
    spec:
      containers:
      - name: prisma-migrate
        image: autolytiq/db:latest
        command:
          - npx
          - prisma
          - migrate
          - deploy
        env:
          - name: DATABASE_URL
            valueFrom:
              secretKeyRef:
                name: autolytiq-db-secrets
                key: database-url
        workingDir: /app/packages/db
      restartPolicy: OnFailure
  backoffLimit: 3
```

### Seed Job (One-Time)

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: autolytiq-db-seed-widgets
  namespace: autolytiq
spec:
  template:
    spec:
      containers:
      - name: prisma-seed
        image: autolytiq/db:latest
        command:
          - npx
          - tsx
          - seed.ts
        env:
          - name: DATABASE_URL
            valueFrom:
              secretKeyRef:
                name: autolytiq-db-secrets
                key: database-url
        workingDir: /app/packages/db
      restartPolicy: Never
```

---

## Rollback Instructions

If you need to rollback the dashboard tables:

```sql
-- Drop tables (cascades to delete all data)
DROP TABLE IF EXISTS "user_widget_preferences" CASCADE;
DROP TABLE IF EXISTS "dashboard_layouts" CASCADE;
DROP TABLE IF EXISTS "widget_definitions" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "WidgetSize";
DROP TYPE IF EXISTS "WidgetType";
DROP TYPE IF EXISTS "WidgetCategory";
```

**⚠️ WARNING:** This will permanently delete all dashboard layouts and widget preferences.

---

## Post-Deployment Verification

### 1. Check Table Counts

```sql
SELECT
  (SELECT COUNT(*) FROM dashboard_layouts) as layouts,
  (SELECT COUNT(*) FROM widget_definitions) as widgets,
  (SELECT COUNT(*) FROM user_widget_preferences) as preferences;
```

Expected initial state:
- `layouts`: 0 (users create their own)
- `widgets`: 32 (pre-seeded)
- `preferences`: 0 (users customize as needed)

### 2. Test Widget Retrieval

```sql
-- Get all available widgets for SALES role
SELECT key, name, category, type, default_size, permissions
FROM widget_definitions
WHERE category = 'SALES' AND active = true;
```

### 3. Test API Endpoints

```bash
# Get default layout for SALES role
curl -X GET http://localhost:3000/api/dashboard/layout?role=SALES \
  -H "Authorization: Bearer <token>"

# Expected response:
{
  "data": {
    "layout": {
      "columns": 4,
      "widgets": [
        {"id": "w1", "key": "active-deals", "position": {"x": 0, "y": 0}, "size": {"w": 2, "h": 2}},
        {"id": "w2", "key": "today-appointments", "position": {"x": 2, "y": 0}, "size": {"w": 2, "h": 1}},
        ...
      ]
    },
    "isDefault": true
  }
}
```

---

## Widget Catalog

### By Category

**SALES (5 widgets):**
- `active-deals` - Current deals in progress
- `hot-leads` - High-priority leads
- `today-appointments` - Today's appointments
- `pending-tasks` - Pending tasks
- `sales-leaderboard` - Sales performance

**SERVICE (4 widgets):**
- `service-appointments` - Service appointments
- `active-service-orders` - Active service orders
- `bay-status` - Service bay status
- `parts-inventory` - Parts inventory

**FINANCE (5 widgets):**
- `fi-pipeline` - F&I pipeline
- `pending-approvals` - Credit approvals
- `fi-products-sold` - F&I products sold
- `profit-per-deal` - Profit metrics
- `lender-performance` - Lender performance

**ACCOUNTING (4 widgets):**
- `daily-revenue` - Daily revenue
- `cash-flow` - Cash flow
- `pending-payments` - Pending payments
- `expense-tracking` - Expense tracking

**INVENTORY (5 widgets):**
- `vehicle-inventory` - Vehicle inventory
- `aging-inventory` - Aging analysis
- `pricing-alerts` - Pricing alerts
- `trade-appraisals` - Trade appraisals
- `inventory-value` - Total inventory value

**ANALYTICS (3 widgets):**
- `sales-pipeline` - Sales pipeline
- `conversion-rate` - Conversion rate
- `customer-satisfaction` - Customer satisfaction

**ADMIN (4 widgets):**
- `dealership-overview` - Dealership KPIs
- `user-activity` - User activity
- `system-health` - System health
- `integration-status` - Integration status

**DEVELOPER (4 widgets):**
- `api-performance` - API performance
- `error-logs` - Recent errors
- `background-jobs` - Background jobs
- `database-stats` - Database statistics

---

## Troubleshooting

### Issue: Migration fails with "enum already exists"

**Solution:**
```sql
-- Check if enums exist
SELECT typname FROM pg_type WHERE typname LIKE 'Widget%';

-- If they exist, skip enum creation or drop and recreate
DROP TYPE IF EXISTS "WidgetSize" CASCADE;
DROP TYPE IF EXISTS "WidgetType" CASCADE;
DROP TYPE IF EXISTS "WidgetCategory" CASCADE;
```

### Issue: Foreign key constraint fails

**Solution:**
Ensure `users` and `tenants` tables exist before running migration:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'tenants');
```

### Issue: Seed fails with "widget definitions already exist"

**Solution:**
The seeder is idempotent and will skip if widgets exist. To re-seed:
```sql
DELETE FROM widget_definitions;
-- Then re-run seed script
```

---

## Support

For issues or questions:
1. Check logs: `kubectl logs -n autolytiq -l app=autolytiq-db`
2. Check Prisma schema: `/root/autolytiq/packages/db/schema.prisma`
3. Review architecture: `/root/autolytiq/ROLE_BASED_DASHBOARD_ARCHITECTURE.md`

---

## Next Steps

After successful deployment:
1. ✅ Dashboard tables created
2. ✅ 32 widgets seeded
3. ⏭️ Frontend dashboard routes active
4. ⏭️ Users can customize their dashboards
5. ⏭️ Build remaining 10+ widgets from roadmap
6. ⏭️ Implement drag-and-drop layout editor (Phase 2)

---

**Last Updated:** 2025-11-05
**Migration Version:** 20251105_add_dashboard_tables
**Database Package:** @repo/db
**Deployment Target:** Kubernetes

import { Prisma, PrismaClient } from '@prisma/client';
import { withTenant } from '../src/lib/tenant-context.js';

const prisma = new PrismaClient();

const TENANTED_MODELS: Prisma.ModelName[] = [
  'User',
  'Customer',
  'CustomerInteraction',
  'CustomerVehicle',
  'Vehicle',
  'VehicleHistory',
  'Deal',
  'DealDocument',
  'GLAccount',
  'JournalEntry',
  'JournalEntryLine',
  'Commission',
  'Report',
  'Notification',
  'AuditLog',
  'SystemSetting',
];

async function backfillTenantIds() {
  for (const model of TENANTED_MODELS) {
    const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "${model}" WHERE "tenantId" IS NULL LIMIT 50`,
    );

    if (rows.length > 0) {
      console.warn(`[WARN] ${model}: ${rows.length} rows missing tenantId`);
    }
  }
}

async function promoteDevelopersToSuperAdmin() {
  const admins = await prisma.user.findMany({
    where: { permissions: { path: '$[*]', array_contains: 'developer' } },
  });

  for (const admin of admins) {
    if (!admin.isSuperAdmin) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { isSuperAdmin: true },
      });
      console.log(`[INFO] Promoted ${admin.email} to super-admin`);
    }
  }
}

async function validateTenantDistribution() {
  const emptyModels: Array<{ model: string; count: number }> = [];

  for (const model of TENANTED_MODELS) {
    const counts = await prisma.$queryRawUnsafe<{ tenantId: string; total: number }[]>(
      `SELECT "tenantId", COUNT(*) as total FROM "${model}" GROUP BY "tenantId"`,
    );

    if (counts.length === 0) {
      emptyModels.push({ model, count: 0 });
    }
  }

  if (emptyModels.length > 0) {
    console.warn('[WARN] Models lacking tenant data:', emptyModels);
  } else {
    console.log('[OK] All tenant-scoped models contain records');
  }
}

async function migrateLegacySettingsSchema() {
  const legacySettings = await prisma.$queryRawUnsafe<
    { tenantid: string; key: string; value: unknown; updatedby: string | null }[]
  >('SELECT * FROM "SystemSetting" WHERE "updatedBy" IS NULL');

  for (const row of legacySettings) {
    await withTenant(
      { tenantId: row.tenantid, userId: row.updatedby ?? undefined },
      async () => {
        await prisma.systemSetting.updateMany({
          where: { tenantId: row.tenantid, key: row.key },
          data: { value: row.value, updatedAt: new Date() },
        });
      },
    );
  }
}

async function main() {
  console.log('--- AutolytiQ Consolidation ---');

  await backfillTenantIds();
  await promoteDevelopersToSuperAdmin();
  await validateTenantDistribution();
  await migrateLegacySettingsSchema();

  console.log('Consolidation checks complete.');
}

main()
  .catch((error) => {
    console.error('Consolidation failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

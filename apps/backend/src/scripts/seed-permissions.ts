/**
 * Seed script to populate permission definitions and role presets
 * Run this after database migration to initialize the permission system
 */

import { PrismaClient } from '@prisma/client';
import { PERMISSIONS, ROLE_PRESETS } from '../config/permissions';

const prisma = new PrismaClient();

async function seedPermissions() {
  console.log('🌱 Seeding permission definitions...');

  // Seed permission definitions
  for (const permission of PERMISSIONS) {
    await prisma.permissionDefinition.upsert({
      where: { code: permission.code },
      update: {
        name: permission.name,
        description: permission.description,
        category: permission.category,
        isActive: true,
      },
      create: {
        code: permission.code,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${PERMISSIONS.length} permission definitions`);
}

async function seedRolePresets(tenantId: string) {
  console.log(`🌱 Seeding role presets for tenant ${tenantId}...`);

  // Seed role presets for the tenant
  for (const preset of ROLE_PRESETS) {
    await prisma.rolePreset.upsert({
      where: {
        tenantId_name: {
          tenantId,
          name: preset.name,
        },
      },
      update: {
        description: preset.description,
        permissions: preset.permissions,
        isSystem: preset.isSystem,
        isActive: true,
      },
      create: {
        tenantId,
        name: preset.name,
        description: preset.description,
        permissions: preset.permissions,
        isSystem: preset.isSystem,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${ROLE_PRESETS.length} role presets for tenant ${tenantId}`);
}

async function main() {
  try {
    // Seed global permission definitions
    await seedPermissions();

    // Get all tenants and seed role presets for each
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true },
    });

    console.log(`\n📋 Found ${tenants.length} tenant(s)`);

    for (const tenant of tenants) {
      await seedRolePresets(tenant.id);
    }

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

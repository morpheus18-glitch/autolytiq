/**
 * Database Seeder
 * Orchestrates all seeding modules to populate the database with demo data
 */

import { PrismaClient } from '@prisma/client';
import { seedTenant } from './seed/seeders/seedTenant';
import { seedUsers } from './seed/seeders/seedUsers';
import { seedGLAccounts } from './seed/seeders/seedGLAccounts';
import { seedLenders } from './seed/seeders/seedLenders';
import { seedWorkflows } from './seed/seeders/seedWorkflows';
import { seedWidgetDefinitions } from './seed/seeders/seedWidgetDefinitions';
import { seedCustomers } from './seed/seeders/seedCustomers';
import { seedVehicles } from './seed/seeders/seedVehicles';
import { seedDeals } from './seed/seeders/seedDeals';
import { SEED_CONFIG } from './seed/config';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🌱 Starting database seed...\n');
  console.log('━'.repeat(60));

  try {
    // 1. Seed tenant and store
    const { tenant, store } = await seedTenant(prisma);

    // 2. Seed users
    const { users } = await seedUsers(prisma, tenant, store);

    // 3. Seed GL accounts
    const { glAccounts, glAccountMap } = await seedGLAccounts(prisma, tenant, store);

    // 4. Seed lenders
    const { sunriseCreditUnion, horizonAutoFinance } = await seedLenders(prisma, tenant, store);

    // 5. Seed workflow definitions
    const { workflowDefinition } = await seedWorkflows(prisma, tenant, store, users);

    // 6. Seed widget definitions (global, not tenant-specific)
    const widgetDefinitions = await seedWidgetDefinitions(prisma);

    // 7. Seed customers and CRM data
    const { customers, leads, activities, appointments, communications } = await seedCustomers(
      prisma,
      tenant,
      store,
      users
    );

    // 8. Seed vehicles and inventory
    const { inventoryVehicles } = await seedVehicles(prisma, tenant, store, users, workflowDefinition);

    // 9. Seed deals and financing
    const { deals, workingDeal, worksheet } = await seedDeals(
      prisma,
      tenant,
      store,
      users,
      customers,
      inventoryVehicles,
      glAccountMap,
      { sunriseCreditUnion, horizonAutoFinance }
    );

    // 10. Create audit log
    const adminUser = users.find((user) => user.isSuperAdmin) ?? users[0];
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: adminUser.id,
        action: 'SEED',
        resource: 'demo-dataset',
        details: {
          description: 'Generated demo dealership data for analytics and testing',
          customers: customers.length,
          leads: leads.length,
          vehicles: inventoryVehicles.length,
          deals: deals.length,
          widgetDefinitions: widgetDefinitions?.length || 0,
        },
        ipAddress: '127.0.0.1',
        userAgent: 'seed-script',
      },
    });

    console.log('\n━'.repeat(60));
    console.log('\n✅ Seed complete!\n');
    console.log('📊 Summary:');
    console.log(`   • Tenant: ${tenant.name} (${tenant.subdomain})`);
    console.log(`   • Store: ${store.name} (${store.code})`);
    console.log(`   • Users: ${users.length}`);
    console.log(`   • GL Accounts: ${glAccounts.length}`);
    console.log(`   • Widget Definitions: ${widgetDefinitions?.length || 0}`);
    console.log(`   • Customers: ${customers.length}`);
    console.log(`   • Leads: ${leads.length}`);
    console.log(`   • Vehicles: ${inventoryVehicles.length}`);
    console.log(`   • Deals: ${deals.length}`);
    console.log(`   • Workflow Stages: ${workflowDefinition.stages.length}`);
    console.log('\n🔐 Developer login:');
    console.log(`   Email: ${SEED_CONFIG.DEVELOPER_EMAIL}`);
    console.log(`   Password: ${SEED_CONFIG.DEVELOPER_PASSWORD}`);
    console.log('\n');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

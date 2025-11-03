/**
 * Tenant Seeder
 * Creates or updates tenant and store configuration
 */

import { PrismaClient, TenantPlan, TenantStatus } from '@prisma/client';
import {
  SEED_CONFIG,
  DEFAULT_ALLOWED_ROUTES,
  DEFAULT_HOME_PATH,
  DEFAULT_NAVIGATION_SECTIONS,
  DEFAULT_QUICK_ACTIONS,
} from '../config';

/**
 * Reset existing tenant data before reseeding
 * Deletes all tenant-scoped data in the correct order (respecting foreign keys)
 */
async function resetTenantData(prisma: PrismaClient, tenantId: string): Promise<void> {
  console.log('  → Resetting existing tenant data...');

  // Delete in reverse dependency order
  await prisma.communication.deleteMany({ where: { tenantId } });
  await prisma.appointment.deleteMany({ where: { tenantId } });
  await prisma.activity.deleteMany({ where: { tenantId } });
  await prisma.leadScore.deleteMany({ where: { tenantId } });
  await prisma.lead.deleteMany({ where: { tenantId } });
  await prisma.emailTemplate.deleteMany({ where: { tenantId } });
  await prisma.sMSTemplate.deleteMany({ where: { tenantId } });
  await prisma.automationExecution.deleteMany({ where: { tenantId } });
  await prisma.automation.deleteMany({ where: { tenantId } });
  await prisma.pipelineAggregate.deleteMany({ where: { tenantId } });
  await prisma.transportOrder.deleteMany({ where: { tenantId } });
  await prisma.workflowTask.deleteMany({ where: { tenantId } });
  await prisma.stageTransition.deleteMany({ where: { tenantId } });
  await prisma.vehicleWorkflow.deleteMany({ where: { tenantId } });
  await prisma.workflowStage.deleteMany({ where: { tenantId } });
  await prisma.workflowDefinition.deleteMany({ where: { tenantId } });
  await prisma.notification.deleteMany({ where: { tenantId } });
  await prisma.report.deleteMany({ where: { tenantId } });
  await prisma.commission.deleteMany({ where: { tenantId } });
  await prisma.journalEntryLine.deleteMany({ where: { tenantId } });
  await prisma.journalEntry.deleteMany({ where: { tenantId } });
  await prisma.approvalPrediction.deleteMany({ where: { tenantId } });
  await prisma.counterOffer.deleteMany({ where: { tenantId } });
  await prisma.dealOptimization.deleteMany({ where: { tenantId } });
  await prisma.dealVersion.deleteMany({ where: { tenantId } });
  await prisma.dealWorksheet.deleteMany({ where: { tenantId } });
  await prisma.dealDocument.deleteMany({ where: { deal: { tenantId } } });
  await prisma.contract.deleteMany({ where: { tenantId } });
  await prisma.lenderSubmission.deleteMany({ where: { tenantId } });
  await prisma.creditApplication.deleteMany({ where: { tenantId } });
  await prisma.fundingChecklist.deleteMany({ where: { tenantId } });
  await prisma.dealJacket.deleteMany({ where: { tenantId } });
  await prisma.deal.deleteMany({ where: { tenantId } });
  await prisma.marketComp.deleteMany({ where: { tenantId } });
  await prisma.wholesaleListing.deleteMany({ where: { tenantId } });
  await prisma.auctionPurchase.deleteMany({ where: { tenantId } });
  await prisma.priceHistory.deleteMany({ where: { tenantId } });
  await prisma.reconItem.deleteMany({ where: { tenantId } });
  await prisma.appraisal.deleteMany({ where: { tenantId } });
  await prisma.vehicleHistory.deleteMany({ where: { tenantId } });
  await prisma.vehicle.deleteMany({ where: { tenantId } });
  await prisma.customerVehicle.deleteMany({ where: { tenantId } });
  await prisma.customerInteraction.deleteMany({ where: { tenantId } });
  await prisma.customer.deleteMany({ where: { tenantId } });
  await prisma.gLAccount.deleteMany({ where: { tenantId } });
  await prisma.auditLog.deleteMany({ where: { tenantId } });
  await prisma.systemSetting.deleteMany({ where: { tenantId } });
  await prisma.user.deleteMany({ where: { tenantId } });
  await prisma.tenant.delete({ where: { id: tenantId } });

  console.log('  ✓ Tenant data reset complete');
}

/**
 * Seed tenant and store
 * Creates or updates the main tenant and flagship store
 */
export async function seedTenant(prisma: PrismaClient) {
  console.log('\n🏢 Seeding tenant and store...');

  // Check for existing tenant
  const existingTenant = await prisma.tenant.findUnique({
    where: { subdomain: SEED_CONFIG.DEALERSHIP_SUBDOMAIN },
  });

  if (existingTenant) {
    console.log('  → Existing tenant found, resetting data...');
    await resetTenantData(prisma, existingTenant.id);
  }

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Sunrise Motors',
      subdomain: SEED_CONFIG.DEALERSHIP_SUBDOMAIN,
      plan: TenantPlan.PROFESSIONAL,
      status: TenantStatus.ACTIVE,
      billingEmail: 'billing@sunrisemotors.demo',
      settings: {
        timezone: 'America/Chicago',
        currency: 'USD',
        inventoryAgingThreshold: 90,
        defaultDocFee: 489,
        auth: {
          defaultAccess: {
            homePath: DEFAULT_HOME_PATH,
            allowedRoutes: DEFAULT_ALLOWED_ROUTES,
            navigationSections: DEFAULT_NAVIGATION_SECTIONS,
            quickActions: DEFAULT_QUICK_ACTIONS,
          },
        },
      },
    },
  });

  console.log(`  ✓ Created tenant: ${tenant.name} (${tenant.subdomain})`);

  // Create store
  const store = await prisma.store.upsert({
    where: { code: 'MAIN' },
    update: {
      tenantId: tenant.id,
      name: 'Sunrise Motors Flagship',
      timezone: 'America/Chicago',
      aliases: ['MAIN', '001'],
      isActive: true,
    },
    create: {
      tenantId: tenant.id,
      code: 'MAIN',
      name: 'Sunrise Motors Flagship',
      timezone: 'America/Chicago',
      aliases: ['MAIN', '001'],
      settings: {
        dealerLicense: 'SUN12345',
        features: ['realtime_analytics', 'sales_assistant'],
      },
    },
  });

  console.log(`  ✓ Created store: ${store.name} (${store.code})`);

  return { tenant, store };
}

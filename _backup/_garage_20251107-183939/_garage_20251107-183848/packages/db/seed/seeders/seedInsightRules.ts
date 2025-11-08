/**
 * Seed Insight Rules
 *
 * Seeds the InsightRule table with the 10 builtin rules
 * Metadata mirrors rules.builtin.ts but only stores key fields in DB
 */

import type { PrismaClient } from '@prisma/client';
import { cuid } from '@paralleldrive/cuid2';

const BUILTIN_RULES = [
  {
    key: 'deal.pendingFI.tooLong',
    domain: 'fi',
    severity: 'warning',
    audience: { roles: ['fi', 'sales'] },
  },
  {
    key: 'lead.noContact.hot',
    domain: 'sales',
    severity: 'urgent',
    audience: { roles: ['sales'] },
  },
  {
    key: 'lead.hot.cooling',
    domain: 'sales',
    severity: 'warning',
    audience: { roles: ['sales'] },
  },
  {
    key: 'service.ro.approvedNoParts',
    domain: 'service',
    severity: 'warning',
    audience: { roles: ['service'] },
  },
  {
    key: 'inventory.aging.over45days',
    domain: 'inventory',
    severity: 'notice',
    audience: { roles: ['inventory', 'sales'] },
  },
  {
    key: 'deal.stalled.noActivity',
    domain: 'sales',
    severity: 'notice',
    audience: { roles: ['sales'] },
  },
  {
    key: 'msg.sms.unread',
    domain: 'comms',
    severity: 'notice',
    audience: { roles: ['sales', 'bdc'] },
  },
  {
    key: 'inventory.price.belowMarket',
    domain: 'inventory',
    severity: 'info',
    audience: { roles: ['inventory'] },
  },
  {
    key: 'fi.creditApp.pending',
    domain: 'fi',
    severity: 'warning',
    audience: { roles: ['fi'] },
  },
  {
    key: 'lead.appointment.noShow',
    domain: 'sales',
    severity: 'notice',
    audience: { roles: ['sales', 'bdc'] },
  },
];

export async function seedInsightRules(prisma: PrismaClient) {
  console.log('   🔍 Seeding insight rules...');

  const rules = [];

  for (const rule of BUILTIN_RULES) {
    const created = await prisma.insightRule.upsert({
      where: { key: rule.key },
      create: {
        id: cuid(),
        key: rule.key,
        domain: rule.domain,
        severity: rule.severity,
        audience: rule.audience,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        domain: rule.domain,
        severity: rule.severity,
        audience: rule.audience,
        active: true,
        updatedAt: new Date(),
      },
    });

    rules.push(created);
  }

  console.log(`      ✓ Created ${rules.length} insight rules`);

  return { rules };
}

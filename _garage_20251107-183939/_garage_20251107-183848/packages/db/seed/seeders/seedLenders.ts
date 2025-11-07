/**
 * Lenders Seeder
 * Creates demo lenders with rate sheets and programs
 */

import { PrismaClient, LenderType, Prisma } from '@prisma/client';
import { subDays, addMonths } from 'date-fns';

/**
 * Seed lenders
 * Creates demo lenders with rate sheets
 */
export async function seedLenders(
  prisma: PrismaClient,
  tenantId: string
) {
  console.log('\n🏦 Seeding lenders...');

  const rateSheetEffectiveFrom = subDays(new Date(), 14);
  const rateSheetEffectiveTo = addMonths(new Date(), 2);

  // Create lenders in parallel
  const [sunriseCreditUnion, horizonAutoFinance] = await Promise.all([
    // Sunrise Credit Union - Credit Union
    prisma.lender.upsert({
      where: { id: 'sunrise-credit-union' },
      update: {
        name: 'Sunrise Credit Union',
        type: LenderType.CREDIT_UNION,
        apiProvider: 'manual',
        apiCredentials: {
          supportEmail: 'deskingsupport@sunrisecredit.demo',
          rateSheets: [
            {
              program: 'Standard Retail',
              effectiveFrom: rateSheetEffectiveFrom.toISOString(),
              effectiveTo: rateSheetEffectiveTo.toISOString(),
              tiers: [
                { tier: 'TIER_1', maxTerm: 72, apr: 3.49, reserve: 0.02 },
                { tier: 'TIER_2', maxTerm: 72, apr: 4.19, reserve: 0.0175 },
              ],
            },
            {
              program: 'Extended Term',
              effectiveFrom: rateSheetEffectiveFrom.toISOString(),
              effectiveTo: rateSheetEffectiveTo.toISOString(),
              tiers: [
                { tier: 'TIER_1', maxTerm: 84, apr: 3.99, reserve: 0.0185 },
                { tier: 'TIER_2', maxTerm: 84, apr: 4.59, reserve: 0.015 },
              ],
            },
          ],
        },
        tierRange: '640-850',
        maxTerm: 84,
        maxLtv: new Prisma.Decimal('1.25'),
        minCreditScore: 640,
        maxCreditScore: 850,
        applicationFee: new Prisma.Decimal('95.00'),
        isActive: true,
      },
      create: {
        id: 'sunrise-credit-union',
        tenantId,
        name: 'Sunrise Credit Union',
        type: LenderType.CREDIT_UNION,
        apiProvider: 'manual',
        apiCredentials: {
          supportEmail: 'deskingsupport@sunrisecredit.demo',
          rateSheets: [
            {
              program: 'Standard Retail',
              effectiveFrom: rateSheetEffectiveFrom.toISOString(),
              effectiveTo: rateSheetEffectiveTo.toISOString(),
              tiers: [
                { tier: 'TIER_1', maxTerm: 72, apr: 3.49, reserve: 0.02 },
                { tier: 'TIER_2', maxTerm: 72, apr: 4.19, reserve: 0.0175 },
              ],
            },
            {
              program: 'Extended Term',
              effectiveFrom: rateSheetEffectiveFrom.toISOString(),
              effectiveTo: rateSheetEffectiveTo.toISOString(),
              tiers: [
                { tier: 'TIER_1', maxTerm: 84, apr: 3.99, reserve: 0.0185 },
                { tier: 'TIER_2', maxTerm: 84, apr: 4.59, reserve: 0.015 },
              ],
            },
          ],
        },
        tierRange: '640-850',
        maxTerm: 84,
        maxLtv: new Prisma.Decimal('1.25'),
        minCreditScore: 640,
        maxCreditScore: 850,
        applicationFee: new Prisma.Decimal('95.00'),
      },
    }),

    // Horizon Auto Finance - Bank
    prisma.lender.upsert({
      where: { id: 'horizon-auto-finance' },
      update: {
        name: 'Horizon Auto Finance',
        type: LenderType.BANK,
        apiProvider: 'manual',
        apiCredentials: {
          supportEmail: 'programs@horizonauto.demo',
          rateSheets: [
            {
              program: 'Prime Flex',
              effectiveFrom: rateSheetEffectiveFrom.toISOString(),
              effectiveTo: rateSheetEffectiveTo.toISOString(),
              tiers: [
                { tier: 'TIER_1', maxTerm: 72, apr: 3.79, reserve: 0.018 },
                { tier: 'TIER_2', maxTerm: 72, apr: 4.35, reserve: 0.015 },
                { tier: 'TIER_3', maxTerm: 72, apr: 5.25, reserve: 0.0125 },
              ],
            },
          ],
        },
        tierRange: '600-780',
        maxTerm: 75,
        maxLtv: new Prisma.Decimal('1.20'),
        minCreditScore: 600,
        maxCreditScore: 780,
        applicationFee: new Prisma.Decimal('125.00'),
        isActive: true,
      },
      create: {
        id: 'horizon-auto-finance',
        tenantId,
        name: 'Horizon Auto Finance',
        type: LenderType.BANK,
        apiProvider: 'manual',
        apiCredentials: {
          supportEmail: 'programs@horizonauto.demo',
          rateSheets: [
            {
              program: 'Prime Flex',
              effectiveFrom: rateSheetEffectiveFrom.toISOString(),
              effectiveTo: rateSheetEffectiveTo.toISOString(),
              tiers: [
                { tier: 'TIER_1', maxTerm: 72, apr: 3.79, reserve: 0.018 },
                { tier: 'TIER_2', maxTerm: 72, apr: 4.35, reserve: 0.015 },
                { tier: 'TIER_3', maxTerm: 72, apr: 5.25, reserve: 0.0125 },
              ],
            },
          ],
        },
        tierRange: '600-780',
        maxTerm: 75,
        maxLtv: new Prisma.Decimal('1.20'),
        minCreditScore: 600,
        maxCreditScore: 780,
        applicationFee: new Prisma.Decimal('125.00'),
      },
    }),
  ]);

  console.log(`  ✓ Created 2 lenders (${sunriseCreditUnion.name}, ${horizonAutoFinance.name})`);

  return { sunriseCreditUnion, horizonAutoFinance };
}

#!/usr/bin/env tsx

/**
 * Deal Integrity Verification Script
 *
 * This script verifies the cryptographic integrity of all deal event chains.
 *
 * Usage:
 *   npm run verify-deal-integrity
 *   npm run verify-deal-integrity -- --tenant tenant-123
 *   npm run verify-deal-integrity -- --deal deal-456
 *
 * Exit codes:
 *   0 - All deals verified successfully
 *   1 - One or more deals failed verification
 *   2 - Script error (database connection, etc.)
 */

import { prisma, runWithTenant } from '../lib/prisma';
import { verifyDealEventChain } from '../services/deal-event.service';

interface VerificationResult {
  dealId: string;
  dealNumber: string;
  tenantId: string;
  eventCount: number;
  valid: boolean;
  errors: string[];
}

async function verifyAllDeals(tenantId?: string): Promise<VerificationResult[]> {
  // Get all deals (optionally filtered by tenant)
  const where = tenantId ? { tenantId } : {};

  const deals = await prisma.deal.findMany({
    where,
    select: {
      id: true,
      dealNumber: true,
      tenantId: true,
      _count: {
        select: {
          events: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\n📊 Verifying ${deals.length} deals...`);
  console.log('─'.repeat(80));

  const results: VerificationResult[] = [];

  for (const deal of deals) {
    // Verify within tenant context
    const verification = await runWithTenant(deal.tenantId, () =>
      verifyDealEventChain(deal.id),
    );

    const result: VerificationResult = {
      dealId: deal.id,
      dealNumber: deal.dealNumber,
      tenantId: deal.tenantId,
      eventCount: deal._count.events,
      valid: verification.valid,
      errors: verification.errors,
    };

    results.push(result);

    // Print result
    if (result.valid) {
      console.log(`✅ ${result.dealNumber} (${result.eventCount} events)`);
    } else {
      console.log(`❌ ${result.dealNumber} FAILED`);
      result.errors.forEach((error) => {
        console.log(`   └─ ${error}`);
      });
    }
  }

  return results;
}

async function verifyDeal(dealId: string): Promise<VerificationResult | null> {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: {
      id: true,
      dealNumber: true,
      tenantId: true,
      _count: {
        select: {
          events: true,
        },
      },
    },
  });

  if (!deal) {
    console.error(`❌ Deal ${dealId} not found`);
    return null;
  }

  console.log(`\n📊 Verifying deal ${deal.dealNumber}...`);
  console.log('─'.repeat(80));

  const verification = await runWithTenant(deal.tenantId, () =>
    verifyDealEventChain(deal.id),
  );

  const result: VerificationResult = {
    dealId: deal.id,
    dealNumber: deal.dealNumber,
    tenantId: deal.tenantId,
    eventCount: deal._count.events,
    valid: verification.valid,
    errors: verification.errors,
  };

  if (result.valid) {
    console.log(`✅ Chain valid (${result.eventCount} events)`);
  } else {
    console.log(`❌ Chain FAILED`);
    result.errors.forEach((error) => {
      console.log(`   └─ ${error}`);
    });
  }

  return result;
}

function printSummary(results: VerificationResult[]): void {
  console.log('\n' + '═'.repeat(80));
  console.log('📈 VERIFICATION SUMMARY');
  console.log('═'.repeat(80));

  const valid = results.filter((r) => r.valid).length;
  const invalid = results.filter((r) => r.valid === false).length;
  const totalEvents = results.reduce((sum, r) => sum + r.eventCount, 0);

  console.log(`\nTotal deals:     ${results.length}`);
  console.log(`✅ Valid:         ${valid}`);
  console.log(`❌ Invalid:       ${invalid}`);
  console.log(`📝 Total events:  ${totalEvents}`);

  if (invalid > 0) {
    console.log(`\n⚠️  WARNING: ${invalid} deal(s) failed verification!`);
    console.log('This indicates potential data tampering or corruption.');
    console.log('\nFailed deals:');
    results
      .filter((r) => !r.valid)
      .forEach((r) => {
        console.log(`  - ${r.dealNumber} (${r.dealId})`);
      });
  }

  const percentage = results.length > 0 ? ((valid / results.length) * 100).toFixed(2) : '0.00';
  console.log(`\n🎯 Success rate: ${percentage}%`);
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let tenantId: string | undefined;
  let dealId: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tenant' && args[i + 1]) {
      tenantId = args[i + 1];
      i++;
    } else if (args[i] === '--deal' && args[i + 1]) {
      dealId = args[i + 1];
      i++;
    } else if (args[i] === '--help') {
      console.log(`
Deal Integrity Verification Script

Usage:
  verify-deal-integrity [options]

Options:
  --tenant <id>   Verify only deals for specific tenant
  --deal <id>     Verify specific deal by ID
  --help          Show this help message

Examples:
  verify-deal-integrity
  verify-deal-integrity --tenant tenant-123
  verify-deal-integrity --deal deal-456
`);
      process.exit(0);
    }
  }

  try {
    let results: VerificationResult[];

    if (dealId) {
      // Verify single deal
      const result = await verifyDeal(dealId);
      results = result ? [result] : [];
    } else {
      // Verify all deals (optionally filtered by tenant)
      results = await verifyAllDeals(tenantId);
    }

    // Print summary
    if (results.length > 1) {
      printSummary(results);
    }

    // Exit with appropriate code
    const hasFailures = results.some((r) => !r.valid);
    process.exit(hasFailures ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Script error:', error);
    process.exit(2);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { verifyAllDeals, verifyDeal };

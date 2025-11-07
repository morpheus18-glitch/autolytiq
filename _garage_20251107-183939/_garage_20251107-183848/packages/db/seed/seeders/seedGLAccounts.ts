/**
 * GL Accounts Seeder
 * Creates general ledger chart of accounts
 */

import { PrismaClient } from '@prisma/client';
import { GL_ACCOUNTS } from '../data/glAccounts';

/**
 * Seed GL accounts
 * Creates chart of accounts for financial tracking
 */
export async function seedGLAccounts(
  prisma: PrismaClient,
  tenantId: string
) {
  console.log('\n💰 Seeding GL accounts...');

  // Create all GL accounts in parallel
  const glAccountRecords = await Promise.all(
    GL_ACCOUNTS.map((account) =>
      prisma.gLAccount.create({
        data: {
          tenantId,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          accountType: account.accountType,
          normalBalance: account.normalBalance,
          balance: '0',
        },
      })
    )
  );

  console.log(`  ✓ Created ${glAccountRecords.length} GL accounts`);

  // Create account number to ID mapping for downstream seeders
  const glAccountMap = glAccountRecords.reduce<Record<string, string>>(
    (map, account) => {
      map[account.accountNumber] = account.id;
      return map;
    },
    {}
  );

  return { glAccountRecords, glAccountMap };
}

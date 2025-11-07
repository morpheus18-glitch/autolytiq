/**
 * Standalone Insight Rules Seeder
 *
 * Seeds only the InsightRule table, can be run independently
 */

import { PrismaClient } from '@prisma/client';
import { seedInsightRules } from './seed/seeders/seedInsightRules';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🔍 Seeding insight rules...\n');
  console.log('━'.repeat(60));

  try {
    const { rules } = await seedInsightRules(prisma);

    console.log('\n━'.repeat(60));
    console.log('\n✅ Insight rules seed complete!\n');
    console.log('📊 Summary:');
    console.log(`   • Insight Rules: ${rules.length}`);
    console.log('\n');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error('Failed to seed insight rules', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

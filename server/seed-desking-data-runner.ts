/**
 * Seed Data Runner - Populates database with desking module data
 * 
 * Run with: tsx server/seed-desking-data-runner.ts
 */

import { db } from './db';
import {
  calcVersions,
  jurisdictions,
  taxRules,
  feeCatalog,
  leasePrograms,
} from '@shared/schema';
import {
  calcVersionSeed,
  jurisdictionsSeed,
  taxRulesSeed,
  feeCatalogSeed,
  leaseProgramsSeed,
} from './desking-seed-data';

async function seedDeskingData() {
  console.log('🌱 Starting desking module seed...');
  
  try {
    // 1. Insert calculation versions
    console.log('📊 Inserting calculation versions...');
    const insertedCalcVersions = await db
      .insert(calcVersions)
      .values(calcVersionSeed)
      .returning();
    console.log(`   ✅ Inserted ${insertedCalcVersions.length} calc versions`);

    // 2. Insert jurisdictions
    console.log('📍 Inserting jurisdictions...');
    const insertedJurisdictions = await db
      .insert(jurisdictions)
      .values(jurisdictionsSeed)
      .returning();
    console.log(`   ✅ Inserted ${insertedJurisdictions.length} jurisdictions`);

    // 3. Update tax rules with correct jurisdiction IDs
    console.log('💰 Preparing tax rules...');
    const updatedTaxRules = taxRulesSeed.map((rule) => ({
      ...rule,
      jurisdictionId: insertedJurisdictions[rule.jurisdictionId - 1]?.id || rule.jurisdictionId,
    }));

    // Insert tax rules
    const insertedTaxRules = await db
      .insert(taxRules)
      .values(updatedTaxRules)
      .returning();
    console.log(`   ✅ Inserted ${insertedTaxRules.length} tax rules`);

    // 4. Update fee catalog with correct jurisdiction IDs
    console.log('📋 Preparing fee catalog...');
    const updatedFeeCatalog = feeCatalogSeed.map((fee) => ({
      ...fee,
      jurisdictionId: insertedJurisdictions[fee.jurisdictionId - 1]?.id || fee.jurisdictionId,
    }));

    // Insert fees
    const insertedFees = await db
      .insert(feeCatalog)
      .values(updatedFeeCatalog)
      .returning();
    console.log(`   ✅ Inserted ${insertedFees.length} fees`);

    // 5. Insert lease programs
    console.log('🚗 Inserting lease programs...');
    const insertedLeasePrograms = await db
      .insert(leasePrograms)
      .values(leaseProgramsSeed)
      .returning();
    console.log(`   ✅ Inserted ${insertedLeasePrograms.length} lease programs`);

    console.log('\n✨ Desking module seed completed successfully!\n');
    console.log('Summary:');
    console.log(`  - Calc Versions: ${insertedCalcVersions.length}`);
    console.log(`  - Jurisdictions: ${insertedJurisdictions.length}`);
    console.log(`  - Tax Rules: ${insertedTaxRules.length}`);
    console.log(`  - Fees: ${insertedFees.length}`);
    console.log(`  - Lease Programs: ${insertedLeasePrograms.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding desking data:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seedDeskingData();

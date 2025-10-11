/**
 * Populate Nationwide Tax & Fee Data
 * 
 * Clears existing desking data and loads nationwide coverage for all 50 states
 */

import { db } from './db';
import { 
  calcVersions, 
  jurisdictions, 
  taxRules, 
  feeCatalog 
} from '@shared/schema';
import { 
  calcVersionNationwide, 
  jurisdictionsNationwide, 
  taxRulesNationwide 
} from './desking-seed-nationwide';
import { feeCatalogNationwide } from './desking-seed-nationwide-fees';

async function populateNationwideData() {
  console.log('🚀 Starting nationwide data population...\n');

  try {
    // Clear existing data and reset sequences
    console.log('🗑️  Clearing existing data and resetting sequences...');
    await db.execute(`TRUNCATE TABLE fee_catalog, tax_rules, jurisdictions, calc_versions RESTART IDENTITY CASCADE`);
    console.log('✅ Existing data cleared and sequences reset\n');

    // Insert calc version
    console.log('📋 Inserting calculation version...');
    await db.insert(calcVersions).values(calcVersionNationwide);
    console.log('✅ Calculation version inserted\n');

    // Insert jurisdictions (all 50 states + DC)
    console.log('📍 Inserting jurisdictions (51 total)...');
    await db.insert(jurisdictions).values(jurisdictionsNationwide);
    console.log('✅ Jurisdictions inserted\n');

    // Insert tax rules (state + local taxes)
    console.log('💰 Inserting tax rules (90+ rules)...');
    await db.insert(taxRules).values(taxRulesNationwide);
    console.log('✅ Tax rules inserted\n');

    // Insert fee catalog (title, reg, doc fees)
    console.log('💵 Inserting fee catalog (150+ fees)...');
    await db.insert(feeCatalog).values(feeCatalogNationwide);
    console.log('✅ Fee catalog inserted\n');

    console.log('🎉 Nationwide data population complete!');
    console.log('\n📊 Summary:');
    console.log('   - 51 jurisdictions (all 50 states + DC)');
    console.log('   - 90+ tax rules (state + local)');
    console.log('   - 150+ DMV fees (title, reg, doc)');
    console.log('   - Trade-in credit logic by state');
    console.log('\n✅ Ready for nationwide vehicle sales tax calculation!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating nationwide data:', error);
    process.exit(1);
  }
}

populateNationwideData();

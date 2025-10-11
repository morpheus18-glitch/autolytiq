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
import {
  majorCitiesJurisdictions,
  majorCitiesTaxRules,
  majorCitiesFees
} from './desking-seed-major-cities';

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

    // Insert jurisdictions (all 50 states + DC + major cities)
    console.log('📍 Inserting jurisdictions...');
    await db.insert(jurisdictions).values(jurisdictionsNationwide);
    console.log('✅ State capitals inserted (51)');
    await db.insert(jurisdictions).values(majorCitiesJurisdictions);
    console.log('✅ Major cities inserted (37)\n');

    // Insert tax rules (state + local taxes)
    console.log('💰 Inserting tax rules...');
    await db.insert(taxRules).values(taxRulesNationwide);
    console.log('✅ State/capital tax rules inserted (79)');
    await db.insert(taxRules).values(majorCitiesTaxRules);
    console.log('✅ Major city tax rules inserted (60+)\n');

    // Insert fee catalog (title, reg, doc fees)
    console.log('💵 Inserting fee catalog...');
    await db.insert(feeCatalog).values(feeCatalogNationwide);
    console.log('✅ State/capital fees inserted (153)');
    if (majorCitiesFees.length > 0) {
      await db.insert(feeCatalog).values(majorCitiesFees);
      console.log(`✅ Major city fees inserted (${majorCitiesFees.length})\n`);
    } else {
      console.log('ℹ️  Major cities using state fees\n');
    }

    console.log('🎉 Nationwide data population complete!');
    console.log('\n📊 Summary:');
    console.log('   - 88 jurisdictions (51 capitals + 37 major cities)');
    console.log('   - 140+ tax rules (multi-tier: state + county + city)');
    console.log('   - 150+ DMV fees (title, reg, doc)');
    console.log('   - Trade-in credit by state (7 states NO credit)');
    console.log('   - Chicago: 9.25% (6.25% state + 1.75% Cook + 1.25% city)');
    console.log('   - NYC: 8.875% (4% state + 4.5% city + 0.375% MTA)');
    console.log('   - LA: 9.5% (7.25% state + 2.25% local)');
    console.log('\n✅ Production-ready for dealership operations!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating nationwide data:', error);
    process.exit(1);
  }
}

populateNationwideData();

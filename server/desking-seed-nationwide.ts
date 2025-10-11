/**
 * Nationwide Desking Module - Complete US Coverage
 * 
 * Comprehensive seed data for all 50 US states including:
 * - Jurisdictions (capital city for each state)
 * - State + Average Local Tax Rates (2025)
 * - Trade-in Tax Credit Rules
 * - DMV Title & Registration Fees
 * - Dealer Documentation Fee Caps
 * 
 * Data sources: Tax Foundation, Avalara, State DMV sites (2025)
 */

import type { InsertJurisdiction, InsertTaxRule, InsertFeeCatalogItem, InsertCalcVersion } from '@shared/schema';

// ========================================
// Calculation Version
// ========================================
export const calcVersionNationwide: InsertCalcVersion[] = [
  {
    sourceName: 'Nationwide-2025',
    sourceVersion: '2.0.0',
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: 'Complete US coverage - Tax Foundation + State DMV data (2025)',
  },
];

// ========================================
// All 50 States - Capital Cities as Jurisdictions
// ========================================
export const jurisdictionsNationwide: InsertJurisdiction[] = [
  // States WITHOUT sales tax (5)
  { country: 'US', state: 'AK', county: 'Juneau', city: 'Juneau', zip: '99801' },
  { country: 'US', state: 'DE', county: 'Kent', city: 'Dover', zip: '19901' },
  { country: 'US', state: 'MT', county: 'Lewis and Clark', city: 'Helena', zip: '59601' },
  { country: 'US', state: 'NH', county: 'Merrimack', city: 'Concord', zip: '03301' },
  { country: 'US', state: 'OR', county: 'Marion', city: 'Salem', zip: '97301' },
  
  // States WITH sales tax (45 + DC)
  { country: 'US', state: 'AL', county: 'Montgomery', city: 'Montgomery', zip: '36104' },
  { country: 'US', state: 'AZ', county: 'Maricopa', city: 'Phoenix', zip: '85001' },
  { country: 'US', state: 'AR', county: 'Pulaski', city: 'Little Rock', zip: '72201' },
  { country: 'US', state: 'CA', county: 'Sacramento', city: 'Sacramento', zip: '95814' },
  { country: 'US', state: 'CO', county: 'Denver', city: 'Denver', zip: '80202' },
  { country: 'US', state: 'CT', county: 'Hartford', city: 'Hartford', zip: '06103' },
  { country: 'US', state: 'DC', county: 'District of Columbia', city: 'Washington', zip: '20001' },
  { country: 'US', state: 'FL', county: 'Leon', city: 'Tallahassee', zip: '32301' },
  { country: 'US', state: 'GA', county: 'Fulton', city: 'Atlanta', zip: '30303' },
  { country: 'US', state: 'HI', county: 'Honolulu', city: 'Honolulu', zip: '96813' },
  { country: 'US', state: 'ID', county: 'Ada', city: 'Boise', zip: '83702' },
  { country: 'US', state: 'IL', county: 'Sangamon', city: 'Springfield', zip: '62701' },
  { country: 'US', state: 'IN', county: 'Marion', city: 'Indianapolis', zip: '46204' },
  { country: 'US', state: 'IA', county: 'Polk', city: 'Des Moines', zip: '50309' },
  { country: 'US', state: 'KS', county: 'Shawnee', city: 'Topeka', zip: '66603' },
  { country: 'US', state: 'KY', county: 'Franklin', city: 'Frankfort', zip: '40601' },
  { country: 'US', state: 'LA', county: 'East Baton Rouge', city: 'Baton Rouge', zip: '70801' },
  { country: 'US', state: 'ME', county: 'Kennebec', city: 'Augusta', zip: '04330' },
  { country: 'US', state: 'MD', county: 'Anne Arundel', city: 'Annapolis', zip: '21401' },
  { country: 'US', state: 'MA', county: 'Suffolk', city: 'Boston', zip: '02108' },
  { country: 'US', state: 'MI', county: 'Ingham', city: 'Lansing', zip: '48933' },
  { country: 'US', state: 'MN', county: 'Ramsey', city: 'St. Paul', zip: '55101' },
  { country: 'US', state: 'MS', county: 'Hinds', city: 'Jackson', zip: '39201' },
  { country: 'US', state: 'MO', county: 'Cole', city: 'Jefferson City', zip: '65101' },
  { country: 'US', state: 'NE', county: 'Lancaster', city: 'Lincoln', zip: '68508' },
  { country: 'US', state: 'NV', county: 'Carson City', city: 'Carson City', zip: '89701' },
  { country: 'US', state: 'NJ', county: 'Mercer', city: 'Trenton', zip: '08608' },
  { country: 'US', state: 'NM', county: 'Santa Fe', city: 'Santa Fe', zip: '87501' },
  { country: 'US', state: 'NY', county: 'Albany', city: 'Albany', zip: '12207' },
  { country: 'US', state: 'NC', county: 'Wake', city: 'Raleigh', zip: '27601' },
  { country: 'US', state: 'ND', county: 'Burleigh', city: 'Bismarck', zip: '58501' },
  { country: 'US', state: 'OH', county: 'Franklin', city: 'Columbus', zip: '43215' },
  { country: 'US', state: 'OK', county: 'Oklahoma', city: 'Oklahoma City', zip: '73102' },
  { country: 'US', state: 'PA', county: 'Dauphin', city: 'Harrisburg', zip: '17101' },
  { country: 'US', state: 'RI', county: 'Providence', city: 'Providence', zip: '02903' },
  { country: 'US', state: 'SC', county: 'Richland', city: 'Columbia', zip: '29201' },
  { country: 'US', state: 'SD', county: 'Hughes', city: 'Pierre', zip: '57501' },
  { country: 'US', state: 'TN', county: 'Davidson', city: 'Nashville', zip: '37219' },
  { country: 'US', state: 'TX', county: 'Travis', city: 'Austin', zip: '78701' },
  { country: 'US', state: 'UT', county: 'Salt Lake', city: 'Salt Lake City', zip: '84111' },
  { country: 'US', state: 'VT', county: 'Washington', city: 'Montpelier', zip: '05602' },
  { country: 'US', state: 'VA', county: 'Richmond City', city: 'Richmond', zip: '23219' },
  { country: 'US', state: 'WA', county: 'Thurston', city: 'Olympia', zip: '98501' },
  { country: 'US', state: 'WV', county: 'Kanawha', city: 'Charleston', zip: '25301' },
  { country: 'US', state: 'WI', county: 'Dane', city: 'Madison', zip: '53703' },
  { country: 'US', state: 'WY', county: 'Laramie', city: 'Cheyenne', zip: '82001' },
];

// ========================================
// Tax Rules - All 50 States + DC
// States without trade-in credit: CA, DC, HI, KY, MI, MT, VA (basis: 'price')
// All others allow trade-in credit (basis: 'net_of_trade')
// ========================================
export const taxRulesNationwide: InsertTaxRule[] = [
  // Alabama - 4% state + 5.44% local avg = 9.44% | Trade credit: YES
  { jurisdictionId: 6, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0400', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'AL state sales tax 4%' },
  { jurisdictionId: 6, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0544', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'AL avg local tax 5.44%' },
  
  // Alaska - 0% state + 1.82% local avg | Trade credit: YES
  { jurisdictionId: 1, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0182', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'AK local sales tax 1.82% (avg)' },
  
  // Arizona - 5.6% state + 2.89% local = 8.49% | Trade credit: YES
  { jurisdictionId: 7, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0560', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'AZ state sales tax 5.6%' },
  { jurisdictionId: 7, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0289', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'AZ avg local tax 2.89%' },
  
  // Arkansas - 6.5% state + 2.98% local = 9.48% | Trade credit: YES
  { jurisdictionId: 8, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0650', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'AR state sales tax 6.5%' },
  { jurisdictionId: 8, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0298', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'AR avg local tax 2.98%' },
  
  // California - 7.25% state + 2.02% local = 9.27% | Trade credit: NO
  { jurisdictionId: 9, appliesTo: 'both', basis: 'price', rate: '0.0725', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'CA state sales tax 7.25% - NO trade credit' },
  { jurisdictionId: 9, appliesTo: 'both', basis: 'price', rate: '0.0202', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'CA avg local tax 2.02%' },
  
  // Colorado - 2.9% state + 4.96% local = 7.86% | Trade credit: YES
  { jurisdictionId: 10, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0290', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'CO state sales tax 2.9%' },
  { jurisdictionId: 10, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0496', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'CO avg local tax 4.96%' },
  
  // Connecticut - 6.35% state only | Trade credit: YES
  { jurisdictionId: 11, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0635', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'CT state sales tax 6.35%' },
  
  // DC - 6% + local taxes | Trade credit: NO
  { jurisdictionId: 12, appliesTo: 'both', basis: 'price', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'DC sales tax 6% - NO trade credit' },
  
  // Delaware - 0% (no sales tax)
  // No tax rules needed
  
  // Florida - 6% state + 1.08% local = 7.08% | Trade credit: YES
  { jurisdictionId: 13, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'FL state sales tax 6%' },
  { jurisdictionId: 13, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0108', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'FL avg local tax 1.08%' },
  
  // Georgia - 4% state + 3.42% local = 7.42% | Trade credit: YES
  { jurisdictionId: 14, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0400', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'GA state sales tax 4% (TAVT)' },
  { jurisdictionId: 14, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0342', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'GA avg local tax 3.42%' },
  
  // Hawaii - 4% state + 0.5% local = 4.5% | Trade credit: NO
  { jurisdictionId: 15, appliesTo: 'both', basis: 'price', rate: '0.0400', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'HI state sales tax 4% - NO trade credit' },
  { jurisdictionId: 15, appliesTo: 'both', basis: 'price', rate: '0.0050', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'HI avg local tax 0.5%' },
  
  // Idaho - 6% state + 0.02% local = 6.02% | Trade credit: YES
  { jurisdictionId: 16, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'ID state sales tax 6%' },
  
  // Illinois - 6.25% state + 2.68% local = 8.93% | Trade credit: YES
  { jurisdictionId: 17, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0625', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'IL state sales tax 6.25%' },
  { jurisdictionId: 17, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0268', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'IL avg local tax 2.68%' },
  
  // Indiana - 7% state only | Trade credit: YES
  { jurisdictionId: 18, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0700', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'IN state sales tax 7%' },
  
  // Iowa - 6% state + 0.99% local = 6.99% | Trade credit: YES
  { jurisdictionId: 19, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'IA state sales tax 6%' },
  { jurisdictionId: 19, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0099', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'IA avg local tax 0.99%' },
  
  // Kansas - 6.5% state + 2.3% local = 8.8% | Trade credit: YES
  { jurisdictionId: 20, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0650', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'KS state sales tax 6.5%' },
  { jurisdictionId: 20, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0230', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'KS avg local tax 2.3%' },
  
  // Kentucky - 6% state only | Trade credit: NO
  { jurisdictionId: 21, appliesTo: 'both', basis: 'price', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'KY state sales tax 6% - NO trade credit' },
  
  // Louisiana - 4.45% state + 5.66% local = 10.11% | Trade credit: YES
  { jurisdictionId: 22, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0445', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'LA state sales tax 4.45%' },
  { jurisdictionId: 22, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0566', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'LA avg local tax 5.66%' },
  
  // Maine - 5.5% state only | Trade credit: YES
  { jurisdictionId: 23, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0550', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'ME state sales tax 5.5%' },
  
  // Maryland - 6% state only | Trade credit: YES
  { jurisdictionId: 24, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'MD state sales tax 6%' },
  
  // Massachusetts - 6.25% state only | Trade credit: YES
  { jurisdictionId: 25, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0625', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'MA state sales tax 6.25%' },
  
  // Michigan - 6% state only | Trade credit: NO
  { jurisdictionId: 26, appliesTo: 'both', basis: 'price', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'MI state sales tax 6% - NO trade credit' },
  
  // Minnesota - 6.88% state + 0.88% local = 7.76% | Trade credit: YES
  { jurisdictionId: 27, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0688', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'MN state sales tax 6.88%' },
  { jurisdictionId: 27, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0088', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'MN avg local tax 0.88%' },
  
  // Mississippi - 7% state + 0.08% local = 7.08% | Trade credit: YES
  { jurisdictionId: 28, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0700', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'MS state sales tax 7%' },
  
  // Missouri - 4.23% state + 4.33% local = 8.56% | Trade credit: YES
  { jurisdictionId: 29, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0423', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'MO state sales tax 4.23%' },
  { jurisdictionId: 29, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0433', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'MO avg local tax 4.33%' },
  
  // Montana - 0% (no sales tax) | Trade credit: N/A
  // No tax rules needed
  
  // Nebraska - 5.5% state + 1.51% local = 7.01% | Trade credit: YES
  { jurisdictionId: 30, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0550', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NE state sales tax 5.5%' },
  { jurisdictionId: 30, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0151', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NE avg local tax 1.51%' },
  
  // Nevada - 6.85% state + 1.53% local = 8.38% | Trade credit: YES
  { jurisdictionId: 31, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0685', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NV state sales tax 6.85%' },
  { jurisdictionId: 31, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0153', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NV avg local tax 1.53%' },
  
  // New Hampshire - 0% (no sales tax)
  // No tax rules needed
  
  // New Jersey - 6.63% state | Trade credit: YES
  { jurisdictionId: 32, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0663', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NJ state sales tax 6.63%' },
  
  // New Mexico - 5.13% state + 2.82% local = 7.95% | Trade credit: YES
  { jurisdictionId: 33, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0513', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NM state sales tax 5.13%' },
  { jurisdictionId: 33, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0282', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NM avg local tax 2.82%' },
  
  // New York - 4% state + 4.53% local = 8.53% | Trade credit: YES
  { jurisdictionId: 34, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0400', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NY state sales tax 4%' },
  { jurisdictionId: 34, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0453', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NY avg local tax 4.53%' },
  
  // North Carolina - 4.75% state + 2.32% local = 7.07% | Trade credit: YES
  { jurisdictionId: 35, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0475', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NC state sales tax 4.75%' },
  { jurisdictionId: 35, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0232', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'NC avg local tax 2.32%' },
  
  // North Dakota - 5% state + 2.2% local = 7.2% | Trade credit: YES
  { jurisdictionId: 36, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0500', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'ND state sales tax 5%' },
  { jurisdictionId: 36, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0220', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'ND avg local tax 2.2%' },
  
  // Ohio - 5.75% state + 1.64% local = 7.39% | Trade credit: YES
  { jurisdictionId: 37, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0575', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'OH state sales tax 5.75%' },
  { jurisdictionId: 37, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0164', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'OH avg local tax 1.64%' },
  
  // Oklahoma - 4.5% state + 4.54% local = 9.04% | Trade credit: YES
  { jurisdictionId: 38, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0450', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'OK state sales tax 4.5%' },
  { jurisdictionId: 38, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0454', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'OK avg local tax 4.54%' },
  
  // Oregon - 0% (no sales tax)
  // No tax rules needed
  
  // Pennsylvania - 6% state + 0.34% local = 6.34% | Trade credit: YES
  { jurisdictionId: 39, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'PA state sales tax 6%' },
  
  // Rhode Island - 7% state only | Trade credit: YES
  { jurisdictionId: 40, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0700', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'RI state sales tax 7%' },
  
  // South Carolina - 6% state + 1.52% local = 7.52% | Trade credit: YES
  { jurisdictionId: 41, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'SC state sales tax 6%' },
  { jurisdictionId: 41, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0152', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'SC avg local tax 1.52%' },
  
  // South Dakota - 4.2% state + 2.07% local = 6.27% | Trade credit: YES
  { jurisdictionId: 42, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0420', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'SD state sales tax 4.2%' },
  { jurisdictionId: 42, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0207', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'SD avg local tax 2.07%' },
  
  // Tennessee - 7% state + 2.61% local = 9.61% | Trade credit: YES
  { jurisdictionId: 43, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0700', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'TN state sales tax 7%' },
  { jurisdictionId: 43, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0261', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'TN avg local tax 2.61%' },
  
  // Texas - 6.25% state + 1.98% local = 8.23% | Trade credit: YES (Changed from NO)
  { jurisdictionId: 44, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0625', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'TX state sales tax 6.25%' },
  { jurisdictionId: 44, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0198', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'TX avg local tax 1.98%' },
  
  // Utah - 6.1% state + 1.19% local = 7.29% | Trade credit: YES
  { jurisdictionId: 45, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0610', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'UT state sales tax 6.1%' },
  { jurisdictionId: 45, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0119', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'UT avg local tax 1.19%' },
  
  // Vermont - 6% state + 0.24% local = 6.24% | Trade credit: YES
  { jurisdictionId: 46, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'VT state sales tax 6%' },
  
  // Virginia - 5.3% state + 0.62% local = 5.92% | Trade credit: NO
  { jurisdictionId: 47, appliesTo: 'both', basis: 'price', rate: '0.0530', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'VA state sales tax 5.3% - NO trade credit' },
  { jurisdictionId: 47, appliesTo: 'both', basis: 'price', rate: '0.0062', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'VA avg local tax 0.62%' },
  
  // Washington - 6.5% state + 2.97% local = 9.47% | Trade credit: YES (Changed from NO)
  { jurisdictionId: 48, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0650', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'WA state sales tax 6.5%' },
  { jurisdictionId: 48, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0297', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'WA avg local tax 2.97%' },
  
  // West Virginia - 6% state + 0.62% local = 6.62% | Trade credit: YES
  { jurisdictionId: 49, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0600', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'WV state sales tax 6%' },
  { jurisdictionId: 49, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0062', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'WV avg local tax 0.62%' },
  
  // Wisconsin - 5% state + 0.72% local = 5.72% | Trade credit: YES
  { jurisdictionId: 50, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0500', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'WI state sales tax 5%' },
  { jurisdictionId: 50, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0072', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'WI avg local tax 0.72%' },
  
  // Wyoming - 4% state + 1.56% local = 5.56% | Trade credit: YES
  { jurisdictionId: 51, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0400', precedence: 0, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'WY state sales tax 4%' },
  { jurisdictionId: 51, appliesTo: 'both', basis: 'net_of_trade', rate: '0.0156', precedence: 1, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, isCompound: false, notes: 'WY avg local tax 1.56%' },
];

// Note: This file continues in part 2 with fee catalog data

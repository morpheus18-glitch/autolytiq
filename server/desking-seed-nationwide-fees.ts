/**
 * Nationwide Desking Module - Fee Catalog (Part 2)
 * 
 * DMV Fees for all 50 states:
 * - Title fees
 * - Registration fees  
 * - Dealer documentation fee caps/averages
 * 
 * Data sources: State DMV sites, CarEdge, Edmunds (2025)
 */

import type { InsertFeeCatalogItem } from '@shared/schema';

// ========================================
// Fee Catalog - All 50 States + DC
// ========================================
export const feeCatalogNationwide: InsertFeeCatalogItem[] = [
  // Alabama - ID 6
  { jurisdictionId: 6, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AL title fee $15' },
  { jurisdictionId: 6, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 2000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AL registration $15-24 (avg $20)' },
  { jurisdictionId: 6, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 40000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AL doc fee (no cap, avg $400)' },
  
  // Alaska - ID 1
  { jurisdictionId: 1, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AK title fee $15' },
  { jurisdictionId: 1, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 10000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AK registration (value-based, avg $100)' },
  { jurisdictionId: 1, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AK doc fee (no cap, avg $350)' },
  
  // Arizona - ID 7
  { jurisdictionId: 7, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 400, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AZ title fee $4' },
  { jurisdictionId: 7, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 4000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AZ registration $8 + $32 public safety' },
  { jurisdictionId: 7, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AZ doc fee (no cap, avg $350)' },
  
  // Arkansas - ID 8
  { jurisdictionId: 8, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AR title fee $10' },
  { jurisdictionId: 8, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 2500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AR registration $17-30 (avg $25)' },
  { jurisdictionId: 8, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 11000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'AR doc fee (capped at $110)' },
  
  // California - ID 9
  { jurisdictionId: 9, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CA title fee $15' },
  { jurisdictionId: 9, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 6000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CA VLF (value-based, avg $60)' },
  { jurisdictionId: 9, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 8500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CA doc fee (capped at $85)' },
  
  // Colorado - ID 10
  { jurisdictionId: 10, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 720, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CO title fee $7.20' },
  { jurisdictionId: 10, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CO registration (age/weight based, avg $80)' },
  { jurisdictionId: 10, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 50000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CO doc fee (no cap, avg $500)' },
  
  // Connecticut - ID 11
  { jurisdictionId: 11, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 2500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CT title fee $25' },
  { jurisdictionId: 11, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 12000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CT registration $120 (2-year)' },
  { jurisdictionId: 11, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 41500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'CT doc fee (no cap, avg $415)' },
  
  // DC - ID 12
  { jurisdictionId: 12, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 2600, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'DC title fee $26' },
  { jurisdictionId: 12, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 7200, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'DC registration $72 (2-year)' },
  { jurisdictionId: 12, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 30000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'DC doc fee (no cap, avg $300)' },
  
  // Delaware - ID 2
  { jurisdictionId: 2, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 3500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'DE title fee $35' },
  { jurisdictionId: 2, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 4000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'DE registration $40' },
  { jurisdictionId: 2, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 29200, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'DE doc fee (no cap, avg $292)' },
  
  // Florida - ID 13
  { jurisdictionId: 13, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 7575, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'FL title fee $75.75' },
  { jurisdictionId: 13, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 22500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'FL registration $225 (new)' },
  { jurisdictionId: 13, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 89900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'FL doc fee (no cap, avg $899 - highest in US)' },
  
  // Georgia - ID 14
  { jurisdictionId: 14, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1800, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'GA title fee $18' },
  { jurisdictionId: 14, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 2000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'GA registration $20 + ad valorem' },
  { jurisdictionId: 14, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 52500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'GA doc fee (no cap, avg $525)' },
  
  // Hawaii - ID 15
  { jurisdictionId: 15, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 750, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'HI title fee $5-10 (avg $7.50)' },
  { jurisdictionId: 15, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 6000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'HI registration $45-75 (avg $60)' },
  { jurisdictionId: 15, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'HI doc fee (capped, avg $350)' },
  
  // Idaho - ID 16
  { jurisdictionId: 16, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1400, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ID title fee $14' },
  { jurisdictionId: 16, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ID registration $48-114 (avg $80)' },
  { jurisdictionId: 16, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 30000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ID doc fee (no cap, avg $300)' },
  
  // Illinois - ID 17
  { jurisdictionId: 17, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 15000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IL title fee $150' },
  { jurisdictionId: 17, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 15100, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IL registration $151' },
  { jurisdictionId: 17, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IL doc fee (capped, CPI-adjusted)' },
  
  // Indiana - ID 18
  { jurisdictionId: 18, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IN title fee $15' },
  { jurisdictionId: 18, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IN registration $21-39 (avg $30)' },
  { jurisdictionId: 18, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 30000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IN doc fee (no cap, avg $300)' },
  
  // Iowa - ID 19
  { jurisdictionId: 19, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 2500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IA title fee $25' },
  { jurisdictionId: 19, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IA registration (value/weight based, avg $80)' },
  { jurisdictionId: 19, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 20000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'IA doc fee (capped at ~$200)' },
  
  // Kansas - ID 20
  { jurisdictionId: 20, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'KS title fee $10' },
  { jurisdictionId: 20, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'KS registration $30-39 (avg $35)' },
  { jurisdictionId: 20, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 39900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'KS doc fee (no cap, avg $399)' },
  
  // Kentucky - ID 21
  { jurisdictionId: 21, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'KY title fee $9' },
  { jurisdictionId: 21, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 2100, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'KY registration $21' },
  { jurisdictionId: 21, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 45000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'KY doc fee (no cap, avg $450)' },
  
  // Louisiana - ID 22
  { jurisdictionId: 22, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 6850, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'LA title fee $68.50' },
  { jurisdictionId: 22, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 5000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'LA registration $20-82 (avg $50)' },
  { jurisdictionId: 22, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 30000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'LA doc fee (capped at ~$300)' },
  
  // Maine - ID 23
  { jurisdictionId: 23, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 3300, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ME title fee $33' },
  { jurisdictionId: 23, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ME registration $35 + excise tax' },
  { jurisdictionId: 23, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 49900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ME doc fee (no cap, avg $499)' },
  
  // Maryland - ID 24
  { jurisdictionId: 24, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 7500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MD title fee $50-100 (avg $75)' },
  { jurisdictionId: 24, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 16000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MD registration $135-187 (avg $160, 2-year)' },
  { jurisdictionId: 24, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 32500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MD doc fee (capped at ~$300-350)' },
  
  // Massachusetts - ID 25
  { jurisdictionId: 25, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 7500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MA title fee $75' },
  { jurisdictionId: 25, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 6000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MA registration $60 (2-year)' },
  { jurisdictionId: 25, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 39600, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MA doc fee (no cap, avg $396)' },
  
  // Michigan - ID 26
  { jurisdictionId: 26, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MI title fee $15' },
  { jurisdictionId: 26, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 10000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MI registration (MSRP-based, avg $100)' },
  { jurisdictionId: 26, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 23000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MI doc fee (capped at $230)' },
  
  // Minnesota - ID 27
  { jurisdictionId: 27, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1050, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MN title fee $8.25-11.25 (avg $10.50)' },
  { jurisdictionId: 27, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MN registration $35 + tax' },
  { jurisdictionId: 27, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 12500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MN doc fee (capped at $125)' },
  
  // Mississippi - ID 28
  { jurisdictionId: 28, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1250, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MS title fee $12.50' },
  { jurisdictionId: 28, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MS registration (value-based, avg $80)' },
  { jurisdictionId: 28, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 30000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MS doc fee (no cap, avg $300)' },
  
  // Missouri - ID 29
  { jurisdictionId: 29, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1100, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MO title fee $11' },
  { jurisdictionId: 29, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MO registration $18-51 (avg $35)' },
  { jurisdictionId: 29, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 56538, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MO doc fee (capped at $565.38 - highest cap in US)' },
  
  // Montana - ID 3
  { jurisdictionId: 3, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 5750, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MT title fee $27.50-87.50 (avg $57.50)' },
  { jurisdictionId: 3, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MT registration (age-based, avg $80)' },
  { jurisdictionId: 3, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 30000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'MT doc fee (no cap, avg $300)' },
  
  // Nebraska - ID 30
  { jurisdictionId: 30, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1200, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NE title fee $10-14 (avg $12)' },
  { jurisdictionId: 30, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 2500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NE registration $15-30 (avg $25)' },
  { jurisdictionId: 30, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 29900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NE doc fee (no cap, avg $299)' },
  
  // Nevada - ID 31
  { jurisdictionId: 31, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 2825, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NV title fee $28.25' },
  { jurisdictionId: 31, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3300, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NV registration $33' },
  { jurisdictionId: 31, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 49900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NV doc fee (no cap, avg $499)' },
  
  // New Hampshire - ID 4
  { jurisdictionId: 4, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 2500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NH title fee $25' },
  { jurisdictionId: 4, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 5000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NH registration $31-71 (avg $50)' },
  { jurisdictionId: 4, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 37200, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NH doc fee (no cap, avg $372)' },
  
  // New Jersey - ID 32
  { jurisdictionId: 32, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 6000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NJ title fee $60' },
  { jurisdictionId: 32, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 6000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NJ registration $35-84 (avg $60)' },
  { jurisdictionId: 32, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 39900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NJ doc fee (no cap, avg $399)' },
  
  // New Mexico - ID 33
  { jurisdictionId: 33, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NM title fee $7-11 (avg $9)' },
  { jurisdictionId: 33, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 4500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NM registration $27-62 (avg $45)' },
  { jurisdictionId: 33, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 33900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NM doc fee (no cap, avg $339)' },
  
  // New York - ID 34
  { jurisdictionId: 34, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 5000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NY title fee $50' },
  { jurisdictionId: 34, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NY registration $32-140 (avg $85, 2-year)' },
  { jurisdictionId: 34, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 7500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NY doc fee (capped at $75)' },
  
  // North Carolina - ID 35
  { jurisdictionId: 35, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 5200, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NC title fee $52' },
  { jurisdictionId: 35, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3875, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NC registration $38.75' },
  { jurisdictionId: 35, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 59900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'NC doc fee (no cap, avg $599)' },
  
  // North Dakota - ID 36
  { jurisdictionId: 36, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ND title fee $5' },
  { jurisdictionId: 36, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 7500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ND registration $49-99 (avg $75)' },
  { jurisdictionId: 36, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 29900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'ND doc fee (no cap, avg $299)' },
  
  // Ohio - ID 37
  { jurisdictionId: 37, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OH title fee $15' },
  { jurisdictionId: 37, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3450, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OH registration $34.50' },
  { jurisdictionId: 37, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 25000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OH doc fee (capped at ~$250)' },
  
  // Oklahoma - ID 38
  { jurisdictionId: 38, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1100, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OK title fee $11' },
  { jurisdictionId: 38, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 9000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OK registration $85-96 (avg $90)' },
  { jurisdictionId: 38, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OK doc fee (no cap, avg $350)' },
  
  // Oregon - ID 5
  { jurisdictionId: 5, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 14500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OR title fee $101-192 (avg $145)' },
  { jurisdictionId: 5, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 14000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OR registration $126-156 2yr (avg $140/yr)' },
  { jurisdictionId: 5, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 13250, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'OR doc fee (capped $115-150, avg $132.50)' },
  
  // Pennsylvania - ID 39
  { jurisdictionId: 39, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 5100, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'PA title fee $51' },
  { jurisdictionId: 39, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 3800, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'PA registration $38' },
  { jurisdictionId: 39, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'PA doc fee (no cap, avg $350)' },
  
  // Rhode Island - ID 40
  { jurisdictionId: 40, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 5250, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'RI title fee $52.50' },
  { jurisdictionId: 40, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 5500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'RI registration $30-80 (avg $55)' },
  { jurisdictionId: 40, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'RI doc fee (no cap, avg $350)' },
  
  // South Carolina - ID 41
  { jurisdictionId: 41, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'SC title fee $15' },
  { jurisdictionId: 41, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 4000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'SC registration $40' },
  { jurisdictionId: 41, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'SC doc fee (no cap, avg $350)' },
  
  // South Dakota - ID 42
  { jurisdictionId: 42, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'SD title fee $10' },
  { jurisdictionId: 42, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'SD registration $48-120 (avg $85)' },
  { jurisdictionId: 42, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 30000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'SD doc fee (no cap, avg $300)' },
  
  // Tennessee - ID 43
  { jurisdictionId: 43, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1450, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'TN title fee $14.50' },
  { jurisdictionId: 43, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 2700, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'TN registration $27 + county wheel tax' },
  { jurisdictionId: 43, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'TN doc fee (no cap, avg $350)' },
  
  // Texas - ID 44
  { jurisdictionId: 44, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 3000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'TX title fee $28-33 (avg $30)' },
  { jurisdictionId: 44, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 5075, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'TX registration $50.75' },
  { jurisdictionId: 44, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 15000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'TX doc fee (no cap, avg $150)' },
  
  // Utah - ID 45
  { jurisdictionId: 45, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'UT title fee $10' },
  { jurisdictionId: 45, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'UT registration (age/value based, avg $80)' },
  { jurisdictionId: 45, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'UT doc fee (no cap, avg $350)' },
  
  // Vermont - ID 46
  { jurisdictionId: 46, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 3800, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'VT title fee $38' },
  { jurisdictionId: 46, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8400, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'VT registration $76-92 (avg $84)' },
  { jurisdictionId: 46, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'VT doc fee (no cap, avg $350)' },
  
  // Virginia - ID 47
  { jurisdictionId: 47, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1250, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'VA title fee $10-15 (avg $12.50)' },
  { jurisdictionId: 47, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 4075, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'VA registration $40.75 + property tax' },
  { jurisdictionId: 47, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 89900, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'VA doc fee (no cap, avg $899)' },
  
  // Washington - ID 48
  { jurisdictionId: 48, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WA title fee $15' },
  { jurisdictionId: 48, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 5350, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WA registration $53.50 + RTA excise' },
  { jurisdictionId: 48, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 20000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WA doc fee (capped at ~$200)' },
  
  // West Virginia - ID 49
  { jurisdictionId: 49, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WV title fee $15' },
  { jurisdictionId: 49, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 4000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WV registration $30-51 (avg $40)' },
  { jurisdictionId: 49, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 17500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WV doc fee (capped at ~$150-200, avg $175)' },
  
  // Wisconsin - ID 50
  { jurisdictionId: 50, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 16450, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WI title fee $164.50 (includes reg)' },
  { jurisdictionId: 50, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WI registration $85' },
  { jurisdictionId: 50, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 35000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WI doc fee (no cap, avg $350)' },
  
  // Wyoming - ID 51
  { jurisdictionId: 51, code: 'TITLE', label: 'Title Fee', appliesTo: 'both', amountCents: 1500, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WY title fee $15' },
  { jurisdictionId: 51, code: 'REG', label: 'Registration Fee', appliesTo: 'both', amountCents: 8000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WY registration (age/value based, avg $80)' },
  { jurisdictionId: 51, code: 'DOC', label: 'Documentation Fee', appliesTo: 'both', amountCents: 30000, taxable: false, effectiveFrom: new Date('2025-01-01'), effectiveTo: null, notes: 'WY doc fee (no cap, avg $300)' },
];

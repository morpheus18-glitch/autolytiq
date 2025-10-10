/**
 * Enhanced Desking Module - Seed Data
 * 
 * This file contains seed data for:
 * - Jurisdictions (ZIP → State/County/City mapping)
 * - Tax Rules (Purchase and Lease tax logic by jurisdiction)
 * - Fee Catalog (Title, Registration, Doc fees by state)
 * - Lease Programs (Sample manufacturer programs)
 * - Calc Versions (Tax/fee rule source tracking)
 */

import type { InsertJurisdiction, InsertTaxRule, InsertFeeCatalogItem, InsertLeaseProgram, InsertCalcVersion } from '@shared/schema';

// ========================================
// Calculation Version
// ========================================
export const calcVersionSeed: InsertCalcVersion[] = [
  {
    sourceName: 'Internal',
    sourceVersion: '1.0.0',
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: 'Initial AutolytiQ tax and fee rules - curated from state DMV sources',
  },
];

// ========================================
// Jurisdictions (Sample ZIP codes)
// ========================================
export const jurisdictionsSeed: InsertJurisdiction[] = [
  // California
  { country: 'US', state: 'CA', county: 'Los Angeles', city: 'Los Angeles', zip: '90001' },
  { country: 'US', state: 'CA', county: 'Los Angeles', city: 'Los Angeles', zip: '90210' },
  { country: 'US', state: 'CA', county: 'San Diego', city: 'San Diego', zip: '92101' },
  { country: 'US', state: 'CA', county: 'Santa Clara', city: 'San Jose', zip: '95110' },
  
  // Texas
  { country: 'US', state: 'TX', county: 'Harris', city: 'Houston', zip: '77001' },
  { country: 'US', state: 'TX', county: 'Dallas', city: 'Dallas', zip: '75201' },
  { country: 'US', state: 'TX', county: 'Travis', city: 'Austin', zip: '78701' },
  
  // Florida
  { country: 'US', state: 'FL', county: 'Miami-Dade', city: 'Miami', zip: '33101' },
  { country: 'US', state: 'FL', county: 'Hillsborough', city: 'Tampa', zip: '33602' },
  { country: 'US', state: 'FL', county: 'Orange', city: 'Orlando', zip: '32801' },
  
  // New York
  { country: 'US', state: 'NY', county: 'New York', city: 'New York', zip: '10001' },
  { country: 'US', state: 'NY', county: 'Kings', city: 'Brooklyn', zip: '11201' },
  { country: 'US', state: 'NY', county: 'Erie', city: 'Buffalo', zip: '14201' },
  
  // Illinois
  { country: 'US', state: 'IL', county: 'Cook', city: 'Chicago', zip: '60601' },
  { country: 'US', state: 'IL', county: 'DuPage', city: 'Naperville', zip: '60540' },
  
  // Georgia
  { country: 'US', state: 'GA', county: 'Fulton', city: 'Atlanta', zip: '30301' },
  { country: 'US', state: 'GA', county: 'Gwinnett', city: 'Lawrenceville', zip: '30043' },
  
  // Washington
  { country: 'US', state: 'WA', county: 'King', city: 'Seattle', zip: '98101' },
  { country: 'US', state: 'WA', county: 'Pierce', city: 'Tacoma', zip: '98401' },
  
  // Michigan
  { country: 'US', state: 'MI', county: 'Wayne', city: 'Detroit', zip: '48201' },
  { country: 'US', state: 'MI', county: 'Oakland', city: 'Troy', zip: '48083' },
];

// ========================================
// Tax Rules
// ========================================
export const taxRulesSeed: InsertTaxRule[] = [
  // California - Tax on total price, trade credit applies
  {
    jurisdictionId: 1, // LA
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0725',
    precedence: 0,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'CA state sales tax 7.25% - applies after trade credit',
  },
  {
    jurisdictionId: 1, // LA County add-on
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0225',
    precedence: 1,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'LA County additional sales tax 2.25%',
  },
  
  // Texas - Tax on total, NO trade credit
  {
    jurisdictionId: 5, // Houston
    appliesTo: 'purchase',
    basis: 'price',
    rate: '0.0625',
    precedence: 0,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'TX state sales tax 6.25% - NO trade credit allowed',
  },
  {
    jurisdictionId: 5, // Houston local
    appliesTo: 'purchase',
    basis: 'price',
    rate: '0.0200',
    precedence: 1,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'Houston local sales tax 2.00%',
  },
  
  // Florida - Tax on total price, trade credit applies
  {
    jurisdictionId: 8, // Miami
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0600',
    precedence: 0,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'FL state sales tax 6.00% - trade credit applies',
  },
  {
    jurisdictionId: 8, // Miami-Dade local
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0100',
    precedence: 1,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'Miami-Dade local surtax 1.00%',
  },
  
  // New York - Tax on price, trade credit applies
  {
    jurisdictionId: 11, // NYC
    appliesTo: 'purchase',
    basis: 'net_of_trade',
    rate: '0.0400',
    precedence: 0,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'NY state sales tax 4.00%',
  },
  {
    jurisdictionId: 11, // NYC local
    appliesTo: 'purchase',
    basis: 'net_of_trade',
    rate: '0.0450',
    precedence: 1,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'NYC local sales tax 4.50%',
  },
  
  // Illinois - Tax on total, trade credit applies  
  {
    jurisdictionId: 14, // Chicago
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0625',
    precedence: 0,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'IL state sales tax 6.25%',
  },
  {
    jurisdictionId: 14, // Cook County
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0175',
    precedence: 1,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'Cook County sales tax 1.75%',
  },
  {
    jurisdictionId: 14, // Chicago city
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0175',
    precedence: 2,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'Chicago city sales tax 1.75%',
  },
  
  // Georgia - Tax on net of trade
  {
    jurisdictionId: 16, // Atlanta
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0400',
    precedence: 0,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'GA state sales tax 4.00% (Title Ad Valorem Tax - TAVT)',
  },
  
  // Washington - Tax on price, NO trade credit
  {
    jurisdictionId: 18, // Seattle
    appliesTo: 'both',
    basis: 'price',
    rate: '0.0650',
    precedence: 0,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'WA state sales tax 6.50% - NO trade credit',
  },
  {
    jurisdictionId: 18, // Seattle local
    appliesTo: 'both',
    basis: 'price',
    rate: '0.0350',
    precedence: 1,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'Seattle local sales tax 3.50%',
  },
  
  // Michigan - Tax on price, trade credit applies
  {
    jurisdictionId: 20, // Detroit
    appliesTo: 'both',
    basis: 'net_of_trade',
    rate: '0.0600',
    precedence: 0,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isCompound: false,
    notes: 'MI state sales tax 6.00%',
  },
];

// ========================================
// Fee Catalog
// ========================================
export const feeCatalogSeed: InsertFeeCatalogItem[] = [
  // California fees
  {
    jurisdictionId: 1,
    code: 'TITLE',
    label: 'Title Fee',
    appliesTo: 'both',
    amountCents: 6500, // $65
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: 'CA title transfer fee',
  },
  {
    jurisdictionId: 1,
    code: 'REG',
    label: 'Registration Fee',
    appliesTo: 'both',
    amountCents: 6000, // $60
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: 'CA vehicle registration',
  },
  {
    jurisdictionId: 1,
    code: 'DOC',
    label: 'Documentation Fee',
    appliesTo: 'both',
    amountCents: 8500, // $85 (CA max)
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: 'Dealer doc fee (CA max $85)',
  },
  
  // Texas fees
  {
    jurisdictionId: 5,
    code: 'TITLE',
    label: 'Title Fee',
    appliesTo: 'both',
    amountCents: 3300, // $33
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  {
    jurisdictionId: 5,
    code: 'REG',
    label: 'Registration Fee',
    appliesTo: 'both',
    amountCents: 5075, // $50.75
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  {
    jurisdictionId: 5,
    code: 'DOC',
    label: 'Documentation Fee',
    appliesTo: 'both',
    amountCents: 15000, // $150 (TX max)
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: 'Dealer doc fee (TX max $150)',
  },
  
  // Florida fees
  {
    jurisdictionId: 8,
    code: 'TITLE',
    label: 'Title Fee',
    appliesTo: 'both',
    amountCents: 7525, // $75.25
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  {
    jurisdictionId: 8,
    code: 'REG',
    label: 'Registration Fee',
    appliesTo: 'both',
    amountCents: 22500, // $225
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  {
    jurisdictionId: 8,
    code: 'DOC',
    label: 'Documentation Fee',
    appliesTo: 'both',
    amountCents: 69900, // $699 (FL typical)
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  
  // New York fees
  {
    jurisdictionId: 11,
    code: 'TITLE',
    label: 'Title Fee',
    appliesTo: 'both',
    amountCents: 5000, // $50
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  {
    jurisdictionId: 11,
    code: 'REG',
    label: 'Registration Fee',
    appliesTo: 'both',
    amountCents: 3250, // $32.50
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  {
    jurisdictionId: 11,
    code: 'DOC',
    label: 'Documentation Fee',
    appliesTo: 'both',
    amountCents: 7500, // $75 (NY max)
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: 'Dealer doc fee (NY max $75)',
  },
  
  // Illinois fees
  {
    jurisdictionId: 14,
    code: 'TITLE',
    label: 'Title Fee',
    appliesTo: 'both',
    amountCents: 15000, // $150
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  {
    jurisdictionId: 14,
    code: 'REG',
    label: 'Registration Fee',
    appliesTo: 'both',
    amountCents: 15100, // $151
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
  {
    jurisdictionId: 14,
    code: 'DOC',
    label: 'Documentation Fee',
    appliesTo: 'both',
    amountCents: 30000, // $300 (IL typical)
    taxable: false,
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
  },
];

// ========================================
// Lease Programs (Sample data)
// ========================================
export const leaseProgramsSeed: InsertLeaseProgram[] = [
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2025,
    residualSource: 'ALG',
    mfSource: 'Toyota Financial Services',
    term: 36,
    mileage: 12000,
    residualPct: '0.5800',
    moneyFactor: '0.001250', // ~3% APR
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: new Date('2025-03-31'),
    notes: '2025 Camry LE - 36mo/12k - Jan-Mar incentive',
  },
  {
    brand: 'Honda',
    model: 'Accord',
    year: 2025,
    residualSource: 'ALG',
    mfSource: 'Honda Financial Services',
    term: 36,
    mileage: 12000,
    residualPct: '0.5600',
    moneyFactor: '0.001500', // ~3.6% APR
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: new Date('2025-02-28'),
    notes: '2025 Accord LX - 36mo/12k',
  },
  {
    brand: 'BMW',
    model: '3 Series',
    year: 2025,
    residualSource: 'Manufacturer',
    mfSource: 'BMW Financial Services',
    term: 36,
    mileage: 10000,
    residualPct: '0.5400',
    moneyFactor: '0.002000', // ~4.8% APR
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: '2025 BMW 330i - 36mo/10k',
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2025,
    residualSource: 'Manufacturer',
    mfSource: 'Mercedes-Benz Financial Services',
    term: 39,
    mileage: 10000,
    residualPct: '0.5200',
    moneyFactor: '0.002100', // ~5% APR
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    notes: '2025 MB C300 - 39mo/10k',
  },
  {
    brand: 'Ford',
    model: 'F-150',
    year: 2025,
    residualSource: 'ALG',
    mfSource: 'Ford Credit',
    term: 36,
    mileage: 12000,
    residualPct: '0.6200',
    moneyFactor: '0.001667', // ~4% APR
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: new Date('2025-03-31'),
    notes: '2025 F-150 XLT - 36mo/12k - Strong residual',
  },
];

import prisma from '../lib/prisma.js';
import {
  buildBalanceSheet,
  buildIncomeStatement,
  type FinancialStatementResult,
  type StatementAccount,
  type StatementAccountEntry,
} from '../utils/financial-statement-generator.js';
import { createStatementOptions } from './accounting.service.js';

const EPOCH_START = new Date('1970-01-01T00:00:00Z');

export type BalanceSheetComparisonMode = 'NONE' | 'PREVIOUS_MONTH' | 'PREVIOUS_YEAR';

export interface BalanceSheetAccountBreakdown {
  accountId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  comparisonAmount: number;
  entries: StatementAccountEntry[];
}

export interface BalanceSheetLineItem {
  key: string;
  label: string;
  type: 'GROUP' | 'LINE' | 'SUBTOTAL' | 'TOTAL';
  amount: number;
  comparisonAmount: number;
  children?: BalanceSheetLineItem[];
  accounts?: BalanceSheetAccountBreakdown[];
}

export interface BalanceSheetSection {
  key: 'ASSETS' | 'LIABILITIES_EQUITY';
  label: string;
  total: number;
  comparisonTotal: number;
  children: BalanceSheetLineItem[];
}

export interface BalanceSheetRatios {
  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;
  workingCapital: number;
  inventoryTurnover: number | null;
  daysSalesInInventory: number | null;
}

export interface BalanceSheetReport {
  dealershipName?: string | null;
  asOfDate: string;
  generatedAt: string;
  comparison?: {
    mode: BalanceSheetComparisonMode;
    asOfDate?: string | null;
  } | null;
  sections: BalanceSheetSection[];
  totals: {
    currentAssets: number;
    totalAssets: number;
    netFixedAssets: number;
    totalFixedAssets: number;
    currentLiabilities: number;
    longTermLiabilities: number;
    totalLiabilities: number;
    totalEquity: number;
  };
  ratios: BalanceSheetRatios;
}

interface BucketAccumulator {
  amount: number;
  comparisonAmount: number;
  accounts: Map<string, BalanceSheetAccountBreakdown>;
}

const ASSET_BUCKETS = {
  CASH_OPERATING: 'assets.current.cash.operating',
  CASH_PAYROLL: 'assets.current.cash.payroll',
  CASH_SAVINGS: 'assets.current.cash.savings',
  CASH_OTHER: 'assets.current.cash.other',
  AR_CUSTOMER: 'assets.current.ar.customer',
  AR_LENDER: 'assets.current.ar.lender',
  AR_OTHER: 'assets.current.ar.other',
  AR_ALLOWANCE: 'assets.current.ar.allowance',
  INVENTORY_NEW: 'assets.current.inventory.new',
  INVENTORY_USED: 'assets.current.inventory.used',
  INVENTORY_PARTS: 'assets.current.inventory.parts',
  INVENTORY_ACCESSORIES: 'assets.current.inventory.accessories',
  INVENTORY_OTHER: 'assets.current.inventory.other',
  PREPAID_INSURANCE: 'assets.current.prepaid.insurance',
  PREPAID_RENT: 'assets.current.prepaid.rent',
  PREPAID_OTHER: 'assets.current.prepaid.other',
  CURRENT_OTHER: 'assets.current.other',
  FIXED_LAND: 'assets.fixed.land',
  FIXED_BUILDINGS: 'assets.fixed.buildings',
  FIXED_LEASEHOLD: 'assets.fixed.leasehold',
  FIXED_FURNITURE: 'assets.fixed.furniture',
  FIXED_EQUIPMENT: 'assets.fixed.equipment',
  FIXED_VEHICLES: 'assets.fixed.vehicles',
  FIXED_ACCUM_DEPRECIATION: 'assets.fixed.accumulatedDepreciation',
  OTHER_INTANGIBLES: 'assets.other.intangibles',
  OTHER_GOODWILL: 'assets.other.goodwill',
  OTHER_MISC: 'assets.other.other',
} as const;

const LIABILITY_BUCKETS = {
  ACCOUNTS_PAYABLE: 'liabilities.current.accountsPayable',
  FLOOR_PLAN_NEW: 'liabilities.current.floorPlan.new',
  FLOOR_PLAN_USED: 'liabilities.current.floorPlan.used',
  FLOOR_PLAN_OTHER: 'liabilities.current.floorPlan.other',
  ACCRUED_PAYROLL: 'liabilities.current.accrued.payroll',
  ACCRUED_COMMISSIONS: 'liabilities.current.accrued.commissions',
  ACCRUED_TAXES: 'liabilities.current.accrued.taxes',
  ACCRUED_OTHER: 'liabilities.current.accrued.other',
  CUSTOMER_DEPOSITS: 'liabilities.current.customerDeposits',
  CURRENT_PORTION_DEBT: 'liabilities.current.currentPortionDebt',
  CURRENT_OTHER: 'liabilities.current.other',
  LONG_TERM_DEBT: 'liabilities.longTerm.debt',
  LONG_TERM_NOTES: 'liabilities.longTerm.notesPayable',
  LONG_TERM_OTHER: 'liabilities.longTerm.other',
} as const;

const EQUITY_BUCKETS = {
  OWNERS_CAPITAL: 'equity.ownersCapital',
  RETAINED_EARNINGS: 'equity.retainedEarnings',
  CURRENT_YEAR_EARNINGS: 'equity.currentYearEarnings',
  OWNERS_DRAWS: 'equity.ownersDraws',
  OTHER: 'equity.other',
} as const;

function normalize(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function cloneEntries(entries: StatementAccountEntry[]): StatementAccountEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

function ensureBucket(map: Map<string, BucketAccumulator>, key: string): BucketAccumulator {
  const existing = map.get(key);
  if (existing) {
    return existing;
  }
  const bucket: BucketAccumulator = { amount: 0, comparisonAmount: 0, accounts: new Map() };
  map.set(key, bucket);
  return bucket;
}

function addAccountToBucket(
  map: Map<string, BucketAccumulator>,
  key: string,
  account: StatementAccount,
  mode: 'base' | 'comparison',
) {
  const bucket = ensureBucket(map, key);
  if (mode === 'base') {
    bucket.amount = normalize(bucket.amount + account.total);
    const existing = bucket.accounts.get(account.accountId);
    if (existing) {
      existing.amount = normalize(existing.amount + account.total);
      if (!existing.entries.length && account.entries.length) {
        existing.entries = cloneEntries(account.entries);
      }
    } else {
      bucket.accounts.set(account.accountId, {
        accountId: account.accountId,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount: normalize(account.total),
        comparisonAmount: 0,
        entries: cloneEntries(account.entries ?? []),
      });
    }
  } else {
    bucket.comparisonAmount = normalize(bucket.comparisonAmount + account.total);
    const existing = bucket.accounts.get(account.accountId);
    if (existing) {
      existing.comparisonAmount = normalize(existing.comparisonAmount + account.total);
    } else {
      bucket.accounts.set(account.accountId, {
        accountId: account.accountId,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount: 0,
        comparisonAmount: normalize(account.total),
        entries: [],
      });
    }
  }
}

function includesAny(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

function classifyAssetAccount(account: StatementAccount): string {
  const name = account.accountName.toLowerCase();
  const normalized = name.replace(/[_-]/g, ' ');
  const number = account.accountNumber?.toLowerCase() ?? '';

  if (/goodwill/.test(normalized)) {
    return ASSET_BUCKETS.OTHER_GOODWILL;
  }
  if (/(intangible|franchise|license|trademark|patent)/.test(normalized)) {
    return ASSET_BUCKETS.OTHER_INTANGIBLES;
  }
  if (/accumulated/.test(normalized) && includesAny(normalized, [/depre/, /amort/])) {
    return ASSET_BUCKETS.FIXED_ACCUM_DEPRECIATION;
  }
  if (/leasehold/.test(normalized)) {
    return ASSET_BUCKETS.FIXED_LEASEHOLD;
  }
  if (/land\b/.test(normalized)) {
    return ASSET_BUCKETS.FIXED_LAND;
  }
  if (/(building|facility|warehouse)/.test(normalized)) {
    return ASSET_BUCKETS.FIXED_BUILDINGS;
  }
  if (/(furniture|fixture)/.test(normalized)) {
    return ASSET_BUCKETS.FIXED_FURNITURE;
  }
  if (/(equipment|tool|machinery|computer|printer)/.test(normalized)) {
    return ASSET_BUCKETS.FIXED_EQUIPMENT;
  }
  if (/(vehicle|demo|loaner|company car|courtesy)/.test(normalized)) {
    return ASSET_BUCKETS.FIXED_VEHICLES;
  }

  if (/prepaid/.test(normalized)) {
    if (/insurance/.test(normalized)) {
      return ASSET_BUCKETS.PREPAID_INSURANCE;
    }
    if (/rent|lease/.test(normalized)) {
      return ASSET_BUCKETS.PREPAID_RENT;
    }
    return ASSET_BUCKETS.PREPAID_OTHER;
  }

  if (/(allowance|reserve).*receivable/.test(normalized) || /bad debt/.test(normalized)) {
    return ASSET_BUCKETS.AR_ALLOWANCE;
  }

  if (/(accounts receivable|a\/r|trade receivable|contract in transit|due from finance)/.test(normalized)) {
    if (includesAny(normalized, [/lender/, /finance/, /bank/, /oem/, /manufacturer/, /floor plan/, /in transit/])) {
      return ASSET_BUCKETS.AR_LENDER;
    }
    if (includesAny(normalized, [/customer/, /retail/, /wholesale/, /dealer/])) {
      return ASSET_BUCKETS.AR_CUSTOMER;
    }
    if (/other/.test(normalized)) {
      return ASSET_BUCKETS.AR_OTHER;
    }
    return ASSET_BUCKETS.AR_OTHER;
  }

  if (/inventory/.test(normalized) || /parts inv/.test(normalized)) {
    if (/new/.test(normalized)) {
      return ASSET_BUCKETS.INVENTORY_NEW;
    }
    if (/(used|pre-owned|preowned)/.test(normalized)) {
      return ASSET_BUCKETS.INVENTORY_USED;
    }
    if (/parts/.test(normalized)) {
      return ASSET_BUCKETS.INVENTORY_PARTS;
    }
    if (/accessor|aftermarket/.test(normalized)) {
      return ASSET_BUCKETS.INVENTORY_ACCESSORIES;
    }
    return ASSET_BUCKETS.INVENTORY_OTHER;
  }

  if (includesAny(normalized, [/cash/, /bank/, /checking/, /treasury/, /petty/])) {
    if (/payroll/.test(normalized)) {
      return ASSET_BUCKETS.CASH_PAYROLL;
    }
    if (includesAny(normalized, [/savings/, /money market/, /reserve/, /escrow/, /sweep/, /mmda/, /cd /])) {
      return ASSET_BUCKETS.CASH_SAVINGS;
    }
    if (includesAny(normalized, [/operating/, /general/, /main/, /primary/, /business/])) {
      return ASSET_BUCKETS.CASH_OPERATING;
    }
    return ASSET_BUCKETS.CASH_OTHER;
  }

  if (/(note|loan) receivable/.test(normalized)) {
    if (includesAny(normalized, [/short/, /current/])) {
      return ASSET_BUCKETS.CURRENT_OTHER;
    }
    return ASSET_BUCKETS.OTHER_MISC;
  }

  if (includesAny(normalized, [/security deposit/, /deposit/, /escrow/, /investment/, /long-term/, /deferred/, /other asset/])) {
    return ASSET_BUCKETS.OTHER_MISC;
  }

  if (includesAny(normalized, [/due from/, /employee advance/, /advance/, /receivable/])) {
    return ASSET_BUCKETS.CURRENT_OTHER;
  }

  const numeric = Number.parseInt(number, 10);
  if (!Number.isNaN(numeric) && numeric >= 1500) {
    return ASSET_BUCKETS.OTHER_MISC;
  }

  return ASSET_BUCKETS.CURRENT_OTHER;
}

function classifyLiabilityAccount(account: StatementAccount): string {
  const name = account.accountName.toLowerCase();
  const normalized = name.replace(/[_-]/g, ' ');

  if (/accounts payable|a\/p|trade payable/.test(normalized)) {
    return LIABILITY_BUCKETS.ACCOUNTS_PAYABLE;
  }

  if (/floor plan/.test(normalized)) {
    if (/new/.test(normalized)) {
      return LIABILITY_BUCKETS.FLOOR_PLAN_NEW;
    }
    if (/(used|pre-owned|preowned)/.test(normalized)) {
      return LIABILITY_BUCKETS.FLOOR_PLAN_USED;
    }
    return LIABILITY_BUCKETS.FLOOR_PLAN_OTHER;
  }

  if (/(accrued|accrual)/.test(normalized) || /expense payable/.test(normalized)) {
    if (/payroll|wage|salary/.test(normalized)) {
      return LIABILITY_BUCKETS.ACCRUED_PAYROLL;
    }
    if (/commission/.test(normalized)) {
      return LIABILITY_BUCKETS.ACCRUED_COMMISSIONS;
    }
    if (/tax|sales tax|use tax|property tax|income tax/.test(normalized)) {
      return LIABILITY_BUCKETS.ACCRUED_TAXES;
    }
    return LIABILITY_BUCKETS.ACCRUED_OTHER;
  }

  if (/(customer deposit|deposits|advance from customer|deferred revenue|down payment)/.test(normalized)) {
    return LIABILITY_BUCKETS.CUSTOMER_DEPOSITS;
  }

  if (/(current portion|current maturities|due within one year|short[- ]term debt|short[- ]term loan)/.test(normalized)) {
    return LIABILITY_BUCKETS.CURRENT_PORTION_DEBT;
  }

  if (/line of credit|credit card/.test(normalized)) {
    return LIABILITY_BUCKETS.CURRENT_OTHER;
  }

  if (/notes payable/.test(normalized)) {
    if (/short/.test(normalized) || /current/.test(normalized)) {
      return LIABILITY_BUCKETS.CURRENT_PORTION_DEBT;
    }
    return LIABILITY_BUCKETS.LONG_TERM_NOTES;
  }

  if (includesAny(normalized, [/long[- ]term debt/, /mortgage/, /loan payable/, /term loan/, /equipment loan/, /financing/])) {
    return LIABILITY_BUCKETS.LONG_TERM_DEBT;
  }

  if (includesAny(normalized, [/deferred tax/, /other long[- ]term/, /lease liability/, /pension/])) {
    return LIABILITY_BUCKETS.LONG_TERM_OTHER;
  }

  if (/payable/.test(normalized)) {
    return LIABILITY_BUCKETS.CURRENT_OTHER;
  }

  return LIABILITY_BUCKETS.LONG_TERM_OTHER;
}

function classifyEquityAccount(account: StatementAccount): string {
  const name = account.accountName.toLowerCase();
  const normalized = name.replace(/[_-]/g, ' ');

  if (/retained earnings/.test(normalized)) {
    return EQUITY_BUCKETS.RETAINED_EARNINGS;
  }
  if (/(current year earnings|current earnings|current profit|ytd profit|current year net)/.test(normalized)) {
    return EQUITY_BUCKETS.CURRENT_YEAR_EARNINGS;
  }
  if (/(draw|distribution|dividend|withdrawal)/.test(normalized)) {
    return EQUITY_BUCKETS.OWNERS_DRAWS;
  }
  if (/(capital|member equity|owners equity|paid in|common stock|preferred stock|partner capital)/.test(normalized)) {
    return EQUITY_BUCKETS.OWNERS_CAPITAL;
  }
  return EQUITY_BUCKETS.OTHER;
}

function mapAccountsToBuckets(
  accounts: StatementAccount[],
  comparison: StatementAccount[],
  classifier: (account: StatementAccount) => string,
): Map<string, BucketAccumulator> {
  const map = new Map<string, BucketAccumulator>();
  for (const account of accounts) {
    const bucketKey = classifier(account);
    addAccountToBucket(map, bucketKey, account, 'base');
  }
  for (const account of comparison) {
    const bucketKey = classifier(account);
    addAccountToBucket(map, bucketKey, account, 'comparison');
  }
  return map;
}

function bucketAccountsToArray(bucket?: BucketAccumulator): BalanceSheetAccountBreakdown[] {
  if (!bucket) {
    return [];
  }
  return Array.from(bucket.accounts.values()).sort((a, b) => a.accountNumber.localeCompare(b.accountNumber));
}

function createLineFromBucket(
  key: string,
  label: string,
  bucketMap: Map<string, BucketAccumulator>,
  bucketKey: string,
  type: 'LINE' | 'SUBTOTAL' | 'TOTAL' = 'LINE',
): BalanceSheetLineItem {
  const bucket = bucketMap.get(bucketKey);
  const accounts = bucketAccountsToArray(bucket);
  return {
    key,
    label,
    type,
    amount: normalize(bucket?.amount ?? 0),
    comparisonAmount: normalize(bucket?.comparisonAmount ?? 0),
    accounts,
  };
}

function flattenAccounts(lines: BalanceSheetLineItem[], includeAggregates = false): BalanceSheetAccountBreakdown[] {
  const map = new Map<string, BalanceSheetAccountBreakdown>();
  for (const line of lines) {
    if (line.accounts && (includeAggregates || line.type === 'LINE')) {
      for (const account of line.accounts) {
        const existing = map.get(account.accountId);
        if (existing) {
          existing.amount = normalize(existing.amount + account.amount);
          existing.comparisonAmount = normalize(existing.comparisonAmount + account.comparisonAmount);
        } else {
          map.set(account.accountId, {
            ...account,
            entries: account.entries.map((entry) => ({ ...entry })),
          });
        }
      }
    }
    if (line.children) {
      const nested = flattenAccounts(line.children, includeAggregates);
      for (const account of nested) {
        const existing = map.get(account.accountId);
        if (existing) {
          existing.amount = normalize(existing.amount + account.amount);
          existing.comparisonAmount = normalize(existing.comparisonAmount + account.comparisonAmount);
          if (!existing.entries.length && account.entries.length) {
            existing.entries = account.entries.map((entry) => ({ ...entry }));
          }
        } else {
          map.set(account.accountId, {
            ...account,
            entries: account.entries.map((entry) => ({ ...entry })),
          });
        }
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.accountNumber.localeCompare(b.accountNumber));
}

function createAggregateLine(
  key: string,
  label: string,
  type: 'SUBTOTAL' | 'TOTAL',
  lines: BalanceSheetLineItem[],
): BalanceSheetLineItem {
  const amount = normalize(lines.reduce((sum, line) => sum + line.amount, 0));
  const comparisonAmount = normalize(lines.reduce((sum, line) => sum + line.comparisonAmount, 0));
  return {
    key,
    label,
    type,
    amount,
    comparisonAmount,
    accounts: flattenAccounts(lines, true),
  };
}

function createGroup(
  key: string,
  label: string,
  children: BalanceSheetLineItem[],
): BalanceSheetLineItem {
  const amount = normalize(children.reduce((sum, child) => sum + child.amount, 0));
  const comparisonAmount = normalize(children.reduce((sum, child) => sum + child.comparisonAmount, 0));
  return {
    key,
    label,
    type: 'GROUP',
    amount,
    comparisonAmount,
    children,
  };
}

function computeComparisonDate(asOf: Date, comparison: BalanceSheetComparisonMode): Date | null {
  if (comparison === 'PREVIOUS_MONTH') {
    const result = new Date(asOf);
    result.setMonth(result.getMonth() - 1);
    return endOfDay(result);
  }
  if (comparison === 'PREVIOUS_YEAR') {
    const result = new Date(asOf);
    result.setFullYear(result.getFullYear() - 1);
    return endOfDay(result);
  }
  return null;
}

function findSection(
  statement: FinancialStatementResult | null,
  label: string,
): { total: number; accounts: StatementAccount[] } {
  const section = statement?.sections.find((entry) => entry.label === label);
  if (!section) {
    return { total: 0, accounts: [] };
  }
  return {
    total: normalize(section.total),
    accounts: section.accounts,
  };
}

function buildGroupWithAggregate(
  key: string,
  label: string,
  detailLines: BalanceSheetLineItem[],
  aggregate: { key: string; label: string; type: 'SUBTOTAL' | 'TOTAL' },
): { group: BalanceSheetLineItem; aggregateLine: BalanceSheetLineItem } {
  const aggregateLine = createAggregateLine(aggregate.key, aggregate.label, aggregate.type, detailLines);
  const group: BalanceSheetLineItem = {
    key,
    label,
    type: 'GROUP',
    amount: aggregateLine.amount,
    comparisonAmount: aggregateLine.comparisonAmount,
    children: [...detailLines, aggregateLine],
  };
  return { group, aggregateLine };
}

export async function getBalanceSheetReport(
  tenantId: string,
  options: { asOfDate: Date; comparison?: BalanceSheetComparisonMode },
): Promise<BalanceSheetReport> {
  const asOf = endOfDay(options.asOfDate ?? new Date());
  const comparisonMode = options.comparison ?? 'NONE';

  const statementOptions = createStatementOptions(tenantId, { startDate: EPOCH_START, endDate: asOf }, true);
  statementOptions.transactionLimit = 200;

  const [baseStatement, tenant] = await Promise.all([
    buildBalanceSheet(prisma, statementOptions),
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } }),
  ]);

  const comparisonDate = computeComparisonDate(asOf, comparisonMode);
  let comparisonStatement: FinancialStatementResult | null = null;
  if (comparisonDate) {
    const comparisonOptions = createStatementOptions(tenantId, { startDate: EPOCH_START, endDate: comparisonDate }, true);
    comparisonOptions.transactionLimit = 200;
    comparisonStatement = await buildBalanceSheet(prisma, comparisonOptions);
  }

  const assetsBase = findSection(baseStatement, 'Assets');
  const liabilitiesBase = findSection(baseStatement, 'Liabilities');
  const equityBase = findSection(baseStatement, 'Equity');

  const assetsComparison = findSection(comparisonStatement, 'Assets');
  const liabilitiesComparison = findSection(comparisonStatement, 'Liabilities');
  const equityComparison = findSection(comparisonStatement, 'Equity');

  const assetBuckets = mapAccountsToBuckets(assetsBase.accounts, assetsComparison.accounts, classifyAssetAccount);
  const liabilityBuckets = mapAccountsToBuckets(
    liabilitiesBase.accounts,
    liabilitiesComparison.accounts,
    classifyLiabilityAccount,
  );
  const equityBuckets = mapAccountsToBuckets(equityBase.accounts, equityComparison.accounts, classifyEquityAccount);

  const cashLines = [
    createLineFromBucket('cash-operating', 'Operating', assetBuckets, ASSET_BUCKETS.CASH_OPERATING),
    createLineFromBucket('cash-payroll', 'Payroll', assetBuckets, ASSET_BUCKETS.CASH_PAYROLL),
    createLineFromBucket('cash-savings', 'Savings', assetBuckets, ASSET_BUCKETS.CASH_SAVINGS),
    createLineFromBucket('cash-other', 'Other Cash', assetBuckets, ASSET_BUCKETS.CASH_OTHER),
  ];
  const { group: cashGroup } = buildGroupWithAggregate('cash-equivalents', 'Cash & Cash Equivalents', cashLines, {
    key: 'cash-total',
    label: 'Total Cash',
    type: 'SUBTOTAL',
  });

  const arLines = [
    createLineFromBucket('ar-customer', 'Customer', assetBuckets, ASSET_BUCKETS.AR_CUSTOMER),
    createLineFromBucket('ar-lender', 'Lender', assetBuckets, ASSET_BUCKETS.AR_LENDER),
    createLineFromBucket('ar-other', 'Other', assetBuckets, ASSET_BUCKETS.AR_OTHER),
    createLineFromBucket('ar-allowance', 'Less: Allowance', assetBuckets, ASSET_BUCKETS.AR_ALLOWANCE),
  ];
  const { group: accountsReceivableGroup } = buildGroupWithAggregate(
    'accounts-receivable',
    'Accounts Receivable',
    arLines,
    { key: 'ar-net', label: 'Net Accounts Receivable', type: 'SUBTOTAL' },
  );

  const inventoryLines = [
    createLineFromBucket('inventory-new', 'New Vehicle', assetBuckets, ASSET_BUCKETS.INVENTORY_NEW),
    createLineFromBucket('inventory-used', 'Used Vehicle', assetBuckets, ASSET_BUCKETS.INVENTORY_USED),
    createLineFromBucket('inventory-parts', 'Parts', assetBuckets, ASSET_BUCKETS.INVENTORY_PARTS),
    createLineFromBucket('inventory-accessories', 'Accessories', assetBuckets, ASSET_BUCKETS.INVENTORY_ACCESSORIES),
    createLineFromBucket('inventory-other', 'Other Inventory', assetBuckets, ASSET_BUCKETS.INVENTORY_OTHER),
  ];
  const { group: inventoryGroup } = buildGroupWithAggregate('inventory', 'Inventory', inventoryLines, {
    key: 'inventory-total',
    label: 'Total Inventory',
    type: 'SUBTOTAL',
  });

  const prepaidLines = [
    createLineFromBucket('prepaid-insurance', 'Insurance', assetBuckets, ASSET_BUCKETS.PREPAID_INSURANCE),
    createLineFromBucket('prepaid-rent', 'Rent', assetBuckets, ASSET_BUCKETS.PREPAID_RENT),
    createLineFromBucket('prepaid-other', 'Other', assetBuckets, ASSET_BUCKETS.PREPAID_OTHER),
  ];
  const { group: prepaidGroup } = buildGroupWithAggregate('prepaid-expenses', 'Prepaid Expenses', prepaidLines, {
    key: 'prepaid-total',
    label: 'Total Prepaid Expenses',
    type: 'SUBTOTAL',
  });

  const otherCurrentAssets = createLineFromBucket(
    'other-current-assets',
    'Other Current Assets',
    assetBuckets,
    ASSET_BUCKETS.CURRENT_OTHER,
  );

  const currentAssetsChildren = [cashGroup, accountsReceivableGroup, inventoryGroup, prepaidGroup, otherCurrentAssets];
  const totalCurrentAssets = createAggregateLine('total-current-assets', 'Total Current Assets', 'TOTAL', currentAssetsChildren);
  const currentAssetsGroup: BalanceSheetLineItem = {
    key: 'current-assets',
    label: 'Current Assets',
    type: 'GROUP',
    amount: totalCurrentAssets.amount,
    comparisonAmount: totalCurrentAssets.comparisonAmount,
    children: [...currentAssetsChildren, totalCurrentAssets],
  };

  const fixedAssetLines = [
    createLineFromBucket('fixed-land', 'Land', assetBuckets, ASSET_BUCKETS.FIXED_LAND),
    createLineFromBucket('fixed-buildings', 'Buildings', assetBuckets, ASSET_BUCKETS.FIXED_BUILDINGS),
    createLineFromBucket('fixed-leasehold', 'Leasehold Improvements', assetBuckets, ASSET_BUCKETS.FIXED_LEASEHOLD),
    createLineFromBucket('fixed-furniture', 'Furniture & Fixtures', assetBuckets, ASSET_BUCKETS.FIXED_FURNITURE),
    createLineFromBucket('fixed-equipment', 'Equipment & Tools', assetBuckets, ASSET_BUCKETS.FIXED_EQUIPMENT),
    createLineFromBucket('fixed-vehicles', 'Vehicles (Demo/Loaner)', assetBuckets, ASSET_BUCKETS.FIXED_VEHICLES),
    createLineFromBucket(
      'fixed-accum-depreciation',
      'Less: Accumulated Depreciation',
      assetBuckets,
      ASSET_BUCKETS.FIXED_ACCUM_DEPRECIATION,
    ),
  ];
  const fixedAssetsAmount = normalize(fixedAssetLines.reduce((sum, line) => sum + line.amount, 0));
  const fixedAssetsComparison = normalize(
    fixedAssetLines.reduce((sum, line) => sum + line.comparisonAmount, 0),
  );
  const fixedAssetsGroup: BalanceSheetLineItem = {
    key: 'fixed-assets',
    label: 'Fixed Assets (PP&E)',
    type: 'GROUP',
    amount: fixedAssetsAmount,
    comparisonAmount: fixedAssetsComparison,
    children: fixedAssetLines,
  };
  const netFixedAssets = createAggregateLine('net-fixed-assets', 'Net Fixed Assets', 'TOTAL', fixedAssetLines);

  const otherAssetLines = [
    createLineFromBucket('other-intangibles', 'Intangibles', assetBuckets, ASSET_BUCKETS.OTHER_INTANGIBLES),
    createLineFromBucket('other-goodwill', 'Goodwill', assetBuckets, ASSET_BUCKETS.OTHER_GOODWILL),
    createLineFromBucket('other-assets', 'Other', assetBuckets, ASSET_BUCKETS.OTHER_MISC),
  ];
  const { group: otherAssetsGroup, aggregateLine: totalOtherAssets } = buildGroupWithAggregate(
    'other-assets',
    'Other Assets',
    otherAssetLines,
    { key: 'total-other-assets', label: 'Total Other Assets', type: 'SUBTOTAL' },
  );

  const totalFixedAssets = createAggregateLine('total-fixed-assets', 'Total Fixed Assets', 'TOTAL', [
    netFixedAssets,
    totalOtherAssets,
  ]);

  const totalAssetsLine = createAggregateLine('total-assets', 'Total Assets', 'TOTAL', [
    totalCurrentAssets,
    totalFixedAssets,
  ]);

  const accountsPayable = createLineFromBucket(
    'accounts-payable',
    'Accounts Payable',
    liabilityBuckets,
    LIABILITY_BUCKETS.ACCOUNTS_PAYABLE,
  );

  const floorPlanLines = [
    createLineFromBucket('floor-plan-new', 'Floor Plan Payable – New', liabilityBuckets, LIABILITY_BUCKETS.FLOOR_PLAN_NEW),
    createLineFromBucket('floor-plan-used', 'Floor Plan Payable – Used', liabilityBuckets, LIABILITY_BUCKETS.FLOOR_PLAN_USED),
    createLineFromBucket('floor-plan-other', 'Floor Plan Payable – Other', liabilityBuckets, LIABILITY_BUCKETS.FLOOR_PLAN_OTHER),
  ];
  const { group: floorPlanGroup } = buildGroupWithAggregate('floor-plan', 'Floor Plan Payable', floorPlanLines, {
    key: 'floor-plan-total',
    label: 'Total Floor Plan Payable',
    type: 'SUBTOTAL',
  });

  const accruedLines = [
    createLineFromBucket('accrued-payroll', 'Accrued Payroll', liabilityBuckets, LIABILITY_BUCKETS.ACCRUED_PAYROLL),
    createLineFromBucket('accrued-commissions', 'Accrued Commissions', liabilityBuckets, LIABILITY_BUCKETS.ACCRUED_COMMISSIONS),
    createLineFromBucket('accrued-taxes', 'Accrued Taxes', liabilityBuckets, LIABILITY_BUCKETS.ACCRUED_TAXES),
    createLineFromBucket('accrued-other', 'Other Accrued Expenses', liabilityBuckets, LIABILITY_BUCKETS.ACCRUED_OTHER),
  ];
  const { group: accruedGroup } = buildGroupWithAggregate('accrued-expenses', 'Accrued Expenses', accruedLines, {
    key: 'accrued-total',
    label: 'Total Accrued Expenses',
    type: 'SUBTOTAL',
  });

  const customerDeposits = createLineFromBucket(
    'customer-deposits',
    'Customer Deposits',
    liabilityBuckets,
    LIABILITY_BUCKETS.CUSTOMER_DEPOSITS,
  );
  const currentPortionDebt = createLineFromBucket(
    'current-portion-debt',
    'Current Portion of Long-term Debt',
    liabilityBuckets,
    LIABILITY_BUCKETS.CURRENT_PORTION_DEBT,
  );
  const otherCurrentLiabilities = createLineFromBucket(
    'other-current-liabilities',
    'Other Current Liabilities',
    liabilityBuckets,
    LIABILITY_BUCKETS.CURRENT_OTHER,
  );

  const currentLiabilityDetails = [
    accountsPayable,
    floorPlanGroup,
    accruedGroup,
    customerDeposits,
    currentPortionDebt,
    otherCurrentLiabilities,
  ];
  const totalCurrentLiabilities = createAggregateLine(
    'total-current-liabilities',
    'Total Current Liabilities',
    'TOTAL',
    currentLiabilityDetails,
  );
  const currentLiabilitiesGroup: BalanceSheetLineItem = {
    key: 'current-liabilities',
    label: 'Current Liabilities',
    type: 'GROUP',
    amount: totalCurrentLiabilities.amount,
    comparisonAmount: totalCurrentLiabilities.comparisonAmount,
    children: [
      accountsPayable,
      floorPlanGroup,
      accruedGroup,
      customerDeposits,
      currentPortionDebt,
      otherCurrentLiabilities,
      totalCurrentLiabilities,
    ],
  };

  const longTermDebt = createLineFromBucket('long-term-debt', 'Long-term Debt', liabilityBuckets, LIABILITY_BUCKETS.LONG_TERM_DEBT);
  const notesPayable = createLineFromBucket('long-term-notes', 'Notes Payable', liabilityBuckets, LIABILITY_BUCKETS.LONG_TERM_NOTES);
  const otherLongTerm = createLineFromBucket(
    'long-term-other',
    'Other Long-term Liabilities',
    liabilityBuckets,
    LIABILITY_BUCKETS.LONG_TERM_OTHER,
  );

  const longTermLines = [longTermDebt, notesPayable, otherLongTerm];
  const { group: longTermLiabilitiesGroup, aggregateLine: totalLongTermLiabilities } = buildGroupWithAggregate(
    'long-term-liabilities',
    'Long-term Liabilities',
    longTermLines,
    { key: 'total-long-term-liabilities', label: 'Total Long-term Liabilities', type: 'SUBTOTAL' },
  );

  const totalLiabilitiesLine = createAggregateLine('total-liabilities', 'Total Liabilities', 'TOTAL', [
    totalCurrentLiabilities,
    totalLongTermLiabilities,
  ]);

  const ownersCapital = createLineFromBucket('equity-owners-capital', "Owner's Capital", equityBuckets, EQUITY_BUCKETS.OWNERS_CAPITAL);
  const retainedEarnings = createLineFromBucket(
    'equity-retained-earnings',
    'Retained Earnings',
    equityBuckets,
    EQUITY_BUCKETS.RETAINED_EARNINGS,
  );
  const currentYearEarnings = createLineFromBucket(
    'equity-current-year',
    'Current Year Earnings',
    equityBuckets,
    EQUITY_BUCKETS.CURRENT_YEAR_EARNINGS,
  );
  const ownersDraws = createLineFromBucket("equity-owners-draws", "Owner's Draws", equityBuckets, EQUITY_BUCKETS.OWNERS_DRAWS);
  const otherEquity = createLineFromBucket('equity-other', 'Other Equity', equityBuckets, EQUITY_BUCKETS.OTHER);

  const equityLines: BalanceSheetLineItem[] = [
    ownersCapital,
    retainedEarnings,
    currentYearEarnings,
    ownersDraws,
  ];
  if (Math.abs(otherEquity.amount) > 0.005 || Math.abs(otherEquity.comparisonAmount) > 0.005) {
    equityLines.push(otherEquity);
  }
  const totalEquityLine = createAggregateLine('total-equity', 'Total Equity', 'TOTAL', equityLines);
  const equityGroup: BalanceSheetLineItem = {
    key: 'equity',
    label: 'Equity',
    type: 'GROUP',
    amount: totalEquityLine.amount,
    comparisonAmount: totalEquityLine.comparisonAmount,
    children: [...equityLines, totalEquityLine],
  };

  const totalLiabilitiesAndEquity = createAggregateLine(
    'total-liabilities-equity',
    'Total Liabilities & Equity',
    'TOTAL',
    [totalLiabilitiesLine, totalEquityLine],
  );

  const assetsSection: BalanceSheetSection = {
    key: 'ASSETS',
    label: 'Assets',
    total: totalAssetsLine.amount,
    comparisonTotal: totalAssetsLine.comparisonAmount,
    children: [
      currentAssetsGroup,
      fixedAssetsGroup,
      netFixedAssets,
      otherAssetsGroup,
      totalFixedAssets,
      totalAssetsLine,
    ],
  };

  const liabilitiesEquitySection: BalanceSheetSection = {
    key: 'LIABILITIES_EQUITY',
    label: 'Liabilities & Equity',
    total: totalLiabilitiesAndEquity.amount,
    comparisonTotal: totalLiabilitiesAndEquity.comparisonAmount,
    children: [
      currentLiabilitiesGroup,
      longTermLiabilitiesGroup,
      totalLiabilitiesLine,
      equityGroup,
      totalEquityLine,
      totalLiabilitiesAndEquity,
    ],
  };

  const trailingStart = new Date(asOf);
  trailingStart.setFullYear(trailingStart.getFullYear() - 1);
  const incomeOptions = createStatementOptions(tenantId, { startDate: trailingStart, endDate: asOf }, false);
  const trailingIncome = await buildIncomeStatement(prisma, incomeOptions);
  const costOfGoodsSold = trailingIncome.totals.costOfGoodsSold ?? 0;

  const currentAssetsAmount = totalCurrentAssets.amount;
  const inventoryAmount = inventoryGroup.amount;
  const currentLiabilitiesAmount = totalCurrentLiabilities.amount;
  const longTermLiabilitiesAmount = totalLongTermLiabilities.amount;
  const totalLiabilitiesAmount = totalLiabilitiesLine.amount;
  const totalEquityAmount = totalEquityLine.amount;
  const totalAssetsAmount = totalAssetsLine.amount;
  const netFixedAssetsAmount = netFixedAssets.amount;
  const totalFixedAssetsAmount = totalFixedAssets.amount;

  const quickAssets = normalize(currentAssetsAmount - inventoryAmount);
  const currentRatio = currentLiabilitiesAmount !== 0 ? normalize(currentAssetsAmount / currentLiabilitiesAmount) : null;
  const quickRatio = currentLiabilitiesAmount !== 0 ? normalize(quickAssets / currentLiabilitiesAmount) : null;
  const debtToEquity = totalEquityAmount !== 0 ? normalize(totalLiabilitiesAmount / totalEquityAmount) : null;
  const workingCapital = normalize(currentAssetsAmount - currentLiabilitiesAmount);

  const comparisonInventory = inventoryGroup.comparisonAmount;
  const averageInventory = comparisonDate ? (inventoryAmount + comparisonInventory) / 2 : inventoryAmount;
  const inventoryTurnover = averageInventory !== 0 ? normalize(costOfGoodsSold / averageInventory) : null;
  const daysSalesInInventory = inventoryTurnover && inventoryTurnover !== 0 ? normalize(365 / inventoryTurnover) : null;

  return {
    dealershipName: tenant?.name,
    asOfDate: asOf.toISOString(),
    generatedAt: new Date().toISOString(),
    comparison:
      comparisonMode === 'NONE'
        ? null
        : {
            mode: comparisonMode,
            asOfDate: comparisonDate?.toISOString() ?? null,
          },
    sections: [assetsSection, liabilitiesEquitySection],
    totals: {
      currentAssets: currentAssetsAmount,
      totalAssets: totalAssetsAmount,
      netFixedAssets: netFixedAssetsAmount,
      totalFixedAssets: totalFixedAssetsAmount,
      currentLiabilities: currentLiabilitiesAmount,
      longTermLiabilities: longTermLiabilitiesAmount,
      totalLiabilities: totalLiabilitiesAmount,
      totalEquity: totalEquityAmount,
    },
    ratios: {
      currentRatio,
      quickRatio,
      debtToEquity,
      workingCapital,
      inventoryTurnover,
      daysSalesInInventory,
    },
  };
}


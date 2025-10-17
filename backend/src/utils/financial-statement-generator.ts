import {
  AccountType,
  JournalStatus,
  LineType,
  NormalBalance,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type Numeric = number | Decimal | Prisma.Decimal | null | undefined;

export interface StatementAccountEntry {
  journalEntryId: string;
  entryNumber: string;
  postingDate: string;
  memo?: string | null;
  debit: number;
  credit: number;
}

export interface StatementAccount {
  accountId: string;
  accountNumber: string;
  accountName: string;
  normalBalance: NormalBalance;
  total: number;
  entries: StatementAccountEntry[];
}

export interface StatementSection {
  label: string;
  total: number;
  accounts: StatementAccount[];
}

export interface FinancialStatementResult {
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  sections: StatementSection[];
  totals: Record<string, number>;
}

export interface StatementOptions {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  includeTransactions?: boolean;
  transactionLimit?: number;
}

type AccountBalance = {
  accountId: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
  debit: number;
  credit: number;
  entries: StatementAccountEntry[];
};

function toNumber(value: Numeric): number {
  if (!value) {
    return 0;
  }
  if (value instanceof Decimal) {
    return Number(value.toFixed(2));
  }
  if ((value as Prisma.Decimal)?.toNumber) {
    return Number((value as Prisma.Decimal).toFixed(2));
  }
  return Number(value);
}

function normalizeAmount(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function calculateBalance(account: AccountBalance): number {
  const debit = normalizeAmount(account.debit);
  const credit = normalizeAmount(account.credit);
  return account.normalBalance === NormalBalance.DEBIT
    ? normalizeAmount(debit - credit)
    : normalizeAmount(credit - debit);
}

function mergeEntries(
  existing: StatementAccountEntry[],
  addition: StatementAccountEntry,
  limit: number,
): StatementAccountEntry[] {
  if (existing.length >= limit) {
    return existing;
  }
  return [...existing, addition];
}

async function collectAccountBalances(
  prisma: PrismaClient,
  options: StatementOptions,
): Promise<Map<string, AccountBalance>> {
  const { tenantId, startDate, endDate, includeTransactions, transactionLimit = 200 } = options;

  const lines = await prisma.journalEntryLine.findMany({
    where: {
      tenantId,
      journalEntry: {
        status: JournalStatus.POSTED,
        postingDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    },
    include: {
      glAccount: {
        select: {
          id: true,
          accountNumber: true,
          accountName: true,
          accountType: true,
          normalBalance: true,
        },
      },
      journalEntry: {
        select: {
          id: true,
          postingDate: true,
          memo: true,
          entryNumber: true,
        },
      },
    },
    orderBy: {
      journalEntry: {
        postingDate: 'asc',
      },
    },
  });

  const balances = new Map<string, AccountBalance>();

  for (const line of lines) {
    const key = line.glAccountId;
    const current = balances.get(key) ?? {
      accountId: line.glAccountId,
      accountNumber: line.glAccount.accountNumber,
      accountName: line.glAccount.accountName,
      accountType: line.glAccount.accountType,
      normalBalance: line.glAccount.normalBalance,
      debit: 0,
      credit: 0,
      entries: [],
    };

    const amount = toNumber(line.amount);
    if (line.type === LineType.DEBIT) {
      current.debit += amount;
    } else {
      current.credit += amount;
    }

    if (includeTransactions) {
      current.entries = mergeEntries(
        current.entries,
        {
          journalEntryId: line.journalEntry.id,
          entryNumber: line.journalEntry.entryNumber,
          postingDate: line.journalEntry.postingDate.toISOString(),
          memo: line.journalEntry.memo,
          debit: line.type === LineType.DEBIT ? amount : 0,
          credit: line.type === LineType.CREDIT ? amount : 0,
        },
        transactionLimit,
      );
    }

    balances.set(key, current);
  }

  return balances;
}

function buildSection(
  label: string,
  accounts: AccountBalance[],
  predicate: (account: AccountBalance) => boolean,
): StatementSection {
  const filtered = accounts.filter(predicate);
  const statementAccounts: StatementAccount[] = filtered.map((account) => ({
    accountId: account.accountId,
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    normalBalance: account.normalBalance,
    total: calculateBalance(account),
    entries: account.entries,
  }));

  const total = normalizeAmount(
    statementAccounts.reduce((sum, account) => sum + account.total, 0),
  );

  return {
    label,
    total,
    accounts: statementAccounts.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
  };
}

export async function buildIncomeStatement(
  prisma: PrismaClient,
  options: StatementOptions,
): Promise<FinancialStatementResult> {
  const balances = await collectAccountBalances(prisma, options);
  const accountList = Array.from(balances.values());

  const revenueSection = buildSection('Revenue', accountList, (account) => account.accountType === AccountType.REVENUE);

  const cogsSection = buildSection('Cost of Goods Sold', accountList, (account) =>
    account.accountType === AccountType.EXPENSE && /cost of goods|cogs/i.test(account.accountName),
  );

  const expenseSection = buildSection('Operating Expenses', accountList, (account) =>
    account.accountType === AccountType.EXPENSE && !/cost of goods|cogs/i.test(account.accountName),
  );

  const grossProfit = normalizeAmount(revenueSection.total - cogsSection.total);
  const netIncome = normalizeAmount(grossProfit - expenseSection.total);

  return {
    generatedAt: new Date().toISOString(),
    period: {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
    },
    sections: [revenueSection, cogsSection, expenseSection],
    totals: {
      revenue: revenueSection.total,
      costOfGoodsSold: cogsSection.total,
      grossProfit,
      operatingExpenses: expenseSection.total,
      netIncome,
    },
  };
}

export async function buildBalanceSheet(
  prisma: PrismaClient,
  options: StatementOptions,
): Promise<FinancialStatementResult> {
  const balances = await collectAccountBalances(prisma, {
    ...options,
    startDate: new Date('1970-01-01T00:00:00Z'),
  });
  const accountList = Array.from(balances.values());

  const assetsSection = buildSection('Assets', accountList, (account) => account.accountType === AccountType.ASSET);
  const liabilitySection = buildSection('Liabilities', accountList, (account) => account.accountType === AccountType.LIABILITY);
  const equitySection = buildSection('Equity', accountList, (account) => account.accountType === AccountType.EQUITY);

  const assets = assetsSection.total;
  const liabilities = liabilitySection.total;
  const equity = equitySection.total;

  return {
    generatedAt: new Date().toISOString(),
    period: {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
    },
    sections: [assetsSection, liabilitySection, equitySection],
    totals: {
      assets,
      liabilities,
      equity,
      assetsEqualsLiabilitiesPlusEquity: normalizeAmount(liabilities + equity),
    },
  };
}

function determineCashCategory(accounts: AccountBalance[], journalEntryId: string): 'OPERATING' | 'INVESTING' | 'FINANCING' {
  const relatedAccounts = accounts.filter((account) =>
    account.entries.some((entry) => entry.journalEntryId === journalEntryId),
  );

  let operatingWeight = 0;
  let investingWeight = 0;
  let financingWeight = 0;

  for (const account of relatedAccounts) {
    const total = Math.abs(calculateBalance(account));
    switch (account.accountType) {
      case AccountType.REVENUE:
      case AccountType.EXPENSE:
        operatingWeight += total;
        break;
      case AccountType.ASSET:
        investingWeight += total;
        break;
      case AccountType.LIABILITY:
      case AccountType.EQUITY:
        financingWeight += total;
        break;
      default:
        operatingWeight += total;
        break;
    }
  }

  const maxWeight = Math.max(operatingWeight, investingWeight, financingWeight);
  if (maxWeight === financingWeight) {
    return 'FINANCING';
  }
  if (maxWeight === investingWeight) {
    return 'INVESTING';
  }
  return 'OPERATING';
}

export async function buildCashFlowStatement(
  prisma: PrismaClient,
  options: StatementOptions,
): Promise<FinancialStatementResult> {
  const balances = await collectAccountBalances(prisma, {
    ...options,
    includeTransactions: true,
  });
  const accountList = Array.from(balances.values());

  const cashAccounts = accountList.filter((account) =>
    account.accountType === AccountType.ASSET && /cash|bank|checking|savings/i.test(account.accountName),
  );

  const operating: StatementAccount[] = [];
  const investing: StatementAccount[] = [];
  const financing: StatementAccount[] = [];

  let operatingTotal = 0;
  let investingTotal = 0;
  let financingTotal = 0;

  for (const account of cashAccounts) {
    const netCash = account.entries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0);
    const category = determineCashCategory(accountList, account.entries[0]?.journalEntryId ?? '');
    const statementAccount: StatementAccount = {
      accountId: account.accountId,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      normalBalance: account.normalBalance,
      total: normalizeAmount(netCash),
      entries: account.entries,
    };

    if (category === 'FINANCING') {
      financing.push(statementAccount);
      financingTotal += statementAccount.total;
    } else if (category === 'INVESTING') {
      investing.push(statementAccount);
      investingTotal += statementAccount.total;
    } else {
      operating.push(statementAccount);
      operatingTotal += statementAccount.total;
    }
  }

  const netChange = normalizeAmount(operatingTotal + investingTotal + financingTotal);

  const operatingSection: StatementSection = {
    label: 'Operating Activities',
    total: normalizeAmount(operatingTotal),
    accounts: operating,
  };
  const investingSection: StatementSection = {
    label: 'Investing Activities',
    total: normalizeAmount(investingTotal),
    accounts: investing,
  };
  const financingSection: StatementSection = {
    label: 'Financing Activities',
    total: normalizeAmount(financingTotal),
    accounts: financing,
  };

  return {
    generatedAt: new Date().toISOString(),
    period: {
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
    },
    sections: [operatingSection, investingSection, financingSection],
    totals: {
      operating: operatingSection.total,
      investing: investingSection.total,
      financing: financingSection.total,
      netChange,
    },
  };
}

export async function getAccountBalances(
  prisma: PrismaClient,
  options: StatementOptions,
): Promise<StatementAccount[]> {
  const balances = await collectAccountBalances(prisma, options);
  return Array.from(balances.values()).map((account) => ({
    accountId: account.accountId,
    accountNumber: account.accountNumber,
    accountName: account.accountName,
    normalBalance: account.normalBalance,
    total: calculateBalance(account),
    entries: account.entries,
  }));
}

/**
 * General Ledger Accounts
 * Chart of accounts for automotive dealership accounting
 */

import { AccountType, NormalBalance } from '@prisma/client';

export const GL_ACCOUNTS = [
  {
    accountNumber: '1000',
    accountName: 'Operating Cash',
    accountType: AccountType.ASSET,
    normalBalance: NormalBalance.DEBIT,
  },
  {
    accountNumber: '1100',
    accountName: 'Accounts Receivable',
    accountType: AccountType.ASSET,
    normalBalance: NormalBalance.DEBIT,
  },
  {
    accountNumber: '1200',
    accountName: 'Vehicle Inventory',
    accountType: AccountType.ASSET,
    normalBalance: NormalBalance.DEBIT,
  },
  {
    accountNumber: '2000',
    accountName: 'Floor Plan Payable',
    accountType: AccountType.LIABILITY,
    normalBalance: NormalBalance.CREDIT,
  },
  {
    accountNumber: '3000',
    accountName: 'Retained Earnings',
    accountType: AccountType.EQUITY,
    normalBalance: NormalBalance.CREDIT,
  },
  {
    accountNumber: '4000',
    accountName: 'Vehicle Sales Revenue',
    accountType: AccountType.REVENUE,
    normalBalance: NormalBalance.CREDIT,
  },
  {
    accountNumber: '4100',
    accountName: 'Finance and Insurance Revenue',
    accountType: AccountType.REVENUE,
    normalBalance: NormalBalance.CREDIT,
  },
  {
    accountNumber: '5000',
    accountName: 'Cost of Goods Sold',
    accountType: AccountType.EXPENSE,
    normalBalance: NormalBalance.DEBIT,
  },
] as const;

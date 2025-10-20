import { CommissionType, JournalStatus, LineType, Prisma } from '@prisma/client';
import { EVENT_TOPICS, emitEvent } from '../events/index.js';
import { prisma } from '../lib/prisma.js';

const FRONT_REVENUE_ACCOUNT = '4000';
const BACKEND_REVENUE_ACCOUNT = '4100';
const COST_OF_SALE_ACCOUNT = '5000';

async function resolvePoster(tenantId: string, preferredUserId?: string | null): Promise<string> {
  if (preferredUserId) {
    return preferredUserId;
  }
  const fallback = await prisma.user.findFirst({
    where: { tenantId },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!fallback) {
    throw new Error('Unable to resolve posting user for accounting entry');
  }
  return fallback.id;
}

async function loadGlAccountIds(tenantId: string) {
  const accounts = await prisma.gLAccount.findMany({
    where: {
      tenantId,
      accountNumber: {
        in: [FRONT_REVENUE_ACCOUNT, BACKEND_REVENUE_ACCOUNT, COST_OF_SALE_ACCOUNT],
      },
    },
    select: { id: true, accountNumber: true },
  });

  const map = new Map(accounts.map((account) => [account.accountNumber, account.id]));
  if (!map.has(FRONT_REVENUE_ACCOUNT) || !map.has(BACKEND_REVENUE_ACCOUNT) || !map.has(COST_OF_SALE_ACCOUNT)) {
    throw new Error('Required GL accounts are not configured for accounting integration');
  }
  return map;
}

function toDecimal(value: unknown): Prisma.Decimal {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return new Prisma.Decimal(Number.isFinite(numberValue) ? numberValue : 0);
}

export async function createDealCloseJournal(params: {
  tenantId: string;
  dealId: string;
  worksheetId: string;
  vehicleId: string;
  salespersonId: string | null;
  totals: Record<string, unknown>;
}): Promise<string> {
  const frontGross = Number(params.totals?.frontEndGross ?? 0);
  const backGross = Number(params.totals?.backEndGross ?? 0);
  const reserve = Number(params.totals?.financeReserve ?? 0);
  const postedById = await resolvePoster(params.tenantId, params.salespersonId ?? undefined);
  const accountMap = await loadGlAccountIds(params.tenantId);
  const lines: Prisma.JournalEntryLineCreateWithoutJournalEntryInput[] = [];

  if (frontGross > 0) {
    lines.push({
      tenant: { connect: { id: params.tenantId } },
      glAccount: { connect: { id: accountMap.get(FRONT_REVENUE_ACCOUNT)! } },
      type: LineType.CREDIT,
      amount: toDecimal(frontGross),
      description: 'Front-end gross recognition',
    });
    lines.push({
      tenant: { connect: { id: params.tenantId } },
      glAccount: { connect: { id: accountMap.get(COST_OF_SALE_ACCOUNT)! } },
      type: LineType.DEBIT,
      amount: toDecimal(frontGross),
      description: 'Cost of sale offset',
    });
  }

  const backendTotal = backGross + reserve;
  if (backendTotal > 0) {
    lines.push({
      tenant: { connect: { id: params.tenantId } },
      glAccount: { connect: { id: accountMap.get(BACKEND_REVENUE_ACCOUNT)! } },
      type: LineType.CREDIT,
      amount: toDecimal(backendTotal),
      description: 'Backend and reserve accrual',
    });
  }

  if (!lines.length) {
    return '';
  }

  const journal = await prisma.journalEntry.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      deal: { connect: { id: params.dealId } },
      entryNumber: `DEAL-${params.dealId}-${Date.now()}`,
      memo: 'Deal close posting',
      status: JournalStatus.DRAFT,
      postingDate: new Date(),
      postedBy: { connect: { id: postedById } },
      lines: { create: lines },
    },
    select: { id: true },
  });

  await emitEvent(EVENT_TOPICS.ACCOUNTING_JOURNAL_CREATED, {
    tenantId: params.tenantId,
    dealId: params.dealId,
    journalEntryId: journal.id,
  });

  return journal.id;
}

export async function createSalesCommissionStub(params: {
  tenantId: string;
  dealId: string;
  salespersonId: string | null;
  frontGross: number;
}): Promise<void> {
  if (!params.salespersonId || params.frontGross <= 0) {
    return;
  }

  const commissionAmount = params.frontGross * 0.25;

  await prisma.commission.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      deal: { connect: { id: params.dealId } },
      user: { connect: { id: params.salespersonId } },
      commissionType: CommissionType.FRONT,
      amount: new Prisma.Decimal(commissionAmount),
      rate: new Prisma.Decimal(25),
      notes: 'Auto-generated on deal close',
    },
  });
}

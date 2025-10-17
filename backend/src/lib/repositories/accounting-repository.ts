import type { LineType, PrismaClient } from '@prisma/client';
import prismaClient from '../prisma.js';

export class AccountingRepository {
  constructor(private readonly prisma: PrismaClient = prismaClient) {}

  async getChartOfAccounts(tenantId: string) {
    return this.prisma.gLAccount.findMany({
      where: { tenantId },
      orderBy: [{ accountNumber: 'asc' }],
    });
  }

  async getJournalEntries(tenantId: string, options: { includeLines?: boolean } = {}) {
    return this.prisma.journalEntry.findMany({
      where: { tenantId },
      include: options.includeLines
        ? { lines: { include: { glAccount: true } }, deal: true, postedBy: true }
        : { deal: true, postedBy: true },
      orderBy: { entryDate: 'desc' },
    });
  }

  async createJournalEntry(tenantId: string, data: any) {
    return this.prisma.journalEntry.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
      include: { lines: true },
    });
  }

  async verifyBalancedEntries(tenantId: string) {
    const entries = await this.prisma.journalEntry.findMany({
      where: { tenantId },
      include: { lines: true },
    });

    return entries.filter((entry) => {
      const totals = entry.lines.reduce(
        (acc, line) => {
          if (line.type === LineType.DEBIT) {
            acc.debits += Number(line.amount);
          } else {
            acc.credits += Number(line.amount);
          }
          return acc;
        },
        { debits: 0, credits: 0 }
      );
      return Math.abs(totals.debits - totals.credits) < 0.01;
    });
  }

  async getCommissionReport(tenantId: string) {
    return this.prisma.commission.findMany({
      where: { tenantId },
      include: { deal: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

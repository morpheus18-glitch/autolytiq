import type { DealStatus, PrismaClient } from '@prisma/client';
import prismaClient from '../prisma.js';

export interface DealFilters {
  status?: DealStatus;
  salespersonId?: string;
  customerId?: string;
  minGrossProfit?: number;
  maxGrossProfit?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export class DealRepository {
  constructor(private readonly prisma: PrismaClient = prismaClient) {}

  async findAll(tenantId: string, filters: DealFilters = {}) {
    const { status, salespersonId, customerId, minGrossProfit, maxGrossProfit, dateFrom, dateTo } = filters;

    return this.prisma.deal.findMany({
      where: {
        tenantId,
        status,
        salesPersonId: salespersonId,
        customerId,
        totalGross: {
          gte: minGrossProfit !== undefined ? minGrossProfit : undefined,
          lte: maxGrossProfit !== undefined ? maxGrossProfit : undefined,
        },
        dealDate: {
          gte: dateFrom ?? undefined,
          lte: dateTo ?? undefined,
        },
      },
      include: {
        customer: true,
        vehicle: true,
        salesPerson: true,
        financeManager: true,
        documents: true,
      },
      orderBy: { dealDate: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        vehicle: true,
        salesPerson: true,
        financeManager: true,
        documents: true,
        commissions: true,
      },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.deal.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
      include: {
        customer: true,
        vehicle: true,
        salesPerson: true,
      },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    await this.prisma.deal.updateMany({
      where: { id, tenantId },
      data,
    });

    return this.findById(tenantId, id);
  }

  async getPendingApprovals(tenantId: string, minProfit = 5000) {
    return this.prisma.deal.findMany({
      where: {
        tenantId,
        status: DealStatus.PENDING,
        totalGross: { gte: minProfit },
      },
      include: {
        customer: true,
        vehicle: true,
        salesPerson: true,
      },
      orderBy: { totalGross: 'desc' },
    });
  }

  async getMonthlyGrossBySalesperson(tenantId: string, month: number, year: number) {
    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const aggregates = await this.prisma.deal.groupBy({
      by: ['salesPersonId'],
      where: {
        tenantId,
        dealDate: { gte: start, lte: end },
      },
      _sum: {
        frontEndGross: true,
        backEndGross: true,
        totalGross: true,
      },
    });

    const users = await this.prisma.user.findMany({
      where: {
        tenantId,
        id: { in: aggregates.map((agg) => agg.salesPersonId) },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    return aggregates.map((aggregate) => {
      const user = users.find((u) => u.id === aggregate.salesPersonId);
      return {
        salesPersonId: aggregate.salesPersonId,
        salesPersonName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        frontEndGross: aggregate._sum.frontEndGross ?? 0,
        backEndGross: aggregate._sum.backEndGross ?? 0,
        totalGross: aggregate._sum.totalGross ?? 0,
      };
    });
  }
}

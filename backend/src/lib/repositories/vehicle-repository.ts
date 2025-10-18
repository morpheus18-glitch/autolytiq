import type { PrismaClient, VehicleStatus } from '@prisma/client';
import prismaClient from '../prisma.js';

export interface VehicleFilters {
  status?: VehicleStatus;
  make?: string;
  model?: string;
  search?: string;
}

export class VehicleRepository {
  constructor(private readonly prisma: PrismaClient = prismaClient) {}

  async findAll(tenantId: string, filters: VehicleFilters = {}) {
    const { status, make, model, search } = filters;

    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        status,
        make: make ? { contains: make, mode: 'insensitive' } : undefined,
        model: model ? { contains: model, mode: 'insensitive' } : undefined,
        ...(search
          ? {
              OR: [
                { vin: { contains: search, mode: 'insensitive' } },
                { make: { contains: search, mode: 'insensitive' } },
                { model: { contains: search, mode: 'insensitive' } },
                { stockNumber: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        deals: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailable(tenantId: string) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        status: VehicleStatus.AVAILABLE,
      },
      orderBy: { dateReceived: 'asc' },
    });
  }

  async findAgedInventory(tenantId: string, daysInStock = 30) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        status: VehicleStatus.AVAILABLE,
        daysInStock: { gt: daysInStock },
      },
      orderBy: { daysInStock: 'desc' },
    });
  }

  async findByVin(tenantId: string, vin: string) {
    return this.prisma.vehicle.findFirst({
      where: { tenantId, vin },
      include: { histories: true, deals: true },
    });
  }

  async create(tenantId: string, data: any) {
    return this.prisma.vehicle.create({
      data: { ...data, tenant: { connect: { id: tenantId } } },
    });
  }

  async update(tenantId: string, id: string, data: any) {
    await this.prisma.vehicle.updateMany({
      where: { id, tenantId },
      data,
    });

    return this.prisma.vehicle.findFirst({ where: { id, tenantId } });
  }

  async getInventorySummary(tenantId: string) {
    const vehicles = await this.prisma.vehicle.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { _all: true },
    });

    const grossValue = await this.prisma.vehicle.aggregate({
      where: { tenantId },
      _sum: { listPrice: true },
    });

    return {
      counts: vehicles.reduce((acc, vehicle) => ({
        ...acc,
        [vehicle.status]: vehicle._count._all,
      }), {} as Record<string, number>),
      totalListValue: grossValue._sum.listPrice ?? 0,
    };
  }
}

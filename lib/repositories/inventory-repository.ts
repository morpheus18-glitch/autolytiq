import type { PrismaClient, VehicleStatus } from '@prisma/client';
import prismaClient from '../prisma.js';

export class InventoryRepository {
  constructor(private readonly prisma: PrismaClient = prismaClient) {}

  async getAgedInventoryReport(tenantId: string, minimumDays = 30) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        status: VehicleStatus.AVAILABLE,
        daysInStock: { gt: minimumDays },
      },
      select: {
        id: true,
        stockNumber: true,
        vin: true,
        make: true,
        model: true,
        year: true,
        daysInStock: true,
        listPrice: true,
        dateReceived: true,
      },
      orderBy: { daysInStock: 'desc' },
    });
  }

  async getAgedInventoryGrouped(tenantId: string, minimumDays = 30) {
    return this.prisma.vehicle.groupBy({
      by: ['make', 'model'],
      where: {
        tenantId,
        status: VehicleStatus.AVAILABLE,
        daysInStock: { gt: minimumDays },
      },
      _count: { _all: true },
      _avg: { daysInStock: true },
      _sum: { listPrice: true },
      orderBy: { make: 'asc' },
    });
  }

  async getAvailabilityByStatus(tenantId: string) {
    return this.prisma.vehicle.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { _all: true },
    });
  }

  async findInTransitVehicles(tenantId: string) {
    return this.prisma.vehicle.findMany({
      where: {
        tenantId,
        status: VehicleStatus.IN_TRANSIT,
      },
      orderBy: { dateReceived: 'asc' },
    });
  }
}

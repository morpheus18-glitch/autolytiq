import type { LeadStatus, Prisma, PrismaClient } from '@prisma/client';
import prismaClient from '../prisma.js';

export interface CustomerFilters {
  status?: LeadStatus;
  assignedTo?: string;
  search?: string;
  tags?: string[];
}

export interface CreateCustomerInput extends Omit<Prisma.CustomerCreateInput, 'tenant'> {}
export interface UpdateCustomerInput extends Prisma.CustomerUpdateInput {}

export class CustomerRepository {
  constructor(private readonly prisma: PrismaClient = prismaClient) {}

  async findAll(tenantId: string, filters: CustomerFilters = {}) {
    const { status, assignedTo, search, tags } = filters;

    return this.prisma.customer.findMany({
      where: {
        tenantId,
        leadStatus: status,
        assignedToUserId: assignedTo,
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(tags?.length ? { tags: { hasSome: tags } } : {}),
      },
      include: {
        assignedToUser: true,
        interactions: { take: 5, orderBy: { createdAt: 'desc' } },
        vehicles: true,
        deals: { include: { vehicle: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(tenantId: string, id: string) {
    return this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        assignedToUser: true,
        interactions: { orderBy: { createdAt: 'desc' } },
        vehicles: true,
        deals: { include: { vehicle: true } },
      },
    });
  }

  async create(tenantId: string, data: CreateCustomerInput) {
    return this.prisma.customer.create({
      data: { ...data, tenant: { connect: { id: tenantId } } },
    });
  }

  async update(tenantId: string, id: string, data: UpdateCustomerInput) {
    await this.prisma.customer.updateMany({
      where: { id, tenantId },
      data,
    });

    return this.findById(tenantId, id);
  }

  async softDelete(tenantId: string, id: string) {
    await this.prisma.customer.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });

    return this.findById(tenantId, id);
  }

  async getHotLeads(tenantId: string, userId: string) {
    return this.prisma.customer.findMany({
      where: {
        tenantId,
        leadStatus: LeadStatus.HOT,
        assignedToUserId: userId,
        deletedAt: null,
      },
      include: {
        interactions: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { leadScore: 'desc' },
    });
  }

  async getNextFollowUps(tenantId: string) {
    return this.prisma.customerInteraction.findMany({
      where: {
        tenantId,
        scheduledAt: { gte: new Date() },
        completedAt: null,
      },
      include: {
        customer: true,
        user: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async search(tenantId: string, query: string) {
    return this.prisma.customer.findMany({
      where: {
        tenantId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  }
}

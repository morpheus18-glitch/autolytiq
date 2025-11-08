/**
 * Service Order Management Service
 * Handles repair order (RO) operations, scheduling, and tracking
 */

import { db } from '@repo/db';
import { ServiceOrderStatus, Prisma } from '@prisma/client';

export interface ServiceOrderFilters {
  tenantId: string;
  status?: ServiceOrderStatus[];
  advisorId?: string;
  technicianId?: string;
  customerId?: string;
  vehicleId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface CreateServiceOrderInput {
  tenantId: string;
  roNumber: string;
  customerId: string;
  vehicleId: string;
  locationId?: string;
  type: string;
  advisorId?: string;
  technicianId?: string;
  scheduledDate?: Date;
  promisedDate?: Date;
  mileageIn?: number;
  customerConcern?: string;
  notes?: string;
  internalNotes?: string;
}

export interface UpdateServiceOrderInput {
  status?: ServiceOrderStatus;
  advisorId?: string;
  technicianId?: string;
  scheduledDate?: Date;
  startedAt?: Date;
  completedAt?: Date;
  promisedDate?: Date;
  mileageIn?: number;
  mileageOut?: number;
  customerConcern?: string;
  causeOfFailure?: string;
  correction?: string;
  laborCents?: number;
  partsCents?: number;
  subletCents?: number;
  shopSuppliesCents?: number;
  subtotalCents?: number;
  taxCents?: number;
  totalCents?: number;
  isPaid?: boolean;
  paidAt?: Date;
  notes?: string;
  internalNotes?: string;
}

export interface ServiceOrderLineItemInput {
  type: string;
  description?: string;
  hours?: number;
  rateCents?: number;
  amountCents: number;
}

/**
 * Get all service orders with filters
 */
export async function getServiceOrders(filters: ServiceOrderFilters) {
  const { tenantId, status, advisorId, technicianId, customerId, vehicleId, dateFrom, dateTo } = filters;

  const where: Prisma.ServiceOrderWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (status && status.length > 0) {
    where.status = { in: status };
  }

  if (advisorId) {
    where.advisorId = advisorId;
  }

  if (technicianId) {
    where.technicianId = technicianId;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (vehicleId) {
    where.vehicleId = vehicleId;
  }

  if (dateFrom || dateTo) {
    where.scheduledDate = {};
    if (dateFrom) where.scheduledDate.gte = dateFrom;
    if (dateTo) where.scheduledDate.lte = dateTo;
  }

  const serviceOrders = await db.serviceOrder.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true,
        },
      },
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      technician: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      lineItems: true,
    },
    orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
  });

  return serviceOrders.map((order) => ({
    ...order,
    customer: {
      ...order.customer,
      name: `${order.customer.firstName} ${order.customer.lastName}`,
    },
    advisor: order.advisor
      ? {
          ...order.advisor,
          name: `${order.advisor.firstName} ${order.advisor.lastName}`,
        }
      : null,
    technician: order.technician
      ? {
          ...order.technician,
          name: `${order.technician.firstName} ${order.technician.lastName}`,
        }
      : null,
  }));
}

/**
 * Get a single service order by ID
 */
export async function getServiceOrderById(id: string, tenantId: string) {
  const serviceOrder = await db.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true,
          mileage: true,
        },
      },
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      technician: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      lineItems: true,
    },
  });

  if (!serviceOrder) {
    throw new Error('Service order not found');
  }

  if (serviceOrder.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  return {
    ...serviceOrder,
    customer: {
      ...serviceOrder.customer,
      name: `${serviceOrder.customer.firstName} ${serviceOrder.customer.lastName}`,
    },
    advisor: serviceOrder.advisor
      ? {
          ...serviceOrder.advisor,
          name: `${serviceOrder.advisor.firstName} ${serviceOrder.advisor.lastName}`,
        }
      : null,
    technician: serviceOrder.technician
      ? {
          ...serviceOrder.technician,
          name: `${serviceOrder.technician.firstName} ${serviceOrder.technician.lastName}`,
        }
      : null,
  };
}

/**
 * Create a new service order
 */
export async function createServiceOrder(input: CreateServiceOrderInput) {
  const serviceOrder = await db.serviceOrder.create({
    data: {
      tenantId: input.tenantId,
      roNumber: input.roNumber,
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      locationId: input.locationId,
      type: input.type as any,
      advisorId: input.advisorId,
      technicianId: input.technicianId,
      scheduledDate: input.scheduledDate,
      promisedDate: input.promisedDate,
      mileageIn: input.mileageIn,
      customerConcern: input.customerConcern,
      notes: input.notes,
      internalNotes: input.internalNotes,
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true,
        },
      },
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      technician: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Log activity
  await db.activity.create({
    data: {
      tenantId: input.tenantId,
      userId: input.advisorId || input.technicianId!,
      type: 'SERVICE_ORDER_CREATED',
      entityType: 'SERVICE_ORDER',
      entityId: serviceOrder.id,
      description: `Created service order ${input.roNumber}`,
      metadata: {
        roNumber: input.roNumber,
        customerId: input.customerId,
        vehicleId: input.vehicleId,
      },
    },
  });

  return serviceOrder;
}

/**
 * Update a service order
 */
export async function updateServiceOrder(
  id: string,
  tenantId: string,
  userId: string,
  updates: UpdateServiceOrderInput
) {
  // Verify order exists and belongs to tenant
  const existingOrder = await db.serviceOrder.findUnique({
    where: { id },
    select: { tenantId: true, status: true },
  });

  if (!existingOrder) {
    throw new Error('Service order not found');
  }

  if (existingOrder.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  const serviceOrder = await db.serviceOrder.update({
    where: { id },
    data: updates,
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          year: true,
          make: true,
          model: true,
          vin: true,
        },
      },
      advisor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      technician: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Log status changes
  if (updates.status && updates.status !== existingOrder.status) {
    await db.activity.create({
      data: {
        tenantId,
        userId,
        type: 'SERVICE_ORDER_STATUS_CHANGED',
        entityType: 'SERVICE_ORDER',
        entityId: id,
        description: `Changed service order status from ${existingOrder.status} to ${updates.status}`,
        metadata: {
          oldStatus: existingOrder.status,
          newStatus: updates.status,
        },
      },
    });
  }

  return serviceOrder;
}

/**
 * Delete (soft delete) a service order
 */
export async function deleteServiceOrder(id: string, tenantId: string, userId: string) {
  // Verify order exists and belongs to tenant
  const existingOrder = await db.serviceOrder.findUnique({
    where: { id },
    select: { tenantId: true, roNumber: true },
  });

  if (!existingOrder) {
    throw new Error('Service order not found');
  }

  if (existingOrder.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  await db.serviceOrder.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  // Log deletion
  await db.activity.create({
    data: {
      tenantId,
      userId,
      type: 'SERVICE_ORDER_DELETED',
      entityType: 'SERVICE_ORDER',
      entityId: id,
      description: `Deleted service order ${existingOrder.roNumber}`,
    },
  });
}

/**
 * Add line items to a service order
 */
export async function addServiceOrderLineItems(
  serviceOrderId: string,
  tenantId: string,
  lineItems: ServiceOrderLineItemInput[]
) {
  // Verify order exists and belongs to tenant
  const order = await db.serviceOrder.findUnique({
    where: { id: serviceOrderId },
    select: { tenantId: true },
  });

  if (!order) {
    throw new Error('Service order not found');
  }

  if (order.tenantId !== tenantId) {
    throw new Error('Unauthorized');
  }

  const createdLineItems = await db.serviceLineItem.createMany({
    data: lineItems.map((item) => ({
      tenantId,
      serviceOrderId,
      type: item.type,
      description: item.description,
      hours: item.hours,
      rateCents: item.rateCents,
      amountCents: item.amountCents,
    })),
  });

  // Recalculate totals
  const allLineItems = await db.serviceLineItem.findMany({
    where: { serviceOrderId, tenantId },
  });

  const totalCents = allLineItems.reduce((sum, item) => sum + item.amountCents, 0);

  await db.serviceOrder.update({
    where: { id: serviceOrderId },
    data: {
      subtotalCents: totalCents,
      totalCents: totalCents + (order.tenantId ? 0 : 0), // Add tax calculation here
    },
  });

  return createdLineItems;
}

/**
 * Get service order statistics
 */
export async function getServiceOrderStats(tenantId: string, dateFrom?: Date, dateTo?: Date) {
  const where: Prisma.ServiceOrderWhereInput = {
    tenantId,
    deletedAt: null,
  };

  if (dateFrom || dateTo) {
    where.scheduledDate = {};
    if (dateFrom) where.scheduledDate.gte = dateFrom;
    if (dateTo) where.scheduledDate.lte = dateTo;
  }

  // Get status distribution
  const statusDistribution = await db.serviceOrder.groupBy({
    by: ['status'],
    where,
    _count: { id: true },
    _sum: { totalCents: true },
  });

  // Get technician workload
  const technicianWorkload = await db.serviceOrder.groupBy({
    by: ['technicianId'],
    where: {
      ...where,
      technicianId: { not: null },
    },
    _count: { id: true },
  });

  // Get service type distribution
  const typeDistribution = await db.serviceOrder.groupBy({
    by: ['type'],
    where,
    _count: { id: true },
  });

  const totalOrders = await db.serviceOrder.count({ where });
  const completedOrders = await db.serviceOrder.count({
    where: { ...where, status: 'COMPLETED' },
  });

  return {
    statusDistribution: statusDistribution.map((s) => ({
      status: s.status,
      count: s._count.id,
      totalRevenue: s._sum.totalCents || 0,
    })),
    technicianWorkload: technicianWorkload.map((t) => ({
      technicianId: t.technicianId,
      orderCount: t._count.id,
    })),
    typeDistribution: typeDistribution.map((t) => ({
      type: t.type,
      count: t._count.id,
    })),
    totalOrders,
    completedOrders,
    completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
  };
}

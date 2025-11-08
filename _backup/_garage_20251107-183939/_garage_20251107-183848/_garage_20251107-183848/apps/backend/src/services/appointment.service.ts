import { ActivityStatus, ActivityType, AppointmentStatus, type Prisma } from '@prisma/client';
import { addHours, addMinutes } from 'date-fns';
import {
  appointmentInclude,
  type AppointmentWithRelations,
} from './appointment.types';
import {
  type AppointmentCheckInInput,
  type AppointmentCompleteInput,
  type AppointmentCreateInput,
  type AppointmentListQuery,
  type AppointmentNoShowInput,
  type AppointmentUpdateInput,
} from '../validations/appointment.validation';
import { getTenantId, prisma } from '../lib/prisma';
import { emitTenantEvent } from '../lib/socket';
import {
  cancelAppointmentJobs,
  scheduleAppointmentJobs,
} from '../queues/index';
import { triggerAutomations } from './automation.service';
import type { AutomationTriggerType } from './automation.service';

const ACTIVE_CONFLICT_STATUSES = [
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
];

async function dispatchAppointmentAutomation(
  trigger: AutomationTriggerType,
  appointment: AppointmentWithRelations,
  occurredAt?: Date | null,
): Promise<void> {
  const leadId = appointment.lead?.id ?? appointment.leadId ?? undefined;
  const customerId = appointment.customer?.id ?? appointment.customerId ?? undefined;
  const eventTime = occurredAt ?? appointment.startAt ?? new Date();

  try {
    await triggerAutomations(trigger, {
      appointmentId: appointment.id,
      leadId: leadId ?? undefined,
      customerId: customerId ?? undefined,
      occurredAt: eventTime,
    });
  } catch (error) {
    console.error(`Failed to trigger ${trigger} automations`, error);
  }
}

function requireTenantId(): string {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw Object.assign(new Error('Tenant context is required'), { status: 403 });
  }
  return tenantId;
}

function createHttpError(status: number, message: string): Error {
  return Object.assign(new Error(message), { status });
}

function validateInitialStatus(status: AppointmentStatus): void {
  if (status !== AppointmentStatus.SCHEDULED && status !== AppointmentStatus.CONFIRMED) {
    throw createHttpError(400, 'New appointments can only start in SCHEDULED or CONFIRMED status');
  }
}

function assertStatusTransition(current: AppointmentStatus, next: AppointmentStatus): void {
  if (current === next) {
    return;
  }

  switch (current) {
    case AppointmentStatus.SCHEDULED:
      if (next === AppointmentStatus.CONFIRMED || next === AppointmentStatus.CANCELLED) {
        return;
      }
      break;
    case AppointmentStatus.CONFIRMED:
      if (
        next === AppointmentStatus.SCHEDULED ||
        next === AppointmentStatus.IN_PROGRESS ||
        next === AppointmentStatus.CANCELLED
      ) {
        return;
      }
      break;
    case AppointmentStatus.IN_PROGRESS:
      if (
        next === AppointmentStatus.COMPLETED ||
        next === AppointmentStatus.CANCELLED ||
        next === AppointmentStatus.NO_SHOW
      ) {
        return;
      }
      break;
    default:
      break;
  }

  throw createHttpError(400, `Cannot transition appointment from ${current} to ${next}`);
}

function buildListFilters(query: AppointmentListQuery): Prisma.AppointmentWhereInput {
  const where: Prisma.AppointmentWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.assignedToId) {
    where.assignedToId = query.assignedToId;
  }

  if (query.leadId) {
    where.leadId = query.leadId;
  }

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (query.vehicleId) {
    where.vehicleId = query.vehicleId;
  }

  if (query.from || query.to) {
    where.startAt = {};
    if (query.from) {
      where.startAt.gte = query.from;
    }
    if (query.to) {
      where.startAt.lte = query.to;
    }
  }

  return where;
}

async function ensureAvailability(
  input: {
    assignedToId?: string | null;
    vehicleId?: string | null;
    startAt: Date;
    endAt?: Date | null;
    excludeId?: string;
  },
): Promise<void> {
  const effectiveEnd = input.endAt ?? addMinutes(input.startAt, 60);

  const checkResource = async (field: 'assignedToId' | 'vehicleId', value?: string | null) => {
    if (!value) {
      return;
    }

    const existing = await prisma.appointment.findMany({
      where: {
        id: input.excludeId ? { not: input.excludeId } : undefined,
        status: { in: ACTIVE_CONFLICT_STATUSES },
        [field]: value,
        startAt: { lt: effectiveEnd },
      },
      select: {
        id: true,
        title: true,
        startAt: true,
        endAt: true,
      },
    });

    for (const appointment of existing) {
      const existingEnd = appointment.endAt ?? addMinutes(appointment.startAt, 60);
      if (existingEnd > input.startAt) {
        const label = field === 'assignedToId' ? 'assignee' : 'resource';
        throw createHttpError(
          409,
          `The selected ${label} already has an appointment (${appointment.title}) overlapping this time.`,
        );
      }
    }
  };

  await Promise.all([checkResource('assignedToId', input.assignedToId), checkResource('vehicleId', input.vehicleId)]);
}

export async function listAppointments(query: AppointmentListQuery) {
  requireTenantId();
  const where = buildListFilters(query);
  const skip = (query.page - 1) * query.pageSize;
  const take = query.pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      orderBy: { startAt: 'asc' },
      skip,
      take,
      include: appointmentInclude,
    }),
    prisma.appointment.count({ where }),
  ]);

  const pages = Math.ceil(total / query.pageSize) || 1;

  return { items, total, page: query.page, pageSize: query.pageSize, pages };
}

export async function getAppointment(id: string): Promise<AppointmentWithRelations> {
  requireTenantId();
  const appointment = await prisma.appointment.findUnique({ where: { id }, include: appointmentInclude });
  if (!appointment) {
    throw createHttpError(404, 'Appointment not found');
  }
  return appointment;
}

export async function createAppointment(input: AppointmentCreateInput): Promise<AppointmentWithRelations> {
  const tenantId = requireTenantId();
  const status = input.status ?? AppointmentStatus.SCHEDULED;
  validateInitialStatus(status);

  await ensureAvailability({
    assignedToId: input.assignedToId,
    vehicleId: input.vehicleId,
    startAt: input.startAt,
    endAt: input.endAt,
  });

  const appointment: AppointmentWithRelations = await prisma.appointment.create({
    data: {
      title: input.title,
      notes: input.notes ?? undefined,
      type: input.type,
      status,
      location: input.location ?? undefined,
      timeZone: input.timeZone ?? 'UTC',
      startAt: input.startAt,
      endAt: input.endAt ?? undefined,
      lead: input.leadId ? { connect: { id: input.leadId } } : undefined,
      customer: input.customerId ? { connect: { id: input.customerId } } : undefined,
      assignedTo: input.assignedToId ? { connect: { id: input.assignedToId } } : undefined,
      vehicle: input.vehicleId ? { connect: { id: input.vehicleId } } : undefined,
      tenant: { connect: { id: tenantId } },
    },
    include: appointmentInclude,
  });

  await scheduleAppointmentJobs(appointment);
  emitTenantEvent(tenantId, 'appointment:created', { appointment });
  await dispatchAppointmentAutomation('APPOINTMENT_CREATED', appointment, appointment.startAt);

  return appointment;
}

export async function updateAppointment(
  id: string,
  input: AppointmentUpdateInput,
): Promise<AppointmentWithRelations> {
  const tenantId = requireTenantId();
  const existing = await getAppointment(id);

  if (input.status) {
    assertStatusTransition(existing.status, input.status);
  }

  const startAt = input.startAt ?? existing.startAt;
  const endAt = input.endAt === null ? null : input.endAt ?? existing.endAt;
  const assignedToId = input.assignedToId === null ? null : input.assignedToId ?? existing.assignedToId;
  const vehicleId = input.vehicleId === null ? null : input.vehicleId ?? existing.vehicleId;

  await ensureAvailability({
    assignedToId,
    vehicleId,
    startAt,
    endAt,
    excludeId: id,
  });

  const data: Prisma.AppointmentUpdateInput = {
    title: input.title,
    notes: input.notes === null ? null : input.notes,
    type: input.type,
    status: input.status,
    location: input.location === null ? null : input.location,
    timeZone: input.timeZone,
    startAt: input.startAt,
    endAt: input.endAt === null ? null : input.endAt,
    lead:
      input.leadId === null
        ? { disconnect: true }
        : input.leadId
          ? { connect: { id: input.leadId } }
          : undefined,
    customer:
      input.customerId === null
        ? { disconnect: true }
        : input.customerId
          ? { connect: { id: input.customerId } }
          : undefined,
    assignedTo:
      input.assignedToId === null
        ? { disconnect: true }
        : input.assignedToId
          ? { connect: { id: input.assignedToId } }
          : undefined,
    vehicle:
      input.vehicleId === null
        ? { disconnect: true }
        : input.vehicleId
          ? { connect: { id: input.vehicleId } }
          : undefined,
  };

  const appointment: AppointmentWithRelations = await prisma.appointment.update({
    where: { id },
    data,
    include: appointmentInclude,
  });

  if (
    input.status === AppointmentStatus.CANCELLED ||
    input.status === AppointmentStatus.NO_SHOW ||
    input.status === AppointmentStatus.COMPLETED
  ) {
    await cancelAppointmentJobs(appointment.id);
    if (input.status === AppointmentStatus.COMPLETED) {
      await scheduleAppointmentJobs(appointment, { reminders: false, followUp: true });
    }
  } else {
    const shouldReschedule =
      Boolean(input.startAt) ||
      input.endAt !== undefined ||
      input.assignedToId !== undefined ||
      input.vehicleId !== undefined ||
      input.status !== undefined;

    if (shouldReschedule) {
      await scheduleAppointmentJobs(appointment);
    }
  }

  emitTenantEvent(tenantId, 'appointment:updated', { appointment });
  if (input.status && input.status !== existing.status) {
    if (appointment.status === AppointmentStatus.COMPLETED) {
      await dispatchAppointmentAutomation(
        'APPOINTMENT_COMPLETED',
        appointment,
        appointment.completedAt ?? new Date(),
      );
    } else if (appointment.status === AppointmentStatus.NO_SHOW) {
      await dispatchAppointmentAutomation(
        'APPOINTMENT_NO_SHOW',
        appointment,
        appointment.noShowAt ?? new Date(),
      );
    }
  }
  return appointment;
}

export async function deleteAppointment(id: string): Promise<void> {
  const tenantId = requireTenantId();
  await cancelAppointmentJobs(id);
  await prisma.appointment.delete({ where: { id } });
  emitTenantEvent(tenantId, 'appointment:deleted', { id });
}

export async function checkInAppointment(
  id: string,
  input: AppointmentCheckInInput,
): Promise<AppointmentWithRelations> {
  const tenantId = requireTenantId();
  const appointment = await getAppointment(id);

  if (
    appointment.status !== AppointmentStatus.SCHEDULED &&
    appointment.status !== AppointmentStatus.CONFIRMED &&
    appointment.status !== AppointmentStatus.IN_PROGRESS
  ) {
    throw createHttpError(400, 'Only scheduled or confirmed appointments can be checked in');
  }

  const timestamp = input.timestamp ?? new Date();

  const updated: AppointmentWithRelations = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.IN_PROGRESS,
      checkedInAt: timestamp,
    },
    include: appointmentInclude,
  });

  await cancelAppointmentJobs(id, { reminders: true, followUp: false });
  await scheduleAppointmentJobs(updated, { reminders: false, followUp: true });

  emitTenantEvent(tenantId, 'appointment:status', { appointment: updated });
  return updated;
}

export async function completeAppointment(
  id: string,
  input: AppointmentCompleteInput,
): Promise<AppointmentWithRelations> {
  const tenantId = requireTenantId();
  const appointment = await getAppointment(id);

  if (
    appointment.status !== AppointmentStatus.IN_PROGRESS &&
    appointment.status !== AppointmentStatus.CONFIRMED
  ) {
    throw createHttpError(400, 'Only in-progress or confirmed appointments can be completed');
  }

  const completedAt = new Date();

  const updated: AppointmentWithRelations = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.COMPLETED,
      completedAt,
      outcome: input.outcome,
    },
    include: appointmentInclude,
  });

  await cancelAppointmentJobs(id, { reminders: true, followUp: true });
  await scheduleAppointmentJobs(updated, { reminders: false, followUp: true });

  if (input.createDeal) {
    const taskData: Prisma.ActivityUncheckedCreateInput = {
      tenantId,
      leadId: updated.leadId ?? null,
      customerId: updated.customerId ?? null,
      userId: updated.assignedToId ?? null,
      type: ActivityType.TASK,
      status: ActivityStatus.PENDING,
      subject: `Prepare deal for ${updated.title}`,
      description: 'Generated automatically from appointment completion.',
      dueAt: addHours(completedAt, 4),
    };

    await prisma.activity.create({ data: taskData });
  }

  emitTenantEvent(tenantId, 'appointment:status', { appointment: updated });
  await dispatchAppointmentAutomation('APPOINTMENT_COMPLETED', updated, updated.completedAt ?? completedAt);
  return updated;
}

export async function markAppointmentNoShow(
  id: string,
  _input: AppointmentNoShowInput,
): Promise<AppointmentWithRelations> {
  const tenantId = requireTenantId();
  const appointment = await getAppointment(id);

  if (
    appointment.status !== AppointmentStatus.SCHEDULED &&
    appointment.status !== AppointmentStatus.CONFIRMED &&
    appointment.status !== AppointmentStatus.IN_PROGRESS
  ) {
    throw createHttpError(400, 'Only upcoming appointments can be marked as no-show');
  }

  const updated: AppointmentWithRelations = await prisma.appointment.update({
    where: { id },
    data: {
      status: AppointmentStatus.NO_SHOW,
      noShowAt: new Date(),
    },
    include: appointmentInclude,
  });

  await cancelAppointmentJobs(id, { reminders: true, followUp: true });
  await scheduleAppointmentJobs(updated, { reminders: false, followUp: true });

  emitTenantEvent(tenantId, 'appointment:status', { appointment: updated });
  await dispatchAppointmentAutomation('APPOINTMENT_NO_SHOW', updated, updated.noShowAt ?? new Date());
  return updated;
}

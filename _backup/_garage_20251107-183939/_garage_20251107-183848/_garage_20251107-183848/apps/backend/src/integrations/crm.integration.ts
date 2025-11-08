import { ActivityStatus, ActivityType, Prisma } from '@prisma/client';
import { prisma, toInputJson } from '../lib/prisma';

function optionalConnect<T>(id: string | null | undefined): T | undefined {
  if (!id) {
    return undefined;
  }
  return { connect: { id } } as T;
}

export async function appendDealTimelineEntry(params: {
  tenantId: string;
  dealId: string;
  customerId: string;
  salespersonId?: string | null;
  title: string;
  description?: string;
  occurredAt?: Date;
}): Promise<void> {
  await prisma.activity.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      customer: optionalConnect<Prisma.CustomerCreateNestedOneWithoutActivitiesInput>(params.customerId),
      user: optionalConnect<Prisma.UserCreateNestedOneWithoutActivitiesInput>(params.salespersonId ?? undefined),
      type: ActivityType.NOTE,
      status: ActivityStatus.COMPLETED,
      subject: params.title,
      description: params.description,
      completedAt: params.occurredAt ?? new Date(),
      metadata: toInputJson({
        dealId: params.dealId,
        timeline: true,
      }),
    },
  });
}

export async function scheduleDealFollowUp(params: {
  tenantId: string;
  dealId: string;
  customerId: string;
  salespersonId?: string | null;
  subject: string;
  dueInHours?: number;
}): Promise<void> {
  const dueAt = new Date(Date.now() + (params.dueInHours ?? 24) * 60 * 60 * 1000);

  await prisma.activity.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      customer: optionalConnect<Prisma.CustomerCreateNestedOneWithoutActivitiesInput>(params.customerId),
      user: optionalConnect<Prisma.UserCreateNestedOneWithoutActivitiesInput>(params.salespersonId ?? undefined),
      type: ActivityType.TASK,
      status: ActivityStatus.PENDING,
      subject: params.subject,
      dueAt,
      metadata: toInputJson({
        dealId: params.dealId,
        followUp: true,
      }),
    },
  });
}

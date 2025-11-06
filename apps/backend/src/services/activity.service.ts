import { ActivityStatus, ActivityType, Prisma } from '@prisma/client';
import { getTenantId, prisma } from '../lib/prisma';
import type {
  ActivityCreateInput,
  ActivityListQuery,
  ActivityUpdateInput,
  CallActivityInput,
  EmailActivityInput,
  NoteActivityInput,
  SmsActivityInput,
} from '../validations/activity.validation';

const defaultActivityInclude = {
  lead: {
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  },
  customer: {
    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
  },
  user: {
    select: { id: true, firstName: true, lastName: true, email: true },
  },
  communications: {
    orderBy: { createdAt: 'desc' as const },
    select: { id: true, type: true, status: true, providerId: true, createdAt: true },
  },
} satisfies Prisma.ActivityInclude;

export type ActivityWithRelations = Prisma.ActivityGetPayload<{
  include: typeof defaultActivityInclude;
}>;

function requireTenantId(): string {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error('Tenant context is required for activity operations');
  }
  return tenantId;
}

function applyOptionalRelation<T>(value?: string | null): T | undefined {
  if (!value) {
    return undefined;
  }
  return { connect: { id: value } } as T;
}

async function safeTouchLead(
  leadId: string | null | undefined,
  data: Prisma.LeadUpdateInput,
): Promise<void> {
  if (!leadId) {
    return;
  }

  try {
    await prisma.lead.update({ where: { id: leadId }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return;
    }
    throw error;
  }
}

function buildActivityFilters(query: ActivityListQuery): Prisma.ActivityWhereInput {
  const filters: Prisma.ActivityWhereInput = {};

  if (query.type) {
    filters.type = query.type;
  }

  if (query.leadId) {
    filters.leadId = query.leadId;
  }

  if (query.customerId) {
    filters.customerId = query.customerId;
  }

  if (query.userId) {
    filters.userId = query.userId;
  }

  if (query.from || query.to) {
    filters.createdAt = {};
    if (query.from) {
      filters.createdAt.gte = query.from;
    }
    if (query.to) {
      filters.createdAt.lte = query.to;
    }
  }

  return filters;
}

export async function listActivities(
  query: ActivityListQuery,
): Promise<{
  items: ActivityWithRelations[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}> {
  const where = buildActivityFilters(query);
  const skip = (query.page - 1) * query.pageSize;
  const take = query.pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: defaultActivityInclude,
    }),
    prisma.activity.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getActivity(id: string) {
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: defaultActivityInclude,
  });

  if (!activity) {
    throw Object.assign(new Error('Activity not found'), { status: 404 });
  }

  return activity;
}

export async function createActivity(input: ActivityCreateInput) {
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation<Prisma.LeadCreateNestedOneWithoutActivitiesInput>(input.leadId),
      customer: applyOptionalRelation<Prisma.CustomerCreateNestedOneWithoutActivitiesInput>(input.customerId),
      user: applyOptionalRelation<Prisma.UserCreateNestedOneWithoutActivitiesInput>(input.userId),
      type: input.type,
      status: input.status ?? ActivityStatus.PENDING,
      subject: input.subject ?? null,
      description: input.description ?? null,
      outcome: input.outcome ?? null,
      dueAt: input.dueAt ?? null,
      startedAt: input.startedAt ?? null,
      completedAt: input.completedAt ?? null,
    },
    include: defaultActivityInclude,
  });

  await safeTouchLead(activity.leadId, {
    lastActivityAt: new Date(),
  });

  return activity;
}

export async function updateActivity(id: string, input: ActivityUpdateInput) {
  const data: Prisma.ActivityUpdateInput = {};

  if (input.leadId) {
    data.lead = { connect: { id: input.leadId } };
  }
  if (input.customerId) {
    data.customer = { connect: { id: input.customerId } };
  }
  if (input.userId) {
    data.user = { connect: { id: input.userId } };
  }
  if (input.type) {
    data.type = input.type;
  }
  if (input.status) {
    data.status = input.status;
  }
  if (input.subject !== undefined) {
    data.subject = input.subject ?? null;
  }
  if (input.description !== undefined) {
    data.description = input.description ?? null;
  }
  if (input.outcome !== undefined) {
    data.outcome = input.outcome ?? null;
  }
  if (input.dueAt !== undefined) {
    data.dueAt = input.dueAt ?? null;
  }
  if (input.startedAt !== undefined) {
    data.startedAt = input.startedAt ?? null;
  }
  if (input.completedAt !== undefined) {
    data.completedAt = input.completedAt ?? null;
  }

  const activity = await prisma.activity.update({
    where: { id },
    data,
    include: defaultActivityInclude,
  });

  await safeTouchLead(activity.leadId, {
    lastActivityAt: new Date(),
  });

  return activity;
}

export async function logCallActivity(input: CallActivityInput) {
  const now = new Date();
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation<Prisma.LeadCreateNestedOneWithoutActivitiesInput>(input.leadId),
      customer: applyOptionalRelation<Prisma.CustomerCreateNestedOneWithoutActivitiesInput>(input.customerId),
      user: applyOptionalRelation<Prisma.UserCreateNestedOneWithoutActivitiesInput>(input.userId),
      type: ActivityType.CALL,
      status: input.completedAt ? ActivityStatus.COMPLETED : ActivityStatus.PENDING,
      subject: input.subject ?? 'Call logged',
      description: input.notes ?? null,
      outcome: input.outcome ?? null,
      startedAt: input.startedAt ?? now,
      completedAt: input.completedAt ?? null,
      metadata: {
        callSid: input.callSid,
        recordingUrl: input.recordingUrl,
        durationSeconds: input.durationSeconds,
      },
    },
    include: defaultActivityInclude,
  });

  await safeTouchLead(activity.leadId, {
    lastActivityAt: now,
    lastCommunicationAt: now,
  });

  return activity;
}

export async function logEmailActivity(input: EmailActivityInput) {
  const now = new Date();
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation<Prisma.LeadCreateNestedOneWithoutActivitiesInput>(input.leadId),
      customer: applyOptionalRelation<Prisma.CustomerCreateNestedOneWithoutActivitiesInput>(input.customerId),
      user: applyOptionalRelation<Prisma.UserCreateNestedOneWithoutActivitiesInput>(input.userId),
      type: ActivityType.EMAIL,
      status: ActivityStatus.COMPLETED,
      subject: input.subject ?? null,
      description: input.body ?? null,
      completedAt: now,
      metadata: {
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        providerId: input.providerId,
      },
    },
    include: defaultActivityInclude,
  });

  await safeTouchLead(activity.leadId, {
    lastActivityAt: now,
    lastCommunicationAt: now,
  });

  return activity;
}

export async function logSmsActivity(input: SmsActivityInput) {
  const now = new Date();
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation<Prisma.LeadCreateNestedOneWithoutActivitiesInput>(input.leadId),
      customer: applyOptionalRelation<Prisma.CustomerCreateNestedOneWithoutActivitiesInput>(input.customerId),
      user: applyOptionalRelation<Prisma.UserCreateNestedOneWithoutActivitiesInput>(input.userId),
      type: ActivityType.SMS,
      status: ActivityStatus.COMPLETED,
      description: input.body ?? null,
      completedAt: now,
      metadata: {
        to: input.to,
        from: input.from,
        providerId: input.providerId,
      },
    },
    include: defaultActivityInclude,
  });

  await safeTouchLead(activity.leadId, {
    lastActivityAt: now,
    lastCommunicationAt: now,
  });

  return activity;
}

export async function logNoteActivity(input: NoteActivityInput) {
  const now = new Date();
  const tenantId = requireTenantId();
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: applyOptionalRelation<Prisma.LeadCreateNestedOneWithoutActivitiesInput>(input.leadId),
      customer: applyOptionalRelation<Prisma.CustomerCreateNestedOneWithoutActivitiesInput>(input.customerId),
      user: applyOptionalRelation<Prisma.UserCreateNestedOneWithoutActivitiesInput>(input.userId),
      type: ActivityType.NOTE,
      status: ActivityStatus.COMPLETED,
      subject: input.subject ?? null,
      description: input.body ?? null,
      completedAt: now,
    },
    include: defaultActivityInclude,
  });

  await safeTouchLead(activity.leadId, {
    lastActivityAt: now,
  });

  return activity;
}

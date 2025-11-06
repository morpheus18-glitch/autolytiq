import { CommunicationStatus, CommunicationType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import type { CallLogQueryInput, InboxQueryInput } from '../validations/communication.validation';

const inboxInclude = {
  lead: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
  activity: { select: { id: true, type: true, status: true, outcome: true, opened: true, clicked: true } },
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
} satisfies Prisma.CommunicationInclude;

export type CommunicationWithRelations = Prisma.CommunicationGetPayload<{
  include: typeof inboxInclude;
}>;

function normalizeFilter<T>(value: T | T[] | undefined): T[] | undefined {
  if (!value) {
    return undefined;
  }
  return Array.isArray(value) ? value : [value];
}

function buildInboxFilters(query: InboxQueryInput): Prisma.CommunicationWhereInput {
  const where: Prisma.CommunicationWhereInput = {};

  const types = normalizeFilter(query.type);
  if (types && types.length > 0) {
    where.type = { in: types };
  }

  const statuses = normalizeFilter(query.status);
  if (statuses && statuses.length > 0) {
    where.status = { in: statuses };
  }

  if (query.leadId) {
    where.leadId = query.leadId;
  }

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (query.search) {
    where.OR = [
      { subject: { contains: query.search, mode: 'insensitive' } },
      { body: { contains: query.search, mode: 'insensitive' } },
      { to: { contains: query.search, mode: 'insensitive' } },
      { from: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) {
      where.createdAt.gte = query.from;
    }
    if (query.to) {
      where.createdAt.lte = query.to;
    }
  }

  return where;
}

export async function getInbox(query: InboxQueryInput) {
  const where = buildInboxFilters(query);
  const skip = (query.page - 1) * query.pageSize;
  const take = query.pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.communication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: inboxInclude,
    }),
    prisma.communication.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    pages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getCallLogs(query: CallLogQueryInput) {
  const inboxQuery: InboxQueryInput = {
    ...query,
    type: CommunicationType.CALL,
    status: undefined,
    search: undefined,
  };

  return getInbox({ ...inboxQuery, page: query.page, pageSize: query.pageSize });
}

export function mapTwilioStatus(status?: string | null): CommunicationStatus | undefined {
  switch ((status ?? '').toLowerCase()) {
    case 'queued':
    case 'accepted':
      return CommunicationStatus.QUEUED;
    case 'sending':
    case 'in-progress':
    case 'ringing':
      return CommunicationStatus.SENT;
    case 'sent':
    case 'delivered':
    case 'completed':
      return CommunicationStatus.DELIVERED;
    case 'failed':
    case 'undelivered':
    case 'busy':
    case 'no-answer':
      return CommunicationStatus.FAILED;
    case 'canceled':
    case 'cancelled':
      return CommunicationStatus.CANCELLED;
    default:
      return undefined;
  }
}

export function mapSendGridStatus(event: string): CommunicationStatus | undefined {
  switch (event) {
    case 'processed':
    case 'delivered':
      return CommunicationStatus.DELIVERED;
    case 'open':
    case 'click':
      return CommunicationStatus.DELIVERED;
    case 'bounce':
    case 'dropped':
    case 'spamreport':
    case 'unsubscribe':
      return CommunicationStatus.FAILED;
    default:
      return undefined;
  }
}

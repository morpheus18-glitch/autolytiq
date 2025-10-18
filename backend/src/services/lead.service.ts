import { LeadPriority, LeadSource, LeadStatus, Prisma } from '@prisma/client';
import { endOfDay, startOfDay } from 'date-fns';
import { env } from '../config/env.js';
import prisma from '../lib/prisma.js';
import { BadRequest, NotFound } from '../lib/errors.js';
import type { LeadListQuery } from '../validations/lead.validation.js';
import {
  emitLeadAssigned,
  emitLeadConverted,
  emitLeadCreated,
  emitLeadDeleted,
  emitLeadScoreUpdated,
  emitLeadUpdated,
} from '../sockets/lead.channel.js';

interface ListLeadsParams {
  tenantId: string;
  query: LeadListQuery;
}

const SORTABLE_COLUMNS: Record<string, keyof Prisma.LeadOrderByWithRelationInput> = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  score: 'score',
  priority: 'priority',
  status: 'status',
  lastActivityAt: 'lastActivityAt',
  lastCommunicationAt: 'lastCommunicationAt',
  rating: 'rating',
};

export function derivePriorityFromScore(score?: number | null): LeadPriority {
  if (score === null || score === undefined) {
    return LeadPriority.MEDIUM;
  }
  if (score >= 85) return LeadPriority.URGENT;
  if (score >= 70) return LeadPriority.HIGH;
  if (score >= 45) return LeadPriority.MEDIUM;
  return LeadPriority.LOW;
}

function buildOrderBy(sort?: string[]): Prisma.LeadOrderByWithRelationInput[] {
  const orderBy: Prisma.LeadOrderByWithRelationInput[] = [];
  if (sort) {
    for (const entry of sort) {
      const trimmed = entry.trim();
      if (!trimmed) continue;
      const direction = trimmed.startsWith('-') ? 'desc' : 'asc';
      const key = trimmed.replace(/^[-+]/, '');
      const column = SORTABLE_COLUMNS[key];
      if (column) {
        orderBy.push({ [column]: direction });
      }
    }
  }
  if (orderBy.length === 0) {
    orderBy.push({ createdAt: 'desc' });
  } else {
    orderBy.push({ createdAt: 'desc' });
  }
  return orderBy;
}

function buildLeadFilters(query: LeadListQuery): Prisma.LeadWhereInput {
  const filters: Prisma.LeadWhereInput = { isArchived: false };

  if (query.q) {
    filters.OR = [
      { firstName: { contains: query.q, mode: 'insensitive' } },
      { lastName: { contains: query.q, mode: 'insensitive' } },
      { email: { contains: query.q, mode: 'insensitive' } },
      { phone: { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  if (query.status && query.status.length > 0) {
    filters.status = { in: query.status };
  }

  if (query.source && query.source.length > 0) {
    filters.source = { in: query.source };
  }

  if (query.assignee) {
    filters.assignedToId = query.assignee;
  }

  if (query.score) {
    const scoreFilter: Prisma.IntFilter = {};
    if (query.score.min !== undefined) {
      scoreFilter.gte = query.score.min;
    }
    if (query.score.max !== undefined) {
      scoreFilter.lte = query.score.max;
    }
    if (Object.keys(scoreFilter).length > 0) {
      filters.score = scoreFilter;
    }
  }

  if (query.date) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (query.date.from) {
      dateFilter.gte = startOfDay(query.date.from);
    }
    if (query.date.to) {
      dateFilter.lte = endOfDay(query.date.to);
    }
    if (Object.keys(dateFilter).length > 0) {
      filters.createdAt = dateFilter;
    }
  }

  return filters;
}

export async function listLeads({ tenantId: _tenantId, query }: ListLeadsParams) {
  const where = buildLeadFilters(query);
  const orderBy = buildOrderBy(query.sort);

  const [items, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.size,
      take: query.size,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        scores: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    size: query.size,
    pages: Math.ceil(total / query.size) || 1,
  };
}

export async function getLead(id: string) {
  const lead = await prisma.lead.findFirst({
    where: { id },
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      customer: true,
      activities: { orderBy: { createdAt: 'desc' } },
      appointments: { orderBy: { startAt: 'desc' } },
      communications: { orderBy: { createdAt: 'desc' } },
      scores: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!lead) {
    throw NotFound('Lead not found');
  }

  return lead;
}

interface LeadInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  score?: number;
  rating?: number;
  description?: string;
  tags?: string[];
  ownerId?: string;
  assignedToId?: string | null;
  customerId?: string | null;
}

export async function createLead(tenantId: string, payload: LeadInput) {
  const priority = payload.priority ?? derivePriorityFromScore(payload.score);
  const assignedAt = payload.assignedToId ? new Date() : null;

  const lead = await prisma.lead.create({
    data: {
      tenant: { connect: { id: tenantId } },
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      status: payload.status ?? LeadStatus.NEW,
      source: payload.source ?? LeadSource.WEBSITE,
      priority,
      score: payload.score,
      rating: payload.rating,
      description: payload.description,
      tags: payload.tags ?? [],
      owner: payload.ownerId ? { connect: { id: payload.ownerId } } : undefined,
      assignedTo: payload.assignedToId ? { connect: { id: payload.assignedToId } } : undefined,
      assignedAt,
      customer: payload.customerId ? { connect: { id: payload.customerId } } : undefined,
    },
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      customer: true,
      scores: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  emitLeadCreated(tenantId, lead);
  return lead;
}

export async function updateLead(id: string, tenantId: string, payload: LeadInput) {
  const existing = await prisma.lead.findFirst({ where: { id } });
  if (!existing) {
    throw NotFound('Lead not found');
  }

  const data: Prisma.LeadUpdateInput = {
    firstName: payload.firstName ?? undefined,
    lastName: payload.lastName ?? undefined,
    email: payload.email ?? undefined,
    phone: payload.phone ?? undefined,
    status: payload.status ?? undefined,
    source: payload.source ?? undefined,
    priority: payload.priority ?? (payload.score !== undefined ? derivePriorityFromScore(payload.score) : undefined),
    score: payload.score ?? undefined,
    rating: payload.rating ?? undefined,
    description: payload.description ?? undefined,
    tags: payload.tags ?? undefined,
  };

  if (payload.ownerId !== undefined) {
    data.owner = payload.ownerId ? { connect: { id: payload.ownerId } } : { disconnect: true };
  }

  if (payload.assignedToId !== undefined) {
    data.assignedTo = payload.assignedToId ? { connect: { id: payload.assignedToId } } : { disconnect: true };
    data.assignedAt = payload.assignedToId ? new Date() : null;
  }

  if (payload.customerId !== undefined) {
    data.customer = payload.customerId ? { connect: { id: payload.customerId } } : { disconnect: true };
  }

  const lead = await prisma.lead.update({
    where: { id },
    data,
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      customer: true,
      scores: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  emitLeadUpdated(tenantId, lead);
  return lead;
}

export async function deleteLead(id: string, tenantId: string) {
  const lead = await prisma.lead.findFirst({ where: { id }, select: { id: true } });
  if (!lead) {
    throw NotFound('Lead not found');
  }

  await prisma.lead.delete({ where: { id } });
  emitLeadDeleted(tenantId, id);
}

export async function assignLead(id: string, tenantId: string, userId: string | null) {
  if (userId) {
    const assignee = await prisma.user.findFirst({ where: { id: userId }, select: { id: true } });
    if (!assignee) {
      throw NotFound('Assignee not found');
    }
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      assignedTo: userId ? { connect: { id: userId } } : { disconnect: true },
      assignedAt: userId ? new Date() : null,
    },
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      customer: true,
      scores: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  emitLeadAssigned(tenantId, lead);
  return lead;
}

export async function convertLead(id: string, tenantId: string, won: boolean, lostReason?: string) {
  const lead = await prisma.lead.findFirst({ where: { id } });
  if (!lead) {
    throw NotFound('Lead not found');
  }

  const now = new Date();
  const data: Prisma.LeadUpdateInput = {
    status: won ? LeadStatus.WON : LeadStatus.LOST,
    isConverted: true,
    convertedToDeal: won,
    convertedAt: now,
    wonAt: won ? now : null,
    lostAt: won ? null : now,
    lostReason: won ? null : lostReason ?? null,
  };

  const updated = await prisma.lead.update({
    where: { id },
    data,
    include: {
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      customer: true,
      scores: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  emitLeadConverted(tenantId, updated);
  return updated;
}

export async function getLeadScoreHistory(id: string) {
  const [lead, scores] = await Promise.all([
    prisma.lead.findFirst({ where: { id }, select: { id: true } }),
    prisma.leadScore.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  if (!lead) {
    throw NotFound('Lead not found');
  }

  return scores;
}

interface ScoreResponse {
  score: number;
  modelKey?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

async function requestLeadScoreFromModel(tenantId: string, leadId: string): Promise<ScoreResponse> {
  if (!env.ML_SERVICE_URL) {
    throw BadRequest('ML scoring service is not configured');
  }

  const response = await fetch(`${env.ML_SERVICE_URL.replace(/\/$/, '')}/api/ml/leads/score`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tenantId, leadId }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw BadRequest(`Failed to calculate lead score: ${response.status} ${message}`);
  }

  const payload = (await response.json()) as Partial<ScoreResponse>;
  if (typeof payload.score !== 'number') {
    throw BadRequest('Invalid score payload received from ML service');
  }

  return {
    score: Math.round(payload.score),
    modelKey: payload.modelKey ?? 'ml/default',
    reason: payload.reason,
    metadata: payload.metadata,
  };
}

function heuristicScoreFallback(status: LeadStatus, priority: LeadPriority, rating?: number | null): ScoreResponse {
  let base = 50;
  if (status === LeadStatus.HOT) base = 80;
  else if (status === LeadStatus.WARM) base = 65;
  else if (status === LeadStatus.COLD) base = 35;
  else if (status === LeadStatus.WON) base = 95;
  else if (status === LeadStatus.LOST) base = 15;

  if (priority === LeadPriority.URGENT) base += 10;
  else if (priority === LeadPriority.HIGH) base += 5;
  else if (priority === LeadPriority.LOW) base -= 5;

  if (typeof rating === 'number') {
    base = Math.round(base * 0.6 + rating * 0.4);
  }

  const score = Math.max(1, Math.min(100, base));
  return {
    score,
    modelKey: 'heuristic/fallback',
    reason: 'ML service unavailable, heuristic score applied',
  };
}

export async function calculateLeadScore(id: string, tenantId: string) {
  const lead = await prisma.lead.findFirst({
    where: { id },
    select: {
      id: true,
      status: true,
      priority: true,
      rating: true,
      score: true,
    },
  });

  if (!lead) {
    throw NotFound('Lead not found');
  }

  let response: ScoreResponse;
  try {
    response = await requestLeadScoreFromModel(tenantId, id);
  } catch (error) {
    if (error instanceof Error && error.message.includes('ML scoring service')) {
      throw error;
    }
    response = heuristicScoreFallback(lead.status, lead.priority, lead.rating);
  }

  const scoreDelta = lead.score !== null && lead.score !== undefined ? response.score - lead.score : null;

  const [updatedLead, scoreRecord] = await prisma.$transaction([
    prisma.lead.update({
      where: { id },
      data: {
        score: response.score,
        priority: derivePriorityFromScore(response.score),
      },
    }),
    prisma.leadScore.create({
      data: {
        tenant: { connect: { id: tenantId } },
        lead: { connect: { id } },
        modelKey: response.modelKey ?? 'ml/default',
        score: response.score,
        scoreDelta: scoreDelta ?? undefined,
        reason: response.reason,
        metadata: (response.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    }),
  ]);

  emitLeadScoreUpdated(tenantId, {
    leadId: id,
    score: response.score,
    scoreDelta,
  });

  return {
    lead: updatedLead,
    score: scoreRecord,
  };
}


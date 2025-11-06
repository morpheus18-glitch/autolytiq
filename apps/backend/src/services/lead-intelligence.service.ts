import { Prisma, AppointmentStatus, ActivityType, CommunicationDirection, CommunicationType } from '@prisma/client';
import { subDays } from 'date-fns';
import { prisma } from '../lib/prisma';
import type {
  ActivityAggregatePayload,
  BudgetSignalsPayload,
  LeadInsightsPayload,
  SimilaritySignalsPayload,
  TimetableInsightsPayload,
} from '../types/ml';

const MS_IN_DAY = 1000 * 60 * 60 * 24;
type LoadedLead = Prisma.LeadGetPayload<{
  include: {
    appointments: { select: { startAt: true; status: true } };
    scores: { select: { score: true; createdAt: true } };
  };
}>;

class LeadNotFoundError extends Error {
  status = 404;

  constructor(message: string) {
    super(message);
    this.name = 'LeadNotFoundError';
  }
}

function calculateDaysBetween(start: Date, end: Date): number {
  return Number(((end.getTime() - start.getTime()) / MS_IN_DAY).toFixed(2));
}

function safeNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }
  return value;
}

function normalizeTags(tags?: string[] | null): string[] {
  return Array.isArray(tags) ? tags.filter((tag) => Boolean(tag)).map((tag) => tag.trim()) : [];
}

function extractBudgetFromDescription(description?: string | null): number | null {
  if (!description) {
    return null;
  }
  const budgetMatch = description.match(/\$?\s*(\d{2,3}(?:[\s,]?\d{3})+|\d+(?:\.\d+)?)(?:\s*([kK]))?/);
  if (!budgetMatch) {
    return null;
  }
  const numeric = Number.parseFloat(budgetMatch[1].replace(/[$,\s]/g, ''));
  if (!Number.isFinite(numeric)) {
    return null;
  }
  const multiplier = budgetMatch[2] ? 1000 : 1;
  const value = numeric * multiplier;
  return value >= 1000 ? value : null;
}

function computeBudgetSignals(
  description: string | null | undefined,
  tags: string[],
  priority: string | null | undefined,
  rating: number | null | undefined,
): BudgetSignalsPayload {
  const loweredTags = tags.map((tag) => tag.toLowerCase());
  const estimatedBudget = extractBudgetFromDescription(description);
  const hasBudget = typeof estimatedBudget === 'number';
  const tradeIn = loweredTags.some((tag) => tag.includes('trade'));
  const financingInterest = loweredTags.some((tag) => tag.includes('finance') || tag.includes('loan'));

  return {
    hasBudget,
    estimatedBudget: hasBudget ? estimatedBudget : null,
    tradeIn,
    financingInterest,
    priority: priority ?? null,
    rating: typeof rating === 'number' ? rating : null,
  };
}

function computeActivityAggregate(
  activitySamples: Array<{ type: ActivityType; opened: boolean; clicked: boolean; createdAt: Date }>,
  communicationSamples: Array<{ type: CommunicationType; direction: CommunicationDirection; createdAt: Date }>,
): ActivityAggregatePayload {
  let emailOpens = 0;
  let emailClicks = 0;
  let calls = 0;
  let sms = 0;
  let websiteVisits = 0;
  let meetings = 0;
  let inboundResponses = 0;

  const now = new Date();
  const last7Window = subDays(now, 7);
  const previous7Window = subDays(now, 14);

  let last7Interactions = 0;
  let previous7Interactions = 0;

  for (const activity of activitySamples) {
    if (activity.type === ActivityType.EMAIL) {
      if (activity.opened) emailOpens += 1;
      if (activity.clicked) emailClicks += 1;
    }
    if (activity.type === ActivityType.CALL) {
      calls += 1;
    }
    if (activity.type === ActivityType.MEETING || activity.type === ActivityType.TEST_DRIVE) {
      meetings += 1;
    }
    if (activity.type === ActivityType.VISIT) {
      websiteVisits += 1;
    }

    if (activity.createdAt >= last7Window) {
      last7Interactions += 1;
    } else if (activity.createdAt >= previous7Window) {
      previous7Interactions += 1;
    }
  }

  for (const communication of communicationSamples) {
    if (communication.type === CommunicationType.CALL) {
      calls += 1;
    }
    if (communication.type === CommunicationType.SMS) {
      sms += 1;
    }
    if (communication.direction === CommunicationDirection.INBOUND) {
      inboundResponses += 1;
    }

    if (communication.createdAt >= last7Window) {
      last7Interactions += 1;
    } else if (communication.createdAt >= previous7Window) {
      previous7Interactions += 1;
    }
  }

  const totalInteractions = activitySamples.length + communicationSamples.length;

  return {
    emailOpens,
    emailClicks,
    calls,
    sms,
    websiteVisits,
    meetings,
    inboundResponses,
    totalInteractions,
    last7DayInteractions: last7Interactions,
    previous7DayInteractions: previous7Interactions,
  };
}

function computeTimetable(lead: LoadedLead, aggregate: ActivityAggregatePayload): TimetableInsightsPayload {
  const now = new Date();
  const lastActivityAt = lead.lastActivityAt ?? null;
  const daysInPipeline = calculateDaysBetween(lead.createdAt, now);
  const hoursSinceLastActivity = lastActivityAt ? (now.getTime() - lastActivityAt.getTime()) / (1000 * 60 * 60) : null;
  const lastInteractionDays = hoursSinceLastActivity !== null ? Number((hoursSinceLastActivity / 24).toFixed(2)) : null;

  const upcomingAppointment = lead.appointments.find(
    (appointment) =>
      appointment.startAt &&
      appointment.startAt > now &&
      appointment.status !== AppointmentStatus.CANCELLED &&
      appointment.status !== AppointmentStatus.NO_SHOW,
  );

  const upcomingAppointmentInHours = upcomingAppointment
    ? Number(((upcomingAppointment.startAt!.getTime() - now.getTime()) / (1000 * 60 * 60)).toFixed(2))
    : null;

  const velocityDelta = aggregate.last7DayInteractions - aggregate.previous7DayInteractions;
  const momentum = aggregate.previous7DayInteractions
    ? Number((velocityDelta / Math.max(aggregate.previous7DayInteractions, 1)).toFixed(2))
    : aggregate.last7DayInteractions > 0
      ? 1
      : 0;

  return {
    daysInPipeline,
    hoursSinceLastActivity: safeNumber(hoursSinceLastActivity),
    lastInteractionDays,
    nextActionAt: lead?.nextActionAt ? lead.nextActionAt.toISOString() : null,
    upcomingAppointmentInHours,
    engagementMomentum: safeNumber(momentum),
  };
}

function computeSimilaritySignals(
  convertedLeads: Array<{ source: string | null; priority: string | null; tags: string[]; rating: number | null }>,
  leadTags: string[],
  leadSource: string | null,
  leadPriority: string | null,
  leadRating: number | null,
): SimilaritySignalsPayload {
  if (convertedLeads.length === 0) {
    return {
      score: 0.45,
      sampleSize: 0,
      sourceMatchRate: 0,
      priorityMatchRate: 0,
      tagOverlapRate: 0,
    };
  }

  let sourceMatches = 0;
  let priorityMatches = 0;
  let tagOverlap = 0;

  for (const converted of convertedLeads) {
    if (converted.source && converted.source === leadSource) {
      sourceMatches += 1;
    }
    if (converted.priority && converted.priority === leadPriority) {
      priorityMatches += 1;
    }
    const convertedTags = Array.isArray(converted.tags) ? converted.tags : [];
    if (convertedTags.length) {
      const overlap = convertedTags.filter((tag) => leadTags.includes(tag)).length;
      tagOverlap += overlap;
    }
  }

  const sampleSize = convertedLeads.length;
  const sourceMatchRate = sourceMatches / sampleSize;
  const priorityMatchRate = priorityMatches / sampleSize;
  const tagOverlapRate = leadTags.length ? tagOverlap / (leadTags.length * sampleSize) : 0;
  const ratingFactor = typeof leadRating === 'number' ? Math.max(leadRating, 0) / 100 : 0.5;

  const baseScore = 0.25 + sourceMatchRate * 0.3 + priorityMatchRate * 0.25 + tagOverlapRate * 0.2 + ratingFactor * 0.1;

  return {
    score: Number(Math.min(Math.max(baseScore, 0.15), 0.95).toFixed(4)),
    sampleSize,
    sourceMatchRate: Number(sourceMatchRate.toFixed(4)),
    priorityMatchRate: Number(priorityMatchRate.toFixed(4)),
    tagOverlapRate: Number(tagOverlapRate.toFixed(4)),
  };
}

function computeDerivedEngagement(aggregate: ActivityAggregatePayload): number {
  const raw =
    aggregate.emailOpens * 2 +
    aggregate.emailClicks * 4 +
    aggregate.calls * 6 +
    aggregate.sms * 3 +
    aggregate.websiteVisits * 3 +
    aggregate.meetings * 8 +
    aggregate.inboundResponses * 5;

  let trendBonus = 0;
  if (aggregate.previous7DayInteractions) {
    const delta = aggregate.last7DayInteractions - aggregate.previous7DayInteractions;
    trendBonus = Math.min(Math.max(delta / Math.max(aggregate.previous7DayInteractions, 1), -0.25), 0.5) * 20;
  } else if (aggregate.last7DayInteractions > 0) {
    trendBonus = 10;
  }

  const engagement = Math.tanh(raw / 40) * 100 + trendBonus;
  return Number(Math.min(Math.max(engagement, 0), 100).toFixed(2));
}

export async function buildLeadInsights(leadId: string): Promise<LeadInsightsPayload> {
  const lead = await prisma.lead.findFirst({
    where: { id: leadId },
    include: {
      appointments: {
        orderBy: { startAt: 'asc' },
        take: 5,
        select: { startAt: true, status: true },
      },
      scores: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { score: true, createdAt: true },
      },
    },
  });

  if (!lead) {
    throw new LeadNotFoundError(`Lead ${leadId} not found`);
  }

  const ninetyDaysAgo = subDays(new Date(), 90);

  const [activities, communications, convertedLeads] = await Promise.all([
    prisma.activity.findMany({
      where: {
        leadId,
        createdAt: { gte: ninetyDaysAgo },
      },
      select: {
        type: true,
        opened: true,
        clicked: true,
        createdAt: true,
      },
    }),
    prisma.communication.findMany({
      where: {
        leadId,
        createdAt: { gte: ninetyDaysAgo },
      },
      select: {
        type: true,
        direction: true,
        createdAt: true,
      },
    }),
    prisma.lead.findMany({
      where: {
        isConverted: true,
        id: { not: leadId },
      },
      select: {
        source: true,
        priority: true,
        tags: true,
        rating: true,
      },
      take: 75,
    }),
  ]);

  const tags = normalizeTags(lead.tags);
  const aggregate = computeActivityAggregate(activities, communications);
  const timetable = computeTimetable(lead, aggregate);
  const budgetSignals = computeBudgetSignals(lead.description, tags, lead.priority, lead.rating ?? null);
  const similarity = computeSimilaritySignals(convertedLeads, tags, lead.source, lead.priority, lead.rating ?? null);
  const derivedEngagement = computeDerivedEngagement(aggregate);

  const metadata = {
    id: lead.id,
    status: lead.status,
    source: lead.source,
    priority: lead.priority,
    rating: lead.rating ?? null,
    tags,
    createdAt: lead.createdAt.toISOString(),
    assignedToId: lead.assignedToId,
    ownerId: lead.ownerId,
    latestScore: lead.score ?? null,
    stage: lead.status,
  };

  return {
    leadId,
    tenantId: lead.tenantId,
    metadata,
    activities: aggregate,
    timetable,
    budgetSignals,
    similarity,
    derivedEngagementScore: derivedEngagement,
    latestScore: lead.scores[0]
      ? {
          score: lead.scores[0].score,
          createdAt: lead.scores[0].createdAt.toISOString(),
        }
      : null,
  };
}

export { LeadNotFoundError };

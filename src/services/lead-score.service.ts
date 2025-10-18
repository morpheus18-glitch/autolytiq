import { prisma } from '../lib/prisma.js';
import { emitTenantEvent } from '../lib/socket.js';
import type { LeadInsightsPayload, LeadScoreResponsePayload } from '../types/ml.js';
import { buildLeadInsights, LeadNotFoundError } from './lead-intelligence.service.js';
import { mlService } from './ml.service.js';

const MODEL_KEY = 'ml-fastapi-heuristic-v1';

interface LeadScoreResult {
  insights: LeadInsightsPayload;
  score: LeadScoreResponsePayload;
  requestId: string;
  leadScoreRecord: {
    id: string;
    leadId: string;
    score: number;
    scoreDelta: number | null;
    modelKey: string;
    createdAt: Date;
  };
}

export async function calculateLeadScore(leadId: string, requestId?: string): Promise<LeadScoreResult> {
  const insights = await buildLeadInsights(leadId);
  const scoreResponse = await mlService.scoreLead({ ...insights, requestId, tenantId: insights.tenantId });

  const previousScore = insights.metadata.latestScore ?? null;
  const scoreDelta = previousScore !== null ? scoreResponse.score - previousScore : null;

  const { leadScore, lead } = await prisma.$transaction(async (tx) => {
    const leadScore = await tx.leadScore.create({
      data: {
        leadId,
        modelKey: MODEL_KEY,
        score: scoreResponse.score,
        scoreDelta,
        reason: scoreResponse.factors[0]?.reason?.slice(0, 255) ?? null,
        metadata: scoreResponse,
      },
    });

    const lead = await tx.lead.update({
      where: { id: leadId },
      data: { score: scoreResponse.score },
      select: { id: true, tenantId: true, score: true, status: true },
    });

    return { leadScore, lead };
  });

  emitTenantEvent(lead.tenantId, 'lead:scoreUpdated', {
    leadId,
    score: scoreResponse.score,
    scoreDelta,
    modelKey: MODEL_KEY,
    confidence: scoreResponse.confidence,
    factors: scoreResponse.factors,
    calculatedAt: leadScore.createdAt,
  });

  return {
    insights: {
      ...insights,
      metadata: { ...insights.metadata, latestScore: scoreResponse.score },
      latestScore: {
        score: scoreResponse.score,
        createdAt: leadScore.createdAt.toISOString(),
      },
    },
    score: scoreResponse,
    requestId: scoreResponse.requestId,
    leadScoreRecord: {
      id: leadScore.id,
      leadId: leadScore.leadId,
      score: leadScore.score,
      scoreDelta: leadScore.scoreDelta,
      modelKey: leadScore.modelKey,
      createdAt: leadScore.createdAt,
    },
  };
}

export async function fetchCloseProbability(leadId: string, requestId?: string) {
  const insights = await buildLeadInsights(leadId);

  const scoreReference =
    insights.latestScore?.score ?? insights.metadata.latestScore ?? null;

  const response = await mlService.closeProbability({
    leadId,
    score: scoreReference ?? undefined,
    engagementScore: insights.derivedEngagementScore,
    daysInPipeline: insights.timetable.daysInPipeline,
    lastInteractionDays: insights.timetable.lastInteractionDays,
    similarity: insights.similarity.score,
    requestId,
    tenantId: insights.tenantId,
  });

  return {
    probability: response.probability,
    horizonDays: response.horizonDays,
    requestId: response.requestId,
    insights,
  };
}

export { LeadNotFoundError };

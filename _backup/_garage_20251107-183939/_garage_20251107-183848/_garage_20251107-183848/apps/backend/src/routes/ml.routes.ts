import { Router } from 'express';
import { requireRole } from '../middleware/rbac';
import type { Role } from '../types/roles';
import { resolveRequestId } from '../lib/request';
import { buildLeadInsights, LeadNotFoundError } from '../services/lead-intelligence.service';
import { mlService } from '../services/ml.service';
import type { SentimentMessagePayload } from '../types/ml';
import { fetchCloseProbability } from '../services/lead-score.service';

const allowedRoles: Role[] = ['ADMIN', 'BDC', 'SALES'];

export const mlRouter = Router();

mlRouter.post('/next-action', requireRole(...allowedRoles), async (req, res, next) => {
  const requestId = resolveRequestId(req);
  res.setHeader('X-Request-Id', requestId);

  try {
    const { leadId, prompt, channel } = req.body ?? {};
    if (!leadId || typeof leadId !== 'string') {
      return res.status(400).json({ message: 'leadId is required' });
    }
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'prompt is required' });
    }

    const insights = await buildLeadInsights(leadId);

    const response = await mlService.nextAction({
      leadId,
      prompt,
      channel,
      context: insights,
      requestId,
    });

    res.setHeader('X-Request-Id', response.requestId);
    res.json({
      data: response,
      requestId: response.requestId,
      insights: {
        metadata: insights.metadata,
        activities: insights.activities,
        timetable: insights.timetable,
        budgetSignals: insights.budgetSignals,
        similarity: insights.similarity,
      },
    });
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

mlRouter.post('/sentiment-analysis', requireRole(...allowedRoles), async (req, res, next) => {
  const requestId = resolveRequestId(req);
  res.setHeader('X-Request-Id', requestId);

  try {
    const { text, messages } = req.body ?? {};

    const normalizedMessages: SentimentMessagePayload[] | undefined = Array.isArray(messages)
      ? messages
          .filter((message) => message && typeof message.text === 'string' && message.text.trim().length > 0)
          .map((message) => ({
            speaker: typeof message.speaker === 'string' ? message.speaker : 'unknown',
            text: message.text,
            timestamp: typeof message.timestamp === 'string' ? message.timestamp : undefined,
          }))
      : undefined;

    if ((!text || typeof text !== 'string' || text.trim().length === 0) && (!normalizedMessages || normalizedMessages.length === 0)) {
      return res.status(400).json({ message: 'text or messages are required for sentiment analysis' });
    }

    const payload = {
      text: typeof text === 'string' && text.trim().length > 0 ? text : undefined,
      messages: normalizedMessages,
      requestId,
      tenantId: req.context?.tenantId,
    };

    const response = await mlService.sentimentAnalysis(payload);
    res.setHeader('X-Request-Id', response.requestId);
    res.json({ data: response, requestId: response.requestId });
  } catch (error) {
    next(error);
  }
});

mlRouter.get('/close-probability', requireRole(...allowedRoles), async (req, res, next) => {
  const requestId = resolveRequestId(req);
  res.setHeader('X-Request-Id', requestId);

  try {
    const { leadId } = req.query;
    if (!leadId || typeof leadId !== 'string') {
      return res.status(400).json({ message: 'leadId query parameter is required' });
    }

    const result = await fetchCloseProbability(leadId, requestId);

    res.setHeader('X-Request-Id', result.requestId);
    res.json({
      data: { probability: result.probability, horizonDays: result.horizonDays },
      requestId: result.requestId,
      insights: {
        derivedEngagementScore: result.insights.derivedEngagementScore,
        timetable: result.insights.timetable,
        similarity: result.insights.similarity,
      },
    });
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

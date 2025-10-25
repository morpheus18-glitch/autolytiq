import { Router } from 'express';
import { prisma, isTenantScoped } from '../lib/prisma.js';
import { requireRole } from '../middleware/rbac.js';
import type { Role } from '../types/roles.js';
import { resolveRequestId } from '../lib/request.js';
import { calculateLeadScore, LeadNotFoundError } from '../services/lead-score.service.js';

const allowedRoles: Role[] = ['ADMIN', 'BDC', 'SALES'];

export const leadRouter = Router();

leadRouter.get('/', requireRole(...allowedRoles), async (req, res, next) => {
  try {
    if (!isTenantScoped()) {
      return res.status(500).json({ message: 'Tenant context not established' });
    }

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        assignedTo: true,
        customer: true,
        scores: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    res.json({ data: leads });
  } catch (error) {
    next(error);
  }
});

leadRouter.post('/:id/score/calculate', requireRole(...allowedRoles), async (req, res, next) => {
  const requestId = resolveRequestId(req);
  res.setHeader('X-Request-Id', requestId);

  try {
    const result = await calculateLeadScore(req.params.id, requestId);
    res.setHeader('X-Request-Id', result.requestId);
    res.json({
      data: {
        score: result.score,
        leadScore: result.leadScoreRecord,
        insights: {
          metadata: result.insights.metadata,
          activities: result.insights.activities,
          timetable: result.insights.timetable,
          budgetSignals: result.insights.budgetSignals,
          similarity: result.insights.similarity,
          derivedEngagementScore: result.insights.derivedEngagementScore,
        },
      },
      requestId: result.requestId,
    });
  } catch (error) {
    if (error instanceof LeadNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
});

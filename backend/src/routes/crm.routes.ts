import express from 'express';
import type { LeadStatus, Prisma } from '@prisma/client';
import { requireRole } from '../middleware/role.middleware.js';
import { wrapAsync, NotFound } from '../lib/errors.js';
import prisma, { assertTenantScope } from '../lib/prisma.js';

const router = express.Router();

function buildLeadFilters(query: express.Request['query']): Prisma.LeadWhereInput {
  const filters: Prisma.LeadWhereInput = {};

  if (typeof query.status === 'string') {
    const statusValue = query.status.toUpperCase();
    if ((Object.values(LeadStatus) as string[]).includes(statusValue)) {
      filters.status = statusValue as LeadStatus;
    }
  }

  if (typeof query.assignedTo === 'string') {
    filters.assignedToId = query.assignedTo;
  }

  if (typeof query.owner === 'string') {
    filters.ownerId = query.owner;
  }

  if (typeof query.search === 'string' && query.search.trim().length > 0) {
    const term = query.search.trim();
    filters.OR = [
      { firstName: { contains: term, mode: 'insensitive' } },
      { lastName: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
      { phone: { contains: term, mode: 'insensitive' } },
    ];
  }

  return filters;
}

router.get(
  '/leads',
  requireRole('ADMIN', 'MANAGER', 'SALES', 'BDC', 'SERVICE'),
  wrapAsync(async (req, res) => {
    assertTenantScope();

    const limit =
      typeof req.query.limit === 'string' && Number.isInteger(Number(req.query.limit))
        ? Number(req.query.limit)
        : 50;

    const leads = await prisma.lead.findMany({
      where: buildLeadFilters(req.query),
      include: {
        customer: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 5 },
        appointments: { orderBy: { startAt: 'desc' }, take: 3 },
        communications: { orderBy: { createdAt: 'desc' }, take: 5 },
        scores: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });

    res.json({ data: leads });
  }),
);

router.get(
  '/leads/:id',
  requireRole('ADMIN', 'MANAGER', 'SALES', 'BDC', 'SERVICE'),
  wrapAsync(async (req, res) => {
    assertTenantScope();

    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { startAt: 'desc' } },
        communications: { orderBy: { createdAt: 'desc' } },
        scores: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!lead) {
      throw NotFound('Lead not found');
    }

    res.json({ data: lead });
  }),
);

export default router;

import { Router } from 'express';
import { prisma, isTenantScoped } from '../lib/prisma.js';
import { requireRole } from '../middleware/rbac.js';
import type { Role } from '../types/roles.js';

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

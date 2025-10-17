import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { getTenantContext } from '../lib/tenant-context.js';
import { BadRequest } from '../lib/errors.js';

const router = express.Router();

router.get('/tenants', async (_req, res) => {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      users: {
        where: { isSuperAdmin: false },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
        take: 10,
      },
    },
  });

  res.json({ tenants });
});

router.get('/tenants/:id', async (req, res) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: req.params.id },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isSuperAdmin: true,
          lastLoginAt: true,
        },
      },
      deals: { take: 5, orderBy: { createdAt: 'desc' } },
      vehicles: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  res.json({ tenant });
});

router.post('/impersonate/:tenantId', async (req, res) => {
  const context = getTenantContext();
  if (!context?.userId) {
    throw BadRequest('Missing actor context for impersonation');
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: req.params.tenantId } });
  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be configured');
  }

  const token = jwt.sign(
    {
      userId: context.userId,
      tenantId: tenant.id,
      isSuperAdmin: true,
      impersonatedTenantId: tenant.id,
    },
    secret,
    { expiresIn: '30m' },
  );

  res.json({
    impersonationToken: token,
    expiresIn: 1800,
    tenant: { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain },
  });
});

router.get('/stats', async (_req, res) => {
  const [tenantCount, userCount, dealCount, revenue] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count({ where: { isSuperAdmin: false } }),
    prisma.deal.count(),
    prisma.deal.aggregate({
      _sum: { totalGross: true, frontEndGross: true, backEndGross: true },
    }),
  ]);

  res.json({
    tenants: tenantCount,
    users: userCount,
    deals: dealCount,
    revenue: {
      totalGross: revenue._sum.totalGross ?? 0,
      frontEnd: revenue._sum.frontEndGross ?? 0,
      backEnd: revenue._sum.backEndGross ?? 0,
    },
  });
});

router.get('/health/database', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'healthy' });
});

export default router;

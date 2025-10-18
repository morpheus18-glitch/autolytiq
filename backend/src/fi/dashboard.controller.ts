import type { Request, Response } from 'express';
import { startOfDay, endOfDay, startOfMonth } from 'date-fns';
import { z } from 'zod';
import { fiDashboardService, type DashboardFilters } from './dashboard.service.js';
import { BadRequest, wrapAsync } from '../lib/errors.js';
import { requireTenantIdFromRequest } from '../lib/mw/tenantGuard.js';

const filterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  lenderId: z.string().uuid().optional(),
  salespersonId: z.string().uuid().optional(),
});

function parseDate(value?: string) {
  if (!value) {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw BadRequest('Invalid date provided');
  }
  return parsed;
}

function resolveFilters(query: Request['query']): DashboardFilters {
  const parsed = filterSchema.parse(query);
  const now = new Date();
  const startInput = parseDate(parsed.startDate) ?? startOfMonth(now);
  const endInput = parseDate(parsed.endDate) ?? now;
  const start = startOfDay(startInput);
  const end = endOfDay(endInput);

  if (start > end) {
    throw BadRequest('startDate must be earlier than endDate');
  }

  return {
    start,
    end,
    lenderId: parsed.lenderId ?? undefined,
    salespersonId: parsed.salespersonId ?? undefined,
  } satisfies DashboardFilters;
}

export const getDashboardKpis = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const filters = resolveFilters(req.query);
  const data = await fiDashboardService.getKpis(tenantId, filters);
  res.json(data);
});

export const getActiveDeals = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const filters = resolveFilters(req.query);
  const data = await fiDashboardService.getActiveDeals(tenantId, filters);
  res.json(data);
});

export const getProductPerformance = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const filters = resolveFilters(req.query);
  const data = await fiDashboardService.getProductPerformance(tenantId, filters);
  res.json(data);
});

export const getLenderPerformance = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const filters = resolveFilters(req.query);
  const data = await fiDashboardService.getLenderPerformance(tenantId, filters);
  res.json(data);
});

export const getCommissionSummary = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const filters = resolveFilters(req.query);
  const data = await fiDashboardService.getCommissionSummary(tenantId, filters);
  res.json(data);
});

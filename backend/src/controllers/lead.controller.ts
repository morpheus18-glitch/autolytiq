import type { Request, Response } from 'express';
import { z } from 'zod';
import { ok, created, noContent } from '../lib/response.js';
import { BadRequest, Unprocessable } from '../lib/errors.js';
import {
  leadAssignSchema,
  leadConvertSchema,
  leadCreateSchema,
  leadScoreCalculationSchema,
  leadUpdateSchema,
  parseLeadListQuery,
} from '../validations/lead.validation.js';
import * as leadService from '../services/lead.service.js';
import { getLeadStats } from '../services/lead-stats.service.js';
import { importLeadsFromCsv } from '../services/lead-import.service.js';

const statsQuerySchema = z.object({
  from: z.preprocess((value) => (value ? new Date(String(value)) : undefined), z.date().optional()),
  to: z.preprocess((value) => (value ? new Date(String(value)) : undefined), z.date().optional()),
});

function parseImportOptions(body: Record<string, any>) {
  if (body?.options) {
    if (typeof body.options === 'string') {
      try {
        return JSON.parse(body.options);
      } catch (error) {
        throw BadRequest('Import options must be valid JSON');
      }
    }
    if (typeof body.options === 'object') {
      return body.options;
    }
  }

  const mappingsInput = body?.mappings;
  let mappings: Record<string, string> | undefined;
  if (typeof mappingsInput === 'string') {
    try {
      mappings = JSON.parse(mappingsInput);
    } catch (error) {
      throw BadRequest('Import mappings must be valid JSON');
    }
  } else if (typeof mappingsInput === 'object' && mappingsInput !== null) {
    mappings = mappingsInput;
  }

  const dryRunValue = body?.dryRun;
  let dryRun: boolean | undefined;
  if (typeof dryRunValue === 'string') {
    dryRun = ['true', '1', 'yes', 'on'].includes(dryRunValue.toLowerCase());
  } else if (typeof dryRunValue === 'boolean') {
    dryRun = dryRunValue;
  }

  const normalizeEnum = (value: unknown) =>
    typeof value === 'string'
      ? value
          .trim()
          .replace(/\s+/g, '_')
          .replace(/-+/g, '_')
          .toUpperCase()
      : value;

  return {
    dryRun,
    overrideSource: normalizeEnum(body?.overrideSource),
    overrideStatus: normalizeEnum(body?.overrideStatus),
    mappings,
  };
}

export async function listLeads(req: Request, res: Response) {
  const { tenantId } = req.user!;
  let parsedQuery;
  try {
    parsedQuery = parseLeadListQuery(req.query as Record<string, unknown>);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw Unprocessable('Invalid lead filters', error.flatten());
    }
    throw error;
  }

  const result = await leadService.listLeads({ tenantId, query: parsedQuery });
  return ok(res, result);
}

export async function createLead(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = leadCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid lead payload', parsed.error.flatten());
  }
  const lead = await leadService.createLead(tenantId, parsed.data);
  return created(res, lead);
}

export async function getLead(req: Request, res: Response) {
  const lead = await leadService.getLead(req.params.id);
  return ok(res, lead);
}

export async function updateLead(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = leadUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid lead update', parsed.error.flatten());
  }
  const lead = await leadService.updateLead(req.params.id, tenantId, parsed.data);
  return ok(res, lead);
}

export async function deleteLead(req: Request, res: Response) {
  const { tenantId } = req.user!;
  await leadService.deleteLead(req.params.id, tenantId);
  return noContent(res);
}

export async function assignLead(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = leadAssignSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid assignment payload', parsed.error.flatten());
  }
  const lead = await leadService.assignLead(req.params.id, tenantId, parsed.data.userId ?? null);
  return ok(res, lead);
}

export async function convertLead(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = leadConvertSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid conversion payload', parsed.error.flatten());
  }
  const lead = await leadService.convertLead(req.params.id, tenantId, parsed.data.won, parsed.data.lostReason);
  return ok(res, lead);
}

export async function getLeadScore(req: Request, res: Response) {
  const history = await leadService.getLeadScoreHistory(req.params.id);
  return ok(res, { history });
}

export async function calculateLeadScore(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = leadScoreCalculationSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw Unprocessable('Invalid score calculation payload', parsed.error.flatten());
  }
  const result = await leadService.calculateLeadScore(req.params.id, tenantId);
  return ok(res, result);
}

export async function getLeadStatistics(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = statsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw Unprocessable('Invalid statistics range', parsed.error.flatten());
  }
  const stats = await getLeadStats({ tenantId, ...parsed.data });
  return ok(res, stats);
}

export async function importLeads(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const options = parseImportOptions(req.body ?? {});
  const summary = await importLeadsFromCsv(tenantId, req.file?.buffer, options);
  return ok(res, summary);
}


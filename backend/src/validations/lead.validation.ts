import { LeadPriority, LeadSource, LeadStatus } from '@prisma/client';
import { z } from 'zod';

function coerceStringArray(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .flatMap((value) => (typeof value === 'string' ? value.split(',') : []))
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }
  return [];
}

const baseLeadSchema = z.object({
  firstName: z.string().trim().min(1).max(120).optional(),
  lastName: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(5).max(32).optional(),
  customerId: z.string().trim().min(1).optional(),
  ownerId: z.string().trim().min(1).optional(),
  assignedToId: z.string().trim().min(1).optional(),
  rating: z.number().int().min(0).max(100).optional(),
  score: z.number().int().min(0).max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(64)).optional(),
});

export const leadCreateSchema = baseLeadSchema
  .extend({
    status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
    source: z.nativeEnum(LeadSource).default(LeadSource.WEBSITE),
    priority: z.nativeEnum(LeadPriority).optional(),
  })
  .refine((data) => data.firstName || data.lastName || data.email || data.phone, {
    message: 'At least one of firstName, lastName, email or phone is required to create a lead',
    path: ['firstName'],
  });

export const leadUpdateSchema = baseLeadSchema
  .extend({
    status: z.nativeEnum(LeadStatus).optional(),
    source: z.nativeEnum(LeadSource).optional(),
    priority: z.nativeEnum(LeadPriority).optional(),
    isArchived: z.boolean().optional(),
    convertedAt: z.coerce.date().optional(),
    wonAt: z.coerce.date().optional(),
    lostAt: z.coerce.date().optional(),
    lostReason: z.string().trim().max(255).optional(),
    tags: z.array(z.string().trim().min(1).max(64)).optional(),
  })
  .partial();

export const leadAssignSchema = z.object({
  userId: z.string().trim().min(1).nullable().optional(),
});

export const leadConvertSchema = z
  .object({
    won: z.boolean(),
    lostReason: z.string().trim().max(255).optional(),
  })
  .refine((data) => data.won || (data.lostReason !== undefined && data.lostReason.length > 0), {
    message: 'lostReason is required when marking a lead as lost',
    path: ['lostReason'],
  });

export const leadScoreCalculationSchema = z.object({
  model: z.string().trim().min(1).optional(),
  metadata: z.record(z.any()).optional(),
});

const rangeSchema = z.object({
  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
});

const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const leadListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().min(1).optional(),
  status: z.array(z.nativeEnum(LeadStatus)).optional(),
  source: z.array(z.nativeEnum(LeadSource)).optional(),
  assignee: z.string().trim().min(1).optional(),
  score: rangeSchema.optional(),
  date: dateRangeSchema.optional(),
  sort: z.array(z.string().trim().min(1)).optional(),
});

export type LeadListQuery = z.infer<typeof leadListQuerySchema>;

export const leadImportRowSchema = z.object({
  firstName: z.string().trim().min(1).max(120).optional(),
  lastName: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().min(5).max(32).optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  source: z.nativeEnum(LeadSource).optional(),
  score: z.coerce.number().int().min(0).max(100).optional(),
  rating: z.coerce.number().int().min(0).max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  tags: z
    .union([
      z.array(z.string().trim().min(1).max(64)),
      z
        .string()
        .trim()
        .transform((value) =>
          value
            .split(',')
            .map((entry) => entry.trim())
            .filter((entry) => entry.length > 0),
        ),
    ])
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }
      const values = Array.isArray(value) ? value : [];
      return values.length > 0 ? values : undefined;
    }),
});

export const leadImportOptionsSchema = z.object({
  dryRun: z.boolean().optional().default(false),
  mappings: z.record(z.string()).optional(),
  overrideSource: z.nativeEnum(LeadSource).optional(),
  overrideStatus: z.nativeEnum(LeadStatus).optional(),
});

export type LeadImportRow = z.infer<typeof leadImportRowSchema>;
export type LeadImportOptions = z.infer<typeof leadImportOptionsSchema>;

export function parseLeadListQuery(query: Record<string, unknown>): LeadListQuery {
  const statusValues = coerceStringArray(query.status ?? query.statuses ?? query['status[]'])
    .map((value) => value.toUpperCase())
    .filter((value) => value.length > 0);
  const sourceValues = coerceStringArray(query.source ?? query.sources ?? query['source[]'])
    .map((value) => value.toUpperCase())
    .filter((value) => value.length > 0);
  const sortValues = coerceStringArray(query.sort ?? query.order);

  const scoreMin =
    query['score[min]'] ??
    (typeof query.score === 'object' && query.score !== null ? (query.score as Record<string, unknown>).min : undefined) ??
    query.scoreMin;
  const scoreMax =
    query['score[max]'] ??
    (typeof query.score === 'object' && query.score !== null ? (query.score as Record<string, unknown>).max : undefined) ??
    query.scoreMax;

  const dateFrom =
    query['date[from]'] ??
    (typeof query.date === 'object' && query.date !== null ? (query.date as Record<string, unknown>).from : undefined) ??
    query.dateFrom;
  const dateTo =
    query['date[to]'] ??
    (typeof query.date === 'object' && query.date !== null ? (query.date as Record<string, unknown>).to : undefined) ??
    query.dateTo;

  const normalized: Record<string, unknown> = {
    page: query.page ?? query.p ?? 1,
    size: query.size ?? query.limit ?? query.perPage ?? 20,
    q: typeof query.q === 'string' ? query.q : typeof query.search === 'string' ? query.search : undefined,
    status: statusValues,
    source: sourceValues,
    assignee: typeof query.assignee === 'string' ? query.assignee : typeof query.assignedTo === 'string' ? query.assignedTo : undefined,
    sort: sortValues,
  };

  if (scoreMin !== undefined || scoreMax !== undefined) {
    normalized.score = { min: scoreMin, max: scoreMax };
  }
  if (dateFrom !== undefined || dateTo !== undefined) {
    normalized.date = { from: dateFrom, to: dateTo };
  }

  return leadListQuerySchema.parse(normalized);
}


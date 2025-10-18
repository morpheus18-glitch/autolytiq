import { LeadSource, LeadStatus } from '@prisma/client';
import { parse } from 'fast-csv';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import prisma from '../lib/prisma.js';
import { BadRequest } from '../lib/errors.js';
import {
  LeadImportOptions,
  LeadImportRow,
  leadImportOptionsSchema,
  leadImportRowSchema,
} from '../validations/lead.validation.js';
import { derivePriorityFromScore } from './lead.service.js';
import { emitLeadCreated } from '../sockets/lead.channel.js';

interface ParsedRow {
  row: number;
  data: LeadImportRow;
  normalizedEmail?: string;
  normalizedPhone?: string;
}

interface ImportResult {
  rows: number;
  created: number;
  createdWouldBe: number;
  duplicates: number;
  invalid: number;
  duplicateRows: { row: number; reason: string }[];
  invalidRows: { row: number; errors: string[] }[];
}

const FIELD_ALIASES: Record<keyof LeadImportRow, string[]> = {
  firstName: ['first_name', 'firstname', 'first'],
  lastName: ['last_name', 'lastname', 'last'],
  email: ['email_address', 'email'],
  phone: ['phone_number', 'mobile', 'phone'],
  status: ['lead_status', 'status'],
  source: ['lead_source', 'source'],
  score: ['lead_score', 'score'],
  rating: ['lead_rating', 'rating'],
  description: ['notes', 'note', 'description'],
  tags: ['labels', 'tag_list', 'tags'],
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function normalizeEnum(value?: string) {
  if (!value) return undefined;
  return value
    .toString()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .toUpperCase();
}

function emptyToUndefined(value?: string | null): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = value.toString().trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizePhone(value?: string) {
  const normalized = emptyToUndefined(value)?.replace(/[^0-9+]/g, '');
  if (!normalized) {
    return undefined;
  }
  return normalized.startsWith('+') ? normalized : normalized.replace(/\D/g, '');
}

function sanitizeRow(
  raw: Record<string, string>,
  mappings?: Record<string, string>,
): Record<string, string | undefined> {
  const normalizedMap = new Map<string, string>();
  for (const [key, value] of Object.entries(raw)) {
    const sanitizedKey = normalizeKey(key);
    const sanitizedValue = value?.toString().trim();
    if (sanitizedKey.length > 0) {
      normalizedMap.set(sanitizedKey, sanitizedValue);
    }
  }

  const result: Record<string, string | undefined> = {};

  (Object.keys(FIELD_ALIASES) as (keyof LeadImportRow)[]).forEach((field) => {
    const mappingKey = mappings?.[field];
    if (mappingKey) {
      const mapped = normalizedMap.get(normalizeKey(mappingKey));
      if (mapped !== undefined) {
        result[field] = mapped;
        return;
      }
    }

    const aliases = [field as string, ...FIELD_ALIASES[field]];
    for (const alias of aliases) {
      const mapped = normalizedMap.get(normalizeKey(alias));
      if (mapped !== undefined) {
        result[field] = mapped;
        return;
      }
    }
  });

  return result;
}

function applyOverrides(row: LeadImportRow, options: LeadImportOptions): LeadImportRow {
  const overridden: LeadImportRow = { ...row };
  if (options.overrideSource) {
    overridden.source = options.overrideSource;
  }
  if (options.overrideStatus) {
    overridden.status = options.overrideStatus;
  }
  return overridden;
}

function buildCreatePayload(row: LeadImportRow & { email?: string; phone?: string }) {
  const status = row.status ?? LeadStatus.NEW;
  const source = row.source ?? LeadSource.WEBSITE;
  const score = row.score ?? undefined;
  const priority = derivePriorityFromScore(score);

  return {
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    status,
    source,
    score,
    priority,
    rating: row.rating ?? undefined,
    description: row.description ?? undefined,
    tags: row.tags ?? [],
  };
}

async function streamCsv(buffer: Buffer, options: LeadImportOptions) {
  const parsedRows: ParsedRow[] = [];
  const invalidRows: { row: number; errors: string[] }[] = [];

  let rowNumber = 1;

  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer)
      .pipe(
        parse<Record<string, string>, Record<string, string>>({
          headers: true,
          ignoreEmpty: true,
          trim: true,
        }),
      )
      .on('error', reject)
      .on('data', (row: Record<string, string>) => {
        const sanitized = sanitizeRow(row, options.mappings);
        const parsed = leadImportRowSchema.safeParse({
          ...sanitized,
          firstName: emptyToUndefined(sanitized.firstName),
          lastName: emptyToUndefined(sanitized.lastName),
          email: emptyToUndefined(sanitized.email)?.toLowerCase(),
          phone: normalizePhone(sanitized.phone),
          status: normalizeEnum(sanitized.status),
          source: normalizeEnum(sanitized.source),
          tags: sanitized.tags,
          score: emptyToUndefined(sanitized.score),
          rating: emptyToUndefined(sanitized.rating),
        });

        if (!parsed.success) {
          invalidRows.push({ row: rowNumber, errors: parsed.error.errors.map((error) => error.message) });
        } else {
          const data = applyOverrides(parsed.data, options);
          if (!data.firstName && !data.lastName && !data.email && !data.phone) {
            invalidRows.push({ row: rowNumber, errors: ['At least one of name, email or phone must be provided'] });
          } else {
            const normalizedEmail = data.email?.toLowerCase();
            const normalizedPhone = data.phone ? data.phone.replace(/\D/g, '') || undefined : undefined;
            if (normalizedEmail) {
              data.email = normalizedEmail;
            }
            if (normalizedPhone) {
              data.phone = normalizedPhone;
            }
            parsedRows.push({ row: rowNumber, data, normalizedEmail, normalizedPhone });
          }
        }

        rowNumber += 1;
      })
      .on('end', () => resolve());
  });

  return { parsedRows, invalidRows };
}

export async function importLeadsFromCsv(
  tenantId: string,
  file: Buffer | undefined,
  rawOptions: unknown,
): Promise<ImportResult> {
  if (!file || file.length === 0) {
    throw BadRequest('CSV file is required for lead import');
  }

  const parsedOptions = leadImportOptionsSchema.parse(rawOptions ?? {});
  const { parsedRows, invalidRows } = await streamCsv(file, parsedOptions);

  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const duplicateRows: { row: number; reason: string }[] = [];
  const candidateRows: ParsedRow[] = [];

  for (const entry of parsedRows) {
    let duplicate = false;
    if (entry.normalizedEmail) {
      if (seenEmails.has(entry.normalizedEmail)) {
        duplicate = true;
      } else {
        seenEmails.add(entry.normalizedEmail);
      }
    }
    if (!duplicate && entry.normalizedPhone) {
      if (seenPhones.has(entry.normalizedPhone)) {
        duplicate = true;
      } else {
        seenPhones.add(entry.normalizedPhone);
      }
    }
    if (duplicate) {
      duplicateRows.push({ row: entry.row, reason: 'duplicate_in_file' });
    } else {
      candidateRows.push(entry);
    }
  }

  const emailValues = candidateRows
    .map((row) => row.normalizedEmail)
    .filter((value): value is string => Boolean(value));
  const phoneValues = candidateRows
    .map((row) => row.normalizedPhone)
    .filter((value): value is string => Boolean(value));

  const existingMatches = await prisma.lead.findMany({
    where: {
      OR: [
        ...(emailValues.length > 0 ? [{ email: { in: emailValues } }] : []),
        ...(phoneValues.length > 0 ? [{ phone: { in: phoneValues } }] : []),
      ],
    },
    select: { email: true, phone: true },
  });

  const existingEmailSet = new Set(existingMatches.map((lead) => lead.email?.toLowerCase()).filter(Boolean) as string[]);
  const existingPhoneSet = new Set(existingMatches.map((lead) => (lead.phone ? lead.phone.replace(/\D/g, '') : undefined)).filter(Boolean) as string[]);

  const importRows: ParsedRow[] = [];

  for (const row of candidateRows) {
    if (row.normalizedEmail && existingEmailSet.has(row.normalizedEmail)) {
      duplicateRows.push({ row: row.row, reason: 'existing_email' });
      continue;
    }
    if (row.normalizedPhone && existingPhoneSet.has(row.normalizedPhone)) {
      duplicateRows.push({ row: row.row, reason: 'existing_phone' });
      continue;
    }
    importRows.push(row);
  }

  const createPayloads = importRows.map((row) => {
    const id = randomUUID();
    const dataWithDefaults: LeadImportRow & { email?: string; phone?: string } = {
      ...row.data,
      email: row.data.email ?? undefined,
      phone: row.data.phone ?? undefined,
      source: row.data.source ?? parsedOptions.overrideSource ?? LeadSource.WEBSITE,
      status: row.data.status ?? parsedOptions.overrideStatus ?? LeadStatus.NEW,
      tags: row.data.tags ?? [],
    };
    return {
      id,
      row: row.row,
      create: {
        id,
        tenantId,
        ...buildCreatePayload(dataWithDefaults),
      },
    };
  });

  let created = 0;

  if (!parsedOptions.dryRun && createPayloads.length > 0) {
    const batchSize = 500;
    for (let index = 0; index < createPayloads.length; index += batchSize) {
      const batch = createPayloads.slice(index, index + batchSize);
      await prisma.lead.createMany({
        data: batch.map((entry) => entry.create),
      });
      const createdLeads = await prisma.lead.findMany({
        where: { id: { in: batch.map((entry) => entry.id) } },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          customer: true,
          scores: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
      created += createdLeads.length;
      createdLeads.forEach((lead) => emitLeadCreated(tenantId, lead));
    }
  }

  return {
    rows: parsedRows.length + invalidRows.length,
    created,
    createdWouldBe: createPayloads.length,
    duplicates: duplicateRows.length,
    invalid: invalidRows.length,
    duplicateRows,
    invalidRows,
  };
}

export type LeadImportSummary = ImportResult;


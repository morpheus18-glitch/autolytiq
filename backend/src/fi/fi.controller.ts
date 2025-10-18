import type { Request, Response } from 'express';
import { z } from 'zod';
import { fiService } from './fi.service.js';
import { requireTenantIdFromRequest } from '../lib/mw/tenantGuard.js';
import { BadRequest, wrapAsync } from '../lib/errors.js';
import { extractKeyFromUrl, getSignedDownloadUrl } from '../lib/storage/s3.js';

const DEAL_STATUS_VALUES = [
  'Draft',
  'Credit Pulled',
  'Submitted',
  'Approved',
  'Contracted',
  'Funded',
  'Delivered',
  'Cancelled',
] as const;

const decimalLike = z.union([z.string(), z.number()]).nullable().optional();

const updateDealSchema = z.object({
  status: z.enum(DEAL_STATUS_VALUES).optional(),
  fiProducts: z.union([z.string(), z.record(z.any()), z.array(z.any())]).optional(),
  fiManagerId: z.string().uuid().nullable().optional(),
  lenderId: z.string().nullable().optional(),
  term: z.union([z.number(), z.string()]).nullable().optional(),
  sellingPrice: decimalLike,
  tradeValue: decimalLike,
  tradePayoff: decimalLike,
  netTrade: decimalLike,
  cashDown: decimalLike,
  amountFinanced: decimalLike,
  apr: decimalLike,
  monthlyPayment: decimalLike,
  totalFiGross: decimalLike,
  contractDate: z.string().datetime().nullable().optional(),
  fundedDate: z.string().datetime().nullable().optional(),
  deliveredDate: z.string().datetime().nullable().optional(),
});

const uploadDescriptorSchema = z.object({
  type: z.string().min(1),
  category: z.string().min(1),
  name: z.string().optional(),
});

function parseOrBadRequest<T>(schema: z.ZodSchema<T>, payload: unknown, message: string) {
  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw BadRequest(message, error.flatten());
    }
    throw error;
  }
}

async function withSignedDownloadUrl(document: Awaited<ReturnType<typeof fiService.listDocuments>>[number]) {
  const key = extractKeyFromUrl(document.fileUrl);
  if (!key) {
    return { ...document, downloadUrl: document.fileUrl };
  }

  try {
    const signedUrl = await getSignedDownloadUrl(key);
    return { ...document, downloadUrl: signedUrl };
  } catch {
    return { ...document, downloadUrl: document.fileUrl };
  }
}

export const getDeal = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const deal = await fiService.getDeal(req.user!, tenantId, req.params.id);
  res.json(deal);
});

export const updateDeal = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(updateDealSchema, req.body, 'Invalid deal update payload');
  const updated = await fiService.updateDeal(req.user!, tenantId, req.params.id, payload);
  res.json(updated);
});

export const listDocuments = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const documents = await fiService.listDocuments(req.user!, tenantId, req.params.id);
  const enriched = await Promise.all(documents.map((doc) => withSignedDownloadUrl(doc)));
  res.json(enriched);
});

export const uploadDocument = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const descriptor = parseOrBadRequest(uploadDescriptorSchema, req.body, 'Invalid document metadata');
  if (!req.file) {
    throw BadRequest('File upload missing');
  }

  const document = await fiService.uploadDocument(req.user!, tenantId, req.params.id, req.file, descriptor);
  const enriched = await withSignedDownloadUrl(document);
  res.status(201).json(enriched);
});

export const deleteDocument = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  await fiService.deleteDocument(req.user!, tenantId, req.params.id, req.params.docId);
  res.status(204).send();
});

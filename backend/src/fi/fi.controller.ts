import type { Request, Response } from 'express';
import { z } from 'zod';
import { fiService } from './fi.service.js';
import { creditBureauService } from './credit-bureau.service.js';
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

const coApplicantSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().min(7).optional(),
    email: z.string().email().optional(),
    ssn: z
      .string()
      .regex(/^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/)
      .optional(),
  })
  .optional()
  .nullable();

const referenceSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  phone: z.string().min(7),
});

const dateString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Invalid date format' });

const optionalDateString = dateString.optional().nullable();

const optionalSsn = z
  .string()
  .regex(/^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/)
  .optional()
  .nullable();

const optionalNumber = z.union([z.number(), z.string()]).transform((value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) {
    throw BadRequest('Invalid numeric value');
  }
  return numeric;
});

const requiredNumber = z.union([z.number(), z.string()]).transform((value) => {
  const numeric = optionalNumber.parse(value);
  if (numeric === null) {
    throw BadRequest('Numeric value is required');
  }
  return numeric;
});

const nonNegativeInt = requiredNumber.refine((value) => Number.isInteger(value) && value >= 0, {
  message: 'Value must be a non-negative integer',
});

const monthValue = requiredNumber.refine((value) => Number.isInteger(value) && value >= 0 && value <= 11, {
  message: 'Month value must be between 0 and 11',
});

const creditApplicationSchema = z.object({
  dealId: z.string().uuid(),
  firstName: z.string().min(1),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1),
  ssn: optionalSsn,
  dateOfBirth: dateString,
  phone: z.string().min(7),
  email: z.string().email(),
  currentStreet: z.string().min(1),
  currentCity: z.string().min(1),
  currentState: z.string().min(2),
  currentZip: z.string().min(5),
  yearsAtAddress: nonNegativeInt,
  monthsAtAddress: monthValue,
  residenceType: z.string().min(1),
  monthlyPayment: optionalNumber,
  previousStreet: z.string().optional().nullable(),
  previousCity: z.string().optional().nullable(),
  previousState: z.string().optional().nullable(),
  previousZip: z.string().optional().nullable(),
  employer: z.string().min(1),
  jobTitle: z.string().min(1),
  yearsEmployed: nonNegativeInt,
  monthsEmployed: monthValue,
  monthlyIncome: requiredNumber,
  employerPhone: z.string().min(7),
  otherIncomeSource: z.string().optional().nullable(),
  otherIncomeAmount: optionalNumber,
  coApplicant: coApplicantSchema,
  references: z.array(referenceSchema).min(1),
  authorizeCredit: z.boolean(),
  certifyAccuracy: z.boolean(),
  privacyConsent: z.boolean(),
  signature: z.string().optional().nullable(),
  signedAt: optionalDateString,
});

const pullCreditSchema = z.object({
  dealId: z.string().uuid(),
  bureau: z.enum(['experian', 'transunion', 'equifax', 'tri-merge']),
  pullType: z.enum(['soft', 'hard']),
});

const shareCreditReportSchema = z.object({
  dealId: z.string().uuid(),
  emails: z.array(z.string().email()).min(1),
  message: z.string().max(2000).optional(),
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

export const upsertCreditApplication = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(creditApplicationSchema, req.body, 'Invalid credit application payload');
  const application = await creditBureauService.saveApplication(tenantId, req.user!.userId, {
    ...payload,
    monthlyPayment: payload.monthlyPayment,
    monthlyIncome: payload.monthlyIncome,
    otherIncomeAmount: payload.otherIncomeAmount,
  });
  res.status(200).json(application);
});

export const getCreditApplication = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const application = await creditBureauService.getApplication(tenantId, req.params.dealId);
  if (!application) {
    res.status(404).json({ message: 'Credit application not found' });
    return;
  }
  res.json(application);
});

export const pullCreditReport = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(pullCreditSchema, req.body, 'Invalid pull credit payload');
  const report = await creditBureauService.pullCredit({
    ...payload,
    tenantId,
    userId: req.user!.userId,
    ipAddress: req.user?.ip ?? req.ip,
  });
  res.status(201).json(report);
});

export const getCreditReport = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const report = await creditBureauService.getReport(tenantId, req.params.dealId);
  if (!report) {
    res.status(404).json({ message: 'Credit report not found' });
    return;
  }
  res.json(report);
});

export const shareCreditReport = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(shareCreditReportSchema, req.body, 'Invalid credit report share payload');
  const result = await creditBureauService.shareReport({
    dealId: payload.dealId,
    tenantId,
    userId: req.user!.userId,
    recipients: payload.emails,
    message: payload.message,
  });
  res.status(200).json(result);
});

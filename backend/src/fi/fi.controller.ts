import type { Request, Response } from 'express';
import { z } from 'zod';
import { fiService } from './fi.service.js';
import { creditBureauService } from './credit-bureau.service.js';
import { CONTRACT_TYPES } from './contracts.types.js';
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

const optionalNumericInput = z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
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

const contractSignerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  roleLabel: z.string().min(1).optional(),
  routingOrder: z.number().int().positive().optional(),
  clientUserId: z.string().optional(),
});

const contractGenerationSchema = z.object({
  dealId: z.string().uuid(),
  contracts: z
    .array(
      z.object({
        type: z.enum(CONTRACT_TYPES),
        name: z.string().min(1).optional(),
        templateId: z.string().min(1).optional(),
        contractData: z.record(z.any()).optional(),
        signers: z.array(contractSignerSchema).optional(),
      }),
    )
    .min(1),
});

const contractSendSchema = z.object({
  dealId: z.string().uuid(),
  contractIds: z.array(z.string().uuid()).optional(),
  signers: z.array(contractSignerSchema).min(1),
  message: z.string().max(2000).optional(),
});

const contractStatusParamsSchema = z.object({
  dealId: z.string().uuid(),
});

const contractDownloadParamsSchema = z.object({
  contractId: z.string().uuid(),
});

const submitLendersSchema = z.object({
  dealId: z.string().uuid(),
  lenderIds: z.array(z.string().uuid()).min(1),
  desiredTerm: optionalNumericInput.nullable().optional(),
});

const selectDecisionSchema = z.object({
  submissionId: z.string().uuid(),
});

const counterOfferSchema = z
  .object({
    submissionId: z.string().uuid(),
    amount: optionalNumericInput,
    apr: optionalNumericInput,
    term: optionalNumericInput,
    message: z.string().max(2000).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (
      value.amount === null &&
      value.apr === null &&
      value.term === null &&
      (value.message === null || value.message === undefined || value.message.trim() === '')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide at least one counter offer field to send to the lender',
        path: ['amount'],
      });
    }
  });

const satisfyStipulationSchema = z.object({
  submissionId: z.string().uuid(),
  stipulationId: z.string().min(1),
  note: z.string().max(2000).optional().nullable(),
});

const menuOptionInputSchema = z.object({
  code: z.enum(['A', 'B', 'C', 'D']),
  label: z.string().trim().min(1).max(100).optional(),
  productIds: z.array(z.string().uuid()).max(20),
});

const buildMenuSchema = z.object({
  dealId: z.string().uuid(),
  options: z.array(menuOptionInputSchema).min(1).max(4),
});

const selectMenuOptionSchema = z.object({
  optionCode: z
    .string()
    .trim()
    .regex(/^[A-D]$/)
    .optional()
    .nullable(),
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

export const listLenders = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const lenders = await fiService.listLenders(req.user!, tenantId);
  res.json(lenders);
});

export const submitLenders = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(submitLendersSchema, req.body, 'Invalid lender submission payload');
  const submissions = await fiService.submitLenderApplications(req.user!, tenantId, {
    dealId: payload.dealId,
    lenderIds: payload.lenderIds,
    desiredTerm: payload.desiredTerm ?? undefined,
  });
  res.status(201).json(submissions);
});

export const listLenderDecisions = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const submissions = await fiService.listLenderDecisions(req.user!, tenantId, req.params.dealId);
  res.json(submissions);
});

export const selectLenderSubmission = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(selectDecisionSchema, req.body, 'Invalid decision selection payload');
  const updated = await fiService.selectLenderDecision(req.user!, tenantId, payload.submissionId);
  res.json(updated);
});

export const submitCounterOffer = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(counterOfferSchema, req.body, 'Invalid counter offer payload');
  const updated = await fiService.recordCounterOffer(req.user!, tenantId, {
    submissionId: payload.submissionId,
    amount: payload.amount,
    apr: payload.apr,
    term: payload.term,
    message: payload.message,
  });
  res.json(updated);
});

export const listFiProducts = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const products = await fiService.listFiProducts(req.user!, tenantId);
  res.json(products);
});

export const buildMenuConfiguration = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(buildMenuSchema, req.body, 'Invalid menu build payload');
  const menu = await fiService.buildMenuConfiguration(req.user!, tenantId, payload);
  res.json(menu);
});

export const getMenuConfiguration = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const menu = await fiService.getMenuConfiguration(req.user!, tenantId, req.params.dealId);
  res.json(menu);
});

export const selectMenuOption = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(
    selectMenuOptionSchema,
    req.body,
    'Invalid menu selection payload',
  );
  const menu = await fiService.selectMenuOption(
    req.user!,
    tenantId,
    req.params.dealId,
    payload.optionCode ?? null,
  );
  res.json(menu);
});

export const getFiProductDetails = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const product = await fiService.getFiProductDetails(req.user!, tenantId, req.params.productId);
  res.json(product);
});

export const satisfySubmissionStipulation = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(satisfyStipulationSchema, req.body, 'Invalid stipulation payload');
  const updated = await fiService.satisfyStipulation(req.user!, tenantId, payload);
  res.json(updated);
});

export const generateContracts = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(contractGenerationSchema, req.body, 'Invalid contract generation payload');
  const contracts = await fiService.generateContracts(req.user!, tenantId, payload);
  res.status(201).json(contracts);
});

export const sendContractsForSignature = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const payload = parseOrBadRequest(contractSendSchema, req.body, 'Invalid contract send payload');
  const result = await fiService.sendContractsForSignature(req.user!, tenantId, payload);
  res.json(result);
});

export const getContractStatuses = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const params = parseOrBadRequest(contractStatusParamsSchema, req.params, 'Invalid contract status request');
  const status = await fiService.getContractStatuses(req.user!, tenantId, params.dealId);
  res.json(status);
});

export const downloadContract = wrapAsync(async (req: Request, res: Response) => {
  const tenantId = requireTenantIdFromRequest(req);
  const params = parseOrBadRequest(contractDownloadParamsSchema, req.params, 'Invalid contract download request');
  const result = await fiService.getContractDownloadUrl(req.user!, tenantId, params.contractId);
  res.redirect(result.url);
});

export const handleContractsWebhook = wrapAsync(async (req: Request, res: Response) => {
  const result = await fiService.handleContractWebhook(req.body ?? {});
  res.status(202).json(result);
});

import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import prisma from '../lib/prisma.js';
import { BadRequest, Forbidden, NotFound } from '../lib/errors.js';
import type { AppRole } from '../types/express.js';
import {
  buildDealDocumentKey,
  deleteFromS3,
  extractKeyFromUrl,
  generateDocumentId,
  runVirusScan,
  uploadBufferToS3,
} from '../lib/storage/s3.js';
import {
  lenderIntegrationService,
  IntegrationConfigurationError,
  LenderIntegrationError,
  type RouteOneSubmission,
  type LenderDecision,
  type Stipulation,
} from './lender-integration.service.js';

interface UploadDescriptor {
  type: string;
  category: string;
  name?: string;
}

const READ_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER', 'SALES'];
const WRITE_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER'];
const ACTIVE_SUBMISSION_STATUSES = ['PENDING', 'CONDITIONAL', 'COUNTERED'];
const FINAL_APPROVAL_STATUSES = ['APPROVED', 'CONDITIONAL'];

function decimalToNumber(value: Prisma.Decimal | string | number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Prisma.Decimal) {
    return Number(value.toNumber());
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  }
  return Number.isFinite(value) ? Number(value) : null;
}

function toDecimal(value: number | null | undefined, scale: number | null = null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  if (scale !== null) {
    return new Prisma.Decimal(value.toFixed(scale));
  }
  return new Prisma.Decimal(value);
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function updateStipulations(stipulations: Stipulation[], stipulationId: string, note?: string) {
  return stipulations.map((stipulation) => {
    if (stipulation.id !== stipulationId) {
      return stipulation;
    }
    return {
      ...stipulation,
      status: 'SATISFIED',
      receivedAt: new Date().toISOString(),
      notes: note ?? stipulation.notes ?? null,
    } satisfies Stipulation;
  });
}

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message ?? '');
  }
  return null;
}

type AuthenticatedUser = NonNullable<Request['user']>;
type DealWithFinance = Prisma.DealJacketGetPayload<{
  include: {
    customer: true;
    vehicle: true;
    creditApplication: true;
  };
}>;

export class FiService {
  constructor(private readonly db = prisma) {}

  private ensureReadAccess(user: AuthenticatedUser) {
    if (user.isSuperAdmin) {
      return;
    }
    if (!READ_ROLES.includes(user.role)) {
      throw Forbidden('You do not have permission to view F&I deals');
    }
  }

  private ensureWriteAccess(user: AuthenticatedUser) {
    if (user.isSuperAdmin) {
      return;
    }
    if (!WRITE_ROLES.includes(user.role)) {
      throw Forbidden('You do not have permission to modify F&I deals');
    }
  }

  private async requireDealForTenant(dealId: string, tenantId: string) {
    const deal = await this.db.dealJacket.findFirst({
      where: { id: dealId, tenantId },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    return deal;
  }

  async getDeal(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);

    const deal = await this.db.dealJacket.findFirst({
      where: { id: dealId, tenantId },
      include: {
        customer: true,
        vehicle: true,
        salesperson: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        fiManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    return deal;
  }

  async listLenders(user: AuthenticatedUser, tenantId: string) {
    this.ensureReadAccess(user);

    const lenders = await this.db.lender.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ tierRange: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        tenantId: true,
        name: true,
        type: true,
        apiProvider: true,
        isActive: true,
        tierRange: true,
        maxTerm: true,
        maxLtv: true,
        minCreditScore: true,
        maxCreditScore: true,
        applicationFee: true,
      },
    });

    return lenders;
  }

  private buildSubmissionPayload(deal: DealWithFinance, desiredTerm?: number | null): RouteOneSubmission {
    const primaryApplicant = deal.creditApplication
      ? {
          firstName: deal.creditApplication.firstName,
          lastName: deal.creditApplication.lastName,
          middleName: deal.creditApplication.middleName ?? null,
          email: deal.creditApplication.email,
          phone: deal.creditApplication.phone,
          ssn: deal.creditApplication.ssn ?? undefined,
          dateOfBirth: deal.creditApplication.dateOfBirth?.toISOString() ?? null,
        }
      : {
          firstName: deal.customer.firstName,
          lastName: deal.customer.lastName,
          middleName: null,
          email: deal.customer.email ?? null,
          phone: deal.customer.phone ?? deal.customer.mobile ?? null,
          ssn: undefined,
          dateOfBirth: null,
        };

    const applicants: RouteOneSubmission['applicants'] = [primaryApplicant];

    if (deal.creditApplication?.coApplicant) {
      const coApplicant = deal.creditApplication.coApplicant as Record<string, unknown> | null;
      if (coApplicant) {
        const coFirst = coApplicant.firstName as string | undefined;
        const coLast = coApplicant.lastName as string | undefined;
        if (coFirst && coLast) {
          applicants.push({
            firstName: coFirst,
            lastName: coLast,
            middleName: (coApplicant.middleName as string | undefined) ?? null,
            email: (coApplicant.email as string | undefined) ?? null,
            phone: (coApplicant.phone as string | undefined) ?? null,
            ssn: (coApplicant.ssn as string | undefined) ?? undefined,
            dateOfBirth: (coApplicant.dateOfBirth as string | undefined) ?? null,
          });
        }
      }
    }

    const amountFinanced = decimalToNumber(deal.amountFinanced) ?? 0;
    const cashDown = decimalToNumber(deal.cashDown) ?? 0;
    const sellingPrice = decimalToNumber(deal.sellingPrice) ?? amountFinanced + cashDown;

    return {
      dealId: deal.id,
      applicationId: deal.creditApplication?.id ?? null,
      desiredTerm: desiredTerm ?? deal.term ?? null,
      amountFinanced,
      cashDown,
      sellingPrice,
      applicants,
      vehicle: deal.vehicle
        ? {
            vin: deal.vehicle.vin,
            year: deal.vehicle.year ?? null,
            make: deal.vehicle.make,
            model: deal.vehicle.model,
            mileage: deal.vehicle.mileage ?? null,
            stockNumber: deal.vehicle.stockNumber,
          }
        : null,
      dealerNotes: typeof deal.fiProducts === 'string' ? deal.fiProducts : null,
      reserveTarget: decimalToNumber(deal.totalFiGross),
    };
  }

  async submitLenderApplications(
    user: AuthenticatedUser,
    tenantId: string,
    payload: { dealId: string; lenderIds: string[]; desiredTerm?: number | null },
  ) {
    this.ensureWriteAccess(user);
    const uniqueLenderIds = Array.from(new Set(payload.lenderIds ?? [])).filter(Boolean);
    if (uniqueLenderIds.length === 0) {
      throw BadRequest('At least one lender must be selected');
    }

    const deal = await this.db.dealJacket.findFirst({
      where: { id: payload.dealId, tenantId },
      include: { customer: true, vehicle: true, creditApplication: true },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    const lenders = await this.db.lender.findMany({
      where: { tenantId, id: { in: uniqueLenderIds }, isActive: true },
    });

    if (lenders.length !== uniqueLenderIds.length) {
      throw BadRequest('One or more lenders are not available for this tenant');
    }

    const active = await this.db.lenderSubmission.findMany({
      where: {
        tenantId,
        dealId: payload.dealId,
        lenderId: { in: uniqueLenderIds },
        status: { in: ACTIVE_SUBMISSION_STATUSES },
        isSelected: false,
      },
      include: { lender: true },
    });

    if (active.length > 0) {
      const lenderNames = active.map((entry) => entry.lender?.name ?? 'selected lender');
      throw BadRequest(
        `An active submission already exists for ${lenderNames.join(', ')}. Please wait for a decision before resubmitting.`,
      );
    }

    const baseSubmission = this.buildSubmissionPayload(deal, payload.desiredTerm ?? deal.term ?? null);
    const results: Array<{
      lender: (typeof lenders)[number];
      request: RouteOneSubmission;
      decision: LenderDecision;
      errorDetails?: unknown;
    }> = [];

    for (const lender of lenders) {
      const request: RouteOneSubmission = {
        ...baseSubmission,
        applicants: baseSubmission.applicants.map((applicant) => ({ ...applicant })),
        vehicle: baseSubmission.vehicle ? { ...baseSubmission.vehicle } : null,
      };

      try {
        const decision = await lenderIntegrationService.submit(lender, request);
        results.push({ lender, request, decision });
      } catch (error) {
        const message =
          error instanceof IntegrationConfigurationError || error instanceof LenderIntegrationError
            ? error.message
            : 'Unexpected lender integration failure';
        const decision: LenderDecision = {
          status: 'DECLINED',
          declineReason: message,
          rawResponse: error instanceof LenderIntegrationError ? error.cause : undefined,
        };
        results.push({ lender, request, decision, errorDetails: error });
      }
    }

    const created = await this.db.$transaction(async (tx) => {
      const createdSubmissions = [] as Array<
        Prisma.LenderSubmissionGetPayload<{ include: { lender: true } }>
      >;

      for (const entry of results) {
        const declineMessage = entry.decision.declineReason ?? extractErrorMessage(entry.errorDetails);
        const submission = await tx.lenderSubmission.create({
          data: {
            tenantId,
            dealId: deal.id,
            lenderId: entry.lender.id,
            submittedBy: user.userId,
            requestPayload: entry.request,
            status: entry.decision.status,
            respondedAt: parseDate(entry.decision.respondedAt ?? null),
            responsePayload: entry.decision.rawResponse ?? entry.errorDetails ?? null,
            amountApproved: toDecimal(entry.decision.amountApproved ?? null, 2),
            apr: toDecimal(entry.decision.apr ?? null, 3),
            buyRate: toDecimal(entry.decision.buyRate ?? null, 3),
            dealerReserve: toDecimal(entry.decision.dealerReserve ?? null, 3),
            maxReserve: toDecimal(entry.decision.maxReserve ?? null, 3),
            term: entry.decision.term ?? baseSubmission.desiredTerm ?? deal.term ?? null,
            monthlyPayment: toDecimal(entry.decision.monthlyPayment ?? null, 2),
            declineReason: declineMessage,
            declineCode: entry.decision.declineCode ?? null,
            stipulations: entry.decision.stipulations?.length ? entry.decision.stipulations : null,
            expiresAt: parseDate(entry.decision.expiresAt ?? null),
          },
          include: { lender: true },
        });
        createdSubmissions.push(submission);
      }

      const nextStatus = FINAL_APPROVAL_STATUSES.includes(deal.status) ? deal.status : 'Submitted';
      await tx.dealJacket.update({
        where: { id: deal.id },
        data: {
          status: nextStatus,
          term: payload.desiredTerm ?? deal.term ?? null,
        },
      });

      return createdSubmissions;
    });

    return created;
  }

  async listLenderDecisions(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const submissions = await this.db.lenderSubmission.findMany({
      where: { tenantId, dealId },
      orderBy: [{ submittedAt: 'desc' }],
      include: { lender: true },
    });

    return submissions;
  }

  async selectLenderDecision(user: AuthenticatedUser, tenantId: string, submissionId: string) {
    this.ensureWriteAccess(user);

    const submission = await this.db.lenderSubmission.findFirst({
      where: { id: submissionId, tenantId },
      include: { deal: true, lender: true },
    });

    if (!submission) {
      throw NotFound('Lender submission not found');
    }

    const updated = await this.db.$transaction(async (tx) => {
      await tx.lenderSubmission.updateMany({
        where: { tenantId, dealId: submission.dealId },
        data: { isSelected: false, selectedAt: null },
      });

      const selected = await tx.lenderSubmission.update({
        where: { id: submission.id },
        data: {
          isSelected: true,
          selectedAt: new Date(),
          status: FINAL_APPROVAL_STATUSES.includes(submission.status) ? submission.status : 'APPROVED',
        },
        include: { lender: true },
      });

      await tx.dealJacket.update({
        where: { id: submission.dealId },
        data: {
          status: 'Approved',
          lenderId: submission.lenderId,
          apr: submission.apr,
          term: submission.term,
          monthlyPayment: submission.monthlyPayment,
        },
      });

      return selected;
    });

    return updated;
  }

  async recordCounterOffer(
    user: AuthenticatedUser,
    tenantId: string,
    payload: { submissionId: string; amount?: number | null; apr?: number | null; term?: number | null; message?: string | null },
  ) {
    this.ensureWriteAccess(user);

    const submission = await this.db.lenderSubmission.findFirst({
      where: { id: payload.submissionId, tenantId },
    });

    if (!submission) {
      throw NotFound('Lender submission not found');
    }

    const existingPayload = (submission.responsePayload as Record<string, unknown> | null) ?? {};
    const counterOffers = Array.isArray(existingPayload.counterOffers)
      ? (existingPayload.counterOffers as Array<Record<string, unknown>>)
      : [];

    counterOffers.push({
      amount: payload.amount ?? null,
      apr: payload.apr ?? null,
      term: payload.term ?? null,
      message: payload.message ?? null,
      submittedBy: user.userId,
      submittedAt: new Date().toISOString(),
    });

    const updateData: Prisma.LenderSubmissionUpdateInput = {
      status: 'COUNTERED',
      responsePayload: {
        ...existingPayload,
        counterOffers,
      },
      respondedAt: new Date(),
    };

    if (payload.amount !== undefined && payload.amount !== null) {
      updateData.amountApproved = toDecimal(payload.amount, 2);
    }
    if (payload.apr !== undefined && payload.apr !== null) {
      updateData.apr = toDecimal(payload.apr, 3);
    }
    if (payload.term !== undefined && payload.term !== null) {
      updateData.term = payload.term;
    }

    const updated = await this.db.lenderSubmission.update({
      where: { id: submission.id },
      data: updateData,
      include: { lender: true },
    });

    return updated;
  }

  async satisfyStipulation(
    user: AuthenticatedUser,
    tenantId: string,
    payload: { submissionId: string; stipulationId: string; note?: string | null },
  ) {
    this.ensureWriteAccess(user);

    const submission = await this.db.lenderSubmission.findFirst({
      where: { id: payload.submissionId, tenantId },
    });

    if (!submission) {
      throw NotFound('Lender submission not found');
    }

    const stipulations = (submission.stipulations as Stipulation[] | null) ?? [];
    if (!stipulations.length) {
      throw BadRequest('This submission does not have any outstanding stipulations');
    }

    if (!stipulations.some((entry) => entry.id === payload.stipulationId)) {
      throw NotFound('Stipulation not found for this submission');
    }

    const updatedStipulations = updateStipulations(stipulations, payload.stipulationId, payload.note ?? undefined);

    const updated = await this.db.lenderSubmission.update({
      where: { id: submission.id },
      data: { stipulations: updatedStipulations },
      include: { lender: true },
    });

    return updated;
  }

  async updateDeal(
    user: AuthenticatedUser,
    tenantId: string,
    dealId: string,
    payload: Record<string, unknown>,
  ) {
    this.ensureWriteAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const data: Prisma.DealJacketUpdateInput = {};

    if (payload.status && typeof payload.status === 'string') {
      data.status = payload.status;
    }

    if (payload.fiProducts) {
      if (typeof payload.fiProducts === 'string') {
        try {
          data.fiProducts = JSON.parse(payload.fiProducts);
        } catch (error) {
          throw BadRequest('fiProducts must be valid JSON');
        }
      } else {
        data.fiProducts = payload.fiProducts as Prisma.JsonValue;
      }
    }

    if ('fiManagerId' in payload) {
      const fiManagerId = payload.fiManagerId as string | null | undefined;
      data.fiManagerId = fiManagerId ?? null;
    }

    if (payload.lenderId !== undefined) {
      data.lenderId = payload.lenderId === null ? null : String(payload.lenderId);
    }

    if (payload.term !== undefined) {
      data.term = payload.term === null ? null : Number(payload.term);
    }

    const decimalFields: (keyof Prisma.DealJacketUpdateInput)[] = [
      'sellingPrice',
      'tradeValue',
      'tradePayoff',
      'netTrade',
      'cashDown',
      'amountFinanced',
      'apr',
      'monthlyPayment',
      'totalFiGross',
    ];

    for (const field of decimalFields) {
      if (payload[field as keyof typeof payload] !== undefined) {
        const value = payload[field as keyof typeof payload];
        if (value === null) {
          data[field] = null;
        } else if (value !== undefined) {
          const numericValue = typeof value === 'number' ? value : Number(value);
          if (Number.isNaN(numericValue)) {
            throw BadRequest(`Invalid numeric value for ${String(field)}`);
          }
          data[field] = new Prisma.Decimal(numericValue.toFixed(2));
        }
      }
    }

    const dateFields: Array<keyof Prisma.DealJacketUpdateInput> = [
      'contractDate',
      'fundedDate',
      'deliveredDate',
    ];

    for (const field of dateFields) {
      if (payload[field as keyof typeof payload] !== undefined) {
        const value = payload[field as keyof typeof payload];
        if (value === null || value === '') {
          data[field] = null;
        } else {
          const date = new Date(String(value));
          if (Number.isNaN(date.getTime())) {
            throw BadRequest(`Invalid date for ${String(field)}`);
          }
          data[field] = date;
        }
      }
    }

    const updated = await this.db.dealJacket.update({
      where: { id: dealId },
      data,
      include: {
        customer: true,
        vehicle: true,
        salesperson: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        fiManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return updated;
  }

  async listDocuments(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const documents = await this.db.dealDocument.findMany({
      where: { dealId },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents;
  }

  async uploadDocument(
    user: AuthenticatedUser,
    tenantId: string,
    dealId: string,
    file: Express.Multer.File,
    descriptor: UploadDescriptor,
  ) {
    this.ensureWriteAccess(user);
    const deal = await this.requireDealForTenant(dealId, tenantId);

    if (!file) {
      throw BadRequest('A document upload is required');
    }

    const scanResult = await runVirusScan(file.buffer);
    if (!scanResult.clean) {
      throw BadRequest('Uploaded file failed virus scan', { signature: scanResult.signature });
    }

    const documentId = generateDocumentId();
    const key = buildDealDocumentKey({
      tenantId,
      dealId,
      documentId,
      originalName: file.originalname,
    });

    let uploadResult: { key: string; url: string };
    try {
      uploadResult = await uploadBufferToS3({
        key,
        body: file.buffer,
        contentType: file.mimetype,
        metadata: {
          dealId,
          documentId,
          tenantId,
          uploadedBy: user.userId,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload failure';
      throw BadRequest(`Unable to upload document: ${message}`);
    }

    const name = descriptor.name?.trim() || file.originalname;

    const document = await this.db.dealDocument.create({
      data: {
        id: documentId,
        dealId: deal.id,
        type: descriptor.type,
        category: descriptor.category,
        name,
        fileName: file.originalname,
        fileUrl: uploadResult.url,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedBy: user.userId,
      },
    });

    return document;
  }

  async deleteDocument(user: AuthenticatedUser, tenantId: string, dealId: string, documentId: string) {
    this.ensureWriteAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const document = await this.db.dealDocument.findFirst({
      where: { id: documentId, dealId },
    });

    if (!document) {
      throw NotFound('Document not found');
    }

    const key = extractKeyFromUrl(document.fileUrl);
    if (key) {
      try {
        await deleteFromS3(key);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown storage error';
        throw BadRequest(`Unable to delete file from storage: ${message}`);
      }
    }

    await this.db.dealDocument.delete({ where: { id: documentId } });
  }
}

export const fiService = new FiService();

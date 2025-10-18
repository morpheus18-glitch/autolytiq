import { Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import prisma from '../lib/prisma.js';
import { BadRequest, Forbidden, NotFound } from '../lib/errors.js';
import {
  buildDealDocumentKey,
  generateDocumentId,
  uploadBufferToS3,
} from '../lib/storage/s3.js';
import {
  lenderIntegrationService,
  type FundingSubmissionResult,
  type Stipulation,
} from './lender-integration.service.js';
import { REQUIRED_CONTRACT_TYPES, getContractDisplayName } from './contracts.types.js';
import type { AppRole } from '../types/express.js';
import { generateDealJournalEntry } from '../services/accounting.service.js';

const FUNDING_DOCUMENT_TYPE = 'funding-packet';
const FUNDING_DOCUMENT_CATEGORY = 'Funding';

const READ_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER', 'SALES'];
const WRITE_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER'];

export type FundingTimelineStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type FundingTimelineType =
  | 'CHECKS'
  | 'SUBMISSION'
  | 'REVIEW'
  | 'APPROVAL'
  | 'FUNDED'
  | 'NOTE'
  | 'WEBHOOK'
  | 'CANCELLATION';

export interface FundingTimelineEntry {
  id: string;
  type: FundingTimelineType;
  status: FundingTimelineStatus;
  label: string;
  timestamp: string;
  message?: string | null;
  expectedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface FundingPacketInfo {
  documentId: string;
  url: string;
  fileName: string;
  generatedAt: string;
}

export interface PreFundingChecklistStatus {
  ready: boolean;
  contractsComplete: boolean;
  complianceComplete: boolean;
  stipulationsComplete: boolean;
  fundingChecklistComplete: boolean;
  outstandingContracts: string[];
  outstandingStipulations: Array<{ id: string; description: string }>;
  messages: string[];
}

export interface FundingDealSummary {
  id: string;
  dealNumber: string;
  status: string;
  amountFinanced: number;
  cashDown: number;
  lenderId?: string | null;
  lenderName?: string | null;
  customerName: string;
  apr?: number | null;
  term?: number | null;
}

export interface FundingRequestDto {
  id: string;
  dealId: string;
  tenantId: string;
  lenderId: string;
  amountRequested: number;
  fundingMethod: string;
  bankAccountId?: string | null;
  status: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  fundedAt?: string | null;
  fundedAmount?: number | null;
  lenderRefNumber?: string | null;
  timeline: FundingTimelineEntry[];
  journalEntryId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundingStatusResponse {
  deal: FundingDealSummary;
  request: FundingRequestDto | null;
  preFunding: PreFundingChecklistStatus;
  packet: FundingPacketInfo | null;
}

type AuthenticatedUser = NonNullable<Request['user']>;

type DealWithFundingContext = Prisma.DealJacketGetPayload<{
  include: {
    customer: { select: { firstName: true; lastName: true } };
    vehicle: { select: { vin: true; year: true; make: true; model: true } };
    lender: { select: { id: true; name: true; apiProvider: true; apiCredentials: true } };
    contracts: { select: { id: true; type: true; status: true; name: true } };
    complianceChecklist: true;
    fundingChecklist: true;
    lenderSubmissions: {
      where: { isSelected: true };
      orderBy: { submittedAt: 'desc' };
      take: 1;
    };
    documents: true;
    fundingRequest: true;
  };
}>;

interface FundingSubmissionPayload {
  dealId: string;
  fundingMethod: string;
  amountRequested: number;
  bankAccountId?: string | null;
  submissionType?: 'INTEGRATION' | 'MANUAL';
  externalReference?: string | null;
  notes?: string | null;
  previewOnly?: boolean;
}

interface FundingStatusUpdatePayload {
  dealId: string;
  status?: string;
  entryId?: string;
  eventType?: FundingTimelineType;
  eventStatus?: FundingTimelineStatus;
  note?: string | null;
  expectedAt?: string | null;
}

interface FundingMarkFundedPayload {
  dealId: string;
  fundedAmount: number;
  fundedAt?: string | null;
  lenderRefNumber?: string | null;
  notes?: string | null;
}

interface FundingCancelPayload {
  dealId: string;
  reason?: string | null;
}

function toDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(Number.isFinite(value) ? value : 0);
}

function decimalToNumber(value: Prisma.Decimal | number | string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Prisma.Decimal) {
    return Number(value.toNumber());
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  return Number.isFinite(value) ? Number(value) : null;
}

function formatName(first?: string | null, last?: string | null) {
  return [first, last].filter(Boolean).join(' ').trim();
}

function normalizeTimeline(value: Prisma.JsonValue | null | undefined): FundingTimelineEntry[] {
  if (!value || typeof value !== 'object' || !Array.isArray(value)) {
    return [];
  }
  return (value as Prisma.JsonValue[]).reduce<FundingTimelineEntry[]>((entries, entry) => {
    if (!entry || typeof entry !== 'object') {
      return entries;
    }
    const record = entry as Record<string, unknown>;
    const id = typeof record.id === 'string' ? record.id : randomUUID();
    const type = (record.type as FundingTimelineType | undefined) ?? 'NOTE';
    const status = (record.status as FundingTimelineStatus | undefined) ?? 'PENDING';
    const label = typeof record.label === 'string' ? record.label : 'Update';
    const timestamp = typeof record.timestamp === 'string' ? record.timestamp : new Date().toISOString();
    const message = typeof record.message === 'string' ? record.message : null;
    const expectedAt = typeof record.expectedAt === 'string' ? record.expectedAt : null;
    const metadata = typeof record.metadata === 'object' && record.metadata !== null ? (record.metadata as Record<string, unknown>) : null;
    entries.push({ id, type, status, label, timestamp, message, expectedAt, metadata });
    return entries;
  }, []);
}

function createTimelineEntry(options: {
  type: FundingTimelineType;
  status: FundingTimelineStatus;
  label: string;
  message?: string | null;
  expectedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}): FundingTimelineEntry {
  return {
    id: randomUUID(),
    type: options.type,
    status: options.status,
    label: options.label,
    message: options.message ?? null,
    expectedAt: options.expectedAt ?? null,
    metadata: options.metadata ?? null,
    timestamp: new Date().toISOString(),
  };
}

function parseDateInput(value?: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export class FundingService {
  constructor(private readonly db = prisma) {}

  private ensureReadAccess(user: AuthenticatedUser) {
    if (!user.roles.some((role) => READ_ROLES.includes(role as AppRole))) {
      throw Forbidden('You are not authorized to view funding details');
    }
  }

  private ensureWriteAccess(user: AuthenticatedUser) {
    if (!user.roles.some((role) => WRITE_ROLES.includes(role as AppRole))) {
      throw Forbidden('You are not authorized to update funding');
    }
  }

  private async loadDeal(tenantId: string, dealId: string): Promise<DealWithFundingContext> {
    const deal = await this.db.dealJacket.findFirst({
      where: { tenantId, id: dealId },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        vehicle: { select: { vin: true, year: true, make: true, model: true } },
        lender: { select: { id: true, name: true, apiProvider: true, apiCredentials: true } },
        contracts: { select: { id: true, type: true, status: true, name: true } },
        complianceChecklist: true,
        fundingChecklist: true,
        lenderSubmissions: {
          where: { isSelected: true },
          orderBy: { submittedAt: 'desc' },
          take: 1,
        },
        documents: {
          where: { type: FUNDING_DOCUMENT_TYPE },
          orderBy: { uploadedAt: 'desc' },
        },
        fundingRequest: true,
      },
    });

    if (!deal) {
      throw NotFound('Deal not found');
    }

    if (!deal.lender) {
      throw BadRequest('A lender must be selected before submitting for funding');
    }

    return deal;
  }

  private evaluatePreFunding(deal: DealWithFundingContext): PreFundingChecklistStatus {
    const outstandingContracts = new Set<string>();
    const contractStatusByType = new Map<string, string>();

    for (const contract of deal.contracts) {
      const typeKey = contract.type.trim().toUpperCase();
      contractStatusByType.set(typeKey, String(contract.status ?? '').toUpperCase());
    }

    for (const required of REQUIRED_CONTRACT_TYPES) {
      const status = contractStatusByType.get(required.toUpperCase());
      if (!status || (status !== 'COMPLETED' && status !== 'SIGNED' && status !== 'EXECUTED')) {
        outstandingContracts.add(getContractDisplayName(required));
      }
    }

    const selectedSubmission = deal.lenderSubmissions.at(0) ?? null;
    const rawStipulations = selectedSubmission?.stipulations;
    const stipulations: Stipulation[] = Array.isArray(rawStipulations)
      ? (rawStipulations as Stipulation[])
      : [];

    const outstandingStipulations = stipulations
      .filter((entry) => entry.status === 'REQUIRED')
      .map((entry) => ({ id: entry.id, description: entry.description }));

    const complianceComplete = Boolean(deal.complianceChecklist?.isComplete);
    const fundingChecklistComplete = Boolean(deal.fundingChecklist?.completed);
    const contractsComplete = outstandingContracts.size === 0;
    const stipulationsComplete = outstandingStipulations.length === 0;

    const messages: string[] = [];
    if (!contractsComplete) {
      messages.push('All required contracts must be completed and signed.');
    }
    if (!complianceComplete) {
      messages.push('Compliance checklist must be complete.');
    }
    if (!stipulationsComplete) {
      messages.push('All lender stipulations must be satisfied.');
    }
    if (!fundingChecklistComplete) {
      messages.push('Funding checklist must be marked complete.');
    }
    if (!selectedSubmission) {
      messages.push('Select an approved lender decision before funding.');
    }

    return {
      ready:
        contractsComplete && complianceComplete && stipulationsComplete && fundingChecklistComplete && !!selectedSubmission,
      contractsComplete,
      complianceComplete,
      stipulationsComplete,
      fundingChecklistComplete,
      outstandingContracts: Array.from(outstandingContracts),
      outstandingStipulations,
      messages,
    };
  }

  private buildDealSummary(deal: DealWithFundingContext): FundingDealSummary {
    return {
      id: deal.id,
      dealNumber: deal.dealNumber,
      status: deal.status,
      amountFinanced: decimalToNumber(deal.amountFinanced) ?? 0,
      cashDown: decimalToNumber(deal.cashDown) ?? 0,
      lenderId: deal.lender?.id ?? null,
      lenderName: deal.lender?.name ?? null,
      customerName: formatName(deal.customer?.firstName, deal.customer?.lastName),
      apr: decimalToNumber(deal.apr),
      term: deal.term ?? null,
    };
  }

  private toFundingRequestDto(request: Prisma.FundingRequestGetPayload<{}>): FundingRequestDto {
    return {
      id: request.id,
      dealId: request.dealId,
      tenantId: request.tenantId,
      lenderId: request.lenderId,
      amountRequested: decimalToNumber(request.amountRequested) ?? 0,
      fundingMethod: request.fundingMethod,
      bankAccountId: request.bankAccountId ?? null,
      status: request.status,
      submittedAt: request.submittedAt?.toISOString() ?? null,
      reviewedAt: request.reviewedAt?.toISOString() ?? null,
      approvedAt: request.approvedAt?.toISOString() ?? null,
      fundedAt: request.fundedAt?.toISOString() ?? null,
      fundedAmount: decimalToNumber(request.fundedAmount) ?? null,
      lenderRefNumber: request.lenderRefNumber ?? null,
      timeline: normalizeTimeline(request.timeline as Prisma.JsonValue),
      journalEntryId: request.journalEntryId ?? null,
      createdBy: request.createdBy,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    };
  }

  private async generateFundingPacket(deal: DealWithFundingContext, tenantId: string, userId: string) {
    const doc = new PDFDocument({ margin: 48, size: 'LETTER' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));

    const header = `Funding Packet - Deal ${deal.dealNumber}`;
    doc.font('Helvetica-Bold').fontSize(18).text(header, { align: 'center' });
    doc.moveDown();
    doc
      .font('Helvetica')
      .fontSize(11)
      .text(`Generated: ${new Date().toLocaleString('en-US')}`)
      .text(`Customer: ${formatName(deal.customer?.firstName, deal.customer?.lastName)}`)
      .text(`Lender: ${deal.lender?.name ?? '—'}`)
      .moveDown();

    doc.font('Helvetica-Bold').fontSize(13).text('Deal Summary');
    doc.moveDown(0.25);
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(`Amount Financed: $${(decimalToNumber(deal.amountFinanced) ?? 0).toFixed(2)}`)
      .text(`Cash Down: $${(decimalToNumber(deal.cashDown) ?? 0).toFixed(2)}`)
      .text(`APR: ${decimalToNumber(deal.apr)?.toFixed(3) ?? '—'}%`)
      .text(`Term: ${deal.term ?? '—'} months`)
      .text(`Vehicle: ${[deal.vehicle?.year, deal.vehicle?.make, deal.vehicle?.model].filter(Boolean).join(' ') || '—'}`)
      .text(`VIN: ${deal.vehicle?.vin ?? '—'}`)
      .moveDown();

    doc.font('Helvetica-Bold').fontSize(13).text('Contract Completion');
    doc.moveDown(0.25);
    const contractRows = REQUIRED_CONTRACT_TYPES.map((type) => {
      const contract = deal.contracts.find((entry) => entry.type.trim().toUpperCase() === type.toUpperCase());
      return {
        label: getContractDisplayName(type),
        status: String(contract?.status ?? 'Pending'),
      };
    });
    for (const row of contractRows) {
      doc.font('Helvetica').fontSize(10).text(`${row.label}: ${row.status}`);
    }
    doc.moveDown();

    doc.font('Helvetica-Bold').fontSize(13).text('Compliance & Funding Checklist');
    doc.moveDown(0.25);
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(`Compliance Complete: ${deal.complianceChecklist?.isComplete ? 'Yes' : 'No'}`)
      .text(`Funding Checklist Complete: ${deal.fundingChecklist?.completed ? 'Yes' : 'No'}`)
      .moveDown();

    const selectedSubmission = deal.lenderSubmissions.at(0) ?? null;
    const rawStipulations = selectedSubmission?.stipulations;
    const stipulations: Stipulation[] = Array.isArray(rawStipulations)
      ? (rawStipulations as Stipulation[])
      : [];

    doc.font('Helvetica-Bold').fontSize(13).text('Lender Stipulations');
    doc.moveDown(0.25);
    if (!stipulations.length) {
      doc.font('Helvetica').fontSize(10).text('No outstanding stipulations.');
    } else {
      for (const stipulation of stipulations) {
        doc
          .font('Helvetica')
          .fontSize(10)
          .text(`${stipulation.description} — ${stipulation.status}`);
      }
    }

    doc.end();

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (error) => reject(error));
    });

    const documentId = generateDocumentId();
    const key = buildDealDocumentKey({
      tenantId,
      dealId: deal.id,
      documentId,
      originalName: 'funding-packet.pdf',
    });

    const upload = await uploadBufferToS3({
      key,
      body: buffer,
      contentType: 'application/pdf',
      metadata: {
        dealId: deal.id,
        tenantId,
        generatedBy: userId,
        documentType: FUNDING_DOCUMENT_TYPE,
      },
    });

    const fileName = `funding-packet-${Date.now()}.pdf`;

    const existing = await this.db.dealDocument.findFirst({
      where: { dealId: deal.id, type: FUNDING_DOCUMENT_TYPE },
      orderBy: { uploadedAt: 'desc' },
    });

    if (existing) {
      await this.db.dealDocument.update({
        where: { id: existing.id },
        data: {
          fileUrl: upload.url,
          fileName,
          mimeType: 'application/pdf',
          fileSize: buffer.length,
          uploadedBy: userId,
          uploadedAt: new Date(),
        },
      });

      return {
        documentId: existing.id,
        url: upload.url,
        fileName,
        generatedAt: new Date().toISOString(),
      } satisfies FundingPacketInfo;
    }

    await this.db.dealDocument.create({
      data: {
        id: documentId,
        dealId: deal.id,
        type: FUNDING_DOCUMENT_TYPE,
        category: FUNDING_DOCUMENT_CATEGORY,
        name: 'Funding Packet',
        fileName,
        fileUrl: upload.url,
        mimeType: 'application/pdf',
        fileSize: buffer.length,
        uploadedBy: userId,
      },
    });

    return {
      documentId,
      url: upload.url,
      fileName,
      generatedAt: new Date().toISOString(),
    } satisfies FundingPacketInfo;
  }

  private mergeTimeline(existing: FundingTimelineEntry[], entry: FundingTimelineEntry) {
    return [...existing, entry].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  private async upsertFundingRequest(
    tenantId: string,
    userId: string,
    deal: DealWithFundingContext,
    payload: FundingSubmissionPayload,
    packet: FundingPacketInfo,
    submissionResult: FundingSubmissionResult | null,
  ) {
    const existing = await this.db.fundingRequest.findFirst({ where: { dealId: deal.id, tenantId } });
    const baseTimeline = existing ? normalizeTimeline(existing.timeline as Prisma.JsonValue) : [];

    let status = existing?.status ?? 'READY';
    let submittedAt = existing?.submittedAt ?? null;
    let timeline = baseTimeline;
    let lenderRef = existing?.lenderRefNumber ?? null;

    if (!payload.previewOnly) {
      status = 'SUBMITTED';
      submittedAt = new Date();
      lenderRef = submissionResult?.referenceNumber ?? payload.externalReference ?? lenderRef;

      const checklistEntry = createTimelineEntry({
        type: 'CHECKS',
        status: 'COMPLETED',
        label: 'Pre-funding checks validated',
        metadata: {
          contractsComplete: true,
          complianceComplete: true,
          fundingChecklistComplete: true,
          stipulationsComplete: true,
        },
      });

      const submissionEntry = createTimelineEntry({
        type: 'SUBMISSION',
        status: 'COMPLETED',
        label: 'Funding packet submitted to lender',
        message: payload.notes ?? null,
        expectedAt: submissionResult?.estimatedFundingDate ?? null,
        metadata: {
          fundingMethod: payload.fundingMethod,
          amount: payload.amountRequested,
          reference: lenderRef,
          status: submissionResult?.status ?? 'SUBMITTED',
        },
      });

      if (!baseTimeline.length) {
        timeline = [checklistEntry];
      } else {
        timeline = baseTimeline;
      }
      timeline = this.mergeTimeline(timeline, submissionEntry);
    } else if (!baseTimeline.length) {
      timeline = this.mergeTimeline(baseTimeline, createTimelineEntry({
        type: 'CHECKS',
        status: 'COMPLETED',
        label: 'Pre-funding checks validated',
      }));
    }

    const timelineJson = timeline as Prisma.JsonArray;

    const data = {
      lenderId: deal.lender!.id,
      amountRequested: toDecimal(payload.amountRequested),
      fundingMethod: payload.fundingMethod,
      bankAccountId: payload.bankAccountId ?? null,
      status,
      submittedAt,
      timeline: timelineJson,
      lenderRefNumber: lenderRef,
      updatedAt: new Date(),
    } satisfies Partial<Prisma.FundingRequestUncheckedUpdateInput> & Prisma.FundingRequestUncheckedCreateInput;

    if (existing) {
      await this.db.fundingRequest.update({
        where: { id: existing.id },
        data,
      });
      return this.db.fundingRequest.findFirstOrThrow({ where: { id: existing.id } });
    }

    return this.db.fundingRequest.create({
      data: {
        id: randomUUID(),
        dealId: deal.id,
        tenantId,
        createdBy: userId,
        timeline: timelineJson,
        ...data,
        createdAt: new Date(),
      },
    });
  }

  private async buildResponse(tenantId: string, dealId: string): Promise<FundingStatusResponse> {
    const deal = await this.loadDeal(tenantId, dealId);
    const preFunding = this.evaluatePreFunding(deal);
    const packet = deal.documents.at(0)
      ? {
          documentId: deal.documents[0].id,
          url: deal.documents[0].fileUrl,
          fileName: deal.documents[0].fileName,
          generatedAt: deal.documents[0].uploadedAt.toISOString(),
        }
      : null;

    return {
      deal: this.buildDealSummary(deal),
      request: deal.fundingRequest ? this.toFundingRequestDto(deal.fundingRequest) : null,
      preFunding,
      packet,
    };
  }

  async getStatus(user: AuthenticatedUser, tenantId: string, dealId: string): Promise<FundingStatusResponse> {
    this.ensureReadAccess(user);
    return this.buildResponse(tenantId, dealId);
  }

  async submitFundingRequest(
    user: AuthenticatedUser,
    tenantId: string,
    payload: FundingSubmissionPayload,
  ): Promise<FundingStatusResponse> {
    this.ensureWriteAccess(user);
    const deal = await this.loadDeal(tenantId, payload.dealId);
    const checklist = this.evaluatePreFunding(deal);

    if (!checklist.ready) {
      throw BadRequest('Deal is not ready for funding submission', { checklist });
    }

    const packet = await this.generateFundingPacket(deal, tenantId, user.userId);

    let submissionResult: FundingSubmissionResult | null = null;
    if (!payload.previewOnly && payload.submissionType !== 'MANUAL') {
      try {
        submissionResult = await lenderIntegrationService.submitFundingRequest(deal.lender!, {
          dealId: deal.id,
          amount: payload.amountRequested,
          method: payload.fundingMethod,
          packetUrl: packet.url,
          notes: payload.notes ?? null,
          bankAccountId: payload.bankAccountId ?? null,
        });
      } catch (error) {
        if (payload.submissionType === 'INTEGRATION') {
          throw error;
        }
      }
    }

    await this.upsertFundingRequest(tenantId, user.userId, deal, payload, packet, submissionResult);
    return this.buildResponse(tenantId, payload.dealId);
  }

  async updateStatus(
    user: AuthenticatedUser,
    tenantId: string,
    payload: FundingStatusUpdatePayload,
  ): Promise<FundingStatusResponse> {
    this.ensureWriteAccess(user);
    const request = await this.db.fundingRequest.findFirst({ where: { tenantId, dealId: payload.dealId } });
    if (!request) {
      throw BadRequest('Funding request not found for this deal');
    }

    const timeline = normalizeTimeline(request.timeline as Prisma.JsonValue);
    let updatedTimeline = timeline;

    if (payload.entryId && updatedTimeline.length) {
      updatedTimeline = updatedTimeline.map((entry) =>
        entry.id === payload.entryId
          ? {
              ...entry,
              type: payload.eventType ?? entry.type,
              status: payload.eventStatus ?? entry.status,
              message: payload.note ?? entry.message ?? null,
              expectedAt: payload.expectedAt ?? entry.expectedAt ?? null,
              timestamp: new Date().toISOString(),
            }
          : entry,
      );
    } else if (payload.eventType) {
      updatedTimeline = this.mergeTimeline(
        updatedTimeline,
        createTimelineEntry({
          type: payload.eventType,
          status: payload.eventStatus ?? 'COMPLETED',
          label: 'Funding status update',
          message: payload.note ?? null,
          expectedAt: payload.expectedAt ?? null,
        }),
      );
    }

    await this.db.fundingRequest.update({
      where: { id: request.id },
      data: {
        status: payload.status ?? request.status,
        timeline: updatedTimeline as Prisma.JsonArray,
        reviewedAt: payload.status?.toUpperCase() === 'IN_REVIEW' ? new Date() : request.reviewedAt,
        approvedAt: payload.status?.toUpperCase() === 'APPROVED' ? new Date() : request.approvedAt,
      },
    });

    return this.buildResponse(tenantId, payload.dealId);
  }

  async markFunded(
    user: AuthenticatedUser,
    tenantId: string,
    payload: FundingMarkFundedPayload,
  ): Promise<FundingStatusResponse> {
    this.ensureWriteAccess(user);
    const request = await this.db.fundingRequest.findFirst({ where: { tenantId, dealId: payload.dealId } });
    if (!request) {
      throw BadRequest('Funding request not found for this deal');
    }

    const fundedAt = parseDateInput(payload.fundedAt) ?? new Date();
    const fundedAmount = payload.fundedAmount;
    const timeline = this.mergeTimeline(normalizeTimeline(request.timeline as Prisma.JsonValue), createTimelineEntry({
      type: 'FUNDED',
      status: 'COMPLETED',
      label: 'Deal marked as funded',
      message: payload.notes ?? null,
      metadata: { fundedAmount },
    }));

    let journalEntryId = request.journalEntryId ?? null;
    try {
      const entry = await generateDealJournalEntry(tenantId, user.userId, payload.dealId);
      journalEntryId = entry.id;
    } catch (error) {
      throw BadRequest('Unable to create funding journal entry', {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    await this.db.fundingRequest.update({
      where: { id: request.id },
      data: {
        status: 'FUNDED',
        fundedAt,
        fundedAmount: toDecimal(fundedAmount),
        lenderRefNumber: payload.lenderRefNumber ?? request.lenderRefNumber,
        timeline: timeline as Prisma.JsonArray,
        journalEntryId,
      },
    });

    await this.db.dealJacket.update({
      where: { id: payload.dealId },
      data: {
        status: 'Funded',
        fundedDate: fundedAt,
      },
    });

    return this.buildResponse(tenantId, payload.dealId);
  }

  async cancel(
    user: AuthenticatedUser,
    tenantId: string,
    payload: FundingCancelPayload,
  ): Promise<FundingStatusResponse> {
    this.ensureWriteAccess(user);
    const request = await this.db.fundingRequest.findFirst({ where: { tenantId, dealId: payload.dealId } });
    if (!request) {
      throw BadRequest('Funding request not found for this deal');
    }

    const timeline = this.mergeTimeline(normalizeTimeline(request.timeline as Prisma.JsonValue), createTimelineEntry({
      type: 'CANCELLATION',
      status: 'CANCELLED',
      label: 'Funding request cancelled',
      message: payload.reason ?? null,
    }));

    await this.db.fundingRequest.update({
      where: { id: request.id },
      data: {
        status: 'CANCELLED',
        timeline: timeline as Prisma.JsonArray,
      },
    });

    return this.buildResponse(tenantId, payload.dealId);
  }
}

export const fundingService = new FundingService();

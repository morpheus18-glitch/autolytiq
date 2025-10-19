import { Prisma } from '@prisma/client';
import type {
  ApprovalPrediction as ApprovalPredictionRecord,
  CounterOffer as CounterOfferRecord,
  DealOptimization as DealOptimizationRecord,
  DealVersion as DealVersionRecord,
  DealWorksheet as DealWorksheetRecord,
  DealStatus as PrismaDealStatus,
} from '@prisma/client';
import { ApiError } from '../lib/errors.js';
import { EVENT_TOPICS, emitEvent } from '../events/index.js';
import { prisma, toInputJson } from '../lib/prisma.js';
import type {
  ApprovalPrediction,
  CounterAnalysisRequest,
  CounterAnalysisResponse,
  DealStructure,
  GrossCalculation,
  OptimizationRequest,
  OptimizationResponse,
  PaymentCalculation,
} from '../domain/desking/types.js';

type DecimalLike = Prisma.Decimal | number | string | null | undefined;

async function getDealContext(
  tx: Prisma.TransactionClient,
  tenantId: string,
  dealId: string,
): Promise<{ customerId: string; vehicleId: string; salespersonId: string | null }> {
  const deal = await tx.deal.findFirst({
    where: { tenantId, id: dealId },
    select: { customerId: true, vehicleId: true, salesPersonId: true },
  });

  if (!deal) {
    throw new ApiError('DEAL_NOT_FOUND', 'Deal could not be located for the provided worksheet.', { status: 404 });
  }

  return {
    customerId: deal.customerId,
    vehicleId: deal.vehicleId,
    salespersonId: deal.salesPersonId ?? null,
  };
}

function decimalToNumber(value: DecimalLike): number | null {
  if (value == null) {
    return null;
  }
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? (parsed as number) : null;
}

export interface WorksheetTotals {
  [key: string]: number;
}

export interface WorksheetPayload {
  worksheetId?: string;
  customerId: string;
  vehicleId: string;
  salespersonId?: string | null;
  status: PrismaDealStatus;
  structure: DealStructure;
  totals: WorksheetTotals;
  payment: PaymentCalculation;
  aiScore?: number | null;
  commitVersion?: {
    label?: string | null;
    grossBreakdown?: GrossCalculation | null;
    closeProbability?: number | null;
    approvalProbability?: number | null;
    aiScore?: number | null;
  } | null;
}

export interface WorksheetView {
  id: string;
  dealId: string;
  customerId: string;
  vehicleId: string;
  salespersonId: string | null;
  status: string;
  structure: DealStructure;
  totals: WorksheetTotals;
  payment: PaymentCalculation;
  aiScore: number | null;
  printablePdfUrl: string | null;
  currentVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VersionView {
  id: string;
  dealId: string;
  worksheetId: string;
  label: string | null;
  closeProbability: number | null;
  approvalProbability: number | null;
  aiScore: number | null;
  grossBreakdown: GrossCalculation | null;
  createdAt: string;
}

export interface OptimizationView {
  id: string;
  worksheetId: string | null;
  versionId: string | null;
  goals: Record<string, unknown>;
  constraints: Record<string, unknown>;
  recommendedStructure: DealStructure;
  alternatives: Record<string, unknown>[];
  insights: string[];
  warnings: string[];
  projectedGross: number | null;
  mlTraceId: string | null;
  createdAt: string;
}

export interface CounterOfferView {
  id: string;
  worksheetId: string | null;
  versionId: string;
  outcome: string;
  summary: string;
  options: CounterAnalysisResponse['options'];
  recommendation?: string | null;
  selectedOption?: Record<string, unknown> | null;
  createdAt: string;
}

export interface WorksheetPrintContext {
  worksheet: WorksheetView;
  customer: { id: string; firstName: string; lastName: string };
  vehicle: {
    id: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    trim?: string | null;
    stockNumber?: string | null;
  };
  salesperson?: { id: string; displayName: string | null } | null;
  versionLabel?: string | null;
}

export interface ApprovalPredictionView {
  id: string;
  lenderId: string;
  lenderName: string;
  approvalProbability: number;
  recommendedTier: string;
  estimatedRate: number | null;
  estimatedReserve: number | null;
  strengths: string[];
  weaknesses: string[];
  stipulations: ApprovalPrediction['stipulations'];
  recommendation: string;
  versionId: string | null;
  worksheetId: string | null;
  createdAt: string;
}

function mapWorksheet(record: DealWorksheetRecord & { versionPointer?: DealVersionRecord | null }): WorksheetView {
  const payment: PaymentCalculation = {
    amountFinanced: decimalToNumber(record.amountFinanced) ?? 0,
    apr: decimalToNumber(record.apr) ?? 0,
    termMonths: record.term ?? 0,
    monthlyPayment: decimalToNumber(record.payment) ?? 0,
    dueAtSigning: (record.totals as Record<string, unknown>)?.dueAtSigning as number | undefined,
  };

  return {
    id: record.id,
    dealId: record.dealId,
    customerId: record.customerId,
    vehicleId: record.vehicleId,
    salespersonId: record.salespersonId ?? null,
    status: record.status,
    structure: record.structure as unknown as DealStructure,
    totals: record.totals as unknown as WorksheetTotals,
    payment,
    aiScore: decimalToNumber(record.aiScore),
    printablePdfUrl: record.printablePdfUrl ?? null,
    currentVersionId: record.versionPointerId ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapVersion(record: DealVersionRecord): VersionView {
  return {
    id: record.id,
    dealId: record.dealId,
    worksheetId: record.worksheetId,
    label: record.label,
    closeProbability: decimalToNumber(record.closeProbability),
    approvalProbability: decimalToNumber(record.approvalProbability),
    aiScore: decimalToNumber(record.aiScore),
    grossBreakdown: record.grossBreakdown as GrossCalculation | null,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapOptimization(record: DealOptimizationRecord): OptimizationView {
  return {
    id: record.id,
    worksheetId: record.worksheetId ?? null,
    versionId: record.versionId ?? null,
    goals: record.goals as Record<string, unknown>,
    constraints: record.constraints as Record<string, unknown>,
    recommendedStructure: record.recommendedStructure as unknown as DealStructure,
    alternatives: record.alternatives as unknown as Record<string, unknown>[],
    insights: record.insights,
    warnings: record.warnings,
    projectedGross: decimalToNumber(record.projectedGross),
    mlTraceId: record.mlTraceId ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapCounterOffer(record: CounterOfferRecord): CounterOfferView {
  const response = record.aiResponse as unknown as CounterAnalysisResponse;
  return {
    id: record.id,
    worksheetId: record.worksheetId ?? null,
    versionId: record.originalVersionId,
    outcome: record.outcome,
    summary: response.summary,
    options: response.options,
    recommendation: response.recommendation,
    selectedOption: record.selectedOption as Record<string, unknown> | null,
    createdAt: record.createdAt.toISOString(),
  };
}

function mapApproval(record: ApprovalPredictionRecord): ApprovalPredictionView {
  return {
    id: record.id,
    lenderId: record.lenderId,
    lenderName: record.lenderName,
    approvalProbability: decimalToNumber(record.approvalProbability) ?? 0,
    recommendedTier: record.recommendedTier,
    estimatedRate: decimalToNumber(record.estimatedRate),
    estimatedReserve: decimalToNumber(record.estimatedReserve),
    strengths: record.strengths,
    weaknesses: record.weaknesses,
    stipulations: record.stipulations as unknown as ApprovalPrediction['stipulations'],
    recommendation: record.recommendation,
    versionId: record.versionId ?? null,
    worksheetId: record.worksheetId ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function getWorksheet(tenantId: string, dealId: string): Promise<WorksheetView> {
  const worksheet = await prisma.dealWorksheet.findFirst({
    where: { tenantId, dealId },
    include: { versionPointer: true },
  });

  if (!worksheet) {
    throw new ApiError('WORKSHEET_NOT_FOUND', 'No worksheet exists for the requested deal.', { status: 404 });
  }

  return mapWorksheet(worksheet);
}

export async function getWorksheetPrintContext(
  tenantId: string,
  worksheetId: string,
): Promise<WorksheetPrintContext> {
  const record = await prisma.dealWorksheet.findFirst({
    where: { tenantId, id: worksheetId },
    include: { versionPointer: true, customer: true, vehicle: true, salesperson: true },
  });

  if (!record) {
    throw new ApiError('WORKSHEET_NOT_FOUND', 'Worksheet could not be located.', { status: 404 });
  }

  const worksheet = mapWorksheet(record);

  return {
    worksheet,
    customer: {
      id: record.customerId,
      firstName: record.customer.firstName,
      lastName: record.customer.lastName,
    },
    vehicle: {
      id: record.vehicleId,
      vin: record.vehicle.vin,
      year: record.vehicle.year,
      make: record.vehicle.make,
      model: record.vehicle.model,
      trim: record.vehicle.trim ?? null,
      stockNumber: record.vehicle.stockNumber ?? null,
    },
    salesperson: record.salesperson
      ? {
          id: record.salesperson.id,
          displayName:
            ([record.salesperson.firstName, record.salesperson.lastName].filter(Boolean).join(' ') ||
              record.salesperson.email) ??
            null,
        }
      : null,
    versionLabel: record.versionPointer?.label ?? null,
  };
}

export async function saveWorksheet(
  tenantId: string,
  dealId: string,
  userId: string,
  payload: WorksheetPayload,
): Promise<{ worksheet: WorksheetView; version?: VersionView | null }> {
  const postCommit: Array<() => Promise<void>> = [];

  const result = await prisma.$transaction(async (tx) => {
    const dealContext = await getDealContext(tx, tenantId, dealId);
    const existing = payload.worksheetId
      ? await tx.dealWorksheet.findFirst({ where: { id: payload.worksheetId, tenantId, dealId } })
      : null;

    if (payload.worksheetId && !existing) {
      throw new ApiError('WORKSHEET_NOT_FOUND', 'Worksheet could not be located for update.', { status: 404 });
    }

    const previousStatus = existing?.status ?? null;
    let worksheetRecord: DealWorksheetRecord;

    if (existing) {
      worksheetRecord = await tx.dealWorksheet.update({
        where: { id: existing.id },
        data: {
          customerId: payload.customerId,
          vehicleId: payload.vehicleId,
          salespersonId: payload.salespersonId ?? null,
          structure: toInputJson(payload.structure),
          totals: toInputJson(payload.totals),
          amountFinanced: new Prisma.Decimal(payload.payment.amountFinanced),
          term: payload.payment.termMonths,
          apr: new Prisma.Decimal(payload.payment.apr),
          payment: new Prisma.Decimal(payload.payment.monthlyPayment),
          status: payload.status,
          aiScore: payload.aiScore != null ? new Prisma.Decimal(payload.aiScore) : null,
        },
      });
    } else {
      worksheetRecord = await tx.dealWorksheet.create({
        data: {
          id: payload.worksheetId,
          tenantId,
          dealId,
          customerId: payload.customerId,
          vehicleId: payload.vehicleId,
          salespersonId: payload.salespersonId ?? null,
          structure: toInputJson(payload.structure),
          totals: toInputJson(payload.totals),
          amountFinanced: new Prisma.Decimal(payload.payment.amountFinanced),
          term: payload.payment.termMonths,
          apr: new Prisma.Decimal(payload.payment.apr),
          payment: new Prisma.Decimal(payload.payment.monthlyPayment),
          status: payload.status,
          aiScore: payload.aiScore != null ? new Prisma.Decimal(payload.aiScore) : null,
        },
      });

      postCommit.push(() =>
        emitEvent(EVENT_TOPICS.DEAL_WORKSHEET_CREATED, {
          tenantId,
          dealId,
          worksheetId: worksheetRecord.id,
          vehicleId: dealContext.vehicleId,
          customerId: dealContext.customerId,
          salespersonId: worksheetRecord.salespersonId ?? dealContext.salespersonId,
          status: worksheetRecord.status,
        }),
      );
    }

    let versionRecord: DealVersionRecord | null = null;

    if (payload.commitVersion) {
      const grossBreakdown = payload.commitVersion.grossBreakdown
        ? toInputJson(payload.commitVersion.grossBreakdown)
        : undefined;
      versionRecord = await tx.dealVersion.create({
        data: {
          tenantId,
          dealId,
          worksheetId: worksheetRecord.id,
          snapshot: toInputJson({
            structure: payload.structure,
            totals: payload.totals,
            payment: payload.payment,
          }),
          grossBreakdown: grossBreakdown ?? undefined,
          closeProbability:
            payload.commitVersion.closeProbability != null
              ? new Prisma.Decimal(payload.commitVersion.closeProbability)
              : undefined,
          approvalProbability:
            payload.commitVersion.approvalProbability != null
              ? new Prisma.Decimal(payload.commitVersion.approvalProbability)
              : undefined,
          aiScore:
            payload.commitVersion.aiScore != null ? new Prisma.Decimal(payload.commitVersion.aiScore) : undefined,
          label: payload.commitVersion.label ?? null,
          createdById: userId,
        },
      });

      worksheetRecord = await tx.dealWorksheet.update({
        where: { id: worksheetRecord.id },
        data: { versionPointerId: versionRecord.id },
      });

      postCommit.push(() =>
        emitEvent(EVENT_TOPICS.DEAL_VERSION_CREATED, {
          tenantId,
          dealId,
          worksheetId: worksheetRecord.id,
          versionId: versionRecord!.id,
          createdBy: userId,
          customerId: dealContext.customerId,
          vehicleId: dealContext.vehicleId,
          salespersonId: worksheetRecord.salespersonId ?? dealContext.salespersonId,
        }),
      );
    }

    if (previousStatus !== worksheetRecord.status) {
      postCommit.push(() =>
        emitEvent(EVENT_TOPICS.DEAL_STATUS_UPDATED, {
          tenantId,
          dealId,
          worksheetId: worksheetRecord.id,
          previousStatus: previousStatus,
          nextStatus: worksheetRecord.status,
        }),
      );

      if (worksheetRecord.status === 'LOST') {
        postCommit.push(() =>
          emitEvent(EVENT_TOPICS.DEAL_STATUS_LOST, {
            tenantId,
            dealId,
            worksheetId: worksheetRecord.id,
            vehicleId: dealContext.vehicleId,
            customerId: dealContext.customerId,
            salespersonId: worksheetRecord.salespersonId ?? dealContext.salespersonId,
            reason: undefined,
          }),
        );
      }

      if (worksheetRecord.status === 'CLOSED') {
        postCommit.push(() =>
          emitEvent(EVENT_TOPICS.DEAL_STATUS_CLOSED, {
            tenantId,
            dealId,
            worksheetId: worksheetRecord.id,
            vehicleId: dealContext.vehicleId,
            totals: payload.totals,
            salespersonId: worksheetRecord.salespersonId ?? dealContext.salespersonId,
            customerId: dealContext.customerId,
          }),
        );
      }
    }

    return { worksheet: mapWorksheet(worksheetRecord), version: versionRecord ? mapVersion(versionRecord) : null };
  });

  for (const trigger of postCommit) {
    await trigger();
  }

  return result;
}

export async function listVersions(tenantId: string, dealId: string): Promise<VersionView[]> {
  const versions = await prisma.dealVersion.findMany({
    where: { tenantId, dealId },
    orderBy: { createdAt: 'desc' },
  });
  return versions.map(mapVersion);
}

export async function selectVersion(
  tenantId: string,
  dealId: string,
  worksheetId: string,
  versionId: string,
  userId: string,
): Promise<WorksheetView> {
  const version = await prisma.dealVersion.findFirst({ where: { tenantId, dealId, id: versionId, worksheetId } });
  if (!version) {
    throw new ApiError('VERSION_NOT_FOUND', 'The requested version does not exist for this deal.', { status: 404 });
  }

  const worksheet = await prisma.dealWorksheet.update({
    where: { id: worksheetId },
    data: { versionPointerId: versionId },
    include: { versionPointer: true },
  });

  const dealContext = await prisma.deal.findFirst({
    where: { tenantId, id: dealId },
    select: { customerId: true, vehicleId: true, salesPersonId: true },
  });

  const snapshot = (version.snapshot as Record<string, unknown>) ?? {};
  const structure = (snapshot.structure as Record<string, unknown>) ?? {};
  const totals = (snapshot.totals as Record<string, unknown>) ?? {};
  const payment = (snapshot.payment as Record<string, unknown>) ?? {};

  if (dealContext) {
    await emitEvent(EVENT_TOPICS.DEAL_VERSION_SELECTED, {
      tenantId,
      dealId,
      worksheetId,
      versionId,
      selectedBy: userId,
      customerId: dealContext.customerId,
      vehicleId: dealContext.vehicleId,
      salespersonId: worksheet.salespersonId ?? dealContext.salesPersonId ?? null,
      structure,
      totals,
      payment,
    });
  }

  return mapWorksheet(worksheet);
}

export async function recordOptimization(
  tenantId: string,
  dealId: string,
  userId: string,
  request: OptimizationRequest,
  response: OptimizationResponse,
  traceId?: string,
): Promise<OptimizationView> {
  const optimization = await prisma.dealOptimization.create({
    data: {
      tenantId,
      dealId,
      worksheetId: response.worksheetId ?? request.worksheetId ?? null,
      versionId: response.versionId ?? request.versionId ?? null,
      goals: toInputJson(request.goals),
      constraints: toInputJson(request.constraints),
      recommendedStructure: toInputJson(response.recommendedStructure),
      alternatives: toInputJson(response.alternatives),
      insights: response.insights,
      warnings: response.warnings,
      projectedGross:
        response.projectedGross?.total != null ? new Prisma.Decimal(response.projectedGross.total) : undefined,
      runById: userId,
      mlTraceId: traceId ?? null,
    },
  });

  const dealContext = await prisma.deal.findFirst({
    where: { tenantId, id: dealId },
    select: { customerId: true, salesPersonId: true },
  });

  if (dealContext) {
    await emitEvent(EVENT_TOPICS.DEAL_OPTIMIZED, {
      tenantId,
      dealId,
      worksheetId: optimization.worksheetId,
      versionId: optimization.versionId,
      optimizationId: optimization.id,
      runBy: userId,
      customerId: dealContext.customerId,
      salespersonId: dealContext.salesPersonId ?? null,
    });
  }

  return mapOptimization(optimization);
}

export async function recordCounterOffer(
  tenantId: string,
  dealId: string,
  userId: string,
  request: CounterAnalysisRequest,
  response: CounterAnalysisResponse,
): Promise<CounterOfferView> {
  if (!request.versionId) {
    throw new ApiError('VERSION_REQUIRED', 'A base version is required to record a counter offer.', { status: 400 });
  }

  const counter = await prisma.counterOffer.create({
    data: {
      tenantId,
      dealId,
      worksheetId: request.worksheetId ?? null,
      originalVersionId: request.versionId,
      input: toInputJson(request.customerInput),
      aiResponse: toInputJson(response),
      selectedOption: response.recommendedOptionId
        ? toInputJson(response.options.find((option) => option.id === response.recommendedOptionId) ?? null)
        : undefined,
      outcome: response.outcome ?? 'PENDING',
      handledById: userId,
    },
  });

  if (counter.outcome === 'ACCEPTED') {
    const dealContext = await prisma.deal.findFirst({
      where: { tenantId, id: dealId },
      select: { customerId: true, salesPersonId: true },
    });

    if (dealContext) {
      await emitEvent(EVENT_TOPICS.DEAL_COUNTER_ACCEPTED, {
        tenantId,
        dealId,
        worksheetId: counter.worksheetId,
        counterId: counter.id,
        handledBy: userId,
        customerId: dealContext.customerId,
        salespersonId: dealContext.salesPersonId ?? null,
      });
    }
  }

  return mapCounterOffer(counter);
}

export async function recordApproval(
  tenantId: string,
  dealId: string,
  request: ApprovalPrediction,
): Promise<ApprovalPredictionView> {
  const existing = await prisma.approvalPrediction.findFirst({
    where: { tenantId, dealId, lenderId: request.lenderId },
  });

  let approval: ApprovalPredictionRecord;

  const data = {
    tenantId,
    dealId,
    worksheetId: request.worksheetId ?? null,
    versionId: request.versionId ?? null,
    lenderId: request.lenderId,
    lenderName: request.lenderName,
    approvalProbability: new Prisma.Decimal(request.approvalProbability),
    recommendedTier: request.recommendedTier,
    estimatedRate: request.estimatedRate != null ? new Prisma.Decimal(request.estimatedRate) : undefined,
    estimatedReserve: request.estimatedReserve != null ? new Prisma.Decimal(request.estimatedReserve) : undefined,
    strengths: request.strengths,
    weaknesses: request.weaknesses,
    stipulations: toInputJson(request.stipulations),
    recommendation: request.recommendation,
  } satisfies Prisma.ApprovalPredictionUncheckedCreateInput;

  if (existing) {
    approval = await prisma.approvalPrediction.update({
      where: { id: existing.id },
      data,
    });
  } else {
    approval = await prisma.approvalPrediction.create({ data });
  }

  return mapApproval(approval);
}

export async function listOptimizations(tenantId: string, dealId: string): Promise<OptimizationView[]> {
  const optimizations = await prisma.dealOptimization.findMany({
    where: { tenantId, dealId },
    orderBy: { createdAt: 'desc' },
  });
  return optimizations.map(mapOptimization);
}

export async function listCounterOffers(tenantId: string, dealId: string): Promise<CounterOfferView[]> {
  const counters = await prisma.counterOffer.findMany({
    where: { tenantId, dealId },
    orderBy: { createdAt: 'desc' },
  });
  return counters.map(mapCounterOffer);
}

export async function listApprovals(tenantId: string, dealId: string): Promise<ApprovalPredictionView[]> {
  const approvals = await prisma.approvalPrediction.findMany({
    where: { tenantId, dealId },
    orderBy: { createdAt: 'desc' },
  });
  return approvals.map(mapApproval);
}

export async function updateWorksheetPrintUrl(
  tenantId: string,
  worksheetId: string,
  url: string,
): Promise<WorksheetView> {
  const worksheet = await prisma.dealWorksheet.update({
    where: { id: worksheetId },
    data: { printablePdfUrl: url },
    include: { versionPointer: true },
  });

  if (worksheet.tenantId !== tenantId) {
    throw new ApiError('WORKSHEET_NOT_FOUND', 'Worksheet could not be located.', { status: 404 });
  }

  return mapWorksheet(worksheet);
}

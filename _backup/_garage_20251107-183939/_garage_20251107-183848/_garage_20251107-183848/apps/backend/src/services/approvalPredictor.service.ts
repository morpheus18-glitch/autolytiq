import { prisma } from '../lib/prisma';
import { mlService } from './ml.service';
import { amortization } from './paymentCalculator.service';
import { recordApproval } from './desking.service';
import type {
  ApprovalOptimizationCandidate,
  ApprovalPrediction,
  ApprovalPredictionRequest,
  CustomerProfile,
  DealStructure,
  PaymentCalculation,
  VehicleInfo,
} from '../domain/desking/types';

const roundToCents = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

interface StructureFinancials {
  amountFinanced: number;
  dueAtSigning: number;
  cashDown: number;
  tradeEquity: number;
  fees: number;
  taxes: number;
  backend: number;
}

function cloneStructure(structure: DealStructure): DealStructure {
  return JSON.parse(JSON.stringify(structure)) as DealStructure;
}

function deriveFinancials(structure: DealStructure): StructureFinancials {
  const fees = sum(structure.fees.map((fee) => fee.amount));
  const taxes = sum(structure.taxes.map((tax) => tax.amount));
  const backend = sum((structure.backendProducts ?? []).map((product) => product.price));

  const cashDownBreakdown = structure.cashDown
    ? [
        structure.cashDown.customerCash,
        structure.cashDown.manufacturerRebate,
        structure.cashDown.tradeEquity,
      ].filter((value): value is number => typeof value === 'number')
    : [];
  const cashDown = structure.cashDown?.total ?? sum(cashDownBreakdown);

  const tradeAllowance = structure.trade?.allowance ?? 0;
  const tradePayoff = structure.trade?.payoff ?? 0;
  const tradeEquity = structure.trade?.equity ?? roundToCents(tradeAllowance - tradePayoff);

  const dealerDiscounts = sum((structure.pricing.dealerDiscounts ?? []).map((line) => line.amount));
  const accessories = sum((structure.pricing.accessories ?? []).map((line) => line.amount));
  const basePrice = roundToCents(structure.pricing.salePrice - dealerDiscounts + accessories);

  const amountFinanced = roundToCents(basePrice - cashDown - tradeEquity + fees + taxes + backend);

  return {
    amountFinanced: Math.max(amountFinanced, 0),
    dueAtSigning: roundToCents(Math.max(cashDown + fees + taxes, 0)),
    cashDown,
    tradeEquity,
    fees,
    taxes,
    backend,
  };
}

function buildPayment(amountFinanced: number, apr: number, termMonths: number, dueAtSigning: number): PaymentCalculation {
  const schedule = amortization({ amountFinanced, apr, term: termMonths });
  return {
    amountFinanced: roundToCents(amountFinanced),
    apr,
    termMonths: schedule.termInMonths,
    monthlyPayment: roundToCents(schedule.monthlyPayment),
    dueAtSigning: roundToCents(dueAtSigning),
  };
}

function applyExtendTerm(
  structure: DealStructure,
  payment: PaymentCalculation,
  increment: number,
): { structure: DealStructure; payment: PaymentCalculation } {
  const metrics = deriveFinancials(structure);
  const targetTerm = Math.max(payment.termMonths + increment, payment.termMonths);
  const updatedPayment = buildPayment(metrics.amountFinanced, payment.apr, targetTerm, metrics.dueAtSigning);
  return { structure, payment: updatedPayment };
}

function applyMoreDown(
  structure: DealStructure,
  payment: PaymentCalculation,
  amount: number,
): { structure: DealStructure; payment: PaymentCalculation } {
  const updated = cloneStructure(structure);
  if (!updated.cashDown) {
    updated.cashDown = { total: 0 };
  }
  updated.cashDown.total = roundToCents((updated.cashDown.total ?? 0) + amount);
  if (updated.cashDown.customerCash != null) {
    updated.cashDown.customerCash = roundToCents(updated.cashDown.customerCash + amount);
  } else {
    updated.cashDown.customerCash = roundToCents(amount);
  }

  const metrics = deriveFinancials(updated);
  const updatedPayment = buildPayment(metrics.amountFinanced, payment.apr, payment.termMonths, metrics.dueAtSigning);
  return { structure: updated, payment: updatedPayment };
}

function applyRemoveProducts(
  structure: DealStructure,
  payment: PaymentCalculation,
): { structure: DealStructure; payment: PaymentCalculation } {
  const updated = cloneStructure(structure);
  updated.backendProducts = [];
  const metrics = deriveFinancials(updated);
  const updatedPayment = buildPayment(metrics.amountFinanced, payment.apr, payment.termMonths, metrics.dueAtSigning);
  return { structure: updated, payment: updatedPayment };
}

export async function predictApprovals(
  params: {
    tenantId: string;
    dealId: string;
    worksheetId?: string;
    versionId?: string;
    structure: DealStructure;
    customer: CustomerProfile;
    vehicle: VehicleInfo;
    payment: PaymentCalculation;
    requestId?: string;
    lenderIds?: string[];
  },
  options: { persist?: boolean } = {},
): Promise<{ approvals: ApprovalPrediction[]; traces: Record<string, string | undefined> }> {
  const { tenantId, dealId, worksheetId, versionId, structure, customer, vehicle, payment, requestId, lenderIds } = params;
  const lenders = await prisma.lender.findMany({
    where: {
      tenantId,
      isActive: true,
      ...(lenderIds && lenderIds.length > 0 ? { id: { in: lenderIds } } : {}),
    },
    select: { id: true, name: true, maxTerm: true },
  });

  const traceMap: Record<string, string | undefined> = {};
  const approvals: ApprovalPrediction[] = [];

  for (const lender of lenders) {
    const request: ApprovalPredictionRequest = {
      dealId,
      worksheetId,
      versionId,
      lenderId: lender.id,
      structure: cloneStructure(structure),
      customerProfile: customer,
      vehicle,
      payment,
    };

    const { result, traceId } = await mlService.predictApproval(request, { tenantId, requestId });
    approvals.push(result);
    traceMap[lender.id] = traceId;

    if (traceId) {
      console.info('ML predictApproval trace', { tenantId, dealId, lenderId: lender.id, traceId });
    }

    if (options.persist !== false) {
      await recordApproval(tenantId, dealId, result);
    }
  }

  return { approvals, traces: traceMap };
}

export async function optimizeForApproval(params: {
  tenantId: string;
  dealId: string;
  worksheetId?: string;
  versionId?: string;
  structure: DealStructure;
  customer: CustomerProfile;
  vehicle: VehicleInfo;
  payment: PaymentCalculation;
  requestId?: string;
}): Promise<ApprovalOptimizationCandidate | null> {
  const baseline = await predictApprovals(params, { persist: false });
  const baselineBest = baseline.approvals.reduce((max, approval) => Math.max(max, approval.approvalProbability), 0);

  const strategies: Array<{
    id: ApprovalOptimizationCandidate['strategy'];
    apply: () => { structure: DealStructure; payment: PaymentCalculation };
  }> = [
    {
      id: 'EXTEND_TERM',
      apply: () => applyExtendTerm(cloneStructure(params.structure), params.payment, 12),
    },
    {
      id: 'MORE_DOWN',
      apply: () => applyMoreDown(cloneStructure(params.structure), params.payment, 1000),
    },
    {
      id: 'REMOVE_PRODUCTS',
      apply: () => applyRemoveProducts(cloneStructure(params.structure), params.payment),
    },
  ];

  let best: ApprovalOptimizationCandidate | null = null;

  for (const strategy of strategies) {
    const candidate = strategy.apply();
    const prediction = await predictApprovals(
      {
        ...params,
        structure: candidate.structure,
        payment: candidate.payment,
      },
      { persist: false },
    );

    const candidateBest = prediction.approvals.reduce(
      (max, approval) => Math.max(max, approval.approvalProbability),
      0,
    );
    const improvement = candidateBest - baselineBest;

    if (improvement > 0 && (!best || improvement > best.improvement)) {
      best = {
        strategy: strategy.id,
        structure: candidate.structure,
        payment: candidate.payment,
        approvals: prediction.approvals,
        improvement,
      };
    }
  }

  return best;
}


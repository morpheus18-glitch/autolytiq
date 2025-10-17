import { CommissionStatus, PrismaClient } from '@prisma/client';
import { BadRequest } from '../lib/errors.js';

export interface CommissionTier {
  threshold: number;
  rate: number;
}

export interface PayrollCalculationOptions {
  tenantId: string;
  periodStart: Date;
  periodEnd: Date;
  commissionTiers?: CommissionTier[];
  deductionRates?: {
    federal: number;
    state: number;
    fica: number;
    other?: number;
  };
  employerTaxRate?: number;
  basePay?: Record<string, number>;
  adjustments?: Record<string, number>;
  additionalDeductions?: Record<string, number>;
}

export interface PayrollLineComputation {
  userId: string;
  userName: string;
  grossPay: number;
  commissionTotal: number;
  commissionBonus: number;
  basePay: number;
  adjustments: number;
  deductions: number;
  employerTaxes: number;
  netPay: number;
  withholding: number;
  commissionIds: string[];
}

export interface PayrollPreviewResult {
  periodStart: string;
  periodEnd: string;
  lines: PayrollLineComputation[];
  totals: {
    gross: number;
    net: number;
    employeeWithholding: number;
    employerTaxes: number;
  };
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function determineTierRate(total: number, tiers: CommissionTier[]): number {
  if (!tiers.length) {
    return 0;
  }
  const sorted = [...tiers].sort((a, b) => a.threshold - b.threshold);
  let rate = 0;
  for (const tier of sorted) {
    if (total >= tier.threshold) {
      rate = tier.rate;
    }
  }
  return rate;
}

export async function calculatePayrollPreview(
  prisma: PrismaClient,
  options: PayrollCalculationOptions,
): Promise<PayrollPreviewResult> {
  if (options.periodEnd < options.periodStart) {
    throw BadRequest('Payroll period end must be after start');
  }

  const commissionRecords = await prisma.commission.findMany({
    where: {
      tenantId: options.tenantId,
      status: { in: [CommissionStatus.APPROVED, CommissionStatus.PAID] },
      createdAt: {
        gte: options.periodStart,
        lte: options.periodEnd,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const grouped = new Map<string, PayrollLineComputation>();

  for (const record of commissionRecords) {
    const userId = record.userId;
    if (!grouped.has(userId)) {
      grouped.set(userId, {
        userId,
        userName: `${record.user.firstName} ${record.user.lastName}`.trim(),
        grossPay: 0,
        commissionTotal: 0,
        commissionBonus: 0,
        basePay: round(options.basePay?.[userId] ?? 0),
        adjustments: round(options.adjustments?.[userId] ?? 0),
        deductions: 0,
        employerTaxes: 0,
        netPay: 0,
        withholding: 0,
        commissionIds: [],
      });
    }
    const entry = grouped.get(userId)!;
    entry.commissionTotal = round(entry.commissionTotal + Number(record.amount));
    entry.commissionIds.push(record.id);
  }

  const tiers = options.commissionTiers ?? [
    { threshold: 0, rate: 0 },
    { threshold: 5000, rate: 0.02 },
    { threshold: 10000, rate: 0.03 },
  ];

  const deductionRates = {
    federal: 0.12,
    state: 0.05,
    fica: 0.0765,
    other: 0,
    ...options.deductionRates,
  };

  const employerTaxRate = options.employerTaxRate ?? 0.0765;

  for (const entry of grouped.values()) {
    const rate = determineTierRate(entry.commissionTotal, tiers);
    entry.commissionBonus = round(entry.commissionTotal * rate);
    entry.grossPay = round(entry.basePay + entry.commissionTotal + entry.commissionBonus + entry.adjustments);

    const withholdingBase = entry.grossPay;
    entry.withholding = round(
      withholdingBase * (deductionRates.federal + deductionRates.state + deductionRates.fica + (deductionRates.other ?? 0)),
    );

    const manualDeductions = round(options.additionalDeductions?.[entry.userId] ?? 0);
    entry.deductions = round(entry.withholding + manualDeductions);
    entry.employerTaxes = round(entry.grossPay * employerTaxRate);
    entry.netPay = round(entry.grossPay - entry.deductions);
  }

  const lines = Array.from(grouped.values()).sort((a, b) => a.userName.localeCompare(b.userName));

  const totals = lines.reduce(
    (acc, line) => {
      acc.gross += line.grossPay;
      acc.net += line.netPay;
      acc.employeeWithholding += line.deductions;
      acc.employerTaxes += line.employerTaxes;
      return acc;
    },
    { gross: 0, net: 0, employeeWithholding: 0, employerTaxes: 0 },
  );

  return {
    periodStart: options.periodStart.toISOString(),
    periodEnd: options.periodEnd.toISOString(),
    lines,
    totals: {
      gross: round(totals.gross),
      net: round(totals.net),
      employeeWithholding: round(totals.employeeWithholding),
      employerTaxes: round(totals.employerTaxes),
    },
  };
}

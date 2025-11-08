/**
 * Commission Service
 * Handles commission calculation, payment processing, and reporting
 */

import { db as prisma } from '@repo/db';
import {
  CommissionType,
  CommissionStatus,
  type Commission,
  type Deal,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// ==================== TYPES ====================

export interface CommissionPlan {
  id?: string;
  tenantId: string;
  name: string;
  description?: string;
  type: 'FLAT' | 'PERCENTAGE' | 'TIERED' | 'CUSTOM';
  rules: CommissionRule[];
}

export interface CommissionRule {
  type: CommissionType;
  calculation: 'FLAT' | 'PERCENTAGE' | 'TIERED';
  flatAmount?: number;
  percentage?: number;
  tiers?: Array<{
    minAmount: number;
    maxAmount?: number;
    rate: number; // Percentage or flat amount
  }>;
  minGrossProfit?: number; // Only pay commission if deal exceeds this
  maxCommission?: number; // Cap the commission amount
}

export interface CalculateCommissionInput {
  dealId: string;
  tenantId: string;
  userId: string;
  commissionPlanId?: string;
}

export interface CommissionCalculation {
  dealId: string;
  dealNumber: string;
  userId: string;
  userName: string;
  role: string;
  commissions: Array<{
    type: CommissionType;
    baseAmount: number; // What the commission is calculated on
    rate: number;
    amount: number;
    notes: string;
  }>;
  totalCommission: number;
}

export interface CommissionPayment {
  commissionIds: string[];
  tenantId: string;
  paymentDate: Date;
  paymentMethod: string;
  notes?: string;
}

export interface CommissionReport {
  startDate: Date;
  endDate: Date;
  byUser: Array<{
    userId: string;
    userName: string;
    role: string;
    dealCount: number;
    frontCommission: number;
    backCommission: number;
    bonuses: number;
    spiffs: number;
    totalCommission: number;
    avgPerDeal: number;
    status: {
      pending: number;
      approved: number;
      paid: number;
    };
  }>;
  totals: {
    totalDeals: number;
    totalCommissions: number;
    totalPaid: number;
    totalPending: number;
  };
}

// ==================== COMMISSION CALCULATION ====================

/**
 * Calculate commissions for a deal using default dealership rules
 */
export async function calculateDealCommissions(
  input: CalculateCommissionInput
): Promise<CommissionCalculation[]> {
  const { dealId, tenantId, userId } = input;

  // Get deal with all details
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      salesPerson: true,
      salesManager: true,
      financeManager: true,
      vehicle: true,
    },
  });

  if (!deal || deal.tenantId !== tenantId) {
    throw new Error('Deal not found');
  }

  const calculations: CommissionCalculation[] = [];

  // Extract profit amounts
  const frontGross = deal.frontGrossCents ? deal.frontGrossCents / 100 : 0;
  const backGross = deal.backGrossCents ? deal.backGrossCents / 100 : 0;
  const reserveGross = deal.reserveGrossCents ? deal.reserveGrossCents / 100 : 0;
  const totalGross = deal.totalGrossCents ? deal.totalGrossCents / 100 : 0;

  // SALESPERSON COMMISSIONS
  const salesPersonCalc: CommissionCalculation = {
    dealId: deal.id,
    dealNumber: deal.dealNumber,
    userId: deal.salesPersonId,
    userName: `${deal.salesPerson.firstName} ${deal.salesPerson.lastName}`,
    role: 'Salesperson',
    commissions: [],
    totalCommission: 0,
  };

  // Front-end commission (typically 20-30% of front gross)
  if (frontGross > 0) {
    const frontRate = 0.25; // 25%
    const frontCommission = frontGross * frontRate;
    salesPersonCalc.commissions.push({
      type: CommissionType.FRONT,
      baseAmount: frontGross,
      rate: frontRate * 100,
      amount: frontCommission,
      notes: `25% of front-end gross profit`,
    });
    salesPersonCalc.totalCommission += frontCommission;
  }

  // Back-end commission (typically 10-15% of back gross)
  if (backGross > 0) {
    const backRate = 0.10; // 10%
    const backCommission = backGross * backRate;
    salesPersonCalc.commissions.push({
      type: CommissionType.BACK,
      baseAmount: backGross,
      rate: backRate * 100,
      amount: backCommission,
      notes: `10% of F&I products gross profit`,
    });
    salesPersonCalc.totalCommission += backCommission;
  }

  // Bonus for high-profit deals (>$3000)
  if (totalGross >= 3000) {
    const bonus = 200;
    salesPersonCalc.commissions.push({
      type: CommissionType.BONUS,
      baseAmount: totalGross,
      rate: 0,
      amount: bonus,
      notes: `High-profit deal bonus (>$3000)`,
    });
    salesPersonCalc.totalCommission += bonus;
  }

  calculations.push(salesPersonCalc);

  // SALES MANAGER COMMISSIONS (if exists)
  if (deal.salesManagerId && deal.salesManager) {
    const managerCalc: CommissionCalculation = {
      dealId: deal.id,
      dealNumber: deal.dealNumber,
      userId: deal.salesManagerId,
      userName: `${deal.salesManager.firstName} ${deal.salesManager.lastName}`,
      role: 'Sales Manager',
      commissions: [],
      totalCommission: 0,
    };

    // Manager gets 5% of total gross
    if (totalGross > 0) {
      const managerRate = 0.05; // 5%
      const managerCommission = totalGross * managerRate;
      managerCalc.commissions.push({
        type: CommissionType.FRONT,
        baseAmount: totalGross,
        rate: managerRate * 100,
        amount: managerCommission,
        notes: `5% of total gross profit (manager override)`,
      });
      managerCalc.totalCommission += managerCommission;
    }

    calculations.push(managerCalc);
  }

  // F&I MANAGER COMMISSIONS (if exists)
  if (deal.financeManagerId && deal.financeManager) {
    const fiManagerCalc: CommissionCalculation = {
      dealId: deal.id,
      dealNumber: deal.dealNumber,
      userId: deal.financeManagerId,
      userName: `${deal.financeManager.firstName} ${deal.financeManager.lastName}`,
      role: 'F&I Manager',
      commissions: [],
      totalCommission: 0,
    };

    // F&I manager gets percentage of back-end + reserve
    const fiTotal = backGross + reserveGross;
    if (fiTotal > 0) {
      const fiRate = 0.20; // 20%
      const fiCommission = fiTotal * fiRate;
      fiManagerCalc.commissions.push({
        type: CommissionType.BACK,
        baseAmount: fiTotal,
        rate: fiRate * 100,
        amount: fiCommission,
        notes: `20% of F&I products and reserve`,
      });
      fiManagerCalc.totalCommission += fiCommission;
    }

    calculations.push(fiManagerCalc);
  }

  return calculations;
}

/**
 * Create commission records from calculations
 */
export async function createCommissionsFromCalculation(
  calculation: CommissionCalculation,
  tenantId: string
): Promise<Commission[]> {
  const commissions: Commission[] = [];

  for (const comm of calculation.commissions) {
    const created = await prisma.commission.create({
      data: {
        tenantId,
        dealId: calculation.dealId,
        userId: calculation.userId,
        commissionType: comm.type,
        amount: new Decimal(comm.amount),
        rate: new Decimal(comm.rate),
        status: CommissionStatus.PENDING,
        notes: comm.notes,
      },
    });
    commissions.push(created);
  }

  return commissions;
}

/**
 * Auto-calculate and create commissions for a deal
 */
export async function autoCalculateCommissions(
  dealId: string,
  tenantId: string,
  userId: string
): Promise<Commission[]> {
  // Check if commissions already exist for this deal
  const existing = await prisma.commission.findMany({
    where: { dealId, tenantId },
  });

  if (existing.length > 0) {
    throw new Error('Commissions already calculated for this deal');
  }

  // Calculate commissions
  const calculations = await calculateDealCommissions({ dealId, tenantId, userId });

  // Create commission records for each person
  const allCommissions: Commission[] = [];
  for (const calc of calculations) {
    const commissions = await createCommissionsFromCalculation(calc, tenantId);
    allCommissions.push(...commissions);
  }

  return allCommissions;
}

// ==================== COMMISSION MANAGEMENT ====================

/**
 * Approve commission(s)
 */
export async function approveCommissions(
  commissionIds: string[],
  tenantId: string,
  approverId: string
): Promise<Commission[]> {
  const updated = await prisma.$transaction(
    commissionIds.map(id =>
      prisma.commission.update({
        where: { id },
        data: { status: CommissionStatus.APPROVED },
      })
    )
  );

  return updated;
}

/**
 * Mark commission(s) as paid
 */
export async function markCommissionsPaid(
  payment: CommissionPayment
): Promise<Commission[]> {
  const { commissionIds, tenantId, paymentDate, paymentMethod, notes } = payment;

  // Verify all commissions belong to tenant and are approved
  const commissions = await prisma.commission.findMany({
    where: {
      id: { in: commissionIds },
      tenantId,
    },
  });

  if (commissions.length !== commissionIds.length) {
    throw new Error('Some commissions not found');
  }

  const notApproved = commissions.filter(c => c.status !== CommissionStatus.APPROVED);
  if (notApproved.length > 0) {
    throw new Error('Cannot pay unapproved commissions');
  }

  // Update all commissions to PAID
  const updated = await prisma.$transaction(
    commissionIds.map(id =>
      prisma.commission.update({
        where: { id },
        data: {
          status: CommissionStatus.PAID,
          paidDate: paymentDate,
          notes: notes ? `${notes} | Payment method: ${paymentMethod}` : `Payment method: ${paymentMethod}`,
        },
      })
    )
  );

  return updated;
}

/**
 * Process chargeback (deal unwound, reverse commission)
 */
export async function chargebackCommission(
  commissionId: string,
  tenantId: string,
  reason: string
): Promise<Commission> {
  const commission = await prisma.commission.findUnique({
    where: { id: commissionId },
  });

  if (!commission || commission.tenantId !== tenantId) {
    throw new Error('Commission not found');
  }

  if (commission.status === CommissionStatus.CHARGEBACK) {
    throw new Error('Commission already charged back');
  }

  const updated = await prisma.commission.update({
    where: { id: commissionId },
    data: {
      status: CommissionStatus.CHARGEBACK,
      notes: `CHARGEBACK: ${reason}`,
    },
  });

  return updated;
}

// ==================== COMMISSION REPORTING ====================

/**
 * Get commissions for a user in date range
 */
export async function getUserCommissions(
  userId: string,
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<Commission[]> {
  return prisma.commission.findMany({
    where: {
      userId,
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      deal: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Generate comprehensive commission report
 */
export async function generateCommissionReport(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<CommissionReport> {
  const commissions = await prisma.commission.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: true,
      deal: true,
    },
    orderBy: {
      userId: 'asc',
    },
  });

  // Group by user
  const userMap = new Map<string, any>();

  for (const commission of commissions) {
    const userId = commission.userId;

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId,
        userName: `${commission.user.firstName} ${commission.user.lastName}`,
        role: commission.user.role,
        dealCount: new Set<string>(),
        frontCommission: 0,
        backCommission: 0,
        bonuses: 0,
        spiffs: 0,
        totalCommission: 0,
        status: {
          pending: 0,
          approved: 0,
          paid: 0,
        },
      });
    }

    const userData = userMap.get(userId);
    const amount = parseFloat(commission.amount.toString());

    // Track unique deals
    userData.dealCount.add(commission.dealId);

    // Sum by type
    switch (commission.commissionType) {
      case CommissionType.FRONT:
        userData.frontCommission += amount;
        break;
      case CommissionType.BACK:
        userData.backCommission += amount;
        break;
      case CommissionType.BONUS:
        userData.bonuses += amount;
        break;
      case CommissionType.SPIFF:
        userData.spiffs += amount;
        break;
    }

    // Sum by status
    switch (commission.status) {
      case CommissionStatus.PENDING:
        userData.status.pending += amount;
        break;
      case CommissionStatus.APPROVED:
        userData.status.approved += amount;
        break;
      case CommissionStatus.PAID:
        userData.status.paid += amount;
        break;
    }

    userData.totalCommission += amount;
  }

  // Convert to array and calculate averages
  const byUser = Array.from(userMap.values()).map(user => ({
    ...user,
    dealCount: user.dealCount.size,
    avgPerDeal: user.dealCount.size > 0 ? user.totalCommission / user.dealCount.size : 0,
  }));

  // Calculate totals
  const totals = byUser.reduce(
    (acc, user) => ({
      totalDeals: acc.totalDeals + user.dealCount,
      totalCommissions: acc.totalCommissions + user.totalCommission,
      totalPaid: acc.totalPaid + user.status.paid,
      totalPending: acc.totalPending + user.status.pending,
    }),
    { totalDeals: 0, totalCommissions: 0, totalPaid: 0, totalPending: 0 }
  );

  return {
    startDate,
    endDate,
    byUser,
    totals,
  };
}

/**
 * Get pending commissions needing approval
 */
export async function getPendingCommissions(tenantId: string): Promise<Commission[]> {
  return prisma.commission.findMany({
    where: {
      tenantId,
      status: CommissionStatus.PENDING,
    },
    include: {
      user: true,
      deal: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get approved commissions ready for payment
 */
export async function getApprovedCommissions(tenantId: string): Promise<Commission[]> {
  return prisma.commission.findMany({
    where: {
      tenantId,
      status: CommissionStatus.APPROVED,
    },
    include: {
      user: true,
      deal: {
        include: {
          customer: true,
          vehicle: true,
        },
      },
    },
    orderBy: [
      { userId: 'asc' },
      { createdAt: 'desc' },
    ],
  });
}

/**
 * Calculate commission summary for dashboard
 */
export async function getCommissionSummary(tenantId: string) {
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const commissions = await prisma.commission.findMany({
    where: {
      tenantId,
      createdAt: { gte: thisMonth },
    },
  });

  const pending = commissions.filter(c => c.status === CommissionStatus.PENDING);
  const approved = commissions.filter(c => c.status === CommissionStatus.APPROVED);
  const paid = commissions.filter(c => c.status === CommissionStatus.PAID);

  return {
    thisMonth: {
      total: commissions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0),
      pending: pending.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0),
      approved: approved.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0),
      paid: paid.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0),
      counts: {
        total: commissions.length,
        pending: pending.length,
        approved: approved.length,
        paid: paid.length,
      },
    },
  };
}

/**
 * Financial Reporting Service
 * Generates comprehensive financial reports for management and analytics
 */

import { db as prisma } from '@repo/db';
import { RetailDealStatus, type Deal, type User } from '@prisma/client';

// ==================== TYPES ====================

export interface DailySalesSummary {
  date: Date;
  totalDeals: number;
  vehiclesSold: number;
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  avgGrossPerDeal: number;
  frontEndGross: number;
  backEndGross: number;
  reserveGross: number;
  avgSellingPrice: number;
  avgDealCost: number;
  dealsByType: {
    RETAIL: number;
    LEASE: number;
    CASH: number;
    FINANCE: number;
  };
  topSalespeople: Array<{
    id: string;
    name: string;
    dealCount: number;
    totalGross: number;
  }>;
}

export interface MonthlyPerformanceSummary {
  month: string; // YYYY-MM
  deals: {
    total: number;
    delivered: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    vehicleSales: number;
    fiProducts: number;
    service: number;
    total: number;
  };
  profit: {
    frontEnd: number;
    backEnd: number;
    service: number;
    total: number;
    margin: number;
  };
  inventory: {
    unitsInStock: number;
    avgDaysInStock: number;
    turnRate: number;
    totalValue: number;
  };
  compared ToLastMonth: {
    dealsChange: number; // Percentage
    revenueChange: number;
    profitChange: number;
  };
}

export interface SalespersonPerformance {
  userId: string;
  name: string;
  role: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  deals: {
    total: number;
    delivered: number;
    pendingDelivery: number;
    averagePerMonth: number;
  };
  revenue: {
    totalSales: number;
    avgPerDeal: number;
  };
  profit: {
    totalGross: number;
    avgPerDeal: number;
    frontEnd: number;
    backEnd: number;
    reserve: number;
  };
  commissions: {
    total: number;
    pending: number;
    approved: number;
    paid: number;
  };
  metrics: {
    closeRate: number; // Percentage
    avgDaysToClose: number;
    avgGrossPerUnit: number;
  };
  ranking: {
    byDealsCount: number;
    byTotalGross: number;
    byAvgGross: number;
  };
}

export interface CashFlowStatement {
  period: {
    startDate: Date;
    endDate: Date;
  };
  operatingActivities: {
    netIncome: number;
    adjustments: {
      depreciation: number;
      accountsReceivableChange: number;
      inventoryChange: number;
      accountsPayableChange: number;
    };
    netCashFromOperating: number;
  };
  investingActivities: {
    inventoryPurchases: number;
    fixedAssetPurchases: number;
    netCashFromInvesting: number;
  };
  financingActivities: {
    flooringDraws: number;
    flooringPayments: number;
    loanProceeds: number;
    loanPayments: number;
    netCashFromFinancing: number;
  };
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export interface DepartmentPerformance {
  period: {
    startDate: Date;
    endDate: Date;
  };
  sales: {
    newVehicles: {
      unitsSold: number;
      revenue: number;
      grossProfit: number;
      margin: number;
    };
    usedVehicles: {
      unitsSold: number;
      revenue: number;
      grossProfit: number;
      margin: number;
    };
    total: {
      unitsSold: number;
      revenue: number;
      grossProfit: number;
      margin: number;
    };
  };
  finance: {
    dealsFinanced: number;
    fiRevenue: number;
    reserveRevenue: number;
    totalGross: number;
    penetrationRate: number; // % of deals with F&I products
    avgPerDeal: number;
  };
  service: {
    roCount: number;
    revenue: number;
    grossProfit: number;
    margin: number;
    avgRO: number;
  };
  totals: {
    totalRevenue: number;
    totalGrossProfit: number;
    overallMargin: number;
  };
}

// ==================== DAILY REPORTS ====================

/**
 * Generate daily sales summary
 */
export async function generateDailySalesSummary(
  tenantId: string,
  date: Date = new Date()
): Promise<DailySalesSummary> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startOfDay, lte: endOfDay },
      status: { in: ['DELIVERED', 'FUNDED'] },
    },
    include: {
      salesPerson: true,
      vehicle: true,
    },
  });

  if (deals.length === 0) {
    return {
      date,
      totalDeals: 0,
      vehiclesSold: 0,
      totalRevenue: 0,
      totalCost: 0,
      totalGrossProfit: 0,
      avgGrossPerDeal: 0,
      frontEndGross: 0,
      backEndGross: 0,
      reserveGross: 0,
      avgSellingPrice: 0,
      avgDealCost: 0,
      dealsByType: { RETAIL: 0, LEASE: 0, CASH: 0, FINANCE: 0 },
      topSalespeople: [],
    };
  }

  const totalRevenue = deals.reduce((sum, d) => {
    const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
    return sum + price;
  }, 0);

  const totalCost = deals.reduce((sum, d) => {
    const cost = d.dealerCostCents ? d.dealerCostCents / 100 : 0;
    return sum + cost;
  }, 0);

  const frontEndGross = deals.reduce((sum, d) => {
    const gross = d.frontGrossCents ? d.frontGrossCents / 100 : 0;
    return sum + gross;
  }, 0);

  const backEndGross = deals.reduce((sum, d) => {
    const gross = d.backGrossCents ? d.backGrossCents / 100 : 0;
    return sum + gross;
  }, 0);

  const reserveGross = deals.reduce((sum, d) => {
    const gross = d.reserveGrossCents ? d.reserveGrossCents / 100 : 0;
    return sum + gross;
  }, 0);

  const totalGrossProfit = frontEndGross + backEndGross + reserveGross;

  // Count by deal type
  const dealsByType = {
    RETAIL: deals.filter(d => d.dealType === 'RETAIL').length,
    LEASE: deals.filter(d => d.dealType === 'LEASE').length,
    CASH: deals.filter(d => d.dealType === 'CASH').length,
    FINANCE: deals.filter(d => d.dealType === 'FINANCE').length,
  };

  // Top salespeople
  const salesPersonMap = new Map<string, { name: string; dealCount: number; totalGross: number }>();

  deals.forEach(deal => {
    const spId = deal.salesPersonId;
    const gross = deal.totalGrossCents ? deal.totalGrossCents / 100 : 0;

    if (!salesPersonMap.has(spId)) {
      salesPersonMap.set(spId, {
        name: `${deal.salesPerson.firstName} ${deal.salesPerson.lastName}`,
        dealCount: 0,
        totalGross: 0,
      });
    }

    const sp = salesPersonMap.get(spId)!;
    sp.dealCount += 1;
    sp.totalGross += gross;
  });

  const topSalespeople = Array.from(salesPersonMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalGross - a.totalGross)
    .slice(0, 5);

  return {
    date,
    totalDeals: deals.length,
    vehiclesSold: deals.length,
    totalRevenue,
    totalCost,
    totalGrossProfit,
    avgGrossPerDeal: totalGrossProfit / deals.length,
    frontEndGross,
    backEndGross,
    reserveGross,
    avgSellingPrice: totalRevenue / deals.length,
    avgDealCost: totalCost / deals.length,
    dealsByType,
    topSalespeople,
  };
}

// ==================== MONTHLY REPORTS ====================

/**
 * Generate monthly performance summary
 */
export async function generateMonthlyPerformanceSummary(
  tenantId: string,
  year: number,
  month: number
): Promise<MonthlyPerformanceSummary> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const prevMonthStart = new Date(year, month - 2, 1);
  const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59, 999);

  // Current month deals
  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startDate, lte: endDate },
    },
    include: {
      vehicle: true,
    },
  });

  const delivered = deals.filter(d => d.status === 'DELIVERED' || d.status === 'FUNDED');
  const pending = deals.filter(d => d.status === 'PENDING');
  const cancelled = deals.filter(d => d.status === 'CANCELLED');

  // Revenue
  const vehicleSales = delivered.reduce((sum, d) => {
    const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
    return sum + price;
  }, 0);

  const fiProducts = delivered.reduce((sum, d) => {
    const fi = d.totalFiCents ? d.totalFiCents / 100 : 0;
    return sum + fi;
  }, 0);

  // Service revenue
  const serviceOrders = await prisma.serviceOrder.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    },
  });

  const serviceRevenue = serviceOrders.reduce((sum, so) => sum + parseFloat(so.totalPrice.toString()), 0);

  // Profit
  const frontEnd = delivered.reduce((sum, d) => {
    const gross = d.frontGrossCents ? d.frontGrossCents / 100 : 0;
    return sum + gross;
  }, 0);

  const backEnd = delivered.reduce((sum, d) => {
    const gross = d.backGrossCents ? d.backGrossCents / 100 : 0;
    return sum + gross;
  }, 0);

  const totalProfit = frontEnd + backEnd + serviceRevenue;
  const totalRevenue = vehicleSales + fiProducts + serviceRevenue;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Inventory metrics
  const inventory = await prisma.vehicle.findMany({
    where: {
      tenantId,
      status: { in: ['AVAILABLE', 'PENDING', 'RECON'] },
    },
  });

  const avgDaysInStock = inventory.length > 0
    ? inventory.reduce((sum, v) => sum + v.daysInStock, 0) / inventory.length
    : 0;

  const totalInventoryValue = inventory.reduce((sum, v) => {
    const cost = v.costCents ? v.costCents / 100 : 0;
    return sum + cost;
  }, 0);

  const turnRate = avgDaysInStock > 0 ? 365 / avgDaysInStock : 0;

  // Previous month comparison
  const prevDeals = await prisma.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: prevMonthStart, lte: prevMonthEnd },
      status: { in: ['DELIVERED', 'FUNDED'] },
    },
  });

  const prevRevenue = prevDeals.reduce((sum, d) => {
    const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
    return sum + price;
  }, 0);

  const prevProfit = prevDeals.reduce((sum, d) => {
    const gross = d.totalGrossCents ? d.totalGrossCents / 100 : 0;
    return sum + gross;
  }, 0);

  const dealsChange = prevDeals.length > 0 ? ((delivered.length - prevDeals.length) / prevDeals.length) * 100 : 0;
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
  const profitChange = prevProfit > 0 ? ((totalProfit - prevProfit) / prevProfit) * 100 : 0;

  return {
    month: `${year}-${String(month).padStart(2, '0')}`,
    deals: {
      total: deals.length,
      delivered: delivered.length,
      pending: pending.length,
      cancelled: cancelled.length,
    },
    revenue: {
      vehicleSales,
      fiProducts,
      service: serviceRevenue,
      total: totalRevenue,
    },
    profit: {
      frontEnd,
      backEnd,
      service: serviceRevenue,
      total: totalProfit,
      margin: profitMargin,
    },
    inventory: {
      unitsInStock: inventory.length,
      avgDaysInStock,
      turnRate,
      totalValue: totalInventoryValue,
    },
    comparedToLastMonth: {
      dealsChange,
      revenueChange,
      profitChange,
    },
  };
}

// ==================== SALESPERSON PERFORMANCE ====================

/**
 * Generate salesperson performance report
 */
export async function generateSalespersonPerformance(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<SalespersonPerformance[]> {
  // Get all salespeople
  const salespeople = await prisma.user.findMany({
    where: {
      tenantId,
      role: { in: ['SALES', 'SALES_MANAGER'] },
    },
  });

  const performances: SalespersonPerformance[] = [];

  for (const salesperson of salespeople) {
    // Get deals
    const deals = await prisma.deal.findMany({
      where: {
        tenantId,
        salesPersonId: salesperson.id,
        dealDate: { gte: startDate, lte: endDate },
      },
      include: {
        customer: true,
      },
    });

    const delivered = deals.filter(d => d.status === 'DELIVERED' || d.status === 'FUNDED');
    const pending = deals.filter(d => d.status === 'PENDING');

    // Calculate revenue and profit
    const totalSales = delivered.reduce((sum, d) => {
      const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
      return sum + price;
    }, 0);

    const totalGross = delivered.reduce((sum, d) => {
      const gross = d.totalGrossCents ? d.totalGrossCents / 100 : 0;
      return sum + gross;
    }, 0);

    const frontEnd = delivered.reduce((sum, d) => {
      const gross = d.frontGrossCents ? d.frontGrossCents / 100 : 0;
      return sum + gross;
    }, 0);

    const backEnd = delivered.reduce((sum, d) => {
      const gross = d.backGrossCents ? d.backGrossCents / 100 : 0;
      return sum + gross;
    }, 0);

    const reserve = delivered.reduce((sum, d) => {
      const gross = d.reserveGrossCents ? d.reserveGrossCents / 100 : 0;
      return sum + gross;
    }, 0);

    // Get commissions
    const commissions = await prisma.commission.findMany({
      where: {
        userId: salesperson.id,
        tenantId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const commissionTotal = commissions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
    const commissionPending = commissions
      .filter(c => c.status === 'PENDING')
      .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
    const commissionApproved = commissions
      .filter(c => c.status === 'APPROVED')
      .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);
    const commissionPaid = commissions
      .filter(c => c.status === 'PAID')
      .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

    // Calculate metrics
    const totalLeads = await prisma.lead.count({
      where: {
        tenantId,
        assignedToId: salesperson.id,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const closeRate = totalLeads > 0 ? (delivered.length / totalLeads) * 100 : 0;

    const avgDaysToClose = delivered.length > 0
      ? delivered.reduce((sum, d) => {
          const created = new Date(d.createdAt);
          const dealDate = new Date(d.dealDate);
          const days = Math.floor((dealDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / delivered.length
      : 0;

    const avgGrossPerUnit = delivered.length > 0 ? totalGross / delivered.length : 0;

    performances.push({
      userId: salesperson.id,
      name: `${salesperson.firstName} ${salesperson.lastName}`,
      role: salesperson.role,
      period: { startDate, endDate },
      deals: {
        total: deals.length,
        delivered: delivered.length,
        pendingDelivery: pending.length,
        averagePerMonth: 0, // Will calculate after sorting
      },
      revenue: {
        totalSales,
        avgPerDeal: delivered.length > 0 ? totalSales / delivered.length : 0,
      },
      profit: {
        totalGross,
        avgPerDeal: delivered.length > 0 ? totalGross / delivered.length : 0,
        frontEnd,
        backEnd,
        reserve,
      },
      commissions: {
        total: commissionTotal,
        pending: commissionPending,
        approved: commissionApproved,
        paid: commissionPaid,
      },
      metrics: {
        closeRate,
        avgDaysToClose,
        avgGrossPerUnit,
      },
      ranking: {
        byDealsCount: 0,
        byTotalGross: 0,
        byAvgGross: 0,
      },
    });
  }

  // Calculate rankings
  const sortedByDeals = [...performances].sort((a, b) => b.deals.delivered - a.deals.delivered);
  const sortedByGross = [...performances].sort((a, b) => b.profit.totalGross - a.profit.totalGross);
  const sortedByAvgGross = [...performances].sort((a, b) => b.profit.avgPerDeal - a.profit.avgPerDeal);

  performances.forEach(perf => {
    perf.ranking.byDealsCount = sortedByDeals.findIndex(p => p.userId === perf.userId) + 1;
    perf.ranking.byTotalGross = sortedByGross.findIndex(p => p.userId === perf.userId) + 1;
    perf.ranking.byAvgGross = sortedByAvgGross.findIndex(p => p.userId === perf.userId) + 1;
  });

  return performances;
}

// ==================== DEPARTMENT PERFORMANCE ====================

/**
 * Generate department performance report
 */
export async function generateDepartmentPerformance(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<DepartmentPerformance> {
  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startDate, lte: endDate },
      status: { in: ['DELIVERED', 'FUNDED'] },
    },
    include: {
      vehicle: true,
    },
  });

  // Split new vs used
  const newDeals = deals.filter(d => d.vehicle.condition === 'NEW');
  const usedDeals = deals.filter(d => d.vehicle.condition === 'USED');

  const calcMetrics = (dealList: typeof deals) => {
    const units = dealList.length;
    const revenue = dealList.reduce((sum, d) => {
      const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
      return sum + price;
    }, 0);
    const gross = dealList.reduce((sum, d) => {
      const g = d.totalGrossCents ? d.totalGrossCents / 100 : 0;
      return sum + g;
    }, 0);
    const margin = revenue > 0 ? (gross / revenue) * 100 : 0;

    return { unitsSold: units, revenue, grossProfit: gross, margin };
  };

  const newMetrics = calcMetrics(newDeals);
  const usedMetrics = calcMetrics(usedDeals);
  const totalMetrics = calcMetrics(deals);

  // F&I metrics
  const dealsWithFI = deals.filter(d => (d.totalFiCents ?? 0) > 0).length;
  const fiRevenue = deals.reduce((sum, d) => {
    const fi = d.totalFiCents ? d.totalFiCents / 100 : 0;
    return sum + fi;
  }, 0);

  const reserveRevenue = deals.reduce((sum, d) => {
    const r = d.reserveGrossCents ? d.reserveGrossCents / 100 : 0;
    return sum + r;
  }, 0);

  const totalFIGross = deals.reduce((sum, d) => {
    const back = d.backGrossCents ? d.backGrossCents / 100 : 0;
    const reserve = d.reserveGrossCents ? d.reserveGrossCents / 100 : 0;
    return sum + back + reserve;
  }, 0);

  const penetrationRate = deals.length > 0 ? (dealsWithFI / deals.length) * 100 : 0;
  const avgFIPerDeal = deals.length > 0 ? totalFIGross / deals.length : 0;

  // Service metrics
  const serviceOrders = await prisma.serviceOrder.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    },
  });

  const serviceRevenue = serviceOrders.reduce((sum, so) => sum + parseFloat(so.totalPrice.toString()), 0);
  const serviceCost = serviceOrders.reduce((sum, so) => sum + parseFloat(so.laborCost.toString()) + parseFloat(so.partsCost.toString()), 0);
  const serviceGross = serviceRevenue - serviceCost;
  const serviceMargin = serviceRevenue > 0 ? (serviceGross / serviceRevenue) * 100 : 0;
  const avgRO = serviceOrders.length > 0 ? serviceRevenue / serviceOrders.length : 0;

  const totalRevenue = totalMetrics.revenue + fiRevenue + serviceRevenue;
  const totalGrossProfit = totalMetrics.grossProfit + totalFIGross + serviceGross;
  const overallMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  return {
    period: { startDate, endDate },
    sales: {
      newVehicles: newMetrics,
      usedVehicles: usedMetrics,
      total: totalMetrics,
    },
    finance: {
      dealsFinanced: dealsWithFI,
      fiRevenue,
      reserveRevenue,
      totalGross: totalFIGross,
      penetrationRate,
      avgPerDeal: avgFIPerDeal,
    },
    service: {
      roCount: serviceOrders.length,
      revenue: serviceRevenue,
      grossProfit: serviceGross,
      margin: serviceMargin,
      avgRO,
    },
    totals: {
      totalRevenue,
      totalGrossProfit,
      overallMargin,
    },
  };
}

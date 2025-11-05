/**
 * Accounting & Finance API Routes
 * Comprehensive accounting operations, commission management, and financial reporting
 */

import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
// Accounting operations
import {
  ensureStandardGLAccounts,
  createJournalEntry,
  postJournalEntry,
  postDealJournalEntry,
  generateProfitLoss,
  generateBalanceSheet,
  generateCashReconciliation,
  getDealProfitAnalysis,
} from '../services/accounting.service.js';

// Commission operations
import {
  calculateDealCommissions,
  autoCalculateCommissions,
  approveCommissions,
  markCommissionsPaid,
  chargebackCommission,
  getUserCommissions,
  generateCommissionReport,
  getPendingCommissions,
  getApprovedCommissions,
  getCommissionSummary,
} from '../services/commission.service.js';

// Financial reporting
import {
  generateDailySalesSummary,
  generateMonthlyPerformanceSummary,
  generateSalespersonPerformance,
  generateDepartmentPerformance,
} from '../services/financial-reporting.service.js';
import { JournalEntryType, LineType } from '@prisma/client';

export const accountingRouter = Router();

// ==================== GL ACCOUNTS ====================

/**
 * GET /api/accounting/gl-accounts/initialize
 * Initialize standard GL accounts for tenant
 */
accountingRouter.get(
  '/gl-accounts/initialize',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;

      const accounts = await ensureStandardGLAccounts(tenantId);

      res.json({
        data: Array.from(accounts.values()),
        meta: {
          count: accounts.size,
        },
      });
    } catch (error) {
      console.error('GL account initialization error:', error);
      next(error);
    }
  }) as RequestHandler
);

// ==================== JOURNAL ENTRIES ====================

const createJournalEntrySchema = z.object({
  entryType: z.nativeEnum(JournalEntryType),
  memo: z.string().min(1),
  postingDate: z.string().datetime().optional(),
  dealId: z.string().optional(),
  lines: z.array(
    z.object({
      glAccountId: z.string(),
      type: z.nativeEnum(LineType),
      amount: z.number().positive(),
      description: z.string().optional(),
    })
  ).min(2),
});

/**
 * POST /api/accounting/journal-entries
 * Create manual journal entry
 */
accountingRouter.post(
  '/journal-entries',
  (async (req, res, next) => {
    try {
      const validation = createJournalEntrySchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const userId = req.userId!;
      const data = validation.data;

      const entry = await createJournalEntry({
        tenantId,
        entryType: data.entryType,
        memo: data.memo,
        postingDate: data.postingDate ? new Date(data.postingDate) : new Date(),
        userId,
        dealId: data.dealId,
        lines: data.lines,
      });

      res.status(201).json({ data: entry });
    } catch (error: any) {
      console.error('Journal entry creation error:', error);
      if (error.message.includes('not balanced')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/accounting/journal-entries/:id/post
 * Post a journal entry (changes status to POSTED and updates GL balances)
 */
accountingRouter.post(
  '/journal-entries/:id/post',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const entry = await postJournalEntry(id, tenantId, userId);

      res.json({ data: entry });
    } catch (error: any) {
      console.error('Journal entry posting error:', error);
      if (error.message === 'Journal entry not found' || error.message.includes('already posted')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/accounting/deals/:dealId/post-journal-entry
 * Auto-post journal entry from deal
 */
accountingRouter.post(
  '/deals/:dealId/post-journal-entry',
  (async (req, res, next) => {
    try {
      const { dealId } = req.params;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const entry = await postDealJournalEntry({
        dealId,
        tenantId,
        userId,
        postingDate: req.body.postingDate ? new Date(req.body.postingDate) : undefined,
      });

      res.status(201).json({ data: entry });
    } catch (error: any) {
      console.error('Deal journal entry error:', error);
      if (error.message === 'Deal not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

// ==================== FINANCIAL STATEMENTS ====================

/**
 * GET /api/accounting/reports/profit-loss
 * Generate P&L statement
 */
accountingRouter.get(
  '/reports/profit-loss',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const statement = await generateProfitLoss(tenantId, startDate, endDate);

      res.json({ data: statement });
    } catch (error) {
      console.error('P&L generation error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/reports/balance-sheet
 * Generate balance sheet
 */
accountingRouter.get(
  '/reports/balance-sheet',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const asOfDate = req.query.asOfDate ? new Date(req.query.asOfDate as string) : new Date();

      const statement = await generateBalanceSheet(tenantId, asOfDate);

      res.json({ data: statement });
    } catch (error) {
      console.error('Balance sheet generation error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/reports/cash-reconciliation
 * Generate cash reconciliation
 */
accountingRouter.get(
  '/reports/cash-reconciliation',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();

      const reconciliation = await generateCashReconciliation(tenantId, date);

      res.json({ data: reconciliation });
    } catch (error) {
      console.error('Cash reconciliation error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/reports/deal-profit-analysis
 * Get deal-by-deal profit analysis
 */
accountingRouter.get(
  '/reports/deal-profit-analysis',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const analysis = await getDealProfitAnalysis(tenantId, startDate, endDate);

      res.json({
        data: analysis,
        meta: {
          total: analysis.length,
          totalGross: analysis.reduce((sum, d) => sum + d.totalGross, 0),
          avgGross: analysis.length > 0 ? analysis.reduce((sum, d) => sum + d.totalGross, 0) / analysis.length : 0,
        },
      });
    } catch (error) {
      console.error('Deal profit analysis error:', error);
      next(error);
    }
  }) as RequestHandler
);

// ==================== COMMISSIONS ====================

/**
 * POST /api/accounting/deals/:dealId/calculate-commissions
 * Calculate commissions for a deal
 */
accountingRouter.post(
  '/deals/:dealId/calculate-commissions',
  (async (req, res, next) => {
    try {
      const { dealId } = req.params;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const calculations = await calculateDealCommissions({ dealId, tenantId, userId });

      res.json({ data: calculations });
    } catch (error: any) {
      console.error('Commission calculation error:', error);
      if (error.message === 'Deal not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/accounting/deals/:dealId/auto-calculate-commissions
 * Auto-calculate and create commission records
 */
accountingRouter.post(
  '/deals/:dealId/auto-calculate-commissions',
  (async (req, res, next) => {
    try {
      const { dealId } = req.params;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      const commissions = await autoCalculateCommissions(dealId, tenantId, userId);

      res.status(201).json({
        data: commissions,
        meta: {
          count: commissions.length,
          totalAmount: commissions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0),
        },
      });
    } catch (error: any) {
      console.error('Auto commission calculation error:', error);
      if (error.message === 'Deal not found' || error.message.includes('already calculated')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/commissions/pending
 * Get pending commissions needing approval
 */
accountingRouter.get(
  '/commissions/pending',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;

      const commissions = await getPendingCommissions(tenantId);

      res.json({
        data: commissions,
        meta: {
          count: commissions.length,
          totalAmount: commissions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0),
        },
      });
    } catch (error) {
      console.error('Pending commissions error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/commissions/approved
 * Get approved commissions ready for payment
 */
accountingRouter.get(
  '/commissions/approved',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;

      const commissions = await getApprovedCommissions(tenantId);

      res.json({
        data: commissions,
        meta: {
          count: commissions.length,
          totalAmount: commissions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0),
        },
      });
    } catch (error) {
      console.error('Approved commissions error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/accounting/commissions/approve
 * Approve commission(s)
 */
accountingRouter.post(
  '/commissions/approve',
  (async (req, res, next) => {
    try {
      const { commissionIds } = req.body;
      const tenantId = req.tenantId!;
      const userId = req.userId!;

      if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
        return res.status(400).json({ error: 'commissionIds array required' });
      }

      const approved = await approveCommissions(commissionIds, tenantId, userId);

      res.json({ data: approved });
    } catch (error) {
      console.error('Commission approval error:', error);
      next(error);
    }
  }) as RequestHandler
);

const markPaidSchema = z.object({
  commissionIds: z.array(z.string()).min(1),
  paymentDate: z.string().datetime(),
  paymentMethod: z.string().min(1),
  notes: z.string().optional(),
});

/**
 * POST /api/accounting/commissions/mark-paid
 * Mark commission(s) as paid
 */
accountingRouter.post(
  '/commissions/mark-paid',
  (async (req, res, next) => {
    try {
      const validation = markPaidSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request',
          details: validation.error.errors,
        });
      }

      const tenantId = req.tenantId!;
      const data = validation.data;

      const paid = await markCommissionsPaid({
        ...data,
        tenantId,
        paymentDate: new Date(data.paymentDate),
      });

      res.json({ data: paid });
    } catch (error: any) {
      console.error('Mark paid error:', error);
      if (error.message.includes('not found') || error.message.includes('unapproved')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * POST /api/accounting/commissions/:id/chargeback
 * Process commission chargeback
 */
accountingRouter.post(
  '/commissions/:id/chargeback',
  (async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const tenantId = req.tenantId!;

      if (!reason) {
        return res.status(400).json({ error: 'Chargeback reason required' });
      }

      const commission = await chargebackCommission(id, tenantId, reason);

      res.json({ data: commission });
    } catch (error: any) {
      console.error('Chargeback error:', error);
      if (error.message.includes('not found') || error.message.includes('already charged back')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/commissions/summary
 * Get commission summary for dashboard
 */
accountingRouter.get(
  '/commissions/summary',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;

      const summary = await getCommissionSummary(tenantId);

      res.json({ data: summary });
    } catch (error) {
      console.error('Commission summary error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/users/:userId/commissions
 * Get commissions for a specific user
 */
accountingRouter.get(
  '/users/:userId/commissions',
  (async (req, res, next) => {
    try {
      const { userId } = req.params;
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const commissions = await getUserCommissions(userId, tenantId, startDate, endDate);

      res.json({
        data: commissions,
        meta: {
          count: commissions.length,
          totalAmount: commissions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0),
        },
      });
    } catch (error) {
      console.error('User commissions error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/reports/commission-report
 * Generate comprehensive commission report
 */
accountingRouter.get(
  '/reports/commission-report',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const report = await generateCommissionReport(tenantId, startDate, endDate);

      res.json({ data: report });
    } catch (error) {
      console.error('Commission report error:', error);
      next(error);
    }
  }) as RequestHandler
);

// ==================== FINANCIAL REPORTING ====================

/**
 * GET /api/accounting/reports/daily-sales
 * Generate daily sales summary
 */
accountingRouter.get(
  '/reports/daily-sales',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();

      const summary = await generateDailySalesSummary(tenantId, date);

      res.json({ data: summary });
    } catch (error) {
      console.error('Daily sales summary error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/reports/monthly-performance
 * Generate monthly performance summary
 */
accountingRouter.get(
  '/reports/monthly-performance',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;

      const summary = await generateMonthlyPerformanceSummary(tenantId, year, month);

      res.json({ data: summary });
    } catch (error) {
      console.error('Monthly performance error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/reports/salesperson-performance
 * Generate salesperson performance report
 */
accountingRouter.get(
  '/reports/salesperson-performance',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const report = await generateSalespersonPerformance(tenantId, startDate, endDate);

      res.json({
        data: report,
        meta: {
          totalSalespeople: report.length,
          topPerformer: report.length > 0 ? report.reduce((best, sp) => sp.profit.totalGross > best.profit.totalGross ? sp : best) : null,
        },
      });
    } catch (error) {
      console.error('Salesperson performance error:', error);
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/accounting/reports/department-performance
 * Generate department performance report
 */
accountingRouter.get(
  '/reports/department-performance',
  (async (req, res, next) => {
    try {
      const tenantId = req.tenantId!;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setDate(1));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

      const report = await generateDepartmentPerformance(tenantId, startDate, endDate);

      res.json({ data: report });
    } catch (error) {
      console.error('Department performance error:', error);
      next(error);
    }
  }) as RequestHandler
);

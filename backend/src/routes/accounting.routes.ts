import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { wrapAsync } from '../lib/errors.js';
import * as controller from '../controllers/accounting.controller.js';

const router = express.Router();

const financeViewRoles = ['ADMIN', 'MANAGER', 'FINANCE'] as const;
const financeManageRoles = ['ADMIN', 'FINANCE'] as const;

router.use(authenticate);

router.get('/dashboard', requireRole([...financeViewRoles]), wrapAsync(controller.getDashboard));

router.get('/pl-statement', requireRole([...financeViewRoles]), wrapAsync(controller.getIncomeStatementController));
router.get('/balance-sheet', requireRole([...financeViewRoles]), wrapAsync(controller.getBalanceSheetController));
router.get('/cash-flow', requireRole([...financeViewRoles]), wrapAsync(controller.getCashFlowController));
router.get('/balance-sheet/report', requireRole([...financeViewRoles]), wrapAsync(controller.getBalanceSheetReportController));

router.get('/journal-entries', requireRole([...financeViewRoles]), wrapAsync(controller.getJournalEntries));
router.get('/journal-entries/:id', requireRole([...financeViewRoles]), wrapAsync(controller.getJournalEntry));
router.post('/journal-entries', requireRole([...financeManageRoles]), wrapAsync(controller.createJournalEntryController));
router.post('/journal-entries/:id/post', requireRole([...financeManageRoles]), wrapAsync(controller.postJournalEntryController));
router.post(
  '/journal-entries/auto-generate',
  requireRole([...financeManageRoles]),
  wrapAsync(controller.generateDealEntry),
);

router.get('/gl-accounts', requireRole([...financeViewRoles]), wrapAsync(controller.listAccounts));
router.post('/gl-accounts', requireRole([...financeManageRoles]), wrapAsync(controller.upsertAccount));
router.put('/gl-accounts/:id', requireRole([...financeManageRoles]), wrapAsync(controller.upsertAccount));
router.delete('/gl-accounts/:id', requireRole([...financeManageRoles]), wrapAsync(controller.deactivateAccount));

router.post('/payroll/preview', requireRole([...financeManageRoles]), wrapAsync(controller.previewPayrollController));
router.post('/payroll/finalize', requireRole([...financeManageRoles]), wrapAsync(controller.finalizePayrollController));
router.get('/payroll', requireRole([...financeViewRoles]), wrapAsync(controller.listPayrollsController));
router.get('/payroll/:id', requireRole([...financeViewRoles]), wrapAsync(controller.getPayrollController));

router.post('/tax-reports', requireRole([...financeManageRoles]), wrapAsync(controller.generateTaxReportController));
router.get('/tax-reports', requireRole([...financeViewRoles]), wrapAsync(controller.listTaxReportsController));

router.post('/export/statements/:statement', requireRole([...financeManageRoles]), wrapAsync(controller.exportStatementController));
router.post('/export/statements/email', requireRole([...financeManageRoles]), wrapAsync(controller.emailStatementController));

export default router;

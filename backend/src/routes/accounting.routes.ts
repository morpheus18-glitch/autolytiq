import express from 'express';
import { requireRole } from '../middleware/role.middleware.js';
import { wrapAsync } from '../lib/errors.js';
import * as controller from '../controllers/accounting.controller.js';

const router = express.Router();

router.get('/dashboard', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.getDashboard));

router.get('/statements/pl', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.getIncomeStatementController));
router.get('/statements/balance-sheet', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.getBalanceSheetController));
router.get('/statements/cash-flow', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.getCashFlowController));
router.post('/statements/:statement/export', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.exportStatementController));
router.post('/statements/email', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.emailStatementController));

router.get('/journal-entries', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.getJournalEntries));
router.get('/journal-entries/:id', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.getJournalEntry));
router.post('/journal-entries', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.createJournalEntryController));
router.post('/journal-entries/:id/post', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.postJournalEntryController));
router.post('/journal-entries/auto-generate', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.generateDealEntry));

router.get('/gl-accounts', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.listAccounts));
router.post('/gl-accounts', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.upsertAccount));
router.put('/gl-accounts/:id', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.upsertAccount));
router.delete('/gl-accounts/:id', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.deactivateAccount));

router.post('/payroll/preview', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.previewPayrollController));
router.post('/payroll/finalize', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.finalizePayrollController));
router.get('/payroll', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.listPayrollsController));
router.get('/payroll/:id', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.getPayrollController));

router.post('/tax-reports', requireRole(['ADMIN', 'FINANCE']), wrapAsync(controller.generateTaxReportController));
router.get('/tax-reports', requireRole(['ADMIN', 'MANAGER', 'FINANCE']), wrapAsync(controller.listTaxReportsController));

export default router;

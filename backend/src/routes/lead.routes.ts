import express from 'express';
import multer from 'multer';
import { wrapAsync } from '../lib/errors.js';
import { requireRole } from '../middleware/role.middleware.js';
import * as controller from '../controllers/lead.controller.js';

const router = express.Router();

const crmRoles = ['ADMIN', 'MANAGER', 'SALES', 'BDC', 'SERVICE'] as const;
const managementRoles = ['ADMIN', 'MANAGER'] as const;

const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/', requireRole([...crmRoles]), wrapAsync(controller.listLeads));
router.get('/stats', requireRole([...crmRoles]), wrapAsync(controller.getLeadStatistics));
router.post('/', requireRole(['ADMIN', 'MANAGER', 'SALES', 'BDC']), wrapAsync(controller.createLead));
router.post('/import', requireRole([...managementRoles]), csvUpload.single('file'), wrapAsync(controller.importLeads));
router.get('/:id', requireRole([...crmRoles]), wrapAsync(controller.getLead));
router.put('/:id', requireRole([...crmRoles]), wrapAsync(controller.updateLead));
router.delete('/:id', requireRole([...managementRoles]), wrapAsync(controller.deleteLead));
router.post('/:id/assign', requireRole(['ADMIN', 'MANAGER', 'SALES']), wrapAsync(controller.assignLead));
router.post('/:id/convert', requireRole(['ADMIN', 'MANAGER', 'SALES']), wrapAsync(controller.convertLead));
router.get('/:id/score', requireRole([...crmRoles]), wrapAsync(controller.getLeadScore));
router.post('/:id/score/calculate', requireRole(['ADMIN', 'MANAGER', 'SALES']), wrapAsync(controller.calculateLeadScore));

export default router;


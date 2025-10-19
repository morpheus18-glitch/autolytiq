import express from 'express';
import { wrapAsync } from '../../lib/errors.js';
import { requireRole } from '../../middleware/role.middleware.js';
import * as controller from './controller.js';

const router = express.Router();

const roles = ['ADMIN', 'MANAGER', 'SALES', 'SALES_MANAGER', 'SERVICE', 'BDC', 'FINANCE', 'FI_MANAGER'] as const;

router.get('/', requireRole([...roles]), wrapAsync(controller.list));
router.post('/mark-read', requireRole([...roles]), wrapAsync(controller.markRead));

export default router;

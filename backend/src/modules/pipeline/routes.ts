import express from 'express';
import { wrapAsync } from '../../lib/errors.js';
import { requireRole } from '../../middleware/role.middleware.js';
import * as controller from './controller.js';

const router = express.Router();

const boardRoles = ['ADMIN', 'MANAGER', 'SALES', 'SALES_MANAGER', 'SERVICE', 'BDC'] as const;
const moveRoles = ['ADMIN', 'MANAGER', 'SERVICE'] as const;
const startRoles = ['ADMIN', 'MANAGER', 'SERVICE', 'SALES'] as const;

router.get('/board', requireRole([...boardRoles]), wrapAsync(controller.board));
router.get('/:vehicleId/timeline', requireRole([...boardRoles]), wrapAsync(controller.timeline));
router.post('/:vehicleId/start', requireRole([...startRoles]), wrapAsync(controller.start));
router.post('/:vehicleId/move', requireRole([...moveRoles]), wrapAsync(controller.move));

export default router;

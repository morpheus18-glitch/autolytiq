import express from 'express';
import { wrapAsync } from '../../lib/errors.js';
import { requireRole } from '../../middleware/role.middleware.js';
import * as controller from './controller.js';

const router = express.Router();

const readRoles = ['ADMIN', 'MANAGER', 'SALES', 'SALES_MANAGER', 'SERVICE', 'BDC'] as const;
const writeRoles = ['ADMIN', 'MANAGER', 'SERVICE', 'SALES'] as const;

router.get('/', requireRole([...readRoles]), wrapAsync(controller.list));
router.post('/', requireRole([...writeRoles]), wrapAsync(controller.create));
router.put('/:id', requireRole([...writeRoles]), wrapAsync(controller.update));
router.post('/:id/assign', requireRole([...writeRoles]), wrapAsync(controller.assign));
router.post('/:id/mention', requireRole([...writeRoles]), wrapAsync(controller.mention));

export default router;

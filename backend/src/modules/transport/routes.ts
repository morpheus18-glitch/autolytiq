import express from 'express';
import { wrapAsync } from '../../lib/errors.js';
import { requireRole } from '../../middleware/role.middleware.js';
import * as controller from './controller.js';

const router = express.Router();

const roles = ['ADMIN', 'MANAGER', 'SERVICE'] as const;

router.post('/orders', requireRole([...roles]), wrapAsync(controller.create));
router.put('/orders/:id', requireRole([...roles]), wrapAsync(controller.update));

export default router;

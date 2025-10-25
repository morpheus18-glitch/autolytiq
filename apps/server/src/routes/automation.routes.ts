import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { requireRole } from '../middleware/rbac.js';
import type { Role } from '../types/roles.js';
import {
  listAutomations,
  createAutomation,
  updateAutomation,
  toggleAutomation,
  executeAutomation,
} from '../services/automation.service.js';

const automationRoles: Role[] = ['ADMIN', 'BDC'];

type Handler = (req: Request, res: Response) => Promise<void> | void;

function wrap(handler: Handler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

export const automationRouter = Router();

automationRouter.get('/', requireRole(...automationRoles), wrap(async (req, res) => {
  const data = await listAutomations();
  res.json({ data });
}));

automationRouter.post('/', requireRole(...automationRoles), wrap(async (req, res) => {
  const automation = await createAutomation(req.body);
  res.status(201).json({ data: automation });
}));

automationRouter.post('/execute', requireRole(...automationRoles), wrap(async (req, res) => {
  const results = await executeAutomation(req.body);
  res.json({ data: results });
}));

automationRouter.post('/:id/toggle', requireRole(...automationRoles), wrap(async (req, res) => {
  const automation = await toggleAutomation(req.params.id, req.body);
  res.json({ data: automation });
}));

automationRouter.put('/:id', requireRole(...automationRoles), wrap(async (req, res) => {
  const automation = await updateAutomation(req.params.id, req.body);
  res.json({ data: automation });
}));

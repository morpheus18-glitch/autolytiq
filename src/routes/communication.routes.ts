import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import * as communicationController from '../controllers/communication.controller.js';
import { requireRole } from '../middleware/rbac.js';
import type { Role } from '../types/roles.js';

const communicationRoles: Role[] = ['ADMIN', 'SALES', 'BDC', 'SERVICE'];

type ControllerHandler = (req: Request, res: Response) => Promise<void> | void;

function wrap(handler: ControllerHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

export const communicationRouter = Router();

communicationRouter.post('/call', requireRole(...communicationRoles), wrap(communicationController.initiateCall));
communicationRouter.post('/sms', requireRole(...communicationRoles), wrap(communicationController.sendSms));
communicationRouter.post('/email', requireRole(...communicationRoles), wrap(communicationController.sendEmail));
communicationRouter.get('/inbox', requireRole(...communicationRoles), wrap(communicationController.getInbox));
communicationRouter.get('/call-logs', requireRole(...communicationRoles), wrap(communicationController.getCallLogs));

import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import * as activityController from '../controllers/activity.controller';
import { requireRole } from '../middleware/rbac';
import type { Role } from '../types/roles';

const activityRoles: Role[] = ['ADMIN', 'SALES', 'BDC', 'SERVICE'];

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

export const activityRouter = Router();

activityRouter.get('/', requireRole(...activityRoles), wrap(activityController.listActivities));
activityRouter.post('/', requireRole(...activityRoles), wrap(activityController.createActivity));
activityRouter.get('/:id', requireRole(...activityRoles), wrap(activityController.getActivity));
activityRouter.put('/:id', requireRole(...activityRoles), wrap(activityController.updateActivity));
activityRouter.post('/call', requireRole(...activityRoles), wrap(activityController.logCall));
activityRouter.post('/email', requireRole(...activityRoles), wrap(activityController.logEmail));
activityRouter.post('/sms', requireRole(...activityRoles), wrap(activityController.logSms));
activityRouter.post('/note', requireRole(...activityRoles), wrap(activityController.logNote));

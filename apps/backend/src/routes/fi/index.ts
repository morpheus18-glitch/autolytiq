import { Router } from 'express';
import { complianceRouter } from './compliance.routes';

export const fiRouter = Router();

fiRouter.use('/compliance', complianceRouter);

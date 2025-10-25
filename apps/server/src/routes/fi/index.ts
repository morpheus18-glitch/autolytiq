import { Router } from 'express';
import { complianceRouter } from './compliance.routes.js';

export const fiRouter = Router();

fiRouter.use('/compliance', complianceRouter);

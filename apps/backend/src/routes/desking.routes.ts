import { Router } from 'express';
import {
  analyzeCounterOffer,
  fetchWorksheet,
  listApprovalPredictions,
  listWorksheetVersions,
  optimizeWorksheet,
  printWorksheet,
  refreshApprovalPrediction,
  selectWorksheetVersion,
  upsertWorksheet,
} from '../controllers/desking.controller.js';

export const deskingRouter = Router();

deskingRouter.get('/:dealId/worksheet', fetchWorksheet);
deskingRouter.post('/:dealId/worksheet', upsertWorksheet);
deskingRouter.post('/:dealId/worksheet/print', printWorksheet);
deskingRouter.post('/:dealId/optimize', optimizeWorksheet);
deskingRouter.post('/:dealId/counter', analyzeCounterOffer);
deskingRouter.get('/:dealId/versions', listWorksheetVersions);
deskingRouter.post('/:dealId/version/select', selectWorksheetVersion);
deskingRouter.get('/:dealId/approvals', listApprovalPredictions);
deskingRouter.post('/:dealId/approvals/refresh', refreshApprovalPrediction);

export default deskingRouter;

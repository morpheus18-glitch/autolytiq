import { Router, type RequestHandler } from 'express';
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
import { calculateTax } from '../services/tax.service.js';

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

/**
 * POST /api/desking/calculate-tax - Calculate taxes and fees by zip code
 */
deskingRouter.post(
  '/calculate-tax',
  (async (req, res, next) => {
    try {
      const { salePrice, zipCode, state, isNew } = req.body;

      if (!salePrice || !zipCode) {
        return res.status(400).json({
          error: 'Missing required fields: salePrice and zipCode',
        });
      }

      const result = calculateTax({
        salePrice,
        zipCode,
        state,
        isNew,
      });

      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

export default deskingRouter;

import { Router } from "express";
import { z } from "zod";
import type { DeskingService } from "./desking-service";

const worksheetSchema = z.object({
  dealId: z.string().optional(),
  salePrice: z.number().nonnegative(),
  msrp: z.number().positive().optional(),
  vehicleCost: z.number().nonnegative(),
  downPayment: z.number().nonnegative().default(0),
  tradeAllowance: z.number().nonnegative().optional(),
  tradePayoff: z.number().nonnegative().optional(),
  rebates: z.number().nonnegative().optional(),
  docFee: z.number().nonnegative().optional(),
  otherFees: z.number().nonnegative().optional(),
  taxes: z.number().nonnegative().optional(),
  apr: z.number().min(0),
  buyRate: z.number().min(0).optional(),
  termMonths: z.number().int().positive(),
  productCost: z.number().nonnegative().optional(),
  productPrice: z.number().nonnegative().optional(),
  packFee: z.number().nonnegative().optional(),
  holdback: z.number().nonnegative().optional(),
  creditScore: z.number().int().min(300).max(900).optional(),
});

const tradeSchema = z.object({
  vin: z.string().trim().optional(),
  year: z.number().int().min(1980),
  make: z.string().min(1),
  model: z.string().min(1),
  mileage: z.number().int().nonnegative().optional(),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
  payoffAmount: z.number().nonnegative().optional(),
  trim: z.string().min(1).optional(),
});

const structureSchema = worksheetSchema.extend({
  status: z.string().optional(),
});

export function buildDeskingRouter(service: DeskingService) {
  const router = Router();

  router.get("/deals", async (_req, res, next) => {
    try {
      const deals = await service.listDeals();
      res.json({ deals });
    } catch (error) {
      next(error);
    }
  });

  router.get("/deals/:dealId", async (req, res, next) => {
    try {
      const { dealId } = req.params;
      const summary = await service.getDealSummary(dealId);
      if (!summary.deal) {
        res.status(404).json({ message: "Deal not found" });
        return;
      }
      res.json(summary);
    } catch (error) {
      next(error);
    }
  });

  router.post("/worksheet", async (req, res, next) => {
    try {
      const payload = worksheetSchema.parse(req.body);
      const worksheet = await service.calculateDealWorksheet(payload);
      res.json(worksheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid worksheet payload", issues: error.issues });
        return;
      }
      next(error);
    }
  });

  router.post("/trade-in", async (req, res, next) => {
    try {
      const payload = tradeSchema.parse(req.body);
      const valuation = await service.evaluateTradeIn(payload);
      res.json(valuation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid trade-in payload", issues: error.issues });
        return;
      }
      next(error);
    }
  });

  router.post("/deals/:dealId/structure", async (req, res, next) => {
    try {
      const payload = structureSchema.parse({ ...req.body, dealId: req.params.dealId });
      const result = await service.updateDealStructure(req.params.dealId, payload);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid structure payload", issues: error.issues });
        return;
      }
      next(error);
    }
  });

  return router;
}

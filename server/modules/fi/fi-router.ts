import { Router } from "express";
import { z } from "zod";
import type { FiService } from "./fi-service";

const createMenuSchema = z.object({
  dealId: z.string().min(1),
  customerId: z.number().int().positive(),
  presentedBy: z.string().min(1),
  productIds: z.array(z.number().int().positive()).default([]),
  apr: z.number().min(0).optional(),
  termMonths: z.number().int().positive().optional(),
  cashDown: z.number().nonnegative().optional(),
  buyRate: z.number().min(0).optional(),
  notes: z.string().optional(),
});

const creditApplicationSchema = z.object({
  customerId: z.number().int().positive(),
  fullName: z.string().min(1),
  dateOfBirth: z.string().min(4),
  ssn: z.string().min(4),
  employmentHistory: z.array(z.any()).optional(),
  currentIncome: z.number().nonnegative(),
  rentMortgage: z.number().nonnegative(),
  consentGiven: z.boolean().optional(),
  notes: z.string().optional(),
});

const updateApplicationSchema = z.object({
  status: z.string().min(1).optional(),
  approvalAmount: z.number().nonnegative().nullable().optional(),
  interestRate: z.number().min(0).nullable().optional(),
  termMonths: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export function buildFiRouter(service: FiService) {
  const router = Router();

  router.get("/products", async (_req, res, next) => {
    try {
      const products = await service.listProducts();
      res.json({ products });
    } catch (error) {
      next(error);
    }
  });

  router.get("/menus", async (_req, res, next) => {
    try {
      const menus = await service.listFinanceMenus();
      res.json({ menus });
    } catch (error) {
      next(error);
    }
  });

  router.post("/menus", async (req, res, next) => {
    try {
      const payload = createMenuSchema.parse(req.body);
      const result = await service.createFinanceMenu(payload);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid finance menu payload", issues: error.issues });
        return;
      }
      next(error);
    }
  });

  router.get("/credit-applications/:customerId", async (req, res, next) => {
    try {
      const customerId = Number.parseInt(req.params.customerId, 10);
      if (Number.isNaN(customerId)) {
        res.status(400).json({ message: "customerId must be a number" });
        return;
      }
      const applications = await service.listCreditApplications(customerId);
      res.json({ applications });
    } catch (error) {
      next(error);
    }
  });

  router.post("/credit-applications", async (req, res, next) => {
    try {
      const payload = creditApplicationSchema.parse(req.body);
      const application = await service.createCreditApplication(payload);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid credit application", issues: error.issues });
        return;
      }
      next(error);
    }
  });

  router.patch("/credit-applications/:applicationId", async (req, res, next) => {
    try {
      const applicationId = Number.parseInt(req.params.applicationId, 10);
      if (Number.isNaN(applicationId)) {
        res.status(400).json({ message: "applicationId must be a number" });
        return;
      }
      const payload = updateApplicationSchema.parse(req.body);
      const updated = await service.updateCreditApplication(applicationId, payload);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update payload", issues: error.issues });
        return;
      }
      next(error);
    }
  });

  return router;
}

import { Router } from "express";
import { z } from "zod";
import { CrmService } from "./crm-service";
import { insertLeadSchema } from "@shared/schema";

const leadIngestionSchema = insertLeadSchema
  .extend({
    captureChannel: z.enum(["web", "marketplace", "manual", "integration"]).optional(),
    correlationId: z.string().uuid().optional(),
  })
  .partial({ leadNumber: true });

export function buildCrmRouter(service: CrmService): Router {
  const router = Router();

  router.post("/leads", async (req, res, next) => {
    try {
      const payload = leadIngestionSchema.parse(req.body);
      const result = await service.ingestLead(payload);
      res.status(201).json({ lead: result.lead, customer: result.customer ?? null });
    } catch (error) {
      next(error);
    }
  });

  router.get("/customers/:customerId", async (req, res, next) => {
    try {
      const customerId = Number.parseInt(req.params.customerId, 10);
      if (Number.isNaN(customerId)) {
        return res.status(400).json({ message: "customerId must be a number" });
      }

      const profile = await service.getUnifiedCustomerProfile(customerId);
      if (!profile) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

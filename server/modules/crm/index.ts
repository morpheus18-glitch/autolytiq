import type { ModuleDefinition } from "../../core";
import type { LeadCreatedEvent } from "./crm-events";
import { CrmService } from "./crm-service";
import { buildCrmRouter } from "./crm-router";

export const crmModule: ModuleDefinition = {
  name: "crm",
  async register(app, context) {
    const eventBus = context.eventBus;
    const service = new CrmService(eventBus);
    app.use("/api/crm", buildCrmRouter(service));

    const subscriptions = [
      eventBus.subscribe<LeadCreatedEvent>("crm.lead.created", async (event) => {
        context.logger.info?.(
          `Lead ${event.payload.leadId} ingested for customer ${event.payload.customerId ?? "unknown"}`
        );
      }),
    ];

    return { subscriptions };
  },
};

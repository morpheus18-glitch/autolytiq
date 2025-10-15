import type { ModuleDefinition } from "../../core";
import type { LeadCreatedEvent } from "../crm/crm-events";
import { DeskingService } from "./desking-service";
import { buildDeskingRouter } from "./desking-router";

export const deskingModule: ModuleDefinition = {
  name: "desking",
  async register(app, context) {
    const service = new DeskingService(context.storage, context.eventBus);
    app.use("/api/desking", buildDeskingRouter(service));

    const subscriptions = [
      context.eventBus.subscribe<LeadCreatedEvent>("crm.lead.created", async (event) => {
        context.logger.info?.(
          `Desking pipeline primed for lead ${event.payload.leadId} from ${event.payload.source}`
        );
      }),
    ];

    return { subscriptions };
  },
};

import type { ModuleDefinition } from "../../core";
import type { DealStructuredEvent } from "../desking/desking-events";
import { FiService } from "./fi-service";
import { buildFiRouter } from "./fi-router";

export const fiModule: ModuleDefinition = {
  name: "fi",
  async register(app, context) {
    const service = new FiService(context.storage, context.eventBus);
    app.use("/api/fi", buildFiRouter(service));

    const subscriptions = [
      context.eventBus.subscribe<DealStructuredEvent>("desking.deal.structured", async (event) => {
        context.logger.info?.(
          `F&I notified: deal ${event.payload.dealId} structured with net gross ${event.payload.worksheet.netGross}`
        );
      }),
    ];

    return { subscriptions };
  },
};

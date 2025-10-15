import { ilike } from "drizzle-orm";
import { db } from "../../db";
import {
  customers,
  leads,
  customerTimeline,
  insertLeadSchema,
  insertCustomerTimelineSchema,
  type Lead,
  type Customer,
} from "@shared/schema";
import { createDomainEvent, EventBus } from "../../core";
import { LeadCreatedEvent, CustomerProfileUpdatedEvent } from "./crm-events";
import { loadUnifiedCustomerProfile, type UnifiedCustomerProfile } from "./unified-customer-model";
import { randomUUID } from "crypto";
import { z } from "zod";

const EMAIL_NORMALIZER = /\s+/g;

const leadInputSchema = insertLeadSchema.partial({ leadNumber: true });
type LeadSchemaInput = z.infer<typeof leadInputSchema>;

export interface LeadIngestionInput extends LeadSchemaInput {
  readonly captureChannel?: "web" | "marketplace" | "manual" | "integration";
  readonly correlationId?: string;
}

type DatabaseExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class CrmService {
  constructor(private readonly eventBus: EventBus) {}

  async ingestLead(rawInput: LeadIngestionInput): Promise<{ lead: Lead; customer?: Customer }> {
    const input = leadInputSchema.parse(rawInput);
    const correlationId = rawInput.correlationId ?? randomUUID();

    const normalizedEmail = input.customerEmail.replace(EMAIL_NORMALIZER, "").toLowerCase();

    const result = await db.transaction(async (tx) => {
      const existingCustomer = normalizedEmail
        ? await tx.query.customers.findFirst({
            where: ilike(customers.email, normalizedEmail),
          })
        : undefined;

      const customer = existingCustomer ?? (await this.createCustomerFromLead(tx, input));

      const [lead] = await tx
        .insert(leads)
        .values({
          ...input,
          leadNumber: input.leadNumber ?? this.generateLeadNumber(),
          customerId: customer?.id ?? input.customerId ?? null,
          source: input.source,
        })
        .onConflictDoUpdate({
          target: leads.leadNumber,
          set: {
            customerId: customer?.id ?? input.customerId ?? null,
            status: input.status,
            priority: input.priority,
            temperature: input.temperature,
            interestedVehicles: input.interestedVehicles,
            budget: input.budget,
            timeline: input.timeline,
            tradeInInfo: input.tradeInInfo,
            financing: input.financing,
            assignedTo: input.assignedTo,
            nextFollowUp: input.nextFollowUp,
            notes: input.notes,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (rawInput.captureChannel && (customer?.id ?? lead.customerId)) {
        const timelineEntry = insertCustomerTimelineSchema.parse({
          customerId: customer?.id ?? lead.customerId!,
          eventType: "crm_lead_capture",
          eventDescription: `Lead captured via ${rawInput.captureChannel}`,
          source: rawInput.captureChannel,
          metadata: {
            source: input.source,
            leadId: lead.id,
          },
        });

        await tx.insert(customerTimeline).values(timelineEntry);
      }

      return { lead, customer };
    });

    const leadEvent: LeadCreatedEvent = createDomainEvent("crm.lead.created", {
      leadId: result.lead.id,
      customerId: result.customer?.id ?? result.lead.customerId ?? undefined,
      source: result.lead.source,
    });

    await this.eventBus.publish(leadEvent);

    if (result.customer) {
      const profileEvent: CustomerProfileUpdatedEvent = createDomainEvent("crm.customer.profile.updated", {
        customerId: result.customer.id,
        updatedFields: ["leads", "timeline"],
      });
      await this.eventBus.publish(profileEvent);
    }

    return result;
  }

  async getUnifiedCustomerProfile(customerId: number): Promise<UnifiedCustomerProfile | undefined> {
    return loadUnifiedCustomerProfile(customerId);
  }

  private generateLeadNumber(): string {
    const now = new Date();
    const timestamp =
      now.getUTCFullYear().toString() +
      (now.getUTCMonth() + 1).toString().padStart(2, "0") +
      now.getUTCDate().toString().padStart(2, "0") +
      now.getUTCHours().toString().padStart(2, "0") +
      now.getUTCMinutes().toString().padStart(2, "0") +
      now.getUTCSeconds().toString().padStart(2, "0");
    const randomSegment = Math.random().toString(16).slice(2, 8).toUpperCase();
    return `LEAD-${timestamp}-${randomSegment}`;
  }

  private async createCustomerFromLead(tx: DatabaseExecutor, lead: LeadSchemaInput): Promise<Customer | undefined> {
    const [firstName, ...rest] = lead.customerName.trim().split(/\s+/);
    const lastName = rest.length ? rest.join(" ") : firstName;
    const fullName = [firstName, rest.join(" ")].filter(Boolean).join(" ").trim();
    const normalizedEmail = lead.customerEmail.replace(EMAIL_NORMALIZER, "").toLowerCase();

    if (!normalizedEmail) {
      return undefined;
    }

    const [created] = await tx
      .insert(customers)
      .values({
        firstName: firstName || "Customer",
        lastName,
        email: normalizedEmail,
        phone: lead.customerPhone,
        leadSource: lead.source,
        preferences: {
          interestedIn: lead.interestedIn,
        },
        leadScore: Number(lead.conversionProbability ?? 0),
        tags: lead.tags ?? null,
        notes: lead.notes ?? null,
        name: fullName || lead.customerName,
      })
      .returning();

    return created;
  }
}

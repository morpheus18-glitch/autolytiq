import type { DomainEvent } from "../../core";

export type LeadCreatedEvent = DomainEvent<
  "crm.lead.created",
  {
    leadId: number;
    customerId?: number;
    source: string;
  }
>;

export type CustomerProfileUpdatedEvent = DomainEvent<
  "crm.customer.profile.updated",
  {
    customerId: number;
    updatedFields: string[];
  }
>;

export type CrmDomainEvent = LeadCreatedEvent | CustomerProfileUpdatedEvent;

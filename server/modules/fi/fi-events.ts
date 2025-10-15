import type { DomainEvent } from "../../core";

export type FinanceMenuPresentedEvent = DomainEvent<
  "fi.menu.presented",
  {
    menuId: number;
    customerId: number;
    dealId?: string | number;
    presentedBy: string;
    basePayment: number;
    finalPayment: number;
    selectedProducts: Array<{ productId: number; price: number }>;
  }
>;

export type CreditApplicationStatusEvent = DomainEvent<
  "fi.credit.application.updated",
  {
    applicationId: number;
    customerId: number;
    status: string;
    decisionAmount?: number | null;
    interestRate?: number | null;
  }
>;

export type CreditApplicationCreatedEvent = DomainEvent<
  "fi.credit.application.created",
  {
    applicationId: number;
    customerId: number;
    submittedAt: string;
  }
>;

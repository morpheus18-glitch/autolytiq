import type { EventSubscription } from '../lib/event-bus';
import { EVENT_TOPICS, subscribeToEvent } from '../events/index';
import { primeCreditSubmissionDraft } from './fi.integration';
import {
  releaseVehicleInventory,
  reserveVehicleInventory,
} from './inventory.integration';
import { appendDealTimelineEntry, scheduleDealFollowUp } from './crm.integration';
import { createDealCloseJournal, createSalesCommissionStub } from './accounting.integration';
import { recordDealEvent } from '../services/dealEventLog.service';

const subscriptions: EventSubscription[] = [];
let initialized = false;

function register(subscription: EventSubscription) {
  subscriptions.push(subscription);
}

function logIntegrationError(topic: string, error: unknown) {
  console.error(`[integration] ${topic} handler failed`, error);
}

export function initializeDomainIntegrations(): void {
  if (initialized) {
    return;
  }

  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_WORKSHEET_CREATED, async (event) => {
      try {
        await reserveVehicleInventory(
          event.payload.tenantId,
          event.payload.dealId,
          event.payload.worksheetId,
          event.payload.vehicleId,
        );
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.salespersonId ?? undefined,
          event: 'WORKSHEET_CREATED',
          payload: event.payload,
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_WORKSHEET_CREATED, error);
      }
    }),
  );

  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_VERSION_CREATED, async (event) => {
      try {
        await appendDealTimelineEntry({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? undefined,
          title: 'Pencil generated',
          description: 'New pricing pencil created and ready for review.',
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.createdBy ?? undefined,
          event: 'VERSION_CREATED',
          payload: event.payload,
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_VERSION_CREATED, error);
      }
    }),
  );

  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_VERSION_SELECTED, async (event) => {
      try {
        await primeCreditSubmissionDraft({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          worksheetId: event.payload.worksheetId,
          versionId: event.payload.versionId,
          customerId: event.payload.customerId,
          vehicleId: event.payload.vehicleId,
          structure: event.payload.structure,
          totals: event.payload.totals,
          payment: event.payload.payment,
          selectedBy: event.payload.selectedBy,
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.selectedBy,
          event: 'VERSION_SELECTED',
          payload: event.payload,
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_VERSION_SELECTED, error);
      }
    }),
  );

  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_OPTIMIZED, async (event) => {
      try {
        await appendDealTimelineEntry({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? undefined,
          title: 'AI optimized scenario',
          description: 'Optimization completed for the active pencil.',
        });
        await scheduleDealFollowUp({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? undefined,
          subject: 'Review AI optimization results',
          dueInHours: 12,
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.runBy,
          event: 'OPTIMIZED',
          payload: event.payload,
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_OPTIMIZED, error);
      }
    }),
  );

  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_COUNTER_ACCEPTED, async (event) => {
      try {
        await appendDealTimelineEntry({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? undefined,
          title: 'Counter accepted',
          description: 'Customer accepted the negotiated counter offer.',
        });
        await scheduleDealFollowUp({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? undefined,
          subject: 'Confirm delivery details after counter acceptance',
          dueInHours: 6,
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.handledBy,
          event: 'COUNTER_ACCEPTED',
          payload: event.payload,
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_COUNTER_ACCEPTED, error);
      }
    }),
  );

  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_STATUS_LOST, async (event) => {
      try {
        await releaseVehicleInventory(
          event.payload.tenantId,
          event.payload.dealId,
          event.payload.worksheetId,
          event.payload.vehicleId,
          'LOST',
        );
        await scheduleDealFollowUp({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? undefined,
          subject: 'Reconnect after lost deal',
          dueInHours: 24,
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.salespersonId ?? undefined,
          event: 'STATUS_LOST',
          payload: event.payload,
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_STATUS_LOST, error);
      }
    }),
  );

  register(
    subscribeToEvent(EVENT_TOPICS.DEAL_STATUS_CLOSED, async (event) => {
      try {
        await releaseVehicleInventory(
          event.payload.tenantId,
          event.payload.dealId,
          event.payload.worksheetId,
          event.payload.vehicleId,
          'CLOSED',
        );
        const journalId = await createDealCloseJournal({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          worksheetId: event.payload.worksheetId,
          vehicleId: event.payload.vehicleId,
          salespersonId: event.payload.salespersonId,
          totals: event.payload.totals,
        });
        await createSalesCommissionStub({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          salespersonId: event.payload.salespersonId,
          frontGross: Number(event.payload.totals?.frontEndGross ?? 0),
        });
        await appendDealTimelineEntry({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          customerId: event.payload.customerId,
          salespersonId: event.payload.salespersonId ?? undefined,
          title: 'Deal closed',
          description: journalId ? `Accounting entry ${journalId} created.` : 'Deal marked as closed.',
        });
        await recordDealEvent({
          tenantId: event.payload.tenantId,
          dealId: event.payload.dealId,
          userId: event.payload.salespersonId ?? undefined,
          event: 'STATUS_CLOSED',
          payload: event.payload,
        });
      } catch (error) {
        logIntegrationError(EVENT_TOPICS.DEAL_STATUS_CLOSED, error);
      }
    }),
  );

  initialized = true;
}

export function shutdownDomainIntegrations(): void {
  while (subscriptions.length) {
    subscriptions.pop()?.unsubscribe();
  }
  initialized = false;
}

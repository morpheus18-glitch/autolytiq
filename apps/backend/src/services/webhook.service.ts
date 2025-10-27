import {
  ActivityStatus,
  CommunicationDirection,
  CommunicationStatus,
  CommunicationType,
  LeadPriority,
  LeadSource,
  LeadStatus,
  Prisma,
} from '@prisma/client';
import { getTenantId, prisma, toInputJson } from '../lib/prisma.js';
import { mapSendGridStatus, mapTwilioStatus } from './inbox.service.js';
import { normalizePhoneNumber } from './twilio.service.js';
import * as activityService from './activity.service.js';
import { handleLeadCreated } from './lead-routing.service.js';

export type TwilioWebhookPayload = Record<string, string | null | undefined>;

export interface SendGridWebhookEvent extends Record<string, unknown> {
  event: string;
  timestamp?: number;
  sg_message_id?: string;
}

function deriveActivityStatus(status?: CommunicationStatus | null): ActivityStatus {
  switch (status) {
    case CommunicationStatus.DELIVERED:
      return ActivityStatus.COMPLETED;
    case CommunicationStatus.FAILED:
    case CommunicationStatus.CANCELLED:
      return ActivityStatus.CANCELED;
    default:
      return ActivityStatus.PENDING;
  }
}

function requireTenantId(): string {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error('Tenant context is required for webhook processing');
  }
  return tenantId;
}

function optionalRelation<T>(value?: string | null): T | undefined {
  if (!value) {
    return undefined;
  }
  return { connect: { id: value } } as T;
}

function mergeJson(
  base: Record<string, unknown> | null | undefined,
  extra: Record<string, unknown>,
): Prisma.InputJsonValue {
  const normalizedBase = (base ?? {}) as Record<string, unknown>;
  return toInputJson({ ...normalizedBase, ...extra });
}

async function upsertLeadByPhone(phone: string, source: LeadSource) {
  const tenantId = requireTenantId();
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) {
    return { leadId: undefined, customerId: undefined } as const;
  }

  let created = false;
  let lead = await prisma.lead.findFirst({
    where: { phone: normalized },
    select: { id: true, customerId: true },
  });

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        tenant: { connect: { id: tenantId } },
        phone: normalized,
        source,
        status: LeadStatus.NEW,
        priority: LeadPriority.MEDIUM,
        tags: ['AUTO_CREATED'],
      },
      select: { id: true, customerId: true },
    });
    created = true;
  }

  if (created && lead.id) {
    try {
      await handleLeadCreated(lead.id);
    } catch (error) {
      console.error('Failed to route new lead', error);
    }
  }

  return { leadId: lead.id, customerId: lead.customerId } as const;
}

async function updateActivityFromCommunication(
  communicationId: string,
  status: CommunicationStatus | undefined,
  outcome?: string,
) {
  const communication = await prisma.communication.findUnique({
    where: { id: communicationId },
    select: { activityId: true, leadId: true },
  });

  if (!communication?.activityId) {
    return;
  }

  const updates: Prisma.ActivityUpdateInput = {};
  if (status) {
    updates.status = deriveActivityStatus(status);
  }
  if (outcome) {
    updates.outcome = outcome;
  }
  if (
    status &&
    (status === CommunicationStatus.DELIVERED ||
      status === CommunicationStatus.FAILED ||
      status === CommunicationStatus.CANCELLED)
  ) {
    updates.completedAt = new Date();
  }

  await prisma.activity.update({ where: { id: communication.activityId }, data: updates });
}

function readString(payload: TwilioWebhookPayload, key: string): string | undefined {
  const value = payload[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export async function handleTwilioWebhook(payload: TwilioWebhookPayload) {
  const tenantId = requireTenantId();
  const messageSid = readString(payload, 'MessageSid') ?? readString(payload, 'SmsSid');
  const callSid = readString(payload, 'CallSid');

  if (messageSid) {
    const status = mapTwilioStatus(readString(payload, 'MessageStatus') ?? readString(payload, 'SmsStatus'));
    const direction = (readString(payload, 'Direction') ?? readString(payload, 'MessageDirection') ?? '').toLowerCase();

    if ((readString(payload, 'SmsStatus') ?? '').toLowerCase() === 'received' || direction === 'inbound') {
      const from = normalizePhoneNumber(readString(payload, 'From') ?? '');
      const to = normalizePhoneNumber(readString(payload, 'To') ?? '');
      const body = readString(payload, 'Body') ?? '';
      const { leadId, customerId } = await upsertLeadByPhone(from, LeadSource.PHONE);

      const communication = await prisma.communication.create({
        data: {
          tenant: { connect: { id: tenantId } },
          type: CommunicationType.SMS,
          direction: CommunicationDirection.INBOUND,
          to,
          from,
          body,
          providerId: messageSid,
          status: CommunicationStatus.DELIVERED,
          metadata: toInputJson({ twilio: payload }),
          lead: optionalRelation<Prisma.LeadCreateNestedOneWithoutCommunicationsInput>(leadId),
          customer: optionalRelation<Prisma.CustomerCreateNestedOneWithoutCommunicationsInput>(customerId),
        },
      });

      const activity = await activityService.logSmsActivity({
        leadId,
        customerId: customerId ?? undefined,
        body,
        to,
        from,
        providerId: messageSid,
      });

      await prisma.communication.update({ where: { id: communication.id }, data: { activityId: activity.id } });
      return;
    }

    const communication = await prisma.communication.findFirst({
      where: { providerId: messageSid },
      select: { id: true, metadata: true },
    });

    if (!communication) {
      return;
    }

    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: status ?? undefined,
        metadata: mergeJson(communication.metadata as Record<string, unknown> | null, {
          lastEvent: payload,
        }),
      },
    });

    await updateActivityFromCommunication(
      updated.id,
      updated.status ?? undefined,
      readString(payload, 'MessageStatus') ?? readString(payload, 'SmsStatus'),
    );
    return;
  }

  if (callSid) {
    const status = mapTwilioStatus(readString(payload, 'CallStatus'));
    const direction = (readString(payload, 'Direction') ?? '').toLowerCase();
    const existing = await prisma.communication.findFirst({ where: { providerId: callSid } });

    if (!existing) {
      const from = normalizePhoneNumber(readString(payload, 'From') ?? '');
      const to = normalizePhoneNumber(readString(payload, 'To') ?? '');
      const { leadId, customerId } = await upsertLeadByPhone(direction === 'inbound' ? from : to, LeadSource.PHONE);

      const communication = await prisma.communication.create({
        data: {
          tenant: { connect: { id: tenantId } },
          type: CommunicationType.CALL,
          direction: direction === 'inbound' ? CommunicationDirection.INBOUND : CommunicationDirection.OUTBOUND,
          to,
          from,
          providerId: callSid,
          status: status ?? CommunicationStatus.SENT,
          metadata: toInputJson({ twilio: payload }),
          lead: optionalRelation<Prisma.LeadCreateNestedOneWithoutCommunicationsInput>(leadId),
          customer: optionalRelation<Prisma.CustomerCreateNestedOneWithoutCommunicationsInput>(customerId),
        },
      });

      const activity = await activityService.logCallActivity({
        leadId,
        customerId: customerId ?? undefined,
        startedAt: new Date(),
        completedAt: status === CommunicationStatus.DELIVERED ? new Date() : undefined,
        callSid,
        recordingUrl: readString(payload, 'RecordingUrl'),
        outcome: readString(payload, 'CallStatus'),
        durationSeconds: readString(payload, 'CallDuration') ? Number(readString(payload, 'CallDuration')) : undefined,
      });

      await prisma.communication.update({ where: { id: communication.id }, data: { activityId: activity.id } });
      return;
    }

    const updated = await prisma.communication.update({
      where: { id: existing.id },
      data: {
        status: status ?? undefined,
        metadata: mergeJson(existing.metadata as Record<string, unknown> | null, {
          lastEvent: payload,
          recordingUrl:
            readString(payload, 'RecordingUrl') ?? (existing.metadata as Record<string, unknown> | null)?.recordingUrl,
        }),
      },
    });

    await updateActivityFromCommunication(updated.id, updated.status ?? undefined, readString(payload, 'CallStatus'));
  }
}

export async function handleSendGridWebhook(events: SendGridWebhookEvent[]) {
  for (const event of events) {
    const rawMessageId = (event.sg_message_id ?? event['sg_message_id']) as string | undefined;
    if (!rawMessageId) {
      continue;
    }
    const messageId = String(rawMessageId).split('.')[0];
    const status = mapSendGridStatus(event.event);

    const communication = await prisma.communication.findFirst({
      where: {
        OR: [
          { providerId: messageId },
          { metadata: { path: ['messageId'], equals: messageId } },
        ],
      },
    });

    if (!communication) {
      continue;
    }

    const metadata = communication.metadata as Record<string, unknown> | null;
    const existingEvents = Array.isArray(metadata?.events)
      ? (metadata!.events as Prisma.JsonArray)
      : ([] as Prisma.JsonArray);
    const events: Prisma.JsonArray = [
      ...existingEvents,
      { type: event.event, timestamp: event.timestamp ?? Date.now() },
    ] as Prisma.JsonArray;

    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: status ?? undefined,
        metadata: toInputJson({
          ...(metadata ?? {}),
          lastEvent: event,
          events,
          messageId,
        }),
      },
    });

    if (updated.activityId) {
      const activityUpdates: Prisma.ActivityUpdateInput = {};
      if (status) {
        activityUpdates.status = deriveActivityStatus(status);
        if (status === CommunicationStatus.DELIVERED || status === CommunicationStatus.FAILED) {
          activityUpdates.completedAt = new Date();
        }
      }

      if (event.event === 'open') {
        activityUpdates.opened = true;
        activityUpdates.outcome = 'Email opened';
      }

      if (event.event === 'click') {
        activityUpdates.clicked = true;
        activityUpdates.outcome = 'Email clicked';
      }

      await prisma.activity.update({ where: { id: updated.activityId }, data: activityUpdates });
    }

    if (['bounce', 'spamreport', 'unsubscribe'].includes(event.event) && communication.leadId) {
      await prisma.lead.update({ where: { id: communication.leadId }, data: { emailOptOut: true } });
    }
  }
}

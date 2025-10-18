import {
  ActivityStatus,
  ActivityType,
  CommunicationDirection,
  CommunicationStatus,
  CommunicationType,
  Prisma,
} from '@prisma/client';
import { env } from '../config/env.js';
import { getTenantId, prisma } from '../lib/prisma.js';
import type {
  CallRequestInput,
  EmailRequestInput,
  SmsRequestInput,
} from '../validations/communication.validation.js';
import { initiateVoiceCall, sendSms, normalizePhoneNumber } from './twilio.service.js';
import { sendEmail } from './sendgrid.service.js';
import { mapTwilioStatus } from './inbox.service.js';

interface LeadConsent {
  id: string;
  smsOptOut: boolean;
  emailOptOut: boolean;
  callOptOut: boolean;
}

function requireTenantId(): string {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error('Tenant context is required for communications');
  }
  return tenantId;
}

function optionalRelation<T>(value?: string | null): T | undefined {
  if (!value) {
    return undefined;
  }
  return { connect: { id: value } } as T;
}

function toJson(value: Record<string, unknown> | null | undefined): Prisma.InputJsonValue | undefined {
  if (!value) {
    return undefined;
  }
  return value as Prisma.InputJsonValue;
}

function mergeMetadata(
  base: Record<string, unknown> | null | undefined,
  extra: Record<string, unknown>,
): Prisma.InputJsonValue {
  return { ...(base ?? {}), ...extra } as Prisma.InputJsonValue;
}

async function fetchLead(leadId: string): Promise<LeadConsent> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, smsOptOut: true, emailOptOut: true, callOptOut: true },
  });

  if (!lead) {
    throw Object.assign(new Error('Lead not found'), { status: 404 });
  }

  return lead;
}

function assertConsent(lead: LeadConsent, type: CommunicationType) {
  if (type === CommunicationType.SMS && lead.smsOptOut) {
    throw Object.assign(new Error('Lead has opted out of SMS communications'), { status: 409 });
  }
  if (type === CommunicationType.EMAIL && lead.emailOptOut) {
    throw Object.assign(new Error('Lead has opted out of email communications'), { status: 409 });
  }
  if (type === CommunicationType.CALL && lead.callOptOut) {
    throw Object.assign(new Error('Lead has opted out of phone communications'), { status: 409 });
  }
}

async function touchLeadCommunication(leadId?: string | null) {
  if (!leadId) {
    return;
  }
  try {
    await prisma.lead.update({ where: { id: leadId }, data: { lastCommunicationAt: new Date(), lastActivityAt: new Date() } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return;
    }
    throw error;
  }
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

async function linkActivity(
  communicationId: string,
  tenantId: string,
  payload: {
    type: ActivityType;
    subject?: string;
    description?: string;
    outcome?: string;
    leadId?: string | null;
    customerId?: string | null;
    userId?: string | null;
    metadata?: Record<string, unknown>;
    status?: CommunicationStatus | null;
  },
) {
  const activity = await prisma.activity.create({
    data: {
      tenant: { connect: { id: tenantId } },
      lead: optionalRelation<Prisma.LeadCreateNestedOneWithoutActivitiesInput>(payload.leadId),
      customer: optionalRelation<Prisma.CustomerCreateNestedOneWithoutActivitiesInput>(payload.customerId),
      user: optionalRelation<Prisma.UserCreateNestedOneWithoutActivitiesInput>(payload.userId),
      type: payload.type,
      status: deriveActivityStatus(payload.status),
      subject: payload.subject,
      description: payload.description,
      outcome: payload.outcome,
      metadata: toJson(payload.metadata),
    },
  });

  await prisma.communication.update({
    where: { id: communicationId },
    data: { activityId: activity.id },
  });

  await touchLeadCommunication(activity.leadId);

  return activity;
}

export async function initiateCall(payload: CallRequestInput) {
  const tenantId = requireTenantId();
  let lead: LeadConsent | undefined;
  if (payload.leadId) {
    lead = await fetchLead(payload.leadId);
    assertConsent(lead, CommunicationType.CALL);
  }

  const fromNumber = payload.from ? normalizePhoneNumber(payload.from) : env.TWILIO_CALLER_ID;

  const communication = await prisma.communication.create({
    data: {
      tenant: { connect: { id: tenantId } },
      type: CommunicationType.CALL,
      direction: CommunicationDirection.OUTBOUND,
      to: normalizePhoneNumber(payload.to),
      from: fromNumber,
      metadata: toJson(payload.metadata),
      status: CommunicationStatus.QUEUED,
      lead: optionalRelation<Prisma.LeadCreateNestedOneWithoutCommunicationsInput>(payload.leadId),
      customer: optionalRelation<Prisma.CustomerCreateNestedOneWithoutCommunicationsInput>(payload.customerId),
      user: optionalRelation<Prisma.UserCreateNestedOneWithoutCommunicationsInput>(payload.userId),
    },
  });

  try {
    const callbackBase = env.API_URL.replace(/\/$/, '');
    const statusCallback = `${callbackBase}/api/communications/twilio/webhook?tenantId=${encodeURIComponent(communication.tenantId)}`;
    const call = await initiateVoiceCall({
      to: communication.to,
      from: fromNumber,
      twimlUrl: payload.twimlUrl,
      statusCallback,
      metadata: payload.metadata,
    });

    const status = mapTwilioStatus(call.status) ?? CommunicationStatus.SENT;
    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        providerId: call.sid,
        status,
        metadata: mergeMetadata(communication.metadata as Record<string, unknown> | null, {
          callSid: call.sid,
          direction: call.direction,
        }),
      },
    });

    const activity = await linkActivity(updated.id, tenantId, {
      type: ActivityType.CALL,
      subject: 'Outbound call initiated',
      description: payload.metadata?.notes as string | undefined,
      outcome: call.status,
      leadId: updated.leadId,
      customerId: updated.customerId,
      userId: updated.userId,
      metadata: {
        provider: 'twilio',
        callSid: call.sid,
      },
      status,
    });

    return { communication: updated, activity, provider: call };
  } catch (error) {
    await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: CommunicationStatus.FAILED,
        metadata: mergeMetadata(communication.metadata as Record<string, unknown> | null, {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
    });
    throw error;
  }
}

export async function sendSmsMessage(payload: SmsRequestInput) {
  const tenantId = requireTenantId();
  let lead: LeadConsent | undefined;
  if (payload.leadId) {
    lead = await fetchLead(payload.leadId);
    assertConsent(lead, CommunicationType.SMS);
  }

  const fromNumber = payload.from ? normalizePhoneNumber(payload.from) : env.TWILIO_CALLER_ID;

  const communication = await prisma.communication.create({
    data: {
      tenant: { connect: { id: tenantId } },
      type: CommunicationType.SMS,
      direction: CommunicationDirection.OUTBOUND,
      to: normalizePhoneNumber(payload.to),
      from: fromNumber,
      body: payload.body,
      metadata: toJson(payload.metadata),
      status: CommunicationStatus.QUEUED,
      lead: optionalRelation<Prisma.LeadCreateNestedOneWithoutCommunicationsInput>(payload.leadId),
      customer: optionalRelation<Prisma.CustomerCreateNestedOneWithoutCommunicationsInput>(payload.customerId),
      user: optionalRelation<Prisma.UserCreateNestedOneWithoutCommunicationsInput>(payload.userId),
    },
  });

  try {
    const callbackBase = env.API_URL.replace(/\/$/, '');
    const statusCallback = `${callbackBase}/api/communications/twilio/webhook?tenantId=${encodeURIComponent(communication.tenantId)}`;
    const message = await sendSms({
      to: communication.to,
      from: fromNumber,
      body: payload.body,
      mediaUrls: payload.mediaUrls,
      statusCallback,
    });

    const status = mapTwilioStatus(message.status) ?? CommunicationStatus.SENT;
    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        providerId: message.sid,
        status,
        metadata: mergeMetadata(communication.metadata as Record<string, unknown> | null, {
          messageSid: message.sid,
          segments: message.numSegments,
        }),
      },
    });

    const activity = await linkActivity(updated.id, tenantId, {
      type: ActivityType.SMS,
      description: payload.body,
      outcome: message.status,
      leadId: updated.leadId,
      customerId: updated.customerId,
      userId: updated.userId,
      metadata: {
        provider: 'twilio',
        messageSid: message.sid,
      },
      status,
    });

    return { communication: updated, activity, provider: message };
  } catch (error) {
    await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: CommunicationStatus.FAILED,
        metadata: mergeMetadata(communication.metadata as Record<string, unknown> | null, {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
    });
    throw error;
  }
}

export async function sendEmailMessage(payload: EmailRequestInput) {
  const tenantId = requireTenantId();
  let lead: LeadConsent | undefined;
  if (payload.leadId) {
    lead = await fetchLead(payload.leadId);
    assertConsent(lead, CommunicationType.EMAIL);
  }

  const communication = await prisma.communication.create({
    data: {
      tenant: { connect: { id: tenantId } },
      type: CommunicationType.EMAIL,
      direction: CommunicationDirection.OUTBOUND,
      to: payload.to.join(','),
      from: env.SENDGRID_FROM,
      subject: payload.subject ?? null,
      body: payload.html ?? payload.text ?? null,
      metadata: toJson({
        ...payload.metadata,
        to: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        attachments: payload.attachments?.map(({ filename }) => filename),
        templateId: payload.templateId,
      }),
      status: CommunicationStatus.QUEUED,
      lead: optionalRelation<Prisma.LeadCreateNestedOneWithoutCommunicationsInput>(payload.leadId),
      customer: optionalRelation<Prisma.CustomerCreateNestedOneWithoutCommunicationsInput>(payload.customerId),
      user: optionalRelation<Prisma.UserCreateNestedOneWithoutCommunicationsInput>(payload.userId),
    },
  });

  try {
    const response = await sendEmail({
      to: payload.to,
      cc: payload.cc,
      bcc: payload.bcc,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      templateId: payload.templateId,
      templateData: payload.templateData,
      attachments: payload.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        type: attachment.type,
        disposition: attachment.disposition,
      })),
    });

    const status = response.statusCode >= 200 && response.statusCode < 300 ? CommunicationStatus.SENT : CommunicationStatus.FAILED;
    const updated = await prisma.communication.update({
      where: { id: communication.id },
      data: {
        providerId: response.messageId ?? undefined,
        status,
        metadata: mergeMetadata(communication.metadata as Record<string, unknown> | null, {
          messageId: response.messageId,
          statusCode: response.statusCode,
        }),
      },
    });

    const activity = await linkActivity(updated.id, tenantId, {
      type: ActivityType.EMAIL,
      subject: payload.subject,
      description: payload.html ?? payload.text ?? undefined,
      outcome: status === CommunicationStatus.SENT ? 'Queued' : 'Failed to send',
      leadId: updated.leadId,
      customerId: updated.customerId,
      userId: updated.userId,
      metadata: {
        provider: 'sendgrid',
        messageId: response.messageId,
      },
      status,
    });

    return { communication: updated, activity, provider: response };
  } catch (error) {
    await prisma.communication.update({
      where: { id: communication.id },
      data: {
        status: CommunicationStatus.FAILED,
        metadata: mergeMetadata(communication.metadata as Record<string, unknown> | null, {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
    });
    throw error;
  }
}

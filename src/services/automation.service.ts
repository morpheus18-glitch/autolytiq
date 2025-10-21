import {
  ActivityStatus,
  ActivityType,
  AppointmentStatus,
  AppointmentType,
  AutomationExecutionStatus,
  LeadPriority,
  LeadSource,
  LeadStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { z } from 'zod';
import { getTenantId, prisma } from '../lib/prisma.js';
import { sendSmsMessage, sendEmailMessage } from './communication.service.js';
import { createActivity } from './activity.service.js';

const automationTriggerTypeSchema = z.enum([
  'NEW_LEAD',
  'LEAD_SCORE_DELTA',
  'NEGATIVE_SENTIMENT',
  'APPOINTMENT_CREATED',
  'APPOINTMENT_COMPLETED',
  'APPOINTMENT_NO_SHOW',
  'BIRTHDAY',
  'ANNIVERSARY',
  'SERVICE_DUE',
]);

export type AutomationTriggerType = z.infer<typeof automationTriggerTypeSchema>;

const sentimentSchema = z.enum(['NEGATIVE', 'NEUTRAL', 'POSITIVE']);

type SentimentValue = z.infer<typeof sentimentSchema>;

const automationTriggerSchema = z.object({
  type: automationTriggerTypeSchema,
  filters: z
    .object({
      sources: z.array(z.nativeEnum(LeadSource)).optional(),
      minScore: z.number().optional(),
      minScoreDelta: z.number().optional(),
      sentiments: z.array(sentimentSchema).optional(),
      appointmentStatuses: z.array(z.nativeEnum(AppointmentStatus)).optional(),
      appointmentTypes: z.array(z.nativeEnum(AppointmentType)).optional(),
      leadStatuses: z.array(z.nativeEnum(LeadStatus)).optional(),
      tags: z.array(z.string().trim().min(1)).optional(),
    })
    .default({}),
});

type AutomationTriggerDefinition = z.infer<typeof automationTriggerSchema>;

const recipientTargetSchema = z.enum(['LEAD', 'CUSTOMER', 'ASSIGNEE', 'CUSTOM']);
const userTargetSchema = z.enum(['ASSIGNEE', 'CUSTOM']);

const sendSmsActionSchema = z.object({
  type: z.literal('SEND_SMS'),
  params: z.object({
    target: recipientTargetSchema.default('LEAD'),
    message: z.string().trim().min(1),
    customPhone: z.string().trim().min(5).optional(),
  }),
});

const sendEmailActionSchema = z.object({
  type: z.literal('SEND_EMAIL'),
  params: z.object({
    target: recipientTargetSchema.default('LEAD'),
    subject: z.string().trim().min(1),
    body: z.string().trim().min(1),
    customEmail: z.string().email().optional(),
  }),
});

const createTaskActionSchema = z.object({
  type: z.literal('CREATE_TASK'),
  params: z.object({
    subject: z.string().trim().min(1),
    description: z.string().trim().max(4000).optional(),
    dueInMinutes: z.number().int().min(0).default(0),
    assignTo: userTargetSchema.default('ASSIGNEE'),
    customUserId: z.string().trim().min(1).optional(),
  }),
});

const scheduleFollowUpActionSchema = z.object({
  type: z.literal('SCHEDULE_FOLLOW_UP'),
  params: z.object({
    dueInMinutes: z.number().int().min(1),
    subject: z.string().trim().min(1).default('Automation follow-up'),
    description: z.string().trim().max(4000).optional(),
  }),
});

const updateLeadActionSchema = z.object({
  type: z.literal('UPDATE_LEAD'),
  params: z.object({
    status: z.nativeEnum(LeadStatus).optional(),
    priority: z.nativeEnum(LeadPriority).optional(),
  }),
});

const tagLeadActionSchema = z.object({
  type: z.literal('TAG_LEAD'),
  params: z.object({
    tags: z.array(z.string().trim().min(1)).nonempty(),
  }),
});

const notifyUserActionSchema = z.object({
  type: z.literal('NOTIFY_USER'),
  params: z.object({
    target: userTargetSchema.default('ASSIGNEE'),
    customUserId: z.string().trim().min(1).optional(),
    title: z.string().trim().min(1),
    message: z.string().trim().min(1),
    url: z.string().url().optional(),
  }),
});

const startNurtureActionSchema = z.object({
  type: z.literal('START_NURTURE_SEQUENCE'),
  params: z.object({
    sequenceId: z.string().trim().min(1),
  }),
});

const automationActionSchema = z.discriminatedUnion('type', [
  sendSmsActionSchema,
  sendEmailActionSchema,
  createTaskActionSchema,
  scheduleFollowUpActionSchema,
  updateLeadActionSchema,
  tagLeadActionSchema,
  notifyUserActionSchema,
  startNurtureActionSchema,
]);

type AutomationActionDefinition = z.infer<typeof automationActionSchema>;

const automationDefinitionSchema = z.object({
  name: z.string().trim().min(1),
  trigger: automationTriggerSchema,
  actions: z.array(automationActionSchema).nonempty(),
  isActive: z.boolean().default(true),
});

const manualExecutionSchema = z.object({
  automationId: z.string().optional(),
  trigger: automationTriggerTypeSchema,
  context: z
    .object({
      leadId: z.string().optional(),
      customerId: z.string().optional(),
      appointmentId: z.string().optional(),
      score: z.number().optional(),
      scoreDelta: z.number().optional(),
      sentiment: sentimentSchema.optional(),
      occurredAt: z.coerce.date().optional(),
      metadata: z.record(z.unknown()).optional(),
    })
    .default({}),
  force: z.boolean().optional(),
});

type ManualExecutionInput = z.infer<typeof manualExecutionSchema>;

const automationTriggerContextSchema = manualExecutionSchema.shape.context;

type AutomationTriggerContextInput = z.infer<typeof automationTriggerContextSchema>;

function ensureTenantId(): string {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error('Tenant context is required for automations');
  }
  return tenantId;
}

function cloneValue<T>(value: T): T {
  const globalClone = (globalThis as unknown as { structuredClone?: (input: unknown) => unknown }).structuredClone;
  if (typeof globalClone === 'function') {
    return globalClone(value) as T;
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return cloneValue(value) as Prisma.InputJsonValue;
}

const automationDebounceWindowMs = 60_000;
const automationDebounce = new Map<string, number>();

function getDebounceKey(
  tenantId: string,
  automationId: string,
  context: { leadId?: string | null; customerId?: string | null; trigger: AutomationTriggerType },
): string {
  return [tenantId, automationId, context.leadId ?? context.customerId ?? 'none', context.trigger].join(':');
}

function shouldDebounce(key: string, force?: boolean): boolean {
  if (force) {
    return false;
  }
  const last = automationDebounce.get(key);
  if (!last) {
    return false;
  }
  return Date.now() - last < automationDebounceWindowMs;
}

function recordDebounce(key: string): void {
  automationDebounce.set(key, Date.now());
}

interface LeadAutomationPayload extends Prisma.LeadGetPayload<{
  include: {
    customer: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phone: true;
        mobile: true;
        dateOfBirth: true;
        addressStreet: true;
        addressCity: true;
        addressState: true;
        addressZip: true;
      };
    };
    assignedTo: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phone: true;
      };
    };
  };
}> {}

interface CustomerAutomationPayload extends Prisma.CustomerGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    phone: true;
    mobile: true;
    dateOfBirth: true;
    tags: true;
  };
}> {}

interface AppointmentAutomationPayload extends Prisma.AppointmentGetPayload<{
  include: {
    assignedTo: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phone: true;
      };
    };
    lead: { select: { id: true } };
    customer: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        phone: true;
      };
    };
  };
}> {}

interface AutomationRuntimeContext {
  trigger: AutomationTriggerType;
  lead?: LeadAutomationPayload | null;
  customer?: CustomerAutomationPayload | null;
  appointment?: AppointmentAutomationPayload | null;
  score?: number | null;
  scoreDelta?: number | null;
  sentiment?: SentimentValue;
  occurredAt: Date;
  metadata?: Record<string, unknown>;
}

interface ActionExecutionResult {
  type: AutomationActionDefinition['type'];
  status: 'SUCCESS' | 'FAILED';
  detail?: string;
  error?: string;
}

export interface AutomationRecord {
  id: string;
  name: string;
  trigger: AutomationTriggerDefinition;
  actions: AutomationActionDefinition[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationRunSummary {
  automationId: string;
  name: string;
  status: AutomationExecutionStatus;
  actions: ActionExecutionResult[];
  skipped?: boolean;
  error?: string;
}

function renderTemplate(template: string, context: Record<string, string | null | undefined>): string {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    const value = context[key.trim()];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });
}

function buildTemplateContext(runtime: AutomationRuntimeContext): Record<string, string | null | undefined> {
  const lead = runtime.lead;
  const customer = runtime.customer ?? lead?.customer ?? null;
  const assigned = lead?.assignedTo ?? runtime.appointment?.assignedTo ?? null;
  return {
    'lead.firstName': lead?.firstName ?? null,
    'lead.lastName': lead?.lastName ?? null,
    'lead.email': lead?.email ?? null,
    'lead.phone': lead?.phone ?? null,
    'lead.fullName': lead ? `${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim() || null : null,
    'customer.firstName': customer?.firstName ?? null,
    'customer.lastName': customer?.lastName ?? null,
    'customer.email': customer?.email ?? null,
    'customer.phone': customer?.phone ?? customer?.mobile ?? null,
    'assigned.firstName': assigned?.firstName ?? null,
    'assigned.lastName': assigned?.lastName ?? null,
    'assigned.email': assigned?.email ?? null,
    trigger: runtime.trigger,
  };
}

function automationToRecord(raw: {
  id: string;
  name: string;
  trigger: Prisma.JsonValue;
  actions: Prisma.JsonValue;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AutomationRecord {
  return {
    id: raw.id,
    name: raw.name,
    trigger: automationTriggerSchema.parse(raw.trigger),
    actions: z.array(automationActionSchema).parse(raw.actions),
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

async function loadLeadContext(leadId: string): Promise<LeadAutomationPayload | null> {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          mobile: true,
          dateOfBirth: true,
          addressStreet: true,
          addressCity: true,
          addressState: true,
          addressZip: true,
          tags: true,
        },
      },
      assignedTo: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
}

async function loadCustomerContext(customerId: string): Promise<CustomerAutomationPayload | null> {
  return prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      mobile: true,
      dateOfBirth: true,
      tags: true,
    },
  });
}

async function loadAppointmentContext(appointmentId: string): Promise<AppointmentAutomationPayload | null> {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      assignedTo: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      lead: { select: { id: true } },
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });
}

async function buildRuntimeContext(
  trigger: AutomationTriggerType,
  input: ManualExecutionInput['context'],
): Promise<AutomationRuntimeContext> {
  const occurredAt = input.occurredAt ?? new Date();
  let lead: LeadAutomationPayload | null | undefined;
  if (input.leadId) {
    lead = await loadLeadContext(input.leadId);
  }

  let customer: CustomerAutomationPayload | null | undefined;
  if (input.customerId) {
    customer = await loadCustomerContext(input.customerId);
  } else if (lead?.customer?.id) {
    customer = await loadCustomerContext(lead.customer.id);
  }

  let appointment: AppointmentAutomationPayload | null | undefined;
  if (input.appointmentId) {
    appointment = await loadAppointmentContext(input.appointmentId);
  }

  return {
    trigger,
    lead: lead ?? undefined,
    customer: customer ?? undefined,
    appointment: appointment ?? undefined,
    score: input.score ?? lead?.score ?? null,
    scoreDelta: input.scoreDelta ?? null,
    sentiment: input.sentiment,
    occurredAt,
    metadata: input.metadata ?? {},
  };
}

function matchesTriggerFilters(
  definition: AutomationTriggerDefinition,
  runtime: AutomationRuntimeContext,
): boolean {
  if (definition.type !== runtime.trigger) {
    return false;
  }

  const filters = definition.filters;
  const lead = runtime.lead;
  const customer = runtime.customer ?? lead?.customer ?? null;
  const appointment = runtime.appointment ?? null;

  if (filters.sources && lead?.source && !filters.sources.includes(lead.source)) {
    return false;
  }

  if (filters.leadStatuses && lead && !filters.leadStatuses.includes(lead.status)) {
    return false;
  }

  if (filters.tags && filters.tags.length > 0) {
    const leadTags = new Set((lead?.tags ?? []) as string[]);
    const customerTagList =
      customer && typeof (customer as { tags?: unknown }).tags !== 'undefined'
        ? (((customer as { tags?: unknown }).tags ?? []) as string[])
        : [];
    const customerTags = new Set(customerTagList);
    const hasTags = filters.tags.every((tag) => leadTags.has(tag) || customerTags.has(tag));
    if (!hasTags) {
      return false;
    }
  }

  if (filters.minScore !== undefined) {
    const score = runtime.score ?? lead?.score ?? null;
    if ((score ?? -Infinity) < filters.minScore) {
      return false;
    }
  }

  if (filters.minScoreDelta !== undefined && Math.abs(runtime.scoreDelta ?? 0) < filters.minScoreDelta) {
    return false;
  }

  if (filters.sentiments && runtime.sentiment && !filters.sentiments.includes(runtime.sentiment)) {
    return false;
  }

  if (filters.appointmentStatuses && appointment && !filters.appointmentStatuses.includes(appointment.status)) {
    return false;
  }

  if (filters.appointmentTypes && appointment && !filters.appointmentTypes.includes(appointment.type)) {
    return false;
  }

  switch (definition.type) {
    case 'LEAD_SCORE_DELTA':
      if (runtime.scoreDelta === null || runtime.scoreDelta === undefined) {
        return false;
      }
      break;
    case 'NEGATIVE_SENTIMENT':
      if (runtime.sentiment !== 'NEGATIVE') {
        return false;
      }
      break;
    case 'APPOINTMENT_CREATED':
    case 'APPOINTMENT_COMPLETED':
    case 'APPOINTMENT_NO_SHOW':
      if (!appointment) {
        return false;
      }
      break;
    case 'BIRTHDAY':
    case 'ANNIVERSARY':
    case 'SERVICE_DUE':
      if (!customer && !lead) {
        return false;
      }
      break;
    default:
      break;
  }

  return true;
}

async function executeSendSms(
  action: Extract<AutomationActionDefinition, { type: 'SEND_SMS' }>,
  runtime: AutomationRuntimeContext,
): Promise<ActionExecutionResult> {
  const lead = runtime.lead;
  const customer = runtime.customer ?? lead?.customer ?? null;
  const assigned = lead?.assignedTo ?? runtime.appointment?.assignedTo ?? null;
  let phone: string | null = null;
  switch (action.params.target) {
    case 'LEAD':
      phone = lead?.phone ?? customer?.mobile ?? customer?.phone ?? null;
      break;
    case 'CUSTOMER':
      phone = customer?.mobile ?? customer?.phone ?? null;
      break;
    case 'ASSIGNEE':
      phone = assigned?.phone ?? null;
      break;
    case 'CUSTOM':
      phone = action.params.customPhone ?? null;
      break;
    default:
      phone = null;
      break;
  }

  if (!lead?.id) {
    return { type: action.type, status: 'FAILED', error: 'Lead context is required to send SMS' };
  }

  if (!phone) {
    return { type: action.type, status: 'FAILED', error: 'No phone number available for SMS delivery' };
  }

  const templateContext = buildTemplateContext(runtime);
  const body = renderTemplate(action.params.message, templateContext);

  const response = await sendSmsMessage({
    to: phone,
    body,
    leadId: lead.id,
    metadata: { automation: true },
  });

  return {
    type: action.type,
    status: 'SUCCESS',
    detail: `SMS queued with provider id ${response.communication.providerId ?? 'unknown'}`,
  };
}

async function executeSendEmail(
  action: Extract<AutomationActionDefinition, { type: 'SEND_EMAIL' }>,
  runtime: AutomationRuntimeContext,
): Promise<ActionExecutionResult> {
  const lead = runtime.lead;
  const customer = runtime.customer ?? lead?.customer ?? null;
  const assigned = lead?.assignedTo ?? runtime.appointment?.assignedTo ?? null;
  let email: string | null = null;
  switch (action.params.target) {
    case 'LEAD':
      email = lead?.email ?? customer?.email ?? null;
      break;
    case 'CUSTOMER':
      email = customer?.email ?? null;
      break;
    case 'ASSIGNEE':
      email = assigned?.email ?? null;
      break;
    case 'CUSTOM':
      email = action.params.customEmail ?? null;
      break;
    default:
      email = null;
      break;
  }

  if (!lead?.id) {
    return { type: action.type, status: 'FAILED', error: 'Lead context is required to send email' };
  }

  if (!email) {
    return { type: action.type, status: 'FAILED', error: 'No email address available for email delivery' };
  }

  const templateContext = buildTemplateContext(runtime);
  const subject = renderTemplate(action.params.subject, templateContext);
  const body = renderTemplate(action.params.body, templateContext);

  await sendEmailMessage({
    to: [email],
    subject,
    html: body,
    leadId: lead.id,
    metadata: { automation: true },
  });

  return {
    type: action.type,
    status: 'SUCCESS',
    detail: `Email queued to ${email}`,
  };
}

async function executeCreateTask(
  action: Extract<AutomationActionDefinition, { type: 'CREATE_TASK' }>,
  runtime: AutomationRuntimeContext,
): Promise<ActionExecutionResult> {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: 'FAILED', error: 'Lead context is required to create a task' };
  }

  let userId: string | undefined;
  if (action.params.assignTo === 'ASSIGNEE') {
    userId = lead.assignedTo?.id ?? undefined;
  } else if (action.params.assignTo === 'CUSTOM') {
    userId = action.params.customUserId;
  }

  const dueAt = action.params.dueInMinutes
    ? new Date(Date.now() + action.params.dueInMinutes * 60_000)
    : undefined;

  await createActivity({
    leadId: lead.id,
    userId,
    type: ActivityType.TASK,
    status: ActivityStatus.PENDING,
    subject: action.params.subject,
    description: action.params.description,
    dueAt,
  });

  return {
    type: action.type,
    status: 'SUCCESS',
    detail: `Task scheduled${userId ? ` for user ${userId}` : ''}`,
  };
}

async function executeScheduleFollowUp(
  action: Extract<AutomationActionDefinition, { type: 'SCHEDULE_FOLLOW_UP' }>,
  runtime: AutomationRuntimeContext,
): Promise<ActionExecutionResult> {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: 'FAILED', error: 'Lead context is required for follow-up scheduling' };
  }

  const dueAt = new Date(Date.now() + action.params.dueInMinutes * 60_000);

  await createActivity({
    leadId: lead.id,
    userId: lead.assignedTo?.id ?? undefined,
    type: ActivityType.FOLLOW_UP,
    status: ActivityStatus.PENDING,
    subject: action.params.subject,
    description: action.params.description,
    dueAt,
  });

  return {
    type: action.type,
    status: 'SUCCESS',
    detail: `Follow-up scheduled for ${dueAt.toISOString()}`,
  };
}

async function executeUpdateLead(
  action: Extract<AutomationActionDefinition, { type: 'UPDATE_LEAD' }>,
  runtime: AutomationRuntimeContext,
): Promise<ActionExecutionResult> {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: 'FAILED', error: 'Lead context is required to update lead status' };
  }

  const updates: Prisma.LeadUpdateInput = {};
  if (action.params.status) {
    updates.status = action.params.status;
  }
  if (action.params.priority) {
    updates.priority = action.params.priority;
  }

  if (Object.keys(updates).length === 0) {
    return { type: action.type, status: 'FAILED', error: 'No lead updates were specified' };
  }

  await prisma.lead.update({ where: { id: lead.id }, data: updates });

  return {
    type: action.type,
    status: 'SUCCESS',
    detail: `Lead updated${action.params.status ? ` status=${action.params.status}` : ''}${
      action.params.priority ? ` priority=${action.params.priority}` : ''
    }`,
  };
}

async function executeTagLead(
  action: Extract<AutomationActionDefinition, { type: 'TAG_LEAD' }>,
  runtime: AutomationRuntimeContext,
): Promise<ActionExecutionResult> {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: 'FAILED', error: 'Lead context is required to tag lead' };
  }

  const currentTags = new Set((lead.tags ?? []) as string[]);
  for (const tag of action.params.tags) {
    currentTags.add(tag);
  }

  await prisma.lead.update({
    where: { id: lead.id },
    data: { tags: Array.from(currentTags) },
  });

  return {
    type: action.type,
    status: 'SUCCESS',
    detail: `Lead tagged with ${action.params.tags.join(', ')}`,
  };
}

async function executeNotifyUser(
  action: Extract<AutomationActionDefinition, { type: 'NOTIFY_USER' }>,
  runtime: AutomationRuntimeContext,
  tenantId: string,
): Promise<ActionExecutionResult> {
  const lead = runtime.lead;
  let userId: string | undefined;
  if (action.params.target === 'ASSIGNEE') {
    userId = lead?.assignedTo?.id ?? undefined;
  } else if (action.params.target === 'CUSTOM') {
    userId = action.params.customUserId;
  }

  if (!userId) {
    return { type: action.type, status: 'FAILED', error: 'Unable to resolve notification recipient' };
  }

  await prisma.notification.create({
    data: {
      tenant: { connect: { id: tenantId } },
      user: { connect: { id: userId } },
      type: NotificationType.SYSTEM,
      title: action.params.title,
      message: action.params.message,
      actionUrl: action.params.url ?? null,
    },
  });

  return {
    type: action.type,
    status: 'SUCCESS',
    detail: `Notification queued for user ${userId}`,
  };
}

async function executeStartNurtureSequence(
  action: Extract<AutomationActionDefinition, { type: 'START_NURTURE_SEQUENCE' }>,
  runtime: AutomationRuntimeContext,
): Promise<ActionExecutionResult> {
  const lead = runtime.lead;
  if (!lead?.id) {
    return { type: action.type, status: 'FAILED', error: 'Lead context is required to start nurture sequence' };
  }

  const tag = `NURTURE:${action.params.sequenceId}`;
  const tags = new Set((lead.tags ?? []) as string[]);
  tags.add(tag);

  await prisma.lead.update({
    where: { id: lead.id },
    data: { tags: Array.from(tags), nextActionAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  await createActivity({
    leadId: lead.id,
    type: ActivityType.NOTE,
    status: ActivityStatus.COMPLETED,
    subject: 'Nurture sequence started',
    description: `Automation enrolled lead in sequence ${action.params.sequenceId}`,
  });

  return {
    type: action.type,
    status: 'SUCCESS',
    detail: `Lead enrolled into nurture sequence ${action.params.sequenceId}`,
  };
}

async function executeActionDefinition(
  action: AutomationActionDefinition,
  runtime: AutomationRuntimeContext,
  tenantId: string,
): Promise<ActionExecutionResult> {
  switch (action.type) {
    case 'SEND_SMS':
      return executeSendSms(action, runtime);
    case 'SEND_EMAIL':
      return executeSendEmail(action, runtime);
    case 'CREATE_TASK':
      return executeCreateTask(action, runtime);
    case 'SCHEDULE_FOLLOW_UP':
      return executeScheduleFollowUp(action, runtime);
    case 'UPDATE_LEAD':
      return executeUpdateLead(action, runtime);
    case 'TAG_LEAD':
      return executeTagLead(action, runtime);
    case 'NOTIFY_USER':
      return executeNotifyUser(action, runtime, tenantId);
    case 'START_NURTURE_SEQUENCE':
      return executeStartNurtureSequence(action, runtime);
    default:
      throw new Error(`Unsupported automation action: ${(action as { type: string }).type}`);
  }
}

async function recordAutomationExecution(
  tenantId: string,
  automation: AutomationRecord,
  runtime: AutomationRuntimeContext,
  status: AutomationExecutionStatus,
  actions: ActionExecutionResult[],
  error?: string,
): Promise<void> {
  await prisma.automationExecution.create({
    data: {
      tenant: { connect: { id: tenantId } },
      automation: { connect: { id: automation.id } },
      triggerType: runtime.trigger,
      status,
      context: toJson({
        leadId: runtime.lead?.id ?? null,
        customerId: runtime.customer?.id ?? null,
        appointmentId: runtime.appointment?.id ?? null,
        score: runtime.score ?? null,
        scoreDelta: runtime.scoreDelta ?? null,
        sentiment: runtime.sentiment ?? null,
        occurredAt: runtime.occurredAt.toISOString(),
      }),
      result: toJson({ actions }),
      error: error ?? null,
      completedAt: new Date(),
    },
  });
}

async function runAutomation(
  tenantId: string,
  automation: AutomationRecord,
  runtime: AutomationRuntimeContext,
  force?: boolean,
): Promise<AutomationRunSummary> {
  const key = getDebounceKey(tenantId, automation.id, {
    leadId: runtime.lead?.id,
    customerId: runtime.customer?.id,
    trigger: runtime.trigger,
  });

  if (shouldDebounce(key, force)) {
    await recordAutomationExecution(tenantId, automation, runtime, AutomationExecutionStatus.SKIPPED, [], 'debounced');
    return {
      automationId: automation.id,
      name: automation.name,
      status: AutomationExecutionStatus.SKIPPED,
      actions: [],
      skipped: true,
      error: 'debounced',
    };
  }

  const results: ActionExecutionResult[] = [];
  let status: AutomationExecutionStatus = AutomationExecutionStatus.SUCCESS;
  let errorMessage: string | undefined;

  for (const action of automation.actions) {
    try {
      const result = await executeActionDefinition(action, runtime, tenantId);
      results.push(result);
      if (result.status === 'FAILED') {
        status = AutomationExecutionStatus.FAILED;
        errorMessage = result.error;
        break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ type: action.type, status: 'FAILED', error: message });
      status = AutomationExecutionStatus.FAILED;
      errorMessage = message;
      break;
    }
  }

  recordDebounce(key);

  await recordAutomationExecution(tenantId, automation, runtime, status, results, errorMessage);

  return {
    automationId: automation.id,
    name: automation.name,
    status,
    actions: results,
    skipped: false,
    error: errorMessage,
  };
}

interface AutomationTriggerOptions {
  automationId?: string;
  force?: boolean;
}

export async function triggerAutomations(
  trigger: AutomationTriggerType,
  context: Partial<AutomationTriggerContextInput> | undefined,
  options?: AutomationTriggerOptions,
): Promise<AutomationRunSummary[]> {
  const tenantId = ensureTenantId();
  const parsedContext = automationTriggerContextSchema.parse(context ?? {});
  const runtime = await buildRuntimeContext(trigger, parsedContext);

  const where: Prisma.AutomationWhereInput = {
    trigger: { path: ['type'], equals: trigger },
  };

  if (options?.automationId) {
    where.id = options.automationId;
  }

  if (!options?.force) {
    where.isActive = true;
  }

  const automationsRaw = await prisma.automation.findMany({ where, orderBy: { createdAt: 'desc' } });
  const automations = automationsRaw.map(automationToRecord);

  const results: AutomationRunSummary[] = [];

  for (const automation of automations) {
    if (!options?.force && !automation.isActive) {
      continue;
    }
    if (!matchesTriggerFilters(automation.trigger, runtime)) {
      continue;
    }

    try {
      const result = await runAutomation(tenantId, automation, runtime, options?.force);
      results.push(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await recordAutomationExecution(
        tenantId,
        automation,
        runtime,
        AutomationExecutionStatus.FAILED,
        [],
        message,
      );
      results.push({
        automationId: automation.id,
        name: automation.name,
        status: AutomationExecutionStatus.FAILED,
        actions: [],
        skipped: false,
        error: message,
      });
    }
  }

  return results;
}

export async function listAutomations(): Promise<AutomationRecord[]> {
  ensureTenantId();
  const automations = await prisma.automation.findMany({ orderBy: { createdAt: 'desc' } });
  return automations.map(automationToRecord);
}

export async function createAutomation(input: unknown): Promise<AutomationRecord> {
  const tenantId = ensureTenantId();
  const payload = automationDefinitionSchema.parse(input);
  const created = await prisma.automation.create({
    data: {
      tenant: { connect: { id: tenantId } },
      name: payload.name,
      trigger: toJson(payload.trigger),
      actions: toJson(payload.actions),
      isActive: payload.isActive,
    },
  });
  return automationToRecord(created);
}

export async function updateAutomation(id: string, input: unknown): Promise<AutomationRecord> {
  ensureTenantId();
  const payload = automationDefinitionSchema.parse(input);
  const updated = await prisma.automation.update({
    where: { id },
    data: {
      name: payload.name,
      trigger: toJson(payload.trigger),
      actions: toJson(payload.actions),
      isActive: payload.isActive,
    },
  });
  return automationToRecord(updated);
}

const togglePayloadSchema = z.object({ isActive: z.boolean().optional() });

export async function toggleAutomation(id: string, input: unknown): Promise<AutomationRecord> {
  ensureTenantId();
  const payload = togglePayloadSchema.parse(input ?? {});
  const existing = await prisma.automation.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Automation not found'), { status: 404 });
  }

  const updated = await prisma.automation.update({
    where: { id },
    data: { isActive: payload.isActive ?? !existing.isActive },
  });

  return automationToRecord(updated);
}

export async function executeAutomation(input: unknown): Promise<AutomationRunSummary[]> {
  const payload = manualExecutionSchema.parse(input ?? {});
  return triggerAutomations(payload.trigger, payload.context, {
    automationId: payload.automationId,
    force: payload.force,
  });
}

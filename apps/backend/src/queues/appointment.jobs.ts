import { Queue, Worker, type JobsOptions } from 'bullmq';
import { Redis } from 'ioredis';
import cron from 'node-cron';
import { addHours, addMinutes, differenceInMilliseconds } from 'date-fns';
import { ActivityStatus, ActivityType, AppointmentStatus, type Prisma } from '@prisma/client';
import { env } from '../config/env';
import { prisma, runWithTenant } from '../lib/prisma';
import {
  appointmentInclude,
  type AppointmentWithRelations,
} from '../services/appointment.types';
import {
  sendCustomerReminderEmail,
  sendCustomerReminderSms,
  sendSalespersonReminderEmail,
  sendSalespersonReminderSms,
  sendPostAppointmentSurvey,
} from '../services/notification.service';

export type AppointmentJobName =
  | 'sendAppointmentReminderEmail'
  | 'sendAppointmentReminderSMS'
  | 'postAppointmentFollowup';

interface AppointmentReminderJobData {
  appointmentId: string;
  tenantId: string;
  audience: 'customer' | 'sales';
  offset: '24h' | '2h' | '30m';
}

interface AppointmentFollowupJobData {
  appointmentId: string;
  tenantId: string;
  runAfter?: string;
}

export type AppointmentJobData = AppointmentReminderJobData | AppointmentFollowupJobData;

export interface AppointmentJobScheduleOptions {
  reminders?: boolean;
  followUp?: boolean;
}

const QUEUE_NAME = 'appointments';
const redisUrl = env.REDIS_URL;

let queue: Queue<AppointmentJobData> | undefined;
let worker: Worker<AppointmentJobData> | undefined;
let redisConnection: Redis | undefined;

interface FallbackJob {
  id: string;
  name: AppointmentJobName;
  data: AppointmentJobData;
  runAt: Date;
}

const fallbackJobs = new Map<string, FallbackJob>();
let fallbackTask: cron.ScheduledTask | undefined;

const ACTIVE_REMINDER_STATUSES = new Set<AppointmentStatus>([
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.CONFIRMED,
]);

function buildJobId(name: AppointmentJobName, data: AppointmentJobData): string {
  if (name === 'postAppointmentFollowup') {
    return `${data.appointmentId}:post`;
  }

  const reminder = data as AppointmentReminderJobData;
  const channel = name === 'sendAppointmentReminderEmail' ? 'email' : 'sms';
  return `${reminder.appointmentId}:${channel}:${reminder.audience}:${reminder.offset}`;
}

function getDelay(target: Date): number {
  const diff = differenceInMilliseconds(target, new Date());
  return diff > 0 ? diff : 0;
}

async function loadAppointment(
  tenantId: string,
  appointmentId: string,
): Promise<AppointmentWithRelations | null> {
  return runWithTenant(tenantId, () =>
    prisma.appointment.findUnique({ where: { id: appointmentId }, include: appointmentInclude }),
  );
}

function resolveContactInfo(appointment: AppointmentWithRelations) {
  const customerRecord =
    appointment.customer ?? appointment.lead?.customer ?? undefined;
  const leadRecord = appointment.lead ?? undefined;

  const customerName = customerRecord
    ? `${customerRecord.firstName ?? ''} ${customerRecord.lastName ?? ''}`.trim()
    : leadRecord
      ? `${leadRecord.firstName ?? ''} ${leadRecord.lastName ?? ''}`.trim()
      : undefined;

  const customerEmail = customerRecord?.email ?? leadRecord?.email ?? undefined;
  const customerPhone =
    customerRecord?.mobile ??
    customerRecord?.phone ??
    leadRecord?.phone ??
    undefined;

  const salesperson = appointment.assignedTo ?? undefined;
  const salespersonName = salesperson
    ? `${salesperson.firstName} ${salesperson.lastName}`.trim()
    : undefined;
  const salespersonEmail = salesperson?.email ?? undefined;
  const salespersonPhone = salesperson?.phone ?? undefined;

  const vehicle = appointment.vehicle;
  const vehicleLabel = vehicle
    ? [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
        .filter((value) => value !== null && value !== undefined && String(value).length > 0)
        .join(' ')
    : undefined;

  return {
    customerName: customerName && customerName.length > 0 ? customerName : undefined,
    customerEmail,
    customerPhone,
    salespersonName,
    salespersonEmail,
    salespersonPhone,
    vehicleLabel,
  };
}

async function handleReminderEmailJob(data: AppointmentReminderJobData) {
  const appointment = await loadAppointment(data.tenantId, data.appointmentId);
  if (!appointment) {
    return;
  }

  const contacts = resolveContactInfo(appointment);
  if (data.audience === 'customer') {
    if (data.offset === '30m') {
      return;
    }
    if (!contacts.customerEmail) {
      return;
    }

    await sendCustomerReminderEmail(
      {
        appointment,
        customerEmail: contacts.customerEmail,
        customerName: contacts.customerName,
        vehicleLabel: contacts.vehicleLabel,
      },
      data.offset,
    );
    return;
  }

  if (data.offset !== '30m') {
    return;
  }
  if (!contacts.salespersonEmail) {
    return;
  }

  await sendSalespersonReminderEmail(
    {
      appointment,
      salespersonEmail: contacts.salespersonEmail,
      salespersonName: contacts.salespersonName,
    },
    data.offset,
  );
}

async function handleReminderSmsJob(data: AppointmentReminderJobData) {
  const appointment = await loadAppointment(data.tenantId, data.appointmentId);
  if (!appointment) {
    return;
  }

  const contacts = resolveContactInfo(appointment);
  if (data.audience === 'customer') {
    if (data.offset === '30m') {
      return;
    }
    if (!contacts.customerPhone) {
      return;
    }

    await sendCustomerReminderSms(
      {
        appointment,
        customerPhone: contacts.customerPhone,
        customerName: contacts.customerName,
      },
      data.offset,
    );
    return;
  }

  if (data.offset !== '30m') {
    return;
  }
  if (!contacts.salespersonPhone) {
    return;
  }

  await sendSalespersonReminderSms(
    {
      appointment,
      salespersonPhone: contacts.salespersonPhone,
      salespersonName: contacts.salespersonName,
    },
    data.offset,
  );
}

async function ensureFollowUpTask(
  tenantId: string,
  appointment: AppointmentWithRelations,
) {
  if (appointment.followUpTaskId) {
    return;
  }

  const subject = `Follow up on ${appointment.title}`;
  const dueAt = addHours(appointment.endAt ?? addMinutes(appointment.startAt, 60), 24);
  const customerId = appointment.customerId ?? appointment.lead?.customer?.id ?? undefined;

  const activityData: Prisma.ActivityUncheckedCreateInput = {
    tenantId,
    leadId: appointment.leadId ?? null,
    customerId: customerId ?? null,
    userId: appointment.assignedToId ?? null,
    type: ActivityType.FOLLOW_UP,
    status: ActivityStatus.PENDING,
    subject,
    description: 'Automated follow-up generated from appointment completion.',
    dueAt,
  };

  const activity = await runWithTenant(tenantId, () => prisma.activity.create({ data: activityData }));

  await runWithTenant(tenantId, () =>
    prisma.appointment.update({
      where: { id: appointment.id },
      data: { followUpTask: { connect: { id: activity.id } } },
    }),
  );
}

async function handleFollowupJob(data: AppointmentFollowupJobData) {
  const appointment = await loadAppointment(data.tenantId, data.appointmentId);
  if (!appointment) {
    return;
  }

  await ensureFollowUpTask(data.tenantId, appointment);

  if (appointment.status !== AppointmentStatus.COMPLETED) {
    return;
  }

  const contacts = resolveContactInfo(appointment);
  if (contacts.customerEmail) {
    await sendPostAppointmentSurvey({
      appointment,
      customerEmail: contacts.customerEmail,
      customerName: contacts.customerName,
    });
  }
}

async function processAppointmentJob(name: AppointmentJobName, data: AppointmentJobData) {
  if (name === 'sendAppointmentReminderEmail') {
    await handleReminderEmailJob(data as AppointmentReminderJobData);
    return;
  }

  if (name === 'sendAppointmentReminderSMS') {
    await handleReminderSmsJob(data as AppointmentReminderJobData);
    return;
  }

  if (name === 'postAppointmentFollowup') {
    await handleFollowupJob(data as AppointmentFollowupJobData);
  }
}

function scheduleFallbackProcessor() {
  if (fallbackTask) {
    return;
  }

  fallbackTask = cron.schedule('* * * * *', async () => {
    const now = new Date();
    const dueJobs = Array.from(fallbackJobs.values()).filter((job) => job.runAt <= now);

    for (const job of dueJobs) {
      fallbackJobs.delete(job.id);
      try {
        await processAppointmentJob(job.name, job.data);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to execute fallback job', job.name, job.id, error);
      }
    }
  });
}

async function enqueueJob(
  name: AppointmentJobName,
  data: AppointmentJobData,
  runAt: Date,
): Promise<void> {
  const jobId = buildJobId(name, data);

  if (queue) {
    const options: JobsOptions = {
      jobId,
      delay: getDelay(runAt),
      removeOnComplete: true,
      removeOnFail: true,
    };
    await queue.add(name, data, options);
    return;
  }

  fallbackJobs.set(jobId, { id: jobId, name, data, runAt });
  scheduleFallbackProcessor();
}

async function removeJob(jobId: string): Promise<void> {
  if (queue) {
    await queue.remove(jobId).catch(() => undefined);
    return;
  }

  fallbackJobs.delete(jobId);
}

async function scheduleReminderJobs(appointment: AppointmentWithRelations) {
  if (!ACTIVE_REMINDER_STATUSES.has(appointment.status)) {
    return;
  }

  const now = new Date();
  if (appointment.startAt <= now) {
    return;
  }

  const contacts = resolveContactInfo(appointment);
  const startAt = appointment.startAt;

  if (contacts.customerEmail) {
    const runAt = addHours(startAt, -24);
    if (runAt > now) {
      await enqueueJob(
        'sendAppointmentReminderEmail',
        { appointmentId: appointment.id, tenantId: appointment.tenantId, audience: 'customer', offset: '24h' },
        runAt,
      );
    }
  }

  if (contacts.customerPhone) {
    const runAt = addHours(startAt, -2);
    if (runAt > now) {
      await enqueueJob(
        'sendAppointmentReminderSMS',
        { appointmentId: appointment.id, tenantId: appointment.tenantId, audience: 'customer', offset: '2h' },
        runAt,
      );
    }
  }

  if (contacts.salespersonEmail) {
    const runAt = addMinutes(startAt, -30);
    if (runAt > now) {
      await enqueueJob(
        'sendAppointmentReminderEmail',
        { appointmentId: appointment.id, tenantId: appointment.tenantId, audience: 'sales', offset: '30m' },
        runAt,
      );
    }
  }

  if (contacts.salespersonPhone) {
    const runAt = addMinutes(startAt, -30);
    if (runAt > now) {
      await enqueueJob(
        'sendAppointmentReminderSMS',
        { appointmentId: appointment.id, tenantId: appointment.tenantId, audience: 'sales', offset: '30m' },
        runAt,
      );
    }
  }
}

async function scheduleFollowupJob(appointment: AppointmentWithRelations) {
  if (appointment.status === AppointmentStatus.CANCELLED) {
    return;
  }

  const now = new Date();
  const baseEnd = appointment.endAt ?? addMinutes(appointment.startAt, 60);
  const runAt = addMinutes(baseEnd, 15);

  if (runAt <= now) {
    await processAppointmentJob('postAppointmentFollowup', {
      appointmentId: appointment.id,
      tenantId: appointment.tenantId,
      runAfter: now.toISOString(),
    });
    return;
  }

  await enqueueJob(
    'postAppointmentFollowup',
    { appointmentId: appointment.id, tenantId: appointment.tenantId, runAfter: runAt.toISOString() },
    runAt,
  );
}

async function cancelReminderJobs(appointmentId: string) {
  const prefixes = ['email:customer:24h', 'sms:customer:2h', 'email:sales:30m', 'sms:sales:30m'];
  const removals = prefixes.map((prefix) => removeJob(`${appointmentId}:${prefix}`));
  await Promise.all(removals);
}

async function cancelFollowupJob(appointmentId: string) {
  await removeJob(`${appointmentId}:post`);
}

export function initializeAppointmentJobs(): void {
  if (redisUrl) {
    redisConnection = new Redis(redisUrl);
    queue = new Queue<AppointmentJobData>(QUEUE_NAME, { connection: redisConnection });
    worker = new Worker<AppointmentJobData>(
      QUEUE_NAME,
      async (job) => {
        await processAppointmentJob(job.name as AppointmentJobName, job.data);
      },
      { connection: redisConnection },
    );

    worker.on('error', (error) => {
      // eslint-disable-next-line no-console
      console.error('Appointment queue worker error', error);
    });
  } else {
    scheduleFallbackProcessor();
  }
}

export async function shutdownAppointmentJobs(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = undefined;
  }

  if (queue) {
    await queue.close();
    queue = undefined;
  }

  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = undefined;
  }

  if (fallbackTask) {
    fallbackTask.stop();
    fallbackTask = undefined;
  }

  fallbackJobs.clear();
}

export async function scheduleAppointmentJobs(
  appointment: AppointmentWithRelations,
  options: AppointmentJobScheduleOptions = {},
): Promise<void> {
  const { reminders = true, followUp = true } = options;

  if (reminders) {
    await cancelReminderJobs(appointment.id);
    await scheduleReminderJobs(appointment);
  }

  if (followUp) {
    await cancelFollowupJob(appointment.id);
    await scheduleFollowupJob(appointment);
  }
}

export async function cancelAppointmentJobs(
  appointmentId: string,
  options: AppointmentJobScheduleOptions = {},
): Promise<void> {
  const { reminders = true, followUp = true } = options;

  const operations: Promise<void>[] = [];

  if (reminders) {
    operations.push(cancelReminderJobs(appointmentId));
  }

  if (followUp) {
    operations.push(cancelFollowupJob(appointmentId));
  }

  await Promise.all(operations);
}

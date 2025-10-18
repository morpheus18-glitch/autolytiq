import type { AppointmentWithRelations } from './appointment.types.js';
import { sendEmail } from './sendgrid.service.js';
import { normalizePhoneNumber, sendSms } from './twilio.service.js';

function formatDateTime(date: Date, timeZone: string, options?: Intl.DateTimeFormatOptions): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
    ...options,
  });

  return formatter.format(date);
}

function resolveTimeZone(appointment: AppointmentWithRelations): string {
  return appointment.timeZone ?? 'UTC';
}

function buildAppointmentSummary(appointment: AppointmentWithRelations) {
  const timeZone = resolveTimeZone(appointment);
  const startLabel = formatDateTime(appointment.startAt, timeZone);
  const endLabel = appointment.endAt ? formatDateTime(appointment.endAt, timeZone) : undefined;
  const location = appointment.location ?? 'Dealership';
  const vehicle = appointment.vehicle
    ? [appointment.vehicle.year, appointment.vehicle.make, appointment.vehicle.model, appointment.vehicle.trim]
        .filter((value) => value !== null && value !== undefined && String(value).length > 0)
        .join(' ')
    : undefined;

  const customerRecord = appointment.customer ?? appointment.lead?.customer ?? undefined;
  const leadRecord = appointment.lead ?? undefined;

  const customerName = customerRecord
    ? `${customerRecord.firstName ?? ''} ${customerRecord.lastName ?? ''}`.trim()
    : leadRecord
      ? `${leadRecord.firstName ?? ''} ${leadRecord.lastName ?? ''}`.trim()
      : undefined;

  const salesperson = appointment.assignedTo;
  const salespersonName = salesperson
    ? `${salesperson.firstName} ${salesperson.lastName}`.trim()
    : undefined;

  return {
    timeZone,
    startLabel,
    endLabel,
    location,
    vehicle,
    customerName: customerName && customerName.length > 0 ? customerName : 'there',
    salespersonName,
  };
}

function buildVehicleLine(vehicle?: string): string {
  return vehicle ? `<p><strong>Vehicle:</strong> ${vehicle}</p>` : '';
}

function sanitizePhone(value: string): string {
  return normalizePhoneNumber(value);
}

export async function sendCustomerReminderEmail(
  context: {
    appointment: AppointmentWithRelations;
    customerEmail: string;
    customerName?: string;
    vehicleLabel?: string;
  },
  offset: '24h' | '2h',
): Promise<void> {
  const summary = buildAppointmentSummary(context.appointment);
  const greetingName = context.customerName ?? summary.customerName;

  const subject =
    offset === '24h'
      ? `Reminder: Your appointment on ${summary.startLabel}`
      : `Reminder: Your appointment today at ${summary.startLabel}`;

  const html = `
    <p>Hi ${greetingName || 'there'},</p>
    <p>This is a reminder about your ${context.appointment.type.toLowerCase().replace(/_/g, ' ')} appointment.</p>
    <p><strong>When:</strong> ${summary.startLabel}${summary.endLabel ? ` &ndash; ${summary.endLabel}` : ''}</p>
    <p><strong>Where:</strong> ${summary.location}</p>
    ${buildVehicleLine(context.vehicleLabel ?? summary.vehicle)}
    <p>If you need to reschedule, please reply to this email or call us at your earliest convenience.</p>
    <p>We look forward to seeing you!</p>
  `;

  const text = `Hi ${greetingName || 'there'}, this is a reminder about your upcoming appointment on ${summary.startLabel} at ${summary.location}.`;

  await sendEmail({
    to: [context.customerEmail],
    subject,
    html,
    text,
  });
}

export async function sendCustomerReminderSms(
  context: {
    appointment: AppointmentWithRelations;
    customerPhone: string;
    customerName?: string;
  },
  offset: '24h' | '2h',
): Promise<void> {
  const summary = buildAppointmentSummary(context.appointment);
  const greetingName = context.customerName ?? summary.customerName;
  const whenLabel = offset === '24h' ? summary.startLabel : `today at ${summary.startLabel}`;

  const message = `Reminder: ${greetingName || 'Hi'}, your appointment is ${whenLabel} at ${summary.location}. Reply if you need to make changes.`;

  await sendSms({ to: sanitizePhone(context.customerPhone), body: message });
}

export async function sendSalespersonReminderEmail(
  context: {
    appointment: AppointmentWithRelations;
    salespersonEmail: string;
    salespersonName?: string;
  },
  _offset: '30m',
): Promise<void> {
  const summary = buildAppointmentSummary(context.appointment);
  const greeting = context.salespersonName ?? summary.salespersonName ?? 'team';

  const subject = `Upcoming appointment in 30 minutes: ${summary.customerName}`;
  const html = `
    <p>Hi ${greeting},</p>
    <p>This is a heads-up that your appointment with ${summary.customerName} begins at ${summary.startLabel}.</p>
    <p><strong>Location:</strong> ${summary.location}</p>
    ${buildVehicleLine(summary.vehicle)}
    <p>Please ensure the guest is greeted promptly and prepared for their visit.</p>
  `;
  const text = `Reminder: Appointment with ${summary.customerName} at ${summary.startLabel} in ${summary.location}.`;

  await sendEmail({
    to: [context.salespersonEmail],
    subject,
    html,
    text,
  });
}

export async function sendSalespersonReminderSms(
  context: {
    appointment: AppointmentWithRelations;
    salespersonPhone: string;
    salespersonName?: string;
  },
  _offset: '30m',
): Promise<void> {
  const summary = buildAppointmentSummary(context.appointment);
  const greeting = context.salespersonName ?? summary.salespersonName ?? 'Team';

  const message = `${greeting}: appointment with ${summary.customerName} at ${summary.startLabel} (${summary.location}).`;

  await sendSms({ to: sanitizePhone(context.salespersonPhone), body: message });
}

export async function sendPostAppointmentSurvey(context: {
  appointment: AppointmentWithRelations;
  customerEmail: string;
  customerName?: string;
}): Promise<void> {
  const summary = buildAppointmentSummary(context.appointment);
  const greeting = context.customerName ?? summary.customerName ?? 'there';

  const subject = 'Thanks for visiting — how did we do?';
  const html = `
    <p>Hi ${greeting},</p>
    <p>Thank you for taking the time to meet with us on ${summary.startLabel}. We would appreciate your feedback so we can continue improving the experience for our guests.</p>
    <p><a href="${process.env.APP_URL ?? '#'}" target="_blank" rel="noopener">Share your feedback</a></p>
    <p>If you have any follow-up questions, reply to this email and our team will reach out.</p>
  `;
  const text = `Thanks for visiting us on ${summary.startLabel}. We'd love your feedback—reply to this message with any questions.`;

  await sendEmail({
    to: [context.customerEmail],
    subject,
    html,
    text,
  });
}

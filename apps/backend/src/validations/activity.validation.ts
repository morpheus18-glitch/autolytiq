import { ActivityStatus, ActivityType } from '@prisma/client';
import { z } from 'zod';

const cuidSchema = z.string().min(1);

const optionalDate = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}, z.date().optional());

export const activityListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  type: z.nativeEnum(ActivityType).optional(),
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  from: optionalDate,
  to: optionalDate,
});

export const activityCreateSchema = z.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  type: z.nativeEnum(ActivityType),
  status: z.nativeEnum(ActivityStatus).default(ActivityStatus.PENDING).optional(),
  subject: z.string().trim().max(255).optional(),
  description: z.string().trim().max(4000).optional(),
  outcome: z.string().trim().max(255).optional(),
  dueAt: z.coerce.date().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
});

export const activityUpdateSchema = activityCreateSchema.partial();

export const callActivitySchema = z
  .object({
    leadId: cuidSchema.optional(),
    customerId: cuidSchema.optional(),
    userId: cuidSchema.optional(),
    subject: z.string().trim().max(255).optional(),
    notes: z.string().trim().max(4000).optional(),
    outcome: z.string().trim().max(255).optional(),
    startedAt: z.coerce.date().optional(),
    completedAt: z.coerce.date().optional(),
    callSid: z.string().trim().max(128).optional(),
    recordingUrl: z.string().url().optional(),
    durationSeconds: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (value) => {
      if (value.startedAt && value.completedAt) {
        return value.completedAt >= value.startedAt;
      }
      return true;
    },
    { message: 'completedAt must be later than startedAt' },
  );

export const emailActivitySchema = z.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  to: z.array(z.string().email()).nonempty(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1),
  providerId: z.string().trim().max(128).optional(),
});

export const smsActivitySchema = z.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  to: z.string().trim().min(5),
  from: z.string().trim().min(5).optional(),
  body: z.string().trim().min(1).max(1600),
  providerId: z.string().trim().max(128).optional(),
});

export const noteActivitySchema = z.object({
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  subject: z.string().trim().max(255).optional(),
  body: z.string().trim().min(1).max(8000),
});

export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;
export type ActivityCreateInput = z.infer<typeof activityCreateSchema>;
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>;
export type CallActivityInput = z.infer<typeof callActivitySchema>;
export type EmailActivityInput = z.infer<typeof emailActivitySchema>;
export type SmsActivityInput = z.infer<typeof smsActivitySchema>;
export type NoteActivityInput = z.infer<typeof noteActivitySchema>;

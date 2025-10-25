import { CommunicationStatus, CommunicationType } from '@prisma/client';
import { z } from 'zod';

const cuidSchema = z.string().min(1);

const phoneSchema = z
  .string()
  .min(5)
  .transform((value) => value.replace(/[^+\d]/g, ''));

export const callRequestSchema = z.object({
  to: phoneSchema,
  from: phoneSchema.optional(),
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  twimlUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const smsRequestSchema = z.object({
  to: phoneSchema,
  from: phoneSchema.optional(),
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  userId: cuidSchema.optional(),
  body: z.string().trim().min(1).max(1600),
  mediaUrls: z.array(z.string().url()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const emailAddressSchema = z.string().email();

const attachmentSchema = z.object({
  filename: z.string().min(1),
  content: z.string().min(1),
  type: z.string().optional(),
  disposition: z.enum(['inline', 'attachment']).optional(),
});

export const emailRequestSchema = z
  .object({
    to: z.array(emailAddressSchema).nonempty(),
    cc: z.array(emailAddressSchema).optional(),
    bcc: z.array(emailAddressSchema).optional(),
    subject: z.string().trim().min(1).max(255).optional(),
    html: z.string().trim().optional(),
    text: z.string().trim().optional(),
    templateId: z.string().trim().optional(),
    templateData: z.record(z.unknown()).optional(),
    attachments: z.array(attachmentSchema).optional(),
    leadId: cuidSchema.optional(),
    customerId: cuidSchema.optional(),
    userId: cuidSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine(
    (value) => {
      if (value.templateId) {
        return Boolean(value.templateData || value.subject || value.html || value.text);
      }
      return Boolean(value.subject && (value.html || value.text));
    },
    {
      message: 'Email subject and content are required for ad-hoc emails, or templateId with data for templates.',
      path: ['subject'],
    },
  );

export const inboxQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  type: z
    .union([z.nativeEnum(CommunicationType), z.array(z.nativeEnum(CommunicationType))])
    .optional(),
  status: z
    .union([z.nativeEnum(CommunicationStatus), z.array(z.nativeEnum(CommunicationStatus))])
    .optional(),
  leadId: cuidSchema.optional(),
  customerId: cuidSchema.optional(),
  search: z.string().trim().optional(),
  from: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
  to: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
});

export const callLogQuerySchema = inboxQuerySchema.pick({
  page: true,
  pageSize: true,
  leadId: true,
  customerId: true,
  from: true,
  to: true,
});

export type CallRequestInput = z.infer<typeof callRequestSchema>;
export type SmsRequestInput = z.infer<typeof smsRequestSchema>;
export type EmailRequestInput = z.infer<typeof emailRequestSchema>;
export type InboxQueryInput = z.infer<typeof inboxQuerySchema>;
export type CallLogQueryInput = z.infer<typeof callLogQuerySchema>;

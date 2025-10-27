import { z } from 'zod';
import { apiRequest } from './queryClient';

export const documentTemplateSchema = z.object({
  id: z.string(),
  type: z.literal('DOCUMENT'),
  name: z.string(),
  content: z.string(),
  updatedAt: z.string(),
});

export const emailTemplateSchema = z.object({
  id: z.string(),
  type: z.literal('EMAIL'),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
  updatedAt: z.string(),
});

export const smsTemplateSchema = z.object({
  id: z.string(),
  type: z.literal('SMS'),
  name: z.string(),
  message: z.string(),
  updatedAt: z.string(),
});

export const templateUnionSchema = z.discriminatedUnion('type', [
  documentTemplateSchema,
  emailTemplateSchema,
  smsTemplateSchema,
]);

export const templatesResponseSchema = z.object({
  documents: z.array(documentTemplateSchema),
  emails: z.array(emailTemplateSchema),
  sms: z.array(smsTemplateSchema),
});

export type DocumentTemplate = z.infer<typeof documentTemplateSchema>;
export type EmailTemplate = z.infer<typeof emailTemplateSchema>;
export type SmsTemplate = z.infer<typeof smsTemplateSchema>;
export type TemplateUnion = z.infer<typeof templateUnionSchema>;
export type TemplatesResponse = z.infer<typeof templatesResponseSchema>;

type BaseUpdatePayload = {
  id: string;
  name: string;
  updatedAt?: string;
};

type DocumentUpdatePayload = BaseUpdatePayload & {
  type: 'DOCUMENT';
  content: string;
};

type EmailUpdatePayload = BaseUpdatePayload & {
  type: 'EMAIL';
  subject: string;
  body: string;
};

type SmsUpdatePayload = BaseUpdatePayload & {
  type: 'SMS';
  message: string;
};

export type UpdateTemplatePayload = DocumentUpdatePayload | EmailUpdatePayload | SmsUpdatePayload;

export async function updateTemplate(payload: UpdateTemplatePayload): Promise<TemplateUnion> {
  const { id, ...body } = payload;
  const response = await apiRequest('PUT', `/api/settings/templates/${id}`, body);
  const contentType = response.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    const data = await response.json();
    const parsed = templateUnionSchema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }
  }

  const fallbackUpdatedAt = payload.updatedAt ?? new Date().toISOString();

  switch (payload.type) {
    case 'DOCUMENT':
      return {
        id: payload.id,
        type: 'DOCUMENT',
        name: payload.name,
        content: payload.content,
        updatedAt: fallbackUpdatedAt,
      } satisfies DocumentTemplate;
    case 'EMAIL':
      return {
        id: payload.id,
        type: 'EMAIL',
        name: payload.name,
        subject: payload.subject,
        body: payload.body,
        updatedAt: fallbackUpdatedAt,
      } satisfies EmailTemplate;
    case 'SMS':
    default:
      return {
        id: payload.id,
        type: 'SMS',
        name: payload.name,
        message: payload.message,
        updatedAt: fallbackUpdatedAt,
      } satisfies SmsTemplate;
  }
}

export async function previewTemplateHtml(templateId: string): Promise<{ html: string }> {
  const response = await apiRequest('POST', `/api/settings/templates/${templateId}/preview`, {
    format: 'html',
  });

  const contentType = response.headers.get('Content-Type') ?? '';
  if (contentType.includes('application/json')) {
    const data = await response.json();
    if (typeof data === 'string') {
      return { html: data };
    }
    if (data && typeof data === 'object' && 'html' in data && typeof data.html === 'string') {
      return { html: data.html };
    }
  }

  const html = await response.text();
  return { html };
}

export async function downloadTemplatePdf(templateId: string): Promise<Blob> {
  const response = await apiRequest('POST', `/api/settings/templates/${templateId}/preview`, {
    format: 'pdf',
  });

  return await response.blob();
}

type TestEmailPayload = {
  id: string;
  channel: 'EMAIL';
  recipient: string;
  subject: string;
  body: string;
};

type TestSmsPayload = {
  id: string;
  channel: 'SMS';
  recipient: string;
  message: string;
};

export type TestTemplatePayload = TestEmailPayload | TestSmsPayload;

export async function testSendTemplate(payload: TestTemplatePayload): Promise<void> {
  const { id, ...body } = payload;
  const response = await apiRequest('POST', `/api/settings/templates/${id}/test-send`, body);
  const contentType = response.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    await response.json();
    return;
  }

  if (contentType.includes('text/plain') || contentType.includes('text/html')) {
    await response.text();
  }
}

import sgMail, { type MailDataRequired } from '@sendgrid/mail';
import { env } from '../config/env.js';

type AttachmentInput = {
  filename: string;
  content: string;
  type?: string;
  disposition?: 'inline' | 'attachment';
};

type EmailOptions = {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  attachments?: AttachmentInput[];
};

let initialized = false;

function ensureInitialized() {
  if (!initialized) {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
    initialized = true;
  }
}

function applyMergeFields(content: string | undefined, data: Record<string, unknown> | undefined) {
  if (!content || !data) {
    return content;
  }

  return content.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key: string) => {
    const value = data[key];
    return value === undefined || value === null ? '' : String(value);
  });
}

export async function sendEmail(options: EmailOptions) {
  ensureInitialized();

  const payload: MailDataRequired = {
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    from: env.SENDGRID_FROM,
    subject: options.subject,
    html: applyMergeFields(options.html, options.templateData),
    text: applyMergeFields(options.text, options.templateData),
    attachments: options.attachments,
    mailSettings: {
      sandboxMode: {
        enable: process.env.NODE_ENV === 'test',
      },
    },
  } as MailDataRequired;

  if (options.templateId) {
    payload.templateId = options.templateId;
    payload.dynamicTemplateData = options.templateData;
  }

  const [response] = await sgMail.send(payload);
  const messageId = response.headers['x-message-id'] ?? response.headers['X-Message-Id'];

  return {
    statusCode: response.statusCode,
    messageId: Array.isArray(messageId) ? messageId[0] : messageId,
    headers: response.headers,
  };
}

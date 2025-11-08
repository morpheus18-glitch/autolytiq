import type { Request, Response } from 'express';
import { runWithTenant } from '../lib/prisma';
import * as webhookService from '../services/webhook.service';
import type { SendGridWebhookEvent, TwilioWebhookPayload } from '../services/webhook.service';

function resolveTenantId(req: Request): string | undefined {
  const queryTenant = typeof req.query.tenantId === 'string' ? req.query.tenantId : undefined;
  const bodyTenant = typeof req.body?.tenantId === 'string' ? req.body.tenantId : undefined;
  const bodyTenantAlt = typeof req.body?.TenantId === 'string' ? req.body.TenantId : undefined;
  return queryTenant ?? bodyTenant ?? bodyTenantAlt;
}

function isSendGridEvent(value: unknown): value is SendGridWebhookEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'event' in value &&
    typeof (value as { event?: unknown }).event === 'string'
  );
}

export async function handleTwilioWebhook(req: Request, res: Response) {
  const tenantId = resolveTenantId(req);
  if (!tenantId) {
    res.status(400).json({ message: 'tenantId is required' });
    return;
  }

  await runWithTenant(tenantId, async () => {
    const payload: TwilioWebhookPayload =
      req.body && typeof req.body === 'object' ? (req.body as TwilioWebhookPayload) : {};
    await webhookService.handleTwilioWebhook(payload);
  });

  res.type('text/xml').send('<Response></Response>');
}

export async function handleSendGridWebhook(req: Request, res: Response) {
  const tenantId = resolveTenantId(req);
  if (!tenantId) {
    res.status(400).json({ message: 'tenantId is required' });
    return;
  }

  let events: SendGridWebhookEvent[];
  try {
    events = Array.isArray(req.body)
      ? req.body.filter((item): item is SendGridWebhookEvent => isSendGridEvent(item))
      : typeof req.body === 'string'
        ? (JSON.parse(req.body) as unknown[]).filter(isSendGridEvent)
        : typeof req.body === 'object' && req.body !== null && isSendGridEvent(req.body)
          ? [req.body]
          : [];
  } catch (error) {
    res.status(400).json({ message: 'Invalid SendGrid payload', detail: error instanceof Error ? error.message : String(error) });
    return;
  }

  await runWithTenant(tenantId, async () => {
    await webhookService.handleSendGridWebhook(events);
  });

  res.json({ ok: true });
}

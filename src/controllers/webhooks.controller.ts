import type { Request, Response } from 'express';
import { runWithTenant } from '../lib/prisma.js';
import * as webhookService from '../services/webhook.service.js';

function resolveTenantId(req: Request): string | undefined {
  const queryTenant = typeof req.query.tenantId === 'string' ? req.query.tenantId : undefined;
  const bodyTenant = typeof req.body?.tenantId === 'string' ? req.body.tenantId : undefined;
  const bodyTenantAlt = typeof req.body?.TenantId === 'string' ? req.body.TenantId : undefined;
  return queryTenant ?? bodyTenant ?? bodyTenantAlt;
}

export async function handleTwilioWebhook(req: Request, res: Response) {
  const tenantId = resolveTenantId(req);
  if (!tenantId) {
    res.status(400).json({ message: 'tenantId is required' });
    return;
  }

  await runWithTenant(tenantId, async () => {
    await webhookService.handleTwilioWebhook(req.body ?? {});
  });

  res.type('text/xml').send('<Response></Response>');
}

export async function handleSendGridWebhook(req: Request, res: Response) {
  const tenantId = resolveTenantId(req);
  if (!tenantId) {
    res.status(400).json({ message: 'tenantId is required' });
    return;
  }

  let events: Array<Record<string, any>>;
  try {
    events = Array.isArray(req.body)
      ? (req.body as Array<Record<string, any>>)
      : typeof req.body === 'string'
        ? (JSON.parse(req.body) as Array<Record<string, any>>)
        : [req.body as Record<string, any>];
  } catch (error) {
    res.status(400).json({ message: 'Invalid SendGrid payload', detail: error instanceof Error ? error.message : String(error) });
    return;
  }

  await runWithTenant(tenantId, async () => {
    await webhookService.handleSendGridWebhook(events);
  });

  res.json({ ok: true });
}

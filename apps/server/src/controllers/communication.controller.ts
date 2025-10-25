import type { Request, Response } from 'express';
import {
  callRequestSchema,
  emailRequestSchema,
  inboxQuerySchema,
  smsRequestSchema,
  callLogQuerySchema,
} from '../validations/communication.validation.js';
import * as communicationService from '../services/communication.service.js';
import * as inboxService from '../services/inbox.service.js';
import { resolveHttpError } from '../utils/http-errors.js';

function ensureTenant(req: Request, res: Response): string | undefined {
  const tenantId = req.context?.tenantId;
  if (!tenantId) {
    res.status(403).json({ message: 'Tenant scope is required' });
    return undefined;
  }
  return tenantId;
}

function handleServiceError(error: unknown, res: Response, defaultMessage: string) {
  const { status, message } = resolveHttpError(error, 500, defaultMessage);
  res.status(status).json({ message });
}

export async function initiateCall(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = callRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid call request', details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await communicationService.initiateCall(parsed.data);
    res.status(201).json({ data: result });
  } catch (error) {
    handleServiceError(error, res, 'Unable to initiate call');
  }
}

export async function sendSms(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = smsRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid SMS request', details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await communicationService.sendSmsMessage(parsed.data);
    res.status(201).json({ data: result });
  } catch (error) {
    handleServiceError(error, res, 'Unable to send SMS');
  }
}

export async function sendEmail(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = emailRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid email request', details: parsed.error.flatten() });
    return;
  }

  try {
    const result = await communicationService.sendEmailMessage(parsed.data);
    res.status(201).json({ data: result });
  } catch (error) {
    handleServiceError(error, res, 'Unable to send email');
  }
}

export async function getInbox(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = inboxQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid inbox filters', details: parsed.error.flatten() });
    return;
  }

  const result = await inboxService.getInbox(parsed.data);
  res.json({ data: result.items, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, pages: result.pages } });
}

export async function getCallLogs(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = callLogQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid call log filters', details: parsed.error.flatten() });
    return;
  }

  const result = await inboxService.getCallLogs(parsed.data);
  res.json({ data: result.items, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, pages: result.pages } });
}

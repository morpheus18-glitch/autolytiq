import type { Request, Response } from 'express';
import {
  activityCreateSchema,
  activityListQuerySchema,
  activityUpdateSchema,
  callActivitySchema,
  emailActivitySchema,
  noteActivitySchema,
  smsActivitySchema,
} from '../validations/activity.validation';
import * as activityService from '../services/activity.service';
import { resolveHttpError } from '../utils/http-errors';

function ensureTenant(req: Request, res: Response): string | undefined {
  const tenantId = req.context?.tenantId;
  if (!tenantId) {
    res.status(403).json({ message: 'Tenant scope is required' });
    return undefined;
  }
  return tenantId;
}

export async function listActivities(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = activityListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid activity filters', details: parsed.error.flatten() });
    return;
  }

  const result = await activityService.listActivities(parsed.data);
  res.json({ data: result.items, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, pages: result.pages } });
}

export async function createActivity(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = activityCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid activity payload', details: parsed.error.flatten() });
    return;
  }

  const activity = await activityService.createActivity(parsed.data);
  res.status(201).json({ data: activity });
}

export async function getActivity(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  try {
    const activity = await activityService.getActivity(req.params.id);
    res.json({ data: activity });
  } catch (error) {
    const { status, message } = resolveHttpError(error, 500, 'Unable to fetch activity');
    res.status(status).json({ message });
  }
}

export async function updateActivity(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = activityUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid activity payload', details: parsed.error.flatten() });
    return;
  }

  try {
    const activity = await activityService.updateActivity(req.params.id, parsed.data);
    res.json({ data: activity });
  } catch (error) {
    const { status, message } = resolveHttpError(error, 500, 'Unable to update activity');
    res.status(status).json({ message });
  }
}

export async function logCall(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = callActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid call log payload', details: parsed.error.flatten() });
    return;
  }

  const activity = await activityService.logCallActivity(parsed.data);
  res.status(201).json({ data: activity });
}

export async function logEmail(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = emailActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid email log payload', details: parsed.error.flatten() });
    return;
  }

  const activity = await activityService.logEmailActivity(parsed.data);
  res.status(201).json({ data: activity });
}

export async function logSms(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = smsActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid SMS log payload', details: parsed.error.flatten() });
    return;
  }

  const activity = await activityService.logSmsActivity(parsed.data);
  res.status(201).json({ data: activity });
}

export async function logNote(req: Request, res: Response) {
  if (!ensureTenant(req, res)) {
    return;
  }

  const parsed = noteActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid note payload', details: parsed.error.flatten() });
    return;
  }

  const activity = await activityService.logNoteActivity(parsed.data);
  res.status(201).json({ data: activity });
}

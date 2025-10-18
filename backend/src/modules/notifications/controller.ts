import type { Request, Response } from 'express';
import { created, ok } from '../../lib/response.js';
import { Unprocessable } from '../../lib/errors.js';
import { notificationMarkReadSchema, notificationQuerySchema } from './dto.js';
import { listNotifications, markNotificationsRead } from './service.js';

export async function list(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const parsed = notificationQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw Unprocessable('Invalid notification query', parsed.error.flatten());
  }
  const notifications = await listNotifications(tenantId, userId, parsed.data);
  return ok(res, notifications);
}

export async function markRead(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const parsed = notificationMarkReadSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid mark read payload', parsed.error.flatten());
  }
  const notifications = await markNotificationsRead(tenantId, userId, parsed.data.ids);
  return created(res, notifications);
}

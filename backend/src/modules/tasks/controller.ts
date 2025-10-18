import type { Request, Response } from 'express';
import { z } from 'zod';
import { created, ok } from '../../lib/response.js';
import { Unprocessable } from '../../lib/errors.js';
import {
  taskAssignSchema,
  taskCreateSchema,
  taskMentionSchema,
  taskQuerySchema,
  taskUpdateSchema,
} from './dto.js';
import { assignTask, createTask, listTasks, mentionTask, updateTask } from './service.js';

const taskIdParamSchema = z.object({ id: z.string().min(1) });

export async function create(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const parsed = taskCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid task payload', parsed.error.flatten());
  }
  const task = await createTask(tenantId, userId, parsed.data);
  return created(res, task);
}

export async function update(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const params = taskIdParamSchema.parse(req.params);
  const parsed = taskUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid task update payload', parsed.error.flatten());
  }
  const task = await updateTask(tenantId, params.id, userId, parsed.data);
  return ok(res, task);
}

export async function assign(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const params = taskIdParamSchema.parse(req.params);
  const parsed = taskAssignSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid assignment payload', parsed.error.flatten());
  }
  const task = await assignTask(tenantId, params.id, parsed.data.assigneeId);
  return ok(res, task);
}

export async function mention(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const params = taskIdParamSchema.parse(req.params);
  const parsed = taskMentionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid mention payload', parsed.error.flatten());
  }
  const task = await mentionTask(tenantId, params.id, userId, parsed.data.message);
  return ok(res, task);
}

export async function list(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const parsed = taskQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw Unprocessable('Invalid task filters', parsed.error.flatten());
  }
  const tasks = await listTasks(tenantId, parsed.data);
  return ok(res, tasks);
}

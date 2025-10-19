import { WorkflowTaskStatus, WorkflowTaskType } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { BadRequest, NotFound } from '../../lib/errors.js';
import { emitToTenantRoom } from '../../lib/socket.js';
import type { TaskCreateInput, TaskQuery, TaskUpdateInput } from './dto.js';
import { notifyMentionedUsers } from '../pipeline/service.js';

function normalizeTags(tags?: string[]) {
  if (!tags) {
    return [] as string[];
  }
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)));
}

export async function createTask(
  tenantId: string,
  createdById: string,
  input: TaskCreateInput,
) {
  const workflow = await prisma.vehicleWorkflow.findFirst({
    where: { tenantId, id: input.workflowId },
    select: { id: true, vehicleId: true },
  });
  if (!workflow) {
    throw BadRequest('Workflow not found for task creation.');
  }

  const task = await prisma.workflowTask.create({
    data: {
      tenantId,
      workflowId: input.workflowId,
      stageId: input.stageId,
      vehicleId: input.vehicleId,
      title: input.title,
      description: input.description,
      type: input.type ?? WorkflowTaskType.OTHER,
      status: input.status ?? WorkflowTaskStatus.OPEN,
      dueAt: input.dueAt,
      assigneeId: input.assigneeId,
      tags: normalizeTags(input.tags),
      mentions: input.mentions ?? [],
      checklist: input.checklist,
      costCents: input.costCents,
    },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (task.description) {
    await notifyMentionedUsers(tenantId, task.description, createdById, {
      workflowId: task.workflowId,
      vehicleId: task.vehicleId,
      taskId: task.id,
    });
  }

  emitToTenantRoom(tenantId, 'pipeline.task.created', task);
  return task;
}

export async function updateTask(
  tenantId: string,
  taskId: string,
  actorId: string,
  input: TaskUpdateInput,
) {
  const existing = await prisma.workflowTask.findFirst({
    where: { tenantId, id: taskId },
    select: { id: true, workflowId: true, vehicleId: true },
  });
  if (!existing) {
    throw NotFound('Task not found.');
  }

  const task = await prisma.workflowTask.update({
    where: { id: taskId },
    data: {
      ...(input.stageId !== undefined ? { stageId: input.stageId } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.dueAt !== undefined ? { dueAt: input.dueAt } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
      ...(input.tags !== undefined ? { tags: normalizeTags(input.tags) } : {}),
      ...(input.mentions !== undefined ? { mentions: input.mentions } : {}),
      ...(input.checklist !== undefined ? { checklist: input.checklist } : {}),
      ...(input.costCents !== undefined ? { costCents: input.costCents } : {}),
    },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (input.description) {
    await notifyMentionedUsers(tenantId, input.description, actorId, {
      workflowId: task.workflowId,
      vehicleId: task.vehicleId,
      taskId: task.id,
    });
  }

  emitToTenantRoom(tenantId, 'pipeline.task.updated', task);
  return task;
}

export async function assignTask(tenantId: string, taskId: string, assigneeId: string) {
  const task = await prisma.workflowTask.update({
    where: { id: taskId, tenantId },
    data: { assigneeId },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  emitToTenantRoom(tenantId, 'pipeline.task.assigned', task);
  return task;
}

export async function mentionTask(
  tenantId: string,
  taskId: string,
  actorId: string,
  message: string,
) {
  const task = await prisma.workflowTask.findFirst({
    where: { tenantId, id: taskId },
    select: { id: true, workflowId: true, vehicleId: true, mentions: true },
  });
  if (!task) {
    throw NotFound('Task not found.');
  }

  const notifications = await notifyMentionedUsers(tenantId, message, actorId, {
    workflowId: task.workflowId,
    vehicleId: task.vehicleId,
    taskId: task.id,
  });

  const mentionedIds = notifications.map((notification) => notification.userId);
  const mentions = Array.from(new Set([...(task.mentions ?? []), ...mentionedIds]));

  const updated = await prisma.workflowTask.update({
    where: { id: taskId },
    data: { mentions },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  emitToTenantRoom(tenantId, 'pipeline.task.mentioned', { taskId, mentions: mentionedIds });
  return updated;
}

export async function listTasks(tenantId: string, query: TaskQuery) {
  const where: any = { tenantId };
  if (query.vehicleId) {
    where.vehicleId = query.vehicleId;
  }
  if (query.workflowId) {
    where.workflowId = query.workflowId;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.stageKey) {
    where.stage = { key: query.stageKey };
  }

  const tasks = await prisma.workflowTask.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
      stage: { select: { id: true, key: true, name: true } },
    },
  });

  return tasks;
}

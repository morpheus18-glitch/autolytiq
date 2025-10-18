import { differenceInMinutes } from 'date-fns';
import { NotificationType, Prisma, WorkflowTaskStatus, WorkflowTaskType } from '@prisma/client';
import prisma from '../../lib/prisma.js';
import { BadRequest, NotFound } from '../../lib/errors.js';
import { emitToTenantRoom } from '../../lib/socket.js';
import type {
  BoardQuery,
  MoveStageInput,
  PipelineBoardResponse,
  PipelineBoardStageColumn,
  PipelineBoardVehicleCard,
  PipelineTimelineEvent,
  PipelineTimelineResponse,
} from './dto.js';

const DEFAULT_PIPELINE_START_STAGE = 'ACQUISITION';
const SLA_AT_RISK_THRESHOLD = 0.75;

function resolveSlaStatus(minutes: number, slaHours?: number | null): 'ON_TRACK' | 'AT_RISK' | 'BREACHED' {
  if (!slaHours || slaHours <= 0) {
    return 'ON_TRACK';
  }
  const slaMinutes = slaHours * 60;
  if (minutes >= slaMinutes) {
    return 'BREACHED';
  }
  if (minutes >= slaMinutes * SLA_AT_RISK_THRESHOLD) {
    return 'AT_RISK';
  }
  return 'ON_TRACK';
}

async function getActiveDefinition(tenantId: string) {
  const definition = await prisma.workflowDefinition.findFirst({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
    include: { stages: { orderBy: { position: 'asc' } } },
  });
  if (!definition) {
    throw NotFound('No workflow definition configured for tenant.');
  }
  if (definition.stages.length === 0) {
    throw BadRequest('Workflow definition is missing stages.');
  }
  return definition;
}

export async function startVehicleWorkflow(
  tenantId: string,
  vehicleId: string,
  initiatedByUserId: string,
) {
  const existing = await prisma.vehicleWorkflow.findFirst({ where: { tenantId, vehicleId } });
  if (existing) {
    return existing;
  }

  const definition = await getActiveDefinition(tenantId);
  const startStage = definition.stages.find((stage) => stage.key === DEFAULT_PIPELINE_START_STAGE);
  if (!startStage) {
    throw BadRequest(`Workflow definition missing ${DEFAULT_PIPELINE_START_STAGE} stage.`);
  }

  const now = new Date();

  const workflow = await prisma.$transaction(async (tx) => {
    const created = await tx.vehicleWorkflow.create({
      data: {
        tenantId,
        vehicleId,
        definitionId: definition.id,
        currentStageId: startStage.id,
        startedAt: now,
        transitions: {
          create: {
            tenantId,
            toStageId: startStage.id,
            byUserId: initiatedByUserId,
            at: now,
            note: 'Pipeline initiated',
          },
        },
        tasks: {
          create: {
            tenantId,
            vehicleId,
            stageId: startStage.id,
            title: 'Initial intake checklist',
            description: 'Document vehicle intake condition and capture photos.',
            type: WorkflowTaskType.QA,
            status: WorkflowTaskStatus.IN_PROGRESS,
            dueAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            tags: ['intake'],
            mentions: [],
          },
        },
      },
    });

    return created;
  });

  emitToTenantRoom(tenantId, 'pipeline.workflow.started', { tenantId, vehicleId, workflowId: workflow.id });
  return workflow;
}

export async function moveVehicleStage(
  tenantId: string,
  vehicleId: string,
  userId: string,
  payload: MoveStageInput,
) {
  const workflow = await prisma.vehicleWorkflow.findFirst({
    where: { tenantId, vehicleId },
    include: {
      definition: { include: { stages: true } },
      currentStage: true,
    },
  });

  if (!workflow) {
    throw NotFound('Vehicle workflow not found.');
  }

  const targetStage = workflow.definition.stages.find((stage) => stage.key === payload.toStageKey);
  if (!targetStage) {
    throw BadRequest('Target stage not part of workflow definition.');
  }

  if (workflow.currentStageId === targetStage.id) {
    throw BadRequest('Vehicle is already in the requested stage.');
  }

  const now = new Date();
  const isTerminalStage = !workflow.definition.stages.some((stage) => stage.position > targetStage.position);

  const updated = await prisma.$transaction(async (tx) => {
    const createdTransition = await tx.stageTransition.create({
      data: {
        tenantId,
        workflowId: workflow.id,
        fromStageId: workflow.currentStageId,
        toStageId: targetStage.id,
        at: now,
        byUserId: userId,
        note: payload.note,
      },
    });

    const workflowUpdate = await tx.vehicleWorkflow.update({
      where: { id: workflow.id },
      data: {
        currentStageId: targetStage.id,
        completedAt: isTerminalStage ? now : null,
        updatedAt: now,
      },
      include: {
        currentStage: true,
        transitions: { orderBy: { at: 'desc' }, take: 1 },
      },
    });

    return { workflow: workflowUpdate, transition: createdTransition };
  });

  emitToTenantRoom(tenantId, 'pipeline.workflow.moved', {
    tenantId,
    vehicleId,
    workflowId: updated.workflow.id,
    toStageKey: targetStage.key,
    note: payload.note,
  });

  return updated.workflow;
}

function buildWorkflowWhere(
  tenantId: string,
  definitionId: string,
  query: BoardQuery,
): Prisma.VehicleWorkflowWhereInput {
  const where: Prisma.VehicleWorkflowWhereInput = {
    tenantId,
    definitionId,
  };

  if (query.stageKeys && query.stageKeys.length > 0) {
    where.currentStage = { key: { in: query.stageKeys } };
  }

  if (query.assignee) {
    where.tasks = {
      some: {
        assigneeId: query.assignee,
      },
    };
  }

  if (query.tags && query.tags.length > 0) {
    const tagFilters = query.tags.map((tag) => tag.toLowerCase());
    const hasSome: Prisma.StringFilter['hasSome'] = tagFilters;
    where.tasks = where.tasks
      ? {
          AND: [where.tasks, { tags: { hasSome } }],
        }
      : {
          some: {
            tags: { hasSome },
          },
        };
  }

  return where;
}

export async function getPipelineBoard(
  tenantId: string,
  query: BoardQuery,
): Promise<PipelineBoardResponse> {
  const definition = await getActiveDefinition(tenantId);
  const where = buildWorkflowWhere(tenantId, definition.id, query);

  const take = query.limit + 1;
  const workflows = await prisma.vehicleWorkflow.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take,
    ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
    include: {
      currentStage: true,
      vehicle: {
        select: {
          id: true,
          vin: true,
          stockNumber: true,
          year: true,
          make: true,
          model: true,
          trim: true,
        },
      },
      tasks: {
        where: { status: { in: [WorkflowTaskStatus.OPEN, WorkflowTaskStatus.IN_PROGRESS, WorkflowTaskStatus.BLOCKED] } },
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
      transitions: { orderBy: { at: 'desc' }, take: 1 },
    },
  });

  const hasNextPage = workflows.length > query.limit;
  const slice = hasNextPage ? workflows.slice(0, query.limit) : workflows;

  const stageById = new Map(definition.stages.map((stage) => [stage.id, stage]));
  const stageColumns: PipelineBoardStageColumn[] = definition.stages.map((stage) => ({
    id: stage.id,
    key: stage.key,
    name: stage.name,
    position: stage.position,
    slaHours: stage.slaHours,
    wipLimit: stage.wipLimit,
    vehicles: [],
  }));
  const stageColumnByKey = new Map(stageColumns.map((stage) => [stage.key, stage]));

  const now = new Date();

  for (const workflow of slice) {
    const stage = workflow.currentStage ?? (workflow.currentStageId ? stageById.get(workflow.currentStageId) ?? null : null);
    if (!stage) {
      continue;
    }

    const lastTransition = workflow.transitions[0];
    const reference = workflow.completedAt ?? now;
    const transitionAt = lastTransition?.at ?? workflow.startedAt;
    const minutes = Math.max(0, differenceInMinutes(reference, transitionAt));
    const slaStatus = resolveSlaStatus(minutes, stage.slaHours);

    const assigneeMap = new Map<string, PipelineBoardVehicleCard['assignees'][number]>();
    let blockedTasks = 0;
    for (const task of workflow.tasks) {
      if (task.status === WorkflowTaskStatus.BLOCKED) {
        blockedTasks += 1;
      }
      if (task.assignee) {
        assigneeMap.set(task.assignee.id, task.assignee);
      }
    }

    const card: PipelineBoardVehicleCard = {
      workflowId: workflow.id,
      vehicleId: workflow.vehicle.id,
      vin: workflow.vehicle.vin,
      stockNumber: workflow.vehicle.stockNumber,
      year: workflow.vehicle.year,
      make: workflow.vehicle.make,
      model: workflow.vehicle.model,
      trim: workflow.vehicle.trim,
      stageKey: stage.key,
      timeInStageMinutes: minutes,
      slaHours: stage.slaHours,
      slaStatus,
      assignees: Array.from(assigneeMap.values()),
      openTasks: workflow.tasks.length,
      blockedTasks,
      tags: Array.from(new Set(workflow.tasks.flatMap((task) => task.tags ?? []))),
    };

    const column = stageColumnByKey.get(stage.key);
    if (column) {
      column.vehicles.push(card);
    }
  }

  return {
    definitionId: definition.id,
    stages: stageColumns,
    nextCursor: hasNextPage ? slice[slice.length - 1]?.id : undefined,
  };
}

export async function getVehicleTimeline(
  tenantId: string,
  vehicleId: string,
): Promise<PipelineTimelineResponse> {
  const workflow = await prisma.vehicleWorkflow.findFirst({
    where: { tenantId, vehicleId },
    include: {
      currentStage: true,
      transitions: {
        orderBy: { at: 'asc' },
        include: {
          actor: { select: { id: true, firstName: true, lastName: true, email: true } },
          fromStage: { select: { id: true, key: true, name: true } },
          toStage: { select: { id: true, key: true, name: true } },
        },
      },
      tasks: {
        orderBy: { createdAt: 'asc' },
        include: {
          assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
      transportOrders: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!workflow) {
    throw NotFound('Vehicle workflow not found.');
  }

  const events: PipelineTimelineEvent[] = [];

  for (const transition of workflow.transitions) {
    events.push({
      id: transition.id,
      type: 'transition',
      occurredAt: transition.at.toISOString(),
      summary: `Moved to ${transition.toStage?.name ?? 'stage'}`,
      details: transition.note ?? undefined,
      actor: transition.actor ?? undefined,
      metadata: {
        fromStageKey: transition.fromStage?.key ?? null,
        toStageKey: transition.toStage?.key ?? null,
      },
    });
  }

  for (const task of workflow.tasks) {
    events.push({
      id: task.id,
      type: 'task',
      occurredAt: task.createdAt.toISOString(),
      summary: `${task.title} (${task.status})`,
      details: task.description ?? undefined,
      actor: task.assignee ?? undefined,
      metadata: {
        status: task.status,
        type: task.type,
        dueAt: task.dueAt?.toISOString(),
        tags: task.tags,
      },
    });
  }

  for (const order of workflow.transportOrders) {
    events.push({
      id: order.id,
      type: 'transport',
      occurredAt: order.createdAt.toISOString(),
      summary: `Transport ${order.status.toLowerCase()}`,
      details: order.vendor ?? undefined,
      metadata: {
        scheduledAt: order.scheduledAt?.toISOString(),
        pickupAddress: order.pickupAddress,
        dropoffAddress: order.dropoffAddress,
        costCents: order.costCents,
      },
    });
  }

  events.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  return {
    vehicleId,
    workflowId: workflow.id,
    currentStageKey: workflow.currentStage?.key ?? '',
    events,
  };
}

export async function notifyMentionedUsers(
  tenantId: string,
  message: string,
  actorId: string,
  context: {
    workflowId: string;
    vehicleId: string;
    taskId?: string;
  },
) {
  const handles = new Set<string>();
  const mentionMatches = message.match(/@([a-zA-Z0-9._-]+)/g) ?? [];
  for (const mention of mentionMatches) {
    handles.add(mention.slice(1).toLowerCase());
  }
  if (handles.size === 0) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      tenantId,
      OR: Array.from(handles).map((handle) => ({
        email: {
          startsWith: handle,
          mode: 'insensitive',
        },
      })),
    },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (users.length === 0) {
    return [];
  }

  const now = new Date();
  const notifications = await Promise.all(
    users.map((user) =>
      prisma.notification.create({
        data: {
          tenantId,
          userId: user.id,
          kind: 'pipeline.mention',
          type: NotificationType.TASK,
          title: 'You were mentioned on a workflow task',
          message,
          payload: {
            workflowId: context.workflowId,
            vehicleId: context.vehicleId,
            taskId: context.taskId ?? null,
            actorId,
          },
          createdAt: now,
        },
      }),
    ),
  );

  for (const notification of notifications) {
    emitToTenantRoom(tenantId, 'notification.created', notification);
  }

  return notifications;
}

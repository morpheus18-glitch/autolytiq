import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = {
  vehicleWorkflow: { findFirst: vi.fn() },
  workflowTask: {
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
};

const notifyMentionedUsersMock = vi.fn();
const socketMock = vi.fn();

vi.mock('../../../lib/prisma.js', () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock('../../pipeline/service.js', () => ({
  notifyMentionedUsers: notifyMentionedUsersMock,
}));

vi.mock('../../../lib/socket.js', () => ({
  emitToTenantRoom: socketMock,
}));

let createTask: typeof import('../service.js').createTask;
let mentionTask: typeof import('../service.js').mentionTask;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  const service = await import('../service.js');
  createTask = service.createTask;
  mentionTask = service.mentionTask;
});

describe('task service', () => {
  it('creates task and emits socket event', async () => {
    mockPrisma.vehicleWorkflow.findFirst.mockResolvedValue({ id: 'workflow-1', vehicleId: 'vehicle-1' });
    mockPrisma.workflowTask.create.mockResolvedValue({
      id: 'task-1',
      workflowId: 'workflow-1',
      vehicleId: 'vehicle-1',
      description: 'check @detailer@example.com',
    });

    notifyMentionedUsersMock.mockResolvedValue([]);

    const task = await createTask('tenant-1', 'user-1', {
      workflowId: 'workflow-1',
      vehicleId: 'vehicle-1',
      title: 'Prep vehicle',
      description: 'check @detailer@example.com',
      type: 'RECON',
      status: 'OPEN',
      tags: ['recon'],
    } as any);

    expect(task.id).toBe('task-1');
    expect(socketMock).toHaveBeenCalledWith('tenant-1', 'pipeline.task.created', expect.any(Object));
    expect(notifyMentionedUsersMock).toHaveBeenCalled();
  });

  it('merges mentions on mentionTask', async () => {
    mockPrisma.workflowTask.findFirst.mockResolvedValue({
      id: 'task-1',
      workflowId: 'workflow-1',
      vehicleId: 'vehicle-1',
      mentions: ['existing-user'],
    });
    notifyMentionedUsersMock.mockResolvedValue([
      { id: 'note-1', userId: 'new-user' },
    ]);
    mockPrisma.workflowTask.update.mockResolvedValue({ id: 'task-1', mentions: ['existing-user', 'new-user'] });

    const task = await mentionTask('tenant-1', 'task-1', 'actor-1', 'Heads up @new-user');

    expect(task.mentions).toContain('existing-user');
    expect(task.mentions).toContain('new-user');
    expect(socketMock).toHaveBeenCalledWith('tenant-1', 'pipeline.task.mentioned', {
      taskId: 'task-1',
      mentions: ['new-user'],
    });
  });
});

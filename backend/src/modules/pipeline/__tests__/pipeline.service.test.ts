import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPrisma = {
  workflowDefinition: { findFirst: vi.fn() },
  vehicleWorkflow: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  stageTransition: { create: vi.fn() },
  user: { findMany: vi.fn() },
  notification: { create: vi.fn() },
  $transaction: vi.fn(async (fn: (client: typeof mockPrisma) => any) => fn(mockPrisma as any)),
};

const socketMock = vi.fn();

vi.mock('../../../lib/prisma.js', () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock('../../../lib/socket.js', () => ({
  emitToTenantRoom: socketMock,
}));

let startVehicleWorkflow: typeof import('../service.js').startVehicleWorkflow;
let moveVehicleStage: typeof import('../service.js').moveVehicleStage;
let getPipelineBoard: typeof import('../service.js').getPipelineBoard;
let notifyMentionedUsers: typeof import('../service.js').notifyMentionedUsers;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  const service = await import('../service.js');
  startVehicleWorkflow = service.startVehicleWorkflow;
  moveVehicleStage = service.moveVehicleStage;
  getPipelineBoard = service.getPipelineBoard;
  notifyMentionedUsers = service.notifyMentionedUsers;
});

describe('pipeline service', () => {
  it('starts workflow when none exists', async () => {
    mockPrisma.vehicleWorkflow.findFirst.mockResolvedValue(null);
    mockPrisma.workflowDefinition.findFirst.mockResolvedValue({
      id: 'def-1',
      stages: [
        { id: 'stage-1', key: 'ACQUISITION', position: 1, slaHours: null, wipLimit: null },
      ],
    });
    mockPrisma.vehicleWorkflow.create.mockResolvedValue({
      id: 'workflow-1',
      tenantId: 'tenant-1',
      vehicleId: 'vehicle-1',
      definitionId: 'def-1',
      currentStageId: 'stage-1',
    });

    const workflow = await startVehicleWorkflow('tenant-1', 'vehicle-1', 'user-1');

    expect(workflow.id).toBe('workflow-1');
    expect(mockPrisma.vehicleWorkflow.create).toHaveBeenCalled();
    expect(socketMock).toHaveBeenCalledWith('tenant-1', 'pipeline.workflow.started', expect.any(Object));
  });

  it('throws when moving to invalid stage', async () => {
    mockPrisma.vehicleWorkflow.findFirst.mockResolvedValue({
      id: 'workflow-1',
      tenantId: 'tenant-1',
      vehicleId: 'vehicle-1',
      definition: {
        stages: [{ id: 'stage-1', key: 'ACQUISITION', position: 1 }],
      },
      currentStageId: 'stage-1',
      currentStage: { id: 'stage-1', key: 'ACQUISITION', position: 1 },
    });

    await expect(
      moveVehicleStage('tenant-1', 'vehicle-1', 'user-1', { toStageKey: 'UNKNOWN' }),
    ).rejects.toThrowError();
  });

  it('builds board response with SLA status', async () => {
    mockPrisma.workflowDefinition.findFirst.mockResolvedValue({
      id: 'def-1',
      stages: [
        { id: 'stage-1', key: 'ACQUISITION', name: 'Acquisition', position: 1, slaHours: 24, wipLimit: null },
      ],
    });
    mockPrisma.vehicleWorkflow.findMany.mockResolvedValue([
      {
        id: 'workflow-1',
        tenantId: 'tenant-1',
        definitionId: 'def-1',
        vehicle: {
          id: 'vehicle-1',
          vin: 'VIN1',
          stockNumber: 'STK1',
          year: 2024,
          make: 'Tesla',
          model: 'Model Y',
          trim: 'Performance',
        },
        currentStageId: 'stage-1',
        currentStage: { id: 'stage-1', key: 'ACQUISITION', name: 'Acquisition', slaHours: 24 },
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: null,
        tasks: [],
        transitions: [
          {
            at: new Date(Date.now() - 2 * 60 * 60 * 1000),
          },
        ],
      },
    ]);

    const board = await getPipelineBoard('tenant-1', {
      stageKeys: [],
      limit: 20,
      cursor: undefined,
      assignee: undefined,
      tags: [],
    });

    expect(board.stages[0].vehicles[0].slaStatus).toBe('ON_TRACK');
    expect(board.stages[0].vehicles).toHaveLength(1);
  });

  it('creates notifications for mentions', async () => {
    mockPrisma.user.findMany.mockResolvedValue([
      { id: 'user-mention', email: 'detailer@example.com', firstName: 'Detail', lastName: 'Er' },
    ]);
    mockPrisma.notification.create.mockResolvedValue({
      id: 'note-1',
      tenantId: 'tenant-1',
      userId: 'user-mention',
    });

    const notifications = await notifyMentionedUsers(
      'tenant-1',
      'Ping @detailer@example.com',
      'actor-1',
      { workflowId: 'workflow-1', vehicleId: 'vehicle-1' },
    );

    expect(notifications).toHaveLength(1);
    expect(socketMock).toHaveBeenCalledWith('tenant-1', 'notification.created', expect.any(Object));
  });
});

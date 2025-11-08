import { prisma, toInputJson } from '../lib/prisma';

export async function recordDealEvent(params: {
  tenantId: string;
  dealId: string;
  userId?: string | null;
  event: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      tenant: { connect: { id: params.tenantId } },
      user: params.userId ? { connect: { id: params.userId } } : undefined,
      action: 'DEAL_EVENT',
      resource: `deal:${params.dealId}`,
      details: params.payload ? toInputJson({ event: params.event, ...params.payload }) : toInputJson({ event: params.event }),
    },
  });
}

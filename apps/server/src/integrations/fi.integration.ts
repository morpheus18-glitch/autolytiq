import { prisma, toInputJson } from '../lib/prisma.js';

interface CreditSubmissionPayload {
  tenantId: string;
  dealId: string;
  worksheetId: string;
  versionId: string;
  customerId: string;
  vehicleId: string;
  structure: Record<string, unknown>;
  totals: Record<string, unknown>;
  payment: Record<string, unknown>;
  selectedBy: string;
}

export async function primeCreditSubmissionDraft(payload: CreditSubmissionPayload): Promise<void> {
  await prisma.creditSubmissionDraft.upsert({
    where: {
      tenantId_versionId: {
        tenantId: payload.tenantId,
        versionId: payload.versionId,
      },
    },
    update: {
      payload: toInputJson({
        structure: payload.structure,
        totals: payload.totals,
        payment: payload.payment,
        vehicleId: payload.vehicleId,
        customerId: payload.customerId,
        dealId: payload.dealId,
        worksheetId: payload.worksheetId,
        selectedBy: payload.selectedBy,
        preparedAt: new Date().toISOString(),
      }),
      status: 'PENDING',
    },
    create: {
      tenantId: payload.tenantId,
      dealId: payload.dealId,
      worksheetId: payload.worksheetId,
      versionId: payload.versionId,
      payload: toInputJson({
        structure: payload.structure,
        totals: payload.totals,
        payment: payload.payment,
        vehicleId: payload.vehicleId,
        customerId: payload.customerId,
        dealId: payload.dealId,
        worksheetId: payload.worksheetId,
        selectedBy: payload.selectedBy,
        preparedAt: new Date().toISOString(),
      }),
      status: 'PENDING',
    },
  });
}

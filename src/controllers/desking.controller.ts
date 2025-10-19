import type { Request, Response } from 'express';
import type { DealStatus as PrismaDealStatus } from '@prisma/client';
import { ApiError, toApiError } from '../lib/errors.js';
import {
  approvalRefreshSchema,
  counterAnalysisSchema,
  optimizeDealSchema,
  worksheetPrintSchema,
  worksheetSaveSchema,
  versionSelectSchema,
  type ApprovalRefreshInput,
  type CounterAnalysisInput,
  type OptimizeDealInput,
  type WorksheetPrintInput,
  type WorksheetSaveInput,
  type VersionSelectInput,
} from '../validations/desking.validation.js';
import { assertRole, assertTenantContext } from '../utils/authz.js';
import { renderWorksheetPreview } from '../utils/pdf.js';
import { uploadBufferToS3 } from '../lib/storage/s3.js';
import type { Role } from '../types/roles.js';
import {
  getWorksheet,
  listApprovals,
  listCounterOffers,
  listOptimizations,
  listVersions,
  saveWorksheet,
  selectVersion,
  updateWorksheetPrintUrl,
  getWorksheetPrintContext,
} from '../services/desking.service.js';
import {
  analyzeCounter as analyzeCounterService,
  optimizeDeal as executeDealOptimization,
} from '../services/dealOptimizer.service.js';
import { predictApprovals } from '../services/approvalPredictor.service.js';

const SALES_ROLE: Role = 'SALES';
const MANAGER_ROLE: Role = 'MANAGER';

function sendError(res: Response, error: unknown) {
  const normalized = toApiError(error);
  const payload: Record<string, unknown> = {
    code: normalized.code,
    message: normalized.message,
  };
  if (typeof normalized.details !== 'undefined') {
    payload.details = normalized.details;
  }
  res.status(normalized.status).json(payload);
}

export async function fetchWorksheet(req: Request, res: Response) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const worksheet = await getWorksheet(tenantId, dealId);
    const [versions, optimizations, counterOffers, approvals] = await Promise.all([
      listVersions(tenantId, dealId),
      listOptimizations(tenantId, dealId),
      listCounterOffers(tenantId, dealId),
      listApprovals(tenantId, dealId),
    ]);

    res.json({
      data: {
        worksheet,
        versions,
        optimizations,
        counterOffers,
        approvals,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
}

export async function upsertWorksheet(req: Request, res: Response) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId, userId } = assertTenantContext(req);
    const { dealId } = req.params;

    const parsed = worksheetSaveSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError('INVALID_WORKSHEET', 'Worksheet payload is invalid.', {
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const payload: WorksheetSaveInput = parsed.data;
    const result = await saveWorksheet(tenantId, dealId, userId, {
      ...payload,
      status: payload.status as PrismaDealStatus,
    });
    res.status(result.version ? 201 : 200).json({ data: result });
  } catch (error) {
    sendError(res, error);
  }
}

export async function printWorksheet(req: Request, res: Response) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = worksheetPrintSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError('INVALID_PRINT_REQUEST', 'Print payload is invalid.', {
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const payload: WorksheetPrintInput = parsed.data;
    const { worksheetId } = payload;
    const context = await getWorksheetPrintContext(tenantId, worksheetId);

    if (context.worksheet.dealId !== dealId) {
      throw new ApiError('WORKSHEET_MISMATCH', 'Worksheet does not belong to the specified deal.', { status: 400 });
    }

    const pdf = await renderWorksheetPreview({
      dealId,
      worksheetId,
      customerName: `${context.customer.firstName} ${context.customer.lastName}`.trim(),
      vehicle: {
        vin: context.vehicle.vin,
        year: context.vehicle.year,
        make: context.vehicle.make,
        model: context.vehicle.model,
        trim: context.vehicle.trim,
        stockNumber: context.vehicle.stockNumber,
      },
      salesperson: context.salesperson?.displayName ?? null,
      structure: context.worksheet.structure,
      payment: context.worksheet.payment,
      gross: context.worksheet.totals.totalGross
        ? {
            frontEnd: context.worksheet.totals.frontEndGross ?? 0,
            backEnd: context.worksheet.totals.backEndGross ?? 0,
            financeReserve: context.worksheet.totals.financeReserve,
            docFee: undefined,
            pack: undefined,
            total: context.worksheet.totals.totalGross,
          }
        : null,
      totals: context.worksheet.totals,
      versionLabel: context.versionLabel ?? payload.versionId ?? null,
    });

    const key = ['desking', tenantId, dealId, worksheetId, `${Date.now()}.pdf`].join('/');
    const upload = await uploadBufferToS3({
      key,
      body: pdf,
      contentType: 'application/pdf',
      metadata: { dealId, worksheetId },
    });

    const worksheet = await updateWorksheetPrintUrl(tenantId, worksheetId, upload.url);

    res.status(201).json({
      data: {
        url: upload.url,
        worksheet,
      },
    });
  } catch (error) {
    sendError(res, error);
  }
}

export async function optimizeWorksheet(req: Request, res: Response) {
  try {
    assertRole(req, MANAGER_ROLE);
    const { tenantId, userId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = optimizeDealSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError('INVALID_OPTIMIZATION_REQUEST', 'Optimization payload is invalid.', {
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const payload: OptimizeDealInput = parsed.data;

    if (payload.dealId !== dealId) {
      throw new ApiError('DEAL_MISMATCH', 'Optimization request deal does not match URL parameter.', { status: 400 });
    }

    const requestId = req.get('x-request-id') ?? undefined;
    const { optimization, recommendation, version, traceId } = await executeDealOptimization({
      tenantId,
      dealId,
      userId,
      request: payload,
      requestId,
    });

    res.status(201).json({ data: { optimization, recommendation, version, traceId } });
  } catch (error) {
    sendError(res, error);
  }
}

export async function analyzeCounterOffer(req: Request, res: Response) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId, userId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = counterAnalysisSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError('INVALID_COUNTER_REQUEST', 'Counter analysis payload is invalid.', {
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const payload: CounterAnalysisInput = parsed.data;

    if (payload.dealId !== dealId) {
      throw new ApiError('DEAL_MISMATCH', 'Counter analysis deal does not match URL parameter.', { status: 400 });
    }

    const requestId = req.get('x-request-id') ?? undefined;
    const { counter, analysis, traceId } = await analyzeCounterService({
      tenantId,
      dealId,
      userId,
      request: payload,
      requestId,
    });

    res.status(201).json({ data: { counter, analysis, traceId } });
  } catch (error) {
    sendError(res, error);
  }
}

export async function listWorksheetVersions(req: Request, res: Response) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const versions = await listVersions(tenantId, dealId);
    res.json({ data: versions });
  } catch (error) {
    sendError(res, error);
  }
}

export async function selectWorksheetVersion(req: Request, res: Response) {
  try {
    assertRole(req, MANAGER_ROLE);
    const { tenantId, userId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = versionSelectSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError('INVALID_VERSION_SELECTION', 'Version selection payload is invalid.', {
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const payload: VersionSelectInput = parsed.data;
    const worksheet = await selectVersion(tenantId, dealId, payload.worksheetId, payload.versionId, userId);
    res.json({ data: worksheet });
  } catch (error) {
    sendError(res, error);
  }
}

export async function listApprovalPredictions(req: Request, res: Response) {
  try {
    assertRole(req, SALES_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const approvals = await listApprovals(tenantId, dealId);
    res.json({ data: approvals });
  } catch (error) {
    sendError(res, error);
  }
}

export async function refreshApprovalPrediction(req: Request, res: Response) {
  try {
    assertRole(req, MANAGER_ROLE);
    const { tenantId } = assertTenantContext(req);
    const { dealId } = req.params;
    const parsed = approvalRefreshSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError('INVALID_APPROVAL_REQUEST', 'Approval refresh payload is invalid.', {
        status: 400,
        details: parsed.error.flatten(),
      });
    }

    const payload: ApprovalRefreshInput = parsed.data;

    if (payload.dealId !== dealId) {
      throw new ApiError('DEAL_MISMATCH', 'Approval prediction deal does not match URL parameter.', { status: 400 });
    }

    const requestId = req.get('x-request-id') ?? undefined;
    const { approvals, traces } = await predictApprovals({
      tenantId,
      dealId,
      worksheetId: payload.worksheetId,
      versionId: payload.versionId,
      structure: payload.structure,
      customer: payload.customerProfile,
      vehicle: payload.vehicle,
      payment: payload.payment,
      requestId,
      lenderIds: payload.lenderId ? [payload.lenderId] : undefined,
    });

    res.status(201).json({ data: { approvals, traces } });
  } catch (error) {
    sendError(res, error);
  }
}

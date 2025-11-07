import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { requireRole } from '../../middleware/rbac';
import type { Role } from '../../types/roles';
import {
  getComplianceChecklist,
  updateComplianceChecklist,
  generateComplianceDocument,
  getStateRequirements,
  DealNotFoundError,
  DocumentGenerationError,
  type ComplianceDocumentType,
  type ComplianceGroupKey,
  type ComplianceUpdatePayload,
} from '../../fi/compliance.service';
import { resolveHttpError } from '../../utils/http-errors';

const allowedRoles: Role[] = ['ADMIN', 'SALES'];

export const complianceRouter = Router();

function isDocumentType(value: unknown): value is ComplianceDocumentType {
  return value === 'buyers-guide' || value === 'tila';
}

function isGroupKey(value: unknown): value is ComplianceGroupKey {
  return value === 'federal' || value === 'state' || value === 'lender' || value === 'internal';
}

function handleError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof DealNotFoundError || error instanceof DocumentGenerationError) {
    return res.status(error.status).json({ message: error.message });
  }
  const resolved = resolveHttpError(error, 500, 'Request failed');
  if (resolved.status !== 500 || resolved.message !== 'Request failed') {
    return res.status(resolved.status).json({ message: resolved.message });
  }
  return next(error);
}

complianceRouter.get('/checklist/:dealId', requireRole(...allowedRoles), async (req, res, next) => {
  try {
    const { dealId } = req.params;
    if (!dealId || typeof dealId !== 'string') {
      return res.status(400).json({ message: 'dealId parameter is required' });
    }

    const checklist = await getComplianceChecklist(dealId);
    return res.json({ data: checklist });
  } catch (error) {
    handleError(error, res, next);
  }
});

complianceRouter.post('/generate-doc/:type', requireRole(...allowedRoles), async (req, res, next) => {
  try {
    const { type } = req.params;
    const { dealId } = req.body ?? {};

    if (!dealId || typeof dealId !== 'string') {
      return res.status(400).json({ message: 'dealId is required in request body' });
    }
    if (!isDocumentType(type)) {
      return res.status(400).json({ message: 'Unsupported compliance document type' });
    }

    const requestedBy = req.context?.user?.id ?? 'system';
    const result = await generateComplianceDocument({ dealId, type, requestedBy });
    return res.json({ data: result });
  } catch (error) {
    handleError(error, res, next);
  }
});

complianceRouter.post('/mark-complete', requireRole(...allowedRoles), async (req, res, next) => {
  try {
    const { dealId, updates, completeAll } = req.body ?? {};

    if (!dealId || typeof dealId !== 'string') {
      return res.status(400).json({ message: 'dealId is required in request body' });
    }

    let normalizedUpdates: ComplianceUpdatePayload['updates'];
    if (Array.isArray(updates)) {
      normalizedUpdates = [];
      for (const entry of updates) {
        if (!entry || typeof entry !== 'object') {
          continue;
        }
        const { group, itemId, completed, documentUrl, notes } = entry as Record<string, unknown>;
        if (!isGroupKey(group) || typeof itemId !== 'string') {
          continue;
        }
        normalizedUpdates.push({
          group,
          itemId,
          completed: Boolean(completed),
          documentUrl: typeof documentUrl === 'string' ? documentUrl : undefined,
          notes: typeof notes === 'string' ? notes : undefined,
        });
      }
    }

    const checklist = await updateComplianceChecklist({
      dealId,
      updates: normalizedUpdates,
      completeAll: Boolean(completeAll),
    });

    return res.json({ data: checklist });
  } catch (error) {
    handleError(error, res, next);
  }
});

complianceRouter.get('/state-requirements/:state', requireRole(...allowedRoles), async (req, res, next) => {
  try {
    const { state } = req.params;
    if (!state || typeof state !== 'string') {
      return res.status(400).json({ message: 'state parameter is required' });
    }

    const requirements = getStateRequirements(state);
    return res.json({ data: requirements });
  } catch (error) {
    handleError(error, res, next);
  }
});

import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import prisma from '../lib/prisma.js';
import { BadRequest, Forbidden, NotFound } from '../lib/errors.js';
import type { AppRole } from '../types/express.js';
import {
  buildDealDocumentKey,
  deleteFromS3,
  extractKeyFromUrl,
  generateDocumentId,
  runVirusScan,
  uploadBufferToS3,
} from '../lib/storage/s3.js';

interface UploadDescriptor {
  type: string;
  category: string;
  name?: string;
}

const READ_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER', 'SALES'];
const WRITE_ROLES: AppRole[] = ['ADMIN', 'MANAGER', 'SALES_MANAGER', 'FINANCE', 'FI_MANAGER'];

type AuthenticatedUser = NonNullable<Request['user']>;

export class FiService {
  constructor(private readonly db = prisma) {}

  private ensureReadAccess(user: AuthenticatedUser) {
    if (user.isSuperAdmin) {
      return;
    }
    if (!READ_ROLES.includes(user.role)) {
      throw Forbidden('You do not have permission to view F&I deals');
    }
  }

  private ensureWriteAccess(user: AuthenticatedUser) {
    if (user.isSuperAdmin) {
      return;
    }
    if (!WRITE_ROLES.includes(user.role)) {
      throw Forbidden('You do not have permission to modify F&I deals');
    }
  }

  private async requireDealForTenant(dealId: string, tenantId: string) {
    const deal = await this.db.dealJacket.findFirst({
      where: { id: dealId, tenantId },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    return deal;
  }

  async getDeal(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);

    const deal = await this.db.dealJacket.findFirst({
      where: { id: dealId, tenantId },
      include: {
        customer: true,
        vehicle: true,
        salesperson: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        fiManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!deal) {
      throw NotFound('Deal jacket not found');
    }

    return deal;
  }

  async updateDeal(
    user: AuthenticatedUser,
    tenantId: string,
    dealId: string,
    payload: Record<string, unknown>,
  ) {
    this.ensureWriteAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const data: Prisma.DealJacketUpdateInput = {};

    if (payload.status && typeof payload.status === 'string') {
      data.status = payload.status;
    }

    if (payload.fiProducts) {
      if (typeof payload.fiProducts === 'string') {
        try {
          data.fiProducts = JSON.parse(payload.fiProducts);
        } catch (error) {
          throw BadRequest('fiProducts must be valid JSON');
        }
      } else {
        data.fiProducts = payload.fiProducts as Prisma.JsonValue;
      }
    }

    if ('fiManagerId' in payload) {
      const fiManagerId = payload.fiManagerId as string | null | undefined;
      data.fiManagerId = fiManagerId ?? null;
    }

    if (payload.lenderId !== undefined) {
      data.lenderId = payload.lenderId === null ? null : String(payload.lenderId);
    }

    if (payload.term !== undefined) {
      data.term = payload.term === null ? null : Number(payload.term);
    }

    const decimalFields: (keyof Prisma.DealJacketUpdateInput)[] = [
      'sellingPrice',
      'tradeValue',
      'tradePayoff',
      'netTrade',
      'cashDown',
      'amountFinanced',
      'apr',
      'monthlyPayment',
      'totalFiGross',
    ];

    for (const field of decimalFields) {
      if (payload[field as keyof typeof payload] !== undefined) {
        const value = payload[field as keyof typeof payload];
        if (value === null) {
          data[field] = null;
        } else if (value !== undefined) {
          const numericValue = typeof value === 'number' ? value : Number(value);
          if (Number.isNaN(numericValue)) {
            throw BadRequest(`Invalid numeric value for ${String(field)}`);
          }
          data[field] = new Prisma.Decimal(numericValue.toFixed(2));
        }
      }
    }

    const dateFields: Array<keyof Prisma.DealJacketUpdateInput> = [
      'contractDate',
      'fundedDate',
      'deliveredDate',
    ];

    for (const field of dateFields) {
      if (payload[field as keyof typeof payload] !== undefined) {
        const value = payload[field as keyof typeof payload];
        if (value === null || value === '') {
          data[field] = null;
        } else {
          const date = new Date(String(value));
          if (Number.isNaN(date.getTime())) {
            throw BadRequest(`Invalid date for ${String(field)}`);
          }
          data[field] = date;
        }
      }
    }

    const updated = await this.db.dealJacket.update({
      where: { id: dealId },
      data,
      include: {
        customer: true,
        vehicle: true,
        salesperson: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        fiManager: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return updated;
  }

  async listDocuments(user: AuthenticatedUser, tenantId: string, dealId: string) {
    this.ensureReadAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const documents = await this.db.dealDocument.findMany({
      where: { dealId },
      orderBy: { uploadedAt: 'desc' },
    });

    return documents;
  }

  async uploadDocument(
    user: AuthenticatedUser,
    tenantId: string,
    dealId: string,
    file: Express.Multer.File,
    descriptor: UploadDescriptor,
  ) {
    this.ensureWriteAccess(user);
    const deal = await this.requireDealForTenant(dealId, tenantId);

    if (!file) {
      throw BadRequest('A document upload is required');
    }

    const scanResult = await runVirusScan(file.buffer);
    if (!scanResult.clean) {
      throw BadRequest('Uploaded file failed virus scan', { signature: scanResult.signature });
    }

    const documentId = generateDocumentId();
    const key = buildDealDocumentKey({
      tenantId,
      dealId,
      documentId,
      originalName: file.originalname,
    });

    let uploadResult: { key: string; url: string };
    try {
      uploadResult = await uploadBufferToS3({
        key,
        body: file.buffer,
        contentType: file.mimetype,
        metadata: {
          dealId,
          documentId,
          tenantId,
          uploadedBy: user.userId,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload failure';
      throw BadRequest(`Unable to upload document: ${message}`);
    }

    const name = descriptor.name?.trim() || file.originalname;

    const document = await this.db.dealDocument.create({
      data: {
        id: documentId,
        dealId: deal.id,
        type: descriptor.type,
        category: descriptor.category,
        name,
        fileName: file.originalname,
        fileUrl: uploadResult.url,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedBy: user.userId,
      },
    });

    return document;
  }

  async deleteDocument(user: AuthenticatedUser, tenantId: string, dealId: string, documentId: string) {
    this.ensureWriteAccess(user);
    await this.requireDealForTenant(dealId, tenantId);

    const document = await this.db.dealDocument.findFirst({
      where: { id: documentId, dealId },
    });

    if (!document) {
      throw NotFound('Document not found');
    }

    const key = extractKeyFromUrl(document.fileUrl);
    if (key) {
      try {
        await deleteFromS3(key);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown storage error';
        throw BadRequest(`Unable to delete file from storage: ${message}`);
      }
    }

    await this.db.dealDocument.delete({ where: { id: documentId } });
  }
}

export const fiService = new FiService();

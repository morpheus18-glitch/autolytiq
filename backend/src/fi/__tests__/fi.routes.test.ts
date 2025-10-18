import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const baseDealJacket = {
  id: 'deal-1',
  tenantId: 'tenant-1',
  dealNumber: 'SM-2024-0001',
  customerId: 'customer-1',
  vehicleId: 'vehicle-1',
  salespersonId: 'sales-1',
  fiManagerId: 'fi-1',
  sellingPrice: '27500.00',
  tradeValue: '6500.00',
  tradePayoff: '4200.00',
  netTrade: '2300.00',
  cashDown: '1500.00',
  amountFinanced: '23000.00',
  lenderId: 'lender-1',
  apr: '4.25',
  term: 72,
  monthlyPayment: '425.18',
  fiProducts: [] as any[],
  totalFiGross: '1800.00',
  status: 'Contracted',
  dealDate: new Date('2024-09-15T15:30:00Z'),
  contractDate: new Date('2024-09-16T15:30:00Z'),
  fundedDate: new Date('2024-09-20T15:30:00Z'),
  deliveredDate: new Date('2024-09-17T15:30:00Z'),
  customer: {
    id: 'customer-1',
    firstName: 'Jamie',
    lastName: 'Rivera',
    email: 'jamie.rivera@example.com',
  },
  vehicle: {
    id: 'vehicle-1',
    year: 2024,
    make: 'Tesla',
    model: 'Model Y',
    vin: '5YJYGDEE4LF123456',
  },
  salesperson: {
    id: 'sales-1',
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan.lee@example.com',
  },
  fiManager: {
    id: 'fi-1',
    firstName: 'Morgan',
    lastName: 'Hayes',
    email: 'morgan.hayes@example.com',
  },
};

function cloneDealJacket() {
  return {
    ...baseDealJacket,
    dealDate: new Date(baseDealJacket.dealDate),
    contractDate: new Date(baseDealJacket.contractDate),
    fundedDate: new Date(baseDealJacket.fundedDate),
    deliveredDate: new Date(baseDealJacket.deliveredDate),
    fiProducts: [...baseDealJacket.fiProducts],
    customer: { ...baseDealJacket.customer },
    vehicle: { ...baseDealJacket.vehicle },
    salesperson: { ...baseDealJacket.salesperson },
    fiManager: baseDealJacket.fiManager ? { ...baseDealJacket.fiManager } : null,
  };
}

const store = {
  dealJackets: [cloneDealJacket()],
  dealDocuments: [] as any[],
};

function resetStore() {
  store.dealDocuments = [];
  store.dealJackets[0] = cloneDealJacket();
}

const mockPrisma = {
  dealJacket: {
    findFirst: vi.fn(async ({ where }: any) => {
      const match = store.dealJackets.find(
        (deal) => deal.id === where.id && deal.tenantId === where.tenantId,
      );
      if (!match) {
        return null;
      }
      return { ...match };
    }),
    update: vi.fn(async ({ where, data }: any) => {
      const match = store.dealJackets.find((deal) => deal.id === where.id);
      if (!match) {
        throw new Error('Deal not found');
      }
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof Date) {
          (match as any)[key] = value;
        } else if (value === null) {
          (match as any)[key] = null;
        } else if (value && typeof (value as any).toString === 'function' && key !== 'fiProducts') {
          (match as any)[key] = (value as any).toString();
        } else {
          (match as any)[key] = value;
        }
      });
      return { ...match };
    }),
  },
  dealDocument: {
    findMany: vi.fn(async ({ where }: any) =>
      store.dealDocuments.filter((doc) => doc.dealId === where.dealId),
    ),
    create: vi.fn(async ({ data }: any) => {
      const record = { ...data, uploadedAt: new Date() };
      store.dealDocuments.push(record);
      return record;
    }),
    findFirst: vi.fn(async ({ where }: any) =>
      store.dealDocuments.find((doc) => doc.id === where.id && doc.dealId === where.dealId) ?? null,
    ),
    delete: vi.fn(async ({ where }: any) => {
      const index = store.dealDocuments.findIndex((doc) => doc.id === where.id);
      if (index >= 0) {
        store.dealDocuments.splice(index, 1);
      }
    }),
  },
};

const keyMap = new Map<string, string>();
let documentCounter = 1;

const buildDealDocumentKeyMock = vi.fn(({ documentId }: { documentId: string }) =>
  `deal-jackets/tenant-1/deal-1/${documentId}.pdf`,
);
const uploadBufferToS3Mock = vi.fn(async ({ key }: { key: string }) => {
  const url = `https://cdn.test/${key}`;
  keyMap.set(url, key);
  return { key, url };
});
const deleteFromS3Mock = vi.fn(async (key: string) => {
  for (const [url, storedKey] of keyMap.entries()) {
    if (storedKey === key) {
      keyMap.delete(url);
    }
  }
});
const extractKeyFromUrlMock = vi.fn((url: string) => keyMap.get(url) ?? null);
const getSignedDownloadUrlMock = vi.fn(async (key: string) => `https://signed.test/${key}`);
const runVirusScanMock = vi.fn(async () => ({ clean: true as const }));
const generateDocumentIdMock = vi.fn(() => `doc-${documentCounter++}`);

vi.mock('../../lib/prisma.js', () => ({
  default: mockPrisma,
}));

vi.mock('../../lib/storage/s3.js', () => ({
  buildDealDocumentKey: buildDealDocumentKeyMock,
  uploadBufferToS3: uploadBufferToS3Mock,
  deleteFromS3: deleteFromS3Mock,
  extractKeyFromUrl: extractKeyFromUrlMock,
  getSignedDownloadUrl: getSignedDownloadUrlMock,
  runVirusScan: runVirusScanMock,
  generateDocumentId: generateDocumentIdMock,
}));

async function createApp() {
  const fiRoutes = (await import('../fi.routes.js')).default;
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.user = {
      userId: 'user-1',
      tenantId: 'tenant-1',
      role: 'FI_MANAGER',
      permissions: [],
      isSuperAdmin: false,
    };
    next();
  });
  app.use('/api/fi', fiRoutes);
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err?.status ?? 500;
    res.status(status).json({ error: { message: err.message ?? 'error' } });
  });
  return app;
}

describe('F&I routes', () => {
  beforeEach(() => {
    resetStore();
    documentCounter = 1;
    keyMap.clear();
    vi.clearAllMocks();
  });

  it('returns deal jacket details', async () => {
    const app = await createApp();
    const response = await request(app).get('/api/fi/deals/deal-1').expect(200);
    expect(response.body.id).toBe('deal-1');
    expect(response.body.status).toBe('Contracted');
    expect(mockPrisma.dealJacket.findFirst).toHaveBeenCalled();
  });

  it('updates deal jacket details', async () => {
    const app = await createApp();
    const response = await request(app)
      .put('/api/fi/deals/deal-1')
      .send({ status: 'Funded', monthlyPayment: 399.99 })
      .expect(200);

    expect(response.body.status).toBe('Funded');
    expect(response.body.monthlyPayment).toBe('399.99');
    expect(mockPrisma.dealJacket.update).toHaveBeenCalled();
  });

  it('supports document upload, list, and delete', async () => {
    const app = await createApp();

    const uploadResponse = await request(app)
      .post('/api/fi/deals/deal-1/documents/upload')
      .field('type', 'contract')
      .field('category', 'Contracts')
      .attach('file', Buffer.from('sample'), 'contract.pdf')
      .expect(201);

    expect(uploadResponse.body.type).toBe('contract');
    expect(uploadResponse.body.downloadUrl).toContain('https://signed.test/');

    const listResponse = await request(app).get('/api/fi/deals/deal-1/documents').expect(200);
    expect(listResponse.body).toHaveLength(1);

    const documentId = listResponse.body[0].id;
    await request(app).delete(`/api/fi/deals/deal-1/documents/${documentId}`).expect(204);

    const afterDelete = await request(app).get('/api/fi/deals/deal-1/documents').expect(200);
    expect(afterDelete.body).toHaveLength(0);
  });

  it('prevents access to a deal jacket owned by another tenant', async () => {
    store.dealJackets[0].tenantId = 'tenant-2';
    const app = await createApp();

    const response = await request(app).get('/api/fi/deals/deal-1').expect(404);
    expect(response.body.error.message).toMatch(/not found/i);
  });

  it('rejects invalid deal status updates', async () => {
    const app = await createApp();
    const response = await request(app)
      .put('/api/fi/deals/deal-1')
      .send({ status: 'Invalid Status' })
      .expect(400);

    expect(response.body.error.message).toBe('Invalid deal update payload');
  });

  it('requires a file when uploading deal documents', async () => {
    const app = await createApp();
    const response = await request(app)
      .post('/api/fi/deals/deal-1/documents/upload')
      .field('type', 'contract')
      .field('category', 'Contracts')
      .expect(400);

    expect(response.body.error.message).toMatch(/file/i);
  });

  it('fails uploads that do not pass the virus scan', async () => {
    runVirusScanMock.mockResolvedValueOnce({ clean: false, signature: 'EICAR' });
    const app = await createApp();

    const response = await request(app)
      .post('/api/fi/deals/deal-1/documents/upload')
      .field('type', 'contract')
      .field('category', 'Contracts')
      .attach('file', Buffer.from('infected'), 'contract.pdf')
      .expect(400);

    expect(response.body.error.message).toMatch(/virus scan/i);
  });

  it('surfaces storage upload failures to the client', async () => {
    uploadBufferToS3Mock.mockRejectedValueOnce(new Error('S3 offline'));
    const app = await createApp();

    const response = await request(app)
      .post('/api/fi/deals/deal-1/documents/upload')
      .field('type', 'contract')
      .field('category', 'Contracts')
      .attach('file', Buffer.from('sample'), 'contract.pdf')
      .expect(400);

    expect(response.body.error.message).toMatch(/unable to upload document/i);
  });
});

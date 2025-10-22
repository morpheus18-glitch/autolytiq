import { mockDeep, mockReset } from 'jest-mock-extended';
import type { PrismaClient } from '@prisma/client';

import { AuthService, type AuthServiceDependencies } from '../auth-service';

describe('AuthService', () => {
  const prismaMock = mockDeep<PrismaClient>();
  let deps: AuthServiceDependencies;

  beforeEach(() => {
    mockReset(prismaMock);
    deps = {
      prisma: prismaMock,
      compare: jest.fn(() => Promise.resolve(false)) as AuthServiceDependencies['compare'],
      hash: jest.fn(() => Promise.resolve('hash')) as AuthServiceDependencies['hash'],
      randomBytes: jest.fn(() => Buffer.alloc(0)) as AuthServiceDependencies['randomBytes'],
      now: () => new Date('2024-01-01T00:00:00Z'),
    };
  });

  it('authenticates a tenant user with valid credentials', async () => {
    prismaMock.tenant.findFirst.mockResolvedValue({
      id: 'tenant-1',
      name: 'Demo Tenant',
      subdomain: 'demo',
      settings: {
        auth: {
          defaultAccess: {
            allowedRoutes: ['/dashboard'],
            navigationSections: ['inventory'],
            quickActions: ['/inventory'],
          },
        },
      },
    } as any);

    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user-1',
      tenantId: 'tenant-1',
      email: 'demo@autolytiq.com',
      username: 'demo',
      password: 'hash',
      firstName: 'Demo',
      lastName: 'User',
      role: 'SALES',
      permissions: ['dashboard:view'],
      featureFlags: ['beta'],
      isSuperAdmin: false,
      accessOverrides: null,
    } as any);

    (deps.compare as jest.Mock).mockResolvedValue(true);
    prismaMock.user.update.mockResolvedValue({} as any);

    const service = new AuthService(deps);
    const session = await service.authenticateWithTenantCredentials({
      tenantIdentifier: 'tenant-1',
      username: 'demo',
      password: 'secret',
    });

    expect(session.tenant.id).toBe('tenant-1');
    expect(session.username).toBe('demo');
    expect(session.access.allowedRoutes).toContain('/dashboard');
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      }),
    );
  });

  it('throws when tenant cannot be resolved', async () => {
    prismaMock.tenant.findFirst.mockResolvedValue(null);

    const service = new AuthService(deps);

    await expect(
      service.authenticateWithTenantCredentials({
        tenantIdentifier: 'missing',
        username: 'demo',
        password: 'secret',
      }),
    ).rejects.toThrow('Invalid credentials');
    expect(deps.compare).not.toHaveBeenCalled();
  });

  it('issues password reset tokens for tenant users', async () => {
    prismaMock.tenant.findFirst.mockResolvedValue({
      id: 'tenant-1',
      name: 'Demo Tenant',
      subdomain: 'demo',
      settings: {},
    } as any);

    prismaMock.user.findFirst.mockResolvedValue({
      id: 'user-1',
      tenantId: 'tenant-1',
      email: 'demo@autolytiq.com',
      firstName: 'Demo',
      lastName: 'User',
    } as any);

    (deps.randomBytes as jest.Mock).mockReturnValue(Buffer.from('a'.repeat(64), 'hex'));

    prismaMock.passwordResetToken.create.mockResolvedValue({
      id: 'token-1',
      token: 'a'.repeat(64),
      tenantId: 'tenant-1',
      userId: 'user-1',
      expiresAt: new Date('2024-01-01T00:30:00Z'),
      usedAt: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    } as any);

    const service = new AuthService(deps);
    const record = await service.issuePasswordResetToken({
      tenantIdentifier: 'tenant-1',
      username: 'demo',
      ttlMinutes: 30,
    });

    expect(prismaMock.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    expect(record.tenant.id).toBe('tenant-1');
    expect(record.user.email).toBe('demo@autolytiq.com');
    expect(record.token).toEqual('a'.repeat(64));
  });
});

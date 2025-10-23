import type { Prisma, PrismaClient, Tenant, User } from '@prisma/client';
import { addMinutes } from 'date-fns';

import type { SessionUser, SessionUserAccess } from '../session-auth';

const FALLBACK_ACCESS: Required<SessionUserAccess> & { homePath: string } = {
  homePath: '/dashboard',
  allowedRoutes: [
    '/',
    '/dashboard',
    '/inventory',
    '/inventory/pricing',
    '/inventory/lot-management',
    '/inventory/:id',
    '/sales',
    '/deals',
    '/crm',
    '/customers',
    '/leads',
    '/trade-appraisals',
    '/finance',
    '/finance/lenders',
    '/finance/rates',
    '/finance/compliance',
    '/reports',
    '/reports/sales',
    '/reports/inventory',
    '/workflow-assistant',
  ],
  navigationSections: ['inventory', 'crm', 'sales', 'finance', 'reports'],
  quickActions: ['/customers', '/inventory', '/deals'],
};

interface TenantSettingsAuth {
  auth?: {
    defaultAccess?: Partial<SessionUserAccess & { homePath: string }>;
  };
}

interface UserAccessOverrides extends Partial<SessionUserAccess> {
  homePath?: string;
}

function toTenantSettingsAuth(settings: Prisma.JsonValue | null | undefined): TenantSettingsAuth {
  if (!settings || typeof settings !== 'object') {
    return {};
  }

  return settings as TenantSettingsAuth;
}

function toUserAccessOverrides(overrides: Prisma.JsonValue | null | undefined): UserAccessOverrides {
  if (!overrides || typeof overrides !== 'object') {
    return {};
  }

  return overrides as UserAccessOverrides;
}

function mergeStringSets(...lists: Array<string[] | undefined>): string[] {
  const seen = new Set<string>();
  for (const list of lists) {
    if (!list) continue;
    for (const value of list) {
      if (!value) continue;
      seen.add(value);
    }
  }
  return Array.from(seen);
}

function normalizeIdentifier(value: string): string {
  return value.trim();
}

function extractSessionAccess(
  tenantSettings: TenantSettingsAuth,
  userOverrides: UserAccessOverrides,
): SessionUserAccess {
  const tenantAccess = tenantSettings.auth?.defaultAccess ?? {};
  const allowedRoutes = mergeStringSets(
    FALLBACK_ACCESS.allowedRoutes,
    tenantAccess.allowedRoutes,
    userOverrides.allowedRoutes,
  );
  if (!allowedRoutes.includes('/')) {
    allowedRoutes.unshift('/');
  }

  const navigationSections = mergeStringSets(
    FALLBACK_ACCESS.navigationSections,
    tenantAccess.navigationSections,
    userOverrides.navigationSections,
  );

  const quickActions = mergeStringSets(
    FALLBACK_ACCESS.quickActions,
    tenantAccess.quickActions,
    userOverrides.quickActions,
  );

  return {
    homePath: userOverrides.homePath ?? tenantAccess.homePath ?? FALLBACK_ACCESS.homePath,
    allowedRoutes,
    navigationSections,
    quickActions,
  };
}

function extractPermissionList(value: Prisma.JsonValue | null | undefined): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : String(item)))
      .filter((item) => item.length > 0);
  }

  return [];
}

function buildSessionUser(
  user: Pick<
    User,
    | 'id'
    | 'email'
    | 'firstName'
    | 'lastName'
    | 'role'
    | 'featureFlags'
    | 'isSuperAdmin'
    | 'tenantId'
    | 'username'
  > & { permissions: Prisma.JsonValue | null },
  tenant: Pick<Tenant, 'id' | 'name' | 'subdomain'>,
  access: SessionUserAccess,
): SessionUser {
  const permissions = extractPermissionList(user.permissions);
  if (user.isSuperAdmin || permissions.includes('*')) {
    if (!permissions.includes('*')) {
      permissions.unshift('*');
    }
  }

  return {
    id: user.id,
    userId: user.id,
    username: user.username ?? user.email,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    permissions,
    featureFlags: user.featureFlags ?? [],
    tenantId: user.tenantId,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
    },
    access,
  };
}

export interface AuthServiceDependencies {
  prisma: PrismaClient;
  compare: (data: string, encrypted: string) => Promise<boolean>;
  hash: (data: string, rounds: number) => Promise<string>;
  randomBytes: (size: number) => Buffer;
  now: () => Date;
}

export class AuthService {
  constructor(private readonly deps: AuthServiceDependencies) {}

  private async resolveTenant(identifier: string) {
    const normalized = normalizeIdentifier(identifier);
    if (!normalized) {
      return undefined;
    }

    return this.deps.prisma.tenant.findFirst({
      where: {
        OR: [
          { id: normalized },
          { subdomain: { equals: normalized, mode: 'insensitive' } },
          { name: { equals: normalized, mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        settings: true,
      },
    });
  }

  async authenticateWithTenantCredentials(options: {
    tenantIdentifier: string;
    username: string;
    password: string;
  }): Promise<SessionUser> {
    const tenant = await this.resolveTenant(options.tenantIdentifier);
    if (!tenant) {
      throw new Error('Invalid credentials');
    }

    const normalizedUsername = normalizeIdentifier(options.username);

    const user = await this.deps.prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          { username: { equals: normalizedUsername, mode: 'insensitive' } },
          { email: { equals: normalizedUsername, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        featureFlags: true,
        isSuperAdmin: true,
        accessOverrides: true,
      },
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const passwordValid = await this.deps.compare(options.password, user.password);
    if (!passwordValid) {
      throw new Error('Invalid credentials');
    }

    const tenantSettings = toTenantSettingsAuth(tenant.settings);
    const userOverrides = toUserAccessOverrides(user.accessOverrides);
    const access = extractSessionAccess(tenantSettings, userOverrides);

    await this.deps.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: this.deps.now() },
    });

    return buildSessionUser(user, tenant, access);
  }

  async issuePasswordResetToken(options: {
    tenantIdentifier: string;
    username: string;
    ttlMinutes?: number;
  }) {
    const tenant = await this.resolveTenant(options.tenantIdentifier);
    if (!tenant) {
      throw new Error('Account not found');
    }

    const normalizedUsername = normalizeIdentifier(options.username);
    const user = await this.deps.prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [
          { username: { equals: normalizedUsername, mode: 'insensitive' } },
          { email: { equals: normalizedUsername, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        tenantId: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      throw new Error('Account not found');
    }

    await this.deps.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = this.deps.randomBytes(32).toString('hex');
    const expiresAt = addMinutes(this.deps.now(), options.ttlMinutes ?? 30);

    const record = await this.deps.prisma.passwordResetToken.create({
      data: {
        token,
        tenantId: user.tenantId,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      token: record.token,
      expiresAt: record.expiresAt,
      user,
      tenant,
    };
  }

  async validatePasswordResetToken(token: string) {
    const record = await this.deps.prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            tenantId: true,
          },
        },
      },
    });

    if (!record) {
      throw new Error('Invalid or expired reset link');
    }

    if (record.usedAt) {
      throw new Error('Reset link has already been used');
    }

    if (record.expiresAt.getTime() < this.deps.now().getTime()) {
      throw new Error('Reset link has expired');
    }

    return record;
  }

  async resetPasswordWithToken(token: string, password: string) {
    const record = await this.validatePasswordResetToken(token);

    const passwordHash = await this.deps.hash(password, 12);

    await this.deps.prisma.user.update({
      where: { id: record.userId },
      data: {
        password: passwordHash,
        updatedAt: this.deps.now(),
      },
    });

    await this.deps.prisma.passwordResetToken.update({
      where: { token },
      data: {
        usedAt: this.deps.now(),
      },
    });

    return record;
  }
}

export function createAuthService(dependencies: AuthServiceDependencies) {
  return new AuthService(dependencies);
}

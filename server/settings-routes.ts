import type { Express, Response } from 'express';
import bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'node:crypto';
import { z } from 'zod';
import {
  createSettingsUserSchema,
  updateSettingsUserSchema,
  settingsUserSchema,
  paginatedSettingsUsersSchema,
  securitySettingsSchema,
  webhookSchema,
  webhookInputSchema,
  apiKeySchema,
  apiKeyWithSecretSchema,
  paginatedAuditLogSchema,
  auditLogEntrySchema,
  settingsUserPermissionKeys,
  type SettingsUser,
  type CreateSettingsUserInput,
  type UpdateSettingsUserInput,
  type SecuritySettings,
  type WebhookConfig,
  type WebhookInput,
  type ApiKeyRecord,
  type ApiKeyWithSecret,
  type AuditLogEntry,
  settingsUserStatuses,
  settingsUserRoles,
} from '@shared/settings-schema';

type StoredUser = SettingsUser & {
  passwordHash: string;
};

type StoredSecuritySettings = SecuritySettings;

type StoredApiKey = ApiKeyRecord & {
  secret: string;
};

interface StoredAuditLogEntry extends AuditLogEntry {}

const userStore = new Map<string, StoredUser>();
const apiKeyStore = new Map<string, StoredApiKey>();
const auditLogStore: StoredAuditLogEntry[] = [];

let securitySettings: StoredSecuritySettings = {
  twoFactorEnabled: false,
  minPasswordLength: 12,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
  sessionTimeout: '30m',
  rememberDuration: '14d',
  ipWhitelist: [],
  ipBlacklist: [],
  maxFailedAttempts: 5,
  lockoutMinutes: 30,
  webhooks: [],
};

const usersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'role', 'status', 'lastLogin']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
});

function maskKey(secret: string): string {
  if (secret.length <= 8) {
    return `${secret.slice(0, 2)}****${secret.slice(-2)}`;
  }
  return `${secret.slice(0, 4)}••••${secret.slice(-4)}`;
}

function logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }): void {
  const normalized: StoredAuditLogEntry = auditLogEntrySchema.parse({
    id: randomUUID(),
    timestamp: entry.timestamp ?? new Date().toISOString(),
    userName: entry.userName,
    userId: entry.userId,
    action: entry.action,
    resource: entry.resource,
    ipAddress: entry.ipAddress ?? null,
    details: entry.details ?? null,
  });
  auditLogStore.unshift(normalized);
}

async function createStoredUser(input: CreateSettingsUserInput): Promise<StoredUser> {
  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const baseUser: SettingsUser = settingsUserSchema.parse({
    ...input,
    id: randomUUID(),
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const stored: StoredUser = { ...baseUser, passwordHash };
  userStore.set(stored.id, stored);

  logAudit({
    userName: `${stored.firstName} ${stored.lastName}`,
    userId: stored.id,
    action: 'user.created',
    resource: 'settings.users',
    details: `Created user with role ${stored.role}`,
  });

  return stored;
}

async function updateStoredUser(userId: string, input: UpdateSettingsUserInput): Promise<StoredUser> {
  const existing = userStore.get(userId);
  if (!existing) {
    throw new Error('User not found');
  }

  const now = new Date().toISOString();
  let passwordHash = existing.passwordHash;

  if (input.password) {
    passwordHash = await bcrypt.hash(input.password, 10);
  }

  const parsed: SettingsUser = settingsUserSchema.parse({
    ...existing,
    ...input,
    updatedAt: now,
  });

  const updated: StoredUser = { ...parsed, passwordHash };
  userStore.set(updated.id, updated);

  logAudit({
    userName: `${updated.firstName} ${updated.lastName}`,
    userId: updated.id,
    action: 'user.updated',
    resource: 'settings.users',
    details: 'User profile updated',
  });

  return updated;
}

function deactivateStoredUser(userId: string): StoredUser | undefined {
  const existing = userStore.get(userId);
  if (!existing) {
    return undefined;
  }

  const now = new Date().toISOString();
  const updated: StoredUser = {
    ...existing,
    status: 'INACTIVE',
    updatedAt: now,
  };
  userStore.set(updated.id, updated);

  logAudit({
    userName: `${updated.firstName} ${updated.lastName}`,
    userId: updated.id,
    action: 'user.deactivated',
    resource: 'settings.users',
    details: 'User account deactivated',
  });

  return updated;
}

function resetUserPassword(userId: string): string | undefined {
  const existing = userStore.get(userId);
  if (!existing) {
    return undefined;
  }

  const randomPassword = randomBytes(9).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  const now = new Date().toISOString();
  bcrypt.hash(randomPassword, 10).then((hash) => {
    const updated: StoredUser = { ...existing, passwordHash: hash, updatedAt: now };
    userStore.set(updated.id, updated);
  });

  logAudit({
    userName: `${existing.firstName} ${existing.lastName}`,
    userId: existing.id,
    action: 'user.password_reset',
    resource: 'settings.users',
    details: 'Temporary password issued',
  });

  return randomPassword;
}

function ensureSeedData(): void {
  if (userStore.size > 0) {
    return;
  }

  const basePermissions = settingsUserPermissionKeys.reduce(
    (accumulator, key) => ({ ...accumulator, [key]: key === 'manageSettings' }),
    {} as Record<string, boolean>,
  );

  void createStoredUser({
    firstName: 'Avery',
    lastName: 'Reeves',
    email: 'avery.reeves@example.com',
    phone: '(555) 010-2211',
    role: 'ADMIN',
    status: 'ACTIVE',
    permissions: basePermissions,
    password: 'Adm1n$ecure',
  });

  void createStoredUser({
    firstName: 'Jordan',
    lastName: 'Chen',
    email: 'jordan.chen@example.com',
    phone: '(555) 010-3344',
    role: 'MANAGER',
    status: 'ACTIVE',
    permissions: settingsUserPermissionKeys.reduce(
      (accumulator, key) => ({ ...accumulator, [key]: ['viewAllDeals', 'editAllDeals', 'viewReports'].includes(key) }),
      {} as Record<string, boolean>,
    ),
    password: 'Manag3r$ecure',
  });

  auditLogStore.push(
    auditLogEntrySchema.parse({
      id: randomUUID(),
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      userName: 'System',
      userId: 'system',
      action: 'settings.initialized',
      resource: 'settings.security',
      ipAddress: null,
      details: 'Security settings initialized with defaults',
    }),
  );
}

function respondWithUsers(res: Response, users: StoredUser[], page: number, pageSize: number, total: number): void {
  const payload = paginatedSettingsUsersSchema.parse({
    data: users,
    meta: { page, pageSize, total },
  });
  res.json(payload);
}

function respondWithApiKeys(res: Response, keys: StoredApiKey[]): void {
  const parsed = z.array(apiKeySchema).parse(
    keys.map((key) => ({
      id: key.id,
      name: key.name,
      maskedKey: key.maskedKey,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      status: key.status,
    })),
  );
  res.json(parsed);
}

export function registerSettingsRoutes(app: Express): void {
  ensureSeedData();

  app.get('/api/settings/users', (req, res) => {
    try {
      const params = usersQuerySchema.parse(req.query);

      const { page, pageSize, search, role, status, sortBy, sortOrder } = params;

      let users = Array.from(userStore.values());

      if (search) {
        const normalized = search.toLowerCase();
        users = users.filter((user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(normalized) ||
          user.email.toLowerCase().includes(normalized),
        );
      }

      if (role && settingsUserRoles.includes(role.toUpperCase() as typeof settingsUserRoles[number])) {
        users = users.filter((user) => user.role === role.toUpperCase());
      }

      if (status && settingsUserStatuses.includes(status.toUpperCase() as typeof settingsUserStatuses[number])) {
        users = users.filter((user) => user.status === status.toUpperCase());
      }

      users.sort((a, b) => {
        const direction = sortOrder === 'desc' ? -1 : 1;
        switch (sortBy) {
          case 'email':
            return a.email.localeCompare(b.email) * direction;
          case 'role':
            return a.role.localeCompare(b.role) * direction;
          case 'status':
            return a.status.localeCompare(b.status) * direction;
          case 'lastLogin': {
            const aDate = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
            const bDate = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
            return (aDate - bDate) * direction;
          }
          case 'name':
          default:
            return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`) * direction;
        }
      });

      const total = users.length;
      const start = (page - 1) * pageSize;
      const paged = users.slice(start, start + pageSize);

      respondWithUsers(res, paged, page, pageSize, total);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  app.post('/api/settings/users', async (req, res) => {
    try {
      const payload = createSettingsUserSchema.parse(req.body);

      const emailExists = Array.from(userStore.values()).some(
        (user) => user.email.toLowerCase() === payload.email.toLowerCase(),
      );
      if (emailExists) {
        return res.status(409).json({ message: 'Email already exists for this tenant' });
      }

      const stored = await createStoredUser(payload);
      const parsed = settingsUserSchema.parse(stored);
      res.status(201).json(parsed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ message: 'Validation failed', errors: error.format() });
      }
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unable to create user' });
    }
  });

  app.put('/api/settings/users/:id', async (req, res) => {
    try {
      const payload = updateSettingsUserSchema.parse(req.body);
      const userId = req.params.id;

      const emailExists = Array.from(userStore.values()).some(
        (user) => user.id !== userId && user.email.toLowerCase() === payload.email.toLowerCase(),
      );
      if (emailExists) {
        return res.status(409).json({ message: 'Email already exists for this tenant' });
      }

      const updated = await updateStoredUser(userId, payload);
      const parsed = settingsUserSchema.parse(updated);
      res.json(parsed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ message: 'Validation failed', errors: error.format() });
      }
      if (error instanceof Error && error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error instanceof Error ? error.message : 'Unable to update user' });
    }
  });

  app.delete('/api/settings/users/:id', (req, res) => {
    const updated = deactivateStoredUser(req.params.id);
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send();
  });

  app.post('/api/settings/users/:id/reset-password', (req, res) => {
    const temporaryPassword = resetUserPassword(req.params.id);
    if (!temporaryPassword) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Password reset issued', temporaryPassword });
  });

  app.get('/api/settings/security', (req, res) => {
    res.json(securitySettingsSchema.parse(securitySettings));
  });

  app.put('/api/settings/security', (req, res) => {
    try {
      const payload = securitySettingsSchema.parse(req.body);
      securitySettings = { ...payload };

      logAudit({
        userName: 'Security Automation',
        action: 'security.updated',
        resource: 'settings.security',
        details: 'Security settings updated',
      });

      res.json(payload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ message: 'Validation failed', errors: error.format() });
      }
      res.status(500).json({ message: 'Unable to update security settings' });
    }
  });

  app.get('/api/settings/api-keys', (req, res) => {
    respondWithApiKeys(res, Array.from(apiKeyStore.values()));
  });

  app.post('/api/settings/api-keys', (req, res) => {
    const name = z.string().min(1).parse(req.body?.name ?? '');
    const secret = `ak_${randomBytes(24).toString('base64url')}`;
    const now = new Date().toISOString();

    const record: StoredApiKey = {
      id: randomUUID(),
      name,
      maskedKey: maskKey(secret),
      secret,
      createdAt: now,
      lastUsedAt: null,
      status: 'ACTIVE',
    };

    apiKeyStore.set(record.id, record);

    logAudit({
      userName: 'API Security',
      action: 'api_key.created',
      resource: 'settings.apiKeys',
      details: `API key generated (${name})`,
    });

    const payload: ApiKeyWithSecret = apiKeyWithSecretSchema.parse(record);
    res.status(201).json(payload);
  });

  app.delete('/api/settings/api-keys/:id', (req, res) => {
    const existing = apiKeyStore.get(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'API key not found' });
    }

    apiKeyStore.set(existing.id, { ...existing, status: 'REVOKED' });

    logAudit({
      userName: 'API Security',
      action: 'api_key.revoked',
      resource: 'settings.apiKeys',
      details: `API key revoked (${existing.name})`,
    });

    res.status(204).send();
  });

  app.post('/api/settings/security/webhooks', (req, res) => {
    try {
      const payload: WebhookInput = webhookInputSchema.parse(req.body);
      const now = new Date().toISOString();
      const webhook: WebhookConfig = webhookSchema.parse({
        ...payload,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      });

      securitySettings = {
        ...securitySettings,
        webhooks: [...securitySettings.webhooks, webhook],
      };

      res.status(201).json(webhook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ message: 'Validation failed', errors: error.format() });
      }
      res.status(500).json({ message: 'Unable to create webhook' });
    }
  });

  app.put('/api/settings/security/webhooks/:id', (req, res) => {
    try {
      const payload: WebhookInput = webhookInputSchema.parse(req.body);
      const webhookId = req.params.id;
      const existingIndex = securitySettings.webhooks.findIndex((item) => item.id === webhookId);
      if (existingIndex === -1) {
        return res.status(404).json({ message: 'Webhook not found' });
      }

      const now = new Date().toISOString();
      const updated = webhookSchema.parse({
        ...securitySettings.webhooks[existingIndex],
        ...payload,
        updatedAt: now,
      });

      const copy = [...securitySettings.webhooks];
      copy.splice(existingIndex, 1, updated);
      securitySettings = { ...securitySettings, webhooks: copy };

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ message: 'Validation failed', errors: error.format() });
      }
      res.status(500).json({ message: 'Unable to update webhook' });
    }
  });

  app.delete('/api/settings/security/webhooks/:id', (req, res) => {
    const webhookId = req.params.id;
    const existing = securitySettings.webhooks.find((webhook) => webhook.id === webhookId);
    if (!existing) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    securitySettings = {
      ...securitySettings,
      webhooks: securitySettings.webhooks.filter((webhook) => webhook.id !== webhookId),
    };

    res.status(204).send();
  });

  app.get('/api/settings/audit-logs', (req, res) => {
    try {
      const params = auditQuerySchema.parse(req.query);
      const { page, pageSize, startDate, endDate, userId, action } = params;

      let logs = [...auditLogStore];

      if (startDate) {
        const from = new Date(startDate).getTime();
        logs = logs.filter((log) => new Date(log.timestamp).getTime() >= from);
      }

      if (endDate) {
        const to = new Date(endDate).getTime();
        logs = logs.filter((log) => new Date(log.timestamp).getTime() <= to);
      }

      if (userId) {
        logs = logs.filter((log) => log.userId === userId);
      }

      if (action) {
        const normalized = action.toLowerCase();
        logs = logs.filter((log) => log.action.toLowerCase().includes(normalized));
      }

      const total = logs.length;
      const start = (page - 1) * pageSize;
      const paged = logs.slice(start, start + pageSize);

      const payload = paginatedAuditLogSchema.parse({
        data: paged,
        meta: { page, pageSize, total },
      });

      res.json(payload);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({ message: 'Invalid query', errors: error.format() });
      }
      res.status(500).json({ message: 'Unable to fetch audit logs' });
    }
  });
}


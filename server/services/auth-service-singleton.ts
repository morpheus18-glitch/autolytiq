import bcrypt from 'bcrypt';
import crypto from 'crypto';

import { prisma } from '../prisma';
import { AuthService, type AuthServiceDependencies } from './auth-service';

const defaultDependencies: AuthServiceDependencies = {
  prisma,
  compare: bcrypt.compare,
  hash: bcrypt.hash,
  randomBytes: crypto.randomBytes,
  now: () => new Date(),
};

let defaultService: AuthService | undefined;

function getDefaultAuthService(): AuthService {
  if (!defaultService) {
    defaultService = new AuthService(defaultDependencies);
  }
  return defaultService;
}

export const authService = process.env.NODE_ENV === 'test' ? undefined : getDefaultAuthService();

export const authenticateWithTenantCredentials = (
  options: Parameters<AuthService['authenticateWithTenantCredentials']>[0],
) => getDefaultAuthService().authenticateWithTenantCredentials(options);

export const issueTenantPasswordResetToken = (
  options: Parameters<AuthService['issuePasswordResetToken']>[0],
) => getDefaultAuthService().issuePasswordResetToken(options);

export const validateTenantPasswordResetToken = (token: string) =>
  getDefaultAuthService().validatePasswordResetToken(token);

export const resetPasswordWithTenantToken = (token: string, password: string) =>
  getDefaultAuthService().resetPasswordWithToken(token, password);

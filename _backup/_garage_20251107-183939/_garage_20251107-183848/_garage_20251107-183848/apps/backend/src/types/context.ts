import type { Role } from './roles';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  tenantId?: string;
  name?: string;
}

export interface RequestContext {
  tenantId?: string;
  user?: AuthenticatedUser;
  roles: Role[];
}

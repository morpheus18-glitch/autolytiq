import { Router } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, runWithTenant } from '../lib/prisma';
import { ApiError } from '../lib/errors';
import { env } from '../config/env';

const router = Router();

/**
 * Login endpoint
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { storeId, username, password } = req.body;

    if (!username || !password) {
      throw new ApiError('VALIDATION_ERROR', 'Username and password are required');
    }

    // Find user by email (username field contains email)
    // Use $queryRawUnsafe to bypass tenant middleware since we don't have tenant context yet
    const users = await prisma.$queryRawUnsafe<Array<{
      id: string;
      tenantId: string;
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: string;
      isSuperAdmin: boolean;
      permissions: any;
      customPermissions: any;
      status: string;
    }>>(`
      SELECT u.id, u.tenant_id as "tenantId", u.email, u.password, u.first_name as "firstName", u.last_name as "lastName",
             u.role, u.is_super_admin as "isSuperAdmin", u.permissions, u.custom_permissions as "customPermissions", u.status,
             t.id as "tenant_id", t.name as "tenant_name", t.subdomain as "tenant_subdomain", t.status as "tenant_status"
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))
        AND u.status = 'ACTIVE'
      LIMIT 1
    `, username);

    if (!users || users.length === 0) {
      throw new ApiError('UNAUTHORIZED', 'Invalid credentials', { status: 401 });
    }

    const user = users[0] as any;

    if (!user) {
      throw new ApiError('UNAUTHORIZED', 'Invalid credentials', { status: 401 });
    }

    // Verify tenant is active
    if (user.tenant_status !== 'ACTIVE') {
      throw new ApiError('FORBIDDEN', 'Account is not active');
    }

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError('UNAUTHORIZED', 'Invalid credentials', { status: 401 });
    }

    // Update last login using raw SQL to avoid tenant middleware issues
    await prisma.$executeRawUnsafe(
      `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
      user.id
    );

    // Create JWT token
    const privateKey = env.JWT_PRIVATE_KEY;
    if (!privateKey) {
      throw new ApiError('SERVER_ERROR', 'JWT private key not configured');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
        roles: [user.role],
        isSuperAdmin: user.isSuperAdmin,
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '7d',
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      }
    );

    // Return user data
    res.json({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      permissions: user.permissions,
      customPermissions: user.customPermissions,
      token,
      access: {
        homePath: '/dashboard',
        allowedRoutes: ['*'], // TODO: implement route-level permissions
        navigationSections: ['inventory', 'crm', 'sales', 'finance', 'reports'],
        quickActions: ['/customers', '/inventory', '/deals'],
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get current user
 * GET /api/auth/user
 */
router.get('/user', async (req, res, next) => {
  try {
    // BYPASS MODE: If BYPASS_AUTH is enabled, skip JWT and auto-login the first active user
    if (process.env.BYPASS_AUTH === 'true') {
      console.log('[AUTH BYPASS] Auto-logging in first active user');

      const users = await prisma.$queryRawUnsafe<Array<{
        id: string;
        tenantId: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        isSuperAdmin: boolean;
        permissions: any;
        customPermissions: any;
        status: string;
      }>>(`
        SELECT u.id, u.tenant_id as "tenantId", u.email, u.first_name as "firstName", u.last_name as "lastName",
               u.role, u.is_super_admin as "isSuperAdmin", u.permissions, u.custom_permissions as "customPermissions", u.status
        FROM users u
        WHERE u.status = 'ACTIVE'
        LIMIT 1
      `);

      if (users && users.length > 0) {
        const user = users[0];
        console.log('[AUTH BYPASS] Logged in as:', user.email);

        return res.json({
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isSuperAdmin: user.isSuperAdmin,
          permissions: user.permissions,
          customPermissions: user.customPermissions,
          access: {
            homePath: '/dashboard',
            allowedRoutes: ['*'],
            navigationSections: ['inventory', 'crm', 'sales', 'finance', 'reports'],
            quickActions: ['/customers', '/inventory', '/deals'],
          },
        });
      }
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError('UNAUTHORIZED', 'No authorization token provided', { status: 401 });
    }

    const token = authHeader.substring(7);
    const publicKey = env.JWT_PUBLIC_KEY;
    if (!publicKey) {
      throw new ApiError('SERVER_ERROR', 'JWT public key not configured');
    }

    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as any;

    if (!decoded.sub) {
      throw new ApiError('UNAUTHORIZED', 'Invalid token format', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError('UNAUTHORIZED', 'User not found', { status: 401 });
    }

    res.json({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
      permissions: user.permissions,
      customPermissions: user.customPermissions,
      access: {
        homePath: '/dashboard',
        allowedRoutes: ['*'],
        navigationSections: ['inventory', 'crm', 'sales', 'finance', 'reports'],
        quickActions: ['/customers', '/inventory', '/deals'],
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Logout endpoint
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  // For JWT-based auth, logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

export { router as authRouter };

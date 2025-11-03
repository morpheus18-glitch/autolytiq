import { Router } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../lib/errors.js';
import { env } from '../config/env.js';

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
    const user = await prisma.user.findFirst({
      where: {
        email: username.toLowerCase().trim(),
        status: 'ACTIVE',
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError('UNAUTHORIZED', 'Invalid credentials');
    }

    // Verify tenant is active
    if (user.tenant.status !== 'ACTIVE') {
      throw new ApiError('FORBIDDEN', 'Account is not active');
    }

    // Verify password
    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError('UNAUTHORIZED', 'Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

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
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError('UNAUTHORIZED', 'No authorization token provided');
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
      throw new ApiError('UNAUTHORIZED', 'Invalid token format');
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
      throw new ApiError('UNAUTHORIZED', 'User not found');
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

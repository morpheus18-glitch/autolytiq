import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// JWT secret - in production, load from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Mock user database (replace with real database queries)
interface User {
  id: string;
  username: string;
  email: string;
  password: string; // hashed
  role: string;
  firstName: string;
  lastName: string;
  tenantId: string;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
}

// Demo users with bcrypt hashed passwords (password: demo123)
const DEMO_PASSWORD_HASH = '$2b$10$cltSK88XZH8rVC8U6SDDVuP9fwQbgm1kjFEF8mGGTkkzJPgqdjziO';

const mockUsers: User[] = [
  {
    id: 'user-001',
    username: 'admin',
    email: 'admin@demo.com',
    password: DEMO_PASSWORD_HASH,
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    tenantId: 'tenant-demo',
  },
  {
    id: 'user-002',
    username: 'sales',
    email: 'sales@demo.com',
    password: DEMO_PASSWORD_HASH,
    role: 'salesperson',
    firstName: 'John',
    lastName: 'Salesperson',
    tenantId: 'tenant-demo',
  },
  {
    id: 'user-003',
    username: 'manager',
    email: 'manager@demo.com',
    password: DEMO_PASSWORD_HASH,
    role: 'sales_manager',
    firstName: 'Jane',
    lastName: 'Manager',
    tenantId: 'tenant-demo',
  },
];

const mockTenants: Record<string, Tenant> = {
  'demo': {
    id: 'tenant-demo',
    name: 'Demo Motors',
    slug: 'demo',
  },
};

/**
 * POST /api/auth/login
 * Login with store ID, username, and password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { storeId, username, password } = req.body;

    // Validate input
    if (!storeId || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Store ID, username, and password are required',
      });
    }

    // Check if tenant exists
    const tenant = mockTenants[storeId.toLowerCase()];
    if (!tenant) {
      return res.status(401).json({
        success: false,
        message: 'Invalid store ID',
      });
    }

    // Find user by username
    const user = mockUsers.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.tenantId === tenant.id
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        tenantId: tenant.id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return success response
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/verify
 * Verify JWT token and return user info
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
      role: string;
      tenantId: string;
    };

    // Find user
    const user = mockUsers.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find tenant
    const tenant = Object.values(mockTenants).find((t) => t.id === decoded.tenantId);
    if (!tenant) {
      return res.status(401).json({
        success: false,
        message: 'Tenant not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token removal, optional server-side blacklist)
 */
router.post('/logout', (req: Request, res: Response) => {
  // In a real implementation, you might:
  // - Add token to a blacklist
  // - Clear session
  // For now, just acknowledge the logout
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;

import type { Express } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { 
  insertSystemUserSchema, 
  insertSystemRoleSchema, 
  type SystemUser, 
  type SystemRole, 
  type InsertSystemUser, 
  type InsertSystemRole,
  type InsertActivityLogEntry
} from "@shared/schema";
import { requireSessionAuth, isSuperUser } from "./session-auth";

// Permission check middleware
const requirePermission = (permission: string) => {
  return (req: any, res: any, next: any) => {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const permissions = Array.isArray(sessionUser.permissions) ? sessionUser.permissions : [];

    const hasPermission =
      isSuperUser(sessionUser) ||
      permissions.includes('*') ||
      permissions.includes(permission) ||
      permissions.some((value) => value.endsWith('.*') && permission.startsWith(value.replace('.*', ''))) ||
      permissions.some((value) => permission.startsWith(`${value}:`));

    if (!hasPermission) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

export function registerUserRoutes(app: Express): void {
  // Get all users - temporarily public for development
  app.get('/api/users', async (req, res) => {
    try {
      const users = await storage.getAllSystemUsers();
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  // Get all roles - temporarily public for development  
  app.get('/api/roles', async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Failed to fetch roles' });
    }
  });

  // Create new user - temporarily public for development
  app.post('/api/users', async (req, res) => {
    try {
      const userData = req.body;
      
      // Generate unique ID if not provided
      if (!userData.id) {
        userData.id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      // Hash password if provided
      if (userData.password) {
        userData.passwordHash = await bcrypt.hash(userData.password, 10);
        delete userData.password;
      }

      const user = await storage.createSystemUser(userData);
      
      // Log activity
      await storage.logActivity({
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: userData.id,
        action: 'user_created',
        description: `User ${userData.firstName} ${userData.lastName} was created`,
        metadata: { userRole: userData.role }
      });

      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Update user - temporarily public for development
  app.put('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Hash password if being updated
      if (updates.password) {
        updates.passwordHash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const user = await storage.updateSystemUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Log activity
      await storage.logActivity({
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: id,
        action: 'user_updated',
        description: `User ${user.firstName} ${user.lastName} was updated`,
        metadata: { updates: Object.keys(updates) }
      });

      res.json(user);
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Delete user - temporarily public for development
  app.delete('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await storage.getSystemUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await storage.deleteSystemUser(id);

      // Log activity
      await storage.logActivity({
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: id,
        action: 'user_deleted',
        description: `User ${user.firstName} ${user.lastName} was deleted`,
        metadata: { deletedUser: user.email }
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // User management endpoints
  app.get('/api/users', requireSessionAuth, requirePermission('admin.users'), async (req, res) => {
    try {
      const users = await storage.getAllSystemUsers();
      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/users/:id', requireSessionAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Users can view their own profile, admins can view any
      if (req.user.userId !== id && !req.user.permissions.includes('admin.users')) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const user = await storage.getSystemUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/users', requireSessionAuth, requirePermission('admin.users'), async (req, res) => {
    try {
      const userData = insertSystemUserSchema.parse(req.body);
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password || 'defaultPassword123', 10);
      
      const newUser = await storage.createSystemUser({
        ...userData,
        passwordHash,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      // Log activity
      await storage.logActivity({
        id: `activity_${Date.now()}`,
        userId: req.user.userId,
        action: 'user_created',
        details: `Created user: ${newUser.email}`,
      });

      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/users/:id', requireSessionAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Users can update their own profile, admins can update any
      if (req.user.userId !== id && !req.user.permissions.includes('admin.users')) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updates = req.body;
      
      // If password is being updated, hash it
      if (updates.password) {
        updates.passwordHash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const updatedUser = await storage.updateSystemUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Log activity
      await storage.logActivity({
        id: `activity_${Date.now()}`,
        userId: req.user.userId,
        action: 'user_updated',
        details: `Updated user: ${updatedUser.email}`,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/users/:id', requireSessionAuth, requirePermission('admin.users'), async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent self-deletion
      if (req.user.userId === id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      const user = await storage.getSystemUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await storage.deleteSystemUser(id);

      // Log activity
      await storage.logActivity({
        id: `activity_${Date.now()}`,
        userId: req.user.userId,
        action: 'user_deleted',
        details: `Deleted user: ${user.email}`,
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Role management endpoints
  app.get('/api/roles', requireSessionAuth, requirePermission('admin.users'), async (req, res) => {
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      console.error('Get roles error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/roles', requireSessionAuth, requirePermission('admin.users'), async (req, res) => {
    try {
      const roleData = insertSystemRoleSchema.parse(req.body);
      
      const newRole = await storage.createRole({
        ...roleData,
        id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      // Log activity
      await storage.logActivity({
        id: `activity_${Date.now()}`,
        userId: req.user.userId,
        action: 'role_created',
        details: `Created role: ${newRole.name}`,
      });

      res.status(201).json(newRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Create role error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Activity log endpoint
  app.get('/api/activity', requireSessionAuth, requirePermission('admin.audit'), async (req, res) => {
    try {
      const { userId, limit = 50, offset = 0 } = req.query;
      
      const activities = await storage.getActivityLog({
        userId: userId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(activities);
    } catch (error) {
      console.error('Get activity error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User profile endpoint
  app.get('/api/profile', requireSessionAuth, async (req, res) => {
    try {
      const user = await storage.getSystemUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        department: user.department,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        profileImage: user.profileImage,
        permissions: user.permissions,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/profile', requireSessionAuth, async (req, res) => {
    try {
      const updates = req.body;
      
      // Remove sensitive fields that shouldn't be updated via profile
      delete updates.id;
      delete updates.email;
      delete updates.role;
      delete updates.permissions;
      delete updates.isActive;
      
      // If password is being updated, hash it
      if (updates.password) {
        updates.passwordHash = await bcrypt.hash(updates.password, 10);
        delete updates.password;
      }

      const updatedUser = await storage.updateSystemUser(req.user.userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Log activity
      await storage.logActivity({
        id: `activity_${Date.now()}`,
        userId: req.user.userId,
        action: 'profile_updated',
        details: 'User updated their profile',
      });

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        role: updatedUser.role,
        department: updatedUser.department,
        phone: updatedUser.phone,
        address: updatedUser.address,
        bio: updatedUser.bio,
        profileImage: updatedUser.profileImage,
        permissions: updatedUser.permissions,
        preferences: updatedUser.preferences,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
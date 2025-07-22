import express from 'express';
import { db } from './db';
import { notifications, notificationTemplates, notificationPreferences } from '@shared/schema';
import { eq, desc, and, isNull, or, gt, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = express.Router();

// Get user notifications
router.get('/', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          or(eq(notifications.userId, userId), isNull(notifications.userId)),
          or(isNull(notifications.expiresAt), gt(notifications.expiresAt, new Date()))
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          eq(notifications.id, id),
          or(eq(notifications.userId, userId), isNull(notifications.userId))
        )
      );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          or(eq(notifications.userId, userId), isNull(notifications.userId)),
          eq(notifications.isRead, false)
        )
      );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread count
router.get('/unread-count', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          or(eq(notifications.userId, userId), isNull(notifications.userId)),
          eq(notifications.isRead, false),
          or(isNull(notifications.expiresAt), gt(notifications.expiresAt, new Date()))
        )
      );

    res.json({ count: count[0]?.count || 0 });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create notification (admin only)
const createNotificationSchema = z.object({
  type: z.string(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  title: z.string(),
  message: z.string(),
  actionUrl: z.string().optional(),
  actionData: z.any().optional(),
  userId: z.string().optional(),
  expiresAt: z.string().optional(),
});

router.post('/', async (req: any, res) => {
  try {
    const currentUserId = req.user?.claims?.sub;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const data = createNotificationSchema.parse(req.body);
    
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    await db
      .insert(notifications)
      .values({
        id: notificationId,
        userId: data.userId || null,
        type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl || null,
        actionData: data.actionData || null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      });

    res.json({ message: 'Notification created successfully', id: notificationId });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get notification templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await db
      .select()
      .from(notificationTemplates)
      .where(eq(notificationTemplates.isActive, true))
      .orderBy(notificationTemplates.type, notificationTemplates.trigger);

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user notification preferences
router.get('/preferences', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const preferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update notification preferences
const preferencesSchema = z.object({
  type: z.string(),
  enabled: z.boolean(),
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
});

router.put('/preferences/:type', async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { type } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const data = preferencesSchema.parse(req.body);
    
    const prefId = `pref_${userId}_${type}`;
    
    await db
      .insert(notificationPreferences)
      .values({
        id: prefId,
        userId,
        type,
        enabled: data.enabled,
        pushEnabled: data.pushEnabled,
        emailEnabled: data.emailEnabled,
        smsEnabled: data.smsEnabled,
      })
      .onConflictDoUpdate({
        target: notificationPreferences.id,
        set: {
          enabled: data.enabled,
          pushEnabled: data.pushEnabled,
          emailEnabled: data.emailEnabled,
          smsEnabled: data.smsEnabled,
        },
      });

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
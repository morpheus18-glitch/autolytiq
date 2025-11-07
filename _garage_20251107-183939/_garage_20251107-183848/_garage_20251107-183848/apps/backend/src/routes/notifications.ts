/**
 * Notifications API
 *
 * Real-time notification system with:
 * - Create and send notifications
 * - Mark as read/unread
 * - Delete notifications
 * - Get user notifications with pagination
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@repo/db';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();
router.use(authMiddleware);
router.use(tenantMiddleware);

// Validation schemas
const createNotificationSchema = z.object({
  type: z.enum(['deal', 'lead', 'message', 'task', 'system']),
  title: z.string().min(1),
  message: z.string().min(1),
  link: z.string().optional(),
  userId: z.string(),
  metadata: z.any().optional(),
});

// =============================================================================
// GET /api/notifications - Get user notifications
// =============================================================================

router.get('/', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { tenantId, userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({
        where: { tenantId, userId, isRead: false },
      }),
    ]);

    res.json({
      notifications,
      unreadCount,
      total: await prisma.notification.count({
        where: { tenantId, userId },
      }),
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// =============================================================================
// POST /api/notifications - Create notification
// =============================================================================

router.post('/', async (req, res) => {
  try {
    const body = createNotificationSchema.parse(req.body);
    const tenantId = req.tenantId!;

    const notification = await prisma.notification.create({
      data: {
        tenantId,
        userId: body.userId,
        type: body.type,
        title: body.title,
        message: body.message,
        link: body.link,
        metadata: body.metadata as any,
        isRead: false,
      },
    });

    // TODO: Send via WebSocket to user
    // broadcastToUser(body.userId, notification);

    res.status(201).json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to create notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// =============================================================================
// POST /api/notifications/:id/read - Mark as read
// =============================================================================

router.post('/:id/read', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, tenantId, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// =============================================================================
// POST /api/notifications/mark-all-read - Mark all as read
// =============================================================================

router.post('/mark-all-read', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { tenantId, userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// =============================================================================
// DELETE /api/notifications/:id - Delete notification
// =============================================================================

router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, tenantId, userId },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;

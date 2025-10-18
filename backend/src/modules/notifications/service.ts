import prisma from '../../lib/prisma.js';
import type { NotificationQuery } from './dto.js';

export async function listNotifications(tenantId: string, userId: string, query: NotificationQuery) {
  const where = {
    tenantId,
    userId,
    ...(query.status === 'unread' ? { isRead: false } : {}),
  } as const;

  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: query.limit,
  });
}

export async function markNotificationsRead(
  tenantId: string,
  userId: string,
  ids?: string[],
) {
  const where = {
    tenantId,
    userId,
    ...(ids && ids.length > 0 ? { id: { in: ids } } : { isRead: false }),
  };

  await prisma.notification.updateMany({
    where,
    data: { isRead: true, readAt: new Date() },
  });

  return prisma.notification.findMany({
    where: { tenantId, userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

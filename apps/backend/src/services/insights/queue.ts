/**
 * Insight Queue Manager
 *
 * Manages insight queue operations: retrieval, acknowledgment, snoozing, and muting
 */

import { PrismaClient } from '@repo/db';
import { createId as cuid } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

/**
 * Get prioritized queue for user/role
 * Returns insights ordered by score (descending)
 * Filters out expired and snoozed items
 */
export async function getQueue(
  tenantId: string,
  role: string,
  userId?: string
) {
  const now = new Date();

  return prisma.insightQueue.findMany({
    where: {
      tenantId,
      role,
      userId: userId || undefined,
      state: { in: ['new', 'seen'] },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ],
      AND: [
        {
          OR: [
            { snoozeUntil: null },
            { snoozeUntil: { lte: now } },
          ],
        },
      ],
    },
    orderBy: [
      { score: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

/**
 * Mark insight as acknowledged (done)
 */
export async function ackInsight(id: string, userId: string) {
  const insight = await prisma.insightQueue.findUnique({
    where: { id },
  });

  if (!insight) {
    throw new Error('Insight not found');
  }

  return prisma.insightQueue.update({
    where: { id },
    data: {
      state: 'done',
      updatedAt: new Date(),
    },
  });
}

/**
 * Snooze insight for specified minutes
 */
export async function snoozeInsight(
  id: string,
  minutes: number,
  userId: string
) {
  const insight = await prisma.insightQueue.findUnique({
    where: { id },
  });

  if (!insight) {
    throw new Error('Insight not found');
  }

  const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);

  return prisma.insightQueue.update({
    where: { id },
    data: {
      state: 'seen',
      snoozeUntil,
      updatedAt: new Date(),
    },
  });
}

/**
 * Mute a specific rule for tenant/user
 * If minutes is provided, mute temporarily
 * If minutes is undefined, mute permanently (until manually unmuted)
 */
export async function muteRule(
  tenantId: string,
  ruleKey: string,
  minutes?: number,
  userId?: string
) {
  const until = minutes ? new Date(Date.now() + minutes * 60 * 1000) : null;

  // Check if mute already exists
  const existingMute = await prisma.insightMute.findFirst({
    where: {
      tenantId,
      ruleKey,
      userId: userId || null,
    },
  });

  if (existingMute) {
    // Update existing mute
    return prisma.insightMute.update({
      where: { id: existingMute.id },
      data: {
        until,
        createdAt: new Date(), // Reset creation time
      },
    });
  }

  // Create new mute
  return prisma.insightMute.create({
    data: {
      id: cuid(),
      tenantId,
      ruleKey,
      userId: userId || null,
      until,
      createdAt: new Date(),
    },
  });
}

/**
 * Remove mute for a specific rule
 */
export async function unmuteRule(
  tenantId: string,
  ruleKey: string,
  userId?: string
) {
  const mute = await prisma.insightMute.findFirst({
    where: {
      tenantId,
      ruleKey,
      userId: userId || null,
    },
  });

  if (!mute) {
    throw new Error('Mute not found');
  }

  return prisma.insightMute.delete({
    where: { id: mute.id },
  });
}

/**
 * Get all active mutes for a tenant
 */
export async function getMutes(tenantId: string, userId?: string) {
  const now = new Date();

  return prisma.insightMute.findMany({
    where: {
      tenantId,
      userId: userId || undefined,
      OR: [
        { until: null },
        { until: { gt: now } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Clean up expired insights and mutes (housekeeping task)
 */
export async function cleanupExpired(tenantId: string) {
  const now = new Date();

  const [deletedInsights, deletedMutes] = await Promise.all([
    // Delete expired insights
    prisma.insightQueue.deleteMany({
      where: {
        tenantId,
        expiresAt: { lte: now },
      },
    }),
    // Delete expired mutes
    prisma.insightMute.deleteMany({
      where: {
        tenantId,
        until: { lte: now },
      },
    }),
  ]);

  return {
    deletedInsights: deletedInsights.count,
    deletedMutes: deletedMutes.count,
  };
}

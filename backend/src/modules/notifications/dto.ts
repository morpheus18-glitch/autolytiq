import { z } from 'zod';

export const notificationQuerySchema = z.object({
  status: z.enum(['all', 'unread']).default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type NotificationQuery = z.infer<typeof notificationQuerySchema>;

export const notificationMarkReadSchema = z.object({
  ids: z.array(z.string().min(1)).optional(),
});

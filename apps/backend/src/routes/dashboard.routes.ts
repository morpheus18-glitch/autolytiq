import { Router, type RequestHandler } from 'express';
import { db } from '@repo/db';
import { z } from 'zod';
import { getDefaultLayout } from '../services/dashboard.service';

export const dashboardRouter = Router();

/**
 * Layout JSON Schema
 */
const layoutSchema = z.object({
  columns: z.number().min(1).max(4).default(4),
  widgets: z.array(z.object({
    id: z.string(),
    key: z.string(),
    position: z.object({
      x: z.number().min(0),
      y: z.number().min(0),
    }),
    size: z.object({
      w: z.number().min(1).max(4),
      h: z.number().min(1).max(4),
    }),
    config: z.any().optional(),
  })),
});

/**
 * GET /api/dashboard/layout - Get user's dashboard layout
 */
dashboardRouter.get(
  '/layout',
  (async (req, res, next) => {
    try {
      const { role } = req.query;
      const userId = req.userId!;
      const tenantId = req.tenantId!;

      // Fetch user's saved layout
      let layout = await db.dashboardLayout.findUnique({
        where: {
          userId_role: {
            userId,
            role: (role as any) || null,
          },
        },
      });

      // If no saved layout, return role default
      if (!layout) {
        const defaultLayout = getDefaultLayout(role as any);
        return res.json({
          data: {
            layout: defaultLayout,
            isDefault: true,
          }
        });
      }

      res.json({
        data: {
          layout: layout.layout,
          isDefault: layout.isDefault,
        }
      });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * PUT /api/dashboard/layout - Save user's dashboard layout
 */
dashboardRouter.put(
  '/layout',
  (async (req, res, next) => {
    try {
      const { role, layout } = req.body;
      const userId = req.userId!;
      const tenantId = req.tenantId!;

      // Validate layout
      const validationResult = layoutSchema.safeParse(layout);
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid layout format',
          details: validationResult.error.errors,
        });
      }

      const savedLayout = await db.dashboardLayout.upsert({
        where: {
          userId_role: {
            userId,
            role: role || null,
          },
        },
        update: {
          layout: validationResult.data,
          updatedAt: new Date(),
        },
        create: {
          userId,
          tenantId,
          role: role || null,
          layout: validationResult.data,
          isDefault: false,
        },
      });

      res.json({ data: savedLayout });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * DELETE /api/dashboard/layout - Reset to default layout
 */
dashboardRouter.delete(
  '/layout',
  (async (req, res, next) => {
    try {
      const { role } = req.query;
      const userId = req.userId!;

      await db.dashboardLayout.deleteMany({
        where: {
          userId,
          role: (role as any) || null,
        },
      });

      const defaultLayout = getDefaultLayout(role as any);
      res.json({
        data: {
          layout: defaultLayout,
          isDefault: true,
        }
      });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

/**
 * GET /api/dashboard/defaults/:role - Get default layout for role
 */
dashboardRouter.get(
  '/defaults/:role',
  (async (req, res, next) => {
    try {
      const { role } = req.params;
      const defaultLayout = getDefaultLayout(role as any);
      res.json({ data: defaultLayout });
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

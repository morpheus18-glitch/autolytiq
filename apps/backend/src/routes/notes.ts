/**
 * Notes API Routes
 *
 * Handles context-aware note creation and retrieval
 * Notes automatically attach to the correct entity based on context
 */

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@repo/db';
import { authMiddleware } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';

const router = Router();

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Validation schemas
const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  context: z.enum(['CUSTOMER', 'SHOWROOM', 'APPRAISAL', 'DEAL', 'VEHICLE', 'LEAD', 'SERVICE', 'STANDALONE']),
  entityId: z.string(),
  entityType: z.string().optional(),
  isPrivate: z.boolean().default(false),
  tags: z.array(z.string()).default([]),

  // Optional entity IDs for relationships
  customerId: z.string().optional(),
  appraisalId: z.string().optional(),
  dealId: z.string().optional(),
  vehicleId: z.string().optional(),
  leadId: z.string().optional(),
  serviceOrderId: z.string().optional(),
});

const getNotesByContextSchema = z.object({
  context: z.enum(['CUSTOMER', 'SHOWROOM', 'APPRAISAL', 'DEAL', 'VEHICLE', 'LEAD', 'SERVICE', 'STANDALONE']),
  entityId: z.string(),
  includePrivate: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// =============================================================================
// POST /api/notes - Create a new note
// =============================================================================

router.post('/', async (req, res) => {
  try {
    const body = createNoteSchema.parse(req.body);
    const tenantId = req.tenantId!;
    const userId = req.user!.id;
    const userName = `${req.user!.firstName || ''} ${req.user!.lastName || ''}`.trim() || req.user!.username;

    // Create note
    const note = await prisma.note.create({
      data: {
        tenantId,
        content: body.content,
        context: body.context,
        entityId: body.entityId,
        entityType: body.entityType,
        isPrivate: body.isPrivate,
        tags: body.tags,
        createdBy: userId,
        createdByName: userName,

        // Optional relationships
        customerId: body.customerId,
        appraisalId: body.appraisalId,
        dealId: body.dealId,
        vehicleId: body.vehicleId,
        leadId: body.leadId,
        serviceOrderId: body.serviceOrderId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create timeline entry for customer/lead contexts
    if (body.context === 'CUSTOMER' || body.context === 'SHOWROOM' || body.context === 'LEAD') {
      const timelineEntityId = body.customerId || body.leadId;
      const timelineEntityType = body.context === 'LEAD' ? 'LEAD' : 'CUSTOMER';

      if (timelineEntityId) {
        await prisma.timelineEvent.create({
          data: {
            tenantId,
            entityId: timelineEntityId,
            entityType: timelineEntityType,
            eventType: 'NOTE_ADDED',
            title: `Note added by ${userName}`,
            description: body.content.substring(0, 200), // First 200 chars
            metadata: {
              noteId: note.id,
              context: body.context,
              tags: body.tags,
            },
            createdBy: userId,
          },
        });
      }
    }

    res.status(201).json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to create note:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// =============================================================================
// GET /api/notes - Get notes by context and entity
// =============================================================================

router.get('/', async (req, res) => {
  try {
    const query = getNotesByContextSchema.parse({
      context: req.query.context,
      entityId: req.query.entityId,
      includePrivate: req.query.includePrivate === 'true',
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
    });

    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const notes = await prisma.note.findMany({
      where: {
        tenantId,
        context: query.context,
        entityId: query.entityId,
        // Only include private notes if they belong to the current user
        OR: [
          { isPrivate: false },
          query.includePrivate ? { isPrivate: true, createdBy: userId } : {},
        ],
        // Filter by tags if provided
        ...(query.tags && query.tags.length > 0
          ? {
              tags: {
                hasSome: query.tags,
              },
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(notes);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to fetch notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// =============================================================================
// GET /api/notes/:id - Get a specific note
// =============================================================================

router.get('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    const note = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        tenantId,
        // Only show private notes to the creator
        OR: [
          { isPrivate: false },
          { isPrivate: true, createdBy: userId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Failed to fetch note:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// =============================================================================
// PATCH /api/notes/:id - Update a note
// =============================================================================

router.patch('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    // Verify ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        tenantId,
        createdBy: userId, // Only creator can update
      },
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found or you do not have permission to update it' });
    }

    const updateData = z
      .object({
        content: z.string().min(1).max(5000).optional(),
        tags: z.array(z.string()).optional(),
        isPrivate: z.boolean().optional(),
      })
      .parse(req.body);

    const updatedNote = await prisma.note.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(updatedNote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Failed to update note:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// =============================================================================
// DELETE /api/notes/:id - Delete a note
// =============================================================================

router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user!.id;

    // Verify ownership
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        tenantId,
        createdBy: userId, // Only creator can delete
      },
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found or you do not have permission to delete it' });
    }

    await prisma.note.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;

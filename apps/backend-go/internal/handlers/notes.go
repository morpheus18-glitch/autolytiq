package handlers

import (
	"context"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/note"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// NotesHandler handles note-related requests
type NotesHandler struct {
	db *ent.Client
}

// NewNotesHandler creates a new notes handler
func NewNotesHandler(db *ent.Client) *NotesHandler {
	return &NotesHandler{db: db}
}

// List returns all notes for the tenant
func (h *NotesHandler) List(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Optional filtering
	entityType := c.Query("entityType") // customer, deal, vehicle, lead
	entityID := c.Query("entityId")
	createdByID := c.Query("createdById")
	isPinned := c.Query("isPinned") // "true" or "false"

	query := h.db.Note.
		Query().
		Where(note.TenantID(tenantID))

	if entityType != "" {
		query = query.Where(note.EntityType(entityType))
	}
	if entityID != "" {
		query = query.Where(note.EntityID(entityID))
	}
	if createdByID != "" {
		query = query.Where(note.CreatedByID(createdByID))
	}
	if isPinned == "true" {
		query = query.Where(note.IsPinned(true))
	} else if isPinned == "false" {
		query = query.Where(note.IsPinned(false))
	}

	// Load relationships
	notes, err := query.
		WithCreatedBy().
		Order(ent.Desc(note.FieldIsPinned), ent.Desc(note.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notes",
		})
	}

	return c.JSON(fiber.Map{
		"data": notes,
		"meta": fiber.Map{
			"total": len(notes),
		},
	})
}

// ListByEntity returns all notes for a specific entity (customer/deal/vehicle/lead)
func (h *NotesHandler) ListByEntity(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	entityType := c.Params("entityType")
	entityID := c.Params("entityId")
	ctx := context.Background()

	// Validate entity type
	validTypes := map[string]bool{
		"customer": true,
		"deal":     true,
		"vehicle":  true,
		"lead":     true,
	}
	if !validTypes[entityType] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid entity type. Must be: customer, deal, vehicle, or lead",
		})
	}

	notes, err := h.db.Note.
		Query().
		Where(
			note.And(
				note.TenantID(tenantID),
				note.EntityType(entityType),
				note.EntityID(entityID),
			),
		).
		WithCreatedBy().
		Order(ent.Desc(note.FieldIsPinned), ent.Desc(note.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch notes",
		})
	}

	return c.JSON(fiber.Map{
		"data": notes,
		"meta": fiber.Map{
			"total":      len(notes),
			"entityType": entityType,
			"entityId":   entityID,
		},
	})
}

// Get returns a single note by ID
func (h *NotesHandler) Get(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	noteID := c.Params("id")
	ctx := context.Background()

	n, err := h.db.Note.
		Query().
		Where(
			note.And(
				note.TenantID(tenantID),
				note.ID(noteID),
			),
		).
		WithCreatedBy().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Note not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch note",
		})
	}

	return c.JSON(fiber.Map{
		"data": n,
	})
}

// Create creates a new note
func (h *NotesHandler) Create(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	ctx := context.Background()

	// Parse request body
	var req struct {
		EntityType string `json:"entityType"` // customer, deal, vehicle, lead
		EntityID   string `json:"entityId"`
		Content    string `json:"content"`
		IsPinned   *bool  `json:"isPinned"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.EntityType == "" || req.EntityID == "" || req.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "entityType, entityId, and content are required",
		})
	}

	// Validate entity type
	validTypes := map[string]bool{
		"customer": true,
		"deal":     true,
		"vehicle":  true,
		"lead":     true,
	}
	if !validTypes[req.EntityType] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid entity type. Must be: customer, deal, vehicle, or lead",
		})
	}

	// Generate ID
	noteID := middleware.GenerateID()

	// Build create query
	createQuery := h.db.Note.Create().
		SetID(noteID).
		SetTenantID(tenantID).
		SetCreatedByID(userID).
		SetEntityType(req.EntityType).
		SetEntityID(req.EntityID).
		SetContent(req.Content)

	// Set optional fields
	if req.IsPinned != nil {
		createQuery.SetIsPinned(*req.IsPinned)
	}

	// Execute create
	newNote, err := createQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create note",
		})
	}

	// Load created_by relationship
	newNote, _ = h.db.Note.
		Query().
		Where(note.ID(newNote.ID)).
		WithCreatedBy().
		Only(ctx)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data": newNote,
	})
}

// Update updates an existing note
func (h *NotesHandler) Update(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	noteID := c.Params("id")
	ctx := context.Background()

	// Parse request body
	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify note exists and belongs to tenant
	existingNote, err := h.db.Note.
		Query().
		Where(
			note.And(
				note.TenantID(tenantID),
				note.ID(noteID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Note not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch note",
		})
	}

	// Verify user owns the note (only creator can edit)
	if existingNote.CreatedByID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only edit your own notes",
		})
	}

	// Build update query
	updateQuery := h.db.Note.UpdateOne(existingNote)

	// Update fields dynamically
	if val, ok := req["content"].(string); ok {
		updateQuery.SetContent(val)
	}
	if val, ok := req["isPinned"].(bool); ok {
		updateQuery.SetIsPinned(val)
	}

	// Execute update
	updated, err := updateQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update note",
		})
	}

	// Load created_by relationship
	updated, _ = h.db.Note.
		Query().
		Where(note.ID(updated.ID)).
		WithCreatedBy().
		Only(ctx)

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

// Delete deletes a note
func (h *NotesHandler) Delete(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	userID := middleware.GetUserID(c)
	noteID := c.Params("id")
	ctx := context.Background()

	// Verify note exists and belongs to tenant
	existingNote, err := h.db.Note.
		Query().
		Where(
			note.And(
				note.TenantID(tenantID),
				note.ID(noteID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Note not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch note",
		})
	}

	// Verify user owns the note (only creator can delete)
	if existingNote.CreatedByID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You can only delete your own notes",
		})
	}

	// Hard delete
	err = h.db.Note.DeleteOne(existingNote).Exec(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete note",
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}

// Pin pins/unpins a note
func (h *NotesHandler) Pin(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	noteID := c.Params("id")
	ctx := context.Background()

	// Parse request body
	var req struct {
		IsPinned bool `json:"isPinned"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify note exists and belongs to tenant
	existingNote, err := h.db.Note.
		Query().
		Where(
			note.And(
				note.TenantID(tenantID),
				note.ID(noteID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Note not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch note",
		})
	}

	// Update pin status
	updated, err := h.db.Note.
		UpdateOne(existingNote).
		SetIsPinned(req.IsPinned).
		Save(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update note",
		})
	}

	// Load created_by relationship
	updated, _ = h.db.Note.
		Query().
		Where(note.ID(updated.ID)).
		WithCreatedBy().
		Only(ctx)

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

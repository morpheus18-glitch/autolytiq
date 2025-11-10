package handlers

import (
	"context"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/lead"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// LeadsHandler handles lead-related requests
type LeadsHandler struct {
	db *ent.Client
}

// NewLeadsHandler creates a new leads handler
func NewLeadsHandler(db *ent.Client) *LeadsHandler {
	return &LeadsHandler{db: db}
}

// List returns all leads for the tenant
func (h *LeadsHandler) List(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Optional filtering by status
	status := c.Query("status")

	query := h.db.Lead.
		Query().
		Where(lead.TenantID(tenantID))

	if status != "" {
		query = query.Where(lead.Status(status))
	}

	leads, err := query.
		Order(ent.Desc(lead.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch leads",
		})
	}

	return c.JSON(fiber.Map{
		"data": leads,
		"meta": fiber.Map{
			"total": len(leads),
		},
	})
}

// Get returns a single lead by ID
func (h *LeadsHandler) Get(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	leadID := c.Params("id")
	ctx := context.Background()

	foundLead, err := h.db.Lead.
		Query().
		Where(
			lead.And(
				lead.TenantID(tenantID),
				lead.ID(leadID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Lead not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch lead",
		})
	}

	return c.JSON(fiber.Map{
		"data": foundLead,
	})
}

// Create creates a new lead
func (h *LeadsHandler) Create(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Parse request body
	var req struct {
		CustomerID      *string `json:"customerId"`
		Source          *string `json:"source"`
		Status          *string `json:"status"`
		Score           *int    `json:"score"`
		VehicleInterest *string `json:"vehicleInterest"`
		Notes           *string `json:"notes"`
		AssignedToID    *string `json:"assignedToId"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Generate ID
	leadID := middleware.GenerateID()

	// Build create query
	createQuery := h.db.Lead.Create().
		SetID(leadID).
		SetTenantID(tenantID)

	// Set optional fields
	if req.CustomerID != nil {
		createQuery.SetNillableCustomerID(req.CustomerID)
	}
	if req.Source != nil {
		createQuery.SetSource(*req.Source)
	}
	if req.Status != nil {
		createQuery.SetStatus(*req.Status)
	}
	if req.Score != nil {
		createQuery.SetScore(*req.Score)
	}
	if req.VehicleInterest != nil {
		createQuery.SetNillableVehicleInterest(req.VehicleInterest)
	}
	if req.Notes != nil {
		createQuery.SetNillableNotes(req.Notes)
	}
	if req.AssignedToID != nil {
		createQuery.SetNillableAssignedToID(req.AssignedToID)
	}

	// Execute create
	newLead, err := createQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create lead",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data": newLead,
	})
}

// Update updates an existing lead
func (h *LeadsHandler) Update(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	leadID := c.Params("id")
	ctx := context.Background()

	// Parse request body
	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify lead exists and belongs to tenant
	existingLead, err := h.db.Lead.
		Query().
		Where(
			lead.And(
				lead.TenantID(tenantID),
				lead.ID(leadID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Lead not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch lead",
		})
	}

	// Build update query
	updateQuery := h.db.Lead.UpdateOne(existingLead)

	// Update fields dynamically based on request
	if val, ok := req["status"].(string); ok {
		updateQuery.SetStatus(val)
	}
	if val, ok := req["score"].(float64); ok {
		updateQuery.SetScore(int(val))
	}
	if val, ok := req["vehicleInterest"].(string); ok {
		updateQuery.SetVehicleInterest(val)
	}
	if val, ok := req["notes"].(string); ok {
		updateQuery.SetNotes(val)
	}
	if val, ok := req["assignedToId"].(string); ok {
		updateQuery.SetAssignedToID(val)
	}

	// Execute update
	updated, err := updateQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update lead",
		})
	}

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

// Delete deletes a lead (hard delete since no deleted_at field in schema)
func (h *LeadsHandler) Delete(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	leadID := c.Params("id")
	ctx := context.Background()

	// Verify lead exists and belongs to tenant
	existingLead, err := h.db.Lead.
		Query().
		Where(
			lead.And(
				lead.TenantID(tenantID),
				lead.ID(leadID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Lead not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch lead",
		})
	}

	// Hard delete (no soft delete field in schema)
	err = h.db.Lead.DeleteOne(existingLead).Exec(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete lead",
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}

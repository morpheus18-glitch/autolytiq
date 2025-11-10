package handlers

import (
	"context"
	"fmt"
	"time"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/deal"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// DealsHandler handles deal-related requests
type DealsHandler struct {
	db *ent.Client
}

// NewDealsHandler creates a new deals handler
func NewDealsHandler(db *ent.Client) *DealsHandler {
	return &DealsHandler{db: db}
}

// List returns all deals for the tenant
func (h *DealsHandler) List(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Optional filtering
	status := c.Query("status")      // DRAFT, PENDING, APPROVED, CLOSED, etc.
	stage := c.Query("stage")        // LEAD, NEGOTIATION, F&I, DELIVERED
	customerID := c.Query("customerId")
	salespersonID := c.Query("salespersonId")

	query := h.db.Deal.
		Query().
		Where(deal.TenantID(tenantID))

	if status != "" {
		query = query.Where(deal.Status(status))
	}
	if stage != "" {
		query = query.Where(deal.Stage(stage))
	}
	if customerID != "" {
		query = query.Where(deal.CustomerID(customerID))
	}
	if salespersonID != "" {
		query = query.Where(deal.SalespersonID(salespersonID))
	}

	// Load relationships
	deals, err := query.
		WithCustomer().
		WithVehicle().
		WithSalesperson().
		Order(ent.Desc(deal.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch deals",
		})
	}

	return c.JSON(fiber.Map{
		"data": deals,
		"meta": fiber.Map{
			"total": len(deals),
		},
	})
}

// Get returns a single deal by ID
func (h *DealsHandler) Get(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	dealID := c.Params("id")
	ctx := context.Background()

	d, err := h.db.Deal.
		Query().
		Where(
			deal.And(
				deal.TenantID(tenantID),
				deal.ID(dealID),
			),
		).
		WithCustomer().
		WithVehicle().
		WithSalesperson().
		WithTradeIns().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Deal not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch deal",
		})
	}

	return c.JSON(fiber.Map{
		"data": d,
	})
}

// GetByDealNumber returns a deal by deal number
func (h *DealsHandler) GetByDealNumber(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	dealNumber := c.Params("dealNumber")
	ctx := context.Background()

	d, err := h.db.Deal.
		Query().
		Where(
			deal.And(
				deal.TenantID(tenantID),
				deal.DealNumber(dealNumber),
			),
		).
		WithCustomer().
		WithVehicle().
		WithSalesperson().
		WithTradeIns().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Deal not found with number: " + dealNumber,
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch deal",
		})
	}

	return c.JSON(fiber.Map{
		"data": d,
	})
}

// Create creates a new deal
func (h *DealsHandler) Create(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Parse request body
	var req struct {
		CustomerID    *string  `json:"customerId"`
		VehicleID     *string  `json:"vehicleId"`
		SalespersonID *string  `json:"salespersonId"`
		Status        *string  `json:"status"`
		Stage         *string  `json:"stage"`
		SalePrice     *int     `json:"salePrice"`
		DownPayment   *int     `json:"downPayment"`
		AmountFinanced *int    `json:"amountFinanced"`
		MonthlyPayment *int    `json:"monthlyPayment"`
		TermMonths    *int     `json:"termMonths"`
		InterestRate  *float64 `json:"interestRate"`
		GrossProfit   *int     `json:"grossProfit"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Generate ID and deal number
	dealID := middleware.GenerateID()
	dealNumber := generateDealNumber(tenantID)

	// Build create query
	createQuery := h.db.Deal.Create().
		SetID(dealID).
		SetTenantID(tenantID).
		SetDealNumber(dealNumber)

	// Set optional fields
	if req.CustomerID != nil {
		createQuery.SetNillableCustomerID(req.CustomerID)
	}
	if req.VehicleID != nil {
		createQuery.SetNillableVehicleID(req.VehicleID)
	}
	if req.SalespersonID != nil {
		createQuery.SetNillableSalespersonID(req.SalespersonID)
	}
	if req.Status != nil {
		createQuery.SetStatus(*req.Status)
	}
	if req.Stage != nil {
		createQuery.SetStage(*req.Stage)
	}
	if req.SalePrice != nil {
		createQuery.SetNillableSalePrice(req.SalePrice)
	}
	if req.DownPayment != nil {
		createQuery.SetNillableDownPayment(req.DownPayment)
	}
	if req.AmountFinanced != nil {
		createQuery.SetNillableAmountFinanced(req.AmountFinanced)
	}
	if req.MonthlyPayment != nil {
		createQuery.SetNillableMonthlyPayment(req.MonthlyPayment)
	}
	if req.TermMonths != nil {
		createQuery.SetNillableTermMonths(req.TermMonths)
	}
	if req.InterestRate != nil {
		createQuery.SetNillableInterestRate(req.InterestRate)
	}
	if req.GrossProfit != nil {
		createQuery.SetNillableGrossProfit(req.GrossProfit)
	}

	// Execute create
	newDeal, err := createQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create deal",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data": newDeal,
	})
}

// Update updates an existing deal
func (h *DealsHandler) Update(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	dealID := c.Params("id")
	ctx := context.Background()

	// Parse request body
	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify deal exists and belongs to tenant
	existingDeal, err := h.db.Deal.
		Query().
		Where(
			deal.And(
				deal.TenantID(tenantID),
				deal.ID(dealID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Deal not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch deal",
		})
	}

	// Build update query
	updateQuery := h.db.Deal.UpdateOne(existingDeal)

	// Update fields dynamically
	if val, ok := req["customerId"].(string); ok {
		updateQuery.SetCustomerID(val)
	}
	if val, ok := req["vehicleId"].(string); ok {
		updateQuery.SetVehicleID(val)
	}
	if val, ok := req["salespersonId"].(string); ok {
		updateQuery.SetSalespersonID(val)
	}
	if val, ok := req["status"].(string); ok {
		updateQuery.SetStatus(val)
	}
	if val, ok := req["stage"].(string); ok {
		updateQuery.SetStage(val)
	}
	if val, ok := req["salePrice"].(float64); ok {
		updateQuery.SetSalePrice(int(val))
	}
	if val, ok := req["downPayment"].(float64); ok {
		updateQuery.SetDownPayment(int(val))
	}
	if val, ok := req["amountFinanced"].(float64); ok {
		updateQuery.SetAmountFinanced(int(val))
	}
	if val, ok := req["monthlyPayment"].(float64); ok {
		updateQuery.SetMonthlyPayment(int(val))
	}
	if val, ok := req["termMonths"].(float64); ok {
		updateQuery.SetTermMonths(int(val))
	}
	if val, ok := req["interestRate"].(float64); ok {
		updateQuery.SetInterestRate(val)
	}
	if val, ok := req["grossProfit"].(float64); ok {
		updateQuery.SetGrossProfit(int(val))
	}

	// Execute update
	updated, err := updateQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update deal",
		})
	}

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

// Delete soft-deletes a deal (hard delete since no deleted_at in schema)
func (h *DealsHandler) Delete(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	dealID := c.Params("id")
	ctx := context.Background()

	// Verify deal exists and belongs to tenant
	existingDeal, err := h.db.Deal.
		Query().
		Where(
			deal.And(
				deal.TenantID(tenantID),
				deal.ID(dealID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Deal not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch deal",
		})
	}

	// Hard delete
	err = h.db.Deal.DeleteOne(existingDeal).Exec(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete deal",
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}

// Submit submits a deal for approval (status transition)
func (h *DealsHandler) Submit(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	dealID := c.Params("id")
	ctx := context.Background()

	// Verify deal exists and belongs to tenant
	existingDeal, err := h.db.Deal.
		Query().
		Where(
			deal.And(
				deal.TenantID(tenantID),
				deal.ID(dealID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Deal not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch deal",
		})
	}

	// Validate deal can be submitted
	if existingDeal.Status == "PENDING" || existingDeal.Status == "APPROVED" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Deal is already submitted or approved",
		})
	}

	// Check required fields
	if existingDeal.CustomerID == nil || existingDeal.VehicleID == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Deal must have a customer and vehicle before submission",
		})
	}

	// Update status to PENDING
	updated, err := h.db.Deal.
		UpdateOne(existingDeal).
		SetStatus("PENDING").
		SetStage("F&I").
		Save(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to submit deal",
		})
	}

	return c.JSON(fiber.Map{
		"data": updated,
		"message": "Deal submitted successfully",
	})
}

// Helper functions

func generateDealNumber(tenantID string) string {
	// Generate deal number: DL-YYYYMMDD-UNIX
	// Example: DL-20241109-1699564800
	now := time.Now()
	dateStr := now.Format("20060102")
	timestamp := now.Unix()
	return fmt.Sprintf("DL-%s-%d", dateStr, timestamp)
}

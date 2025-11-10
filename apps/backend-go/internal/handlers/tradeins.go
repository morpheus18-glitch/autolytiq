package handlers

import (
	"context"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/tradein"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// TradeInsHandler handles trade-in-related requests
type TradeInsHandler struct {
	db *ent.Client
}

// NewTradeInsHandler creates a new trade-ins handler
func NewTradeInsHandler(db *ent.Client) *TradeInsHandler {
	return &TradeInsHandler{db: db}
}

// List returns all trade-ins for the tenant
func (h *TradeInsHandler) List(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Optional filtering
	status := c.Query("status")       // PENDING, APPRAISED, ACCEPTED, REJECTED
	dealID := c.Query("dealId")
	customerID := c.Query("customerId")

	query := h.db.TradeIn.
		Query().
		Where(tradein.TenantID(tenantID))

	if status != "" {
		query = query.Where(tradein.Status(status))
	}
	if dealID != "" {
		query = query.Where(tradein.DealID(dealID))
	}
	if customerID != "" {
		query = query.Where(tradein.CustomerID(customerID))
	}

	// Load relationships
	tradeIns, err := query.
		WithDeal().
		WithCustomer().
		Order(ent.Desc(tradein.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch trade-ins",
		})
	}

	return c.JSON(fiber.Map{
		"data": tradeIns,
		"meta": fiber.Map{
			"total": len(tradeIns),
		},
	})
}

// Get returns a single trade-in by ID
func (h *TradeInsHandler) Get(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	tradeInID := c.Params("id")
	ctx := context.Background()

	ti, err := h.db.TradeIn.
		Query().
		Where(
			tradein.And(
				tradein.TenantID(tenantID),
				tradein.ID(tradeInID),
			),
		).
		WithDeal().
		WithCustomer().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Trade-in not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch trade-in",
		})
	}

	return c.JSON(fiber.Map{
		"data": ti,
	})
}

// GetByVIN returns a trade-in by VIN
func (h *TradeInsHandler) GetByVIN(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	vin := c.Params("vin")
	ctx := context.Background()

	ti, err := h.db.TradeIn.
		Query().
		Where(
			tradein.And(
				tradein.TenantID(tenantID),
				tradein.Vin(vin),
			),
		).
		WithDeal().
		WithCustomer().
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Trade-in not found with VIN: " + vin,
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch trade-in",
		})
	}

	return c.JSON(fiber.Map{
		"data": ti,
	})
}

// Create creates a new trade-in
func (h *TradeInsHandler) Create(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Parse request body
	var req struct {
		DealID           *string `json:"dealId"`
		CustomerID       *string `json:"customerId"`
		VIN              string  `json:"vin"`
		Year             int     `json:"year"`
		Make             string  `json:"make"`
		Model            string  `json:"model"`
		Trim             *string `json:"trim"`
		Mileage          int     `json:"mileage"`
		Condition        *string `json:"condition"`
		EstimatedValue   *int    `json:"estimatedValue"`
		PayoffAmount     *int    `json:"payoffAmount"`
		ActualCashValue  *int    `json:"actualCashValue"`
		Allowance        *int    `json:"allowance"`
		Status           *string `json:"status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.VIN == "" || req.Year == 0 || req.Make == "" || req.Model == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "VIN, year, make, and model are required",
		})
	}

	// Generate ID
	tradeInID := middleware.GenerateID()

	// Build create query
	createQuery := h.db.TradeIn.Create().
		SetID(tradeInID).
		SetTenantID(tenantID).
		SetVin(req.VIN).
		SetYear(req.Year).
		SetMake(req.Make).
		SetModel(req.Model).
		SetMileage(req.Mileage)

	// Set optional fields
	if req.DealID != nil {
		createQuery.SetNillableDealID(req.DealID)
	}
	if req.CustomerID != nil {
		createQuery.SetNillableCustomerID(req.CustomerID)
	}
	if req.Trim != nil {
		createQuery.SetNillableTrim(req.Trim)
	}
	if req.Condition != nil {
		createQuery.SetNillableCondition(req.Condition)
	}
	if req.EstimatedValue != nil {
		createQuery.SetNillableEstimatedValue(req.EstimatedValue)
	}
	if req.PayoffAmount != nil {
		createQuery.SetNillablePayoffAmount(req.PayoffAmount)
	}
	if req.ActualCashValue != nil {
		createQuery.SetNillableActualCashValue(req.ActualCashValue)
	}
	if req.Allowance != nil {
		createQuery.SetNillableAllowance(req.Allowance)
	}
	if req.Status != nil {
		createQuery.SetStatus(*req.Status)
	}

	// Execute create
	newTradeIn, err := createQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create trade-in",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data": newTradeIn,
	})
}

// Update updates an existing trade-in
func (h *TradeInsHandler) Update(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	tradeInID := c.Params("id")
	ctx := context.Background()

	// Parse request body
	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify trade-in exists and belongs to tenant
	existingTradeIn, err := h.db.TradeIn.
		Query().
		Where(
			tradein.And(
				tradein.TenantID(tenantID),
				tradein.ID(tradeInID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Trade-in not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch trade-in",
		})
	}

	// Build update query
	updateQuery := h.db.TradeIn.UpdateOne(existingTradeIn)

	// Update fields dynamically
	if val, ok := req["dealId"].(string); ok {
		updateQuery.SetDealID(val)
	}
	if val, ok := req["customerId"].(string); ok {
		updateQuery.SetCustomerID(val)
	}
	if val, ok := req["mileage"].(float64); ok {
		updateQuery.SetMileage(int(val))
	}
	if val, ok := req["condition"].(string); ok {
		updateQuery.SetCondition(val)
	}
	if val, ok := req["estimatedValue"].(float64); ok {
		updateQuery.SetEstimatedValue(int(val))
	}
	if val, ok := req["payoffAmount"].(float64); ok {
		updateQuery.SetPayoffAmount(int(val))
	}
	if val, ok := req["actualCashValue"].(float64); ok {
		updateQuery.SetActualCashValue(int(val))
	}
	if val, ok := req["allowance"].(float64); ok {
		updateQuery.SetAllowance(int(val))
	}
	if val, ok := req["status"].(string); ok {
		updateQuery.SetStatus(val)
	}
	if val, ok := req["trim"].(string); ok {
		updateQuery.SetTrim(val)
	}

	// Execute update
	updated, err := updateQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update trade-in",
		})
	}

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

// Delete deletes a trade-in
func (h *TradeInsHandler) Delete(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	tradeInID := c.Params("id")
	ctx := context.Background()

	// Verify trade-in exists and belongs to tenant
	existingTradeIn, err := h.db.TradeIn.
		Query().
		Where(
			tradein.And(
				tradein.TenantID(tenantID),
				tradein.ID(tradeInID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Trade-in not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch trade-in",
		})
	}

	// Hard delete
	err = h.db.TradeIn.DeleteOne(existingTradeIn).Exec(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete trade-in",
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}

// Appraise updates the appraisal values for a trade-in
func (h *TradeInsHandler) Appraise(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	tradeInID := c.Params("id")
	ctx := context.Background()

	// Parse request body
	var req struct {
		ActualCashValue int    `json:"actualCashValue"`
		Allowance       int    `json:"allowance"`
		Condition       string `json:"condition"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.ActualCashValue == 0 || req.Allowance == 0 || req.Condition == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "actualCashValue, allowance, and condition are required",
		})
	}

	// Verify trade-in exists and belongs to tenant
	existingTradeIn, err := h.db.TradeIn.
		Query().
		Where(
			tradein.And(
				tradein.TenantID(tenantID),
				tradein.ID(tradeInID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Trade-in not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch trade-in",
		})
	}

	// Update appraisal values and status
	updated, err := h.db.TradeIn.
		UpdateOne(existingTradeIn).
		SetActualCashValue(req.ActualCashValue).
		SetAllowance(req.Allowance).
		SetCondition(req.Condition).
		SetStatus("APPRAISED").
		Save(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to appraise trade-in",
		})
	}

	return c.JSON(fiber.Map{
		"data":    updated,
		"message": "Trade-in appraised successfully",
	})
}

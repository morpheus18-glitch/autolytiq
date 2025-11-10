package handlers

import (
	"context"
	"fmt"
	"time"

	"github.com/autolytiq/backend/ent"
	"github.com/autolytiq/backend/ent/vehicle"
	"github.com/autolytiq/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// VehiclesHandler handles vehicle-related requests
type VehiclesHandler struct {
	db *ent.Client
}

// NewVehiclesHandler creates a new vehicles handler
func NewVehiclesHandler(db *ent.Client) *VehiclesHandler {
	return &VehiclesHandler{db: db}
}

// List returns all vehicles for the tenant
func (h *VehiclesHandler) List(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Optional filtering
	status := c.Query("status") // AVAILABLE, SOLD, PENDING, etc.

	query := h.db.Vehicle.
		Query().
		Where(vehicle.TenantID(tenantID))

	if status != "" {
		query = query.Where(vehicle.Status(status))
	}

	vehicles, err := query.
		Order(ent.Desc(vehicle.FieldCreatedAt)).
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch vehicles",
		})
	}

	return c.JSON(fiber.Map{
		"data": vehicles,
		"meta": fiber.Map{
			"total": len(vehicles),
		},
	})
}

// Get returns a single vehicle by ID
func (h *VehiclesHandler) Get(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Params("id")
	ctx := context.Background()

	v, err := h.db.Vehicle.
		Query().
		Where(
			vehicle.And(
				vehicle.TenantID(tenantID),
				vehicle.ID(vehicleID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Vehicle not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch vehicle",
		})
	}

	return c.JSON(fiber.Map{
		"data": v,
	})
}

// GetByVIN returns a vehicle by VIN number
func (h *VehiclesHandler) GetByVIN(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	vin := c.Params("vin")
	ctx := context.Background()

	v, err := h.db.Vehicle.
		Query().
		Where(
			vehicle.And(
				vehicle.TenantID(tenantID),
				vehicle.Vin(vin),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Vehicle not found with VIN: " + vin,
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch vehicle",
		})
	}

	return c.JSON(fiber.Map{
		"data": v,
	})
}

// Search searches vehicles by make, model, year, or VIN
func (h *VehiclesHandler) Search(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Parse search parameters
	q := c.Query("q") // General search term
	make := c.Query("make")
	model := c.Query("model")
	year := c.Query("year")
	minPrice := c.Query("minPrice")
	maxPrice := c.Query("maxPrice")

	query := h.db.Vehicle.
		Query().
		Where(vehicle.TenantID(tenantID))

	// Apply filters
	if make != "" {
		query = query.Where(vehicle.MakeContains(make))
	}
	if model != "" {
		query = query.Where(vehicle.ModelContains(model))
	}
	if year != "" {
		query = query.Where(vehicle.Year(parseInt(year)))
	}
	if minPrice != "" {
		query = query.Where(vehicle.AskingPriceGTE(parseInt(minPrice)))
	}
	if maxPrice != "" {
		query = query.Where(vehicle.AskingPriceLTE(parseInt(maxPrice)))
	}

	// General search across VIN, make, model, stock number
	if q != "" {
		query = query.Where(
			vehicle.Or(
				vehicle.VinContains(q),
				vehicle.MakeContains(q),
				vehicle.ModelContains(q),
				vehicle.StockNumberContains(q),
			),
		)
	}

	vehicles, err := query.
		Order(ent.Desc(vehicle.FieldCreatedAt)).
		Limit(100). // Limit search results
		All(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to search vehicles",
		})
	}

	return c.JSON(fiber.Map{
		"data": vehicles,
		"meta": fiber.Map{
			"total": len(vehicles),
			"query": q,
		},
	})
}

// Create creates a new vehicle
func (h *VehiclesHandler) Create(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	ctx := context.Background()

	// Parse request body
	var req struct {
		VIN          string  `json:"vin"`
		StockNumber  *string `json:"stockNumber"`
		Year         int     `json:"year"`
		Make         string  `json:"make"`
		Model        string  `json:"model"`
		Trim         *string `json:"trim"`
		Mileage      int     `json:"mileage"`
		Status       *string `json:"status"`
		Cost         *int    `json:"cost"`
		MarketPrice  *int    `json:"marketPrice"`
		AskingPrice  *int    `json:"askingPrice"`
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

	// Check if VIN already exists for tenant
	exists, err := h.db.Vehicle.
		Query().
		Where(
			vehicle.And(
				vehicle.TenantID(tenantID),
				vehicle.Vin(req.VIN),
			),
		).
		Exist(ctx)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to check VIN uniqueness",
		})
	}

	if exists {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Vehicle with VIN " + req.VIN + " already exists",
		})
	}

	// Generate ID
	vehicleID := middleware.GenerateID()

	// Build create query
	createQuery := h.db.Vehicle.Create().
		SetID(vehicleID).
		SetTenantID(tenantID).
		SetVin(req.VIN).
		SetYear(req.Year).
		SetMake(req.Make).
		SetModel(req.Model).
		SetMileage(req.Mileage)

	// Set optional fields
	if req.StockNumber != nil {
		createQuery.SetNillableStockNumber(req.StockNumber)
	} else {
		// Auto-generate stock number if not provided
		stockNum := generateStockNumber(req.Year, req.Make)
		createQuery.SetStockNumber(stockNum)
	}

	if req.Trim != nil {
		createQuery.SetNillableTrim(req.Trim)
	}
	if req.Status != nil {
		createQuery.SetStatus(*req.Status)
	}
	if req.Cost != nil {
		createQuery.SetNillableCost(req.Cost)
	}
	if req.MarketPrice != nil {
		createQuery.SetNillableMarketPrice(req.MarketPrice)
	}
	if req.AskingPrice != nil {
		createQuery.SetNillableAskingPrice(req.AskingPrice)
	}

	// Execute create
	newVehicle, err := createQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create vehicle",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"data": newVehicle,
	})
}

// Update updates an existing vehicle
func (h *VehiclesHandler) Update(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Params("id")
	ctx := context.Background()

	// Parse request body
	var req map[string]interface{}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify vehicle exists and belongs to tenant
	existingVehicle, err := h.db.Vehicle.
		Query().
		Where(
			vehicle.And(
				vehicle.TenantID(tenantID),
				vehicle.ID(vehicleID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Vehicle not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch vehicle",
		})
	}

	// Build update query
	updateQuery := h.db.Vehicle.UpdateOne(existingVehicle)

	// Update fields dynamically
	if val, ok := req["status"].(string); ok {
		updateQuery.SetStatus(val)
	}
	if val, ok := req["mileage"].(float64); ok {
		updateQuery.SetMileage(int(val))
	}
	if val, ok := req["cost"].(float64); ok {
		updateQuery.SetCost(int(val))
	}
	if val, ok := req["marketPrice"].(float64); ok {
		updateQuery.SetMarketPrice(int(val))
	}
	if val, ok := req["askingPrice"].(float64); ok {
		updateQuery.SetAskingPrice(int(val))
	}
	if val, ok := req["trim"].(string); ok {
		updateQuery.SetTrim(val)
	}

	// Execute update
	updated, err := updateQuery.Save(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update vehicle",
		})
	}

	return c.JSON(fiber.Map{
		"data": updated,
	})
}

// Delete soft-deletes a vehicle (hard delete since no deleted_at in schema)
func (h *VehiclesHandler) Delete(c *fiber.Ctx) error {
	tenantID := middleware.GetTenantID(c)
	vehicleID := c.Params("id")
	ctx := context.Background()

	// Verify vehicle exists and belongs to tenant
	existingVehicle, err := h.db.Vehicle.
		Query().
		Where(
			vehicle.And(
				vehicle.TenantID(tenantID),
				vehicle.ID(vehicleID),
			),
		).
		Only(ctx)

	if err != nil {
		if ent.IsNotFound(err) {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Vehicle not found",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch vehicle",
		})
	}

	// Hard delete (no soft delete field in schema)
	err = h.db.Vehicle.DeleteOne(existingVehicle).Exec(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete vehicle",
		})
	}

	return c.Status(fiber.StatusNoContent).Send(nil)
}

// Helper functions

func parseInt(s string) int {
	var n int
	if _, err := fmt.Sscanf(s, "%d", &n); err == nil {
		return n
	}
	return 0
}

func generateStockNumber(year int, make string) string {
	// Generate stock number: MAKE-YEAR-TIMESTAMP
	// Example: TOYOTA-2024-1699564800
	timestamp := time.Now().Unix()
	return fmt.Sprintf("%s-%d-%d", make, year, timestamp)
}
